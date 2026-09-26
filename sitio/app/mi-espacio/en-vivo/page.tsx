import Link from "next/link";
import { miembro } from "@/lib/miembro";
import SinAcceso from "@/components/SinAcceso";
import { enVivo } from "@/content/config";

export default async function MisDirectos({ searchParams }: { searchParams: Promise<{ compra?: string }> }) {
  const { a } = await miembro();
  const { compra } = await searchParams;
  const mios = enVivo.directos.filter((d) => a.directos.includes(d.id));
  if (mios.length === 0)
    return (
      <>
        <h1 className="titulo text-4xl mb-8">En vivo</h1>
        <SinAcceso que="Acá aparecen los directos que reservaste. Cada uno se paga a voluntad, desde USD 1." href="/en-vivo" boton="Ver los directos" />
      </>
    );
  return (
    <>
      {compra === "ok" && (
        <p role="status" className="border borde p-4 mb-8" data-testid="compra-ok">
          Listo, tu lugar está reservado.
        </p>
      )}
      <h1 className="titulo text-4xl">En vivo</h1>
      <ul className="border-t borde mt-8">
        {mios.map((d) => (
          <li key={d.id} className="border-b borde py-6" data-testid={`mi-directo-${d.id}`}>
            <h2 className="text-2xl">{d.titulo}</h2>
            <p className="texto-2 mt-1">{d.fecha}</p>
            <Link href={`/mi-espacio/en-vivo/${d.id}`} className="boton boton-lleno mt-5" prefetch={false}>
              Entrar a la sala
            </Link>
          </li>
        ))}
      </ul>
      {mios.length < enVivo.directos.length && (
        <p className="texto-2 mt-10">
          <Link href="/en-vivo" className="enlace">
            Ver los otros directos
          </Link>
        </p>
      )}
    </>
  );
}
