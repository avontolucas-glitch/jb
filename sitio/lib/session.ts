/**
 * Sesión en cookie httpOnly firmada (HMAC-SHA256).
 * Usa Web Crypto, así funciona tanto en el middleware (edge) como en el servidor (node).
 *
 * - En producción la cookie se llama «__Host-jb_sesion»: el navegador solo la acepta
 *   con Secure, path=/ y sin Domain, así un subdominio no la puede pisar ni leer.
 * - Dura 7 días y se renueva sola al usarla cuando le quedan menos de 3 (renovación
 *   deslizante), con un tope absoluto de 30 días desde que se ingresó: después hay
 *   que volver a ingresar.
 * - Lleva «sv» (versión de sesión): si la cuenta sube su versión («Cerrar sesión en
 *   todos los dispositivos»), todas las cookies anteriores dejan de valer. El
 *   middleware no puede leer los datos de las cuentas, así que solo mira la firma y el
 *   vencimiento; la versión la verifica usuarioActual() en lib/auth.ts.
 * - Sin SESSION_SECRET se usa el secreto de respaldo del prototipo, que es público (está
 *   en el repositorio): el sitio sigue andando (cuentas demo, crear cuenta, checkout),
 *   pero en producción queda escrito en la consola y en el registro de seguridad, y lo
 *   sensible se cierra: la cuenta privada de Julián no entra (lib/auth.ts), porque con
 *   un secreto público cualquiera podría firmar una cookie a su nombre.
 *   Para el sitio real, SESSION_SECRET es obligatoria (32 caracteres o más).
 *
 * PRODUCCIÓN: reemplazar por el proveedor de login real (ver lib/auth.ts).
 */
import { modoPruebas } from "./cliente";

/**
 * ¿Es el sitio publicado? `next start` corre con NODE_ENV=production también en las
 * pruebas (Playwright, con JB_PRUEBAS=1 y fuera de Vercel): ahí se usan las reglas
 * del prototipo, que funcionan sin variables de entorno.
 */
export const PRODUCCION = process.env.NODE_ENV === "production" && !modoPruebas();

export const COOKIE_SESION = PRODUCCION ? "__Host-jb_sesion" : "jb_sesion";
export const DURACION_SEGUNDOS = 60 * 60 * 24 * 7; // 7 días
/** Si a la sesión le quedan menos de 3 días, al usarla se renueva por 7 más. */
export const RENOVAR_SI_FALTAN_SEGUNDOS = 60 * 60 * 24 * 3;
/** Tope absoluto desde el ingreso, por más que se renueve. */
export const MAXIMA_SEGUNDOS = 60 * 60 * 24 * 30;

const RESPALDO = "prototipo-julianbermudez-cambiar-en-produccion";
const PROPIO = process.env.SESSION_SECRET ?? "";

/** Sin SESSION_SECRET, el respaldo (también en producción: ver arriba qué se cierra). */
const SECRETO: string | null = PROPIO || RESPALDO;

/**
 * ¿El sitio publicado está firmando con el secreto de respaldo (público)? Mientras sea
 * así, lib/auth.ts no deja entrar a la cuenta privada de Julián.
 */
export const usaRespaldo = PRODUCCION && !PROPIO;

const g = globalThis as { __jbAvisoSecreto?: boolean };
function avisarSecreto() {
  if (g.__jbAvisoSecreto) return;
  g.__jbAvisoSecreto = true;
  if (usaRespaldo) {
    console.error(
      "SEGURIDAD: falta SESSION_SECRET en producción. Se usa el secreto de respaldo del prototipo (público) y la cuenta de Julián no entra hasta cargarla (una frase larga, de 32 caracteres o más) en las variables del proyecto.",
    );
  } else if (PRODUCCION && PROPIO.length < 32) {
    console.warn("SEGURIDAD: SESSION_SECRET es corta. Conviene una de 32 caracteres o más.");
  }
}

/** ¿Se pueden abrir y leer sesiones? Siempre (sin SESSION_SECRET, con el respaldo); avisa una vez si falta. */
export function sesionesDisponibles(): boolean {
  avisarSecreto();
  return SECRETO !== null;
}

export class SinSesiones extends Error {
  constructor() {
    super("No se pueden abrir sesiones: falta SESSION_SECRET.");
    this.name = "SinSesiones";
  }
}

/** Lo que va dentro de la cookie. `sv` e `ini` faltan en las cookies viejas (valen 0 y exp). */
export type Sesion = {
  uid: string;
  /** Vencimiento, en ms. */
  exp: number;
  /** Versión de sesión de la cuenta al ingresar. */
  sv?: number;
  /** Cuándo se ingresó, en ms (para el tope absoluto). */
  ini?: number;
};

