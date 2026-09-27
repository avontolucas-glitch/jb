"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { sitio } from "@/content/config";
import { frases, tituloLibro, type Frase } from "@/content/frases";

type Libro = Frase["libro"];

/**
 * Elige la próxima frase sin repetir hasta haber mostrado todas: cada lista
 * (todas, o las de un libro) guarda en el dispositivo un orden barajado y por
 * dónde va. La primera vez se ve la frase propia de la página (y cuenta como
 * vista); desde la segunda, van cambiando. Si no hay almacenamiento, queda la
 * frase de la página.
 */
function proxima(libro: Libro | undefined, actual: string, primeraVez = false): Frase | null {
  const lista = libro ? frases.filter((f) => f.libro === libro) : frases;
  if (lista.length < 2) return null;
  const clave = `jb-frases-${libro ?? "todas"}`;
  const barajar = (primera?: string) => {
    const orden = lista.map((f) => f.texto).filter((t) => t !== primera);
    for (let i = orden.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [orden[i], orden[j]] = [orden[j], orden[i]];
    }
    return primera ? [primera, ...orden] : orden;
  };
  try {
    let estado: { orden: string[]; pos: number } | null = JSON.parse(localStorage.getItem(clave) ?? "null");
    const vigente = estado && estado.orden.length === lista.length && estado.orden.every((t) => lista.some((f) => f.texto === t));
    if (!estado || !vigente) {
      // primera visita: se queda la frase de la página
      const propia = lista.some((f) => f.texto === actual) ? actual : undefined;
      estado = { orden: barajar(propia), pos: propia ? 1 : 0 };
      if (propia && primeraVez) {
        localStorage.setItem(clave, JSON.stringify(estado));
        return null;
      }
    }
    if (estado.pos >= estado.orden.length) estado = { orden: barajar(), pos: 0 };
    let texto = estado.orden[estado.pos++];
    if (texto === actual) {
      if (estado.pos >= estado.orden.length) estado = { orden: barajar(), pos: 0 };
      texto = estado.orden[estado.pos++];
    }
    localStorage.setItem(clave, JSON.stringify(estado));
    return lista.find((f) => f.texto === texto) ?? null;
  } catch {
    return null;
  }
}

/**
 * Epígrafe: una frase textual de los libros de Julián, distinta cada vez que
 * se entra a la página (con `libro`, solo de ese libro). Las palabras aparecen
 * de a una cuando el bloque llega a la pantalla; tocando «Otra frase» se
 * disuelve y llega la siguiente.
 */
export default function Epigrafe({ cita, libro, className = "" }: { cita: string; libro?: Libro; className?: string }) {
  const inicial = frases.find((f) => f.texto === cita);
  const [frase, setFrase] = useState<{ texto: string; libro?: Libro }>({ texto: cita, libro: inicial?.libro });
  const [vuelta, setVuelta] = useState(0);
  const figura = useRef<HTMLElement>(null);
  const girando = useRef(false);

  // antes de pintar: así la frase cambia sin que se vea la anterior
  useLayoutEffect(() => {
    const f = proxima(libro, cita, true);
    if (f) setFrase(f);
  }, [libro, cita]);

  // la frase nueva vuelve a aparecer de a una palabra
  useEffect(() => {
    const el = figura.current;
    if (!vuelta || !el) return;
    el.classList.remove("epigrafe-sale");
    const a = requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("visto")));
    girando.current = false;
    return () => cancelAnimationFrame(a);
  }, [vuelta]);

  const otra = () => {
    const el = figura.current;
    if (!el || girando.current) return;
    girando.current = true;
    el.classList.add("epigrafe-sale");
    el.classList.remove("visto");
    window.setTimeout(() => {
      const f = proxima(libro, frase.texto);
      if (f) setFrase(f);
      setVuelta((v) => v + 1);
    }, 600);
  };

  const palabras = `«${frase.texto}»`.split(" ");
  return (
    <figure ref={figura} className={`epigrafe prosa mx-auto text-center palabras revelar ${className}`} data-testid="epigrafe">
      <blockquote className="italic text-lg leading-relaxed" key={vuelta}>
        <span className="sr-only">«{frase.texto}»</span>
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
        {frase.libro && <span className="epigrafe-libro"> · {tituloLibro[frase.libro]}</span>}
      </figcaption>
      <p className="sr-only" aria-live="polite">{vuelta ? `«${frase.texto}»` : ""}</p>
      <div>
        <button type="button" onClick={otra} className="epigrafe-otra p" style={{ ["--i" as string]: palabras.length + 5 }} data-sonido="toque">
          <span aria-hidden="true">◆</span> Otra frase
        </button>
      </div>
    </figure>
  );
}
