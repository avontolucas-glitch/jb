import { sitio } from "@/content/config";

/** Espacio reservado para una foto real de Julian (no se usan imágenes de stock). */
export default function EspacioFoto({ texto = `Foto de ${sitio.nombreCorto}`, proporcion = "4 / 5", className = "" }: { texto?: string; proporcion?: string; className?: string }) {
  return (
    <div
      className={`marcador-bloque flex items-center justify-center text-center ${className}`}
      style={{ aspectRatio: proporcion }}
      role="img"
      aria-label={`Espacio reservado: ${texto}`}
    >
      <span className="text-sm">[{texto.toUpperCase()}]</span>
    </div>
  );
}
