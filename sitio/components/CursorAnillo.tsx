"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import estilos from "./CursorAnillo.module.css";

/**
 * Un anillo fino que acompaña al puntero con suavidad y un punto que lo sigue exacto.
 * Sobre lo que se puede tocar, el anillo se abre y se vuelve más tenue; al hacer clic
 * se contrae un instante. No reemplaza el cursor del sistema.
 *
 * Solo existe con mouse o lápiz que flota ((hover: hover) y sin (pointer: coarse))
 * y sin «reducir movimiento». Se monta en <body> con un portal, así que puede
 * ponerse en cualquier parte del layout sin quedar atrapado en otro apilamiento.
 */

/** Lo que cuenta como interactivo. `data-cursor` sirve para sumar cualquier otro elemento. */
const INTERACTIVOS = [
  "a[href]",
  "button:not([disabled])",
  "label.boton",
  "[data-cursor]",
  ".cal-dia:not(.vacio)",
  "input:not([type='hidden']):not([disabled])",
  "textarea:not([disabled])",
  "select:not([disabled])",
  "summary",
  "[role='button']",
].join(", ");

/** Qué parte del camino recorre el anillo en cada cuadro (a 60 Hz). Menos es más lento. */
const SUAVIDAD = 0.2;
/** Cuánto dura, como mínimo, la contracción del clic. */
const CONTRAER_MS = 160;
/** Por debajo de esta distancia (px) el anillo llega y el ciclo de animación se detiene. */
const LLEGADA = 0.15;
/** Cuánto espera el anillo abierto antes de cerrarse al salir de algo que se puede tocar:
 *  así no tiembla al cruzar el hueco entre dos días del calendario o dos enlaces. */
const SALIDA_MS = 90;
/** Silencio de scroll que se toma como final, donde no existe el evento «scrollend». */
const FIN_SCROLL_MS = 120;

