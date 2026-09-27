import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESION, opcionesBorrar, verificar } from "@/lib/session";
import { revisar, respuestaLimite, sujetosDe, TEXTOS, type Veredicto } from "@/lib/limite";

/**
 * La primera puerta de cada pedido (corre en edge, antes que las páginas y las rutas):
 *  1. Límite global por cliente: las páginas y /api tienen cupos separados (lib/limite.ts,
 *     «paginas» y «api»). Si se pasa: 429 con Retry-After, en HTML sobrio para las
 *     páginas y en JSON para /api. Cada ruta de /api tiene además su cupo propio.
 *     Este límite va SIEMPRE en la memoria de la instancia (soloMemoria), aunque haya
 *     Upstash: consultarlo en cada página vista gastaría el cupo de Redis (y bajo un
 *     ataque, la factura). Contra los ataques de volumen está el Firewall de Vercel
 *     (ver SEGURIDAD.md); Upstash queda para lo sensible (login, verificación, TOTP,
 *     formularios).
 *  2. Política de contenidos (CSP) con un nonce nuevo en cada pedido, como en la guía
 *     de Next 15: va en «x-nonce» y en Content-Security-Policy de la petición (Next lo
 *     lee de ahí y lo pone en sus scripts; app/layout.tsx lo usa en el script del <head>)
 *     y en Content-Security-Policy de la respuesta.
 *  3. Sin sesión válida, /mi-espacio y /checkout llevan a /ingresar con un aviso.
 *  4. X-Robots-Tag: noindex en lo privado y en los formularios de cuenta.
 * El resto de los encabezados de seguridad (HSTS, nosniff, etc.) está en next.config.ts.
 */

const produccion = process.env.NODE_ENV === "production";

/** Rutas que nunca se indexan (también en app/robots.ts). */
const SIN_INDICE = ["/mi-espacio", "/checkout", "/api", "/ingresar", "/crear-cuenta"];
const PRIVADAS = ["/mi-espacio", "/checkout"];

const empiezaCon = (pathname: string, bases: string[]) => bases.some((b) => pathname === b || pathname.startsWith(`${b}/`));

/** Un nonce de 128 bits en base64 (solo Web Crypto: corre en edge). */
function nuevoNonce(): string {
  const b = crypto.getRandomValues(new Uint8Array(16));
  let s = "";
  b.forEach((x) => (s += String.fromCharCode(x)));
  return btoa(s);
}

/**
 * La política de contenidos. Orígenes de afuera (auditoría, sept. 2026):
 *  - Spotify (components/Musica.tsx): nuestro código inyecta https://open.spotify.com/embed/iframe-api/v1
 *    y ese script arma un iframe de open.spotify.com. Con 'strict-dynamic' los scripts que
 *    agrega un script con nonce quedan permitidos; el iframe va en frame-src.
 *  - Cloudflare Turnstile (components/Desafio.tsx): su script se inyecta igual (strict-dynamic)
 *    y el widget es un iframe de challenges.cloudflare.com.
 *  - La prueba de trabajo corre en un Worker creado desde un Blob: worker-src blob:.
 *  - Las fuentes son de next/font (se sirven desde el sitio).
 *  - 'unsafe-eval' va también en producción: el reproductor oficial de Spotify
 *    (embed-cdn.spotifycdn.com/_next/static/iframe_api.*.js) está compilado con eval, y
 *    CSP no deja habilitar eval para un solo origen. Sin eso la música no suena nunca.
 *    El nonce y 'strict-dynamic' siguen frenando los scripts inyectados: eval solo corre
 *    dentro de un script que ya estaba permitido.
 */
