"use client";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import OjoPixel from "./OjoPixel";
import Tipeo from "./Tipeo";
import { nombreBot, recorrido, type Parada } from "@/content/yosoy";
import { EVENTO_RECORRIDO, marcarRecorridoVisto, type Inicio } from "@/lib/recorrido";

/**
 * El recorrido de Yo Da: sale de donde está (su rincón, o la cabecera del chat si
 * lo pidió ahí), y el ojo de siempre se oculta en el mismo cuadro en que aparece el
 * que vuela: uno solo, nunca dos, y sin parpadeo. Su círculo del rincón se disuelve
 * mientras anda y se vuelve a formar cuando regresa (en la última parada, «aquí me
 * quedo», se posa ahí). Vuela hasta cada cosa, la ilumina (el resto queda en
 * penumbra) y la explica en un globo. Se maneja con los
 * botones o el teclado (→ sigue, ← vuelve, Esc sale); el foco queda en el globo
 * y, al terminar, vuelve a donde estaba. Sin movimiento si la persona lo pidió.
 * Las paradas y sus textos: content/yosoy.ts → `recorrido`.
 */

type Caja = { x: number; y: number; w: number; h: number; redondo: boolean };
type Punto = { x: number; y: number };

const YO_W = 64; // el ojo en vuelo: la grilla de 32 × 9, al doble
const YO_H = 18;
/** En su rincón, el ojo mide 48 (components/YoSoy.tsx): al volver, el que vuela toma ese tamaño. */
const EN_CASA = 48 / YO_W;
/** En <html>: mientras dura el recorrido (el ojo del rincón y el del chat se ocultan; el círculo se disuelve). */
const CLASE = "en-recorrido";
/** En <html>: Yo Da está en su rincón o volviendo a él (el círculo se vuelve a formar). */
const CLASE_CASA = "recorrido-en-casa";
const MARGEN = 12;
const VUELO_MS = 950;

/** Los elementos de una parada que se ven ahora en pantalla. */
function visibles(donde: string[]): HTMLElement[] {
  const vh = window.innerHeight;
  return donde
    .flatMap((d) => Array.from(document.querySelectorAll<HTMLElement>(`[data-recorrido="${d}"]`)))
    .filter((el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2 || r.bottom <= 0 || r.top >= vh) return false;
      const cs = getComputedStyle(el);
      return cs.visibility !== "hidden" && Number(cs.opacity) > 0.05;
    });
}

/** El rectángulo que abarca los elementos de una parada, con un poco de aire. */
function cajaDe(donde: string[] | undefined): Caja | null {
  if (!donde) return null;
  const rs = visibles(donde).map((e) => e.getBoundingClientRect());
  if (!rs.length) return null;
  const x = Math.min(...rs.map((r) => r.left));
  const y = Math.min(...rs.map((r) => r.top));
  const w = Math.max(...rs.map((r) => r.right)) - x;
  const h = Math.max(...rs.map((r) => r.bottom)) - y;
  const redondo = rs.length === 1 && Math.abs(w - h) < 4;
  const aire = redondo ? 3 : 7;
  return {
    x: x - aire,
    y: y - aire,
    w: w + aire * 2,
    h: h + aire * 2,
    redondo,
  };
}

/** Dónde se posa Yo Da y dónde va el globo: debajo si la parada está arriba, encima si está abajo. */
function ubicar(c: Caja | null, vw: number, vh: number): { yo: Punto; globo: CSSProperties } {
  const gw = Math.min(320, vw - MARGEN * 2);
  const dentro = (x: number, w: number) => Math.max(MARGEN, Math.min(vw - w - MARGEN, x));
  if (!c) {
    const y = Math.round(vh * 0.32);
    return {
      yo: { x: dentro(vw / 2 - YO_W / 2, YO_W), y },
      globo: {
        left: dentro(vw / 2 - gw / 2, gw),
        top: y + YO_H + 18,
        width: gw,
      },
    };
  }
  const cx = c.x + c.w / 2;
  const x = dentro(cx - YO_W / 2, YO_W);
  const gx = dentro(cx - gw / 2, gw);
  if (c.y + c.h / 2 < vh / 2) {
    const y = c.y + c.h + 14;
    return { yo: { x, y }, globo: { left: gx, top: y + YO_H + 12, width: gw } };
  }
  const y = c.y - YO_H - 14;
  return { yo: { x, y }, globo: { left: gx, bottom: vh - y + 12, width: gw } };
}

