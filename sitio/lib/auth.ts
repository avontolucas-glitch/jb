/**
 * Login simulado con forma real.
 * - Usuarios en data/usuarios.json con clave cifrada (PBKDF2-SHA256, 600.000 vueltas),
 *   nunca en texto plano. Las claves viejas (120.000) se vuelven a cifrar solas al ingresar bien.
 * - La sesión vive en una cookie httpOnly firmada (lib/session.ts), con versión de
 *   sesión para poder cerrarla en todos los dispositivos.
 * - Fuerza bruta: límites por mail+cliente, por cliente, por mail y globales
 *   (lib/limite.ts); desde el 3.er fallo se pide verificación (lib/desafio.ts) y desde
 *   el 10.º se bloquea 15 minutos. Todo queda en lib/registro-seguridad.ts.
 * - Cuenta de Julián (ADMIN_EMAIL): con ADMIN_TOTP_SECRET, después de la clave pide
 *   el código de 6 dígitos de su app de autenticación (lib/totp.ts).
 *
 * PRODUCCIÓN: este archivo es el único que hay que cambiar para usar un
 * proveedor real (por ejemplo Auth.js, Clerk o Supabase Auth). Mantener las
 * mismas funciones: usuarioActual, ingresar, crearCuenta, cerrarSesion.
 */
import { cookies, headers } from "next/headers";
import { leer, leerSemilla, modificar } from "./db";
import {
  COOKIE_SESION,
  PRODUCCION,
  SinSesiones,
  firmar,
  nuevaSesion,
  opcionesBorrar,
  opcionesCookie,
  renovar,
  sesionesDisponibles,
  usaRespaldo,
  verificar,
} from "./session";
import { hmacHex, hmacVerificar, huellaIp, respaldoPublicoEnUso } from "./cliente";
import { bloquear, bloqueadoPor, contar, exito, fallo, limpiar, mirar, revisar, sujetosDe, unaVez, TEXTOS, type Funcion, type Sujetos } from "./limite";
import { verificarDesafio, CAMPO_DESAFIO } from "./desafio";
import { registrar } from "./registro-seguridad";
import { secretoValido, verificarTotp, normalizarCodigo } from "./totp";
import { mail as mailNormal, TOPES } from "./validar";

export type Usuario = {
  id: string;
  nombre: string;
  email: string;
  sal: string;
  hash: string;
  /** Vueltas de PBKDF2 con que se cifró la clave (sin el dato: 120.000, las cuentas viejas). */
  iter?: number;
  /** Versión de sesión: al subirla, se cierran todas las sesiones abiertas de la cuenta. */
  sv?: number;
  creado: string;
  demo?: boolean;
  /** Cuenta de Julián: administra la agenda de la Masterclass 1 a 1. */
  admin?: boolean;
};

/** Resultado de ingresar(): `verificar` pide la casilla «Confirmá que sos una persona»; `totp`, el código de la app. */
export type ResultadoIngreso = { ok: true } | { ok: false; error: string; verificar?: boolean; totp?: boolean };

let avisoAdminDemo = false;
/**
 * ¿Se puede entrar como Julián con la cuenta demo (julian@demo.com, con la clave a la vista)?
 * Solo si se enciende a propósito con JB_ADMIN_DEMO=1 (las pruebas, una demo local) y
 * nunca en el sitio publicado en producción, aunque alguien la cargue en Vercel: ahí la
 * cuenta de Julián es la de ADMIN_EMAIL y ADMIN_CLAVE.
 */
export const adminDemoActivo = (): boolean => {
  if (process.env.JB_ADMIN_DEMO !== "1") return false;
  if (process.env.VERCEL_ENV === "production") {
    if (!avisoAdminDemo) {
      avisoAdminDemo = true;
      console.error("JB_ADMIN_DEMO está cargada en producción: se ignora. Sacala de las variables del proyecto.");
    }
    return false;
  }
  return true;
};

/**
 * Solo una cuenta marcada como admin por el servidor (nunca algo que mande el navegador):
 * la de ADMIN_EMAIL, o la demo de data/usuarios.json si JB_ADMIN_DEMO=1. La privada no
 * vale mientras se firme con el secreto de respaldo (público).
 */
export const esAdmin = (u: Usuario | null | undefined): boolean =>
  u?.admin === true && (!u.demo || adminDemoActivo()) && !(u.id === ID_ADMIN && usaRespaldo);

/* ───────── Claves ───────── */

/** Vueltas de PBKDF2 para las claves nuevas (lo que recomienda OWASP para SHA-256). */
export const ITERACIONES = 600_000;
/** Las de las cuentas creadas antes (y las demo de la semilla). */
const ITERACIONES_VIEJAS = 120_000;

const enc = new TextEncoder();

/*
 * Tope de PBKDF2 a la vez, por instancia: cada uno son ~150-300 ms de CPU. Si hay 4
 * corriendo, los siguientes esperan en una cola corta (hasta 16, como mucho 2 s); si no
 * hay lugar, se responde «muchos intentos» sin calcular nada y sin contarlo como fallo.
 */
