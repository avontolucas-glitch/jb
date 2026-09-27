/**
 * Agenda de la Masterclass 1 a 1: qué horarios hay y cuáles están reservados.
 *
 * Los horarios salen de dos lugares:
 *  - la base semanal de content/config.ts (`sesiones.dias`, las próximas `semanas`);
 *  - lo que carga Julián desde su panel, en data/agenda.json:
 *    `extras` se suman y `bloqueados` se quitan.
 * Cada horario tiene un id "AAAA-MM-DDTHH-MM" en hora de Argentina.
 *
 * PRODUCCIÓN: la agenda puede venir de un calendario conectado y la reserva se
 * confirma solo con el pago aprobado (webhook).
 */
import { leer, escribir, modificar } from "./db";
import type { Compra } from "./access";
import { sesiones } from "@/content/config";

export type Horario = { id: string; fecha: Date; etiqueta: string; dia: string; hora: string };
export type Agenda = { extras: string[]; bloqueados: string[] };

export const ZONA = "America/Argentina/Buenos_Aires";
const fmtDia = new Intl.DateTimeFormat("es-AR", { timeZone: ZONA, weekday: "long", day: "numeric", month: "long" });
const fmtHora = new Intl.DateTimeFormat("es-AR", { timeZone: ZONA, hour: "2-digit", minute: "2-digit", hour12: false });
const dos = (n: number) => String(n).padStart(2, "0");
const FORMATO_ID = /^(\d{4})-(\d{2})-(\d{2})T(\d{2})-(\d{2})$/;

