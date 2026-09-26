import Link from "next/link";
import type { Metadata } from "next";
import Apertura from "@/components/Apertura";
import Texto from "@/components/Marcador";
import Precio from "@/components/Precio";
import { conferencias, portadillas, precios } from "@/content/config";

export const metadata: Metadata = { title: "Conferencias" };

export default function Conferencias() {
  const privadas = conferencias.filter((c) => c.tipo === "privada");
  return (
    <>
      <Apertura titulo="Conferencias" bajada="En vivo, con entrada simbólica. El link para entrar aparece en tu espacio." {...portadillas.conferencias} />
      <section className="px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl revelar">
          <h2 className="titulo text-3xl mb-2">Próximas</h2>
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
