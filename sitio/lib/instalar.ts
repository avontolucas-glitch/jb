"use client";
import { useEffect, useState } from "react";
import { detectarSistema, type Sistema } from "./plataforma";

/**
 * Instalar la app con un solo botón. El pedido de instalación de Chrome, Edge
 * y Android (beforeinstallprompt) lo atrapa un script en el <head> apenas
 * carga la página, así ningún botón se lo pierde; todos los botones usan esta
 * misma función:
 *  - si el navegador deja instalar directo, abre su ventana de instalación;
 *  - si se entró desde Instagram, Facebook, TikTok…, abre el sitio en el
 *    navegador de verdad (Chrome en Android, Safari en iPhone) y ahí sigue;
 *  - si no, abre la guía animada con los pasos de ese sistema.
 */
type EventoInstalar = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };
declare global {
  interface Window {
    __jbInstalar?: EventoInstalar | null;
    __jbInstalada?: number;
  }
}

export const GUIA = "jb:guia-instalar";
export const abrirGuia = () => window.dispatchEvent(new Event(GUIA));

/** La dirección actual con la marca para que, al llegar al otro navegador, siga la instalación. */
function destino() {
  const u = new URL(window.location.href);
  u.searchParams.set("instalar", "1");
  return u;
}

export async function instalar(s: Sistema = detectarSistema()): Promise<"aceptada" | "cancelada" | "guia" | "abriendo"> {
  const e = window.__jbInstalar;
  if (e) {
    window.__jbInstalar = null;
    window.dispatchEvent(new Event("jb:instalable"));
    await e.prompt();
    const r = await e.userChoice.catch(() => null);
    if (r?.outcome === "accepted") {
      window.__jbInstalada = 1;
      window.dispatchEvent(new Event("jb:instalada"));
      return "aceptada";
    }
    return "cancelada";
  }
  if (s.enApp && (s.so === "android" || s.so === "ios" || s.so === "ipados")) {
    const u = destino();
    window.location.href =
      s.so === "android"
        ? `intent://${u.host}${u.pathname}${u.search}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(u.href)};end`
        : `x-safari-${u.href}`;
    // si la red social no deja salir, quedan los pasos a mano
    window.setTimeout(() => document.visibilityState === "visible" && abrirGuia(), 1400);
    return "abriendo";
  }
  abrirGuia();
  return "guia";
}

/** Estado compartido: sistema, si se puede instalar directo y si ya está instalada. */
export function useInstalar() {
  const [sistema, setSistema] = useState<Sistema | null>(null);
  const [directo, setDirecto] = useState(false);
  const [instalada, setInstalada] = useState(false);
  useEffect(() => {
    const s = detectarSistema();
    setSistema(s);
    setInstalada(s.instalada || !!window.__jbInstalada);
    setDirecto(!!window.__jbInstalar);
    const alPoder = () => setDirecto(!!window.__jbInstalar);
    const alInstalar = () => {
      setInstalada(true);
      setDirecto(false);
    };
    window.addEventListener("jb:instalable", alPoder);
    window.addEventListener("jb:instalada", alInstalar);
    return () => {
      window.removeEventListener("jb:instalable", alPoder);
      window.removeEventListener("jb:instalada", alInstalar);
    };
  }, []);
  return { sistema, directo, instalada, instalar: () => instalar(sistema ?? undefined) };
}
