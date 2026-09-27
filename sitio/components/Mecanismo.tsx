"use client";
import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import styles from "./Mecanismo.module.css";

/*
 * La pieza firma del sitio: alguien encuentra las piezas sueltas de una máquina
 * compleja y las arma de vuelta. Tres anillos grabados (los tres libros) arrancan
 * girados y, a medida que el mecanismo atraviesa la pantalla, vuelven a 0°:
 * la marca de cada anillo queda bajo el ◆ fijo de arriba, el ojo del centro se
 * abre y aparece la leyenda (children).
 *
 * Los capítulos de cada libro van en el mismo ángulo en los tres anillos, así que
 * al alinearse cada número de capítulo queda en la misma línea en los tres libros
 * (la sincronía capítulo a capítulo). Por ahora cada anillo marca solo el 0
 * (`capitulos: 1`): la cantidad de capítulos de los libros todavía no está
 * definida y no se muestra. Cuando lo esté, se sube `capitulos` en ANILLOS.
 */

const C = 300; // centro del dibujo (viewBox 600 × 600)
const RAD = Math.PI / 180;
const ALINEA = 0.97; // progreso a partir del cual se considera alineado
const DESALINEA = 0.9; // umbral de vuelta (evita parpadeos en el borde)

const CAPITULOS = ["0", "I", "II", "III", "IV", "V", "VI"];
/** Ángulo de cada capítulo (grados, en sentido horario desde arriba); el 0 queda sobre la vertical. */
const ANGULO_CAPITULO = [0, 40, 80, 120, 240, 280, 320];

type Anillo = {
  numeral: string;
  pregunta: string;
  ext: number; // radio del borde exterior
  int: number; // radio del borde interior
  paso: number; // grados entre marcas finas
  medio: number; // cada cuántos grados va una marca media
  capitulos: number; // cuántos capítulos tiene el libro (desde el 0)
  inicio: number; // giro inicial, en grados
  demora: number; // cuánto tarda en empezar a girar (fracción del progreso)
};

const ANILLOS: Anillo[] = [
  { numeral: "I", pregunta: "¿Cómo funciona?", ext: 272, int: 228, paso: 2, medio: 10, capitulos: 1, inicio: 52, demora: 0 },
  { numeral: "II", pregunta: "¿Por qué funciona?", ext: 218, int: 174, paso: 5, medio: 20, capitulos: 1, inicio: -78, demora: 0.1 },
  { numeral: "III", pregunta: "¿Quién lo descubrió?", ext: 164, int: 120, paso: 4, medio: 20, capitulos: 1, inicio: 131, demora: 0.2 },
];

const MARCO = 282; // aro fijo exterior
const BISEL = 110; // aro fijo alrededor del ojo
const ESCALA_OJO = 2.5;

const n = (v: number) => Math.round(v * 100) / 100;
/** Punto a radio r y ángulo a (grados, horario desde arriba). */
const punto = (r: number, a: number) => `${n(C + r * Math.sin(a * RAD))} ${n(C - r * Math.cos(a * RAD))}`;
const raya = (r1: number, r2: number, a: number) => `M${punto(r1, a)}L${punto(r2, a)}`;

/** Graduación de un anillo: marcas finas, medias y gruesas (en los capítulos del libro). */
function graduacion(a: Anillo) {
  const gruesas = new Set(ANGULO_CAPITULO.slice(1, a.capitulos));
  let finas = "";
  let medias = "";
  let fuertes = "";
  for (let g = a.paso; g < 360; g += a.paso) {
    if (gruesas.has(g)) fuertes += raya(a.ext, a.ext - 14, g);
    else if (g % a.medio === 0) medias += raya(a.ext, a.ext - 8, g);
    else finas += raya(a.ext, a.ext - 5, g);
  }
  return { finas, medias, fuertes };
}

const GRADUACIONES = ANILLOS.map(graduacion);

/** Radio donde se centran los textos de cada anillo. */
const radioTexto = (a: Anillo) => a.int + 14;

const RAYOS = Array.from({ length: 36 }, (_, i) => raya(86, i % 3 === 0 ? 100 : 95, i * 10)).join("");

/** Uniones fijas que aparecen entre anillo y anillo cuando todo coincide. */
const UNIONES = [
  [ANILLOS[0].int, ANILLOS[1].ext],
  [ANILLOS[1].int, ANILLOS[2].ext],
  [ANILLOS[2].int, BISEL],
]
  .map(([desde, hasta]) => `M${C} ${C - desde}V${C - hasta}`)
  .join("");

// Los lectores de pantalla leen «I, II, III» como letras: los anillos se nombran con palabras.
// Describe el estado (también vale con "reducir movimiento", donde nada gira).
const ETIQUETA =
  "Mecanismo de tres anillos, uno por cada libro de la trilogía. El exterior es La Receta de la Manifestación: ¿Cómo funciona? El del medio, El Pensamiento es Tu Fe: ¿Por qué funciona? El interior, Biografía: ¿Quién lo descubrió? Las marcas de los tres anillos coinciden sobre una misma vertical y en el centro hay un ojo.";

