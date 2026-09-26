"use client";
import { useEffect, useState } from "react";
import { detectarPlataforma, type Plataforma } from "@/lib/plataforma";

type EventoInstalar = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

/** En /app: botón de instalación directa (Chrome, Edge, Android) y aviso del sistema detectado. */
export default function BotonInstalar({ nombres }: { nombres: Record<Plataforma, string> }) {
  const [p, setP] = useState<Plataforma | null>(null);
  const [evento, setEvento] = useState<EventoInstalar | null>(null);
  const [instalada, setInstalada] = useState(false);

  useEffect(() => {
    const plataforma = detectarPlataforma();
    setP(plataforma);
    setInstalada(plataforma === "instalada");
    document.getElementById(`so-${plataforma}`)?.setAttribute("data-actual", "si");
    const alInstalar = (e: Event) => {
      e.preventDefault();
      setEvento(e as EventoInstalar);
    };
    const listo = () => setInstalada(true);
    window.addEventListener("beforeinstallprompt", alInstalar);
    window.addEventListener("appinstalled", listo);
    return () => {
      window.removeEventListener("beforeinstallprompt", alInstalar);
      window.removeEventListener("appinstalled", listo);
    };
  }, []);

  if (!p) return <div className="h-12" />;
  if (instalada) return <p className="border borde p-4" data-testid="estado-app">La app ya está instalada en este dispositivo.</p>;
  return (
    <div className="space-y-4" data-testid="estado-app">
      <p>
        Estás en: <strong>{nombres[p]}</strong>.
      </p>
      {evento ? (
        <button
          type="button"
          className="boton boton-lleno"
          onClick={async () => {
            await evento.prompt();
            const r = await evento.userChoice.catch(() => null);
            if (r?.outcome === "accepted") setInstalada(true);
            setEvento(null);
          }}
        >
          Instalar la app
        </button>
      ) : (
        <p className="texto-2">Seguí los pasos de tu sistema, más abajo.</p>
      )}
    </div>
  );
}
