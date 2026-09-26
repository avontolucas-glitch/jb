import Link from "next/link";
import { miembro } from "@/lib/miembro";
import { leer } from "@/lib/db";
import { horarioDesdeId } from "@/lib/sesiones";
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
        <h1 className="titulo text-4xl mb-8">Sesiones privadas</h1>
        <SinAcceso que="Acá aparecen tus sesiones 1 a 1 con Julián, con el link para entrar." href="/sesiones" boton="Ver horarios" />
      </>
    );
  const notas = (await leer<Nota[]>("notas_sesion")).filter((n) => n.usuario === u.id);
  const ahora = Date.now();
  return (
    <>
      {compra === "ok" && (
        <p role="status" className="border borde p-4 mb-8" data-testid="compra-ok">
          Listo, tu sesión está reservada.
        </p>
      )}
      <h1 className="titulo text-4xl">Sesiones privadas</h1>
      <ul className="border-t borde mt-8">
        {mias.map((h) => {
          const pasada = h.fecha.getTime() < ahora;
          const nota = notas.filter((n) => n.horario === h.id).at(-1)?.nota;
          return (
            <li key={h.id} className={`border-b borde py-6 ${pasada ? "opacity-60" : ""}`} data-testid={`mi-sesion-${h.id}`}>
              <h2 className="text-2xl first-letter:uppercase">{h.dia}</h2>
              <p className="texto-2 mt-1">
                {h.hora} h, {sesiones.zonaHoraria} · {sesiones.modalidad}
              </p>
              {!pasada && (
                <p className="mt-4">
                  Link de la videollamada:{" "}
                  <a href={`${sesiones.linkSala}${h.id}`} className="enlace break-all" data-testid="link-sesion">
                    {`${sesiones.linkSala}${h.id}`}
                  </a>
                </p>
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
