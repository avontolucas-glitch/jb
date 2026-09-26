import Link from "next/link";
import { miembro } from "@/lib/miembro";
import SinAcceso from "@/components/SinAcceso";
import { conferencias } from "@/content/config";

export default async function MisConferencias({ searchParams }: { searchParams: Promise<{ compra?: string }> }) {
  const { a } = await miembro();
  const { compra } = await searchParams;
  const mias = conferencias.filter((c) => c.tipo === "privada" && a.conferencias.includes(c.id));
  const otras = conferencias.filter((c) => c.tipo === "privada" && !a.conferencias.includes(c.id));
  if (mias.length === 0)
    return (
      <>
        <h1 className="titulo text-4xl mb-8">Conferencias privadas</h1>
        <SinAcceso que="Acá aparecen las conferencias privadas para las que tenés entrada." href="/conferencias" boton="Ver las conferencias" />
      </>
    );
  return (
    <>
      {compra === "ok" && (
        <p role="status" className="border borde p-4 mb-8" data-testid="compra-ok">
          Listo, ya tenés tu entrada.
        </p>
      )}
      <h1 className="titulo text-4xl">Conferencias privadas</h1>
      <ul className="border-t borde mt-8">
        {mias.map((c) => (
          <li key={c.id} className="border-b borde py-6" data-testid={`mi-conferencia-${c.id}`}>
            <h2 className="text-2xl">{c.titulo}</h2>
            <p className="texto-2 mt-1">
              {c.fecha} · {c.lugar}
            </p>
            <p className="mt-4">
              Link para entrar:{" "}
              <a href={c.linkAcceso} className="enlace break-all" data-testid="link-acceso">
                {c.linkAcceso}
              </a>
            </p>
            <p className="texto-2 text-sm mt-2">Es personal: no lo compartas.</p>
          </li>
        ))}
      </ul>
      {otras.length > 0 && (
        <p className="texto-2 mt-10">
          Hay {otras.length === 1 ? "otra conferencia privada" : `${otras.length} conferencias privadas más`}.{" "}
          <Link href="/conferencias" className="enlace">
            Ver conferencias
          </Link>
          .
        </p>
      )}
    </>
  );
}
