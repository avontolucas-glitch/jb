import { NextResponse } from "next/server";
import { usuarioActual } from "@/lib/auth";
import { limitarRuta } from "@/lib/proteger";

/** Si hay sesión y el nombre de pila, para que Yo Da salude y sepa si puede ayudar con temas de la cuenta. */
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const limite = await limitarRuta("apiYo", req);
  if (limite) return limite;
  const u = await usuarioActual();
  return NextResponse.json({ nombre: u ? u.nombre.split(" ")[0] : null }, { headers: { "Cache-Control": "no-store" } });
}