/** "2026-09-29T18-00" → fecha (hora de Argentina, UTC−3). Rechaza fechas que no existen (31 de febrero). */
export function horarioDesdeId(id: string): Horario | null {
  const m = FORMATO_ID.exec(id);
  if (!m) return null;
  const [a, me, d, h, mi] = m.slice(1).map(Number);
  if (h > 23 || mi > 59) return null;
  const fecha = new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:00-03:00`);
  if (Number.isNaN(fecha.getTime())) return null;
  // la fecha tiene que existir tal cual: sin «desbordes» al mes siguiente
  const ar = new Date(fecha.getTime() - 3 * 3600 * 1000);
  if (ar.getUTCFullYear() !== a || ar.getUTCMonth() + 1 !== me || ar.getUTCDate() !== d) return null;
  const dia = fmtDia.format(fecha);
  const hora = fmtHora.format(fecha);
  return { id, fecha, dia, hora, etiqueta: `${dia}, ${hora} h` };
}

/** Fecha "AAAA-MM-DD" y hora "HH:MM" del formulario → id de horario (o null si no tienen formato). */
export function idDesdeFormulario(fecha: string, hora: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || !/^\d{2}:\d{2}$/.test(hora)) return null;
  const id = `${fecha}T${hora.replace(":", "-")}`;
  return horarioDesdeId(id) ? id : null;
}

/** Cuándo termina un encuentro: hasta ese momento sigue vigente (el link de la sala, la reserva en el panel). */
export const fin = (h: Horario) => h.fecha.getTime() + sesiones.duracionMinutos * 60_000;

/** Desde cuándo se puede reservar: ahora más la anticipación mínima de config. */
export const desdeCuandoSeReserva = (ahora = new Date()) => ahora.getTime() + sesiones.anticipacionHoras * 3600_000;

/** "AAAA-MM-DD" de hoy en Argentina. */
export const hoyEnArgentina = (ahora = new Date()) => new Date(ahora.getTime() - 3 * 3600 * 1000).toISOString().slice(0, 10);

/**
 * ¿Es un horario de la base semanal? (día y hora de `sesiones.dias`, en punto),
 * desde mañana y sin límite de semanas: la base sigue para siempre, aunque el
 * público vea solo las próximas `sesiones.semanas`.
 */
export function esDeLaBase(id: string, ahora = new Date()): boolean {
  const m = FORMATO_ID.exec(id);
  if (!m || !horarioDesdeId(id) || m[5] !== "00" || id.slice(0, 10) <= hoyEnArgentina(ahora)) return false;
  const diaSemana = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))).getUTCDay();
  return sesiones.dias.some((t) => t.dia === diaSemana && t.hora === Number(m[4]));
}

/** Los ids de la base semanal de un día "AAAA-MM-DD" (cualquier día desde mañana). */
export const baseDelDia = (fecha: string, ahora = new Date()) =>
  sesiones.dias.map((t) => `${fecha}T${dos(t.hora)}-00`).filter((id, i, l) => l.indexOf(id) === i && esDeLaBase(id, ahora));

/** La base semanal de config, para las próximas semanas (desde mañana). */
export function horariosBase(ahora = new Date()): Horario[] {
  const lista: Horario[] = [];
  const hoyAR = new Date(ahora.getTime() - 3 * 3600 * 1000); // "hoy" en Argentina
  for (let d = 1; d <= sesiones.semanas * 7; d++) {
    const x = new Date(Date.UTC(hoyAR.getUTCFullYear(), hoyAR.getUTCMonth(), hoyAR.getUTCDate() + d));
    for (const t of sesiones.dias) {
      if (x.getUTCDay() !== t.dia) continue;
      const h = horarioDesdeId(`${x.getUTCFullYear()}-${dos(x.getUTCMonth() + 1)}-${dos(x.getUTCDate())}T${dos(t.hora)}-00`);
      if (h) lista.push(h);
    }
  }
  return lista;
}

const normalizarAgenda = (a: Partial<Agenda> | unknown[] | null): Agenda => {
  const lista = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
  return !a || Array.isArray(a) ? { extras: [], bloqueados: [] } : { extras: lista(a.extras), bloqueados: lista(a.bloqueados) };
};
const ordenada = (a: Agenda): Agenda => {
  const unicos = (v: string[]) => [...new Set(v)].sort();
  return { extras: unicos(a.extras), bloqueados: unicos(a.bloqueados) };
};

export async function leerAgenda(): Promise<Agenda> {
  return normalizarAgenda(await leer<Partial<Agenda> | unknown[]>("agenda"));
}

export async function guardarAgenda(a: Agenda): Promise<void> {
  await escribir("agenda", ordenada(a));
}

/**
 * Lee y cambia la agenda de una sola vez (sin que otro cambio se meta en el
 * medio). `fn` devuelve la agenda nueva (o nada, si no cambia) y un resultado.
 */
export function cambiarAgenda<R>(fn: (a: Agenda) => Promise<{ agenda?: Agenda; resultado: R }>): Promise<R> {
  return modificar<Partial<Agenda> | unknown[], R>("agenda", async (datos) => {
    const r = await fn(normalizarAgenda(datos));
    return { datos: r.agenda ? ordenada(r.agenda) : undefined, resultado: r.resultado };
  });
}

const ordenar = (l: Horario[]) => l.sort((x, y) => x.fecha.getTime() - y.fecha.getTime());

/**
 * Horarios a la vista del público: base + extras − bloqueados, en orden. Solo
 * los que empiezan después de la anticipación mínima (`sesiones.anticipacionHoras`):
 * así Julián se entera a tiempo de cada reserva.
 */
export async function horarios(ahora = new Date()): Promise<Horario[]> {
  const agenda = await leerAgenda();
  const bloqueados = new Set(agenda.bloqueados);
  const desde = desdeCuandoSeReserva(ahora);
  const vistos = new Map<string, Horario>();
  for (const h of [...horariosBase(ahora), ...agenda.extras.map(horarioDesdeId)]) {
    if (h && h.fecha.getTime() > desde && !bloqueados.has(h.id)) vistos.set(h.id, h);
  }
  return ordenar([...vistos.values()]);
}

/** ¿Se puede reservar este horario? (existe en la agenda, no está bloqueado y respeta la anticipación mínima) */
export async function disponible(id: string, ahora = new Date()): Promise<boolean> {
  return (await horarios(ahora)).some((h) => h.id === id);
}

/** id de horario → id del usuario que lo reservó (si hubiera dos compras de un horario, vale la primera). */
export async function ocupados(): Promise<Map<string, string>> {
  const compras = await leer<Compra[]>("compras");
  const tomados = new Map<string, string>();
  for (const c of compras) {
    const id = c.producto.startsWith("sesion:") ? c.producto.slice("sesion:".length) : null;
    if (id && !tomados.has(id)) tomados.set(id, c.usuario);
  }
  return tomados;
}

export type EstadoAgenda = "libre" | "reservado" | "bloqueado";
export type HorarioAgenda = Horario & { estado: EstadoAgenda; origen: "base" | "extra"; usuario?: string };

/**
 * La agenda completa, para el panel de Julián: todos los horarios futuros
 * (también los bloqueados y los reservados), con su estado y de dónde vienen.
 * Una reserva sigue a la vista hasta que termina el encuentro, no cuando empieza.
 */
export async function agendaCompleta(ahora = new Date()): Promise<HorarioAgenda[]> {
  const agenda = await leerAgenda();
  const tomados = await ocupados();
  const extras = new Set(agenda.extras);
  const bloqueados = new Set(agenda.bloqueados);
  const base = new Set(horariosBase(ahora).map((h) => h.id));
  const ids = new Set([...base, ...agenda.extras, ...agenda.bloqueados, ...tomados.keys()]);
  const lista: HorarioAgenda[] = [];
  for (const id of ids) {
    const h = horarioDesdeId(id);
    const usuario = tomados.get(id);
    if (!h || (usuario ? fin(h) <= ahora.getTime() : h.fecha <= ahora)) continue;
    // un id bloqueado que no está ni en la base ni en los extras ya no es un horario
    if (!extras.has(id) && !base.has(id) && !usuario) continue;
    const estado: EstadoAgenda = usuario ? "reservado" : bloqueados.has(id) ? "bloqueado" : "libre";
    lista.push({ ...h, estado, origen: extras.has(id) ? "extra" : "base", usuario });
  }
  return lista.sort((x, y) => x.fecha.getTime() - y.fecha.getTime());
}
