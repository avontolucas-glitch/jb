"use client";
import { useEffect, useRef } from "react";
import { umbral, sitio } from "@/content/config";

export const CLAVE_UMBRAL = "jb-umbral";

/**
 * Cuadro de bienvenida al entrar. Se muestra una vez por visita (sesión del
 * navegador). Un script en el <head> lo oculta antes de pintar si ya se entró.
 */
export default function Umbral() {
  const boton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    if (html.classList.contains("umbral-visto")) return;
    boton.current?.focus({ preventScroll: true });
  }, []);

  function entrar() {
    const html = document.documentElement;
    try {
      sessionStorage.setItem(CLAVE_UMBRAL, "1");
    } catch {}
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // 1) se apagan los textos y el ojo se acerca; 2) la oscuridad se abre desde
    // la pupila como un iris; 3) el sitio despierta y empieza su propia secuencia.
    html.classList.add("umbral-saliendo");
    const despertar = () => {
      html.classList.remove("en-umbral");
      window.dispatchEvent(new Event("umbral:abierto"));
    };
    if (quieto) {
      despertar();
      html.classList.add("umbral-visto");
      html.classList.remove("umbral-saliendo");
      return;
    }
    setTimeout(despertar, 900);
    setTimeout(() => html.classList.add("umbral-visto"), 2500);
    setTimeout(() => html.classList.remove("umbral-saliendo"), 5200);
  }

  return (
    <div className="umbral" role="dialog" aria-modal="true" aria-labelledby="umbral-titulo" data-testid="umbral">
      <div className="umbral-caja">
        <p className="umbral-aviso texto-2">{umbral.aviso}</p>
        <div className="umbral-ojo mx-auto w-40 sm:w-48">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/grabados/observador-crema.webp" alt="" width={800} height={800} draggable={false} className="estampa w-full h-auto select-none" />
        </div>
        <h2 id="umbral-titulo" className="titulo text-3xl sm:text-4xl mt-6">
          {umbral.bienvenida}
        </h2>
        <p className="texto-2 mt-2">{sitio.nombre}</p>
        <button ref={boton} type="button" onClick={entrar} className="boton boton-lleno mt-10 min-w-44">
          {umbral.boton}
        </button>
      </div>
    </div>
  );
}
