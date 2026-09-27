/**
 * Códigos de un solo uso por tiempo (TOTP, RFC 6238) para la cuenta de Julián.
 * HMAC-SHA1, 6 dígitos, pasos de 30 s y ±1 paso de tolerancia (el reloj del teléfono
 * puede estar un poco corrido). Solo Web Crypto: corre en edge y en node.
 *
 * Compatible con Google Authenticator, Authy, 1Password, Microsoft Authenticator…
 * El secreto va en ADMIN_TOTP_SECRET (base32). Para generarlo: node scripts/totp-nuevo.mjs
 *
 *   const contador = await verificarTotp(secreto, "123456");   // número del paso o null
 *   if (contador === null) …código incorrecto…
 */

const ALFABETO = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
export const PASO_SEG = 30;
export const DIGITOS = 6;

/** Base32 (RFC 4648) a bytes. Acepta minúsculas, espacios, guiones y relleno «=». null si no es válido. */
export function base32Decodificar(txt: string): Uint8Array<ArrayBuffer> | null {
  const s = txt.toUpperCase().replace(/[\s-]/g, "").replace(/=+$/, "");
  if (!s || s.length > 256) return null;
  const out = new Uint8Array(new ArrayBuffer(Math.floor((s.length * 5) / 8)));
  let bits = 0;
  let valor = 0;
  let i = 0;
  for (const c of s) {
    const n = ALFABETO.indexOf(c);
    if (n < 0) return null;
    valor = (valor << 5) | n;
    bits += 5;
    if (bits >= 8) {
      out[i++] = (valor >>> (bits - 8)) & 0xff;
      bits -= 8;
    }
  }
  return out;
}

/** Bytes a base32 (sin relleno), como lo muestran las apps. */
export function base32Codificar(bytes: Uint8Array): string {
  let bits = 0;
  let valor = 0;
  let out = "";
  for (const b of bytes) {
    valor = (valor << 8) | b;
    bits += 8;
    while (bits >= 5) {
      out += ALFABETO[(valor >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += ALFABETO[(valor << (5 - bits)) & 31];
  return out;
}

/** Un secreto nuevo de 160 bits (lo que recomienda la RFC 4226), en base32. */
export function generarSecreto(bytes = 20): string {
  return base32Codificar(crypto.getRandomValues(new Uint8Array(bytes)));
}

/** ¿Es un secreto usable? (base32 válido y de al menos 80 bits). */
export function secretoValido(secreto: string): boolean {
  const k = base32Decodificar(secreto);
  return !!k && k.length >= 10;
}

const llaves = new Map<string, Promise<CryptoKey>>();
function llave(secreto: string): Promise<CryptoKey> {
  let k = llaves.get(secreto);
  if (!k) {
    const bytes = base32Decodificar(secreto);
    if (!bytes || bytes.length < 10) return Promise.reject(new Error("Secreto TOTP inválido."));
    k = crypto.subtle.importKey("raw", bytes, { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
    if (llaves.size > 8) llaves.clear();
    llaves.set(secreto, k);
  }
  return k;
}

/** HOTP (RFC 4226) para un contador. */
async function hotp(k: CryptoKey, contador: number): Promise<string> {
  const msg = new Uint8Array(new ArrayBuffer(8));
  const v = new DataView(msg.buffer);
  v.setUint32(0, Math.floor(contador / 2 ** 32));
  v.setUint32(4, contador >>> 0);
  const h = new Uint8Array(await crypto.subtle.sign("HMAC", k, msg));
  const o = h[h.length - 1] & 0x0f;
  const n = (((h[o] & 0x7f) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3]) % 10 ** DIGITOS;
  return String(n).padStart(DIGITOS, "0");
}

/** El paso de 30 s de un instante. */
export const pasoDe = (ms = Date.now()) => Math.floor(ms / 1000 / PASO_SEG);

/** El código de un instante (para el script y las pruebas). */
export async function codigoTotp(secreto: string, ms = Date.now()): Promise<string> {
  return hotp(await llave(secreto), pasoDe(ms));
}

/** Compara dos textos del mismo largo sin cortar en la primera diferencia. */
function iguales(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

/** Deja solo los dígitos (las apps muestran «123 456»). null si no son 6. */
export function normalizarCodigo(v: string | null | undefined): string | null {
  const s = String(v ?? "").slice(0, 20).replace(/[\s-]/g, "");
  return new RegExp(`^\\d{${DIGITOS}}$`).test(s) ? s : null;
}

/**
 * ¿El código vale ahora (±`ventana` pasos)? Devuelve el número de paso que coincidió
 * (para no aceptar el mismo código dos veces) o null. Calcula todos los pasos siempre,
 * así el tiempo no depende de cuál coincidió.
 */
export async function verificarTotp(secreto: string, codigo: string, o: { ventana?: number; ms?: number } = {}): Promise<number | null> {
  const c = normalizarCodigo(codigo);
  if (!c) return null;
  const k = await llave(secreto);
  const actual = pasoDe(o.ms);
  const ventana = Math.max(0, Math.min(2, o.ventana ?? 1));
  let encontrado: number | null = null;
  for (let d = -ventana; d <= ventana; d++) {
    const esperado = await hotp(k, actual + d);
    if (iguales(esperado, c) && encontrado === null) encontrado = actual + d;
  }
  return encontrado;
}

/**
 * Enlace otpauth:// para cargar el secreto con un QR o a mano.
 *   enlaceOtpauth(secreto, "julian@mail.com")
 */
export function enlaceOtpauth(secreto: string, cuenta: string, emisor = "Julián Bermúdez"): string {
  const etiqueta = `${encodeURIComponent(emisor)}:${encodeURIComponent(cuenta)}`;
  const q = new URLSearchParams({ secret: secreto, issuer: emisor, algorithm: "SHA1", digits: String(DIGITOS), period: String(PASO_SEG) });
  return `otpauth://totp/${etiqueta}?${q.toString().replace(/\+/g, "%20")}`;
}
