import Link from "next/link";
import Ojo from "@/components/Ojo";

export default function NoEncontrada() {
  return (
    <section className="px-5 py-24 text-center">
      <Ojo size={40} className="mx-auto mb-8" />
      <h1 className="titulo text-4xl">Esta página no existe</h1>
      <p className="texto-2 mt-5">Puede que el link esté mal escrito o que la página se haya movido.</p>
      <Link href="/" className="boton mt-10">
        Volver al inicio
      </Link>
    </section>
  );
}
