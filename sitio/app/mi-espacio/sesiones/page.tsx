import Link from "next/link";
import Hora from "@/components/Hora";
import { miembro } from "@/lib/miembro";
import { leer } from "@/lib/db";
import { HORAS_CAMBIO, fin, horarioDesdeId, reservasDe, sePuedeCambiar, textoReserva } from "@/lib/sesiones";
import { accionCancelar } from "@/lib/acciones-reservas";
import { eventoDeReserva, linkGoogleCalendar, linkSala } from "@/lib/ics";
import SinAcceso from "@/components/SinAcceso";
import { sesiones } from "@/content/config";
import { CONTACTO } from "@/content/legales";

type Nota = { usuario: string; horario: string; nota: string };
type Params = { compra?: string; cancelar?: string; cancelada?: string; reprogramada?: string; error?: string };

/** Los avisos de arriba: lo que acaba de pasar (reservar, reprogramar, cancelar) o lo que salió mal. */
function Avisos({ sp }: { sp: Params }) {
  const reprogramada = sp.reprogramada ? horarioDesdeId(sp.reprogramada) : null;
  const cancelada = sp.cancelada ? horarioDesdeId(sp.cancelada) : null;
  const error = textoReserva(sp.error);
  return (
    <>
      {sp.compra === "ok" && (
        <p role="status" className="border borde p-4 mb-8" data-testid="compra-ok">
          Listo, tu encuentro está reservado.
        </p>
      )}
      {reprogramada && (
        <p role="status" className="border borde p-4 mb-8" data-testid="reprogramada-ok">
          Listo, tu encuentro pasó al <Hora inicio={reprogramada.fecha.toISOString()} />.
        </p>
      )}
      {cancelada && (
        <div role="status" className="border borde p-4 mb-8" data-testid="cancelada-ok">
          <p>
            Cancelaste tu encuentro del <Hora inicio={cancelada.fecha.toISOString()} />. El horario quedó libre.
          </p>
          <p className="texto-2 text-sm mt-2">
            Te devolvemos el total por el mismo medio con el que pagaste. En este prototipo el pago y el reembolso son simulados.
          </p>
        </div>
      )}
      {error && (
        <p role="alert" className="border-l-2 pl-3 mb-8" style={{ borderColor: "currentColor" }} data-testid="reserva-error">
          {error}
        </p>
      )}
    </>
  );
}

export default async function MisSesiones({ searchParams }: { searchParams: Promise<Params> }) {
  const { u } = await miembro();
  const sp = await searchParams;
  // las reservas en pie (sin las canceladas), también las que ya pasaron
  const mias = await reservasDe(u.id);
  if (mias.length === 0)
    return (
      <>
        <Avisos sp={sp} />
        <h1 className="titulo text-4xl mb-8">{sesiones.titulo}</h1>
        <SinAcceso que="Acá aparecen tus encuentros 1 a 1 con Julián, con el link para entrar." href="/masterclass/1-a-1" boton="Ver horarios" />
      </>
    );
  const notas = (await leer<Nota[]>("notas_sesion")).filter((n) => n.usuario === u.id);
  const ahora = new Date();
  return (
    <>
      <Avisos sp={sp} />
      <h1 className="titulo text-4xl">{sesiones.titulo}</h1>
      <ul className="border-t borde mt-8">
        {mias.map((h) => {
          // el link sigue a la vista hasta que termina el encuentro: quien llega tarde tiene con qué entrar
          const pasada = fin(h) < ahora.getTime();
          const empezo = h.fecha <= ahora;
          const cambiable = sePuedeCambiar(h, ahora);
          const confirmando = cambiable && sp.cancelar === h.id;
          const nota = notas.filter((n) => n.horario === h.id).at(-1)?.nota;
          return (
            <li key={h.id} id={`sesion-${h.id}`} className={`border-b borde py-6 ${pasada ? "opacity-60" : ""}`} data-testid={`mi-sesion-${h.id}`}>
              <h2 className="text-2xl">
                <Hora inicio={h.fecha.toISOString()} parte="dia" />
              </h2>
              <p className="mt-1">
                <Hora inicio={h.fecha.toISOString()} parte="hora" />
                <span className="texto-2"> · {sesiones.modalidad}</span>
              </p>
              {!pasada && (
                <p className="mt-4">
                  Link de la videollamada:{" "}
                  <a href={linkSala(h.id)} className="enlace break-all" data-testid="link-sesion">
                    {linkSala(h.id)}
                  </a>
                </p>
              )}
              {!pasada && (
                <div className="mt-4">
                  <p className="flex flex-wrap gap-3">
                    <a href={`/api/sesion-ics?id=${encodeURIComponent(h.id)}`} className="boton boton-chico" data-testid="agregar-calendario">
                      Agregar a mi calendario
                    </a>
                    <a
                      href={linkGoogleCalendar(eventoDeReserva(h))}
                      className="boton boton-chico"
                      target="_blank"
                      rel="noopener"
                      data-testid="google-calendar"
                    >
                      Google Calendar
                    </a>
                  </p>
                  <p className="texto-2 text-xs mt-2">En Android, usá Google Calendar.</p>
                </div>
              )}
              {nota && (
                <div className="mt-4">
                  <p className="texto-2 text-sm">Lo que contaste:</p>
                  <p className="whitespace-pre-line mt-1 italic">{nota}</p>
                </div>
              )}

              {/* Reprogramar o cancelar: solo con más de HORAS_CAMBIO horas de aviso (la política de reembolsos) */}
              {confirmando ? (
                <div className="mt-6 border borde p-4" role="group" aria-labelledby={`cancelar-${h.id}`} data-testid="confirmar-cancelacion">
                  <p id={`cancelar-${h.id}`}>¿Cancelás este encuentro?</p>
                  <p className="texto-2 text-sm mt-2">
                    El horario queda libre para otra persona y te devolvemos el total, por el mismo medio con el que pagaste.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <form action={accionCancelar}>
                      <input type="hidden" name="id" value={h.id} />
                      <button type="submit" className="boton boton-chico" data-testid="confirmar-cancelar">
                        Sí, cancelar
                      </button>
                    </form>
                    <Link href={`/mi-espacio/sesiones#sesion-${h.id}`} className="boton boton-chico" data-testid="no-cancelar">
                      No, lo mantengo
                    </Link>
                  </div>
                </div>
              ) : cambiable ? (
                <p className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/mi-espacio/sesiones/reprogramar?id=${encodeURIComponent(h.id)}`}
                    className="boton boton-chico"
                    data-testid="reprogramar"
                  >
                    Reprogramar
                  </Link>
                  <Link
                    href={`/mi-espacio/sesiones?cancelar=${encodeURIComponent(h.id)}#sesion-${h.id}`}
                    className="boton boton-chico"
                    data-testid="cancelar"
                  >
                    Cancelar
                  </Link>
                </p>
              ) : (
                !empezo && (
                  <p className="texto-2 text-sm mt-6" data-testid="sin-cambios">
                    Faltan menos de {HORAS_CAMBIO} horas para este encuentro: ya no se puede reprogramar ni cancelar desde acá. Para cualquier cambio,
                    escribí a {CONTACTO}.
                  </p>
                )
              )}
            </li>
          );
        })}
      </ul>
      <p className="texto-2 text-sm mt-10">
        Podés reprogramar o cancelar sin costo hasta {HORAS_CAMBIO} horas antes del encuentro. Más detalles en la{" "}
        <Link href="/legales/reembolsos" className="enlace">
          política de reembolsos
        </Link>
        .
      </p>
    </>
  );
}
