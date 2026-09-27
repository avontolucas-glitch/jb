/**
 * Quién hace el pedido, sin guardar datos personales.
 * Corre igual en el middleware (edge) y en el servidor (node): solo usa Web Crypto.
 *
 * De dónde sale la IP:
 *  - En Vercel (VERCEL=1) la plataforma pisa x-forwarded-for y pone x-real-ip con
 *    la IP real de quien se conecta: esos encabezados NO se pueden falsificar.
 *    Se usa x-real-ip y, si faltara, el PRIMER valor de x-forwarded-for.
 *  - Fuera de Vercel (next start local, Render, Railway, un VPS) no son confiables:
 *    `next start` deja tal cual el x-forwarded-for que manda el cliente y nunca pone
 *    x-real-ip. Se usa el ÚLTIMO valor de x-forwarded-for, que es el que agrega el
 *    proxy más cercano (nginx, el balanceador). Sin un proxy delante, cualquiera
 *    cambia ese valor en cada pedido: por eso los límites por IP solo piden
 *    verificación y el bloqueo duro queda para números altos, siempre combinado con
 *    límites por cuenta, por mail y globales.
 *  - No poner Cloudflare como proxy delante de Vercel: x-real-ip pasaría a ser la IP
 *    de Cloudflare y todo el mundo compartiría el mismo cupo (Turnstile no lo necesita).
 *  - Si no hay nada: "local".
 *
 * Redes móviles (CGNAT): mucha gente sale por la misma IP. En IPv6 cada cliente tiene
 * un /64 entero, así que para los límites se usa el prefijo /64 (ver prefijoIp).
 *
 * Nunca se guarda la IP en claro: huellaIp() da un HMAC corto con SESSION_SECRET.
 */

const enc = new TextEncoder();

/** Mismo respaldo que lib/session.ts: solo sirve para el prototipo. */
const SECRETO = process.env.SESSION_SECRET || "prototipo-julianbermudez-cambiar-en-produccion";

/** ¿Hay una llave propia de verdad (32 caracteres o más)? */
export const secretoPropio = (process.env.SESSION_SECRET ?? "").length >= 32;

/* ───────── Web Crypto: HMAC con una llave derivada para cada uso ───────── */

const g = globalThis as { __jbLlaves?: Map<string, Promise<CryptoKey>>; __jbAvisoPruebas?: boolean };
const llaves = (g.__jbLlaves ??= new Map());

export function hex(buf: ArrayBuffer | Uint8Array): string {
  const b = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < b.length; i++) s += b[i].toString(16).padStart(2, "0");
  return s;
}

function desdeHex(txt: string): Uint8Array<ArrayBuffer> | null {
  if (txt.length % 2 || !/^[0-9a-f]*$/i.test(txt)) return null;
  const out = new Uint8Array(new ArrayBuffer(txt.length / 2));
  for (let i = 0; i < out.length; i++) out[i] = parseInt(txt.slice(i * 2, i * 2 + 2), 16);
  return out;
}

/**
 * Una llave distinta para cada uso ("ip", "desafio", "mail"…), derivada de SESSION_SECRET
 * con HMAC(SECRETO, "jb-uso:" + uso): una firma de un uso no sirve para otro.
 */
