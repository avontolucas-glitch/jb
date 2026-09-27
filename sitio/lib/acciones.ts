"use server";
/**
 * Acciones de los formularios (se ejecutan en el servidor).
 * Todas devuelven { error } o { ok } para mostrar un mensaje, o redirigen.
 */
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { crearCuenta, ingresar, cerrarSesion, usuarioActual } from "./auth";
import { accesos, type Progreso } from "./access";
import { leer, escribir, modificar } from "./db";
import { producto, pagarSimulado, montoElegido } from "./payments";
import { canjear } from "./codigos";
import { disponible, ocupados } from "./sesiones";
import { modulos } from "@/content/config";

export type Estado = { error?: string; ok?: string } | null;

const txt = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const mailValido = (m: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m);

/** Solo se vuelve a rutas internas del sitio. */
function destinoSeguro(v: string, porDefecto = "/mi-espacio") {
  return v.startsWith("/") && !v.startsWith("//") && !v.startsWith("/\\") ? v : porDefecto;
}

export async function accionIngresar(_: Estado, f: FormData): Promise<Estado> {
  const r = await ingresar(txt(f, "email"), String(f.get("clave") ?? ""));
  if (!r.ok) return { error: r.error };
  redirect(destinoSeguro(txt(f, "volver")));
}

export async function accionCrearCuenta(_: Estado, f: FormData): Promise<Estado> {
  const r = await crearCuenta(txt(f, "nombre"), txt(f, "email"), String(f.get("clave") ?? ""));
  if (!r.ok) return { error: r.error };
  redirect(destinoSeguro(txt(f, "volver")));
}

export async function accionSalir() {
  await cerrarSesion();
  redirect("/?sesion=cerrada");
}

export async function accionLista(_: Estado, f: FormData): Promise<Estado> {
  const canal = txt(f, "canal");
  const nombre = txt(f, "nombre");
  const contacto = txt(f, "contacto");
  const interes = txt(f, "interes").slice(0, 40) || "general";
  if (canal !== "whatsapp" && canal !== "mail") return { error: "Elegí WhatsApp o mail." };
  if (canal === "mail" && !mailValido(contacto)) return { error: "Revisá el mail." };
  if (canal === "whatsapp" && contacto.replace(/\D/g, "").length < 8) return { error: "Revisá el número, con código de área." };
  const lista = await leer<{ id: string; canal: string; nombre: string; contacto: string; interes: string; fecha: string }[]>("lista");
  if (!lista.some((l) => l.contacto === contacto && l.interes === interes)) {
    lista.push({ id: crypto.randomUUID(), canal, nombre, contacto, interes, fecha: new Date().toISOString() });
    await escribir("lista", lista);
  }
  return { ok: canal === "mail" ? "Listo. Te vamos a avisar por mail." : "Listo. Te vamos a avisar por WhatsApp." };
}


export async function accionProgreso(f: FormData) {
  const u = await usuarioActual();
  if (!u || !(await accesos(u.id)).masterclass) redirect("/ingresar?aviso=privado");
  const modulo = txt(f, "modulo");
  if (!modulos.some((m) => m.id === modulo)) return;
  const hecho = txt(f, "hecho") === "si";
  let lista = await leer<Progreso[]>("progreso");
  lista = lista.filter((p) => !(p.usuario === u.id && p.modulo === modulo));
  if (hecho) lista.push({ usuario: u.id, modulo, fecha: new Date().toISOString() });
  await escribir("progreso", lista);
  revalidatePath("/mi-espacio", "layout");
}

export type Pregunta = { id: string; usuario: string; texto: string; fecha: string };

