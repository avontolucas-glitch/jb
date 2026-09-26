import Link from "next/link";
import Grabado from "@/components/Grabado";
import TituloTinta from "@/components/TituloTinta";
import Estrellas from "@/components/Estrellas";
import Divisor from "@/components/Divisor";
import Trazo from "@/components/Trazo";
import MarcasImprenta from "@/components/MarcasImprenta";
import EspacioFoto from "@/components/EspacioFoto";
import Epigrafe from "@/components/Epigrafe";
import Ornamento from "@/components/Ornamento";
import Precio from "@/components/Precio";
import { citas, conferencias, enVivo, inicio, libros, precios, sesiones, sitio } from "@/content/config";

/** 2026 → MMXXVI, como en los colofones. */
function romano(n: number) {
  const t: [number, string][] = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let r = "";
  for (const [v, l] of t) while (n >= v) (r += l), (n -= v);
  return r;
}

export default async function Inicio({ searchParams }: { searchParams: Promise<{ sesion?: string }> }) {
  const { sesion } = await searchParams;
  return (
    <>
      {sesion === "cerrada" && (
        <p role="status" className="hondo border-b borde px-5 py-2 text-center text-sm texto-2">
          Cerraste la sesión.
        </p>
      )}

      {/* Portada: compuesta como la portadilla de un libro impreso */}
      <section className="portada">
        <MarcasImprenta />
        <Estrellas />
        <div className="relative mx-auto max-w-6xl px-6 sm:px-10 pt-10 pb-28 sm:pt-14 lg:pt-20 lg:pb-36 grid gap-10 lg:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] items-center">
          <div className="lg:order-2 lg:pl-6">
            <Grabado
              src="/grabados/observador-crema.webp"
              alt="Grabado: el Observador Eterno, un ojo radiante entre estrellas"
              ancho="min(78vw, 470px)"
              className="lamina"
              mira
              halo
              lento
              pasada
            />
            <p className="texto-2 text-xs mt-4 text-center lg:text-right lg:pr-3 italic aparece" style={{ animationDelay: "4.6s" }}>
              El Observador Eterno · El Pensamiento es Tu Fe, cap. 2
            </p>
          </div>

          <div className="lg:order-1 lg:-mt-6">
            <p className="firma texto-2 text-xs aparece" style={{ animationDelay: "1.2s" }}>
              {sitio.editorial} · {romano(sitio.anio)}
            </p>
            <TituloTinta
              texto={sitio.nombre}
              lineas={[{ texto: sitio.nombre.split(" ")[0] }, { texto: sitio.nombre.split(" ").slice(1).join(" "), sangria: "0.9em" }]}
              desde={1.7}
              paso={0.075}
              className="titulo imprenta-tipo text-[3.4rem] leading-[0.98] sm:text-7xl lg:text-[5.6rem] mt-5"
            />
            <Trazo ancho={250} semilla={19} retardo={2.9} className="mt-7 texto-2" />
            <p className="mt-6 text-xl sm:text-2xl italic max-w-md aparece" style={{ animationDelay: "3.2s" }}>
              {inicio.bajada}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4 aparece" style={{ animationDelay: "3.7s" }}>
              <Link href="/masterclass" className="boton boton-lleno llamado">
                Masterclass en vivo
              </Link>
              <Link href="/lista" className="enlace texto-2">
                o sumate a la lista
              </Link>
            </div>
          </div>
        </div>

        <p className="margen texto-2 absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 hidden md:block aparece" style={{ animationDelay: "4.3s" }} aria-hidden="true">
          {libros.map((l) => l.pregunta).join("   ·   ")}
        </p>
        <p className="folio texto-2 absolute bottom-9 left-0 right-0 text-center aparece" style={{ animationDelay: "4.3s" }} aria-hidden="true">
          · I ·
        </p>
        <span className="bajar" aria-hidden="true" style={{ bottom: "4.9rem" }} />
      </section>

      <section className="hondo px-5 py-20 sm:py-28 border-t borde" aria-labelledby="quien">
        <div className="mx-auto max-w-5xl grid gap-12 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-center">
          <EspacioFoto className="max-w-sm w-full mx-auto revelar cortina" />
          <div className="prosa revelar" style={{ ["--retardo" as string]: ".2s" }}>
            <h2 id="quien" className="titulo text-3xl mb-6">
              Quién es
            </h2>
            <div className="prosa space-y-4 text-lg" data-testid="quien-es">
              {inicio.quienEs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <ol className="mt-8 border-t borde">
              {inicio.trayectoria.map((t, i) => (
                <li key={t.hecho} className="border-b borde py-2.5 grid grid-cols-[3.5rem_1fr] gap-3 revelar" style={{ ["--retardo" as string]: `${i * 0.08}s` }}>
                  <span className="texto-2 cifras">{t.anio}</span>
                  <span>{t.hecho}</span>
                </li>
              ))}
            </ol>
            <p className="texto-2 text-xs mt-4 italic">{inicio.quienEsNota}</p>
          </div>
        </div>
      </section>

      <Divisor />
      <section className="px-5 pb-20 sm:pb-28" aria-labelledby="envivo">
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
          <Link href="/masterclass" className="boton mt-10 revelar">
            Ver los directos
          </Link>
        </div>
      </section>

      <section className="hondo px-5 py-20 sm:py-28 border-t borde" aria-labelledby="sesiones">
        <div className="mx-auto max-w-3xl">
          <h2 id="sesiones" className="titulo text-3xl mb-4 revelar">
            {sesiones.titulo}
          </h2>
          <p className="text-xl prosa revelar">{sesiones.bajada}</p>
          <div className="mt-10 flex flex-wrap items-center gap-5 revelar">
            <Link href="/sesiones" className="boton">
              Agendar una sesión
            </Link>
            <span className="texto-2">
              <Precio {...precios.sesionPrivada} />
            </span>
          </div>
        </div>
      </section>

      <Divisor />
      <section className="px-5 pb-20 sm:pb-28" aria-labelledby="trilogia">
        <div className="mx-auto max-w-3xl">
          <h2 id="trilogia" className="titulo text-3xl mb-2 revelar">
            La trilogía
          </h2>
          <p className="texto-2 mb-10 revelar">Tres libros, tres preguntas sobre lo mismo. Impresos, y para leer online acá o en la app.</p>
          <ol>
            <li aria-hidden="true" className="border-t borde trazo" />
            {libros.map((l, i) => (
              <li key={l.id} className="border-b borde revelar" style={{ ["--retardo" as string]: `${i * 0.18}s` }}>
                <Link href={`/libros#${l.id}`} className="fila group grid grid-cols-[3rem_1fr] sm:grid-cols-[4rem_1fr_auto] gap-x-4 py-7 items-baseline">
                  <span className="texto-2 text-xl">{l.numero}</span>
                  <span>
                    <span className="block texto-2 italic">{l.pregunta}</span>
                    <span className="despues block text-2xl transition-[letter-spacing] duration-700 group-hover:tracking-wide">{l.titulo}</span>
                  </span>
                  <span className="col-start-2 sm:col-start-3 texto-2 text-sm mt-2 sm:mt-0">{l.estado}</span>
                </Link>
              </li>
            ))}
          </ol>
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
