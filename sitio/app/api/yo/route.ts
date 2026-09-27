import { NextResponse } from "next/server";
import { usuarioActual } from "@/lib/auth";
import { limitarRuta } from "@/lib/proteger";

/** Si hay sesión y el nombre de pila, para que Yo Da salude y sepa si puede ayudar con temas de la cuenta. */
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const limite = await limitarRuta("apiYo", req);
  if (limite) return limite;
  const u = await usuarioActual();
  // la zona horaria de la conexión (la pone Vercel): solo la zona, para la hora; nunca la ciudad ni la IP
  const z = req.headers.get("x-vercel-ip-timezone");
  const zonaConexion = z && /^[A-Za-z_]+(\/[A-Za-z0-9_+-]+){1,2}$/.test(z) ? z : null;
  return NextResponse.json({ nombre: u ? u.nombre.split(" ")[0] : null, zonaConexion }, { headers: { "Cache-Control": "no-store" } });
}
