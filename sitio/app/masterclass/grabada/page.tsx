import Link from "next/link";
import type { Metadata } from "next";
import Apertura from "@/components/Apertura";
import Texto from "@/components/Marcador";
import Precio from "@/components/Precio";
import Epigrafe from "@/components/Epigrafe";
import Ornamento from "@/components/Ornamento";
import { usuarioActual } from "@/lib/auth";
import { accesos } from "@/lib/access";
import { citas, encuentro, masterclass, modulos, portadillas, precios } from "@/content/config";

export const metadata: Metadata = { title: "Masterclass grabada" };

export default async function Masterclass() {
  const u = await usuarioActual();
  const tiene = u ? (await accesos(u.id)).masterclass : false;
  const accion = tiene ? (
    <Link href="/mi-espacio/masterclass" className="boton boton-lleno">
      Ir a la masterclass
    </Link>
  ) : (
    <Link href="/checkout/masterclass" className="boton boton-lleno">
      Comprar la masterclass grabada
    </Link>
  );
  return (
    <>
      <Apertura titulo={masterclass.titulo} bajada={masterclass.bajada} {...portadillas.grabada}>
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
          <h2 className="titulo text-3xl mb-2 revelar">Los módulos</h2>
          <p className="texto-2 mb-8 revelar">Los temas los define Julián. Los capítulos de los libros se leen en <Link href="/libros" className="enlace">Libros</Link>.</p>
          <ol>
            <li aria-hidden="true" className="border-t borde trazo" />
            {modulos.map((m, i) => (
              <li key={m.id} className="border-b borde py-3 flex justify-between gap-4 revelar" style={{ ["--retardo" as string]: `${i * 0.06}s` }}>
                <span className="text-xl">{m.titulo}</span>
                <span className="texto-2 italic">{m.tema}</span>
              </li>
            ))}
          </ol>
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
            ¿Buscás a Julián en vivo?{" "}
            <Link href="/masterclass" className="enlace">
              La masterclass de cada semana
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
