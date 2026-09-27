import { NextResponse, type NextRequest } from "next/server";
import { esAdmin, usuarioActual } from "@/lib/auth";
import { reservasFuturas } from "@/lib/agenda";
import { limitarRuta } from "@/lib/proteger";
import { calendario, linkSala, respuestaIcs } from "@/lib/ics";
import { sesiones } from "@/content/config";

export const dynamic = "force-dynamic";

/** Todas las reservas que vienen, para el calendario de Julián. Solo para su cuenta. */
export async function GET(req: NextRequest) {
  const u = await usuarioActual();
  const limite = await limitarRuta("apiIcs", req, { cuenta: u?.id, demo: u?.demo });
  if (limite) return limite;
  const sinCache = { "Cache-Control": "no-store" };
  if (!u) return NextResponse.redirect(new URL("/ingresar?aviso=sesion&volver=/mi-espacio/agenda", req.url), { headers: sinCache });
  if (!esAdmin(u)) return NextResponse.json({ error: "no-encontrada" }, { status: 404, headers: sinCache });
  const eventos = (await reservasFuturas()).map((r) => {
    const sala = linkSala(r.horario.id);
    return {
      horario: r.horario,
      resumen: `${sesiones.titulo} · ${r.nombre}`,
      descripcion: [`${r.nombre} (${r.email})`, r.nota ? `Lo que contó: ${r.nota}` : "", `Link de la videollamada: ${sala}`].filter(Boolean).join("\n\n"),
      url: sala,
    };
  });
  return respuestaIcs(calendario(eventos, `Agenda · ${sesiones.titulo}`), "agenda-masterclass-1-a-1.ics");
}
