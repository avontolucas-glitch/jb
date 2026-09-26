import Link from "next/link";
import type { Metadata } from "next";
import Apertura from "@/components/Apertura";
import Texto from "@/components/Marcador";
import Precio from "@/components/Precio";
import Epigrafe from "@/components/Epigrafe";
import Ornamento from "@/components/Ornamento";
import { usuarioActual } from "@/lib/auth";
import { accesos } from "@/lib/access";
import { citas, encuentro, libros, masterclass, modulos, portadillas, precios } from "@/content/config";

export const metadata: Metadata = { title: "Masterclass" };

export default async function Masterclass() {
  const u = await usuarioActual();
  const tiene = u ? (await accesos(u.id)).masterclass : false;
  const accion = tiene ? (
    <Link href="/mi-espacio/masterclass" className="boton boton-lleno">
      Ir a la masterclass
    </Link>
  ) : (
    <Link href="/checkout/masterclass" className="boton boton-lleno">
      Comprar la masterclass
    </Link>
  );
  return (
    <>
      <Apertura titulo={masterclass.titulo} bajada={masterclass.bajada} {...portadillas.masterclass}>
        <div className="mt-10 flex flex-wrap items-center gap-5">
          {accion}
          <span className="texto-2">
            <Precio {...precios.masterclass} />
          </span>
        </div>
      </Apertura>

      <section className="hondo border-t borde px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl revelar">
          <div className="prosa">
            <Texto bloque>{masterclass.descripcion}</Texto>
          </div>
          <h2 className="titulo text-3xl mt-14 mb-6">Qué incluye</h2>
          <ul className="border-t borde">
            {masterclass.incluye.map((i) => (
              <li key={i} className="border-b borde py-4 text-lg">
                {i}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl revelar">
          <h2 className="titulo text-3xl mb-2">Los temas</h2>
          <p className="texto-2 mb-8">Provisorios: son capítulos de la trilogía.</p>
          {(["receta", "pensamiento"] as const).map((lid) => {
            const libro = libros.find((l) => l.id === lid)!;
            return (
              <div key={lid} className="mb-10">
                <h3 className="texto-2 italic mb-3">{libro.titulo}</h3>
                <ol className="border-t borde">
                  {modulos
                    .filter((m) => m.libro === lid)
                    .map((m) => (
                      <li key={m.id} className="border-b borde py-3 text-xl">
                        {m.titulo}
                      </li>
                    ))}
                </ol>
              </div>
            );
          })}
        </div>
      </section>

      <section className="hondo border-t borde px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl revelar">
          <h2 className="titulo text-3xl mb-6">El encuentro de preguntas</h2>
          <p className="prosa text-lg">{encuentro.explicacion}</p>
          <p className="texto-2 mt-4">
            Próximo encuentro: {encuentro.proximo} · {encuentro.modalidad}
          </p>
        </div>
      </section>

      <section className="px-5 py-20 text-center">
        <div className="revelar">
          <Epigrafe cita={citas.pesca} />
        </div>
        <Ornamento className="mt-12" />
        <div className="mt-12 flex flex-col items-center gap-3">
          {accion}
          <span className="texto-2 text-sm">
            <Link href="/legales/reembolsos" className="enlace">
              Política de reembolsos
            </Link>
          </span>
          <p className="texto-2 mt-10">
            ¿Buscás los directos de cada semana?{" "}
            <Link href="/en-vivo" className="enlace">
              Masterclass en vivo
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
