import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { miembro } from "@/lib/miembro";
import { esAdmin, usuarios } from "@/lib/auth";
import { reservasFuturas } from "@/lib/agenda";
import { agendaCompleta, horarioDesdeId, hoyEnArgentina, textoReserva } from "@/lib/sesiones";
import { accionLiberar } from "@/lib/acciones-reservas";
import { linkSala } from "@/lib/ics";
import { AgendaEditable } from "@/components/CalendarioAgenda";
import { sesiones } from "@/content/config";

export const metadata: Metadata = { title: "Agenda", robots: { index: false } };
export const dynamic = "force-dynamic";

/** Panel de Julián: reservas, horarios y el calendario de la Masterclass 1 a 1. Solo para su cuenta. */
export default async function Agenda({ searchParams }: { searchParams: Promise<{ liberar?: string; liberada?: string; error?: string }> }) {
  const { u } = await miembro();
  if (!esAdmin(u)) notFound();
  const sp = await searchParams;
  const liberada = sp.liberada ? horarioDesdeId(sp.liberada) : null;
  const error = textoReserva(sp.error);
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
        <div aria-live="polite">
          {liberada && (
            <div role="status" className="border borde p-4 mb-6" data-testid="liberada-ok">
              <p>
                Liberaste {liberada.etiqueta}: la reserva quedó cancelada y se le devuelve el total, por el mismo medio con el que pagó (en este
                prototipo, simulado).
              </p>
              <p className="texto-2 text-sm mt-2">
                El horario quedó libre para otra persona. Si no vas a poder, bloquealo en el calendario de abajo.
              </p>
            </div>
          )}
          {error && (
            <p role="alert" className="border-l-2 pl-3 mb-6" style={{ borderColor: "currentColor" }} data-testid="reserva-error">
              {error}
            </p>
          )}
        </div>
        {reservas.length === 0 ? (
          <p className="texto-2 border-t borde pt-5">Todavía no hay reservas.</p>
        ) : (
          <ul className="border-t borde">
            {reservas.map((r) => (
              <li key={r.horario.id} id={`reserva-${r.horario.id}`} className="border-b borde py-6" data-testid={`reserva-${r.horario.id}`}>
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
                {/* Liberar: cancela la reserva con reembolso total (cancela Julián). Pide confirmación antes. */}
                {sp.liberar === r.horario.id ? (
                  <div className="mt-4 border borde p-4" role="group" aria-labelledby={`liberar-${r.horario.id}`} data-testid="confirmar-liberacion">
                    <p id={`liberar-${r.horario.id}`}>¿Liberás este horario?</p>
                    <p className="texto-2 text-sm mt-2">
                      Se cancela la reserva de {r.nombre} y se le devuelve el total, por el mismo medio con el que pagó. Conviene avisarle antes.
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <form action={accionLiberar}>
                        <input type="hidden" name="id" value={r.horario.id} />
                        <button type="submit" className="boton boton-chico" data-testid="confirmar-liberar">
                          Sí, liberar
                        </button>
                      </form>
                      <Link href={`/mi-espacio/agenda#reserva-${r.horario.id}`} className="boton boton-chico">
                        No, dejarla
                      </Link>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4">
                    <Link
                      href={`/mi-espacio/agenda?liberar=${encodeURIComponent(r.horario.id)}#reserva-${r.horario.id}`}
                      className="boton boton-chico"
                      data-testid={`liberar-${r.horario.id}`}
                    >
                      Liberar
                    </Link>
                  </p>
                )}
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
