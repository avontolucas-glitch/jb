import Link from "next/link";
import type { Metadata } from "next";
import Ojo from "@/components/Ojo";
import Texto from "@/components/Marcador";
import Epigrafe from "@/components/Epigrafe";
import Ornamento from "@/components/Ornamento";
import { libros } from "@/content/config";

export const metadata: Metadata = { title: "Los libros" };

/** Cada libro conserva la identidad de su edición impresa. */
const superficie = { receta: "claro", pensamiento: "oscuro", biografia: "marino" } as const;

export default function Libros() {
  return (
    <>
      <section className="px-5 pt-16 pb-12 sm:pt-24 text-center">
        <Ojo size={30} className="mx-auto mb-6" />
        <h1 className="titulo text-4xl sm:text-5xl">Los libros</h1>
        <p className="texto-2 mt-5 text-lg prosa mx-auto">
          Una trilogía: tres perspectivas de una misma verdad. Todavía no salieron.
        </p>
      </section>
      {libros.map((l) => (
        <section key={l.id} id={l.id} className={`${superficie[l.id]} px-5 py-20 sm:py-28 scroll-mt-16`} aria-labelledby={`t-${l.id}`}>
          <div className="mx-auto max-w-3xl text-center">
            <p className="firma texto-2 text-sm">Libro {l.numero}</p>
            <h2 id={`t-${l.id}`} className="titulo text-4xl sm:text-5xl mt-4">
              {l.titulo}
            </h2>
            <p className="italic text-xl mt-4 texto-2">{l.pregunta}</p>
            <p className="mt-8 inline-block border borde px-4 py-1 text-sm" data-testid={`estado-${l.id}`}>
              {l.estado}
            </p>
            <div className="mt-10 prosa mx-auto text-left">
              <Texto bloque>{l.descripcion}</Texto>
            </div>
            {l.epigrafe && <Epigrafe cita={l.epigrafe} className="mt-12" />}
            <Ornamento className="mt-12" />
            <Link href={`/lista?interes=${l.id}`} className="boton mt-10">
              Avisame cuando salga
            </Link>
          </div>
        </section>
      ))}
    </>
  );
}
