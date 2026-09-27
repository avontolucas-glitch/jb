"use server";
/**
 * Consultas a una persona (tickets): crearlas desde Yo Da y moderarlas.
 * Protegidas como el resto de los formularios (lib/proteger.ts): trampas para
 * bots, límites por cuenta e IP y verificación tipo CAPTCHA si hace falta.
 */
import { revalidatePath } from "next/cache";
import { usuarioActual } from "./auth";
import { proteger } from "./proteger";
import { opcion, sinControl, texto } from "./validar";
import { abiertoDe, actualizar, avisarModeradores, guardar, moderadorActual, TIPOS, type EstadoTicket, type TipoTicket } from "./tickets";

export type EstadoTicketForm = { error?: string; verificar?: boolean; ok?: string; id?: string } | null;

export async function accionCrearTicket(_: EstadoTicketForm, f: FormData): Promise<EstadoTicketForm> {
  const u = await usuarioActual();
  if (!u) return { error: "Para dejar tu consulta, ingresá con tu cuenta." };
  const previo = await abiertoDe(u.id);
  if (previo) return { error: `Ya tenés una consulta abierta (${previo.id}). Una persona te va a responder por mail; la ves en Mi espacio → Consultas.` };

  const tipo = opcion(String(f.get("tipo") ?? ""), Object.keys(TIPOS) as TipoTicket[]);
  const mensaje = texto(f, "mensaje", { max: 1500, min: 15, lineas: true });
  if (!tipo) return { error: "Elegí de qué se trata." };
  if (!mensaje) return { error: "Contá un poco más qué pasó (al menos una frase)." };

  const p = await proteger("ticket", f, { cuenta: u.id, demo: u.demo });
  if (!p.ok) return p.estado;

  // lo que habló con Yo Da: como mucho 12 mensajes cortos, sin caracteres de control
  let conversacion: { de: "yo" | "vos"; texto: string }[] = [];
  try {
    const crudo = JSON.parse(String(f.get("conversacion") ?? "[]"));
    if (Array.isArray(crudo))
      conversacion = crudo
        .slice(-12)
        .filter((m) => m && (m.de === "yo" || m.de === "vos") && typeof m.texto === "string")
        .map((m) => ({ de: m.de, texto: sinControl(m.texto).slice(0, 300) }));
  } catch {}
  const pagina = sinControl(String(f.get("pagina") ?? "")).slice(0, 120);

  const t = await guardar({ uid: u.id, nombre: u.nombre, email: u.email, tipo, mensaje, conversacion, pagina: pagina.startsWith("/") ? pagina : "/" });
  await p.exito([]);
  void avisarModeradores(t);
  revalidatePath("/mi-espacio/consultas");
  return { ok: `Hmm. Llegó. Tu consulta es la ${t.id}. Una persona te va a responder por mail a ${u.email}.`, id: t.id };
}

export async function accionModerarTicket(f: FormData): Promise<void> {
  const m = await moderadorActual();
  if (!m) return;
  const id = String(f.get("id") ?? "");
  const estado = opcion(String(f.get("estado") ?? ""), ["abierto", "en-curso", "resuelto"] as EstadoTicket[]) ?? undefined;
  const nota = f.has("nota") ? sinControl(String(f.get("nota") ?? ""), true).slice(0, 1000) : undefined;
  if (!/^T-[A-Z0-9]{6}$/.test(id)) return;
  await actualizar(id, { estado, nota });
  revalidatePath("/mi-espacio/consultas");
}