const PBKDF2_A_LA_VEZ = 4;
const PBKDF2_COLA = 16;
const PBKDF2_ESPERA_MS = 2000;
let pbkdf2EnCurso = 0;
const pbkdf2Cola: (() => void)[] = [];

/** Corre `fn` con un lugar del semáforo de PBKDF2, o devuelve null si está lleno. */
async function conCupoPbkdf2<T>(fn: () => Promise<T>): Promise<T | null> {
  if (pbkdf2EnCurso < PBKDF2_A_LA_VEZ) pbkdf2EnCurso++;
  else {
    if (pbkdf2Cola.length >= PBKDF2_COLA) return null;
    const entro = await new Promise<boolean>((listo) => {
      const turno = () => {
        clearTimeout(plazo);
        listo(true);
      };
      const plazo = setTimeout(() => {
        const i = pbkdf2Cola.indexOf(turno);
        if (i >= 0) pbkdf2Cola.splice(i, 1);
        listo(false);
      }, PBKDF2_ESPERA_MS);
      pbkdf2Cola.push(turno);
    });
    if (!entro) return null; // (el lugar lo pasa quien termina: acá no se suma)
  }
  try {
    return await fn();
  } finally {
    const siguiente = pbkdf2Cola.shift();
    if (siguiente) siguiente(); // el lugar pasa directo al que esperaba
    else pbkdf2EnCurso--;
  }
}

export async function hashClave(clave: string, sal: string, iteraciones = ITERACIONES): Promise<string> {
  const base = await crypto.subtle.importKey("raw", enc.encode(clave), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: enc.encode(sal), iterations: iteraciones }, base, 256);
  return Buffer.from(bits).toString("hex");
}

/** Compara dos textos sin cortar en la primera diferencia (el tiempo no delata cuánto coincidió). */
function igualesTiempoConstante(a: string, b: string): boolean {
  const largo = Math.max(a.length, b.length);
  let d = a.length ^ b.length;
  for (let i = 0; i < largo; i++) d |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return d === 0;
}

/**
 * ¿La clave es la de la cuenta? Sin cuenta, igual corre un PBKDF2 con una sal de
 * relleno: así el tiempo de respuesta no dice si el mail existe.
 * null: el servidor está saturado (semáforo lleno) y no se calculó nada.
 */
async function claveCorrecta(u: Usuario | null, clave: string): Promise<boolean | null> {
  return conCupoPbkdf2(async () => {
    if (!u) {
      await hashClave(clave, "sin-cuenta-relleno");
      return false;
    }
    return igualesTiempoConstante(await hashClave(clave, u.sal, u.iter ?? ITERACIONES_VIEJAS), u.hash);
  });
}

/**
 * Las claves más usadas (listas públicas de filtraciones, más las más comunes en
 * español). Se comparan en minúsculas y también sin los números y signos del final
 * («contraseña2024!» cuenta como «contraseña»).
 */
const CLAVES_COMUNES = new Set(
  `123456 123456789 12345678 password qwerty123 qwerty 111111 12345 1234567 123123 1234567890 000000 abc123 password1 iloveyou
  1q2w3e4r 1q2w3e4r5t 1q2w3e 123321 654321 666666 121212 7777777 987654321 112233 159753 147258369 123654 555555 88888888
  qwertyuiop qwerty1 asdfghjkl asdfgh asdf1234 zxcvbnm zxcvbnm123 1qaz2wsx 1qaz2wsx3edc qazwsx qazwsxedc passw0rd p@ssw0rd
  p@ssword password123 password12 password1234 admin admin123 administrator root toor letmein welcome welcome1 welcome123
  monkey dragon master sunshine princess football baseball soccer superman batman trustno1 shadow michael jennifer jordan23
  hello hello123 freedom whatever starwars pokemon charlie donald loveme lovely hunter2 access secret secret123 changeme
  mustang ninja azerty solo killer ginger cheese computer internet samsung google apple chocolate flower tigger buster
  q1w2e3r4 q1w2e3r4t5 a1b2c3d4 aa123456 abcd1234 abc12345 abcdef abcdefg abcdefgh 1234abcd 12qwaszx 123qwe 123qweasd
  123abc qwe123 zaq12wsx asdasd asdqwe123 11111111 22222222 00000000 12341234 11223344 99999999 123123123 1111111111
  0123456789 9876543210 1234554321 12344321 147258 159357 741852963 102030 10203040 5201314 aaaaaa aaaaaaaa
  contraseña contrasena contraseña1 contrasena1 contraseña123 contrasena123 micontraseña micontrasena clave clave123
  miclave miclave123 claveclave hola hola123 hola1234 holahola holamundo teamo teamo123 teamomucho tequiero amor amor123
  amormio miamor corazon corazon123 princesa princesa123 mariposa estrella angel angelito angel123 bonita hermosa
  dios diosesamor jesus jesus123 jesucristo cristo fe felicidad libertad argentina argentina123 boca river bocajuniors
  riverplate racing independiente sanlorenzo messi messi10 maradona diego10 futbol futbol123 buenosaires mendoza cordoba
  rosario mexico colombia espana españa chile uruguay peru venezuela barcelona realmadrid madrid juan juan123 maria
  maria123 carlos lucas martin sofia valentina camila mateo santiago julian julianbermudez bermudez manifestacion
  manifestar yosoy yosoyelqueyosoy universo abundancia gratitud gracias bendiciones bendecido pensamiento verbo
  qwertyqwerty asdfasdf zxczxc iloveyou1 football1 baseball1 superman1 michael1 sunshine1 princess1 dragon123 monkey123
  master123 login login123 user user123 usuario usuario123 test test123 prueba prueba123 demo demo1234 guest invitado
  default pass pass123 pass1234 123456a 123456789a a123456 a12345678 qwerty12 qwerty1234`
    .split(/\s+/)
    .filter(Boolean),
);

