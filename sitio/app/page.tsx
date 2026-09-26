import Link from "next/link";
import Ojo, { OjoFantasma } from "@/components/Ojo";
import Texto from "@/components/Marcador";
import EspacioFoto from "@/components/EspacioFoto";
import Epigrafe from "@/components/Epigrafe";
import Ornamento from "@/components/Ornamento";
import Precio from "@/components/Precio";
import { citas, conferencias, inicio, libros, masterclass, precios, sitio } from "@/content/config";

export default async function Inicio({ searchParams }: { searchParams: Promise<{ sesion?: string }> }) {
  const { sesion } = await searchParams;
  return (
    <>
      {sesion === "cerrada" && (
        <p role="status" className="claro px-5 py-2 text-center text-sm">
          Cerraste la sesión.
        </p>
      )}

      <section className="relative overflow-hidden px-5 pt-20 pb-24 sm:pt-32 sm:pb-36">
        <OjoFantasma />
        <div className="relative mx-auto max-w-3xl text-center aparece">
          <Ojo size={40} className="mx-auto mb-8" />
          <h1 className="titulo text-5xl sm:text-7xl">{sitio.nombre}</h1>
          <p className="texto-2 mt-6 text-xl sm:text-2xl">{inicio.bajada}</p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/masterclass" className="boton boton-lleno">
              Conocé la masterclass
            </Link>
            <Link href="/lista" className="boton">
              Sumate a la lista
            </Link>
          </div>
        </div>
      </section>

      <section className="claro px-5 py-16 sm:py-24" aria-labelledby="quien">
        <div className="mx-auto max-w-5xl grid gap-10 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-center">
          <EspacioFoto className="max-w-sm w-full mx-auto" />
          <div className="prosa">
            <h2 id="quien" className="titulo text-3xl mb-6">
              Quién es
            </h2>
            <Texto bloque>{inicio.quienEs}</Texto>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:py-24" aria-labelledby="trilogia">
        <div className="mx-auto max-w-3xl">
          <h2 id="trilogia" className="titulo text-3xl mb-2">
            La trilogía
          </h2>
          <p className="texto-2 mb-10">Tres libros, tres preguntas sobre lo mismo.</p>
          <ol className="border-t borde">
            {libros.map((l) => (
              <li key={l.id} className="border-b borde">
                <Link href={`/libros#${l.id}`} className="group grid grid-cols-[3rem_1fr] sm:grid-cols-[4rem_1fr_auto] gap-x-4 py-6 items-baseline">
                  <span className="texto-2 text-xl">{l.numero}</span>
                  <span>
                    <span className="block text-2xl group-hover:underline underline-offset-4">{l.titulo}</span>
                    <span className="texto-2 italic">{l.pregunta}</span>
                  </span>
                  <span className="col-start-2 sm:col-start-3 texto-2 text-sm mt-2 sm:mt-0">{l.estado}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="claro px-5 py-16 sm:py-24" aria-labelledby="mc">
        <div className="mx-auto max-w-3xl">
          <h2 id="mc" className="titulo text-3xl mb-6">
            {masterclass.titulo}
          </h2>
          <p className="text-xl prosa">{inicio.propuesta}</p>
          <div className="mt-6 prosa">
            <Texto bloque>{inicio.propuestaDetalle}</Texto>
          </div>
          <ul className="mt-8 space-y-2 prosa">
            {masterclass.incluye.map((i) => (
              <li key={i} className="flex gap-3">
                <span aria-hidden="true" className="texto-2">·</span>
                {i}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap items-center gap-5">
            <Link href="/masterclass" className="boton boton-lleno">
              Ver la masterclass
            </Link>
            <span className="texto-2">
              <Precio {...precios.masterclass} />
            </span>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:py-24" aria-labelledby="conf">
        <div className="mx-auto max-w-3xl">
          <h2 id="conf" className="titulo text-3xl mb-10">
            Conferencias
          </h2>
          <ul className="border-t borde">
            {conferencias.map((c) => (
              <li key={c.id} className="border-b borde py-5 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                <Link href={`/conferencias/${c.id}`} className="text-xl hover:underline underline-offset-4">
                  {c.titulo}
                </Link>
                <span className="texto-2 text-sm">
                  {c.tipo === "abierta" ? "Gratis, con inscripción" : "Entrada simbólica"} · {c.fecha}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative overflow-hidden px-5 py-20 sm:py-28 border-t borde">
        <Epigrafe cita={citas.observador} />
        <Ornamento className="mt-12" />
        <div className="mt-12 text-center">
          <Link href="/lista" className="boton">
            Avisame cuando haya novedades
          </Link>
        </div>
      </section>
    </>
  );
}
