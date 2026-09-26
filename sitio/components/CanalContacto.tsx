"use client";
import { useState } from "react";

/** Elegir WhatsApp o mail; el campo de contacto cambia según la elección. */
export default function CanalContacto() {
  const [canal, setCanal] = useState<"whatsapp" | "mail">("mail");
  return (
    <>
      <fieldset>
        <legend className="etiqueta mb-3">¿Por dónde te avisamos?</legend>
        <div className="flex gap-3">
          {(
            [
              ["mail", "Mail"],
              ["whatsapp", "WhatsApp"],
            ] as const
          ).map(([v, t]) => (
            <label key={v} className={`boton cursor-pointer ${canal === v ? "boton-lleno" : ""}`}>
              <input
                type="radio"
                name="canal"
                value={v}
                checked={canal === v}
                onChange={() => setCanal(v)}
                className="sr-only"
              />
              {t}
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="campo-contacto" className="etiqueta">
          {canal === "mail" ? "Tu mail" : "Tu número de WhatsApp, con código de área"}
        </label>
        <input
          key={canal}
          id="campo-contacto"
          name="contacto"
          type={canal === "mail" ? "email" : "tel"}
          autoComplete={canal === "mail" ? "email" : "tel"}
          inputMode={canal === "mail" ? "email" : "tel"}
          placeholder={canal === "mail" ? "nombre@mail.com" : "+54 9 11 0000 0000"}
          required
          className="campo"
        />
      </div>
    </>
  );
}
