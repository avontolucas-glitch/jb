import Link from "next/link";
import { notFound } from "next/navigation";
import { miembro } from "@/lib/miembro";
import SinAcceso from "@/components/SinAcceso";
import { capitulos, libros } from "@/content/config";

export default async function Indice({ params, searchParams }: { params: Promise<{ libro: string }>; searchParams: Promise<{ compra?: string; canje?: string }> }) {
  const { a } = await miembro();
  const { libro } = await params;
  const { compra, canje } = await searchParams;
  const l = libros.find((x) => x.id === libro);
  if (!l) notFound();
  if (!a.libros.includes(l.id))
    return <SinAcceso que="Este libro se desbloquea con la edición digital o con el código que trae el libro impreso." href="/mi-espacio/biblioteca" boton="Ver la biblioteca" />;
  return (
    <>
      {(compra === "ok" || canje === "ok") && (
        <p role="status" className="border borde p-4 mb-8" data-testid="libro-ok">
          Listo, el libro ya está en tu biblioteca.
        </p>
      )}
      <Link href="/mi-espacio/biblioteca" className="enlace texto-2 text-sm">
        Biblioteca
      </Link>
      <p className="firma texto-2 text-xs mt-8">Libro {l.numero}</p>
      <h1 className="titulo text-4xl mt-2">{l.titulo}</h1>
      <p className="texto-2 italic mt-2">{l.pregunta}</p>
      <h2 className="text-xl mt-12 mb-3">Índice</h2>
      <ol className="border-t borde" data-testid="indice">
        {capitulos[l.id].map((c) => (
          <li key={c.n} className="border-b borde">
            <Link href={`/mi-espacio/biblioteca/${l.id}/${c.n}`} className="fila flex items-center gap-4 py-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/emblemas/${c.emblema}.webp`} alt="" width={40} height={40} className="w-9 h-9 opacity-80" />
              <span className="texto-2 w-6 text-sm">{c.n}</span>
              <span className="text-lg">{c.titulo}</span>
            </Link>
          </li>
        ))}
      </ol>
    </>
  );
}
