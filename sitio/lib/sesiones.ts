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

/**
 * Una compra de la Masterclass 1 a 1, con lo que le puede pasar después:
 * - `cancelada`: fecha (ISO) en que se canceló; desde ahí no cuenta para nada
 *   (ni ocupa el horario, ni da acceso). La compra no se borra: queda el registro.
 * - `canceladaPor`: «cliente» (avisó con tiempo) o «julian» (la liberó él).
 * - `reembolso`: lo que se devuelve, por el mismo medio del pago.
 * - `reprogramaciones`: los cambios de horario, del más viejo al más nuevo.
 */
export type CompraSesion = Compra & {
  cancelada?: string;
  canceladaPor?: "cliente" | "julian";
  reembolso?: { monto: number; moneda: string; medio: string; estado: "simulado" | "pendiente" | "hecho" };
  reprogramaciones?: { de: string; a: string; fecha: string }[];
};

/** ¿La compra sigue en pie? (no está cancelada) */
export const vigente = (c: { cancelada?: string }) => !c.cancelada;

/** Con cuántas horas de aviso, como mínimo, se puede reprogramar o cancelar (la política de reembolsos). */
export const HORAS_CAMBIO = 48;

/** ¿Falta más que el aviso mínimo para el encuentro? Solo así se puede reprogramar o cancelar desde el sitio. */
export const sePuedeCambiar = (h: Horario, ahora = new Date()) => h.fecha.getTime() - ahora.getTime() > HORAS_CAMBIO * 3600_000;

const PREFIJO = "sesion:";
const idDeCompra = (c: Compra) => (c.producto.startsWith(PREFIJO) ? c.producto.slice(PREFIJO.length) : null);

/**
 * id de horario → id del usuario que lo reservó (si hubiera dos compras de un
 * horario, vale la primera). Las canceladas no cuentan: ese horario queda libre.
 */
export async function ocupados(): Promise<Map<string, string>> {
  const compras = await leer<CompraSesion[]>("compras");
  const tomados = new Map<string, string>();
  for (const c of compras) {
    const id = idDeCompra(c);
    if (id && vigente(c) && !tomados.has(id)) tomados.set(id, c.usuario);
  }
  return tomados;
}

/** Los horarios que reservó una persona y siguen en pie (sin los cancelados), en orden. */
export async function reservasDe(uid: string): Promise<Horario[]> {
  const compras = await leer<CompraSesion[]>("compras");
  const ids = new Set(
    compras
      .filter((c) => c.usuario === uid && vigente(c))
      .map(idDeCompra)
      .filter((id): id is string => !!id),
  );
  return ordenar([...ids].map(horarioDesdeId).filter((h): h is Horario => !!h));
}

/** Por qué no se pudo reprogramar o cancelar. El texto sale de `TEXTOS_RESERVA` (así viaja en la dirección sin que nadie lo invente). */
export type CodigoReserva = "limite" | "horario" | "mismo" | "tarde" | "agenda" | "tomado" | "ajena" | "terminado" | "ya";
export const TEXTOS_RESERVA: Record<CodigoReserva, string> = {
  limite: "Hiciste muchos cambios seguidos. Esperá un momento y probá de nuevo.",
  horario: "Revisá el horario.",
  mismo: "Ese ya es el horario de tu encuentro. Elegí otro.",
  tarde: `Faltan menos de ${HORAS_CAMBIO} horas para ese encuentro: ya no se puede cambiar desde acá.`,
  agenda: "Ese horario ya no está en la agenda. Elegí otro.",
  tomado: "Ese horario se acaba de reservar. Elegí otro.",
  ajena: "No encontramos ese encuentro entre tus reservas.",
  terminado: "Ese encuentro ya terminó.",
  ya: "Esa reserva ya no está.",
};
/** El texto de un código que vino en la dirección (o nada, si no es uno de los nuestros). */
export const textoReserva = (c?: string | null) => (c && Object.hasOwn(TEXTOS_RESERVA, c) ? TEXTOS_RESERVA[c as CodigoReserva] : null);

export type ResultadoReserva = { ok: string; id: string } | { error: string; codigo: CodigoReserva };
const falla = (codigo: CodigoReserva) => ({ error: TEXTOS_RESERVA[codigo], codigo });

type Nota = { usuario: string; horario: string; nota: string; fecha?: string };