/** Sin los números y signos del final: «Contraseña2024!» → «contraseña». */
const raiz = (c: string) => c.toLowerCase().replace(/[^\p{L}]+$/u, "");

/**
 * Política de claves para cuentas nuevas: al menos 10 caracteres, que no sea una de
 * las más usadas, que no sea el mail y que no sea un mismo carácter o dos repetidos.
 * Devuelve el aviso para mostrar, o null si está bien.
 */
export function problemaDeClave(clave: string, email = ""): string | null {
  if (clave.length < 10) return "La clave tiene que tener al menos 10 caracteres.";
  if (clave.length > TOPES.clave) return "La clave es demasiado larga.";
  const c = clave.toLowerCase();
  const m = email.trim().toLowerCase();
  const usuario = m.split("@")[0] ?? "";
  if (m && (c === m || c.includes(m) || (usuario.length >= 4 && raiz(c) === raiz(usuario)) || c === usuario)) {
    return "La clave no puede ser tu mail. Elegí otra.";
  }
  const r = raiz(clave);
  const sinSignos = c.replace(/[^\p{L}\p{N}]+$/u, "");
  if (CLAVES_COMUNES.has(c) || CLAVES_COMUNES.has(r) || CLAVES_COMUNES.has(sinSignos)) {
    return "Esa clave es de las más usadas y es fácil de adivinar. Elegí otra.";
  }
  if (new Set(c).size <= 2) return "Esa clave es fácil de adivinar. Elegí otra.";
  return null;
}

/* ───────── Cuentas ───────── */

const ID_ADMIN = "admin-julian";
let cuentaAdmin: { clave: string; usuario: Promise<Usuario> } | null = null;

