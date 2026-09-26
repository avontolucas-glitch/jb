import { sitio } from "@/content/config";

/** Epígrafe: las palabras aparecen de a una cuando el bloque llega a la pantalla. */
export default function Epigrafe({ cita, className = "" }: { cita: string; className?: string }) {
  const palabras = `«${cita}»`.split(" ");
  return (
    <figure className={`prosa mx-auto text-center palabras revelar ${className}`}>
      <blockquote className="italic text-lg leading-relaxed">
        <span className="sr-only">«{cita}»</span>
        <span aria-hidden="true">
          {palabras.map((p, i) => (
            <span key={i}>
              <span className="p" style={{ ["--i" as string]: i }}>
                {p}
              </span>{" "}
            </span>
          ))}
        </span>
      </blockquote>
      <figcaption className="firma mt-3 text-sm texto-2 p" style={{ ["--i" as string]: palabras.length + 2 }}>
        {sitio.nombre}
      </figcaption>
    </figure>
  );
}
