"use client";
import { useEffect } from "react";
import { tocar, type TipoSonido } from "@/lib/sonido";

/**
 * Escucha los clics del sitio y suena algo suave según qué se tocó:
 * data-sonido="cuenco|nav|campana|toque" manda; si no, los botones principales
 * suenan a campanita y el resto a un toque leve.
 */
export default function Sonidos() {
  useEffect(() => {
    const alTocar = (ev: MouseEvent) => {
      const el = (ev.target as Element | null)?.closest?.("[data-sonido], a, button, label.boton, .cal-dia") as HTMLElement | null;
      if (!el || (el as HTMLButtonElement).disabled) return;
      const tipo = (el.dataset.sonido as TipoSonido | undefined) ?? (el.classList.contains("boton-lleno") ? "campana" : "toque");
      tocar(tipo, Number(el.dataset.nota ?? 0));
    };
    document.addEventListener("click", alTocar, true);
    return () => document.removeEventListener("click", alTocar, true);
  }, []);
  return null;
}
