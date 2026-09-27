import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { miembro } from "@/lib/miembro";
import { esAdmin, usuarios } from "@/lib/auth";
import { reservasFuturas } from "@/lib/agenda";
import { agendaCompleta, hoyEnArgentina } from "@/lib/sesiones";
import { linkSala } from "@/lib/ics";
import { AgendaEditable } from "@/components/CalendarioAgenda";
import { sesiones } from "@/content/config";

export const metadata: Metadata = { title: "Agenda", robots: { index: false } };
export const dynamic = "force-dynamic";

/** Panel de Julián: reservas, horarios y el calendario de la Masterclass 1 a 1. Solo para su cuenta. */
export default async function Agenda() {
  const { u } = await miembro();
  if (!esAdmin(u)) notFound();
  const [reservas, agenda, gente] = await Promise.all([reservasFuturas(), agendaCompleta(), usuarios()]);
  const nombres = new Map(gente.map((g) => [g.id, g.nombre]));
  const ahora = new Date();
  const hoy = hoyEnArgentina(ahora);
  const hasta = hoyEnArgentina(new Date(ahora.getTime() + 365 * 864e5));

  return (
    <div data-testid="agenda-panel">
      <h1 className="titulo text-4xl">Agenda</h1>
      <p className="texto-2 text-lg mt-3">
        {sesiones.titulo}: tus horarios y las reservas, en {sesiones.zonaHoraria}.
      </p>

      <section className="mt-12" aria-labelledby="reservas">
        <div className="flex flex-wrap items-baseline justify-between gap-4 mb-4">
          <h2 id="reservas" className="text-2xl">
            Próximas reservas
          </h2>
          {reservas.length > 0 && (
            <div className="sm:text-right">
              <a href="/api/agenda.ics" className="boton boton-chico" data-testid="agenda-ics">
                Bajar las reservas a mi calendario
              </a>
              <p className="texto-2 text-xs mt-2">Si entra una reserva nueva, bajalo de nuevo.</p>
            </div>
          )}
        </div>
        {reservas.length === 0 ? (
          <p className="texto-2 border-t borde pt-5">Todavía no hay reservas.</p>
        ) : (
          <ul className="border-t borde">
            {reservas.map((r) => (
              <li key={r.horario.id} className="border-b borde py-6" data-testid={`reserva-${r.horario.id}`}>
                <p className="text-xl first-letter:uppercase">{r.horario.dia}</p>
                <p className="texto-2 mt-1">{r.horario.hora} h</p>
                <p className="mt-3">
                  {r.nombre}
                  {r.email && (
                    <>
                      {" · "}
                      <a href={`mailto:${r.email}`} className="enlace break-all">
                        {r.email}
                      </a>
                    </>
                  )}
                </p>
                {r.nota ? (
                  <div className="mt-3">
                    <p className="texto-2 text-sm">Lo que contó:</p>
                    <p className="whitespace-pre-line mt-1 italic">{r.nota}</p>
                  </div>
                ) : (
                  <p className="texto-2 text-sm mt-3">No dejó nota.</p>
                )}
                <p className="text-sm mt-3">
                  <a href={linkSala(r.horario.id)} className="enlace break-all" target="_blank" rel="noopener" data-testid={`sala-${r.horario.id}`}>
                    Entrar a la sala
                  </a>
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <AgendaEditable
        hoy={hoy}
        hasta={hasta}
        turnos={agenda.map((h) => ({
          id: h.id,
          dia: h.dia,
          hora: h.hora,
          estado: h.estado,
          origen: h.origen,
          quien: h.usuario ? nombres.get(h.usuario) : undefined,
        }))}
      />
    </div>
  );
}
