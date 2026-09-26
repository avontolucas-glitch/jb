import Link from "next/link";
import type { Metadata } from "next";
import Grabado from "@/components/Grabado";
import Texto from "@/components/Marcador";
import Ornamento from "@/components/Ornamento";
import Epigrafe from "@/components/Epigrafe";
import { usuarioActual } from "@/lib/auth";
import { accesos } from "@/lib/access";
import { citas, enVivo } from "@/content/config";

export const metadata: Metadata = { title: "Masterclass en vivo" };

export default async function EnVivo() {
  const u = await usuarioActual();
  const mios = u ? (await accesos(u.id)).directos : [];
  return (
    <>
      <section className="relative overflow-hidden px-5 pt-12 pb-16 sm:pt-16 sm:pb-24 text-center">
        <Grabado src="/grabados/receta-ojo.webp" alt="Grabado: el ojo de luz y sombra" ancho="min(60vw, 260px)" halo />
        <h1 className="titulo text-4xl sm:text-5xl mt-8 aparece" style={{ animationDelay: ".9s" }}>
          {enVivo.titulo}
        </h1>
        <p className="texto-2 mt-5 text-lg sm:text-xl prosa mx-auto aparece" style={{ animationDelay: "1.3s" }}>
          {enVivo.bajada}
        </p>
      </section>

      <section className="hondo border-t borde px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="prosa revelar">
            <Texto bloque>{enVivo.descripcion}</Texto>
          </div>
          <h2 className="titulo text-3xl mt-14 mb-6 revelar">Cómo funciona</h2>
          <ol className="space-y-4 prosa text-lg">
            {[
              `${enVivo.frecuencia}, en vivo.`,
              `Elegís cuánto pagar por cada directo, desde ${enVivo.moneda} ${enVivo.minimo}.`,
              "Lo ves acá, con tu cuenta: no se descarga y no hay link para compartir.",
              "Se puede ver en una pantalla a la vez.",
            ].map((t, i) => (
              <li key={t} className="flex gap-4 revelar" style={{ ["--retardo" as string]: `${i * 0.12}s` }}>
                <span className="texto-2 w-5 shrink-0">{i + 1}</span>
                {t}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="titulo text-3xl mb-8 revelar">Próximos directos</h2>
          <ul>
            <li aria-hidden="true" className="border-t borde trazo" />
            {enVivo.directos.map((d, i) => {
              const tiene = mios.includes(d.id);
              return (
                <li key={d.id} className="border-b borde py-7 revelar" style={{ ["--retardo" as string]: `${i * 0.12}s` }} data-testid={`directo-${d.id}`}>
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                    <h3 className="text-2xl">{d.titulo}</h3>
                    <span className="texto-2 text-sm">{d.fecha}</span>
                  </div>
                  <p className="texto-2 italic mt-1">{d.tema}</p>
                  {tiene ? (
                    <Link href={`/mi-espacio/en-vivo/${d.id}`} className="boton boton-lleno mt-5">
                      Entrar a la sala
                    </Link>
                  ) : (
                    <Link href={`/checkout/directo-${d.id}`} className="boton mt-5">
                      Reservar mi lugar
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
          {!u && <p className="texto-2 text-sm mt-6">Para reservar necesitás una cuenta. Se crea en un minuto.</p>}
        </div>
      </section>

      <section className="hondo border-t borde px-5 py-20 text-center">
        <div className="revelar">
          <Epigrafe cita={citas.tiempo} />
        </div>
        <Ornamento className="mt-12" />
      </section>
    </>
  );
}