/** Dónde queda el que vuela para calzar justo encima de un ojo que ya está en pantalla (mismo centro). */
function sobre(el: Element | null | undefined): { p: Punto; escala: number } | null {
  const b = el?.getBoundingClientRect();
  if (!b || b.width < 2) return null;
  return { p: { x: b.left + b.width / 2 - YO_W / 2, y: b.top + b.height / 2 - YO_H / 2 }, escala: b.width / YO_W };
}

/** El lugar de siempre de Yo Da (abajo a la derecha): ahí vuelve. */
function casa(): Punto | null {
  return sobre(document.querySelector('[data-recorrido="yoda"] .ojo-pixel'))?.p ?? null;
}

/** De dónde sale: de la cabecera del chat si estaba abierto (ahí es donde se lo ve), si no, de su rincón. */
function origen(): { p: Punto; escala: number } | null {
  return sobre(document.querySelector("#yosoy.abierto .yosoy-cabeza .ojo-pixel")) ?? sobre(document.querySelector('[data-recorrido="yoda"] .ojo-pixel'));
}

export default function RecorridoYoDa() {
  const [activo, setActivo] = useState(false);
  const [saliendo, setSaliendo] = useState(false);
  const [sesion, setSesion] = useState(false);
  const [paradas, setParadas] = useState<Parada[]>([]);
  const [i, setI] = useState(0);
  const [caja, setCaja] = useState<Caja | null>(null);
  const [yo, setYo] = useState<Punto | null>(null);
  const [globo, setGlobo] = useState<CSSProperties>({});
  const [volando, setVolando] = useState(0);
  const [giro, setGiro] = useState(1);
  const [enCasa, setEnCasa] = useState(true);
  /** El tamaño del que vuela mientras está posado (en `enCasa`): el del ojo del que sale, y al volver, el del rincón. */
  const [escala, setEscala] = useState(EN_CASA);
  const posicion = useRef<Punto | null>(null);
  const quieto = useRef(false);
  const previo = useRef<HTMLElement | null>(null);
  const globoRef = useRef<HTMLDivElement>(null);
  const seguirRef = useRef<HTMLButtonElement>(null);

  const volarA = useCallback((p: Punto, animar: boolean) => {
    const antes = posicion.current;
    if (animar && antes && !quieto.current && Math.hypot(antes.x - p.x, antes.y - p.y) > 4) {
      setGiro(p.x < antes.x ? -1 : 1);
      setVolando((v) => v + 1);
    }
    posicion.current = p;
    setYo(p);
  }, []);

  // empezar: lo pide Yo Da (el saludo o el chat)
  useEffect(() => {
    const empezar = async (e: Event) => {
      // la barra de arriba no queda fija: si la página está bajada, primero se sube (si no, sus paradas no se ven y se saltean)
      if (window.scrollY > 4) {
        const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: suave ? "smooth" : "auto" });
        const hasta = performance.now() + 1200;
        while (window.scrollY > 2 && performance.now() < hasta) await new Promise((r) => requestAnimationFrame(r));
      }
      const lista = recorrido.filter((p) => !p.donde || cajaDe(p.donde));
      if (!lista.length) return;
      quieto.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      previo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      // sale justo de donde está, con su mismo tamaño (el de siempre se oculta en el mismo cuadro: ver abajo)
      const o = origen();
      posicion.current = o?.p ?? null;
      setYo(o?.p ?? null);
      setEscala(o?.escala ?? EN_CASA);
      setEnCasa(true);
      setSesion(!!(e as CustomEvent<Inicio>).detail?.sesion);
      setParadas(lista);
      setCaja(null);
      setI(0);
      setSaliendo(false);
      setActivo(true);
      marcarRecorridoVisto();
    };
    window.addEventListener(EVENTO_RECORRIDO, empezar);
    return () => window.removeEventListener(EVENTO_RECORRIDO, empezar);
  }, []);

  // el cambio de un ojo al otro, en el mismo cuadro: la clase se pone y se saca en el mismo
  // commit en que aparece o desaparece el que vuela (nunca se ven dos, nunca ninguno)
  useLayoutEffect(() => {
    if (!activo) return;
    const html = document.documentElement;
    html.classList.add(CLASE);
    return () => html.classList.remove(CLASE, CLASE_CASA);
  }, [activo]);
  useLayoutEffect(() => {
    if (activo) document.documentElement.classList.toggle(CLASE_CASA, enCasa);
  }, [activo, enCasa]);

  const colocar = useCallback(
    (animar: boolean) => {
      const p = paradas[i];
      if (!p) return;
      const c = cajaDe(p.donde);
      // la parada de Yo Da («aquí me quedo»): vuelve a su rincón y se posa en su círculo
      const hogar = p.donde?.includes("yoda") ? casa() : null;
      if (hogar && c) {
        const vw = window.innerWidth;
        const gw = Math.min(320, vw - MARGEN * 2);
        const gx = Math.max(MARGEN, Math.min(vw - gw - MARGEN, c.x + c.w / 2 - gw / 2));
        setCaja(c);
        setGlobo({ left: gx, bottom: window.innerHeight - c.y + 12, width: gw });
        setEscala(EN_CASA);
        setEnCasa(true);
        volarA(hogar, animar);
        return;
      }
      const l = ubicar(c, window.innerWidth, window.innerHeight);
      setCaja(c);
      setGlobo(l.globo);
      setEnCasa(false);
      volarA(l.yo, animar);
    },
    [paradas, i, volarA],
  );

  // cada parada: dos cuadros de espera, así el vuelo arranca desde donde estaba
  useEffect(() => {
    if (!activo || saliendo) return;
    let r2 = 0;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => colocar(true));
    });
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
    };
  }, [activo, saliendo, colocar]);

  // si cambia el tamaño de la ventana o se mueve la página, se vuelve a medir
  useEffect(() => {
    if (!activo || saliendo) return;
    let raf = 0;
    const medir = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        colocar(false);
      });
    };
    window.addEventListener("resize", medir);
    window.addEventListener("scroll", medir, { passive: true });
    return () => {
      window.removeEventListener("resize", medir);
      window.removeEventListener("scroll", medir);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [activo, saliendo, colocar]);

  const cerrar = useCallback(() => {
    if (!activo || saliendo) return;
    const c = casa();
    if (c) volarA(c, true);
    setEscala(EN_CASA);
    setEnCasa(true);
    setSaliendo(true);
    window.setTimeout(
      () => {
        // se posó: vuelve a ser el de siempre, en el mismo lugar y del mismo tamaño
        // (la clase se saca en el mismo cuadro en que desaparece el que vuela: el useLayoutEffect de arriba)
        setActivo(false);
        setSaliendo(false);
        const volver = previo.current?.isConnected ? previo.current : document.querySelector<HTMLElement>('[data-recorrido="yoda"]');
        volver?.focus({ preventScroll: true });
      },
      quieto.current ? 0 : VUELO_MS,
    );
  }, [activo, saliendo, volarA]);

  const seguir = useCallback(() => {
    if (i < paradas.length - 1) setI(i + 1);
    else cerrar();
  }, [i, paradas.length, cerrar]);
  const atras = useCallback(() => setI((n) => Math.max(0, n - 1)), []);

  // el foco, en «Seguir» de cada parada
  useEffect(() => {
    if (activo && !saliendo) seguirRef.current?.focus({ preventScroll: true });
  }, [activo, saliendo, i]);

  // teclado: → sigue, ← vuelve, Esc sale; Tab no se escapa del globo
  useEffect(() => {
    if (!activo) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cerrar();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        seguir();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        atras();
      } else if (e.key === "Tab") {
        const f = Array.from(globoRef.current?.querySelectorAll<HTMLElement>("button, a[href]") ?? []);
        if (!f.length) return;
        const idx = f.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey && idx <= 0) {
          e.preventDefault();
          f[f.length - 1].focus();
        } else if (!e.shiftKey && (idx === -1 || idx === f.length - 1)) {
          e.preventDefault();
          f[0].focus();
        }
      }
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [activo, cerrar, seguir, atras]);

  if (!activo) return null;
  const p = paradas[i];
  if (!p) return null;
  const final = i === paradas.length - 1;
  const texto = `${(sesion && p.conSesion) || p.texto}${!sesion && p.sinSesion ? ` ${p.sinSesion}` : ""}`;
  // la luz se abre desde el centro de la parada, cuando Yo Da llega (--cx, --cy: de dónde se abre)
  const luz = (
    caja
      ? {
          left: caja.x,
          top: caja.y,
          width: caja.w,
          height: caja.h,
          "--cx": `${caja.x + caja.w / 2}px`,
          "--cy": `${caja.y + caja.h / 2}px`,
        }
      : {
          left: window.innerWidth / 2,
          top: window.innerHeight * 0.4,
          width: 0,
          height: 0,
          "--cx": "50vw",
          "--cy": "40vh",
        }
  ) as CSSProperties;

  return (
    <>
      <div className={`recorrido ${saliendo ? "saliendo" : ""}`} data-testid="recorrido" data-parada={p.id}>
        <div className="recorrido-capa" aria-hidden="true" />
        <div
          key={`luz-${p.id}`}
          className={`recorrido-luz ${caja ? "" : "sin-foco"} ${caja?.redondo ? "redondo" : ""}`}
          style={luz}
          aria-hidden="true"
          data-testid="recorrido-luz"
        />
        {!saliendo && (
          <div
            key={`globo-${p.id}`}
            ref={globoRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="recorrido-paso"
            aria-describedby="recorrido-texto"
            className="recorrido-globo"
            style={globo}
            data-testid="recorrido-globo"
          >
            <p id="recorrido-paso" className="recorrido-paso">
              Recorrido con {nombreBot} · {i + 1} de {paradas.length}
            </p>
            <p id="recorrido-texto" className="recorrido-texto" aria-live="polite" data-testid="recorrido-texto">
              <Tipeo texto={texto} />
            </p>
            <div className="recorrido-botones">
              <button type="button" className="recorrido-saltar" onClick={cerrar} data-testid="recorrido-saltar">
                {final ? "Cerrar" : "Saltar el recorrido"}
              </button>
              <span className="flex-1" />
              {i > 0 && (
                <button type="button" className="recorrido-atras" onClick={atras} aria-label="Parada anterior">
                  ←
                </button>
              )}
              {final && !sesion && (
                <Link href="/crear-cuenta" className="recorrido-cuenta" onClick={cerrar}>
                  Crear cuenta
                </Link>
              )}
              <button ref={seguirRef} type="button" className="recorrido-seguir" onClick={seguir} data-sonido="toque" data-testid="recorrido-seguir">
                {final ? "Listo" : "Seguir"}
              </button>
            </div>
          </div>
        )}
      </div>
      {/* el ojo, afuera del fundido del velo: sale entero, en el mismo cuadro en que se oculta el de siempre */}
      {yo && (
        <div
          className="recorrido-yo"
          style={{
            transform: `translate3d(${yo.x}px, ${yo.y}px, 0)`,
            ["--giro" as string]: giro,
          }}
          aria-hidden="true"
        >
          <div className={`recorrido-yo-escala ${enCasa ? "en-casa" : ""}`} style={{ ["--en-casa" as string]: escala }}>
            <div key={volando} className={`recorrido-yo-cuerpo ${volando ? "volando" : ""}`}>
              <OjoPixel size={YO_W} mira={giro as -1 | 1} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
