"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { detectarPlataforma } from "@/lib/plataforma";

type EventoInstalar = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

/**
 * «Instalar» en el menú: en Chrome, Edge y Android instala la app con un toque;
 * en iPhone, iPad y Safari lleva a los pasos. Si ya está instalada, no aparece.
 */
export default function InstalarCabecera() {
  const [evento, setEvento] = useState<EventoInstalar | null>(null);
  const [modo, setModo] = useState<"nada" | "directo" | "pasos">("nada");
  useEffect(() => {
    const p = detectarPlataforma();
    if (p === "instalada") return;
    if (p === "ios" || p === "safari-mac") setModo("pasos");
    const alInstalar = (e: Event) => {
      e.preventDefault();
      setEvento(e as EventoInstalar);
      setModo("directo");
    };
    const listo = () => setModo("nada");
    window.addEventListener("beforeinstallprompt", alInstalar);
    window.addEventListener("appinstalled", listo);
    return () => {
      window.removeEventListener("beforeinstallprompt", alInstalar);
      window.removeEventListener("appinstalled", listo);
    };
  }, []);
  if (modo === "nada") return null;
  if (modo === "pasos")
    return (
      <Link href="/app" className="nav-enlace texto-2">
        <span className="nav-texto">Instalar</span>
      </Link>
    );
  return (
    <button
      type="button"
      className="nav-enlace texto-2"
      data-sonido="campana"
      onClick={async () => {
        if (!evento) return;
        await evento.prompt();
        const r = await evento.userChoice.catch(() => null);
        if (r?.outcome === "accepted") setModo("nada");
        setEvento(null);
      }}
    >
      <span className="nav-texto">Instalar la app</span>
    </button>
  );
}
