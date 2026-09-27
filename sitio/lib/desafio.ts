/**
 * La verificación «confirmá que sos una persona» (tipo CAPTCHA). Corre en edge y en node.
 *
 * Dos modos:
 *  - «turnstile»: con TURNSTILE_SITE_KEY y TURNSTILE_SECRET_KEY, Cloudflare Turnstile.
 *    El navegador muestra el widget (components/Desafio.tsx) y el servidor verifica el
 *    token contra siteverify, con la IP (remoteip) y el dominio (hostname).
 *    Si Cloudflare falla varias veces seguidas (5 errores de red, de tiempo o 5xx en un
 *    minuto; un 4xx o un 429 no cuentan), se marca «caído» por 10 minutos y en ese rato
 *    se acepta la prueba de trabajo, con 4 bits más de dificultad (nunca se abre la
 *    puerta del todo). Una huella de IP con 3 tokens rechazados en 10 minutos ya no
 *    llega a Cloudflare: se rechaza directo (así nadie gasta llamadas en nuestro nombre).
 *  - «trabajo» (sin variables): prueba de trabajo propia, como ALTCHA o Friendly Captcha.
 *    GET /api/desafio entrega { sal, dificultad, exp, firma } firmado con HMAC; el
 *    navegador busca un número n tal que SHA-256(sal + n) empiece con `dificultad` bits
 *    en cero (16 por defecto: medio segundo a un par de segundos en un celular; 20
 *    mientras dure una alerta de login, es decir, un ataque en curso) y lo
 *    manda en el formulario. El servidor verifica la firma, el vencimiento (5 min), la
 *    cuenta y que esa sal no se haya usado antes (un solo uso, en el almacenamiento de
 *    lib/limite.ts: memoria o Upstash).
 *    Frena bots baratos y encarece el spam masivo; no frena a alguien decidido con
 *    mucha CPU. Por eso siempre va junto con los límites de lib/limite.ts, y Turnstile
 *    es lo recomendado para el sitio publicado.
 *
 * Lo que manda el formulario, en el campo oculto «jb_desafio»:
 *  - Turnstile:          "ts." + token de Cloudflare
 *  - Prueba de trabajo:  "pt.<sal>.<dificultad>.<exp>.<firma>.<n>"
 *
 * Variables opcionales:
 *  - JB_DESAFIO_BITS: dificultad de la prueba de trabajo (entre 8 y 24; 16 por defecto).
 *  - TURNSTILE_HOSTNAMES: dominios aceptados, separados por coma. Si no está, se exige
 *    el mismo dominio del pedido (encabezado host). Con las claves de prueba de
 *    Cloudflare, que responden «example.com», agregarlo acá.
 */
import { clavePrueba, hmacHex, hmacVerificar, huellaIp, ip } from "./cliente";
import { alertaVigente, bloquear, bloqueadoPor, contar, mirar, unaVez } from "./limite";

export const CAMPO_DESAFIO = "jb_desafio";
export const VIGENCIA_MS = 5 * 60 * 1000;
const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const CLAVE_CAIDO = "desafio:turnstile-caido";

export type Modo = "turnstile" | "trabajo";

/** Dificultad de la prueba de trabajo, en bits en cero. */
export function dificultad(): number {
  const n = parseInt(process.env.JB_DESAFIO_BITS ?? "", 10);
  return Number.isFinite(n) ? Math.min(24, Math.max(8, n)) : 16;
}

const conTurnstile = () => Boolean(process.env.TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET_KEY);

/** Qué modo está usando el sitio. */
export function desafioActivo(): Modo {
  return conTurnstile() ? "turnstile" : "trabajo";
}

export type DesafioTrabajo = { modo: "trabajo"; sal: string; dificultad: number; exp: number; firma: string };
export type DesafioTurnstile = { modo: "turnstile"; siteKey: string };
export type DesafioCliente = DesafioTrabajo | DesafioTurnstile;