function politica(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://challenges.cloudflare.com",
    "frame-src https://open.spotify.com https://challenges.cloudflare.com",
    "media-src 'self' blob:",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(produccion ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

/** Para las respuestas que no son páginas del sitio (JSON, el aviso de 429): nada de afuera. */
const POLITICA_CERRADA = "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'";

const escaparHtml = (t: string) => t.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** La página de «esperá un momento», sobria, con los colores del sitio y sin scripts. */
function paginaLimite(v: Veredicto): Response {
  const seg = Math.max(1, v.reintentoSeg);
  const mensaje = escaparHtml(v.mensaje ?? TEXTOS.muchos);
  // si la espera es corta, la página vuelve a probar sola una vez pasado el tiempo
  const refresco = seg <= 120 ? `<meta http-equiv="refresh" content="${seg}">` : "";
  const html = `<!doctype html>
<html lang="es-AR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<meta name="color-scheme" content="dark">
${refresco}
<title>Un momento · Julián Bermúdez</title>
<style>
  html,body{margin:0;height:100%;background:#0a0a0a;color:#ece3d0}
  body{display:flex;align-items:center;justify-content:center;padding:0 16px;box-sizing:border-box;
    font-family:"Palatino Linotype","Book Antiqua",Palatino,Georgia,serif;text-align:center}
  main{max-width:30rem}
  .orla{letter-spacing:.6em;color:#b9a77f;font-size:.8rem;margin:0 0 1.6rem}
  h1{font-weight:400;font-size:1.6rem;margin:0 0 1rem}
  p{line-height:1.6;margin:0 0 1.4rem;color:#d8ceb8}
  a{color:#ece3d0;text-decoration:underline;text-underline-offset:.25em}
</style>
</head>
<body>
<main>
<p class="orla" aria-hidden="true">◆ ◆ ◆</p>
<h1>Un momento</h1>
<p>${mensaje}</p>
<p><a href="">Volver a intentar</a></p>
</main>
</body>
</html>`;
  return new Response(html, {
    status: 429,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Retry-After": String(seg),
      "Content-Security-Policy": POLITICA_CERRADA,
      "X-Robots-Tag": "noindex",
    },
  });
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const esApi = pathname === "/api" || pathname.startsWith("/api/");

  // 1. Límite global por cliente (páginas y /api por separado), en memoria local
  const v = await revisar(esApi ? "api" : "paginas", await sujetosDe(req.headers), { soloMemoria: true });
  if (!v.permitido) {
    const r = esApi ? respuestaLimite(v) : paginaLimite(v);
    if (esApi) {
      r.headers.set("Content-Security-Policy", POLITICA_CERRADA);
      r.headers.set("X-Robots-Tag", "noindex");
    }
    return r;
  }

  // 3. Lo privado, solo con sesión
  if (empiezaCon(pathname, PRIVADAS) && !(await verificar(req.cookies.get(COOKIE_SESION)?.value))) {
    const url = req.nextUrl.clone();
    url.pathname = "/ingresar";
    url.search = "";
    url.searchParams.set("aviso", pathname.startsWith("/checkout") ? "checkout" : "privado");
    url.searchParams.set("volver", pathname + search);
    const res = NextResponse.redirect(url);
    // con el prefijo __Host- un delete a secas (sin Secure) el navegador lo ignora
    if (req.cookies.has(COOKIE_SESION)) res.cookies.set(COOKIE_SESION, "", opcionesBorrar());
    res.headers.set("X-Robots-Tag", "noindex");
    return res;
  }

  // 2. CSP con nonce (en /api no hace falta nonce: son JSON o archivos)
  const requestHeaders = new Headers(req.headers);
  let csp = POLITICA_CERRADA;
  if (!esApi) {
    const nonce = nuevoNonce();
    csp = politica(nonce);
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("Content-Security-Policy", csp);
  } else {
    // nadie de afuera puede mandar su propio «x-nonce»
    requestHeaders.delete("x-nonce");
  }
  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set("Content-Security-Policy", csp);

  // 4. Fuera de los buscadores
  if (empiezaCon(pathname, SIN_INDICE)) res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

/**
 * Todas las rutas salvo los archivos estáticos reales: lo de Next (_next/static,
 * _next/image), las carpetas de public (íconos, imágenes, audio, .well-known) y los
 * archivos con nombre fijo (el service worker, el manifiesto, robots.txt, el ícono).
 * A propósito NO se deja afuera «cualquier cosa que termine en .png o .txt»: una ruta
 * inventada como /lo-que-sea.png no existe en public/, la arma la app (con todo el
 * layout) y tiene que pasar por el límite y llevar CSP.
 */
export const config = {
  matcher: [
    "/((?!_next/static/|_next/image|icons/|fotos/|grabados/|emblemas/|capturas/|audio/|\\.well-known/|sw\\.js$|manifest\\.webmanifest$|robots\\.txt$|sitemap\\.xml$|favicon\\.ico$|icon\\.png$).*)",
  ],
};
