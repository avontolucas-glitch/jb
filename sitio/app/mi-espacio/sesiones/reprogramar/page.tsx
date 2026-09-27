import Link from "next/link";
import type { Metadata } from "next";
import Hora from "@/components/Hora";
import Calendario from "@/components/Calendario";
import { miembro } from "@/lib/miembro";
import { HORAS_CAMBIO, horarioDesdeId, horarios, ocupados, sePuedeCambiar, textoReserva, TEXTOS_RESERVA } from "@/lib/sesiones";
import { accionReprogramar } from "@/lib/acciones-reservas";
import { sesiones } from "@/content/config";
import { CONTACTO } from "@/content/legales";

export const metadata: Metadata = { title: "Reprogramar", robots: { index: false } };
export const dynamic = "force-dynamic";

const Volver = () => (
  <p className="mt-8">
    <Link href="/mi-espacio/sesiones" className="enlace">
      Volver a tus encuentros
    </Link>
  </p>
);

/**
 * Reprogramar un encuentro de la Masterclass 1 a 1: el calendario con los
 * horarios libres y, al elegir uno (?a=…), la confirmación del cambio. El cambio
 * lo hace accionReprogramar (lib/acciones-reservas.ts), en un solo paso.
 */
export default async function Reprogramar({ searchParams }: { searchParams: Promise<{ id?: string; a?: string; error?: string }> }) {
  const { u } = await miembro();
  const { id = "", a, error } = await searchParams;
  const viejo = horarioDesdeId(id);
  const tomados = await ocupados();

  const titulo = <h1 className="titulo text-4xl">Reprogramar tu encuentro</h1>;
  if (!viejo || tomados.get(id) !== u.id) {
    return (
      <>
        {titulo}
        <p className="mt-6" data-testid="reprogramar-no">
          {TEXTOS_RESERVA.ajena}
        </p>
        <Volver />
      </>
    );
  }
  const ahoraEs = <Hora inicio={viejo.fecha.toISOString()} />;
  if (!sePuedeCambiar(viejo)) {
    return (
      <>
        {titulo}
        <p className="texto-2 text-lg mt-3">Tu encuentro: {ahoraEs}</p>
        <p className="mt-6" data-testid="sin-cambios">
          Faltan menos de {HORAS_CAMBIO} horas para este encuentro: ya no se puede reprogramar desde acá. Para cualquier cambio, escribí a {CONTACTO}.
        </p>
        <Volver />
      </>
    );
  }

  const lista = await horarios();
  const nuevo = a ? (lista.find((h) => h.id === a && !tomados.has(h.id)) ?? null) : null;
  const aviso = textoReserva(error) ?? (a && !nuevo ? TEXTOS_RESERVA.agenda : null);

  return (
    <>
      {titulo}
      <p className="texto-2 text-lg mt-3" data-testid="encuentro-actual">
        Ahora: {ahoraEs}
      </p>

      {aviso && (
        <p role="alert" className="border-l-2 pl-3 mt-8" style={{ borderColor: "currentColor" }} data-testid="reserva-error">
          {aviso}
        </p>
      )}

      {nuevo ? (
        <section className="mt-10 border borde p-5" aria-labelledby="confirmar" data-testid="confirmar-reprogramacion">
          <h2 id="confirmar" className="text-2xl">
            ¿Lo pasamos a este horario?
          </h2>
          <dl className="mt-5 border-t borde">
            <div className="border-b borde py-3 flex flex-wrap justify-between gap-x-4 gap-y-1">
              <dt className="texto-2">Antes</dt>
              <dd className="text-right">
                <Hora inicio={viejo.fecha.toISOString()} />
              </dd>
            </div>
            <div className="border-b borde py-3 flex flex-wrap justify-between gap-x-4 gap-y-1">
              <dt className="texto-2">Ahora</dt>
              <dd className="text-right" data-testid="horario-nuevo">
                <Hora inicio={nuevo.fecha.toISOString()} />
              </dd>
            </div>
          </dl>
          <p className="texto-2 text-sm mt-4">El horario de antes queda libre para otra persona. Lo que contaste para el encuentro pasa al nuevo.</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <form action={accionReprogramar}>
              <input type="hidden" name="id" value={viejo.id} />
              <input type="hidden" name="a" value={nuevo.id} />
              <button type="submit" className="boton boton-lleno" data-testid="confirmar-reprogramar">
                Confirmar el cambio
              </button>
            </form>
            <Link href={`/mi-espacio/sesiones/reprogramar?id=${encodeURIComponent(viejo.id)}`} className="boton">
              Elegir otro horario
            </Link>
          </div>
        </section>
      ) : (
        <section className="mt-10" aria-labelledby="elegir">
          <h2 id="elegir" className="text-2xl mb-2">
            Elegí el horario nuevo
          </h2>
          <p className="texto-2 mb-8">
            Los horarios los carga Julián, en {sesiones.zonaHoraria}. Acá los ves en tu hora, con la de él al lado. Tu encuentro de ahora figura como
            «tu encuentro».
          </p>
          <Calendario
            reprogramar={viejo.id}
            turnos={[...lista, ...(lista.some((h) => h.id === viejo.id) ? [] : [viejo])].map((h) => {
              const quien = tomados.get(h.id);
              return { id: h.id, inicio: h.fecha.toISOString(), estado: !quien ? "libre" : quien === u.id ? "tuya" : "ocupado" };
            })}
          />
        </section>
      )}
      <Volver />
    </>
  );
}
