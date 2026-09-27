"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Hace emerger de a poco los bloques marcados con .revelar o .trazo al llegar a la pantalla. */
export default function Revelar() {
  const ruta = usePathname();
  useEffect(() => {
    (window as Window & { __jbListo?: boolean }).__jbListo = true;
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
    // Mientras está la bienvenida, nada se revela: el descubrimiento empieza al entrar.
    const alAbrir = () => observar();
    if (document.documentElement.classList.contains("en-umbral")) window.addEventListener("umbral:abierto", alAbrir, { once: true });
    else observar();
    const mo = new MutationObserver(() => !document.documentElement.classList.contains("en-umbral") && observar());
    mo.observe(document.body, { childList: true, subtree: true });
    // Seguro: al dejar de bajar, todo lo que quedó en pantalla aparece sí o sí,
    // aunque el observador llegue tarde (celulares lentos o en ahorro de batería).
    let pausa: ReturnType<typeof setTimeout> | undefined;
    const revisar = () => {
      if (document.documentElement.classList.contains("en-umbral")) return;
      const alto = window.innerHeight;
      document.querySelectorAll(".revelar:not(.visto), .trazo:not(.visto)").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom > 0 && r.top < alto * 0.96) marcar(el);
      });
    };
    const alDesplazar = () => {
      if (pausa) clearTimeout(pausa);
      pausa = setTimeout(revisar, 180);
    };
    window.addEventListener("scroll", alDesplazar, { passive: true });
    const inicial = setTimeout(revisar, 2600);
    return () => {
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("umbral:abierto", alAbrir);
      window.removeEventListener("scroll", alDesplazar);
      if (pausa) clearTimeout(pausa);
      clearTimeout(inicial);
    };
  }, [ruta]);
  return null;
}
