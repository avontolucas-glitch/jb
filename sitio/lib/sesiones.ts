/**
 * Horarios de las sesiones privadas y cuáles están ocupados.
 * PRODUCCIÓN: los horarios salen de la agenda real de Julián (por ejemplo un
 * calendario conectado) y la reserva se confirma solo con el pago aprobado.
 */
import { leer } from "./db";
import type { Compra } from "./access";
import { sesiones } from "@/content/config";

export type Horario = { id: string; fecha: Date; etiqueta: string; dia: string; hora: string };

const ZONA = "America/Argentina/Buenos_Aires";
const fmtDia = new Intl.DateTimeFormat("es-AR", { timeZone: ZONA, weekday: "long", day: "numeric", month: "long" });
const fmtHora = new Intl.DateTimeFormat("es-AR", { timeZone: ZONA, hour: "2-digit", minute: "2-digit", hour12: false });
const dos = (n: number) => String(n).padStart(2, "0");

/** "2026-09-29T18-00" → fecha (hora de Argentina, UTC−3) */
export function horarioDesdeId(id: string): Horario | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2})-(\d{2})$/.exec(id);
  if (!m) return null;
  const fecha = new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:00-03:00`);
  if (Number.isNaN(fecha.getTime())) return null;
  const dia = fmtDia.format(fecha);
  const hora = fmtHora.format(fecha);
  return { id, fecha, dia, hora, etiqueta: `${dia}, ${hora} h` };
}

/** Los horarios de ejemplo de las próximas semanas (desde mañana). */
export function horarios(ahora = new Date()): Horario[] {
  const lista: Horario[] = [];
  // "hoy" en Argentina
  const hoyAR = new Date(ahora.getTime() - 3 * 3600 * 1000);
  for (let d = 1; d <= sesiones.semanas * 7; d++) {
    const x = new Date(Date.UTC(hoyAR.getUTCFullYear(), hoyAR.getUTCMonth(), hoyAR.getUTCDate() + d));
    for (const t of sesiones.dias) {
      if (x.getUTCDay() !== t.dia) continue;
      const id = `${x.getUTCFullYear()}-${dos(x.getUTCMonth() + 1)}-${dos(x.getUTCDate())}T${dos(t.hora)}-00`;
      const h = horarioDesdeId(id);
      if (h) lista.push(h);
    }
  }
  return lista;
}

/** id de horario → id del usuario que lo reservó */
export async function ocupados(): Promise<Map<string, string>> {
  const compras = await leer<Compra[]>("compras");
  return new Map(compras.filter((c) => c.producto.startsWith("sesion:")).map((c) => [c.producto.slice("sesion:".length), c.usuario]));
}
