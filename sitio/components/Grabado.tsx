"use client";
import { useEffect, useRef } from "react";

/**
 * Un grabado de los libros que se "estampa" al aparecer.
 * Con `mira`, sigue al puntero apenas unos píxeles: el ojo te observa.
 */
export default function Grabado({
  src,
  alt,
  ancho,
  mira = false,
  halo = false,
  lento = false,
  pasada = false,
  className = "",
}: {
  src: string;
  alt: string;
  ancho: string;
  mira?: boolean;
  halo?: boolean;
  lento?: boolean;
  /** Una segunda impresión corrida unos milímetros, como en una prensa manual. */
  pasada?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!mira || !ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = ref.current;
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0;
    const mover = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 10;
      ty = (e.clientY / window.innerHeight - 0.5) * 8;
      if (!raf) raf = requestAnimationFrame(paso);
    };
    const paso = () => {
      x += (tx - x) * 0.04;
      y += (ty - y) * 0.04;
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.05 ? requestAnimationFrame(paso) : 0;
    };
    window.addEventListener("pointermove", mover, { passive: true });
    return () => {
      window.removeEventListener("pointermove", mover);
      cancelAnimationFrame(raf);
    };
  }, [mira]);

  return (
    <div className={`relative mx-auto ${className}`} style={{ width: ancho, aspectRatio: "1 / 1" }}>
      {halo && <div className="halo" aria-hidden="true" />}
      <div ref={ref} className="relative h-full w-full will-change-transform">
        {pasada && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" width={800} height={800} draggable={false} className={`fantasma-tinta estampa ${lento ? "estampa-lenta" : ""} h-full w-full select-none`} />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          width={800}
          height={800}
          draggable={false}
          className={`estampa ${lento ? "estampa-lenta" : ""} h-full w-full select-none`}
        />
      </div>
    </div>
  );
}
