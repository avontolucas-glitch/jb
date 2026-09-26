"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Ojo from "./Ojo";
import { detectarPlataforma, type Plataforma } from "@/lib/plataforma";

type EventoInstalar = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
const CLAVE = "jb-aviso-app-cerrado";
const DIAS = 30;

export function IconoCompartir() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="inline align-[-3px]">
      <path d="M12 3v12M8 7l4-4 4 4" />
      <path d="M6 11H5v10h14V11h-1" />
    </svg>
  );
}

export default function InstalarApp() {
  const [plataforma, setPlataforma] = useState<Plataforma>("otra");
  const [evento, setEvento] = useState<EventoInstalar | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const p = detectarPlataforma();
    setPlataforma(p);
    let cerrado = false;
    try {
      const t = Number(localStorage.getItem(CLAVE) || 0);
      cerrado = Date.now() - t < DIAS * 864e5;
    } catch {}
    if (p === "instalada" || cerrado) return;
    const alInstalar = (e: Event) => {
      e.preventDefault();
      setEvento(e as EventoInstalar);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", alInstalar);
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (p === "ios" || p === "safari-mac" || p === "firefox") timer = setTimeout(() => setVisible(true), 1800);
    return () => {
      window.removeEventListener("beforeinstallprompt", alInstalar);
      if (timer) clearTimeout(timer);
    };
  }, []);

  function cerrar() {
    setVisible(false);
    try {
      localStorage.setItem(CLAVE, String(Date.now()));
    } catch {}
  }

  async function instalar() {
    if (!evento) return;
    await evento.prompt();
    await evento.userChoice.catch(() => null);
    setEvento(null);
    setVisible(false);
  }

  if (!visible) return null;
  return (
    <div role="dialog" aria-label="Instalar la app" data-testid="aviso-app" data-plataforma={plataforma} className="aviso-app fixed inset-x-0 bottom-0 z-50 p-3 sm:p-5 pointer-events-none">
      <div className="hondo pointer-events-auto mx-auto max-w-md border borde p-4 sm:p-5 shadow-none">
        <div className="flex items-start gap-3">
          <Ojo size={26} className="shrink-0 mt-0.5" />
          <div className="flex-1 text-[0.98rem] leading-snug">
            <p className="mb-1">Tené el sitio como una app en tu {plataforma === "ios" ? "teléfono" : "dispositivo"}.</p>
            {plataforma === "chromium" && evento && (
              <button type="button" className="boton boton-lleno mt-2 py-1.5" onClick={instalar}>
                Instalar la app
              </button>
            )}
            {plataforma === "ios" && (
              <p className="texto-2">
                Tocá <IconoCompartir /> <strong>Compartir</strong> y después <strong>Agregar a pantalla de inicio</strong>.
              </p>
            )}
            {plataforma === "safari-mac" && (
              <p className="texto-2">
                En Safari, abrí el menú <strong>Archivo</strong> y elegí <strong>Agregar al Dock</strong>.
              </p>
            )}
            {plataforma === "firefox" && (
              <p className="texto-2">Para instalarla, abrí el sitio en Chrome, Edge o Safari.</p>
            )}
            <Link href="/app" className="enlace text-sm mt-2 inline-block">
              Ver cómo instalarla en cada sistema
            </Link>
          </div>
          <button type="button" onClick={cerrar} className="text-sm underline underline-offset-4 shrink-0" aria-label="Cerrar el aviso de la app">
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
}
