"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Hace emerger de a poco los bloques marcados con .revelar o .trazo al llegar a la pantalla. */
export default function Revelar() {
  const ruta = usePathname();
  useEffect(() => {
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const marcar = (el: Element) => el.classList.add("visto");
    if (quieto || !("IntersectionObserver" in window)) {
      document.querySelectorAll(".revelar, .trazo").forEach(marcar);
      return;
    }
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) {
            marcar(e.target);
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    const observar = () => document.querySelectorAll(".revelar:not(.visto), .trazo:not(.visto)").forEach((el) => io.observe(el));
    observar();
    const mo = new MutationObserver(observar);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [ruta]);
  return null;
}
