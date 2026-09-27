import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Apertura from "@/components/Apertura";
import { portadillas } from "@/content/config";
import Formulario, { Campo } from "@/components/Formulario";
import { accionIngresar } from "@/lib/acciones";
import { adminDemoActivo, usuarioActual } from "@/lib/auth";
import { avisos, volverSeguro } from "@/components/Avisos";

export const metadata: Metadata = { title: "Ingresar" };

/** Cuentas de prueba del prototipo (clave: demo1234). */
const demos = [
  { email: "sincompras@demo.com", quien: "Cuenta sin compras" },
  { email: "comprador@demo.com", quien: "Cuenta con la masterclass" },
];
/**
 * La de Julián ve las reservas de todos: solo aparece (y solo vale como suya)
 * si el servidor tiene JB_ADMIN_DEMO=1. En el sitio publicado, Julián entra
 * con su cuenta privada (ADMIN_EMAIL y ADMIN_CLAVE), que no se muestra acá.
 */
const demoJulian = { email: "julian@demo.com", quien: "Cuenta de Julián (agenda)" };

type P = { searchParams: Promise<{ aviso?: string; volver?: string }> };

export default async function Ingresar({ searchParams }: P) {
  const { aviso, volver } = await searchParams;
  const destino = volverSeguro(volver);
  if (await usuarioActual()) redirect(destino);
  const cuentas = adminDemoActivo() ? [...demos, demoJulian] : demos;
  return (
    <>
    <Apertura titulo="Ingresar" bajada="Tu espacio: lo que compraste, tus directos y tus lecturas." {...portadillas.ingresar} />
    <section className="hondo border-t borde px-5 py-16 sm:py-20">
      <div className="mx-auto max-w-md revelar">
        {aviso && avisos[aviso] && (
          <p role="alert" className="border borde p-4 mb-8" data-testid="aviso">
            {avisos[aviso]}
          </p>
        )}
        <Formulario accion={accionIngresar} boton="Ingresar" enviando="Ingresando…">
          <input type="hidden" name="volver" value={destino} />
          <Campo nombre="email" etiqueta="Mail" tipo="email" autoComplete="email" />
          <Campo nombre="clave" etiqueta="Clave" tipo="password" autoComplete="current-password" />
        </Formulario>
        <p className="mt-8">
          ¿No tenés cuenta?{" "}
          <Link href={`/crear-cuenta?volver=${encodeURIComponent(destino)}`} className="enlace">
            Creá una
          </Link>
          .
        </p>

        <aside className="mt-14 border-t borde pt-8" aria-labelledby="demos">
          <h2 id="demos" className="text-xl mb-2">
            Cuentas de prueba
          </h2>
          <p className="texto-2 text-sm mb-5">Solo existen en este prototipo. La clave de todas es demo1234.</p>
          <ul className="space-y-4">
            {cuentas.map((d) => (
              <li key={d.email}>
                <p>{d.quien}</p>
                <p className="texto-2 text-sm">
                  {d.email} · demo1234
                </p>
                <Formulario accion={accionIngresar} boton={`Entrar como ${d.email}`} enviando="Ingresando…" className="!space-y-0 mt-2">
                  <input type="hidden" name="email" value={d.email} />
                  <input type="hidden" name="clave" value="demo1234" />
                  <input type="hidden" name="volver" value={destino} />
                </Formulario>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
    </>
  );
}
