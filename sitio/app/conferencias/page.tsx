import Link from "next/link";
import type { Metadata } from "next";
import Apertura from "@/components/Apertura";
import Texto from "@/components/Marcador";
import Precio from "@/components/Precio";
import { conferencias, precios } from "@/content/config";

export const metadata: Metadata = { title: "Conferencias" };

export default function Conferencias() {
  const abiertas = conferencias.filter((c) => c.tipo === "abierta");
  const privadas = conferencias.filter((c) => c.tipo === "privada");
  return (
    <>
      <Apertura titulo="Conferencias" bajada="Una abierta por año, gratis. Y privadas, con entrada simbólica." />
      <section className="claro px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="titulo text-3xl mb-2">Abierta</h2>
          <p className="texto-2 mb-8">Gratis. Solo hace falta inscribirse.</p>
          {abiertas.map((c) => (
            <article key={c.id} className="border-t border-b borde py-8">
              <h3 className="text-2xl">{c.titulo}</h3>
              <p className="texto-2 mt-1">
                {c.fecha} · {c.lugar}
              </p>
              <p className="mt-4 prosa">{c.descripcion}</p>
              <Link href={`/conferencias/${c.id}`} className="boton boton-lleno mt-6">
                Inscribirme
              </Link>
            </article>
          ))}
        </div>
      </section>
      <section className="px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="titulo text-3xl mb-2">Privadas</h2>
          <p className="texto-2 mb-8">
            Entrada simbólica de <Precio {...precios.conferenciaPrivada} />. Para comprarla necesitás una cuenta; el link
            para entrar aparece en tu espacio.
          </p>
          <ul className="border-t borde">
            {privadas.map((c) => (
              <li key={c.id} className="border-b borde py-8">
                <h3 className="text-2xl">{c.titulo}</h3>
                <p className="texto-2 mt-1">
                  {c.fecha} · {c.lugar}
                </p>
                <div className="mt-4 prosa">
                  <Texto bloque>{c.descripcion}</Texto>
                </div>
                <Link href={`/conferencias/${c.id}`} className="boton mt-6">
                  Ver la conferencia
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