/** El mail de ADMIN_EMAIL, aunque la cuenta no esté activa (nadie más lo puede usar). */
const mailAdminConfigurado = () => (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();

let avisoClaveAdmin = "";
/**
 * ¿Por qué la cuenta privada de Julián no está activa? null si está bien. Falla cerrada:
 * con una ADMIN_CLAVE que no cumple la política de claves (la misma de las cuentas
 * nuevas), o mientras falte SESSION_SECRET en producción, la cuenta no entra.
 */
export function problemaCuentaAdmin(): string | null {
  const email = mailAdminConfigurado();
  const clave = process.env.ADMIN_CLAVE ?? "";
  if (!email || !clave) return null;
  const problema = usaRespaldo
    ? "falta SESSION_SECRET"
    : problemaDeClave(clave, email) ?? null;
  if (problema && avisoClaveAdmin !== problema) {
    avisoClaveAdmin = problema;
    console.error(
      usaRespaldo
        ? "SEGURIDAD: falta SESSION_SECRET. La cuenta de Julián no entra hasta cargarla."
        : `SEGURIDAD: ADMIN_CLAVE no cumple la política (${problema}) La cuenta de Julián no entra hasta cambiarla.`,
    );
  }
  return problema;
}

/**
 * La cuenta de Julián para el sitio publicado: mail y clave en variables de
 * entorno (ADMIN_EMAIL y ADMIN_CLAVE, con la política de claves: 10 caracteres o más,
 * ni común ni el mail), nunca a la vista en el sitio ni en el repositorio.
 */
function cuentaAdminPrivada(): Promise<Usuario> | null {
  const email = mailAdminConfigurado();
  const clave = process.env.ADMIN_CLAVE ?? "";
  if (!email || !clave || problemaCuentaAdmin()) return null;
  const firma = `${email}\n${clave}`;
  if (cuentaAdmin?.clave !== firma) {
    const sal = `admin-${email}`;
    cuentaAdmin = {
      clave: firma,
      usuario: hashClave(clave, sal, ITERACIONES).then((hash) => ({
        id: ID_ADMIN,
        nombre: (process.env.ADMIN_NOMBRE ?? "").trim() || "Julián",
        email,
        sal,
        hash,
        iter: ITERACIONES,
        creado: "2026-09-01T00:00:00.000Z",
        admin: true,
      })),
    };
  }
  return cuentaAdmin.usuario;
}

function normalizar(email: string) {
  return email.trim().toLowerCase();
}

/**
 * Las cuentas guardadas más las cuentas demo de la semilla que falten (así una
 * cuenta demo nueva, como la de Julián, aparece aunque ya haya datos guardados).
 * La cuenta privada de Julián no se guarda: solo su versión de sesión, en un registro
 * aparte con id «admin-julian» que nunca aparece como cuenta.
 */
export async function usuarios(): Promise<Usuario[]> {
  const todos = await leer<Usuario[]>("usuarios");
  const svAdmin = todos.find((g) => g.id === ID_ADMIN)?.sv ?? 0;
  const guardados = todos.filter((g) => g.id !== ID_ADMIN);
  const demos = (await leerSemilla<Usuario[]>("usuarios", [])).filter((d) => d.demo && !guardados.some((g) => g.id === d.id));
  const admin = await cuentaAdminPrivada();
  // la cuenta privada de Julián va primero: su mail no lo puede usar otra cuenta
  return admin
    ? [{ ...admin, sv: svAdmin }, ...guardados.filter((g) => g.email !== admin.email), ...demos]
    : [...guardados, ...demos];
}

export async function buscarPorEmail(email: string) {
  return (await usuarios()).find((u) => u.email === normalizar(email)) ?? null;
}

/**
 * Cambia una cuenta guardada (o la copia de la semilla, si es una demo que todavía no
 * estaba en los datos). Para la cuenta privada de Julián solo guarda la versión de sesión.
 */
async function actualizarCuenta(u: Usuario, cambio: Partial<Pick<Usuario, "hash" | "iter" | "sv">>): Promise<void> {
  await modificar<Usuario[], void>("usuarios", (lista) => {
    const todos = Array.isArray(lista) ? lista : [];
    const i = todos.findIndex((x) => x.id === u.id);
    if (u.id === ID_ADMIN) {
      const registro: Usuario = { id: ID_ADMIN, nombre: "", email: "", sal: "", hash: "", creado: u.creado, sv: cambio.sv ?? u.sv ?? 0 };
      if (i >= 0) todos[i] = { ...todos[i], sv: registro.sv };
      else todos.push(registro);
    } else if (i >= 0) {
      todos[i] = { ...todos[i], ...cambio };
    } else {
      todos.push({ ...u, ...cambio });
    }
    return { datos: todos, resultado: undefined };
  });
}

/* ───────── Sesión ───────── */

let alertaSinSecreto = false;
/**
 * Deja constancia (una vez por proceso) en el registro de seguridad de que en producción
 * falta SESSION_SECRET y se firma con el respaldo público.
 */
async function avisarSinSesiones(h?: Headers) {
  if (alertaSinSecreto || !(usaRespaldo || respaldoPublicoEnUso())) return;
  alertaSinSecreto = true;
  await registrar("alerta", { motivo: "falta SESSION_SECRET: se usa el respaldo público y la cuenta de Julián no entra" }, h);
}

async function abrirSesion(u: Usuario) {
  const s = nuevaSesion(u.id, u.sv ?? 0);
  (await cookies()).set(COOKIE_SESION, await firmar(s), opcionesCookie(s));
}

/** Intenta cambiar una cookie: en una página (componente de servidor) no se puede, y no pasa nada. */
async function intentarCookie(fn: (c: Awaited<ReturnType<typeof cookies>>) => void) {
  try {
    fn(await cookies());
  } catch {
    /* solo se puede en acciones y rutas */
  }
}

export async function cerrarSesion() {
  const c = await cookies();
  c.set(COOKIE_SESION, "", opcionesBorrar());
  c.set(COOKIE_PASO, "", opcionesBorrar());
}

/**
 * «Cerrar sesión en todos los dispositivos»: sube la versión de sesión de la cuenta
 * (las cookies viejas dejan de valer en usuarioActual()) y cierra esta.
 */
export async function cerrarSesionEnTodos(): Promise<boolean> {
  const u = await usuarioActual();
  if (!u) return false;
  // Las cuentas demo las comparte todo el que prueba el prototipo: ahí solo se cierra
  // esta sesión (si no, cualquiera podría sacar a todos los demás).
  if (!u.demo) await actualizarCuenta(u, { sv: (u.sv ?? 0) + 1 });
  await cerrarSesion();
  if (esAdmin(u)) await registrar("admin_accion", { accion: "cerrar_sesiones", cuenta: u.id }, await headers());
  return true;
}

/**
 * La cuenta con sesión, o null. Verifica firma, vencimiento y versión de sesión, y
 * renueva la cookie si le quedan menos de 3 días (solo donde se puede escribir cookies:
 * acciones y rutas; el middleware también la renueva al entrar a /mi-espacio).
 */
export async function usuarioActual(): Promise<Usuario | null> {
  if (!sesionesDisponibles()) return null;
  await avisarSinSesiones();
  const s = await verificar((await cookies()).get(COOKIE_SESION)?.value);
  if (!s) return null;
  // con el secreto de respaldo (público) cualquiera podría firmar una cookie a nombre de Julián
  if (s.uid === ID_ADMIN && usaRespaldo) return null;
  const u = (await usuarios()).find((x) => x.id === s.uid) ?? null;
  if (!u || (u.sv ?? 0) !== (s.sv ?? 0)) {
    // cuenta borrada o sesión cerrada desde otro dispositivo
    await intentarCookie((c) => c.set(COOKIE_SESION, "", opcionesBorrar()));
    return null;
  }
  const nueva = renovar(s);
  if (nueva) {
    const token = await firmar(nueva);
    await intentarCookie((c) => c.set(COOKIE_SESION, token, opcionesCookie(nueva)));
  }
  return u;
}

/* ───────── Fuerza bruta ───────── */

const MIN = 60;
/** Mail+cliente: desde el 3.er fallo en 15 minutos se pide verificación… */
const MC_VENTANA = 15 * MIN;
const MC_VERIFICAR = 3;
/** …y al 10.º se bloquea 15 minutos (solo a ese cliente con ese mail: nunca al mail entero). */
const MC_BLOQUEO = 10;
const MC_BLOQUEO_SEG = 15 * MIN;

const VERIFICAR = "Confirmá que sos una persona para seguir.";
const NO_COINCIDEN = "El mail o la clave no coinciden.";
const BLOQUEADO = "Hubo muchos intentos seguidos. Por seguridad, esperá unos minutos y probá de nuevo.";
const NO_DISPONIBLE = "Ahora no se puede ingresar. Probá de nuevo en un rato.";

type Puerta = {
  funciones: Funcion[];
  s: Sujetos;
  mc: string;
  h: Headers;
  /** La tabla de límites ya pedía verificación en este intento. */
  verificaba: boolean;
  /** En este intento se resolvió la verificación (así el paso del código no la vuelve a pedir). */
  verifico: boolean;
};

const claveMc = (s: Sujetos) => `login-mc:${s.mail ?? "-"}:${s.ip ?? "-"}${s.prueba ? `~${s.prueba}` : ""}`;

/**
 * Lo que se mira antes del trabajo caro (PBKDF2 o TOTP): bloqueos, límites y, si
 * hace falta, la verificación. Devuelve el error para responder o la puerta abierta.
 */
async function abrirPuerta(
  email: string,
  esMailAdmin: boolean,
  desafio: string | null,
  h: Headers,
  o: { yaVerifico?: boolean } = {},
): Promise<{ ok: false; r: ResultadoIngreso } | { ok: true; p: Puerta }> {
  const funciones: Funcion[] = esMailAdmin ? ["login", "loginAdmin"] : ["login"];
  const s = await sujetosDe(h, { mail: email });
  const mc = claveMc(s);
  const nombre = funciones.join("+");

  const espera = await bloqueadoPor(mc);
  if (espera > 0) {
    await registrar("bloqueo", { funcion: nombre, regla: "login:mail+ip", reintentoSeg: espera }, h);
    return { ok: false, r: { ok: false, error: BLOQUEADO } };
  }
  const v = await revisar(funciones, s);
  if (!v.permitido) {
    await registrar(v.motivo === "bloqueo" ? "bloqueo" : "limite", { funcion: nombre, regla: v.regla ?? null, reintentoSeg: v.reintentoSeg }, h);
    return { ok: false, r: { ok: false, error: v.motivo === "bloqueo" ? BLOQUEADO : (v.mensaje ?? TEXTOS.muchos) } };
  }
  const fallosMc = await mirar(mc, { ventanaSeg: MC_VENTANA });
  let verifico = false;
  if ((v.verificar || fallosMc >= MC_VERIFICAR) && !o.yaVerifico) {
    const regla = v.regla ?? "login:mail+ip";
    if (!desafio) {
      await registrar("desafio_pedido", { funcion: nombre, regla }, h);
      return { ok: false, r: { ok: false, error: VERIFICAR, verificar: true } };
    }
    if (!(await verificarDesafio(desafio, h))) {
      await fallo(funciones, s);
      await registrar("desafio_fallido", { funcion: nombre }, h);
      return { ok: false, r: { ok: false, error: VERIFICAR, verificar: true } };
    }
    await registrar("desafio_ok", { funcion: nombre }, h);
    verifico = true;
  }
  return { ok: true, p: { funciones, s, mc, h, verificaba: v.verificar, verifico: verifico || !!o.yaVerifico } };
}

/** Anota un fallo en todas las cuentas y dice si desde ahora hace falta verificar (o si quedó bloqueado). */
async function anotarFallo(p: Puerta, evento: "login_fallido" | "totp_fallido", datos: Record<string, unknown>): Promise<{ verificar: boolean; bloqueado: boolean }> {
  await fallo(p.funciones, p.s);
  const r = await contar(p.mc, { ventanaSeg: MC_VENTANA, max: MC_BLOQUEO - 1 });
  await registrar(evento, datos, p.h);
  if (!r.permitido) {
    await bloquear(p.mc, MC_BLOQUEO_SEG);
    await registrar("bloqueo", { funcion: p.funciones.join("+"), regla: "login:mail+ip", reintentoSeg: MC_BLOQUEO_SEG }, p.h);
    return { verificar: false, bloqueado: true };
  }
  // ¿El próximo intento va a pedir verificación? Así el formulario la muestra de entrada.
  // (Si la pide una regla de la tabla que recién se cruzó, llega en el intento siguiente,
  // antes del PBKDF2: no cuesta nada.)
  // En la cuenta de Julián (loginAdmin) la tabla pide verificación desde el 2.º intento:
  // la casilla aparece ya en la respuesta del 1.er fallo, sin una vuelta de más.
  return { verificar: r.cuenta >= MC_VERIFICAR || p.verificaba || p.funciones.includes("loginAdmin"), bloqueado: false };
}

async function ingresoCorrecto(p: Puerta, u: Usuario) {
  await exito(p.funciones, p.s);
  await limpiar(p.mc, { ventanaSeg: MC_VENTANA });
  await abrirSesion(u);
  await registrar(esAdmin(u) ? "admin_ingreso" : "login_ok", { cuenta: u.id }, p.h);
}

/* ───────── Segundo paso de la cuenta de Julián (TOTP) ───────── */

/** Cookie corta que recuerda que la clave ya estuvo bien y falta el código. */
const COOKIE_PASO = PRODUCCION ? "__Host-jb_paso" : "jb_paso";
const PASO_SEG = 5 * MIN;
/** Códigos equivocados que se aceptan con un mismo paso antes de volver a pedir la clave. */
const PASO_INTENTOS = 5;

/** El secreto de la app de autenticación de Julián, si está bien cargado. */
function secretoTotp(): string | null {
  const s = (process.env.ADMIN_TOTP_SECRET ?? "").trim();
  if (!s) return null;
  if (!secretoValido(s)) {
    console.error("SEGURIDAD: ADMIN_TOTP_SECRET no es un secreto base32 válido. La cuenta de Julián no puede ingresar hasta corregirlo (node scripts/totp-nuevo.mjs).");
    return "";
  }
  return s;
}

/** ¿Esta cuenta tiene que pasar el código? Solo la privada de Julián (la demo nunca). */
const pideTotp = (u: Usuario) => u.id === ID_ADMIN && secretoTotp() !== null;

/**
 * Cuenta entera de Julián: códigos equivocados en una hora, sumando todas las redes y
 * todos los pasos. No se borra con la clave correcta (solo con un ingreso completo):
 * así la fuerza bruta repartida entre muchas IP no puede ir probando códigos sin fin.
 */
const TOTP_CUENTA_MAX = 10;
const TOTP_CUENTA_SEG = 60 * MIN;
const claveTotpCuenta = (u: Usuario, s?: Sujetos) => `totp-cuenta:${u.id}${s?.prueba ? `~${s.prueba}` : ""}`;

async function abrirPaso(u: Usuario, h: Headers, verifico: boolean) {
  const exp = Date.now() + PASO_SEG * 1000;
  const nonce = crypto.randomUUID().replace(/-/g, "");
  // «v1»: la verificación ya se resolvió al escribir la clave (no se vuelve a pedir en el código)
  const cuerpo = `${u.id}.${exp}.${nonce}.${verifico ? "v1" : "v0"}`;
  const firma = await hmacHex("paso-totp", `${cuerpo}.${await huellaIp(h)}`);
  (await cookies()).set(COOKIE_PASO, `${cuerpo}.${firma}`, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: PASO_SEG,
  });
}

