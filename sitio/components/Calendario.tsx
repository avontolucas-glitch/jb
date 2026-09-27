"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SelectorZona from "./SelectorZona";
import { ZONA_JULIAN, enZona } from "@/lib/zona";
import { useZona } from "@/lib/usarZona";

/** Un horario de la agenda: `inicio` es el instante exacto (ISO); el id va en hora de Argentina. */
export type Turno = { id: string; inicio: string; estado: "libre" | "ocupado" | "tuya" };

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const SEMANA = ["lu", "ma", "mi", "ju", "vi", "sá", "do"];

/**
 * Calendario para agendar un encuentro: los días con horarios libres llevan un
 * punto lleno; los que están todos ocupados, uno vacío. Al tocar un día se ven
 * sus horarios. Todo en la hora de quien mira (se puede cambiar), con la hora
 * de Julián al lado de cada horario; un horario puede caer otro día que en
 * Argentina, y va en el día que corresponde a tu hora.
 */
export default function Calendario({ turnos }: { turnos: Turno[] }) {
  const [zona] = useZona();
  const lista = useMemo(
    () =>
      turnos
        .map((t) => {
          const f = new Date(t.inicio);
          const aca = enZona(f, zona);
          const ar = enZona(f, ZONA_JULIAN);
          return { ...t, ms: f.getTime(), clave: aca.clave, dia: aca.dia, hora: aca.hora, horaJulian: ar.hora, diaJulian: ar.dia, otroDia: aca.clave !== ar.clave };
        })
        .sort((a, b) => a.ms - b.ms),
    [turnos, zona],
  );
  const porDia = useMemo(() => {
    const m = new Map<string, typeof lista>();
    for (const t of lista) m.set(t.clave, [...(m.get(t.clave) ?? []), t]);
    return m;
  }, [lista]);
  const meses = useMemo(() => [...new Set(lista.map((t) => t.clave.slice(0, 7)))], [lista]);
  const primerDia = (mes?: string) => {
    const del = mes ? lista.filter((t) => t.clave.startsWith(mes)) : lista;
    return (del.find((t) => t.estado === "libre") ?? del[0])?.clave ?? null;
  };
  const [elegido, setElegido] = useState<string | null>(() => primerDia());

  // al cambiar de zona, los días se mueven: si el elegido quedó vacío, el primero con lugar
  useEffect(() => {
    if (!elegido || !porDia.has(elegido)) setElegido(primerDia());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [porDia]);

  if (meses.length === 0) return <p className="texto-2">No hay horarios cargados por ahora.</p>;
  const mesIdx = Math.max(0, meses.indexOf(elegido?.slice(0, 7) ?? ""));
  const irAMes = (i: number) => setElegido(primerDia(meses[i]));

  const [anio, mes] = meses[mesIdx].split("-").map(Number);
  const primero = new Date(Date.UTC(anio, mes - 1, 1));
  const diasMes = new Date(Date.UTC(anio, mes, 0)).getUTCDate();
  const hueco = (primero.getUTCDay() + 6) % 7; // la semana empieza el lunes
  const celdas: (number | null)[] = [...Array(hueco).fill(null), ...Array.from({ length: diasMes }, (_, i) => i + 1)];
  const del = (d: number) => `${anio}-${String(mes).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const turnosDia = elegido ? porDia.get(elegido) ?? [] : [];
  const otraZona = zona !== ZONA_JULIAN;

  return (
    <div className="calendario" data-testid="calendario">
      <SelectorZona referencia={turnos[0]?.inicio} />

      <div className="flex items-center justify-between mb-5">
        <button type="button" className="boton boton-chico" onClick={() => irAMes(mesIdx - 1)} disabled={mesIdx === 0} aria-label="Mes anterior">
          ‹
        </button>
        <p className="text-xl" aria-live="polite" data-testid="mes" data-mes={meses[mesIdx]}>
          {MESES[mes - 1]} {anio}
        </p>
        <button type="button" className="boton boton-chico" onClick={() => irAMes(mesIdx + 1)} disabled={mesIdx === meses.length - 1} aria-label="Mes siguiente">
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center" role="group" aria-label={`${MESES[mes - 1]} ${anio}`}>
        {SEMANA.map((d) => (
          <div key={d} className="texto-2 text-xs tracking-widest py-2" aria-hidden="true">
            {d}
          </div>
        ))}
        {celdas.map((d, i) => {
          if (d === null) return <div key={`h${i}`} aria-hidden="true" />;
          const k = del(d);
          const ts = porDia.get(k);
          if (!ts) return <div key={k} className="cal-dia vacio" aria-hidden="true">{d}</div>;
          const libres = ts.filter((t) => t.estado === "libre").length;
          const tuya = ts.some((t) => t.estado === "tuya");
          const sel = elegido === k;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setElegido(k)}
              aria-pressed={sel}
              aria-label={`${ts[0].dia}: ${libres ? `${libres} ${libres === 1 ? "horario libre" : "horarios libres"}` : "sin horarios libres"}${tuya ? ", con tu encuentro" : ""}`}
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
        <span>◆ tu encuentro</span>
      </p>

      {turnosDia.length > 0 && (
        <div className="mt-8 border-t borde pt-6" data-testid="turnos-del-dia">
          <p className="italic texto-2 mb-4 first-letter:uppercase">{turnosDia[0].dia}</p>
          <ul className="flex flex-wrap gap-3">
            {turnosDia.map((t) => {
              const julian = otraZona ? (
                <span className="cal-julian" data-testid={`julian-${t.id}`}>
                  {t.otroDia ? `${t.diaJulian}, ` : ""}
                  {t.horaJulian} h en Argentina
                </span>
              ) : null;
              return (
                <li key={t.id}>
                  {t.estado === "libre" ? (
                    <Link href={`/checkout/sesion-${t.id}`} className="boton text-center" data-testid={`horario-${t.id}`} data-estado="libre" data-hora={t.hora}>
                      {t.hora} h{julian}
                    </Link>
                  ) : (
                    <span className={`boton cursor-default text-center ${t.estado === "ocupado" ? "opacity-40" : ""}`} data-testid={`horario-${t.id}`} data-estado={t.estado} data-hora={t.hora}>
                      <span className={t.estado === "ocupado" ? "line-through" : ""}>{t.hora} h</span> · {t.estado === "tuya" ? "tu encuentro" : "ocupado"}
                      {julian}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
