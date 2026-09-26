"use client";
import { useEffect, useState } from "react";
import { activarSonido, sonidoActivo } from "@/lib/sonido";

/** Encender o silenciar los sonidos del sitio (queda recordado en este dispositivo). */
export default function InterruptorSonido({ className = "" }: { className?: string }) {
  const [si, setSi] = useState(true);
  useEffect(() => {
    const leer = () => setSi(sonidoActivo());
    leer();
    window.addEventListener("jb-sonido", leer);
    return () => window.removeEventListener("jb-sonido", leer);
  }, []);
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 hover:text-[var(--texto)] ${className}`}
      aria-pressed={si}
      data-sonido={si ? "toque" : "campana"}
      onClick={() => activarSonido(!si)}
      data-testid="interruptor-sonido"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <path d="M4 9h4l5-4v14l-5-4H4z" />
        {si ? <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" /> : <path d="M17 9l5 6M22 9l-5 6" />}
      </svg>
      Sonido {si ? "activado" : "silenciado"}
    </button>
  );
}