/** Lee el paso pendiente (firmado, vigente y desde la misma red). */
async function leerPaso(h: Headers): Promise<{ uid: string; nonce: string; verifico: boolean } | null> {
  const v = (await cookies()).get(COOKIE_PASO)?.value;
  if (!v || v.length > 300 || !sesionesDisponibles()) return null;
  const partes = v.split(".");
  if (partes.length !== 5) return null;
  const [uid, exp, nonce, marca, firma] = partes;
  if (!/^\d+$/.test(exp) || Number(exp) < Date.now() || (marca !== "v0" && marca !== "v1")) return null;
  if (!(await hmacVerificar("paso-totp", `${uid}.${exp}.${nonce}.${marca}.${await huellaIp(h)}`, firma))) return null;
  return { uid, nonce, verifico: marca === "v1" };
}

/**
 * Para /ingresar: si la clave de Julián ya estuvo bien y falta el código, el mail de
 * la cuenta (para mostrarlo); si no, null.
 */
export async function pasoPendiente(): Promise<{ email: string } | null> {
  const p = await leerPaso(await headers());
  if (!p) return null;
  const u = (await usuarios()).find((x) => x.id === p.uid);
  return u && pideTotp(u) ? { email: u.email } : null;
}

/** «Volver a empezar» desde el paso del código. */
export async function cancelarPaso() {
  (await cookies()).set(COOKIE_PASO, "", opcionesBorrar());
}

