"use client";
import { useInstalar } from "@/lib/instalar";

/**
 * El único botón «Instalar la app», igual en todo el sitio: detecta el sistema
 * y el navegador, instala directo donde se puede y, donde no, abre la guía con
 * los pasos justos (o lleva al navegador de verdad si se entró desde una red
 * social). Ya instalada, desaparece.
 */
export default function BotonApp({ variante = "boton", className = "", texto = "Instalar la app" }: { variante?: "nav" | "menu" | "boton"; className?: string; texto?: string }) {
  const { instalada, instalar } = useInstalar();
  if (instalada) return null;
  const clase = { nav: "nav-enlace texto-2", menu: "enlace", boton: "boton boton-lleno" }[variante];
  return (
    <button type="button" className={`${clase} ${className}`} data-sonido="campana" data-testid={`instalar-${variante}`} onClick={() => instalar()}>
      {variante === "nav" ? <span className="nav-texto">{texto}</span> : texto}
    </button>
  );
}
