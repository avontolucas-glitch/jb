"use client";
import { useEffect, useRef } from "react";
import { umbral, sitio } from "@/content/config";
import Estrellas from "./Estrellas";
import { OjoFantasma } from "./Ojo";

export const CLAVE_UMBRAL = "jb-umbral";

/**
 * Cuadro de bienvenida al entrar. Se muestra una vez por visita (sesión del
 * navegador). Un script en el <head> lo oculta antes de pintar si ya se entró.
 */
/** Deja inerte (o no) todo lo que está detrás de la bienvenida. */
function fondo(inerte: boolean) {
  if (inerte)
    document.querySelectorAll("body > *:not(.umbral):not(script):not(svg):not([inert])").forEach((el) => {
      el.setAttribute("inert", "");
      el.setAttribute("data-inerte-umbral", "");
    });
  else
    document.querySelectorAll("[data-inerte-umbral]").forEach((el) => {
      el.removeAttribute("inert");
      el.removeAttribute("data-inerte-umbral");
    });
}

export default function Umbral() {
  const boton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    if (html.classList.contains("umbral-visto")) return;
    // mientras está la bienvenida, el resto de la página no recibe el foco
    fondo(true);
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
      fondo(false);
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
      <Estrellas />
      <OjoFantasma />
      <div className="umbral-caja">
        <p className="umbral-aviso texto-2">{umbral.aviso}</p>
        {/* El ojo es la puerta: al tocarlo se expande y te lleva adentro */}
        <button ref={boton} type="button" onClick={entrar} className="umbral-ojo" aria-label={umbral.boton} data-sonido="cuenco">
          <span className="halo" aria-hidden="true" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/grabados/observador-crema.webp" alt="" width={800} height={800} draggable={false} className="estampa estampa-lenta relative w-full h-auto select-none" />
        </button>
        <h2 id="umbral-titulo" className="titulo umbral-titulo">
          {umbral.bienvenida}
        </h2>
        <p className="firma texto-2 text-xs mt-4 umbral-nombre">{sitio.nombre}</p>
        <p className="umbral-indicacion texto-2" aria-hidden="true">
          {umbral.indicacion}
        </p>
      </div>
    </div>
  );
}
