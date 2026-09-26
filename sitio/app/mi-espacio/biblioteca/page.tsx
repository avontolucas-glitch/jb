import Link from "next/link";
import { miembro } from "@/lib/miembro";
import Precio from "@/components/Precio";
import { libros, precios } from "@/content/config";

const tapa = { receta: "/grabados/receta-ojo.webp", pensamiento: "/grabados/observador-crema.webp", biografia: "/grabados/biografia-ojo.webp" } as const;

export default async function Biblioteca() {
  const { a } = await miembro();
  return (
    <>
      <h1 className="titulo text-4xl">Biblioteca</h1>
      <p className="texto-2 mt-3">Los libros de la trilogía, para leer acá. Se desbloquean con la edición digital o con el código del libro impreso.</p>
      <ul className="mt-10 space-y-6">
        {libros.map((l) => {
          const tiene = a.libros.includes(l.id);
          return (
            <li key={l.id} className="border-t borde pt-6 grid grid-cols-[5rem_1fr] sm:grid-cols-[6.5rem_1fr] gap-5 items-start" data-testid={`biblioteca-${l.id}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={tapa[l.id]} alt="" width={200} height={200} className={`w-full h-auto ${tiene ? "" : "opacity-40"}`} />
              <div>
                <p className="firma texto-2 text-xs">Libro {l.numero}</p>
                <h2 className="text-2xl mt-1">{l.titulo}</h2>
                <p className="texto-2 italic">{l.pregunta}</p>
                {tiene ? (
                  <Link href={`/mi-espacio/biblioteca/${l.id}`} className="boton boton-lleno mt-4">
                    Leer
                  </Link>
                ) : (
                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
                    <Link href={`/checkout/libro-${l.id}`} className="boton">
                      Comprar el digital
                    </Link>
                    <Link href="/canjear" className="enlace texto-2">
                      Tengo un código del libro impreso
                    </Link>
                    <span className="texto-2 text-sm w-full">
                      <Precio {...precios.libroDigital} />
                    </span>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