export async function accionPregunta(_: Estado, f: FormData): Promise<Estado> {
  const u = await usuarioActual();
  if (!u || !(await accesos(u.id)).encuentro) return { error: "Necesitás la masterclass para mandar preguntas." };
  const texto = txt(f, "pregunta");
  if (texto.length < 5) return { error: "Escribí tu pregunta." };
  if (texto.length > 1500) return { error: "La pregunta es muy larga (máximo 1500 caracteres)." };
  const lista = await leer<Pregunta[]>("preguntas");
  lista.push({ id: crypto.randomUUID(), usuario: u.id, texto, fecha: new Date().toISOString() });
  await escribir("preguntas", lista);
  revalidatePath("/mi-espacio/encuentro");
  return { ok: "Tu pregunta quedó enviada." };
}

/** Checkout simulado: registra la compra y lleva a lo que se habilitó. */
export async function accionPagar(_: Estado, f: FormData): Promise<Estado> {
  const u = await usuarioActual();
  const id = txt(f, "producto");
  if (!u) redirect(`/ingresar?aviso=checkout&volver=/checkout/${encodeURIComponent(id)}`);
  const p = producto(id);
  if (!p) return { error: "Ese producto no existe." };
  const m = montoElegido(p, txt(f, "monto"));
  if ("error" in m) return { error: m.error };
  const tomado = { error: "Ese horario se acaba de reservar. Elegí otro." };
  const slot = p.id.startsWith("sesion:") ? p.id.slice("sesion:".length) : null;
  if (slot) {
    const quien = (await ocupados()).get(slot);
    if (quien && quien !== u.id) return tomado;
    if (!quien && !(await disponible(slot))) return { error: "Ese horario ya no está en la agenda. Elegí otro." };
  }
  // el pago vuelve a mirar, de una sola vez, que nadie haya reservado ese horario en el medio
  const pago = await pagarSimulado(u.id, p, m.monto);
  if (!pago.ok) return tomado;
  const nota = slot ? txt(f, "nota").slice(0, 1500) : "";
  if (slot && nota) {
    type Nota = { usuario: string; horario: string; nota: string; fecha: string };
    await modificar<Nota[], void>("notas_sesion", (notas) => ({
      datos: [...notas, { usuario: u.id, horario: slot, nota, fecha: new Date().toISOString() }],
      resultado: undefined,
    }));
  }
  revalidatePath("/", "layout");
  if (p.id === "masterclass") redirect("/mi-espacio/masterclass?compra=ok");
  if (p.id.startsWith("directo:")) redirect(`/mi-espacio/en-vivo?compra=ok`);
  if (p.id.startsWith("sesion:")) redirect("/mi-espacio/sesiones?compra=ok");
  if (p.id.startsWith("libro:")) redirect(`/mi-espacio/biblioteca/${p.id.split(":")[1]}?compra=ok`);
  redirect("/mi-espacio/conferencias?compra=ok");
}

/** Canjear el código del libro impreso por el libro digital. */
export async function accionCanjear(_: Estado, f: FormData): Promise<Estado> {
  const u = await usuarioActual();
  if (!u) redirect(`/ingresar?aviso=canjear&volver=/canjear`);
  const r = await canjear(u.id, txt(f, "codigo"));
  if (!r.ok) return { error: r.error };
  revalidatePath("/", "layout");
  redirect(`/mi-espacio/biblioteca/${r.libro}?canje=ok`);
}

/** Botón de arrepentimiento: registra el pedido y devuelve un código de seguimiento. */
export async function accionArrepentimiento(_: Estado, f: FormData): Promise<Estado> {
  const nombre = txt(f, "nombre");
  const email = txt(f, "email").toLowerCase();
  const compra = txt(f, "compra").slice(0, 500);
  if (nombre.length < 2) return { error: "Escribí tu nombre." };
  if (!mailValido(email)) return { error: "Revisá el mail." };
  if (compra.length < 3) return { error: "Contanos qué compraste." };
  const codigo = `ARR-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  const lista = await leer<{ codigo: string; nombre: string; email: string; compra: string; fecha: string }[]>("arrepentimientos");
  lista.push({ codigo, nombre, email, compra, fecha: new Date().toISOString() });
  await escribir("arrepentimientos", lista);
  return { ok: `Recibimos tu pedido. Tu código de seguimiento es ${codigo}. Te escribimos a ${email}.` };
}
