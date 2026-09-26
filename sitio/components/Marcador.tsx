import { MARCADOR, sitio } from "@/content/config";

/** Muestra el texto; si es el marcador de Julian, lo destaca como pendiente. */
export default function Texto({ children, bloque = false }: { children: string; bloque?: boolean }) {
  if (children === MARCADOR) {
    return bloque ? (
      <p className="marcador-bloque" data-marcador>
        {MARCADOR} <span className="texto-2">— lo escribe {sitio.nombreCorto}.</span>
      </p>
    ) : (
      <span className="marcador" data-marcador>
        {MARCADOR}
      </span>
    );
  }
  return bloque ? <p>{children}</p> : <>{children}</>;
}
