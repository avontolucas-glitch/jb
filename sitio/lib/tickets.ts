/**
 * Consultas a una persona («tickets») que se dejan desde Yo Da cuando la
 * persona ya lo intentó con el bot y no se resolvió. Solo con cuenta.
 * Las ven los moderadores en Mi espacio → Consultas: la cuenta de Julián y los
 * mails de la variable MODERADORES (separados por coma; por ejemplo el de Lucas).
 * Si hay RESEND_API_KEY y AVISOS_DESDE, además llega un mail a cada moderador.
 *
 * PRODUCCIÓN: en Vercel los archivos de data/ son temporales; para no perder
 * consultas, usar una base de datos (y el aviso por mail).
 */
import { leer, modificar } from "./db";
import { esAdmin, usuarioActual, type Usuario } from "./auth";

export type TipoTicket = "consulta" | "queja" | "compra";
export type EstadoTicket = "abierto" | "en-curso" | "resuelto";
export type Ticket = {
  id: string;
  uid: string;
  nombre: string;
  email: string;
  tipo: TipoTicket;
  mensaje: string;
  /** Lo que la persona habló con Yo Da antes (para saber qué intentó). */
  conversacion: { de: "yo" | "vos"; texto: string }[];
  pagina: string;
  estado: EstadoTicket;
  creado: string;
  actualizado: string;
  /** Nota interna del moderador (la persona no la ve). */
  nota?: string;
};

export const TIPOS: Record<TipoTicket, string> = { consulta: "Consulta", queja: "Queja", compra: "Problema con una compra" };
export const ESTADOS: Record<EstadoTicket, string> = { abierto: "Abierta", "en-curso": "En curso", resuelto: "Resuelta" };

export const moderadores = () =>
  (process.env.MODERADORES ?? "")
    .split(",")
    .map((m) => m.trim().toLowerCase())
    .filter(Boolean);

export const esModerador = (u: Usuario | null | undefined): boolean => !!u && (esAdmin(u) || moderadores().includes(u.email.toLowerCase()));

export async function moderadorActual(): Promise<Usuario | null> {
  const u = await usuarioActual();
  return esModerador(u) ? u : null;
}

export async function todos(): Promise<Ticket[]> {
  const l = await leer<Ticket[]>("tickets");
  return (Array.isArray(l) ? l : []).sort((a, b) => b.creado.localeCompare(a.creado));
}

export const deCuenta = async (uid: string) => (await todos()).filter((t) => t.uid === uid);
export const abiertoDe = async (uid: string) => (await deCuenta(uid)).find((t) => t.estado !== "resuelto") ?? null;

/** T-4F7K2Q: seis caracteres sin los que se confunden (0/O, 1/I). */
function nuevoId(): string {
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const b = crypto.getRandomValues(new Uint8Array(6));
  return "T-" + Array.from(b, (x) => abc[x % abc.length]).join("");
}

export async function guardar(t: Omit<Ticket, "id" | "estado" | "creado" | "actualizado">): Promise<Ticket> {
  const ahora = new Date().toISOString();
  const nuevo: Ticket = { ...t, id: nuevoId(), estado: "abierto", creado: ahora, actualizado: ahora };
  await modificar<Ticket[], null>("tickets", (l) => ({ datos: [...(Array.isArray(l) ? l : []), nuevo].slice(-2000), resultado: null }));
  return nuevo;
}

export async function actualizar(id: string, cambios: { estado?: EstadoTicket; nota?: string }): Promise<boolean> {
  return modificar<Ticket[], boolean>("tickets", (l) => {
    const lista = Array.isArray(l) ? l : [];
    const t = lista.find((x) => x.id === id);
    if (!t) return { resultado: false };
    if (cambios.estado) t.estado = cambios.estado;
    if (cambios.nota !== undefined) t.nota = cambios.nota;
    t.actualizado = new Date().toISOString();
    return { datos: lista, resultado: true };
  });
}

/** Aviso por mail a los moderadores (si hay servicio de mail configurado). Nunca frena la consulta. */
export async function avisarModeradores(t: Ticket): Promise<void> {
  const clave = process.env.RESEND_API_KEY;
  const desde = process.env.AVISOS_DESDE;
  const para = moderadores();
  if (!clave || !desde || !para.length) return;
  const cuerpo = [
    `${TIPOS[t.tipo]} de ${t.nombre} <${t.email}>`,
    `Página: ${t.pagina}`,
    "",
    t.mensaje,
    "",
    "— Lo que habló con Yo Da —",
    ...t.conversacion.map((m) => `${m.de === "vos" ? "Persona" : "Yo Da"}: ${m.texto}`),
  ].join("\n");
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${clave}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: desde, to: para, reply_to: t.email, subject: `Consulta ${t.id} · ${TIPOS[t.tipo]}`, text: cuerpo }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    /* el aviso es un extra: la consulta ya quedó guardada */
  }
}
