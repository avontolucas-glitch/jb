import Link from "next/link";
import type { Metadata } from "next";
import Apertura from "@/components/Apertura";
import Formulario, { Campo } from "@/components/Formulario";
import { accionCanjear } from "@/lib/acciones";
import { usuarioActual } from "@/lib/auth";
import { portadillas } from "@/content/config";

export const metadata: Metadata = { title: "Canjear el código del libro" };

export default async function Canjear({ searchParams }: { searchParams: Promise<{ codigo?: string }> }) {
  const { codigo } = await searchParams;
  const u = await usuarioActual();
  const volver = `/canjear${codigo ? `?codigo=${encodeURIComponent(codigo)}` : ""}`;
  return (
    <>
      <Apertura
        titulo="Tu libro, también digital"
        bajada="Cada libro impreso trae en su primera página un código único. Cargalo acá y el libro queda para leer en tu espacio."
        {...portadillas.canjear}
      />
      <section className="hondo border-t borde px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-md revelar">
          {u ? (
            <Formulario accion={accionCanjear} boton="Desbloquear el libro" enviando="Revisando…">
              <Campo nombre="codigo" etiqueta="Código del libro" autoComplete="off" defecto={codigo} ayuda="Por ejemplo: REC-7K3M-Q9TD-4HXA. Mayúsculas, minúsculas o guiones, da igual." />
            </Formulario>
          ) : (
            <div className="border borde p-6">
              <p>Para canjear el código necesitás una cuenta: así el libro queda tuyo y lo leés desde cualquier dispositivo.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={`/ingresar?aviso=canjear&volver=${encodeURIComponent(volver)}`} className="boton boton-lleno">
                  Ingresar
                </Link>
                <Link href={`/crear-cuenta?volver=${encodeURIComponent(volver)}`} className="boton">
                  Crear cuenta
                </Link>
              </div>
            </div>
          )}
          <p className="texto-2 text-sm mt-10">Cada código sirve una sola vez, para una sola cuenta.</p>
          <aside className="mt-12 border-t borde pt-8" aria-labelledby="codigos-prueba">
            <h2 id="codigos-prueba" className="text-xl mb-2">
              Códigos de prueba
            </h2>
            <p className="texto-2 text-sm mb-4">Solo existen en este prototipo.</p>
            <ul className="texto-2 text-sm space-y-1 font-mono">
              <li>REC-7K3M-Q9TD-4HXA · La Receta de la Manifestación</li>
              <li>PEN-4TQ8-HX2K-9MWB · El Pensamiento es Tu Fe</li>
              <li>BIO-9VEH-5KMT-2QZR · Biografía</li>
            </ul>
          </aside>
        </div>
      </section>
    </>
  );
}