const enc = new TextEncoder();

function b64url(bytes: Uint8Array): string {
  let s = "";
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function desdeB64url(txt: string): Uint8Array<ArrayBuffer> {
  const b = atob(txt.replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(new ArrayBuffer(b.length));
  for (let i = 0; i < b.length; i++) out[i] = b.charCodeAt(i);
  return out;
}

let llave: Promise<CryptoKey> | null = null;

/** Llave propia de las sesiones, derivada del secreto (no sirve para otros usos). */
function clave(): Promise<CryptoKey> {
  if (!SECRETO) return Promise.reject(new SinSesiones());
  llave ??= (async () => {
    const base = await crypto.subtle.importKey("raw", enc.encode(SECRETO), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const derivada = await crypto.subtle.sign("HMAC", base, enc.encode("jb-sesion:v2"));
    return crypto.subtle.importKey("raw", derivada, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
  })();
  return llave;
}

/** Firma una sesión. Lanza SinSesiones si no hay secreto (producción sin SESSION_SECRET). */
export async function firmar(s: Sesion): Promise<string> {
  if (!sesionesDisponibles()) throw new SinSesiones();
  const cuerpo = b64url(enc.encode(JSON.stringify(s)));
  const firma = new Uint8Array(await crypto.subtle.sign("HMAC", await clave(), enc.encode(cuerpo)));
  return `${cuerpo}.${b64url(firma)}`;
}

/**
 * Verifica la firma (en tiempo constante, con crypto.subtle.verify), el vencimiento y
 * el tope absoluto. No mira la versión de sesión: eso lo hace usuarioActual().
 */
export async function verificar(token: string | undefined): Promise<Sesion | null> {
  if (!token || token.length > 1024 || !sesionesDisponibles()) return null;
  const partes = token.split(".");
  if (partes.length !== 2) return null;
  const [cuerpo, firma] = partes;
  try {
    const ok = await crypto.subtle.verify("HMAC", await clave(), desdeB64url(firma), enc.encode(cuerpo));
    if (!ok) return null;
    const s = JSON.parse(new TextDecoder().decode(desdeB64url(cuerpo))) as Sesion;
    const ahora = Date.now();
    if (!s || typeof s.uid !== "string" || !s.uid || typeof s.exp !== "number" || s.exp < ahora) return null;
    if (s.sv !== undefined && !Number.isSafeInteger(s.sv)) return null;
    if (s.ini !== undefined && (typeof s.ini !== "number" || s.ini + MAXIMA_SEGUNDOS * 1000 < ahora)) return null;
    return s;
  } catch {
    return null;
  }
}

/** Una sesión nueva para la cuenta `uid` con su versión actual. */
export function nuevaSesion(uid: string, sv = 0): Sesion {
  const ahora = Date.now();
  return { uid, sv, ini: ahora, exp: ahora + DURACION_SEGUNDOS * 1000 };
}

/**
 * Si a la sesión le quedan menos de 3 días, la misma sesión con 7 días más (sin pasar
 * el tope absoluto). Si no hace falta renovarla, null.
 * Sirve en el middleware y en el servidor:
 *   const nueva = renovar(s);
 *   if (nueva) res.cookies.set(COOKIE_SESION, await firmar(nueva), opcionesCookie(nueva));
 */
export function renovar(s: Sesion): Sesion | null {
  const ahora = Date.now();
  if (s.exp - ahora >= RENOVAR_SI_FALTAN_SEGUNDOS * 1000) return null;
  const ini = s.ini ?? ahora;
  const exp = Math.min(ahora + DURACION_SEGUNDOS * 1000, ini + MAXIMA_SEGUNDOS * 1000);
  if (exp <= s.exp) return null;
  return { ...s, ini, exp };
}

/** Opciones de la cookie de sesión (las exige el prefijo __Host-: Secure, path=/, sin Domain). */
export function opcionesCookie(s?: Sesion) {
  const maxAge = s ? Math.max(1, Math.floor((s.exp - Date.now()) / 1000)) : DURACION_SEGUNDOS;
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

/**
 * Para borrar la cookie: con el prefijo __Host- el navegador ignora un Set-Cookie sin
 * Secure y path=/, así que `cookies.delete(nombre)` a secas no alcanza.
 *   res.cookies.set(COOKIE_SESION, "", opcionesBorrar());
 */
export function opcionesBorrar() {
  return { ...opcionesCookie(), maxAge: 0, expires: new Date(0) };
}
