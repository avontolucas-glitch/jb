import Link from "next/link";
import Grabado from "@/components/Grabado";
import TituloTinta from "@/components/TituloTinta";
import Estrellas from "@/components/Estrellas";
import Texto from "@/components/Marcador";
import EspacioFoto from "@/components/EspacioFoto";
import Epigrafe from "@/components/Epigrafe";
import Ornamento from "@/components/Ornamento";
import Precio from "@/components/Precio";
import { citas, conferencias, enVivo, inicio, libros, masterclass, precios, sitio } from "@/content/config";

export default async function Inicio({ searchParams }: { searchParams: Promise<{ sesion?: string }> }) {
  const { sesion } = await searchParams;
  return (
    <>
      {sesion === "cerrada" && (
        <p role="status" className="hondo border-b borde px-5 py-2 text-center text-sm texto-2">
          Cerraste la sesión.
        </p>
      )}

      <section className="relative overflow-hidden px-5 pt-12 pb-24 sm:pt-16 sm:pb-32">
        <Estrellas />
        <Grabado
          src="/grabados/observador-crema.webp"
          alt="Grabado: el Observador Eterno, un ojo radiante entre estrellas"
          ancho="min(82vw, 440px)"
          mira
          halo
          lento
        />
        <div className="relative mx-auto max-w-3xl text-center mt-6">
          <TituloTinta texto={sitio.nombre} desde={1.1} className="titulo text-5xl sm:text-7xl" />
          <p className="texto-2 mt-6 text-xl sm:text-2xl aparece" style={{ animationDelay: "1.8s" }}>
            {inicio.bajada}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center aparece" style={{ animationDelay: "2.3s" }}>
            <Link href="/en-vivo" className="boton boton-lleno llamado">
              Masterclass en vivo
            </Link>
            <Link href="/lista" className="boton">
              Sumate a la lista
            </Link>
          </div>
        </div>
      </section>

      <section className="hondo px-5 py-20 sm:py-28 border-t borde" aria-labelledby="quien">
        <div className="mx-auto max-w-5xl grid gap-12 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-center">
          <EspacioFoto className="max-w-sm w-full mx-auto revelar" />
          <div className="prosa revelar" style={{ ["--retardo" as string]: ".2s" }}>
            <h2 id="quien" className="titulo text-3xl mb-6">
              Quién es
            </h2>
            <Texto bloque>{inicio.quienEs}</Texto>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:py-28" aria-labelledby="envivo">
        <div className="mx-auto max-w-3xl">
          <h2 id="envivo" className="titulo text-3xl mb-4 revelar">
            {enVivo.titulo}
          </h2>
          <p className="text-xl prosa revelar">{enVivo.bajada}</p>
          <ul className="mt-10">
            <li aria-hidden="true" className="border-t borde trazo" />
            {enVivo.directos.map((d, i) => (
              <li key={d.id} className="border-b borde py-5 flex flex-col sm:flex-row sm:justify-between gap-1 revelar" style={{ ["--retardo" as string]: `${i * 0.15}s` }}>
                <span className="text-xl">{d.titulo}</span>
                <span className="texto-2 text-sm">{d.fecha}</span>
              </li>
            ))}
          </ul>
          <Link href="/en-vivo" className="boton mt-10 revelar">
            Ver los directos
          </Link>
        </div>
      </section>

      <section className="hondo px-5 py-20 sm:py-28 border-t borde" aria-labelledby="trilogia">
        <div className="mx-auto max-w-3xl">
          <h2 id="trilogia" className="titulo text-3xl mb-2 revelar">
            La trilogía
          </h2>
          <p className="texto-2 mb-10 revelar">Tres libros, tres preguntas sobre lo mismo.</p>
          <ol>
            <li aria-hidden="true" className="border-t borde trazo" />
            {libros.map((l, i) => (
              <li key={l.id} className="border-b borde revelar" style={{ ["--retardo" as string]: `${i * 0.18}s` }}>
                <Link href={`/libros#${l.id}`} className="fila group grid grid-cols-[3rem_1fr] sm:grid-cols-[4rem_1fr_auto] gap-x-4 py-7 items-baseline">
                  <span className="texto-2 text-xl">{l.numero}</span>
                  <span>
                    <span className="block text-2xl transition-[letter-spacing] duration-700 group-hover:tracking-wide">{l.titulo}</span>
                    <span className="texto-2 italic">{l.pregunta}</span>
                  </span>
                  <span className="col-start-2 sm:col-start-3 texto-2 text-sm mt-2 sm:mt-0">{l.estado}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-5 py-20 sm:py-28" aria-labelledby="mc">
        <div className="mx-auto max-w-3xl">
          <h2 id="mc" className="titulo text-3xl mb-6 revelar">
            {masterclass.titulo}
          </h2>
          <p className="text-xl prosa revelar">{inicio.propuesta}</p>
          <div className="mt-6 prosa revelar">
            <Texto bloque>{inicio.propuestaDetalle}</Texto>
          </div>
          <ul className="mt-8 space-y-2 prosa">
            {masterclass.incluye.map((item, i) => (
              <li key={item} className="flex gap-3 revelar" style={{ ["--retardo" as string]: `${i * 0.12}s` }}>
                <span aria-hidden="true" className="texto-2">·</span>
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap items-center gap-5 revelar">
            <Link href="/masterclass" className="boton">
              Ver la masterclass
            </Link>
            <span className="texto-2">
              <Precio {...precios.masterclass} />
            </span>
          </div>
        </div>
      </section>

      <section className="hondo px-5 py-20 sm:py-28 border-t borde" aria-labelledby="conf">
        <div className="mx-auto max-w-3xl">
          <h2 id="conf" className="titulo text-3xl mb-10 revelar">
            Conferencias
          </h2>
          <ul>
            <li aria-hidden="true" className="border-t borde trazo" />
            {conferencias.map((c, i) => (
              <li key={c.id} className="border-b borde py-5 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 revelar" style={{ ["--retardo" as string]: `${i * 0.15}s` }}>
                <Link href={`/conferencias/${c.id}`} className="fila text-xl">
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

      <section className="relative overflow-hidden px-5 py-24 sm:py-32 border-t borde">
        <div className="revelar">
          <Epigrafe cita={citas.observador} />
        </div>
        <Ornamento className="mt-12" />
        <div className="mt-12 text-center revelar">
          <Link href="/lista" className="boton">
            Avisame cuando haya novedades
          </Link>
        </div>
      </section>
    </>
  );
}
