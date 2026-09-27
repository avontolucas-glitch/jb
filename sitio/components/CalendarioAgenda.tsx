"use client";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { accionAgregarHorario, accionBloquear, accionCambiarHorario, type EstadoAgenda } from "@/lib/acciones-agenda";
import { Campo } from "./Formulario";

export type TurnoAgenda = {
  id: string;
  dia: string;
  hora: string;
  estado: "libre" | "reservado" | "bloqueado";
  origen: "base" | "extra";
  quien?: string;
};

type Que = "bloquear" | "desbloquear" | "quitar";

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const SEMANA = ["lu", "ma", "mi", "ju", "vi", "sá", "do"];
const clave = (id: string) => id.slice(0, 10);
const ESTADO = { libre: "libre", reservado: "reservado", bloqueado: "bloqueado" } as const;
const TEXTOS: Record<Que, { texto: string; enviando: string }> = {
  bloquear: { texto: "Bloquear", enviando: "Bloqueando…" },
  desbloquear: { texto: "Desbloquear", enviando: "Desbloqueando…" },
  quitar: { texto: "Quitar", enviando: "Quitando…" },
};

/** Mientras se envía, el botón queda marcado pero no se deshabilita: así no pierde el foco. */
function Boton({ que, id }: { que: Que; id: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="boton boton-chico"
      aria-disabled={pending || undefined}
      onClick={(e) => pending && e.preventDefault()}
      data-testid={`${que}-${id}`}
    >
      {pending ? TEXTOS[que].enviando : TEXTOS[que].texto}
    </button>
  );
}

/**
 * Un botón de la agenda. Tiene una `key` fija por horario: al pasar de
 * «Bloquear» a «Desbloquear» es el mismo botón, y el foco queda donde estaba.
 */
function Cambiar({ id, que, avisar }: { id: string; que: Que; avisar: (r: EstadoAgenda) => void }) {
  const [estado, enviar] = useActionState(async (previo: EstadoAgenda, f: FormData) => {
    const r = await accionCambiarHorario(previo, f);
    avisar(r);
    return r;
  }, null);
  return (
    <form action={enviar} className="inline-flex flex-col">
      <input type="hidden" name="horario" value={id} />
      <input type="hidden" name="que" value={que} />
      <Boton que={que} id={id} />
      {estado?.error && (
        <span role="alert" className="texto-2 text-xs mt-1">
          {estado.error}
        </span>
      )}
    </form>
  );
}

/**
 * El calendario de Julián: cada día marca si tiene horarios libres, reservas
 * o solo horarios bloqueados. Al tocar un día se ven sus horarios, con los
 * botones para bloquear, desbloquear o quitar. `enfocar` lleva el calendario
 * a un horario (por ejemplo, el que se acaba de agregar).
 */
