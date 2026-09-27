import Link from "next/link";
import Apertura from "@/components/Apertura";

/** Página que no existe: portadilla con el ojo que llora (Biografía, cap. 2). */
export default function NoEncontrada() {
  return (
    <Apertura
      titulo="Esta página no existe"
      bajada="Puede que el link esté mal escrito o que la página se haya movido."
      folio="XV"
      grabado={{ src: "/grabados/biografia-ojo.webp", alt: "Grabado: el ojo que llora", pie: "El desastre · Biografía, cap. 2" }}
    >
      <Link href="/" className="boton mt-10">
        Volver al inicio
      </Link>
    </Apertura>
  );
}
