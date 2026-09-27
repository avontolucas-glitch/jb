/**
 * Lo que Julián ve y cambia desde su panel (Mi espacio → Agenda).
 * Las funciones que cambian la agenda NO chequean permisos: las llaman las
 * acciones de lib/acciones-agenda.ts, que antes verifican que sea Julián.
 */
import { leer } from "./db";
import { usuarios } from "./auth";
import { sesiones } from "@/content/config";
import {
  baseDelDia,
  cambiarAgenda,
  desdeCuandoSeReserva,
  esDeLaBase,
  fin,
  horarioDesdeId,
  horariosBase,
  hoyEnArgentina,
  ocupados,
  type Agenda,
  type Horario,
} from "./sesiones";

export type NotaSesion = { usuario: string; horario: string; nota: string; fecha?: string };
export type Reserva = { horario: Horario; nombre: string; email: string; nota?: string };

/** Reservas que todavía no terminaron (sin las canceladas), en orden, con quién reservó y lo que contó. */
export async function reservasFuturas(ahora = new Date()): Promise<Reserva[]> {
  const tomados = await ocupados();
  const gente = new Map((await usuarios()).map((u) => [u.id, u]));
  const notas = await leer<NotaSesion[]>("notas_sesion");
  const lista: Reserva[] = [];
  for (const [id, uid] of tomados) {
    const h = horarioDesdeId(id);
    // sigue en la lista hasta que termina el encuentro: quien llega tarde tiene con qué entrar
    if (!h || fin(h) <= ahora.getTime()) continue;
    const u = gente.get(uid);
    const nota = notas.filter((n) => n.horario === id && n.usuario === uid).at(-1)?.nota;
    lista.push({ horario: h, nombre: u?.nombre ?? "(cuenta borrada)", email: u?.email ?? "", nota });
  }
  return lista.sort((x, y) => x.horario.fecha.getTime() - y.horario.fecha.getTime());
}

/** `id`: el horario al que conviene llevar el calendario del panel después del cambio. */
export type Resultado = { ok: string; id?: string } | { error: string };

/** Máximo de anticipación para cargar o bloquear un horario. */
const UN_ANIO = 366 * 24 * 3600 * 1000;

/** Que el horario sea futuro y de hasta un año adelante. */
function fueraDeRango(h: Horario, ahora: Date): string | null {
  if (h.fecha <= ahora) return "Ese horario ya pasó. Elegí uno futuro.";
  if (h.fecha.getTime() - ahora.getTime() > UN_ANIO) return "Se pueden cargar horarios de hasta un año adelante.";
  return null;
}

/** "AAAA-MM-DD" del día `n` días antes o después del de `h`, en hora de Argentina. */
const diaCorrido = (h: Horario, n: number) => new Date(h.fecha.getTime() - 3 * 3600e3 + n * 864e5).toISOString().slice(0, 10);

/**
 * Otro horario vigente (no bloqueado, o ya reservado) que empiece a menos de
 * `sesiones.duracionMinutos` de `h`: dos encuentros así se pisarían.
 */
async function sePisaCon(h: Horario, agenda: Agenda, ahora: Date): Promise<Horario | null> {
  const tomados = await ocupados();
  const bloqueados = new Set(agenda.bloqueados);
  const cerca = [-1, 0, 1].flatMap((n) => baseDelDia(diaCorrido(h, n), ahora));
  const duracion = sesiones.duracionMinutos * 60_000;
  let pisa: Horario | null = null;
  for (const id of new Set([...cerca, ...agenda.extras, ...tomados.keys()])) {
    if (id === h.id || (bloqueados.has(id) && !tomados.has(id))) continue;
    const otro = horarioDesdeId(id);
    if (!otro || fin(otro) <= ahora.getTime()) continue;
    const distancia = Math.abs(otro.fecha.getTime() - h.fecha.getTime());
    if (distancia < duracion && (!pisa || distancia < Math.abs(pisa.fecha.getTime() - h.fecha.getTime()))) pisa = otro;
  }
  return pisa;
}

/** Mayúscula inicial, para los avisos que empiezan con el día («Martes, 29 de septiembre…»). */
const may = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

const seLePisa = (otro: Horario) => ({ error: `Se pisa con el horario de ${otro.etiqueta}. Elegí otro.` });

export async function agregarHorario(id: string, ahora = new Date()): Promise<Resultado> {
  const h = horarioDesdeId(id);
  if (!h) return { error: "Revisá la fecha y la hora." };
  const rango = fueraDeRango(h, ahora);
  if (rango) return { error: rango };
  if (h.fecha.getTime() <= desdeCuandoSeReserva(ahora)) {
    return { error: `Ese horario empieza en menos de ${sesiones.anticipacionHoras} horas y ya nadie lo puede reservar. Elegí uno más adelante.` };
  }
  return cambiarAgenda<Resultado>(async (agenda) => {
    // la base semanal cuenta sin límite de semanas: así un horario fijo nunca queda también como agregado
    const enBase = esDeLaBase(id, ahora);
    const bloqueado = agenda.bloqueados.includes(id);
    if ((enBase || agenda.extras.includes(id)) && !bloqueado) {
      const todaviaNo = enBase && !horariosBase(ahora).some((b) => b.id === id);
      return {
        resultado: {
          ok: todaviaNo
            ? may(`${h.etiqueta} ya es uno de los horarios fijos de cada semana: aparece para reservar ${sesiones.semanas} semanas antes.`)
            : `Ese horario ya estaba en la agenda: ${h.etiqueta}.`,
          id,
        },
      };
    }
    const pisa = await sePisaCon(h, agenda, ahora);
    if (pisa) return { resultado: seLePisa(pisa) };
    return {
      agenda: { extras: enBase ? agenda.extras : [...agenda.extras, id], bloqueados: agenda.bloqueados.filter((b) => b !== id) },
      resultado: { ok: bloqueado ? `Listo, agregaste de nuevo ${h.etiqueta}: estaba bloqueado.` : `Listo, agregaste ${h.etiqueta}.`, id },
    };
  });
}

