import type { Metadata } from "next";
import Link from "next/link";
import Apertura from "@/components/Apertura";
import Formulario, { Campo } from "@/components/Formulario";
import { accionArrepentimiento } from "@/lib/acciones";

export const metadata: Metadata = { title: "Botón de arrepentimiento" };

/** Botón de arrepentimiento (Resolución 424/2020): pedir la baja de una compra online dentro de los 10 días. */
export default function Arrepentimiento() {
  return (
    <>
      <Apertura
        titulo="Botón de arrepentimiento"
        bajada="Si compraste en los últimos 10 días y te arrepentiste, pedí acá la cancelación. Te damos un código para seguir el pedido."
      />
      <section className="hondo border-t borde px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-md revelar">
          <Formulario accion={accionArrepentimiento} boton="Pedir la cancelación" ocultarAlTerminar>
            <Campo nombre="nombre" etiqueta="Nombre" autoComplete="name" />
            <Campo nombre="email" etiqueta="Mail de la compra" tipo="email" autoComplete="email" />
            <Campo nombre="compra" etiqueta="Qué compraste y cuándo" ayuda="Por ejemplo: sesión privada del martes 29." />
          </Formulario>
          <p className="texto-2 text-sm mt-10">
            Plazos y condiciones de cada producto en la{" "}
            <Link href="/legales/reembolsos" className="enlace">
              política de reembolsos
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