/** Bits de más mientras Turnstile está caído (la prueba de trabajo lo reemplaza). */
const EXTRA_CAIDO = 4;
/** Piso de bits mientras dura la alerta de login (un ataque de claves en curso). */
const BITS_ALERTA = 20;

/**
 * La dificultad que corresponde AHORA: la de base, más dura si Cloudflare está caído o
 * si hay una alerta de login. verificarTrabajo() exige al menos esta.
 */
async function dificultadAhora(h?: Headers): Promise<number> {
  let d = dificultad();
  if (conTurnstile() && (await turnstileCaido())) d += EXTRA_CAIDO;
  if (await alertaVigente("login", h)) d = Math.max(d, BITS_ALERTA);
  return Math.min(24, d);
}

/** Un desafío nuevo de prueba de trabajo, firmado. `bits` fija la dificultad (si no, la de ahora). */
export async function crearDesafio(bits?: number, h?: Headers): Promise<DesafioTrabajo> {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let sal = "";
  bytes.forEach((b) => (sal += b.toString(16).padStart(2, "0")));
  const d = bits ?? (await dificultadAhora(h));
  const exp = Date.now() + VIGENCIA_MS;
  const firma = await hmacHex("desafio", `${sal}.${d}.${exp}`);
  return { modo: "trabajo", sal, dificultad: d, exp, firma };
}

/** ¿Cloudflare dejó de responder hace poco? */
async function turnstileCaido(): Promise<boolean> {
  return (await bloqueadoPor(CLAVE_CAIDO)) > 0;
}

/**
 * Lo que recibe el navegador en GET /api/desafio.
 * Con `pedido = "trabajo"` (el script de Turnstile no cargó) se entrega la prueba de
 * trabajo solo si el sitio está en ese modo o si Cloudflare está marcado como caído.
 */
export async function desafioParaCliente(pedido?: Modo, h?: Headers): Promise<DesafioCliente> {
  if (conTurnstile() && !(pedido === "trabajo" && (await turnstileCaido()))) {
    return { modo: "turnstile", siteKey: process.env.TURNSTILE_SITE_KEY! };
  }
  return crearDesafio(undefined, h);
}

/** Cuántos bits en cero tiene adelante un resumen. */
function bitsEnCero(b: Uint8Array): number {
  let n = 0;
  for (const x of b) {
    if (x === 0) {
      n += 8;
      continue;
    }
    return n + Math.clz32(x) - 24;
  }
  return n;
}

const RE_TRABAJO = /^pt\.([0-9a-f]{32})\.(\d{1,2})\.(\d{13})\.([0-9a-f]{64})\.(\d{1,12})$/;

async function verificarTrabajo(token: string, h: Headers): Promise<boolean> {
  const m = RE_TRABAJO.exec(token);
  if (!m) return false;
  const [, sal, dTxt, expTxt, firma, n] = m;
  const d = Number(dTxt);
  const exp = Number(expTxt);
  const ahora = Date.now();
  if (d > 24 || exp <= ahora || exp > ahora + VIGENCIA_MS + 60_000) return false;
  if (d < (await dificultadAhora(h))) return false;
  if (!(await hmacVerificar("desafio", `${sal}.${d}.${exp}`, firma))) return false;
  const resumen = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(sal + n)));
  if (bitsEnCero(resumen) < d) return false;
  // Un solo uso: la sal queda marcada hasta que vence.
  return unaVez(`desafio:${sal}`, Math.ceil((exp - ahora) / 1000) + 5);
}

function hostDe(h: Headers): string | null {
  const v = (h.get("x-forwarded-host") && process.env.VERCEL ? h.get("x-forwarded-host") : h.get("host")) ?? "";
  const host = v.split(",")[0].trim().toLowerCase().replace(/:\d+$/, "");
  return host || null;
}

