"use client";
import { ZONA_JULIAN, enZona, nombreZona } from "@/lib/zona";
import { useZona } from "@/lib/usarZona";

/**
 * Un día y una hora del sitio (una sesión, un directo), en la hora de quien lo
 * mira, y la de Julián al lado cuando son distintas:
 * «martes 29 de septiembre, 23:00 h (España) · 18:00 h en Argentina».
 */
export default function Hora({ inicio, parte = "todo", className = "" }: { inicio: string; parte?: "todo" | "dia" | "hora"; className?: string }) {
  const [zona] = useZona();
  const f = new Date(inicio);
  const aca = enZona(f, zona);
  const julian = enZona(f, ZONA_JULIAN);
  const igual = zona === ZONA_JULIAN;
  const otroDia = aca.clave !== julian.clave;
  if (parte === "dia")
    return (
      <time dateTime={f.toISOString()} className={`first-letter:uppercase inline-block ${className}`} data-zona={zona}>
        {aca.dia}
      </time>
    );
  const conDia = parte === "todo";
  return (
    <time dateTime={f.toISOString()} className={className} data-testid="hora" data-zona={zona}>
      <span className="first-letter:uppercase inline-block">
        {conDia ? `${aca.dia}, ` : ""}
        {aca.hora} h
      </span>
      {igual ? (
        <span className="texto-2"> (hora de Argentina)</span>
      ) : (
        <span className="texto-2">
          {" "}
          ({nombreZona(zona)}) · {otroDia ? `${julian.dia}, ` : ""}
          {julian.hora} h en Argentina
        </span>
      )}
    </time>
  );
}