export default function CalendarioAgenda({ turnos, enfocar }: { turnos: TurnoAgenda[]; enfocar?: { id: string } | null }) {
  const porDia = useMemo(() => {
    const m = new Map<string, TurnoAgenda[]>();
    for (const t of turnos) m.set(clave(t.id), [...(m.get(clave(t.id)) ?? []), t]);
    return m;
  }, [turnos]);
  const meses = useMemo(() => [...new Set(turnos.map((t) => t.id.slice(0, 7)))], [turnos]);
  const inicial = turnos.find((t) => t.estado === "libre") ?? turnos[0];
  const [elegido, setElegido] = useState<string | null>(inicial ? clave(inicial.id) : null);
  const [mesElegido, setMesElegido] = useState<string | null>(elegido?.slice(0, 7) ?? null);
  const [aviso, setAviso] = useState("");
  const tituloDia = useRef<HTMLParagraphElement>(null);
  const tituloMes = useRef<HTMLParagraphElement>(null);
  const recuperarFoco = useRef(false);

  // después de agregar o bloquear desde un formulario, el calendario va a ese día
  // (en cuanto el día llega con los horarios nuevos del servidor)
  const pendiente = useRef<string | null>(null);
  useEffect(() => {
    if (enfocar) pendiente.current = enfocar.id;
  }, [enfocar]);
  useEffect(() => {
    const id = pendiente.current;
    if (!id || !porDia.has(clave(id))) return;
    pendiente.current = null;
    setElegido(clave(id));
    setMesElegido(id.slice(0, 7));
  }, [enfocar, porDia]);

  // si el botón que tenía el foco desapareció (por ejemplo, «Quitar»), el foco vuelve al día
  useEffect(() => {
    if (!recuperarFoco.current) return;
    recuperarFoco.current = false;
    if (!document.activeElement || document.activeElement === document.body) (tituloDia.current ?? tituloMes.current)?.focus();
  }, [turnos]);

  const avisar = (r: EstadoAgenda) => {
    if (!r?.ok) return;
    setAviso(r.ok);
    recuperarFoco.current = true;
  };

  if (meses.length === 0) return <p className="texto-2">No hay horarios cargados por ahora.</p>;

  // si el mes que se estaba viendo se quedó sin horarios, se muestra el más cercano
  const encontrado = mesElegido ? meses.findIndex((m) => m >= mesElegido) : 0;
  const idx = encontrado === -1 ? meses.length - 1 : encontrado;
  // al cambiar de mes, abajo se ven los horarios de ese mes (el primer día con libres, si hay)
  const irA = (i: number) => {
    const delMes = turnos.filter((t) => t.id.startsWith(meses[i]));
    const dia = delMes.find((t) => t.estado === "libre") ?? delMes[0];
    pendiente.current = null;
    setMesElegido(meses[i]);
    setElegido(dia ? clave(dia.id) : null);
  };
  const [anio, mes] = meses[idx].split("-").map(Number);
  const primero = new Date(Date.UTC(anio, mes - 1, 1));
  const diasMes = new Date(Date.UTC(anio, mes, 0)).getUTCDate();
  const hueco = (primero.getUTCDay() + 6) % 7; // la semana empieza el lunes
  const celdas: (number | null)[] = [...Array(hueco).fill(null), ...Array.from({ length: diasMes }, (_, i) => i + 1)];
  const del = (d: number) => `${anio}-${String(mes).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const turnosDia = elegido ? porDia.get(elegido) ?? [] : [];

  return (
    <div className="calendario" data-testid="calendario-agenda">
      <p role="status" className="sr-only" data-testid="aviso-agenda">
        {aviso}
      </p>
      <div className="flex items-center justify-between mb-5">
        <button type="button" className="boton boton-chico" onClick={() => irA(idx - 1)} disabled={idx === 0} aria-label="Mes anterior">
          ‹
        </button>
        <p className="text-xl" aria-live="polite" data-testid="mes" data-mes={meses[idx]} ref={tituloMes} tabIndex={-1}>
          {MESES[mes - 1]} {anio}
        </p>
        <button type="button" className="boton boton-chico" onClick={() => irA(idx + 1)} disabled={idx === meses.length - 1} aria-label="Mes siguiente">
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center" role="group" aria-label={`${MESES[mes - 1]} ${anio}`}>
        {/* los botones de cada día ya dicen qué día de la semana es: estas iniciales son solo para la vista */}
        {SEMANA.map((d) => (
          <div key={d} className="texto-2 text-xs tracking-widest py-2" aria-hidden="true">
            {d}
          </div>
        ))}
        {celdas.map((d, i) => {
          if (d === null) return <div key={`h${i}`} aria-hidden="true" />;
          const k = del(d);
          const ts = porDia.get(k);
          if (!ts)
            return (
              <div key={k} className="cal-dia vacio" aria-hidden="true">
                {d}
              </div>
            );
          const libres = ts.filter((t) => t.estado === "libre").length;
          const reservas = ts.filter((t) => t.estado === "reservado").length;
          const sel = elegido === k;
          const partes = [
            libres && `${libres} ${libres === 1 ? "libre" : "libres"}`,
            reservas && `${reservas} ${reservas === 1 ? "reservado" : "reservados"}`,
            ts.length - libres - reservas && `${ts.length - libres - reservas} bloqueado${ts.length - libres - reservas === 1 ? "" : "s"}`,
          ].filter(Boolean);
          return (
            <button
              key={k}
              type="button"
              onClick={() => {
                pendiente.current = null;
                setElegido(k);
              }}
              aria-pressed={sel}
              aria-label={`${ts[0].dia}: ${partes.join(", ")}`}
              className={`cal-dia ${libres || reservas ? "libre" : "lleno"} ${sel ? "elegido" : ""}`}
              data-testid={`dia-${k}`}
            >
              {d}
              <span className="cal-marca" aria-hidden="true">
                {reservas ? "◆" : libres ? "●" : "○"}
              </span>
            </button>
          );
        })}
      </div>

      <p className="texto-2 text-xs mt-4 flex flex-wrap gap-x-5 gap-y-1" aria-hidden="true">
        <span>● con horarios libres</span>
        <span>◆ con reservas</span>
        <span>○ solo bloqueados</span>
      </p>

      {turnosDia.length > 0 && (
        <div className="mt-8 border-t borde pt-6" data-testid="agenda-del-dia">
          <p className="italic texto-2 mb-4 first-letter:uppercase" ref={tituloDia} tabIndex={-1}>
            {turnosDia[0].dia}
          </p>
          <ul className="border-t borde">
            {turnosDia.map((t) => (
              <li
                key={t.id}
                className="border-b borde py-4 flex flex-wrap items-center justify-between gap-3"
                data-testid={`agenda-${t.id}`}
                data-estado={t.estado}
                data-origen={t.origen}
              >
                <span className={t.estado === "bloqueado" ? "texto-2 line-through" : ""}>
                  {t.hora} h
                  <span className="texto-2 text-sm">
                    {" "}
                    · {ESTADO[t.estado]}
                    {t.estado === "reservado" && t.quien ? ` por ${t.quien}` : ""}
                    {t.origen === "extra" ? " · agregado por vos" : " · semanal"}
                  </span>
                </span>
                {t.estado !== "reservado" && (
                  <span className="flex flex-wrap gap-2">
                    <Cambiar key={`${t.id}-estado`} id={t.id} que={t.estado === "libre" ? "bloquear" : "desbloquear"} avisar={avisar} />
                    {t.origen === "extra" && <Cambiar key={`${t.id}-quitar`} id={t.id} que="quitar" avisar={avisar} />}
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

function Enviar({ texto, enviando }: { texto: string; enviando: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="boton boton-lleno w-full sm:w-auto" disabled={pending}>
      {pending ? enviando : texto}
    </button>
  );
}

/**
 * Formulario de fecha y hora del panel. Si algo sale mal, lo cargado no se
 * borra; si sale bien, avisa qué horario tocó (para llevar ahí el calendario).
 */
function FormHorario({
  accion,
  nombres,
  etiquetas,
  horaRequerida,
  boton,
  enviando,
  testid,
  hoy,
  hasta,
  alTerminar,
}: {
  accion: (e: EstadoAgenda, f: FormData) => Promise<EstadoAgenda>;
  nombres: { fecha: string; hora: string };
  etiquetas: { fecha: string; hora: string };
  horaRequerida: boolean;
  boton: string;
  enviando: string;
  testid: string;
  hoy: string;
  hasta: string;
  alTerminar: (id: string) => void;
}) {
  const [estado, enviar] = useActionState(accion, null);
  useEffect(() => {
    if (estado?.ok && estado.id) alTerminar(estado.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado]);
  // con error, los campos se vuelven a armar con lo que se había cargado
  const v = estado?.error ? estado.valores : undefined;
  const version = v ? `${v.fecha}|${v.hora}` : "limpio";
  return (
    <form action={enviar} className="space-y-6 max-w-sm" noValidate>
      <Campo key={`f-${version}`} nombre={nombres.fecha} etiqueta={etiquetas.fecha} tipo="date" defecto={v?.fecha} min={hoy} max={hasta} />
      <Campo
        key={`h-${version}`}
        nombre={nombres.hora}
        etiqueta={etiquetas.hora}
        tipo="time"
        defecto={v?.hora}
        step={300}
        requerido={horaRequerida}
        ayuda={horaRequerida ? "En hora de Argentina." : "En hora de Argentina. Sin hora, se bloquea el día entero."}
      />
      <div className="pt-2">
        <Enviar texto={boton} enviando={enviando} />
      </div>
      <div aria-live="polite">
        {estado?.error && (
          <p role="alert" className="border-l-2 pl-3" style={{ borderColor: "currentColor" }} data-testid={`${testid}-error`}>
            {estado.error}
          </p>
        )}
        {estado?.ok && (
          <p role="status" data-testid={`${testid}-ok`}>
            {estado.ok}
          </p>
        )}
      </div>
    </form>
  );
}

/**
 * El panel editable de la agenda: agregar un horario, bloquear con
 * anticipación y el calendario. Después de agregar o bloquear, el calendario
 * va solo al día que se tocó.
 */
export function AgendaEditable({ turnos, hoy, hasta }: { turnos: TurnoAgenda[]; hoy: string; hasta: string }) {
  const [enfocar, setEnfocar] = useState<{ id: string } | null>(null);
  const ir = (id: string) => setEnfocar({ id });
  return (
    <>
      <section className="mt-16" aria-labelledby="agregar">
        <h2 id="agregar" className="text-2xl mb-2">
          Agregar un horario
        </h2>
        <p className="texto-2 mb-6">
          Los horarios fijos de cada semana están en la configuración del sitio. Acá sumás horarios sueltos y, en el calendario, bloqueás los que
          no puedas.
        </p>
        <FormHorario
          accion={accionAgregarHorario}
          nombres={{ fecha: "fecha", hora: "hora" }}
          etiquetas={{ fecha: "Fecha", hora: "Hora" }}
          horaRequerida
          boton="Agregar horario"
          enviando="Agregando…"
          testid="mensaje"
          hoy={hoy}
          hasta={hasta}
          alTerminar={ir}
        />
      </section>

      <section className="mt-16" aria-labelledby="bloquear">
        <h2 id="bloquear" className="text-2xl mb-2">
          Bloquear un día u horario
        </h2>
        <p className="texto-2 mb-6">
          Para lo que ya sabés que no vas a poder, aunque falte mucho (por ejemplo, unas vacaciones). Las reservas que ya estén hechas no se tocan.
        </p>
        <FormHorario
          accion={accionBloquear}
          nombres={{ fecha: "bloqueo-fecha", hora: "bloqueo-hora" }}
          etiquetas={{ fecha: "Día", hora: "Hora (opcional)" }}
          horaRequerida={false}
          boton="Bloquear día u horario"
          enviando="Bloqueando…"
          testid="bloqueo"
          hoy={hoy}
          hasta={hasta}
          alTerminar={ir}
        />
      </section>

      <section className="mt-16" aria-labelledby="calendario">
        <h2 id="calendario" className="text-2xl mb-6">
          Calendario
        </h2>
        <CalendarioAgenda turnos={turnos} enfocar={enfocar} />
      </section>
    </>
  );
}