/**
 * Segundo paso: el código de 6 dígitos de la app de autenticación.
 * Lo llama ingresar() cuando llega un código.
 */
export async function confirmarCodigo(codigoCrudo: string, o: { desafio?: string | null; h?: Headers } = {}): Promise<ResultadoIngreso> {
  const h = o.h ?? (await headers());
  if (!sesionesDisponibles()) return { ok: false, error: NO_DISPONIBLE };
  await avisarSinSesiones(h);
  const paso = await leerPaso(h);
  const u = paso ? ((await usuarios()).find((x) => x.id === paso.uid) ?? null) : null;
  if (!paso || !u || !pideTotp(u)) {
    await cancelarPaso();
    return { ok: false, error: "Pasó mucho tiempo. Volvé a escribir tu mail y tu clave." };
  }
  const sPaso = await sujetosDe(h);
  if ((await bloqueadoPor(claveTotpCuenta(u, sPaso))) > 0) {
    await cancelarPaso();
    await registrar("bloqueo", { funcion: "login+loginAdmin", regla: "totp:cuenta", cuenta: u.id }, h);
    return { ok: false, error: BLOQUEADO };
  }
  // Si la verificación ya se resolvió al escribir la clave y todavía no hubo códigos
  // equivocados en este paso, no se vuelve a pedir (el código de 30 s puede vencer).
  const yaVerifico = paso.verifico && (await mirar(`login-paso:${paso.nonce}`, { ventanaSeg: PASO_SEG })) === 0;
  const puerta = await abrirPuerta(u.email, true, o.desafio ?? null, h, { yaVerifico });
  if (!puerta.ok) return puerta.r;
  const p = puerta.p;

  const secreto = secretoTotp();
  const codigo = normalizarCodigo(codigoCrudo);
  let contador: number | null = null;
  if (secreto && codigo) {
    try {
      contador = await verificarTotp(secreto, codigo);
    } catch {
      contador = null;
    }
  }
  // un mismo código no sirve dos veces (alguien que lo vio por encima del hombro)
  if (contador !== null && !(await unaVez(`totp:${u.id}:${contador}`, 3 * 30 + 30))) contador = null;

  if (contador === null) {
    const r = await anotarFallo(p, "totp_fallido", { cuenta: u.id });
    // tope de la cuenta entera (todas las redes): al 10.º código equivocado en una hora, se cierra el código
    const cuenta = await contar(claveTotpCuenta(u, p.s), { ventanaSeg: TOTP_CUENTA_SEG, max: TOTP_CUENTA_MAX - 1 });
    if (!cuenta.permitido) {
      await bloquear(claveTotpCuenta(u, p.s), TOTP_CUENTA_SEG);
      await registrar("alerta", { motivo: "códigos TOTP equivocados desde varias redes", cuenta: u.id }, h);
      await cancelarPaso();
      return { ok: false, error: BLOQUEADO };
    }
    const usados = await contar(`login-paso:${paso.nonce}`, { ventanaSeg: PASO_SEG, max: PASO_INTENTOS - 1 });
    if (r.bloqueado || !usados.permitido) {
      await cancelarPaso();
      return { ok: false, error: r.bloqueado ? BLOQUEADO : "Hubo varios códigos equivocados. Volvé a escribir tu mail y tu clave." };
    }
    return { ok: false, error: "El código no coincide. Fijate que sea el de ahora en tu app.", totp: true, ...(r.verificar ? { verificar: true } : {}) };
  }
  await cancelarPaso();
  await ingresoCorrecto(p, u);
  return { ok: true };
}

