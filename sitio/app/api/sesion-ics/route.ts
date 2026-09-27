import { NextResponse, type NextRequest } from "next/server";
import { usuarioActual } from "@/lib/auth";
import { horarioDesdeId, ocupados } from "@/lib/sesiones";
import { limitarRuta } from "@/lib/proteger";
import { calendario, eventoDeReserva, respuestaIcs } from "@/lib/ics";

export const dynamic = "force-dynamic";
const sinCache = { "Cache-Control": "no-store" };

/** El evento de una reserva, para el calendario del teléfono. Solo para quien la reservó. */
export async function GET(req: NextRequest) {
  const u = await usuarioActual();
  const limite = await limitarRuta("apiIcs", req, { cuenta: u?.id, demo: u?.demo });
  if (limite) return limite;
  // sin sesión, a ingresar (y de vuelta a sus encuentros): nunca un archivo roto
  if (!u) return NextResponse.redirect(new URL("/ingresar?aviso=sesion&volver=/mi-espacio/sesiones", req.url), { headers: sinCache });
  const id = req.nextUrl.searchParams.get("id") ?? "";
  const h = horarioDesdeId(id);
  // Si no es tuya (o no existe), no se dice nada más: no se revela quién reservó qué.
  if (!h || (await ocupados()).get(id) !== u.id) return NextResponse.json({ error: "no-encontrada" }, { status: 404, headers: sinCache });
  const ics = calendario([eventoDeReserva(h)]);
  return respuestaIcs(ics, `masterclass-1-a-1-${id}.ics`);
}
