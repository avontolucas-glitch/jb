/**
 * Sesión en cookie httpOnly firmada (HMAC-SHA256).
 * Usa Web Crypto, así funciona tanto en el middleware como en el servidor.
 * PRODUCCIÓN: reemplazar por el proveedor de login real (ver lib/auth.ts).
 */
export const COOKIE_SESION = "jb_sesion";
export const DURACION_SEGUNDOS = 60 * 60 * 24 * 7; // 7 días

const SECRETO =
  process.env.SESSION_SECRET || "prototipo-julianbermudez-cambiar-en-produccion";

export type Sesion = { uid: string; exp: number };

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

async function clave() {
  return crypto.subtle.importKey("raw", enc.encode(SECRETO), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

export async function firmar(s: Sesion): Promise<string> {
  const cuerpo = b64url(enc.encode(JSON.stringify(s)));
  const firma = new Uint8Array(await crypto.subtle.sign("HMAC", await clave(), enc.encode(cuerpo)));
  return `${cuerpo}.${b64url(firma)}`;
}

export async function verificar(token: string | undefined): Promise<Sesion | null> {
  if (!token || !token.includes(".")) return null;
  const [cuerpo, firma] = token.split(".");
  try {
    const ok = await crypto.subtle.verify("HMAC", await clave(), desdeB64url(firma), enc.encode(cuerpo));
    if (!ok) return null;
    const s = JSON.parse(new TextDecoder().decode(desdeB64url(cuerpo))) as Sesion;
    if (!s.uid || s.exp < Date.now()) return null;
    return s;
  } catch {
    return null;
  }
}
