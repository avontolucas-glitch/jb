"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Efectos globales, todos leves:
 *  - una línea de avance arriba, que crece al bajar (orientación);
 *  - un halo tenue que acompaña al puntero en la oscuridad (computadora);
 *  - los botones principales se acercan apenas al puntero (magnetismo).
 * Con "reducir movimiento" no se activa nada.
 */
export default function Atencion() {
  const ruta = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const barra = document.getElementById("avance");
    let raf = 0;
    const alBajar = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (barra) barra.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
        document.documentElement.classList.toggle("bajo", window.scrollY > 60);
      });
    };
    alBajar();
    window.addEventListener("scroll", alBajar, { passive: true });
    window.addEventListener("resize", alBajar);
    return () => {
      window.removeEventListener("scroll", alBajar);
      window.removeEventListener("resize", alBajar);
      cancelAnimationFrame(raf);
    };
  }, [ruta]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const halo = document.getElementById("halo-puntero");
    let raf = 0, px = 0, py = 0;
    const mover = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (halo) halo.style.opacity = "1";
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (halo) halo.style.transform = `translate3d(${px - 300}px, ${py - 300}px, 0)`;
        document.querySelectorAll<HTMLElement>(".boton-lleno").forEach((b) => {
          const r = b.getBoundingClientRect();
          const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
          const dx = px - cx, dy = py - cy;
          const d = Math.hypot(dx, dy);
          const zona = Math.max(r.width, r.height) * 0.9;
          b.style.transform = d < zona ? `translate(${(dx * 0.12).toFixed(1)}px, ${(dy * 0.18).toFixed(1)}px)` : "";
        });
      });
    };
    const salir = () => halo && (halo.style.opacity = "0");
    window.addEventListener("pointermove", mover, { passive: true });
    document.addEventListener("pointerleave", salir);
    return () => {
      window.removeEventListener("pointermove", mover);
      document.removeEventListener("pointerleave", salir);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div id="avance" className="avance" aria-hidden="true" />
      <div id="halo-puntero" className="halo-puntero" aria-hidden="true" />
    </>
  );
}
