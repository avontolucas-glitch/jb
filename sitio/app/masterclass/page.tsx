import Link from "next/link";
import type { Metadata } from "next";
import Apertura from "@/components/Apertura";
import Texto from "@/components/Marcador";
import Ornamento from "@/components/Ornamento";
import Epigrafe from "@/components/Epigrafe";
import { usuarioActual } from "@/lib/auth";
import { accesos } from "@/lib/access";
import Precio from "@/components/Precio";
import SubnavMasterclass from "@/components/SubnavMasterclass";
import { citas, enVivo, masterclass, portadillas, precios } from "@/content/config";

export const metadata: Metadata = { title: "Masterclass" };

export default async function EnVivo() {
  const u = await usuarioActual();
  const a = u ? await accesos(u.id) : null;
  const mios = a?.directos ?? [];
  const tieneGrabada = a?.masterclass ?? false;
  return (
    <>
      <Apertura titulo={enVivo.titulo} bajada={enVivo.bajada} {...portadillas.masterclass} />
      <SubnavMasterclass actual="vivo" />

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

      <section className="hondo border-t borde px-5 py-16 sm:py-20" aria-labelledby="grabada" data-testid="bloque-grabada">
        <div className="mx-auto max-w-3xl">
          <p className="firma texto-2 text-xs revelar">También</p>
          <h2 id="grabada" className="titulo text-3xl mt-2 mb-4 revelar">
            {masterclass.titulo}
          </h2>
          <p className="text-xl prosa revelar">{masterclass.bajada}</p>
          <ul className="mt-8 space-y-2 prosa">
            {masterclass.incluye.map((item, i) => (
              <li key={item} className="flex gap-3 revelar" style={{ ["--retardo" as string]: `${i * 0.1}s` }}>
                <span aria-hidden="true" className="texto-2">·</span>
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap items-center gap-5 revelar">
            <Link href="/masterclass/grabada" className="boton">
              Ver la masterclass grabada
            </Link>
            {tieneGrabada ? (
              <Link href="/mi-espacio/masterclass" className="enlace texto-2">
                Ya la tenés: ir a verla
              </Link>
            ) : (
              <span className="texto-2">
                <Precio {...precios.masterclass} />
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 text-center border-t borde">
        <div className="revelar">
          <Epigrafe cita={citas.tiempo} />
        </div>
        <Ornamento className="mt-12" />
      </section>
    </>
  );
}
