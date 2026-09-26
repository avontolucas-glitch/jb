import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Apertura from "@/components/Apertura";
import { portadillas } from "@/content/config";
import Formulario, { Campo } from "@/components/Formulario";
import { accionCrearCuenta } from "@/lib/acciones";
import { usuarioActual } from "@/lib/auth";
import { volverSeguro } from "@/components/Avisos";

export const metadata: Metadata = { title: "Crear cuenta" };

export default async function CrearCuenta({ searchParams }: { searchParams: Promise<{ volver?: string }> }) {
  const destino = volverSeguro((await searchParams).volver);
  if (await usuarioActual()) redirect(destino);
  return (
    <>
    <Apertura titulo="Crear cuenta" bajada="Con tu cuenta comprás y ves todo lo tuyo en un solo lugar." {...portadillas.crearCuenta} />
    <section className="hondo border-t borde px-5 py-16 sm:py-20">
      <div className="mx-auto max-w-md revelar">
        <Formulario accion={accionCrearCuenta} boton="Crear cuenta" enviando="Creando…">
          <input type="hidden" name="volver" value={destino} />
          <Campo nombre="nombre" etiqueta="Nombre" autoComplete="name" />
          <Campo nombre="email" etiqueta="Mail" tipo="email" autoComplete="email" />
          <Campo nombre="clave" etiqueta="Clave" tipo="password" autoComplete="new-password" ayuda="Al menos 8 caracteres." />
        </Formulario>
        <p className="mt-8">
          ¿Ya tenés cuenta?{" "}
          <Link href={`/ingresar?volver=${encodeURIComponent(destino)}`} className="enlace">
            Ingresá
          </Link>
          .
        </p>
        <p className="texto-2 text-sm mt-6">
          Al crear la cuenta aceptás los{" "}
          <Link href="/legales/terminos" className="enlace">
            términos
          </Link>{" "}
          y la{" "}
          <Link href="/legales/privacidad" className="enlace">
            política de privacidad
          </Link>
          .
        </p>
      </div>
    </section>
    </>
  );
}
