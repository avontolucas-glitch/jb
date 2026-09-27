import Link from "next/link";
import type { Metadata } from "next";
import Apertura from "@/components/Apertura";
import Texto from "@/components/Marcador";
import Precio from "@/components/Precio";
import Epigrafe from "@/components/Epigrafe";
import Ornamento from "@/components/Ornamento";
import Calendario from "@/components/Calendario";
import SubnavMasterclass from "@/components/SubnavMasterclass";
import { usuarioActual } from "@/lib/auth";
import { fin, horarioDesdeId, horarios, ocupados } from "@/lib/sesiones";
import { citas, portadillas, precios, sesiones } from "@/content/config";

export const metadata: Metadata = { title: sesiones.titulo };
export const dynamic = "force-dynamic";

export default async function MasterclassUnoAUno() {
  const u = await usuarioActual();
  const tomados = await ocupados();
  const lista = await horarios();
  // tus encuentros que todavía no terminaron (también los de las próximas horas, que ya no se ofrecen al público)
  const ahora = Date.now();
  const mias = u
    ? [...tomados].filter(([id, uid]) => {
        const h = uid === u.id ? horarioDesdeId(id) : null;
        return h !== null && fin(h) > ahora;
      })
    : [];

  return (
    <>
      <Apertura titulo={sesiones.titulo} bajada={sesiones.bajada} {...portadillas.sesiones} />
      <SubnavMasterclass actual="uno" />

      <section className="hondo border-t borde px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="prosa revelar">
            <Texto bloque>{sesiones.descripcion}</Texto>
          </div>
          <h2 className="titulo text-3xl mt-14 mb-6 revelar">Cómo es</h2>
          <ol className="space-y-4 prosa text-lg">
            {[
              `${sesiones.modalidad}. ${sesiones.duracion}.`,
              "Elegís un horario libre y, si querés, contás en pocas líneas qué te gustaría trabajar.",
              "El link de la videollamada aparece en tu espacio: es solo para vos.",
            ].map((t, i) => (
              <li key={t} className="flex gap-4 revelar" style={{ ["--retardo" as string]: `${i * 0.12}s` }}>
                <span className="texto-2 w-5 shrink-0">{i + 1}</span>
                {t}
              </li>
            ))}
          </ol>
          <p className="texto-2 mt-8 revelar">
            <Precio {...precios.sesionPrivada} />
          </p>
        </div>
      </section>

      <section className="px-5 py-16 sm:py-20" aria-labelledby="horarios">
        <div className="mx-auto max-w-3xl">
          <h2 id="horarios" className="titulo text-3xl mb-2 revelar">
            Agendá tu encuentro
          </h2>
          <p className="texto-2 mb-8 revelar">
            Los horarios los carga Julián, en hora de Argentina. Acá los ves en tu hora, con la de él al lado.
          </p>
          {mias.length > 0 && (
            <p className="border borde p-4 mb-8" data-testid="ya-reservada">
              Ya tenés {mias.length === 1 ? "un encuentro reservado" : `${mias.length} encuentros reservados`}.{" "}
              <Link href="/mi-espacio/sesiones" className="enlace">
                {mias.length === 1 ? "Verlo" : "Verlos"} en tu espacio
              </Link>
            </p>
          )}
          <div className="revelar">
            <Calendario
              turnos={lista.map((h) => {
                const quien = tomados.get(h.id);
                return { id: h.id, inicio: h.fecha.toISOString(), estado: !quien ? "libre" : quien === u?.id ? "tuya" : "ocupado" };
              })}
            />
          </div>
          {!u && <p className="texto-2 text-sm mt-8">Para reservar necesitás una cuenta. Se crea en un minuto.</p>}
        </div>
      </section>

      <section className="hondo border-t borde px-5 py-20 text-center">
        <Epigrafe cita={citas.observador} />
        <Ornamento className="mt-12" />
      </section>
    </>
  );
}
