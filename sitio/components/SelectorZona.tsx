"use client";
import { useMemo } from "react";
import { ZONAS, ZONA_JULIAN, diferenciaConJulian, nombreZona, textoUTC, zonaDelDispositivo } from "@/lib/zona";
import { useZona } from "@/lib/usarZona";

/**
 * «Horarios en tu hora»: muestra la zona en la que se ven los horarios, deja
 * cambiarla y dice cuánto se lleva con la de Julián.
 */
export default function SelectorZona({ referencia }: { referencia?: string }) {
  const [zona, elegir, lista] = useZona();
  const fecha = useMemo(() => (referencia ? new Date(referencia) : new Date()), [referencia]);
  const opciones = useMemo(() => {
    const disp = lista ? zonaDelDispositivo() : ZONA_JULIAN;
    const l = [...ZONAS];
    for (const z of [disp, zona]) if (!l.some((x) => x.zona === z)) l.unshift({ zona: z, nombre: nombreZona(z) });
    return l.map((x) => ({ ...x, disp: x.zona === disp }));
  }, [zona, lista]);
  const esJulian = zona === ZONA_JULIAN;
  return (
    <div className="zona border-y borde py-4 mb-8 text-sm" data-testid="zona" data-zona={zona}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <label htmlFor="campo-zona" className="texto-2">
          Ves los horarios en
        </label>
        <select
          id="campo-zona"
          className="zona-select"
          value={zona}
          onChange={(e) => elegir(e.target.value)}
          data-sonido="toque"
        >
          {opciones.map((o) => (
            <option key={o.zona} value={o.zona}>
              {o.nombre} · {textoUTC(fecha, o.zona)}
              {o.disp ? " (tu dispositivo)" : ""}
            </option>
          ))}
        </select>
      </div>
      <p className="mt-2 texto-2" data-testid="zona-julian">
        {esJulian ? (
          <>Es la hora de Julián: Buenos Aires, Argentina ({textoUTC(fecha, ZONA_JULIAN)}).</>
        ) : (
          <>
            Julián está en Buenos Aires, Argentina ({textoUTC(fecha, ZONA_JULIAN)}): tu hora tiene{" "}
            <strong style={{ color: "var(--texto)" }}>{diferenciaConJulian(fecha, zona)}</strong>. Al lado de cada horario va la de él.
          </>
        )}
      </p>
    </div>
  );
}
