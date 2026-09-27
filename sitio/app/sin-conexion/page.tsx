import type { Metadata } from "next";
import Apertura from "@/components/Apertura";

export const metadata: Metadata = { title: "Sin conexión" };

/**
 * La página que muestra la app sin internet (el service worker la guarda de
 * antemano). Va sin grabado: la imagen puede no estar guardada en el teléfono.
 */
export default function SinConexion() {
  return (
    <Apertura titulo="Sin conexión" bajada="No hay internet en este momento. Cuando vuelva, tocá Reintentar." folio="XVI">
      <a href="/" className="boton mt-10">
        Reintentar
      </a>
    </Apertura>
  );
}
