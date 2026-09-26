import Link from "next/link";
import type { Metadata } from "next";
import Apertura from "@/components/Apertura";
import Grabado from "@/components/Grabado";
import Texto from "@/components/Marcador";
import Epigrafe from "@/components/Epigrafe";
import Ornamento from "@/components/Ornamento";
import { capitulos, libros, portadillas } from "@/content/config";
import { usuarioActual } from "@/lib/auth";
import { accesos } from "@/lib/access";

export const metadata: Metadata = { title: "Los libros" };

/** Como en los libros: Receta en páginas negras, Pensamiento en blancas, Biografía en azul marino. */
const identidad = {
  receta: { superficie: "oscuro", grabado: "/grabados/receta-ojo.webp", alt: "Grabado: el ojo de luz y sombra" },
  pensamiento: { superficie: "claro", grabado: "/grabados/pensamiento-ojo.webp", alt: "Grabado: el ojo radiante del Observador Eterno" },
  biografia: { superficie: "marino", grabado: "/grabados/biografia-ojo.webp", alt: "Grabado: el ojo que llora" },
} as const;

export default async function Libros() {
  const u = await usuarioActual();
  const mios = u ? (await accesos(u.id)).libros : [];
  return (
    <>
      <Apertura titulo="Los libros" bajada="Una trilogía: tres perspectivas de una misma verdad. Todavía no salieron." {...portadillas.libros} />
      {libros.map((l) => {
        const id = identidad[l.id];
        return (
          <section key={l.id} id={l.id} className={`${id.superficie} px-5 py-20 sm:py-28 scroll-mt-16`} aria-labelledby={`t-${l.id}`}>
            <div className="mx-auto max-w-3xl text-center">
              <div className="revelar">
                <Grabado src={id.grabado} alt={id.alt} ancho="min(62vw, 280px)" />
              </div>
              <p className="firma texto-2 text-sm mt-10 revelar">Libro {l.numero}</p>
              <h2 id={`t-${l.id}`} className="titulo text-4xl sm:text-5xl mt-4 revelar">
                {l.titulo}
              </h2>
              <p className="italic text-xl mt-4 texto-2 revelar">{l.pregunta}</p>
              <p className="mt-8 inline-block border borde px-4 py-1 text-sm revelar" data-testid={`estado-${l.id}`}>
                {l.estado}
              </p>
              <div className="mt-10 prosa mx-auto text-left revelar">
                <Texto bloque>{l.descripcion}</Texto>
              </div>
              {l.epigrafe && (
                <div className="revelar">
                  <Epigrafe cita={l.epigrafe} className="mt-12" />
                </div>
              )}
              <Ornamento className="mt-12" />
              <div className="mt-12 text-left prosa mx-auto">
                <h3 className="firma texto-2 text-xs text-center mb-5 revelar">Índice, en construcción</h3>
                <ol data-testid={`indice-${l.id}`}>
                  <li aria-hidden="true" className="border-t borde trazo" />
                  {capitulos[l.id].map((c, i) => (
                    <li key={c.n} className="border-b borde flex items-center gap-4 py-2.5 revelar" style={{ ["--retardo" as string]: `${i * 0.07}s` }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/emblemas/${c.emblema}.webp`} alt="" width={40} height={40} className={`w-8 h-8 ${l.id === "pensamiento" ? "invert opacity-80" : "opacity-85"}`} />
                      <span className="texto-2 w-5 text-sm">{c.n}</span>
                      <span className="text-lg">{c.titulo}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="mt-12 flex flex-col items-center gap-4 revelar">
                <p className="prosa">Leelo online, acá o en la app, desde cualquier dispositivo.</p>
                {mios.includes(l.id) ? (
                  <Link href={`/mi-espacio/biblioteca/${l.id}`} className="boton boton-lleno" data-testid={`leer-${l.id}`}>
                    Leer online
                  </Link>
                ) : (
                  <Link href={`/checkout/libro-${l.id}`} className="boton boton-lleno" data-testid={`leer-${l.id}`}>
                    Leer online (edición digital)
                  </Link>
                )}
                <p className="texto-2 text-sm">
                  ¿Tenés el libro impreso?{" "}
                  <Link href="/canjear" className="enlace">
                    Cargá su código
                  </Link>{" "}
                  ·{" "}
                  <Link href={`/lista?interes=${l.id}`} className="enlace">
                    Avisame cuando salga
                  </Link>
                </p>
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}
