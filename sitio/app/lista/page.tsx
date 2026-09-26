import type { Metadata } from "next";
import Apertura from "@/components/Apertura";
import Formulario, { Campo } from "@/components/Formulario";
import CanalContacto from "@/components/CanalContacto";
import { accionLista } from "@/lib/acciones";
import { lista } from "@/content/config";

export const metadata: Metadata = { title: "Sumate a la lista" };

export default async function Lista({ searchParams }: { searchParams: Promise<{ interes?: string }> }) {
  const { interes } = await searchParams;
  return (
    <>
      <Apertura titulo={lista.titulo} bajada={lista.bajada} />
      <section className="hondo border-t borde px-5 py-16">
        <div className="mx-auto max-w-xl revelar">
          <Formulario accion={accionLista} boton="Sumarme" ocultarAlTerminar>
            <input type="hidden" name="interes" value={interes ?? "general"} />
            <Campo nombre="nombre" etiqueta="Nombre" autoComplete="given-name" requerido={false} />
            <CanalContacto />
          </Formulario>
          <p className="texto-2 text-sm mt-10">
            Tus datos se usan solo para avisarte. Podés pedir que te saquemos de la lista cuando quieras.
          </p>
        </div>
      </section>
    </>
  );
}
