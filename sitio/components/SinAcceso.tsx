import Link from "next/link";
import Ojo from "./Ojo";

/** Lo que ve quien entra a una sección que todavía no tiene. */
export default function SinAcceso({ que, href, boton }: { que: string; href: string; boton: string }) {
  return (
    <div className="border borde p-6 sm:p-8" data-testid="sin-acceso">
      <Ojo size={24} className="mb-4" />
      <p className="text-lg">{que}</p>
      <Link href={href} className="boton boton-lleno mt-6">
        {boton}
      </Link>
    </div>
  );
}
