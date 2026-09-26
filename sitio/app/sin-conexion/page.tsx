import type { Metadata } from "next";
import Ojo from "@/components/Ojo";

export const metadata: Metadata = { title: "Sin conexión" };

export default function SinConexion() {
  return (
    <section className="px-5 py-24 text-center">
      <Ojo size={40} className="mx-auto mb-8" />
      <h1 className="titulo text-4xl">Sin conexión</h1>
      <p className="texto-2 mt-5 prosa mx-auto">No hay internet en este momento. Cuando vuelva, tocá Reintentar.</p>
      <a href="/" className="boton mt-10">
        Reintentar
      </a>
    </section>
  );
}
