import Link from "next/link";
import { notFound } from "next/navigation";
import { miembro } from "@/lib/miembro";
import { progresoDe } from "@/lib/access";
import { accionProgreso } from "@/lib/acciones";
import SinAcceso from "@/components/SinAcceso";
import Ojo from "@/components/Ojo";
import { modulos } from "@/content/config";

export default async function Modulo({ params }: { params: Promise<{ modulo: string }> }) {
  const { u, a } = await miembro();
  if (!a.masterclass)
    return <SinAcceso que="La masterclass grabada se habilita cuando la comprás." href="/masterclass/grabada" boton="Ver la masterclass grabada" />;
  const { modulo } = await params;
  const i = modulos.findIndex((m) => m.id === modulo);
  if (i < 0) notFound();
  const m = modulos[i];
  const siguiente = modulos[i + 1];
  const anterior = modulos[i - 1];
  const visto = (await progresoDe(u.id)).has(m.id);
  return (
    <>
      <Link href="/mi-espacio/masterclass" className="enlace texto-2 text-sm">
        Todos los módulos
      </Link>
      <p className="texto-2 mt-8 text-sm">
        Módulo {i + 1} de {modulos.length}
      </p>
      <h1 className="titulo text-4xl mt-1">{m.titulo}</h1>
      <p className="texto-2 italic mt-1">{m.tema}</p>
      <div
        className="marcador-bloque mt-8 flex flex-col items-center justify-center gap-3"
        style={{ aspectRatio: "16 / 9" }}
        role="img"
        aria-label={`Espacio para el video del módulo ${m.titulo}`}
      >
        <Ojo size={32} />
        <span className="text-sm">(Video del módulo, a definir)</span>
      </div>
      <form action={accionProgreso} className="mt-8 flex flex-wrap items-center gap-4">
        <input type="hidden" name="modulo" value={m.id} />
        <input type="hidden" name="hecho" value={visto ? "no" : "si"} />
        <button type="submit" className={`boton ${visto ? "" : "boton-lleno"}`} data-testid="marcar">
          {visto ? "Desmarcar como visto" : "Marcar como visto"}
        </button>
        {visto && <span className="texto-2">Visto.</span>}
      </form>
      <nav aria-label="Módulos" className="mt-14 border-t borde pt-6 flex justify-between gap-6">
        {anterior ? (
          <Link href={`/mi-espacio/masterclass/${anterior.id}`} className="enlace">
            Anterior: {anterior.titulo}
          </Link>
        ) : (
          <span />
        )}
        {siguiente && (
          <Link href={`/mi-espacio/masterclass/${siguiente.id}`} className="enlace text-right" data-testid="siguiente">
            Siguiente: {siguiente.titulo}
          </Link>
        )}
      </nav>
    </>
  );
}
