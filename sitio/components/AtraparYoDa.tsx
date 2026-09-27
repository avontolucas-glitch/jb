"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import OjoPixel from "./OjoPixel";
import { DURACION_MS, EVENTO_ATRAPAR, EVENTO_ATRAPAR_FIN, anotar, nivelActual, type Resultado } from "@/lib/atrapar";

/**
 * «Atrapame»: Yo Da sale de su rincón y vuela rapidísimo por la página, como la
 * snitch dorada: sale disparado, frena, flota un instante, esquiva si el dedo
 * pasa cerca, y vuelve a salir. Si lo tocás, ganás. Tiene 15 segundos (la línea
 * de arriba se va acortando); al terminar vuelve a su rincón y Yo Da cuenta
 * cómo salió (components/YoSoy.tsx). Con cada vez que lo atrapan, vuela más
 * rápido. El vuelo se mueve fuera de React (un requestAnimationFrame que escribe
 * el transform): así anda liso también en el celular.
 * Sin movimiento (si la persona lo pidió): aparece y desaparece en lugares al azar.
 */

type Punto = { x: number; y: number };

const W = 56; // el ojo en vuelo: la grilla de 32 × 9, a 56 px
const H = Math.round((W * 9) / 32);
const PAD = 18; // el lugar donde se puede tocar es más grande que el ojo
const EN_CASA = 48 / W;
const MARGEN = 14;
const CLASE = "en-juego";

/** El centro del ojo del rincón, para salir de ahí y volver ahí. */
function casa(): Punto | null {
  const b = document.querySelector('[data-recorrido="yoda"] .ojo-pixel')?.getBoundingClientRect();
  return b && b.width > 2 ? { x: b.left + b.width / 2, y: b.top + b.height / 2 } : null;
}

const azar = (a: number, b: number) => a + Math.random() * (b - a);
const suave = (t: number) => 0.5 - Math.cos(Math.PI * t) / 2;

