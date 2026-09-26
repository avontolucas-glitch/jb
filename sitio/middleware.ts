import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESION, verificar } from "@/lib/session";

/** Sin sesión válida, /mi-espacio y /checkout llevan a /ingresar con un aviso. */
export async function middleware(req: NextRequest) {
  const sesion = await verificar(req.cookies.get(COOKIE_SESION)?.value);
  if (sesion) return NextResponse.next();
  const { pathname, search } = req.nextUrl;
  const url = req.nextUrl.clone();
  url.pathname = "/ingresar";
  url.search = "";
  url.searchParams.set("aviso", pathname.startsWith("/checkout") ? "checkout" : "privado");
  url.searchParams.set("volver", pathname + search);
  const res = NextResponse.redirect(url);
  if (req.cookies.has(COOKIE_SESION)) res.cookies.delete(COOKIE_SESION);
  return res;
}

export const config = { matcher: ["/mi-espacio/:path*", "/checkout/:path*"] };