/** Atributos comunes de las capas: todas comparten el mismo dibujo de 600 × 600. */
const CAPA = {
  viewBox: "0 0 600 600",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export default function Mecanismo({ className, children }: { className?: string; children?: ReactNode }) {
  const disco = useRef<HTMLDivElement>(null);
  const anillos = useRef<(SVGSVGElement | null)[]>([]);
  const alineadoRef = useRef(false);
  const [alineado, setAlineado] = useState(false);
  const uid = "mec" + useId().replace(/[^a-zA-Z0-9_-]/g, "");

  useEffect(() => {
    const el = disco.current;
    if (!el) return;
    // Con "reducir movimiento": alineado y quieto desde el principio, sin escuchar el scroll.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      alineadoRef.current = true;
      setAlineado(true);
      return;
    }

    let objetivo = 0;
    let actual = 0;
    let raf = 0;
    let escuchando = false;

    // 0 cuando el borde superior entra por abajo; 1 cuando el centro llega al centro de la pantalla,
    // o antes si la página se termina primero (cerca del pie, o en pantallas altas): así siempre alinea.
    // `fin` no cambia mientras se baja (es lo que queda de página desde el borde superior del disco),
    // así que el progreso sigue siendo lineal.
    const medir = () => {
      const r = el.getBoundingClientRect();
      const doc = document.documentElement;
      const alto = window.innerHeight || doc.clientHeight;
      const falta = Math.max(0, doc.scrollHeight - alto - window.scrollY);
      const fin = Math.min(alto / 2 + r.height / 2, alto - r.top + falta);
      const p = (alto - r.top) / Math.max(1, fin);
      return Math.min(1, Math.max(0, p));
    };

    const pintar = (p: number) => {
      ANILLOS.forEach((a, i) => {
        const capa = anillos.current[i];
        if (!capa) return;
        const t = Math.min(1, Math.max(0, (p - a.demora) / (ALINEA - a.demora)));
        const suave = 1 - Math.pow(1 - t, 3); // llega despacio, como una pieza que encaja
        capa.style.transform = `rotate(${n(a.inicio * (1 - suave))}deg)`;
      });
      if (!alineadoRef.current && p >= ALINEA) {
        alineadoRef.current = true;
        setAlineado(true);
      } else if (alineadoRef.current && p < DESALINEA) {
        alineadoRef.current = false;
        setAlineado(false);
      }
    };

    // El giro sigue al scroll con un poco de inercia: las piezas tienen peso. La inercia se
    // calcula con el tiempo de cada frame (a 60 Hz, 0,14 por frame), así pesan lo mismo a 30, 60 o 120 Hz.
    let antes = 0;
    const paso = (t: number) => {
      const dt = antes ? Math.min(64, Math.max(0, t - antes)) : 16.7;
      antes = t;
      actual += (objetivo - actual) * (1 - Math.pow(0.86, dt / 16.7));
      if (Math.abs(objetivo - actual) < 0.0008) actual = objetivo;
      pintar(actual);
      if (actual !== objetivo) raf = requestAnimationFrame(paso);
      else {
        raf = 0;
        antes = 0;
      }
    };
    const pedir = () => {
      objetivo = medir();
      if (!raf) raf = requestAnimationFrame(paso);
    };

    // Cada anillo es su propia capa: el compositor la gira sin volver a pintar el dibujo.
    const capas = (v: string) => anillos.current.forEach((capa) => capa && (capa.style.willChange = v));

    const encender = () => {
      if (escuchando) return;
      escuchando = true;
      capas("transform");
      window.addEventListener("scroll", pedir, { passive: true });
      window.addEventListener("resize", pedir, { passive: true });
      pedir();
    };
    const apagar = () => {
      if (escuchando) {
        escuchando = false;
        capas("");
        window.removeEventListener("scroll", pedir);
        window.removeEventListener("resize", pedir);
      }
      pedir(); // deja el último estado: si quedó por arriba de la pantalla, alineado
    };

    const io =
      "IntersectionObserver" in window
        ? new IntersectionObserver((entradas) => {
            for (const e of entradas) (e.isIntersecting ? encender : apagar)();
          })
        : null;
    const arrancar = () => (io ? io.observe(el) : encender());

    // Mientras está la bienvenida, el mecanismo espera: empieza al entrar.
    const html = document.documentElement;
    if (html.classList.contains("en-umbral")) window.addEventListener("umbral:abierto", arrancar, { once: true });
    else arrancar();

    return () => {
      io?.disconnect();
      window.removeEventListener("umbral:abierto", arrancar);
      window.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", pedir);
      cancelAnimationFrame(raf);
    };
  }, []);

  const clases = [styles.mecanismo, alineado ? `${styles.alineado} alineado` : "", className ?? ""].filter(Boolean).join(" ");

  return (
    <figure className={clases} data-alineado={alineado ? "true" : "false"}>
      {/* Capas superpuestas: la montura, los tres anillos (cada uno gira entero, como capa) y los fijos del centro */}
      <div ref={disco} className={styles.disco} role="img" aria-label={ETIQUETA}>
        {/* Aro fijo: la montura del mecanismo */}
        <svg className={styles.svg} {...CAPA}>
          <g className={styles.fino}>
            <circle cx={C} cy={C} r={MARCO} strokeWidth={1} />
            <path d={[90, 180, 270].map((a) => raya(MARCO, MARCO + 6, a)).join("")} strokeWidth={0.8} />
          </g>
          <circle className={styles.puntos} cx={C} cy={C} r={MARCO + 7} strokeWidth={1.4} strokeDasharray="0.01 7" />
        </svg>

        {/* Los tres anillos: I (exterior), II (medio), III (interior) */}
        {ANILLOS.map((a, i) => {
          const rt = radioTexto(a);
          const rq = rt + 4.5;
          const grad = GRADUACIONES[i];
          const sep = a.ext - 11;
          return (
            <svg
              key={a.numeral}
              ref={(capa) => {
                anillos.current[i] = capa;
              }}
              className={`${styles.svg} ${styles.anillo}`}
              style={{ "--inicio": `${a.inicio}deg` } as CSSProperties}
              {...CAPA}
            >
              <defs>
                <path id={`${uid}-q${i}`} d={`M${C - rq} ${C}A${rq} ${rq} 0 0 0 ${C + rq} ${C}`} />
              </defs>
              <circle cx={C} cy={C} r={a.ext} strokeWidth={1.1} />
              <circle cx={C} cy={C} r={a.int} strokeWidth={1} />
              <g className={styles.fino}>
                <circle cx={C} cy={C} r={sep} strokeWidth={0.7} />
                <path d={grad.finas} strokeWidth={0.7} />
                <path d={grad.medias} strokeWidth={0.9} />
              </g>
              <path d={grad.fuertes} strokeWidth={1.2} />

              {/* La marca que se alinea bajo el ◆ */}
              <polygon
                className={styles.marca}
                points={`${C},${C - a.ext + 1.5} ${C + 4},${C - a.ext + 10} ${C - 4},${C - a.ext + 10}`}
                fill="currentColor"
                stroke="none"
              />

              {/* Los capítulos del libro */}
              <g className={styles.texto} fill="currentColor" stroke="none" fontSize={13}>
                {CAPITULOS.slice(0, a.capitulos).map((c, k) => {
                  const ang = ANGULO_CAPITULO[k];
                  const y = C - rt;
                  const derecho = ang > 90 && ang < 270 ? ` rotate(180 ${C} ${y})` : "";
                  return (
                    <text
                      key={c}
                      x={C}
                      y={y}
                      transform={`rotate(${ang} ${C} ${C})${derecho}`}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className={k === 0 ? `${styles.capitulo} ${styles.marca}` : styles.capitulo}
                    >
                      {c}
                    </text>
                  );
                })}
              </g>

              {/* Numeral del libro y su pregunta, siguiendo la curva */}
              <text className={`${styles.texto} ${styles.pregunta}`} fill="currentColor" stroke="none" fontSize={15} textAnchor="middle">
                <textPath href={`#${uid}-q${i}`} startOffset="50%">
                  <tspan className={styles.numeral}>{a.numeral}</tspan>
                  <tspan>{" · "}</tspan>
                  <tspan className={styles.cursiva}>{a.pregunta}</tspan>
                </textPath>
              </text>
            </svg>
          );
        })}

        {/* Fijos: el ◆ que señala la vertical, las uniones que aparecen al alinearse y el centro */}
        <svg className={styles.svg} {...CAPA}>
          <polygon
            className={styles.marca}
            points={`${C},${C - MARCO - 8} ${C + 6},${C - MARCO} ${C},${C - MARCO + 8} ${C - 6},${C - MARCO}`}
            fill="currentColor"
            stroke="none"
          />
          <path className={styles.uniones} d={UNIONES} strokeWidth={1} />

          {/* El centro: bisel, rayos y el ojo del sitio */}
          <circle cx={C} cy={C} r={BISEL} strokeWidth={1} />
          <circle className={styles.puntos} cx={C} cy={C} r={BISEL - 6} strokeWidth={1.2} strokeDasharray="0.01 5" />
          <path className={`${styles.fino} ${styles.rayos}`} d={RAYOS} strokeWidth={0.7} />
          <g transform={`translate(${C - 32 * ESCALA_OJO} ${C - 32 * ESCALA_OJO}) scale(${ESCALA_OJO})`}>
            <path className={styles.parpado} d="M4 32 C 15 16, 49 16, 60 32 C 49 48, 15 48, 4 32 Z" strokeWidth={1.3} />
            <g className={styles.iris}>
              <circle cx="32" cy="32" r="9.5" strokeWidth={1.3} />
              <circle cx="32" cy="32" r="3.2" fill="currentColor" stroke="none" />
            </g>
          </g>
        </svg>
      </div>
      {children ? <figcaption className={styles.leyenda}>{children}</figcaption> : null}
    </figure>
  );
}
