"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Ojo from "./Ojo";

const CADA_MS = 8000;

/**
 * Sala del directo. En el prototipo no hay transmisión real: se muestra el
 * lugar del video con todas las protecciones funcionando.
 * PRODUCCIÓN: dentro de `.pantalla` va el reproductor del servicio de video
 * con DRM, usando `permiso` (ver lib/streaming.ts).
 */
export default function SalaProtegida({ directo, email, fecha }: { directo: string; email: string; fecha: string }) {
  const [turno, setTurno] = useState<string | null>(null);
  const [pausada, setPausada] = useState(false);
  const [pos, setPos] = useState({ top: 12, left: 10 });
  const turnoRef = useRef<string | null>(null);

  const reintento = useRef<ReturnType<typeof setTimeout> | null>(null);

  const abrir = useCallback(async () => {
    if (reintento.current) clearTimeout(reintento.current);
    reintento.current = null;
    const r = await fetch("/api/sala", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ directo }) }).catch(() => null);
    if (!r) return;
    // «muchos pedidos» (429): se vuelve a probar pasado el tiempo que pide el servidor, así no queda sin turno
    if (r.status === 429) {
      const d = (await r.json().catch(() => ({}))) as { reintentoSeg?: number };
      const seg = Math.min(120, Math.max(1, Number(r.headers.get("Retry-After")) || d.reintentoSeg || 10));
      reintento.current = setTimeout(() => void abrirRef.current(), seg * 1000);
      return;
    }
    if (!r.ok) return;
    const d = (await r.json()) as { turno: string; permiso: string };
    turnoRef.current = d.turno;
    setTurno(d.turno);
    setPausada(false);
  }, [directo]);
  const abrirRef = useRef(abrir);
  abrirRef.current = abrir;

  const revisar = useCallback(async () => {
    if (!turnoRef.current) return;
    const r = await fetch(`/api/sala?directo=${encodeURIComponent(directo)}&turno=${turnoRef.current}`, { cache: "no-store" }).catch(() => null);
    // sin red o con «muchos pedidos» (429) no se decide nada: solo «vigente: false» pausa la sala
    if (!r || r.status === 429) return;
    const d = (await r.json().catch(() => ({ vigente: true }))) as { vigente: boolean };
    if (!d.vigente) setPausada(true);
  }, [directo]);

  useEffect(() => {
    abrir();
    const t = setInterval(revisar, CADA_MS);
    const alVolver = () => document.visibilityState === "visible" && revisar();
    document.addEventListener("visibilitychange", alVolver);
    window.addEventListener("focus", revisar);
    return () => {
      clearInterval(t);
      if (reintento.current) clearTimeout(reintento.current);
      document.removeEventListener("visibilitychange", alVolver);
      window.removeEventListener("focus", revisar);
    };
  }, [abrir, revisar]);

  // La marca de agua cambia de lugar cada pocos segundos.
  useEffect(() => {
    const t = setInterval(() => setPos({ top: 8 + Math.random() * 76, left: 4 + Math.random() * 58 }), 6000);
    return () => clearInterval(t);
  }, []);

  // Sin menú del botón derecho ni atajos de guardar o imprimir dentro de la sala.
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ["s", "p"].includes(e.key.toLowerCase())) e.preventDefault();
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, []);

  return (
    <div className="sala" data-testid="sala" data-turno={turno ?? ""} onContextMenu={(e) => e.preventDefault()} onDragStart={(e) => e.preventDefault()}>
      <div className="pantalla relative overflow-hidden border borde bg-black" style={{ aspectRatio: "16 / 9" }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-6">
          <Ojo size={40} className="parpadea opacity-70" />
          <p className="text-lg">Todavía no empezó.</p>
          <p className="texto-2 text-sm">{fecha}. Cuando empiece, se ve acá.</p>
        </div>
        <span className="absolute left-3 top-3 text-xs tracking-widest texto-2 flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: "currentColor" }} aria-hidden="true" />
          SALA
        </span>
        <span className="marca-agua" style={{ top: `${pos.top}%`, left: `${pos.left}%` }} data-testid="marca-agua" aria-hidden="true">
          {email}
        </span>
        {pausada && (
          <div className="absolute inset-0 hondo flex flex-col items-center justify-center gap-4 text-center px-6" data-testid="sala-pausada" role="alert">
            <p className="text-lg">Abriste esta sala en otra pantalla.</p>
            <p className="texto-2 text-sm">Se puede ver en una sola a la vez.</p>
            <button type="button" className="boton boton-lleno" onClick={abrir}>
              Ver acá
            </button>
          </div>
        )}
      </div>
      <p className="texto-2 text-sm mt-4">
        La transmisión es personal: se ve solo en este sitio, en una pantalla a la vez, y lleva tu mail como marca de agua.
      </p>
    </div>
  );
}