/* ───────── Ingresar y crear cuenta ───────── */

/**
 * Ingresar con mail y clave. Pasale el FormData del formulario (`f`) para que lea la
 * verificación («jb_desafio») y, en el segundo paso de Julián, el código («codigo»).
 *   const r = await ingresar(email, clave, { f });
 *   if (!r.ok) return { error: r.error, verificar: r.verificar };
 *   if (r.totp) …mostrar el campo del código…
 * Los mensajes nunca dicen si el mail tiene cuenta.
 */
export async function ingresar(
  email: string,
  clave: string,
  o: { f?: FormData | null; desafio?: string | null; codigo?: string | null; h?: Headers } = {},
): Promise<ResultadoIngreso> {
  const h = o.h ?? (await headers());
  const desafio = o.desafio ?? (o.f ? String(o.f.get(CAMPO_DESAFIO) ?? "") || null : null);
  const codigo = o.codigo ?? (o.f?.has("codigo") ? String(o.f.get("codigo") ?? "") : null);
  if (codigo !== null) return confirmarCodigo(codigo, { desafio, h });

  if (!sesionesDisponibles()) return { ok: false, error: NO_DISPONIBLE };
  await avisarSinSesiones(h);
  const correo = mailNormal(email) ?? normalizar(email).slice(0, TOPES.mail);
  const admin = await cuentaAdminPrivada();
  const esMailAdmin = !!admin && admin.email === correo;

  const puerta = await abrirPuerta(correo, esMailAdmin, desafio, h);
  if (!puerta.ok) return puerta.r;
  const p = puerta.p;

  // una clave más larga que el tope no se cifra (PBKDF2 con megas de texto): cuenta como fallo
  const u = correo ? await buscarPorEmail(correo) : null;
  const bien = clave.length > 0 && clave.length <= TOPES.clave ? await claveCorrecta(u, clave) : false;
  // servidor saturado: no se calculó nada y no cuenta como fallo
  if (bien === null) {
    await registrar("limite", { funcion: "login", regla: "pbkdf2:a-la-vez" }, h);
    return { ok: false, error: TEXTOS.muchos };
  }
  if (!u || !bien) {
    const r = await anotarFallo(p, "login_fallido", { mail: correo, admin: esMailAdmin });
    if (r.bloqueado) return { ok: false, error: BLOQUEADO };
    return { ok: false, error: NO_COINCIDEN, ...(r.verificar ? { verificar: true } : {}) };
  }

  // clave vieja (120.000 vueltas): ya que la tenemos, se vuelve a cifrar con 600.000
  if (u.id !== ID_ADMIN && (u.iter ?? ITERACIONES_VIEJAS) < ITERACIONES) {
    try {
      await actualizarCuenta(u, { hash: await hashClave(clave, u.sal, ITERACIONES), iter: ITERACIONES });
    } catch (e) {
      console.warn("No se pudo volver a cifrar la clave.", e instanceof Error ? e.message : e);
    }
  }

  if (pideTotp(u)) {
    if (!secretoTotp()) return { ok: false, error: NO_DISPONIBLE };
    // el código de la cuenta cerrado por demasiados errores desde varias redes
    if ((await bloqueadoPor(claveTotpCuenta(u, p.s))) > 0) {
      await registrar("bloqueo", { funcion: "login+loginAdmin", regla: "totp:cuenta", cuenta: u.id }, h);
      return { ok: false, error: BLOQUEADO };
    }
    // La clave estuvo bien, pero los fallos de mail+red NO se limpian hasta el código:
    // si no, quien tiene la clave podría probar 5 códigos, volver a escribirla y seguir.
    await abrirPaso(u, h, p.verifico);
    return { ok: false, error: "Escribí el código de 6 dígitos de tu app de autenticación.", totp: true };
  }

  try {
    await ingresoCorrecto(p, u);
  } catch (e) {
    if (e instanceof SinSesiones) return { ok: false, error: NO_DISPONIBLE };
    throw e;
  }
  return { ok: true };
}

