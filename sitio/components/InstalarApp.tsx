"use client";
import { useEffect, useState } from "react";
import Ojo from "./Ojo";
import BotonApp from "./BotonApp";
import { detectarSistema, plataformaDe, type Plataforma } from "@/lib/plataforma";

export { IconoCompartir } from "./GuiaInstalar";

const CLAVE = "jb-aviso-app-cerrado";
const DIAS = 30;

/**
 * Aviso discreto, abajo, en las primeras visitas desde el teléfono, la tablet
 * o Safari de Mac (o cuando el navegador ya ofrece instalar): un solo botón
 * que hace todo. Si se cierra, no vuelve por 30 días.
 */
export default function InstalarApp() {
  const [plataforma, setPlataforma] = useState<Plataforma>("otra");
  const [donde, setDonde] = useState("dispositivo");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const s = detectarSistema();
    const p = plataformaDe(s);
    setPlataforma(p);
    setDonde(s.so === "ios" || s.so === "android" ? "teléfono" : s.so === "ipados" ? "tablet" : "computadora");
    let cerrado = false;
    try {
      cerrado = Date.now() - Number(localStorage.getItem(CLAVE) || 0) < DIAS * 864e5;
    } catch {}
    if (p === "instalada" || cerrado) return;
    const mostrar = () => setVisible(true);
    const ocultar = () => setVisible(false);
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (window.__jbInstalar) timer = setTimeout(mostrar, 1800);
    else if (s.enApp || s.so === "ios" || s.so === "ipados" || s.so === "android" || p === "safari-mac") timer = setTimeout(mostrar, 1800);
    window.addEventListener("jb:instalable", mostrar);
    window.addEventListener("jb:instalada", ocultar);
    return () => {
      window.removeEventListener("jb:instalable", mostrar);
      window.removeEventListener("jb:instalada", ocultar);
      if (timer) clearTimeout(timer);
    };
  }, []);

  function cerrar() {
    setVisible(false);
    try {
      localStorage.setItem(CLAVE, String(Date.now()));
    } catch {}
  }

  if (!visible) return null;
  return (
    <div role="dialog" aria-label="Instalar la app" data-testid="aviso-app" data-plataforma={plataforma} className="aviso-app fixed inset-x-0 bottom-0 z-50 p-3 sm:p-5 pointer-events-none">
      <div className="hondo pointer-events-auto mx-auto max-w-md border borde p-4 sm:p-5 shadow-none">
        <div className="flex items-center gap-3">
          <Ojo size={26} className="shrink-0" />
          <p className="flex-1 text-[0.98rem] leading-snug">Tené el sitio como una app en tu {donde}.</p>
          <button type="button" onClick={cerrar} className="text-sm underline underline-offset-4 shrink-0 texto-2" aria-label="Cerrar el aviso de la app">
            Ahora no
          </button>
        </div>
        <div className="mt-3 pl-[2.4rem]" onClick={() => setVisible(false)}>
          <BotonApp className="py-1.5" />
        </div>
      </div>
    </div>
  );
}
