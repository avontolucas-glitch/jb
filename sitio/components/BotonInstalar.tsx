"use client";
import { useEffect } from "react";
import BotonApp from "./BotonApp";
import { useInstalar } from "@/lib/instalar";
import { nombreSistema, plataformaDe } from "@/lib/plataforma";

/** En /app: el sistema detectado y el botón que instala (o guía paso a paso). */
export default function BotonInstalar() {
  const { sistema, instalada } = useInstalar();
  useEffect(() => {
    if (sistema) document.getElementById(`so-${plataformaDe(sistema)}`)?.setAttribute("data-actual", "si");
  }, [sistema]);
  if (!sistema) return <div className="h-12" />;
  if (instalada) return <p className="border borde p-4" data-testid="estado-app">La app ya está instalada en este dispositivo.</p>;
  return (
    <div className="space-y-5 text-center" data-testid="estado-app">
      <p className="texto-2">
        Estás en <strong style={{ color: "var(--texto)" }}>{nombreSistema(sistema)}</strong>.
      </p>
      <BotonApp className="text-lg px-8" />
      <p className="texto-2 text-sm">Un toque: si tu navegador instala directo, se instala; si no, te mostramos los pasos exactos.</p>
    </div>
  );
}