export default function CursorAnillo() {
  const [activo, setActivo] = useState(false);
  const capa = useRef<HTMLDivElement>(null);
  const anillo = useRef<HTMLDivElement>(null);
  const punto = useRef<HTMLDivElement>(null);

  // ¿Corresponde mostrarlo? Se reevalúa si cambia la preferencia o el dispositivo.
  useEffect(() => {
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)");
    const grueso = window.matchMedia("(pointer: coarse)");
    const flota = window.matchMedia("(hover: hover)");
    const consultas = [quieto, grueso, flota];
    const evaluar = () => setActivo(!quieto.matches && !grueso.matches && flota.matches);
    evaluar();
    consultas.forEach((c) => c.addEventListener("change", evaluar));
    return () => consultas.forEach((c) => c.removeEventListener("change", evaluar));
  }, []);

  useEffect(() => {
    if (!activo) return;
    const c = capa.current;
    const a = anillo.current;
    const p = punto.current;
    if (!c || !a || !p) return;

    let px = 0; // puntero
    let py = 0;
    let ax = 0; // anillo
    let ay = 0;
    let raf = 0;
    let antes = 0;
    let finScroll = 0;
    let quitarSobre = 0;
    let soltar = 0;
    let apretadoDesde = 0;
    let visible = false;
    let sobre = false;

    const pintarAnillo = () => {
      a.style.transform = `translate3d(${ax}px, ${ay}px, 0)`;
    };

    const detener = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      antes = 0;
    };

    // Acercamiento suave, independiente de la frecuencia de la pantalla.
    const paso = (t: number) => {
      const dt = antes ? Math.min(t - antes, 64) : 16.7;
      antes = t;
      const k = 1 - Math.pow(1 - SUAVIDAD, dt / 16.7);
      ax += (px - ax) * k;
      ay += (py - ay) * k;
      if (Math.abs(px - ax) < LLEGADA && Math.abs(py - ay) < LLEGADA) {
        ax = px;
        ay = py;
        pintarAnillo();
        raf = 0;
        antes = 0;
        return;
      }
      pintarAnillo();
      raf = requestAnimationFrame(paso);
    };

    const mostrar = (si: boolean) => {
      if (visible === si) return;
      visible = si;
      c.classList.toggle(estilos.visible, si);
      if (!si) detener();
    };

    // Se abre enseguida; se cierra con una demora corta, que se cancela si el puntero
    // entra a otro elemento interactivo antes de que venza.
    const marcarSobre = (el: Element | null) => {
      if (el?.closest(INTERACTIVOS)) {
        window.clearTimeout(quitarSobre);
        quitarSobre = 0;
        if (sobre) return;
        sobre = true;
        c.classList.add(estilos.sobre);
        return;
      }
      if (!sobre || quitarSobre) return;
      quitarSobre = window.setTimeout(() => {
        quitarSobre = 0;
        sobre = false;
        c.classList.remove(estilos.sobre);
      }, SALIDA_MS);
    };

    const mover = (e: PointerEvent) => {
      if (e.pointerType === "touch") {
        mostrar(false);
        return;
      }
      px = e.clientX;
      py = e.clientY;
      p.style.transform = `translate3d(${px}px, ${py}px, 0)`;
      if (!visible) {
        // Al entrar (o volver) a la ventana, el anillo aparece ya en su lugar.
        ax = px;
        ay = py;
        pintarAnillo();
        marcarSobre(e.target instanceof Element ? e.target : null);
        mostrar(true);
        return;
      }
      if (!raf) raf = requestAnimationFrame(paso);
    };

    const entrar = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      marcarSobre(e.target instanceof Element ? e.target : null);
    };

    // Sin elemento de destino: el puntero salió de la ventana.
    const salir = (e: PointerEvent) => {
      if (!e.relatedTarget) mostrar(false);
    };

    // Solo el botón principal: el derecho, el del medio y los laterales no contraen el anillo.
    const presionar = (e: PointerEvent) => {
      if (e.pointerType === "touch" || e.button !== 0) return;
      window.clearTimeout(soltar);
      apretadoDesde = performance.now();
      c.classList.add(estilos.presionado);
    };

    const aflojar = () => {
      window.clearTimeout(soltar);
      const falta = Math.max(0, CONTRAER_MS - (performance.now() - apretadoDesde));
      soltar = window.setTimeout(() => c.classList.remove(estilos.presionado), falta);
    };

    const perderFoco = () => {
      window.clearTimeout(soltar);
      c.classList.remove(estilos.presionado);
    };

    // Al desplazar la página sin mover el mouse, lo que queda debajo puede cambiar.
    // Se revisa una sola vez, cuando el scroll termina: a la par del :hover nativo,
    // y sin pedirle estilo y layout al navegador en cada cuadro del desplazamiento.
    const revisar = () => {
      window.clearTimeout(finScroll);
      finScroll = 0;
      if (visible) marcarSobre(document.elementFromPoint(px, py));
    };

    const desplazar = () => {
      if (!visible) return;
      window.clearTimeout(finScroll);
      finScroll = window.setTimeout(revisar, FIN_SCROLL_MS);
    };

    const pasivo: AddEventListenerOptions = { passive: true };
    const pasivoCaptura: AddEventListenerOptions = { passive: true, capture: true };

    window.addEventListener("pointermove", mover, pasivo);
    document.addEventListener("pointerover", entrar, pasivo);
    document.addEventListener("pointerout", salir, pasivo);
    window.addEventListener("pointerdown", presionar, pasivo);
    window.addEventListener("pointerup", aflojar, pasivo);
    window.addEventListener("pointercancel", aflojar, pasivo);
    window.addEventListener("blur", perderFoco, pasivo);
    // Un menú contextual puede quedarse con el pointerup (clic con Control en macOS).
    window.addEventListener("contextmenu", perderFoco, pasivo);
    window.addEventListener("scroll", desplazar, pasivoCaptura);
    window.addEventListener("scrollend", revisar, pasivoCaptura);

    return () => {
      window.removeEventListener("pointermove", mover, pasivo);
      document.removeEventListener("pointerover", entrar, pasivo);
      document.removeEventListener("pointerout", salir, pasivo);
      window.removeEventListener("pointerdown", presionar, pasivo);
      window.removeEventListener("pointerup", aflojar, pasivo);
      window.removeEventListener("pointercancel", aflojar, pasivo);
      window.removeEventListener("blur", perderFoco, pasivo);
      window.removeEventListener("contextmenu", perderFoco, pasivo);
      window.removeEventListener("scroll", desplazar, pasivoCaptura);
      window.removeEventListener("scrollend", revisar, pasivoCaptura);
      detener();
      window.clearTimeout(finScroll);
      window.clearTimeout(quitarSobre);
      window.clearTimeout(soltar);
    };
  }, [activo]);

  if (!activo) return null;

  return createPortal(
    <div ref={capa} className={estilos.cursor} aria-hidden="true">
      <div ref={anillo} className={estilos.anillo}>
        <span className={estilos.aro} />
      </div>
      <div ref={punto} className={estilos.punto} />
    </div>,
    document.body,
  );
}
