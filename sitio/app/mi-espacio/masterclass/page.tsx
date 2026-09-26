import Link from "next/link";
import { miembro } from "@/lib/miembro";
import { progresoDe } from "@/lib/access";
import SinAcceso from "@/components/SinAcceso";
import { modulos } from "@/content/config";

export default async function MisMasterclass({ searchParams }: { searchParams: Promise<{ compra?: string }> }) {
  const { u, a } = await miembro();
  if (!a.masterclass)
    return <SinAcceso que="La masterclass grabada se habilita cuando la comprás." href="/masterclass/grabada" boton="Ver la masterclass grabada" />;
  const { compra } = await searchParams;
  const vistos = await progresoDe(u.id);
  const siguiente = modulos.find((m) => !vistos.has(m.id));
  return (
    <>
      {compra === "ok" && (
        <p role="status" className="border borde p-4 mb-8" data-testid="compra-ok">
          Listo, la masterclass ya es tuya. También se habilitaron los audios y el encuentro de preguntas.
        </p>
      )}
      <h1 className="titulo text-4xl">Masterclass grabada</h1>
      <p className="texto-2 mt-3" data-testid="progreso">
        {vistos.size} de {modulos.length} módulos vistos
      </p>
      <div className="h-px mt-3 borde border-t relative" aria-hidden="true">
        <div className="absolute left-0 -top-px h-[3px]" style={{ width: `${(vistos.size / modulos.length) * 100}%`, background: "var(--texto)" }} />
      </div>
      {siguiente ? (
        <Link href={`/mi-espacio/masterclass/${siguiente.id}`} className="boton boton-lleno mt-8">
          {vistos.size === 0 ? "Empezar" : "Seguir"} con «{siguiente.titulo}»
        </Link>
      ) : (
        <p className="mt-8">Viste todos los módulos. Podés volver a cualquiera cuando quieras.</p>
      )}
      <ol className="border-t borde mt-12">
        {modulos.map((m) => (
          <li key={m.id} className="border-b borde">
            <Link href={`/mi-espacio/masterclass/${m.id}`} className="flex justify-between gap-4 py-4 hover:underline underline-offset-4">
              <span className="text-lg">
                {m.titulo} <span className="texto-2 italic text-base">· {m.tema}</span>
              </span>
              <span className="texto-2 text-sm shrink-0">{vistos.has(m.id) ? "Visto" : m.duracion}</span>
            </Link>
          </li>
        ))}
      </ol>
    </>
  );
}
