"use server";
/**
 * Acciones del panel de agenda de Julián. Cada una verifica en el servidor que
 * quien la usa sea la cuenta de Julián (admin): nunca se confía en el navegador.
 * Además tienen un límite suave por cuenta (LIMITES.agenda, sin verificación) y
 * cada cambio queda en el registro de seguridad («admin_accion»).
 */
import { revalidatePath } from "next/cache";
import { esAdmin, usuarioActual } from "./auth";
import { agregarHorario, bloquearDia, cambiarHorario, type Resultado } from "./agenda";
import { idDesdeFormulario } from "./sesiones";
import { proteger } from "./proteger";
import { registrar } from "./registro-seguridad";
import { opcion, texto } from "./validar";

/**
 * Lo que vuelve al panel: el aviso, el horario al que llevar el calendario
 * (`id`) y, si algo salió mal, lo que se había cargado (`valores`), para no
 * tener que escribirlo de nuevo.
 */
export type EstadoAgenda = { error?: string; ok?: string; id?: string; valores?: { fecha: string; hora: string } } | null;

const NO = { error: "Solo la cuenta de Julián puede cambiar la agenda." };
const txt = (f: FormData, k: string) => texto(f, k, { max: 40 }) ?? "";

/**
 * La puerta de cada acción: que sea Julián y que no se pase del límite suave.
 * Devuelve el aviso para responder, o una función para anotar lo que se hizo.
 */
async function puerta(): Promise<{ no: EstadoAgenda } | { anotar: (accion: string, datos?: Record<string, string | null>) => Promise<void> }> {
  const u = await usuarioActual();
  if (!u || !esAdmin(u)) return { no: NO };
  const p = await proteger("agenda", null, { cuenta: u.id, trampas: false });
  if (!p.ok) return { no: { error: p.estado.error } };
  return { anotar: (accion, datos = {}) => registrar("admin_accion", { accion, cuenta: u.id, ...datos }, p.h) };
}

function refrescar() {
  revalidatePath("/mi-espacio/agenda");
  revalidatePath("/masterclass/1-a-1");
}

/** El resultado para el panel: con error, devuelve también lo que se había cargado. */
function responder(r: Resultado, valores: { fecha: string; hora: string }): EstadoAgenda {
  if ("error" in r) return { error: r.error, valores };
  refrescar();
  return r;
}

export async function accionAgregarHorario(_: EstadoAgenda, f: FormData): Promise<EstadoAgenda> {
  const pp = await puerta();
  if ("no" in pp) return pp.no;
  const valores = { fecha: txt(f, "fecha"), hora: txt(f, "hora") };
  if (!valores.fecha || !valores.hora) return { error: "Elegí la fecha y la hora.", valores };
  const id = idDesdeFormulario(valores.fecha, valores.hora);
  if (!id) return { error: "Revisá la fecha y la hora.", valores };
  const r = await agregarHorario(id);
  if (!("error" in r)) await pp.anotar("agregar", { horario: id });
  return responder(r, valores);
}

/** Bloquear con anticipación: un horario (fecha y hora) o, sin hora, todos los de ese día. */
export async function accionBloquear(_: EstadoAgenda, f: FormData): Promise<EstadoAgenda> {
  const pp = await puerta();
  if ("no" in pp) return pp.no;
  const valores = { fecha: txt(f, "bloqueo-fecha"), hora: txt(f, "bloqueo-hora") };
  if (!valores.fecha) return { error: "Elegí el día.", valores };
  if (!valores.hora) {
    const r = await bloquearDia(valores.fecha);
    if (!("error" in r)) await pp.anotar("bloquear_dia", { fecha: valores.fecha });
    return responder(r, valores);
  }
  const id = idDesdeFormulario(valores.fecha, valores.hora);
  if (!id) return { error: "Revisá la fecha y la hora.", valores };
  const r = await cambiarHorario(id, "bloquear");
  if (!("error" in r)) await pp.anotar("bloquear", { horario: id });
  return responder(r, valores);
}

export async function accionCambiarHorario(_: EstadoAgenda, f: FormData): Promise<EstadoAgenda> {
  const pp = await puerta();
  if ("no" in pp) return pp.no;
  const id = txt(f, "horario");
  const que = opcion(txt(f, "que"), ["bloquear", "desbloquear", "quitar"] as const);
  if (!que) return { error: "Acción desconocida." };
  const r = await cambiarHorario(id, que);
  if ("ok" in r) {
    await pp.anotar(que, { horario: id });
    refrescar();
  }
  return r;
}
