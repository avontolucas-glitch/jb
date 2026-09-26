import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Apertura from "@/components/Apertura";
import Texto from "@/components/Marcador";
import Precio from "@/components/Precio";
import Formulario, { Campo } from "@/components/Formulario";
import { accionInscribir } from "@/lib/acciones";
import { usuarioActual } from "@/lib/auth";
import { accesos } from "@/lib/access";
import { conferencias, precios } from "@/content/config";

type P = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { id } = await params;
  const c = conferencias.find((x) => x.id === id);
  return { title: c?.titulo ?? "Conferencia" };
}

export default async function Conferencia({ params }: P) {
  const { id } = await params;
  const c = conferencias.find((x) => x.id === id);
  if (!c) notFound();
  const u = await usuarioActual();

  if (c.tipo === "abierta") {
    return (
      <>
        <Apertura titulo={c.titulo} bajada={`${c.fecha} · ${c.lugar}`} />
        <section className="hondo border-t borde px-5 py-16">
          <div className="mx-auto max-w-xl revelar">
            <p className="text-lg">{c.descripcion}</p>
            <h2 className="titulo text-2xl mt-12 mb-6">Inscripción</h2>
            <Formulario accion={accionInscribir} boton="Inscribirme" ocultarAlTerminar>
              <input type="hidden" name="conferencia" value={c.id} />
              <Campo nombre="nombre" etiqueta="Nombre" autoComplete="name" />
              <Campo nombre="email" etiqueta="Mail" tipo="email" autoComplete="email" />
            </Formulario>
          </div>
        </section>
      </>
    );
  }

  const tiene = u ? (await accesos(u.id)).conferencias.includes(c.id) : false;
  return (
    <>
      <Apertura titulo={c.titulo} bajada={`${c.fecha} · ${c.lugar}`} />
      <section className="hondo border-t borde px-5 py-16">
        <div className="mx-auto max-w-xl revelar">
          <Texto bloque>{c.descripcion}</Texto>
          <p className="mt-8 text-lg">
            Entrada: <Precio {...precios.conferenciaPrivada} />
          </p>
          {tiene ? (
            <div className="mt-8 border borde p-5">
              <p>Ya tenés tu entrada. El link para entrar está en tu espacio.</p>
              <Link href="/mi-espacio/conferencias" className="boton boton-lleno mt-4">
                Ir a mis conferencias
              </Link>
            </div>
          ) : (
            <>
              <Link href={`/checkout/conferencia-${c.id}`} className="boton boton-lleno mt-8">
                Comprar la entrada
              </Link>
              {!u && (
                <p className="texto-2 text-sm mt-4">
                  Para comprar necesitás una cuenta. Si no tenés, la creás en un minuto.
                </p>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
