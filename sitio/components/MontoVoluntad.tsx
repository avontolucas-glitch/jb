"use client";
import { useState } from "react";

/** Elegir cuánto pagar: montos sugeridos o uno propio, desde el mínimo. */
export default function MontoVoluntad({ moneda, minimo, maximo, sugeridos }: { moneda: string; minimo: number; maximo: number; sugeridos: number[] }) {
  const [elegido, setElegido] = useState<string>(String(sugeridos[0] ?? minimo));
  const [otro, setOtro] = useState("");
  const propio = elegido === "otro";
  return (
    <fieldset>
      <legend className="etiqueta mb-3">Cuánto querés pagar ({moneda}, desde {minimo})</legend>
      <div className="flex flex-wrap gap-3">
        {sugeridos.map((n) => (
          <label key={n} className="boton cursor-pointer min-w-16">
            <input type="radio" name="opcion" value={n} checked={elegido === String(n)} onChange={() => setElegido(String(n))} className="sr-only" />
            {n}
          </label>
        ))}
        <label className="boton cursor-pointer">
          <input type="radio" name="opcion" value="otro" checked={propio} onChange={() => setElegido("otro")} className="sr-only" />
          Otro monto
        </label>
      </div>
      {propio && (
        <div className="mt-5">
          <label htmlFor="campo-otro" className="etiqueta">
            Tu monto en {moneda}
          </label>
          <input
            id="campo-otro"
            type="number"
            inputMode="decimal"
            min={minimo}
            max={maximo}
            step="0.5"
            value={otro}
            onChange={(e) => setOtro(e.target.value)}
            className="campo"
            autoFocus
          />
        </div>
      )}
      <input type="hidden" name="monto" value={propio ? otro : elegido} />
    </fieldset>
  );
}