function llave(uso: string): Promise<CryptoKey> {
  let k = llaves.get(uso);
  if (!k) {
    k = (async () => {
      const base = await crypto.subtle.importKey("raw", enc.encode(SECRETO), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
      const derivada = await crypto.subtle.sign("HMAC", base, enc.encode(`jb-uso:${uso}`));
      return crypto.subtle.importKey("raw", derivada, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
    })();
    llaves.set(uso, k);
  }
  return k;
}

/** HMAC-SHA256 en hexadecimal (64 caracteres). */
export async function hmacHex(uso: string, texto: string): Promise<string> {
  return hex(await crypto.subtle.sign("HMAC", await llave(uso), enc.encode(texto)));
}

/** Verifica un HMAC en hexadecimal en tiempo constante (crypto.subtle.verify). */
export async function hmacVerificar(uso: string, texto: string, firmaHex: string): Promise<boolean> {
  const firma = desdeHex(firmaHex);
  if (!firma || firma.length !== 32) return false;
  return crypto.subtle.verify("HMAC", await llave(uso), firma, enc.encode(texto));
}

/** SHA-256 en hexadecimal. */
export async function sha256Hex(texto: string): Promise<string> {
  return hex(await crypto.subtle.digest("SHA-256", enc.encode(texto)));
}

/** Huella corta (16 hex, 64 bits) de un dato: sirve de clave sin guardar el dato en claro. */
export async function huella(texto: string, uso = "huella"): Promise<string> {
  return (await hmacHex(uso, texto)).slice(0, 16);
}

/* ───────── IP ───────── */

/** Saca "::ffff:", corchetes y puerto; devuelve null si no parece una IP. */
export function normalizarIp(v: string | null | undefined): string | null {
  let s = (v ?? "").trim().toLowerCase();
  if (!s) return null;
  const conCorchetes = /^\[([^\]]+)\](?::\d+)?$/.exec(s); // [2001:db8::1]:443
  if (conCorchetes) s = conCorchetes[1];
  else if (/^\d{1,3}(\.\d{1,3}){3}:\d+$/.test(s)) s = s.replace(/:\d+$/, ""); // 1.2.3.4:5678
  if (s.startsWith("::ffff:") && s.includes(".")) s = s.slice(7);
  s = s.replace(/%.*$/, ""); // zona de IPv6 (fe80::1%eth0)
  if (s.length > 45 || !/^[0-9a-f:.]+$/.test(s) || !/[.:]/.test(s)) return null;
  return s;
}

/** La IP de quien hace el pedido (ver arriba cuándo es confiable). Respaldo: "local". */
export function ip(h: Headers): string {
  const xff = (h.get("x-forwarded-for") ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  const real = h.get("x-real-ip");
  const v = process.env.VERCEL ? normalizarIp(real) ?? normalizarIp(xff[0]) : normalizarIp(xff[xff.length - 1]) ?? normalizarIp(real);
  return v ?? "local";
}

/** Para los límites: IPv4 entera; IPv6 recortada a su /64 (cada cliente tiene millones). */
export function prefijoIp(v: string): string {
  if (!v.includes(":") || v.includes(".")) return v;
  const [izq, der = ""] = v.split("::");
  const a = izq ? izq.split(":") : [];
  const b = v.includes("::") && der ? der.split(":") : [];
  const grupos = v.includes("::") ? [...a, ...Array(Math.max(0, 8 - a.length - b.length)).fill("0"), ...b] : a;
  return `${grupos
    .slice(0, 4)
    .map((x) => (x || "0").replace(/^0+(?=.)/, ""))
    .join(":")}::/64`;
}

/** Huella de la IP (o de su /64) para usar como clave de límites y en el registro. */
export async function huellaIp(h: Headers): Promise<string> {
  return huella(prefijoIp(ip(h)), "ip");
}

/* ───────── Modo pruebas ───────── */

/**
 * Solo con JB_PRUEBAS=1 y fuera de Vercel (Playwright corre con next start local,
 * donde VERCEL no existe). En el sitio publicado nunca, aunque alguien la cargue.
 */
export function modoPruebas(): boolean {
  if (process.env.JB_PRUEBAS !== "1") return false;
  if (process.env.VERCEL) {
    if (!g.__jbAvisoPruebas) {
      g.__jbAvisoPruebas = true;
      console.error("JB_PRUEBAS está cargada en Vercel: se ignora. Sacala de las variables del proyecto.");
    }
    return false;
  }
  return true;
}

/**
 * En modo pruebas, el encabezado «x-jb-prueba» se suma a la clave de los límites para
 * que cada prueba tenga su propio cupo. En producción se ignora (devuelve null).
 */
export function clavePrueba(h: Headers): string | null {
  if (!modoPruebas()) return null;
  const v = (h.get("x-jb-prueba") ?? "").replace(/[^\w.-]/g, "").slice(0, 120);
  return v || null;
}
