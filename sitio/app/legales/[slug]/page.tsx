import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Apertura from "@/components/Apertura";
import { portadillas } from "@/content/config";
import Texto from "@/components/Marcador";
import { legales } from "@/content/legales";

type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const p = legales[(await params).slug];
  return { title: p?.titulo ?? "Legales" };
}

export default async function Legal({ params }: P) {
  const { slug } = await params;
  const p = legales[slug];
  if (!p) notFound();
  return (
    <>
      <Apertura titulo={p.titulo} bajada={p.bajada} {...portadillas.legales} />
      <section className="hondo border-t borde px-5 py-16 sm:py-24">
        <article className="mx-auto max-w-2xl" data-testid="texto-legal">
          {p.partes.map((parte, i) => (
            <section key={parte.titulo} id={parte.id} className="mt-12 first:mt-0 revelar scroll-mt-20">
              <h2 className="text-2xl mb-4">
                <span className="texto-2 mr-3 text-base">{i + 1}.</span>
                {parte.titulo}
              </h2>
              <div className="prosa space-y-4">
                {parte.parrafos.map((t) => (
                  <Texto key={t} bloque>
                    {t}
                  </Texto>
                ))}
              </div>
            </section>
          ))}
          {slug === "reembolsos" && (
            <p className="mt-14 revelar">
              <Link href="/arrepentimiento" className="boton">
                Botón de arrepentimiento
              </Link>
            </p>
          )}
        </article>
      </section>
    </>
  );
}