/**
 * Crear una cuenta. Si el mail ya tenía cuenta, responde «Ya hay una cuenta con ese
 * mail.» (y accionCrearCuenta lo cuenta como 3 fallos, así probar mails ajenos cuesta).
 * El mail de Julián (ADMIN_EMAIL) nunca se delata: responde como ante un mail inválido.
 * PRODUCCIÓN: con envío de mails, pasar a un mensaje único («Si ese mail no tenía
 * cuenta, ya la creamos; si ya tenía, te escribimos para entrar»).
 */
export async function crearCuenta(nombre: string, email: string, clave: string): Promise<{ ok: true } | { ok: false; error: string; repetido?: boolean }> {
  if (!sesionesDisponibles()) return { ok: false, error: NO_DISPONIBLE };
  await avisarSinSesiones();
  // sin caracteres de control ni marcas invisibles (el nombre llega al calendario de Julián) y con un largo razonable
  nombre = nombre
    .slice(0, 400)
    .replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩﻿]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, TOPES.nombre)
    .trim();
  const correo = mailNormal(email);
  if (nombre.length < 2) return { ok: false, error: "Escribí tu nombre." };
  if (!correo) return { ok: false, error: "Revisá el mail." };
  if (correo === mailAdminConfigurado()) {
    await registrar("alerta", { motivo: "intento de crear una cuenta con el mail de Julián" }, await headers());
    return { ok: false, error: "Revisá el mail." };
  }
  const problema = problemaDeClave(clave, correo);
  if (problema) return { ok: false, error: problema };
  if ((await usuarios()).some((u) => u.email === correo)) return { ok: false, error: YA_EXISTE, repetido: true };
  const sal = crypto.randomUUID();
  const hash = await conCupoPbkdf2(() => hashClave(clave, sal, ITERACIONES));
  if (hash === null) return { ok: false, error: TEXTOS.muchos };
  const nuevo: Usuario = {
    id: crypto.randomUUID(),
    nombre,
    email: correo,
    sal,
    hash,
    iter: ITERACIONES,
    sv: 0,
    creado: new Date().toISOString(),
  };
  // dentro de la cola del archivo: dos altas casi simultáneas con el mismo mail no se pisan
  const repetido = await modificar<Usuario[], boolean>("usuarios", (lista) => {
    const todos = Array.isArray(lista) ? lista : [];
    if (todos.some((u) => u.email === correo)) return { resultado: true };
    return { datos: [...todos, nuevo], resultado: false };
  });
  if (repetido) return { ok: false, error: YA_EXISTE, repetido: true };
  await abrirSesion(nuevo);
  await registrar("cuenta_creada", { cuenta: nuevo.id }, await headers());
  return { ok: true };
}

const YA_EXISTE = "Ya hay una cuenta con ese mail.";

/** Para el panel: ¿producción con el secreto de respaldo? ¿La cuenta de Julián tiene algún problema? */
export const estadoSesiones = () => ({
  disponibles: sesionesDisponibles(),
  produccion: PRODUCCION,
  respaldo: usaRespaldo || respaldoPublicoEnUso(),
  cuentaAdmin: problemaCuentaAdmin(),
});
