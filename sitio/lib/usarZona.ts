"use client";
import { useEffect, useState } from "react";
import { ZONA_JULIAN, normalizar, zonaDelDispositivo, zonaValida } from "./zona";

const CLAVE = "jb-zona";
const EVENTO = "jb:zona";

/**
 * La zona en la que el visitante ve los horarios: la que eligió a mano (queda
 * guardada en el dispositivo) o la de su dispositivo. En el servidor, y hasta
 * que carga la página, es la de Julián. Todos los relojes del sitio se
 * enteran cuando se cambia.
 */
export function useZona(): [string, (z: string) => void, boolean] {
  const [zona, setZona] = useState(ZONA_JULIAN);
  const [lista, setLista] = useState(false);
  useEffect(() => {
    const leer = () => {
      let z: string | null = null;
      try {
        z = localStorage.getItem(CLAVE);
      } catch {}
      setZona(zonaValida(z) ? normalizar(z) : zonaDelDispositivo());
      setLista(true);
    };
    leer();
    window.addEventListener(EVENTO, leer);
    return () => window.removeEventListener(EVENTO, leer);
  }, []);
  const elegir = (z: string) => {
    try {
      if (z === zonaDelDispositivo()) localStorage.removeItem(CLAVE);
      else localStorage.setItem(CLAVE, z);
    } catch {}
    setZona(z);
    window.dispatchEvent(new Event(EVENTO));
  };
  return [zona, elegir, lista];
}