export default function AtraparYoDa() {
  const [activo, setActivo] = useState(false);
  const [estado, setEstado] = useState<"volando" | "atrapado" | "volviendo">("volando");
  const [chispas, setChispas] = useState<Punto | null>(null);
  const yo = useRef<HTMLButtonElement>(null);
  const pos = useRef<Punto>({ x: 0, y: 0 }); // el centro del ojo
  const raf = useRef(0);
  const fin = useRef<number | undefined>(undefined);
  const inicio = useRef(0);
  const nivel = useRef(1);
  const terminado = useRef(false);
  const esquivar = useRef<Punto | null>(null);
  const previo = useRef<HTMLElement | null>(null);

  const pintar = (p: Punto, escala = 1) => {
    pos.current = p;
    if (yo.current) yo.current.style.transform = `translate3d(${p.x - W / 2 - PAD}px, ${p.y - H / 2 - PAD}px, 0) scale(${escala})`;
  };

  // el ojo del rincón se oculta en el mismo cuadro en que aparece el que vuela (uno solo, nunca dos)
  useLayoutEffect(() => {
    if (!activo) return;
    const html = document.documentElement;
    html.classList.add(CLASE);
    return () => html.classList.remove(CLASE);
  }, [activo]);

  const terminar = useCallback((atrapado: boolean, salio = false) => {
    if (terminado.current) return;
    terminado.current = true;
    cancelAnimationFrame(raf.current);
    window.clearTimeout(fin.current);
    const ms = performance.now() - inicio.current;
    const recordAnterior = salio ? null : anotar(atrapado, ms);
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (atrapado) {
      setEstado("atrapado");
      setChispas({ ...pos.current });
    }
    // vuelve a su rincón y, al posarse, vuelve a ser el de siempre
    window.setTimeout(
      () => {
        setEstado("volviendo");
        const c = casa();
        if (c && yo.current && !quieto) {
          yo.current.style.transition = "transform 0.8s cubic-bezier(0.45, 0, 0.2, 1)";
          pintar(c, EN_CASA);
        }
        window.setTimeout(
          () => {
            setActivo(false);
            setChispas(null);
            const r: Resultado = { atrapado, ms, nivel: nivel.current, recordAnterior, salio };
            window.dispatchEvent(new CustomEvent<Resultado>(EVENTO_ATRAPAR_FIN, { detail: r }));
            const volver = previo.current?.isConnected ? previo.current : document.querySelector<HTMLElement>('[data-recorrido="yoda"]');
            volver?.focus({ preventScroll: true });
          },
          quieto ? 0 : 820,
        );
      },
      atrapado ? 650 : 0,
    );
  }, []);

  // arranca: sale del rincón
  useEffect(() => {
    const empezar = () => {
      if (activo || document.querySelector("[data-testid=recorrido]")) return;
      previo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      terminado.current = false;
      nivel.current = nivelActual();
      esquivar.current = null;
      setEstado("volando");
      setChispas(null);
      setActivo(true);
    };
    window.addEventListener(EVENTO_ATRAPAR, empezar);
    return () => window.removeEventListener(EVENTO_ATRAPAR, empezar);
  }, [activo]);

  // el vuelo
  useEffect(() => {
    if (!activo) return;
    const el = yo.current;
    if (!el) return;
    el.style.transition = "none";
    const origen = casa() ?? { x: window.innerWidth - 60, y: window.innerHeight - 60 };
    pintar(origen, EN_CASA);
    inicio.current = performance.now();
    fin.current = window.setTimeout(() => terminar(false), DURACION_MS);
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tactil = window.matchMedia("(pointer: coarse)").matches;
    const lugar = (): Punto => ({
      x: azar(MARGEN + W / 2, window.innerWidth - MARGEN - W / 2),
      y: azar(MARGEN + H / 2 + 8, window.innerHeight - MARGEN - H / 2 - 8),
    });

    // sin movimiento: aparece en un lugar, se queda un momento y aparece en otro
    if (quieto) {
      let t: number | undefined;
      const saltar = () => {
        pintar(lugar());
        t = window.setTimeout(saltar, Math.max(520, 1100 - nivel.current * 70));
      };
      t = window.setTimeout(saltar, 300);
      return () => window.clearTimeout(t);
    }

    // velocidad (px por segundo): rapidísimo, un poco menos con el dedo, y más con cada nivel
    const lado = Math.min(window.innerWidth, window.innerHeight);
    const velocidad = Math.min(1900, Math.max(760, lado * 1.9)) * (tactil ? 0.72 : 1) * (1 + 0.14 * (nivel.current - 1));
    let tramo = { desde: { ...origen }, hasta: lugar(), t0: performance.now() + 380, dur: 0, curva: 0 };
    let flota = 0; // hasta cuándo se queda flotando
    const armarTramo = (desde: Punto, ahora: number, hasta = lugar()) => {
      const d = Math.hypot(hasta.x - desde.x, hasta.y - desde.y);
      tramo = { desde, hasta, t0: ahora, dur: Math.max(140, (d / velocidad) * 1000), curva: azar(-0.28, 0.28) * Math.min(d, 260) };
    };
    armarTramo(origen, performance.now() + 380);

    const cuadro = (ahora: number) => {
      raf.current = requestAnimationFrame(cuadro);
      // esquiva: si tocaron cerca y no le dieron, sale disparado para el otro lado
      const e = esquivar.current;
      if (e) {
        esquivar.current = null;
        const p = pos.current;
        const dx = p.x - e.x || 1;
        const dy = p.y - e.y || 1;
        const n = Math.hypot(dx, dy);
        const lejos = { x: p.x + (dx / n) * lado * 0.45, y: p.y + (dy / n) * lado * 0.45 };
        lejos.x = Math.min(window.innerWidth - MARGEN - W / 2, Math.max(MARGEN + W / 2, lejos.x));
        lejos.y = Math.min(window.innerHeight - MARGEN - H / 2, Math.max(MARGEN + H / 2, lejos.y));
        flota = 0;
        armarTramo({ ...p }, ahora, lejos);
      }
      if (ahora < tramo.t0) return;
      if (ahora < flota) {
        // flota en el lugar, temblando apenas, como la snitch antes de salir disparada
        const f = (ahora / 60) % (Math.PI * 2);
        pintar({ x: tramo.hasta.x + Math.sin(f * 1.7) * 2.2, y: tramo.hasta.y + Math.cos(f * 2.3) * 2.6 });
        return;
      }
      const t = Math.min(1, (ahora - tramo.t0) / tramo.dur);
      const k = suave(t);
      const { desde, hasta } = tramo;
      const dx = hasta.x - desde.x;
      const dy = hasta.y - desde.y;
      const d = Math.hypot(dx, dy) || 1;
      // una curva suave hacia un costado, y un vaivén chiquito
      const lateral = Math.sin(Math.PI * t) * tramo.curva + Math.sin(t * Math.PI * 6) * 3;
      pintar({ x: desde.x + dx * k - (dy / d) * lateral, y: desde.y + dy * k + (dx / d) * lateral });
      if (t >= 1) {
        const pausa = Math.random() < 0.35 ? 0 : azar(90, Math.max(140, 420 - nivel.current * 30));
        flota = ahora + pausa;
        armarTramo({ ...tramo.hasta }, ahora + pausa);
      }
    };
    raf.current = requestAnimationFrame(cuadro);
    return () => cancelAnimationFrame(raf.current);
  }, [activo, terminar]);

  // Esc: sale del juego
  useEffect(() => {
    if (!activo) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") terminar(false, true);
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [activo, terminar]);

  useEffect(
    () => () => {
      cancelAnimationFrame(raf.current);
      window.clearTimeout(fin.current);
    },
    [],
  );

  if (!activo) return null;
  return (
    <div className={`atrapar ${estado}`} data-testid="atrapar" data-nivel={nivel.current}>
      {/* lo que se toque fuera de Yo Da no navega: es un intento; si pasó cerca, esquiva */}
      <div
        className="atrapar-capa"
        onPointerDown={(e) => {
          if (estado !== "volando") return;
          const p = pos.current;
          if (Math.hypot(e.clientX - p.x, e.clientY - p.y) < 150) esquivar.current = { x: e.clientX, y: e.clientY };
        }}
        aria-hidden="true"
      />
      <div className="atrapar-tiempo" style={{ animationDuration: `${DURACION_MS}ms` }} aria-hidden="true" />
      <p className="atrapar-pista firma" aria-live="polite">
        {estado === "atrapado" ? "¡Atrapado!" : "Tocá a Yo Da"}
      </p>
      <button type="button" className="atrapar-salir enlace texto-2 text-sm" onClick={() => terminar(false, true)} data-testid="atrapar-salir">
        Salir
      </button>
      <button
        ref={yo}
        type="button"
        className={`atrapar-yo ${estado}`}
        style={{ padding: PAD }}
        onPointerDown={(e) => {
          e.preventDefault();
          if (estado === "volando") terminar(true);
        }}
        onClick={() => {
          // con el teclado (Enter o espacio sobre él) también vale
          if (estado === "volando") terminar(true);
        }}
        aria-label="Atrapar a Yo Da"
        data-testid="atrapar-yo"
      >
        <span className="atrapar-yo-cuerpo">
          <OjoPixel size={W} mira={0} />
        </span>
      </button>
      {chispas && (
        <span className="atrapar-chispas" style={{ left: chispas.x, top: chispas.y }} aria-hidden="true">
          {Array.from({ length: 10 }, (_, i) => (
            <i key={i} style={{ ["--a" as string]: `${i * 36}deg` }} />
          ))}
        </span>
      )}
    </div>
  );
}
