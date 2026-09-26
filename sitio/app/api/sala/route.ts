import { NextResponse, type NextRequest } from "next/server";
import { usuarioActual } from "@/lib/auth";
import { accesos } from "@/lib/access";
import { abrirSala, turnoVigente } from "@/lib/salas";
import { permisoReproduccion } from "@/lib/streaming";

export const dynamic = "force-dynamic";
const sinCache = { "Cache-Control": "no-store" };

/** Abrir la sala: da un turno nuevo (la otra pantalla, si había, se pausa) y el permiso firmado. */
export async function POST(req: NextRequest) {
  const u = await usuarioActual();
  if (!u) return NextResponse.json({ error: "sesion" }, { status: 401, headers: sinCache });
  const { directo } = (await req.json().catch(() => ({}))) as { directo?: string };
  if (!directo || !(await accesos(u.id)).directos.includes(directo))
    return NextResponse.json({ error: "sin-acceso" }, { status: 403, headers: sinCache });
  const turno = await abrirSala(u.id, directo);
  const permiso = await permisoReproduccion(u.id, directo);
  return NextResponse.json({ turno, permiso }, { headers: sinCache });
}

/** La sala pregunta cada tanto si su turno sigue siendo el vigente. */
export async function GET(req: NextRequest) {
  const u = await usuarioActual();
  if (!u) return NextResponse.json({ vigente: false }, { status: 401, headers: sinCache });
  const directo = req.nextUrl.searchParams.get("directo") ?? "";
  const turno = req.nextUrl.searchParams.get("turno") ?? "";
  return NextResponse.json({ vigente: await turnoVigente(u.id, directo, turno) }, { headers: sinCache });
}