/**
 * Bloquear, desbloquear o quitar un horario que no esté reservado. Vale para
 * cualquier horario de hasta un año adelante, aunque todavía no esté a la vista
 * (por ejemplo, un horario fijo de dentro de dos meses).
 */
export async function cambiarHorario(id: string, que: "bloquear" | "desbloquear" | "quitar", ahora = new Date()): Promise<Resultado> {
  const h = horarioDesdeId(id);
  if (!h) return { error: "Revisá la fecha y la hora." };
  const rango = fueraDeRango(h, ahora);
  if (rango) return { error: rango };
  if ((await ocupados()).has(id)) return { error: "Ese horario ya está reservado: no se puede cambiar desde acá." };
  return cambiarAgenda<Resultado>(async (agenda) => {
    const extra = agenda.extras.includes(id);
    const base = esDeLaBase(id, ahora);
    if (!extra && !base) return { resultado: { error: `No hay ningún horario en la agenda para ${h.etiqueta}.` } };
    const bloqueado = agenda.bloqueados.includes(id);
    if (que === "bloquear") {
      if (bloqueado) return { resultado: { ok: may(`${h.etiqueta} ya estaba bloqueado.`), id } };
      return { agenda: { ...agenda, bloqueados: [...agenda.bloqueados, id] }, resultado: { ok: `Bloqueaste ${h.etiqueta}.`, id } };
    }
    if (que === "desbloquear") {
      if (!bloqueado) return { resultado: { ok: may(`${h.etiqueta} no estaba bloqueado.`), id } };
      const pisa = await sePisaCon(h, agenda, ahora);
      if (pisa) return { resultado: seLePisa(pisa) };
      return { agenda: { ...agenda, bloqueados: agenda.bloqueados.filter((b) => b !== id) }, resultado: { ok: `Desbloqueaste ${h.etiqueta}.`, id } };
    }
    // «quitar»: un horario fijo de la semana no se puede sacar de la configuración desde acá, así que se bloquea
    const extras = agenda.extras.filter((e) => e !== id);
    if (base) {
      return {
        agenda: { extras, bloqueados: [...agenda.bloqueados, id] },
        resultado: { ok: may(`${h.etiqueta} es uno de los horarios fijos de cada semana: quedó bloqueado.`), id },
      };
    }
    return { agenda: { extras, bloqueados: agenda.bloqueados.filter((b) => b !== id) }, resultado: { ok: `Quitaste ${h.etiqueta}.` } };
  });
}

/** Bloquea todos los horarios de un día "AAAA-MM-DD" (por ejemplo, unas vacaciones). Las reservas no se tocan. */
export async function bloquearDia(fecha: string, ahora = new Date()): Promise<Resultado> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || !horarioDesdeId(`${fecha}T00-00`)) return { error: "Revisá la fecha." };
  if (fecha < hoyEnArgentina(ahora)) return { error: "Ese día ya pasó. Elegí uno futuro." };
  const tomados = await ocupados();
  return cambiarAgenda<Resultado>(async (agenda) => {
    const ids = [...new Set([...baseDelDia(fecha, ahora), ...agenda.extras.filter((e) => e.startsWith(`${fecha}T`))])]
      .filter((id) => {
        const h = horarioDesdeId(id);
        return h && !fueraDeRango(h, ahora);
      })
      .sort();
    if (ids.length === 0) {
      const lejos = horarioDesdeId(`${fecha}T00-00`)!.fecha.getTime() - ahora.getTime() > UN_ANIO;
      return { resultado: { error: lejos ? "Se pueden bloquear días de hasta un año adelante." : "Ese día no tiene horarios por delante." } };
    }
    const dia = horarioDesdeId(ids[0])!.dia;
    const reservados = ids.filter((id) => tomados.has(id)).length;
    const nuevos = ids.filter((id) => !tomados.has(id) && !agenda.bloqueados.includes(id));
    const aparte = reservados
      ? ` ${reservados === 1 ? "Uno ya está reservado" : `${reservados} ya están reservados`}: las reservas no se tocan desde acá.`
      : "";
    if (nuevos.length === 0) return { resultado: { ok: `El ${dia} no tenía horarios libres para bloquear.${aparte}`, id: ids[0] } };
    return {
      agenda: { ...agenda, bloqueados: [...agenda.bloqueados, ...nuevos] },
      resultado: { ok: `Bloqueaste ${nuevos.length === 1 ? "el horario" : `los ${nuevos.length} horarios`} del ${dia}.${aparte}`, id: nuevos[0] },
    };
  });
}
