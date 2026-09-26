/**
 * Transmisión protegida de los directos (SIMULADA en el prototipo).
 *
 * Cómo se protege:
 *  1) El video nunca tiene un link público: cada vez que alguien entra a la
 *     sala, el servidor firma un permiso de reproducción que vence en pocos
 *     minutos y solo sirve para esa persona y ese directo.
 *  2) Una sola pantalla a la vez por cuenta (lib/salas.ts).
 *  3) Marca de agua con el mail de quien mira, que se mueve por el video.
 *  4) Sin botón de descarga, sin menú del botón derecho, sin arrastrar.
 *
 * PRODUCCIÓN: la transmisión va por un servicio de video con DRM (cifrado
 * Widevine / FairPlay / PlayReady) y reproducción firmada. Acá se reemplaza
 * `permisoReproduccion` por el token o la licencia que da ese servicio.
 * Nada es 100 % imposible de copiar (una cámara apuntando a la pantalla
 * siempre funciona): por eso la marca de agua con el mail es clave.
 */
const SECRETO = process.env.STREAM_SECRET || process.env.SESSION_SECRET || "prototipo-streaming-cambiar";
const VIGENCIA_MS = 5 * 60 * 1000;
const enc = new TextEncoder();

function b64url(b: Uint8Array) {
  let s = "";
  b.forEach((x) => (s += String.fromCharCode(x)));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function permisoReproduccion(uid: string, directo: string) {
  const cuerpo = b64url(enc.encode(JSON.stringify({ uid, directo, exp: Date.now() + VIGENCIA_MS })));
  const clave = await crypto.subtle.importKey("raw", enc.encode(SECRETO), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const firma = new Uint8Array(await crypto.subtle.sign("HMAC", clave, enc.encode(cuerpo)));
  return `${cuerpo}.${b64url(firma)}`;
}