/** Errores seguidos de Cloudflare (red, tiempo, 5xx, respuesta rota) antes de darlo por caído. */
const ERRORES_PARA_CAIDO = 5;
/** Tokens «ts.» rechazados por huella de IP, en 10 minutos, antes de dejar de consultar a Cloudflare. */
const RECHAZOS_POR_IP = 3;
const RECHAZOS_VENTANA = 10 * 60;

async function errorDeCloudflare(motivo: string) {
  const r = await contar("desafio:ts-errores", { ventanaSeg: 60, max: ERRORES_PARA_CAIDO - 1 });
  if (!r.permitido && !(await turnstileCaido())) {
    console.warn(`Turnstile no responde (${motivo}): se acepta la prueba de trabajo, más difícil, por 10 minutos.`);
    await bloquear(CLAVE_CAIDO, 10 * 60);
  }
}

async function verificarTurnstile(token: string, h: Headers): Promise<boolean> {
  const secreto = process.env.TURNSTILE_SECRET_KEY;
  if (!secreto || token.length > 2048 || !/^[\w.\-:]+$/.test(token)) return false;
  // una huella que ya mandó varios tokens rechazados no gasta más llamadas a Cloudflare
  const prueba = clavePrueba(h);
  const claveRechazos = `desafio:ts-rechazos:${await huellaIp(h)}${prueba ? `~${prueba}` : ""}`;
  if ((await mirar(claveRechazos, { ventanaSeg: RECHAZOS_VENTANA })) >= RECHAZOS_POR_IP) return false;
  const cuerpo = new URLSearchParams({ secret: secreto, response: token, idempotency_key: crypto.randomUUID() });
  const quien = ip(h);
  if (quien !== "local") cuerpo.set("remoteip", quien);
  let datos: { success?: boolean; hostname?: string; "error-codes"?: string[] };
  try {
    const r = await fetch(SITEVERIFY, { method: "POST", body: cuerpo, signal: AbortSignal.timeout(5000), cache: "no-store" });
    if (r.status >= 500) {
      await errorDeCloudflare(`siteverify respondió ${r.status}`);
      return false;
    }
    // 4xx o 429: lo nuestro está mal o nos limitan; no es «caído» (no se baja la guardia)
    if (!r.ok) {
      console.warn(`Turnstile: siteverify respondió ${r.status}.`);
      return false;
    }
    datos = await r.json();
  } catch (e) {
    await errorDeCloudflare(e instanceof Error ? e.message : String(e));
    return false;
  }
  if (datos.success !== true) {
    await contar(claveRechazos, { ventanaSeg: RECHAZOS_VENTANA, max: RECHAZOS_POR_IP });
    return false;
  }
  const permitidos = (process.env.TURNSTILE_HOSTNAMES ?? "")
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);
  if (!permitidos.length) {
    const host = hostDe(h);
    if (host) permitidos.push(host);
  }
  return !permitidos.length || (!!datos.hostname && permitidos.includes(datos.hostname.toLowerCase()));
}

/**
 * ¿Pasó la verificación? Recibe el FormData del formulario (lee «jb_desafio») o el token.
 *   if (!(await verificarDesafio(f, await headers()))) return { error: TEXTOS.verificar, verificar: true };
 * Cada token sirve una sola vez: después de un envío, el componente se reinicia.
 */
export async function verificarDesafio(entrada: FormData | string | null | undefined, h: Headers): Promise<boolean> {
  const token = typeof entrada === "string" ? entrada : entrada ? String(entrada.get(CAMPO_DESAFIO) ?? "") : "";
  if (!token || token.length > 2100) return false;
  try {
    if (token.startsWith("ts.")) return conTurnstile() && (await verificarTurnstile(token.slice(3), h));
    if (token.startsWith("pt.")) {
      if (conTurnstile() && !(await turnstileCaido())) return false;
      return await verificarTrabajo(token, h);
    }
  } catch (e) {
    console.warn("No se pudo verificar el desafío.", e instanceof Error ? e.message : e);
  }
  return false;
}
