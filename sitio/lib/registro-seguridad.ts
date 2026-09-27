/**
 * Registro de seguridad: qué pasó, cuándo y desde qué huella de IP. Solo node (usa
 * lib/db.ts); el middleware no lo usa.
 *
 * Se guarda en data/seguridad.json (en la carpeta de datos del prototipo), con un tope
 * de 3000 eventos: lo más viejo se descarta. Nunca la IP en claro (solo su huella HMAC),
 * nunca claves, tokens ni códigos; los mails se guardan como huella.
 *
 * Bajo ataque no multiplica las escrituras: los eventos que llegan mientras se está
 * escribiendo se juntan en la escritura siguiente, y el mismo evento desde la misma
 * huella se anota como mucho 20 veces por minuto (el resto se cuenta en «omitidos»).
 *
 *   await registrar("login_fallido", { cuenta: u?.id }, h);
 *   await registrar("admin_accion", { accion: "bloquear", horario: id, cuenta: u.id });
 *   const eventos = await ultimos(50);   // para un panel
 *
 * PRODUCCIÓN: mandar estos eventos a un servicio de logs (Vercel Log Drains, Axiom…).
 */
import { huella, huellaIp } from "./cliente";
import { leer, modificar } from "./db";

export type EventoSeguridad =
  | "login_fallido"
  | "login_ok"
  | "totp_fallido"
  | "bloqueo"
  | "limite"
  | "alerta"
  | "desafio_pedido"
  | "desafio_ok"
  | "desafio_fallido"
  | "bot"
  | "cuenta_creada"
  | "admin_accion"
  | "admin_ingreso";

type Dato = string | number | boolean | null;

export type RegistroSeguridad = {
  fecha: string;
  evento: EventoSeguridad;
  /** Huella de la IP (o de su /64), nunca la IP. */
  ip?: string;
  /** Veces que se repitió y no se anotó (por el tope de 20 por minuto). */
  omitidos?: number;
  datos?: Record<string, Dato>;
};

const ARCHIVO = "seguridad";
const TOPE = 3000;
const REPETICIONES_POR_MINUTO = 20;

/** Nunca se guardan: el dato entero se descarta. */
const PROHIBIDAS = /clave|pass|contrase|token|secret|secreto|desafio|codigo|cookie|firma|^ip$|totp/i;
/** Se guardan como huella. */
const COMO_HUELLA = /^(e?mail|contacto|destino)$/i;

type Estado = {
  pendientes: RegistroSeguridad[];
  escribiendo: Promise<void> | null;
  repeticiones: Map<string, { minuto: number; n: number; omitidos: number }>;
};
const g = globalThis as { __jbRegistro?: Estado };
const est: Estado = (g.__jbRegistro ??= { pendientes: [], escribiendo: null, repeticiones: new Map() });

async function limpiarDatos(datos: Record<string, unknown>): Promise<Record<string, Dato> | undefined> {
  const out: Record<string, Dato> = {};
  for (const [k, v] of Object.entries(datos).slice(0, 12)) {
    if (PROHIBIDAS.test(k) || v === undefined) continue;
    const clave = k.slice(0, 40);
    if (COMO_HUELLA.test(k) && typeof v === "string") {
      out[clave] = await huella(v.trim().toLowerCase(), "registro");
      continue;
    }
    if (v === null || typeof v === "boolean") out[clave] = v;
    else if (typeof v === "number") out[clave] = Number.isFinite(v) ? v : null;
    else out[clave] = String(v).replace(/[\u0000-\u001f\u007f]/g, " ").slice(0, 120);
  }
  return Object.keys(out).length ? out : undefined;
}

/** Escribe todo lo pendiente en una sola pasada (y lo que llegue mientras, en la siguiente). */
function vaciar(): Promise<void> {
  if (est.escribiendo) return est.escribiendo.then(() => (est.pendientes.length ? vaciar() : undefined));
  const tanda = est.pendientes.splice(0);
  if (!tanda.length) return Promise.resolve();
  est.escribiendo = modificar<RegistroSeguridad[], void>(ARCHIVO, (lista) => {
    const todos = (Array.isArray(lista) ? lista : []).concat(tanda);
    return { datos: todos.length > TOPE ? todos.slice(-TOPE) : todos, resultado: undefined };
  })
    .catch((e) => console.warn("No se pudo guardar el registro de seguridad.", e instanceof Error ? e.message : e))
    .finally(() => {
      est.escribiendo = null;
    });
  return est.escribiendo;
}

/**
 * Anota un evento. Nunca lanza un error ni frena la acción (si falla, queda en la consola).
 * `h`: los encabezados del pedido, para la huella de la IP.
 */
export async function registrar(evento: EventoSeguridad, datos: Record<string, unknown> = {}, h?: Headers): Promise<void> {
  try {
    const ip = h ? await huellaIp(h) : undefined;
    const minuto = Math.floor(Date.now() / 60_000);
    const clave = `${evento}|${ip ?? "-"}`;
    const rep = est.repeticiones.get(clave);
    let omitidos = 0;
    if (rep && rep.minuto === minuto) {
      rep.n++;
      if (rep.n > REPETICIONES_POR_MINUTO) {
        rep.omitidos++;
        return;
      }
    } else {
      omitidos = rep?.omitidos ?? 0;
      est.repeticiones.set(clave, { minuto, n: 1, omitidos: 0 });
      if (est.repeticiones.size > 5000) {
        for (const [k, r] of est.repeticiones) if (r.minuto < minuto) est.repeticiones.delete(k);
      }
    }
    est.pendientes.push({
      fecha: new Date().toISOString(),
      evento,
      ...(ip ? { ip } : {}),
      ...(omitidos ? { omitidos } : {}),
      ...(Object.keys(datos).length ? { datos: await limpiarDatos(datos) } : {}),
    });
    await vaciar();
  } catch (e) {
    console.warn("Registro de seguridad:", e instanceof Error ? e.message : e);
  }
}

/** Los últimos `n` eventos, del más nuevo al más viejo (para el panel de Julián). */
export async function ultimos(n = 100): Promise<RegistroSeguridad[]> {
  try {
    const lista = await leer<RegistroSeguridad[]>(ARCHIVO);
    return (Array.isArray(lista) ? lista : []).slice(-Math.max(1, Math.min(n, TOPE))).reverse();
  } catch {
    return [];
  }
}

/** Cuántos eventos de cada tipo hubo en las últimas `horas` (para un resumen en el panel). */
export async function resumen(horas = 24): Promise<Partial<Record<EventoSeguridad, number>>> {
  const desde = Date.now() - horas * 3600_000;
  const out: Partial<Record<EventoSeguridad, number>> = {};
  for (const r of await ultimos(TOPE)) {
    if (Date.parse(r.fecha) < desde) break;
    out[r.evento] = (out[r.evento] ?? 0) + 1 + (r.omitidos ?? 0);
  }
  return out;
}
