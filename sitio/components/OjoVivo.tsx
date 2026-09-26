"use client";
import { useEffect, useRef } from "react";

/**
 * El ojo del encabezado, vivo: la pupila sigue al puntero y, cuando nadie lo
 * mueve (o en el celular), hace pequeños movimientos propios, como un ojo real.
 * Parpadea de vez en cuando (CSS .parpadea).
 */
export default function OjoVivo({ size = 26 }: { size?: number }) {
  const iris = useRef<SVGGElement>(null);

  useEffect(() => {
    const g = iris.current;
    if (!g || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0, ultimo = 0;
    const MAX_X = 6, MAX_Y = 3.2;

    const paso = () => {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      g.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.02 ? requestAnimationFrame(paso) : 0;
    };
    const ir = (nx: number, ny: number) => {
      tx = Math.max(-MAX_X, Math.min(MAX_X, nx));
      ty = Math.max(-MAX_Y, Math.min(MAX_Y, ny));
      if (!raf) raf = requestAnimationFrame(paso);
    };
    const mirar = (e: PointerEvent) => {
      ultimo = Date.now();
      const r = g.ownerSVGElement!.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 240);
      ir((dx / d) * MAX_X * k, (dy / d) * MAX_Y * k);
    };
    // Movimientos propios cuando el puntero está quieto.
    const sacada = setInterval(() => {
      if (Date.now() - ultimo < 4000) return;
      Math.random() < 0.35 ? ir(0, 0) : ir((Math.random() * 2 - 1) * MAX_X * 0.8, (Math.random() * 2 - 1) * MAX_Y * 0.7);
    }, 2600);
    window.addEventListener("pointermove", mirar, { passive: true });
    return () => {
      window.removeEventListener("pointermove", mirar);
      clearInterval(sacada);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="parpadea">
      <path d="M4 32 C 15 16, 49 16, 60 32 C 49 48, 15 48, 4 32 Z" />
      <g>
        <g ref={iris}>
          <circle cx="32" cy="32" r="9.5" />
          <circle cx="32" cy="32" r="3.2" fill="currentColor" stroke="none" />
        </g>
      </g>
    </svg>
  );
}
