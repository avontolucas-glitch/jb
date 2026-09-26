import Link from "next/link";
import { notFound } from "next/navigation";
import { miembro } from "@/lib/miembro";
import SinAcceso from "@/components/SinAcceso";
import LectorProtegido from "@/components/LectorProtegido";
import Ornamento from "@/components/Ornamento";
import { capitulos, libros, TEXTO_LIBRO } from "@/content/config";

/** Como en los libros: Receta en negro, Pensamiento en blanco, Biografía en azul marino. */
const superficie = { receta: "oscuro", pensamiento: "claro", biografia: "marino" } as const;

export default async function Capitulo({ params }: { params: Promise<{ libro: string; cap: string }> }) {
  const { u, a } = await miembro();
  const { libro, cap } = await params;
  const l = libros.find((x) => x.id === libro);
  if (!l) notFound();
  const lista = capitulos[l.id];
  const i = lista.findIndex((c) => String(c.n) === cap);
  if (i < 0) notFound();
  if (!a.libros.includes(l.id))
    return <SinAcceso que="Este libro se desbloquea con la edición digital o con el código que trae el libro impreso." href="/mi-espacio/biblioteca" boton="Ver la biblioteca" />;
  const c = lista[i];
  const ant = lista[i - 1];
  const sig = lista[i + 1];
  return (
    <div className={`${superficie[l.id]} -mx-5 px-5 sm:px-10 py-12 sm:py-16`}>
      <LectorProtegido email={u.email}>
        <article className="mx-auto max-w-xl">
          <Link href={`/mi-espacio/biblioteca/${l.id}`} className="enlace texto-2 text-sm">
            {l.titulo}
          </Link>
          <header className="text-center mt-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/emblemas/${c.emblema}.webp`} alt="" width={200} height={200} className={`mx-auto w-28 h-28 estampa ${l.id === "pensamiento" ? "invert" : ""}`} />
            <p className="texto-2 text-sm tracking-[0.3em] mt-6">CAPÍTULO {c.n}</p>
            <h1 className="titulo text-3xl sm:text-4xl mt-3">{c.titulo}</h1>
          </header>
          <div className="pagina-libro mt-12">
            <p className="marcador-bloque" data-marcador>
              {TEXTO_LIBRO}
            </p>
          </div>
          <Ornamento className="mt-12" />
          <nav aria-label="Capítulos" className="mt-12 border-t borde pt-6 flex justify-between gap-6 text-sm">
            {ant ? (
              <Link href={`/mi-espacio/biblioteca/${l.id}/${ant.n}`} className="enlace">
                Capítulo {ant.n}: {ant.titulo}
              </Link>
            ) : (
              <span />
            )}
            {sig && (
              <Link href={`/mi-espacio/biblioteca/${l.id}/${sig.n}`} className="enlace text-right" data-testid="capitulo-siguiente">
                Capítulo {sig.n}: {sig.titulo}
              </Link>
            )}
          </nav>
        </article>
      </LectorProtegido>
    </div>
  );
}