/**
 * Pasa una reserva de un horario a otro, en un solo paso: mirar que el nuevo
 * esté libre y registrar el cambio pasan juntos (lib/db.ts), así nadie lo
 * reserva en el medio. El nuevo tiene que estar en la agenda, libre y con la
 * anticipación mínima; el viejo, a más de `HORAS_CAMBIO` horas. Lo que la
 * persona había contado para el encuentro pasa también al horario nuevo.
 * NO chequea la sesión: la llama lib/acciones-reservas.ts, que ya lo hizo.
 * PRODUCCIÓN: una transacción en la base de datos.
 */
export async function reprogramarReserva(uid: string, viejo: string, nuevo: string, ahora = new Date()): Promise<ResultadoReserva> {
  const hv = horarioDesdeId(viejo);
  const hn = horarioDesdeId(nuevo);
  if (!hv || !hn) return falla("horario");
  if (viejo === nuevo) return falla("mismo");
  if (!sePuedeCambiar(hv, ahora)) return falla("tarde");
  if (!(await disponible(nuevo, ahora))) return falla("agenda");
  const r = await modificar<CompraSesion[], ResultadoReserva>("compras", (compras) => {
    const i = compras.findIndex((c) => c.usuario === uid && vigente(c) && idDeCompra(c) === viejo);
    if (i < 0) return { resultado: falla("ajena") };
    if (compras.some((c) => vigente(c) && idDeCompra(c) === nuevo)) return { resultado: falla("tomado") };
    const c = compras[i];
    const cambiada: CompraSesion = {
      ...c,
      producto: `${PREFIJO}${nuevo}`,
      reprogramaciones: [...(c.reprogramaciones ?? []), { de: viejo, a: nuevo, fecha: ahora.toISOString() }],
    };
    return { datos: compras.map((x, j) => (j === i ? cambiada : x)), resultado: { ok: `Listo, tu encuentro pasó al ${hn.etiqueta}.`, id: nuevo } };
  });
  if ("ok" in r) {
    await modificar<Nota[], void>("notas_sesion", (notas) =>
      notas.some((n) => n.usuario === uid && n.horario === viejo)
        ? { datos: notas.map((n) => (n.usuario === uid && n.horario === viejo ? { ...n, horario: nuevo } : n)), resultado: undefined }
        : { resultado: undefined },
    );
  }
  return r;
}

/**
 * Cancela una reserva y libera el horario. La compra queda marcada como
 * cancelada (con fecha, quién la canceló y el reembolso), no se borra.
 * - `por: "cliente"`: solo su dueño (`uid`) y a más de `HORAS_CAMBIO` horas: reembolso total.
 * - `por: "julian"`: cualquier reserva que todavía no terminó: reembolso total, porque cancela él.
 * NO chequea la sesión: la llama lib/acciones-reservas.ts, que ya lo hizo.
 * PRODUCCIÓN: el reembolso se pide al medio de pago (Mercado Pago, PayPal…) y se le avisa por mail.
 */
export async function cancelarReserva(
  id: string,
  quien: { por: "cliente"; uid: string } | { por: "julian" },
  ahora = new Date(),
): Promise<ResultadoReserva> {
  const h = horarioDesdeId(id);
  if (!h) return falla("horario");
  if (quien.por === "cliente" && !sePuedeCambiar(h, ahora)) return falla("tarde");
  if (quien.por === "julian" && fin(h) <= ahora.getTime()) return falla("terminado");
  return modificar<CompraSesion[], ResultadoReserva>("compras", (compras) => {
    const i = compras.findIndex((c) => vigente(c) && idDeCompra(c) === id && (quien.por === "julian" || c.usuario === quien.uid));
    if (i < 0) return { resultado: falla(quien.por === "julian" ? "ya" : "ajena") };
    const c = compras[i];
    const cancelada: CompraSesion = {
      ...c,
      cancelada: ahora.toISOString(),
      canceladaPor: quien.por,
      reembolso: { monto: c.monto, moneda: c.moneda, medio: c.medio, estado: c.medio === "simulado" ? "simulado" : "pendiente" },
    };
    return {
      datos: compras.map((x, j) => (j === i ? cancelada : x)),
      resultado: {
        ok: quien.por === "julian" ? `Liberaste ${h.etiqueta}.` : `Cancelaste tu encuentro del ${h.etiqueta}.`,
        id,
      },
    };
  });
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
