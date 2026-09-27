"use server";
/**
 * Reprogramar y cancelar encuentros de la Masterclass 1 a 1.
 * - Quien reservó: reprograma o cancela lo suyo, con más de `HORAS_CAMBIO` horas de aviso.
 * - Julián (admin): libera cualquier reserva que no haya terminado (reembolso total).
 * Cada acción mira en el servidor quién la usa: nunca se confía en el navegador.
 * Todas funcionan sin JavaScript: son formularios comunes que vuelven a la
 * página con el resultado en la dirección (?cancelada=…, ?error=<código>); la
 * página muestra el texto del código (TEXTOS_RESERVA, en lib/sesiones.ts).
 */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { esAdmin, usuarioActual } from "./auth";
import { proteger } from "./proteger";
import { registrar } from "./registro-seguridad";
import { cancelarReserva, horarioDesdeId, reprogramarReserva } from "./sesiones";

const txt = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const q = (v: string) => encodeURIComponent(v);

function refrescar() {
  revalidatePath("/mi-espacio", "layout");
  revalidatePath("/masterclass/1-a-1");
}

/** Quien usa la acción, con sesión, y el límite de cambios por cuenta (sin verificación: ya ingresó). */
async function conSesion(volver: string) {
  const u = await usuarioActual();
  if (!u) redirect(`/ingresar?aviso=sesion&volver=${q(volver)}`);
  const p = await proteger("agenda", null, { cuenta: u.id, demo: u.demo });
  return { u, limitado: !p.ok };
}

/** Reprogramar: del horario `id` al horario `a`. */
export async function accionReprogramar(f: FormData): Promise<void> {
  const viejo = txt(f, "id");
  const nuevo = txt(f, "a");
  const volver = `/mi-espacio/sesiones/reprogramar?id=${q(viejo)}`;
  const { u, limitado } = await conSesion(volver);
  if (limitado) redirect(`${volver}&a=${q(nuevo)}&error=limite`);
  if (!horarioDesdeId(viejo) || !horarioDesdeId(nuevo)) redirect(`/mi-espacio/sesiones?error=horario`);
  const r = await reprogramarReserva(u.id, viejo, nuevo);
  if ("error" in r) {
    // si el encuentro ya no se puede tocar (o no es suyo), de vuelta a la lista; si no, a elegir otro horario
    const c = r.codigo;
    redirect(c === "tarde" || c === "ajena" ? `/mi-espacio/sesiones?error=${c}` : `${volver}&error=${c}`);
  }
  refrescar();
  redirect(`/mi-espacio/sesiones?reprogramada=${q(r.id)}`);
}

/** Cancelar un encuentro propio (con la confirmación ya dada en la página). */
export async function accionCancelar(f: FormData): Promise<void> {
  const id = txt(f, "id");
  const { u, limitado } = await conSesion("/mi-espacio/sesiones");
  if (limitado) redirect("/mi-espacio/sesiones?error=limite");
  const r = await cancelarReserva(id, { por: "cliente", uid: u.id });
  if ("error" in r) redirect(`/mi-espacio/sesiones?error=${r.codigo}`);
  refrescar();
  redirect(`/mi-espacio/sesiones?cancelada=${q(r.id)}`);
}

/** Julián libera una reserva: se cancela con reembolso total, porque cancela él. */
export async function accionLiberar(f: FormData): Promise<void> {
  const id = txt(f, "id");
  const { u, limitado } = await conSesion("/mi-espacio/agenda");
  // a quien no es Julián no se le dice nada más: la agenda no existe para él
  if (!esAdmin(u)) redirect("/mi-espacio");
  if (limitado) redirect("/mi-espacio/agenda?error=limite#reservas");
  const r = await cancelarReserva(id, { por: "julian" });
  if ("error" in r) redirect(`/mi-espacio/agenda?error=${r.codigo}#reservas`);
  await registrar("admin_accion", { accion: "liberar", horario: id, cuenta: u.id });
  refrescar();
  redirect(`/mi-espacio/agenda?liberada=${q(r.id)}#reservas`);
}
