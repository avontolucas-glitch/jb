import Link from "next/link";
import type { Metadata } from "next";
import Ojo from "@/components/Ojo";
import Grabado from "@/components/Grabado";
import Texto from "@/components/Marcador";
import Epigrafe from "@/components/Epigrafe";
import Ornamento from "@/components/Ornamento";
import { libros } from "@/content/config";

export const metadata: Metadata = { title: "Los libros" };

/** Como en los libros: Receta en páginas negras, Pensamiento en blancas, Biografía en azul marino. */
const identidad = {
  receta: { superficie: "oscuro", grabado: "/grabados/receta-ojo.webp", alt: "Grabado: el ojo de luz y sombra" },
  pensamiento: { superficie: "claro", grabado: "/grabados/pensamiento-ojo.webp", alt: "Grabado: el ojo radiante del Observador Eterno" },
  biografia: { superficie: "marino", grabado: "/grabados/biografia-ojo.webp", alt: "Grabado: el ojo que llora" },
} as const;

export default function Libros() {
  return (
    <>
      <section className="px-5 pt-16 pb-14 sm:pt-24 text-center">
        <Ojo size={30} className="mx-auto mb-6 aparece" />
        <h1 className="titulo text-4xl sm:text-5xl aparece">Los libros</h1>
        <p className="texto-2 mt-5 text-lg prosa mx-auto aparece" style={{ animationDelay: ".3s" }}>
          Una trilogía: tres perspectivas de una misma verdad. Todavía no salieron.
        </p>
      </section>
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
              <Link href={`/lista?interes=${l.id}`} className="boton mt-10 revelar">
                Avisame cuando salga
              </Link>
            </div>
          </section>
        );
      })}
    </>
  );
}
