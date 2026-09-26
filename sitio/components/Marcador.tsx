import { esMarcador } from "@/content/config";

/** Muestra el texto; si todavía es un marcador «(… a definir)», lo destaca como pendiente. */
export default function Texto({ children, bloque = false }: { children: string; bloque?: boolean }) {
  if (esMarcador(children)) {
    return bloque ? (
      <p className="marcador-bloque" data-marcador>
        {children}
      </p>
    ) : (
      <span className="marcador" data-marcador>
        {children}
      </span>
    );
  }
  return bloque ? <p>{children}</p> : <>{children}</>;
}
