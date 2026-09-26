import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { sitio } from "@/content/config";

const paginas = {
  terminos: { titulo: "Términos y condiciones", partes: ["Uso del sitio", "Cuentas", "Compras y accesos", "Propiedad del contenido", "Contacto"] },
  privacidad: { titulo: "Política de privacidad", partes: ["Qué datos se guardan", "Para qué se usan", "Con quién se comparten", "Cómo pedir que se borren"] },
  reembolsos: { titulo: "Política de reembolsos", partes: ["Masterclass", "Entradas a conferencias privadas", "Cómo pedir un reembolso"] },
} as const;

type Slug = keyof typeof paginas;
type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const p = paginas[(await params).slug as Slug];
  return { title: p?.titulo ?? "Legales" };
}

export default async function Legal({ params }: P) {
  const p = paginas[(await params).slug as Slug];
  if (!p) notFound();
  return (
    <section className="claro px-5 py-16 sm:py-24">
      <article className="mx-auto max-w-2xl">
        <h1 className="titulo text-4xl">{p.titulo}</h1>
        <p className="texto-2 mt-3">
          {sitio.dominio} · Borrador del prototipo: el texto legal lo redacta un profesional antes de publicar.
        </p>
        {p.partes.map((parte) => (
          <section key={parte} className="mt-10">
            <h2 className="text-2xl mb-3">{parte}</h2>
            <p className="marcador-bloque">[TEXTO LEGAL A DEFINIR]</p>
          </section>
        ))}
      </article>
    </section>
  );
}
