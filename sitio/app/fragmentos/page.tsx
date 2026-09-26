import type { Metadata } from "next";
import Apertura from "@/components/Apertura";
import Ojo from "@/components/Ojo";
import { fragmentos, portadillas, redes } from "@/content/config";

export const metadata: Metadata = { title: "Fragmentos" };

export default function Fragmentos() {
  return (
    <>
      <Apertura titulo="Fragmentos" bajada="Pedazos de conferencias y charlas. Los completos están en las redes." {...portadillas.fragmentos} />
      <section className="px-5 pb-20">
        <ul className="mx-auto max-w-5xl grid gap-8 sm:grid-cols-2 revelar">
          {fragmentos.map((f) => (
            <li key={f.id}>
              <div
                className="marcador-bloque flex flex-col items-center justify-center gap-3 text-center"
                style={{ aspectRatio: "16 / 9" }}
                role="img"
                aria-label={`Espacio para el video: ${f.titulo}`}
              >
                <Ojo size={28} />
                <span className="text-sm">[VIDEO]</span>
              </div>
              <p className="mt-3 text-lg">{f.titulo}</p>
              <p className="texto-2 italic">{f.tema}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="hondo border-t borde px-5 py-16">
        <div className="mx-auto max-w-3xl text-center revelar">
          <h2 className="titulo text-3xl mb-8">En las redes</h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {redes.map((r) => (
              <a key={r.nombre} href={r.url} className="boton">
                {r.nombre}
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
