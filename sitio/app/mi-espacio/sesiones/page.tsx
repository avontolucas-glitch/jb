import Link from "next/link";
import Hora from "@/components/Hora";
import { miembro } from "@/lib/miembro";
import { leer } from "@/lib/db";
import { fin, horarioDesdeId } from "@/lib/sesiones";
import { eventoDeReserva, linkGoogleCalendar, linkSala } from "@/lib/ics";
import SinAcceso from "@/components/SinAcceso";
import { sesiones } from "@/content/config";

type Nota = { usuario: string; horario: string; nota: string };

export default async function MisSesiones({ searchParams }: { searchParams: Promise<{ compra?: string }> }) {
  const { u, a } = await miembro();
  const { compra } = await searchParams;
  const mias = a.sesiones
    .map((id) => horarioDesdeId(id))
    .filter((h): h is NonNullable<typeof h> => !!h)
    .sort((x, y) => x.fecha.getTime() - y.fecha.getTime());
  if (mias.length === 0)
    return (
      <>
        <h1 className="titulo text-4xl mb-8">{sesiones.titulo}</h1>
        <SinAcceso que="Acá aparecen tus encuentros 1 a 1 con Julián, con el link para entrar." href="/masterclass/1-a-1" boton="Ver horarios" />
      </>
    );
  const notas = (await leer<Nota[]>("notas_sesion")).filter((n) => n.usuario === u.id);
  const ahora = Date.now();
  return (
    <>
      {compra === "ok" && (
        <p role="status" className="border borde p-4 mb-8" data-testid="compra-ok">
          Listo, tu encuentro está reservado.
        </p>
      )}
      <h1 className="titulo text-4xl">{sesiones.titulo}</h1>
      <ul className="border-t borde mt-8">
        {mias.map((h) => {
          // el link sigue a la vista hasta que termina el encuentro: quien llega tarde tiene con qué entrar
          const pasada = fin(h) < ahora;
          const nota = notas.filter((n) => n.horario === h.id).at(-1)?.nota;
          return (
            <li key={h.id} className={`border-b borde py-6 ${pasada ? "opacity-60" : ""}`} data-testid={`mi-sesion-${h.id}`}>
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
            </li>
          );
        })}
      </ul>
      <p className="texto-2 text-sm mt-10">
        Si no podés asistir, avisá con tiempo:{" "}
        <Link href="/legales/reembolsos" className="enlace">
          política de reembolsos
        </Link>
        .
      </p>
    </>
  );
}
