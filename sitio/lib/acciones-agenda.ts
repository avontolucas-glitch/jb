"use server";
/**
 * Acciones del panel de agenda de Julián. Cada una verifica en el servidor que
 * quien la usa sea la cuenta de Julián (admin): nunca se confía en el navegador.
 */
import { revalidatePath } from "next/cache";
import { esAdmin, usuarioActual } from "./auth";
import { agregarHorario, bloquearDia, cambiarHorario, type Resultado } from "./agenda";
import { idDesdeFormulario } from "./sesiones";

/**
 * Lo que vuelve al panel: el aviso, el horario al que llevar el calendario
 * (`id`) y, si algo salió mal, lo que se había cargado (`valores`), para no
 * tener que escribirlo de nuevo.
 */
export type EstadoAgenda = { error?: string; ok?: string; id?: string; valores?: { fecha: string; hora: string } } | null;

const NO = { error: "Solo la cuenta de Julián puede cambiar la agenda." };
const esJulian = async () => esAdmin(await usuarioActual());
const txt = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

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
  if (!(await esJulian())) return NO;
  const valores = { fecha: txt(f, "fecha"), hora: txt(f, "hora") };
  if (!valores.fecha || !valores.hora) return { error: "Elegí la fecha y la hora.", valores };
  const id = idDesdeFormulario(valores.fecha, valores.hora);
  if (!id) return { error: "Revisá la fecha y la hora.", valores };
  return responder(await agregarHorario(id), valores);
}

/** Bloquear con anticipación: un horario (fecha y hora) o, sin hora, todos los de ese día. */
export async function accionBloquear(_: EstadoAgenda, f: FormData): Promise<EstadoAgenda> {
  if (!(await esJulian())) return NO;
  const valores = { fecha: txt(f, "bloqueo-fecha"), hora: txt(f, "bloqueo-hora") };
  if (!valores.fecha) return { error: "Elegí el día.", valores };
  if (!valores.hora) return responder(await bloquearDia(valores.fecha), valores);
  const id = idDesdeFormulario(valores.fecha, valores.hora);
  if (!id) return { error: "Revisá la fecha y la hora.", valores };
  return responder(await cambiarHorario(id, "bloquear"), valores);
}

export async function accionCambiarHorario(_: EstadoAgenda, f: FormData): Promise<EstadoAgenda> {
  if (!(await esJulian())) return NO;
  const id = String(f.get("horario") ?? "");
  const que = String(f.get("que") ?? "");
  if (que !== "bloquear" && que !== "desbloquear" && que !== "quitar") return { error: "Acción desconocida." };
  const r = await cambiarHorario(id, que);
  if ("ok" in r) refrescar();
  return r;
}
