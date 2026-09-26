"use client";
import Link from "next/link";
import { useMemo, useState } from "react";

export type Turno = { id: string; dia: string; hora: string; estado: "libre" | "ocupado" | "tuya" };

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const SEMANA = ["lu", "ma", "mi", "ju", "vi", "sá", "do"];
const clave = (id: string) => id.slice(0, 10); // "2026-09-29"

/**
 * Calendario para agendar una sesión: los días con horarios libres llevan un
 * punto lleno; los que están todos ocupados, uno vacío. Al tocar un día se ven
 * sus horarios.
 */
export default function Calendario({ turnos }: { turnos: Turno[] }) {
  const porDia = useMemo(() => {
    const m = new Map<string, Turno[]>();
    for (const t of turnos) m.set(clave(t.id), [...(m.get(clave(t.id)) ?? []), t]);
    return m;
  }, [turnos]);
  const primeroLibre = turnos.find((t) => t.estado === "libre") ?? turnos[0];
  const [elegido, setElegido] = useState<string | null>(primeroLibre ? clave(primeroLibre.id) : null);
  const meses = useMemo(() => [...new Set(turnos.map((t) => t.id.slice(0, 7)))], [turnos]);
  const [mesIdx, setMesIdx] = useState(Math.max(0, meses.indexOf(elegido?.slice(0, 7) ?? "")));
  if (meses.length === 0) return <p className="texto-2">No hay horarios cargados por ahora.</p>;

  const [anio, mes] = meses[mesIdx].split("-").map(Number);
  const primero = new Date(Date.UTC(anio, mes - 1, 1));
  const diasMes = new Date(Date.UTC(anio, mes, 0)).getUTCDate();
  const hueco = (primero.getUTCDay() + 6) % 7; // la semana empieza el lunes
  const celdas: (number | null)[] = [...Array(hueco).fill(null), ...Array.from({ length: diasMes }, (_, i) => i + 1)];
  const del = (d: number) => `${anio}-${String(mes).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const turnosDia = elegido ? porDia.get(elegido) ?? [] : [];

  return (
    <div className="calendario" data-testid="calendario">
      <div className="flex items-center justify-between mb-5">
        <button type="button" className="boton py-1 px-3" onClick={() => setMesIdx((i) => i - 1)} disabled={mesIdx === 0} aria-label="Mes anterior">
          ‹
        </button>
        <p className="text-xl" aria-live="polite" data-testid="mes">
          {MESES[mes - 1]} {anio}
        </p>
        <button type="button" className="boton py-1 px-3" onClick={() => setMesIdx((i) => i + 1)} disabled={mesIdx === meses.length - 1} aria-label="Mes siguiente">
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center" role="grid" aria-label={`${MESES[mes - 1]} ${anio}`}>
        {SEMANA.map((d) => (
          <div key={d} className="texto-2 text-xs tracking-widest py-2" role="columnheader">
            {d}
          </div>
        ))}
        {celdas.map((d, i) => {
          if (d === null) return <div key={`h${i}`} />;
          const k = del(d);
          const ts = porDia.get(k);
          if (!ts) return <div key={k} className="cal-dia vacio">{d}</div>;
          const libres = ts.filter((t) => t.estado === "libre").length;
          const tuya = ts.some((t) => t.estado === "tuya");
          const sel = elegido === k;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setElegido(k)}
              aria-pressed={sel}
              aria-label={`${ts[0].dia}: ${libres ? `${libres} ${libres === 1 ? "horario libre" : "horarios libres"}` : "sin horarios libres"}${tuya ? ", con tu sesión" : ""}`}
              className={`cal-dia ${libres ? "libre" : "lleno"} ${sel ? "elegido" : ""}`}
              data-testid={`dia-${k}`}
            >
              {d}
              <span className="cal-marca" aria-hidden="true">
                {tuya ? "◆" : libres ? "●" : "○"}
              </span>
            </button>
          );
        })}
      </div>

      <p className="texto-2 text-xs mt-4 flex flex-wrap gap-x-5 gap-y-1" aria-hidden="true">
        <span>● con horarios libres</span>
        <span>○ todo ocupado</span>
        <span>◆ tu sesión</span>
      </p>

      {turnosDia.length > 0 && (
        <div className="mt-8 border-t borde pt-6" data-testid="turnos-del-dia">
          <p className="italic texto-2 mb-4 first-letter:uppercase">{turnosDia[0].dia}</p>
          <ul className="flex flex-wrap gap-3">
            {turnosDia.map((t) => (
              <li key={t.id}>
                {t.estado === "libre" ? (
                  <Link href={`/checkout/sesion-${t.id}`} className="boton" data-testid={`horario-${t.id}`} data-estado="libre">
                    {t.hora} h
                  </Link>
                ) : (
                  <span className={`boton cursor-default ${t.estado === "ocupado" ? "line-through opacity-40" : ""}`} data-testid={`horario-${t.id}`} data-estado={t.estado}>
                    {t.hora} h · {t.estado === "tuya" ? "tu sesión" : "ocupado"}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
