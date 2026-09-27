"use server";
/**
 * Acciones de los formularios (se ejecutan en el servidor).
 * Todas devuelven { error } o { ok } para mostrar un mensaje, o redirigen.
 *
 * Cada acción pública pasa, en este orden, por:
 *  1) Trampas contra bots (lib/trampas.ts): si llenó el campo oculto o llamó a la
 *     acción sin el formulario, se le responde como si hubiera salido bien, sin
 *     guardar nada, y queda registrado («bot»). Si mandó en menos de 1,5 s, se le
 *     pide la verificación (puede ser una persona con autocompletar).
 *  2) Validación y saneamiento (lib/validar.ts), con los largos máximos.
 *  3) Límites por cliente y por cuenta (lib/limite.ts, tabla LIMITES) y, desde el
 *     umbral de cada función, la verificación «Confirmá que sos una persona»
 *     (lib/desafio.ts). Más allá del máximo, un bloqueo temporal con un aviso sereno.
 *     Todo eso lo hace proteger() (lib/proteger.ts).
 *
 * Ingresar no usa proteger(): ingresar() (lib/auth.ts) ya hace sus límites, su
 * verificación y su registro.
 */
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { crearCuenta, ingresar, cerrarSesion, usuarioActual } from "./auth";
import { accesos, type Progreso } from "./access";
import { escribir, leer, modificar } from "./db";
import { producto, pagarSimulado, montoElegido } from "./payments";
import { canjear, exitoCanje, falloCanje, REVISA_CODIGO, vigilanciaCanje } from "./codigos";
import { disponible, ocupados } from "./sesiones";
import { modulos } from "@/content/config";
import { modoPruebas } from "./cliente";
import { verificarDesafio, CAMPO_DESAFIO } from "./desafio";
import { fallo, revisar, sujetosDe, TEXTOS, type Funcion } from "./limite";
import { proteger } from "./proteger";
import { registrar } from "./registro-seguridad";
import { esBot } from "./trampas";
import { clave as claveDe, crudo, destinoSeguro, mail, opcion, texto, whatsapp } from "./validar";

/** `verificar` (o `desafio`, el mismo pedido con otro nombre): el formulario muestra la casilla «Confirmá que sos una persona». */
export type Estado = { error?: string; ok?: string; verificar?: boolean; desafio?: boolean } | null;

/** Largos máximos de los campos (la auditoría). */
const MAX = { nombre: 80, mail: 120, pregunta: 1500, nota: 800, contacto: 60, compra: 500 } as const;

/**
 * Tope de filas de los archivos que llena el público (lista, arrepentimientos, preguntas,
 * notas): pasado este número no se guarda más, se registra una alerta y se responde
 * «muchos intentos». Así un ataque repartido no llena el disco ni alarga sin fin cada
 * escritura. PRODUCCIÓN: lo resuelve la base de datos.
 */
const TOPE_FILAS = 20_000;
/** Marca que devuelve modificar() cuando el archivo llegó al tope. */
const LLENO = "lleno" as const;

async function avisarLleno(archivo: string) {
  await registrar("alerta", { motivo: "archivo lleno: no se guardan más filas", archivo }, await headers());
}

/* ───────── Trampas ───────── */

/**
 * Paso 1 de cada acción pública. «bot»: llenó el campo trampa o llamó a la acción
 * sin el formulario (se registra, cuenta como 3 fallos y hay que fingir que salió
 * bien). «rapido»: mandó en menos de 1,5 s (proteger() con trampas le pide la
 * verificación). «ok»: nada raro.
 * En modo pruebas (JB_PRUEBAS=1, nunca en Vercel) no se mira el tiempo: Playwright
 * completa y envía en milisegundos.
 */
async function trampas(funcion: Funcion | Funcion[], f: FormData, o: { cuenta?: string | null; demo?: boolean } = {}): Promise<"bot" | "rapido" | "ok"> {
  const t = esBot(f, { minimoMs: modoPruebas() ? 0 : undefined });
  if (!t.bot) return "ok";
  if (t.motivo === "rapido") return "rapido";
  const h = await headers();
  const funciones = Array.isArray(funcion) ? funcion : [funcion];
  await fallo(funciones, await sujetosDe(h, o), t.peso);
  await registrar("bot", { funcion: funciones.join("+"), motivo: t.motivo }, h);
  return "bot";
}

/* ───────── Cuentas ───────── */

export async function accionIngresar(_: Estado, f: FormData): Promise<Estado> {
  // El campo trampa: no se le avisa nada al bot, pero sus intentos valen por tres
  // y ingresar() le pide la verificación enseguida. (Sin mirar el tiempo: el
  // autocompletar de las claves puede ser más rápido que una persona.)
  const t = esBot(f, { minimoMs: 0 });
  if (t.bot) {
    const h = await headers();
    await fallo("login", await sujetosDe(h), t.peso);
    await registrar("bot", { funcion: "login", motivo: t.motivo }, h);
  }
  // La clave va sin recortar. En el paso del código (sin mail ni clave) ingresar()
  // se arregla con la cookie del paso.
  const volver = destinoSeguro(crudo(f, "volver"));
  const r = await ingresar(crudo(f, "email"), crudo(f, "clave"), { f });
  if (!r.ok) {
    if (r.totp && !f.has("codigo")) redirect(`/ingresar?volver=${encodeURIComponent(volver)}`);
    return { error: r.error, verificar: r.verificar };
  }
  redirect(volver);
}

export async function accionCrearCuenta(_: Estado, f: FormData): Promise<Estado> {
  const volver = destinoSeguro(crudo(f, "volver"));
  const t = await trampas("crearCuenta", f);
  if (t === "bot") redirect(volver);

  const nombre = texto(f, "nombre", { max: MAX.nombre, min: 2 });
  if (nombre === null) return { error: `Escribí tu nombre (hasta ${MAX.nombre} letras).` };
  const email = crudo(f, "email").length <= MAX.mail ? mail(crudo(f, "email")) : null;
  if (!email) return { error: "Revisá el mail." };
  const clave = claveDe(f);
  if (clave === null) return { error: crudo(f, "clave") ? "La clave es demasiado larga." : "Elegí una clave." };

  const p = await proteger("crearCuenta", f, { mail: email, trampas: t === "rapido" });
  if (!p.ok) return p.estado;
  // crearCuenta() valida la clave (política nueva) y registra «cuenta_creada»
  const r = await crearCuenta(nombre, email, clave);
  if (!r.ok) {
    // un mail que ya tenía cuenta pesa 3: sacar qué mails tienen cuenta cuesta caro
    await p.fallo(r.repetido ? 3 : 1);
    return { error: r.error };
  }
  await p.exito([]);
  redirect(volver);
}

export async function accionSalir() {
  await cerrarSesion();
  redirect("/?sesion=cerrada");
}

/* ───────── Lista de avisos ───────── */

type Suscripcion = { id: string; canal: string; nombre: string; contacto: string; interes: string; fecha: string };

export async function accionLista(_: Estado, f: FormData): Promise<Estado> {
  const t = await trampas("lista", f);
  const canal = opcion(crudo(f, "canal"), ["whatsapp", "mail"] as const);
  const listo = (c: string | null) => ({ ok: c === "whatsapp" ? "Listo. Te vamos a avisar por WhatsApp." : "Listo. Te vamos a avisar por mail." });
  if (t === "bot") return listo(canal);

  if (!canal) return { error: "Elegí WhatsApp o mail." };
  const nombre = texto(f, "nombre", { max: MAX.nombre });
  if (nombre === null) return { error: `El nombre es muy largo (hasta ${MAX.nombre} letras).` };
  const crudoContacto = crudo(f, "contacto");
  const contacto =
    canal === "mail"
      ? crudoContacto.length <= MAX.mail
        ? mail(crudoContacto)
        : null
      : crudoContacto.length <= MAX.contacto
        ? whatsapp(crudoContacto)
        : null;
  if (!contacto) return { error: canal === "mail" ? "Revisá el mail." : "Revisá el número, con código de área." };
  const interes = texto(f, "interes", { max: 40, cortar: true }) || "general";

  const p = await proteger("lista", f, { destino: contacto, trampas: t === "rapido" });
  if (!p.ok) return p.estado;
  const r = await modificar<Suscripcion[], typeof LLENO | void>("lista", (lista) => {
    const todos = Array.isArray(lista) ? lista : [];
    if (todos.some((l) => l.contacto === contacto && l.interes === interes)) return { resultado: undefined };
    if (todos.length >= TOPE_FILAS) return { resultado: LLENO };
    return { datos: [...todos, { id: crypto.randomUUID(), canal, nombre, contacto, interes, fecha: new Date().toISOString() }], resultado: undefined };
  });
  if (r === LLENO) {
    await avisarLleno("lista");
    return { error: TEXTOS.muchosTarde };
  }
  return listo(canal);
}

/* ───────── Masterclass ───────── */

export async function accionProgreso(f: FormData) {
  const u = await usuarioActual();
  if (!u || !(await accesos(u.id)).masterclass) redirect("/ingresar?aviso=privado");
  // pasado el cupo se ignora en silencio: es solo marcar un módulo como visto
  const v = await revisar("progreso", await sujetosDe(await headers(), { cuenta: u.id, demo: u.demo }));
  if (!v.permitido) return;
  const modulo = texto(f, "modulo", { max: 60 });
  if (!modulo || !modulos.some((m) => m.id === modulo)) return;
  const hecho = crudo(f, "hecho") === "si";
  let lista = await leer<Progreso[]>("progreso");
  lista = lista.filter((p) => !(p.usuario === u.id && p.modulo === modulo));
  if (hecho) lista.push({ usuario: u.id, modulo, fecha: new Date().toISOString() });
  await escribir("progreso", lista);
  revalidatePath("/mi-espacio", "layout");
}

export type Pregunta = { id: string; usuario: string; texto: string; fecha: string };

export async function accionPregunta(_: Estado, f: FormData): Promise<Estado> {
  const u = await usuarioActual();
  const t = await trampas("pregunta", f, { cuenta: u?.id, demo: u?.demo });
  if (t === "bot") return { ok: "Tu pregunta quedó enviada." };
  if (!u || !(await accesos(u.id)).encuentro) return { error: "Necesitás la masterclass para mandar preguntas." };

  const pregunta = texto(f, "pregunta", { max: MAX.pregunta, lineas: true });
  if (pregunta === null) return { error: `La pregunta es muy larga (máximo ${MAX.pregunta} caracteres).` };
  if (pregunta.length < 5) return { error: "Escribí tu pregunta." };

  const p = await proteger("pregunta", f, { cuenta: u.id, demo: u.demo, trampas: t === "rapido" });
  if (!p.ok) return p.estado;
  const r = await modificar<Pregunta[], typeof LLENO | void>("preguntas", (lista) => {
    const todas = Array.isArray(lista) ? lista : [];
    if (todas.length >= TOPE_FILAS) return { resultado: LLENO };
    return { datos: [...todas, { id: crypto.randomUUID(), usuario: u.id, texto: pregunta, fecha: new Date().toISOString() }], resultado: undefined };
  });
  if (r === LLENO) {
    await avisarLleno("preguntas");
    return { error: TEXTOS.muchosTarde };
  }
  revalidatePath("/mi-espacio/encuentro");
  return { ok: "Tu pregunta quedó enviada." };
}

/* ───────── Pagar ───────── */

/** A dónde lleva cada compra una vez hecha (redirige: no vuelve). */
function irALoComprado(id: string): never {
  if (id === "masterclass") redirect("/mi-espacio/masterclass?compra=ok");
  if (id.startsWith("directo:")) redirect(`/mi-espacio/en-vivo?compra=ok`);
  if (id.startsWith("sesion:")) redirect("/mi-espacio/sesiones?compra=ok");
  if (id.startsWith("libro:")) redirect(`/mi-espacio/biblioteca/${id.split(":")[1]}?compra=ok`);
  redirect("/mi-espacio/conferencias?compra=ok");
}

/** Checkout simulado: registra la compra y lleva a lo que se habilitó. */
export async function accionPagar(_: Estado, f: FormData): Promise<Estado> {
  const u = await usuarioActual();
  const id = texto(f, "producto", { max: 120 }) ?? "";
  if (!u) redirect(`/ingresar?aviso=checkout&volver=/checkout/${encodeURIComponent(id)}`);
  const t = await trampas("pagar", f, { cuenta: u.id, demo: u.demo });
  const p = producto(id);
  if (!p) return { error: "Ese producto no existe." };
  if (t === "bot") irALoComprado(p.id);

  const m = montoElegido(p, crudo(f, "monto").slice(0, 32));
  if ("error" in m) return { error: m.error };
  const slot = p.id.startsWith("sesion:") ? p.id.slice("sesion:".length) : null;
  const nota = slot ? texto(f, "nota", { max: MAX.nota, lineas: true }) : "";
  if (nota === null) return { error: `La nota es muy larga (hasta ${MAX.nota} caracteres).` };

  const puerta = await proteger(nota ? ["pagar", "nota"] : "pagar", f, { cuenta: u.id, demo: u.demo, trampas: t === "rapido" });
  if (!puerta.ok) return puerta.estado;

  const tomado = { error: "Ese horario se acaba de reservar. Elegí otro." };
  if (slot) {
    const quien = (await ocupados()).get(slot);
    if (quien && quien !== u.id) return tomado;
    if (!quien && !(await disponible(slot))) return { error: "Ese horario ya no está en la agenda. Elegí otro." };
  }
  // el pago vuelve a mirar, de una sola vez, que nadie haya reservado ese horario en el medio
  const pago = await pagarSimulado(u.id, p, m.monto);
  if (!pago.ok) return tomado;
  if (slot && nota) {
    type Nota = { usuario: string; horario: string; nota: string; fecha: string };
    // (el pago ya está hecho: si el archivo de notas está lleno, la reserva sigue y solo se avisa)
    const r = await modificar<Nota[], typeof LLENO | void>("notas_sesion", (notas) => {
      const todas = Array.isArray(notas) ? notas : [];
      if (todas.length >= TOPE_FILAS) return { resultado: LLENO };
      return { datos: [...todas, { usuario: u.id, horario: slot, nota, fecha: new Date().toISOString() }], resultado: undefined };
    });
    if (r === LLENO) await avisarLleno("notas_sesion");
  }
  revalidatePath("/", "layout");
  irALoComprado(p.id);
}

/* ───────── Canjear el código del libro ───────── */

/**
 * Canjear el código del libro impreso por el libro digital. Contra la fuerza bruta,
 * además de LIMITES.canjear: desde el 3.er código equivocado en una hora (por cuenta
 * o por cliente) se pide la verificación, y con 10 se bloquea el canje una hora.
 */
export async function accionCanjear(_: Estado, f: FormData): Promise<Estado> {
  const u = await usuarioActual();
  if (!u) redirect(`/ingresar?aviso=canjear&volver=/canjear`);
  const t = await trampas("canjear", f, { cuenta: u.id, demo: u.demo });
  if (t === "bot") return { error: "Ese código no existe. Revisalo letra por letra." };

  const codigo = texto(f, "codigo", { max: 40 });
  if (!codigo) return { error: REVISA_CODIGO };

  const h = await headers();
  const s = await sujetosDe(h, { cuenta: u.id, demo: u.demo });
  const antes = await vigilanciaCanje(s);
  if (antes.bloqueoSeg > 0) {
    await registrar("bloqueo", { funcion: "canjear", regla: "canje:fallos", reintentoSeg: antes.bloqueoSeg }, h);
    return { error: TEXTOS.muchosTarde };
  }
  const p = await proteger("canjear", f, { cuenta: u.id, demo: u.demo, trampas: t === "rapido", h });
  if (!p.ok) return p.estado;
  // si proteger() no pidió la verificación (ni por la tabla ni por el tiempo) pero los
  // fallos de canje sí, se pide acá (cada token sirve una sola vez)
  if (antes.verificar && !p.v.verificar && t !== "rapido") {
    if (!f.get(CAMPO_DESAFIO)) {
      await registrar("desafio_pedido", { funcion: "canjear", regla: "canje:fallos" }, h);
      return { error: TEXTOS.verificar, verificar: true };
    }
    if (!(await verificarDesafio(f, h))) {
      await registrar("desafio_fallido", { funcion: "canjear" }, h);
      return { error: TEXTOS.verificar, verificar: true };
    }
    await registrar("desafio_ok", { funcion: "canjear" }, h);
  }

  const r = await canjear(u.id, codigo);
  if (!r.ok) {
    await p.fallo();
    if (await falloCanje(s)) {
      await registrar("bloqueo", { funcion: "canjear", regla: "canje:fallos", reintentoSeg: 3600 }, h);
      return { error: TEXTOS.muchosTarde };
    }
    // el próximo intento, ¿ya pide verificación? así la casilla aparece de entrada
    const despues = await vigilanciaCanje(s);
    return { error: r.error, verificar: despues.verificar || undefined };
  }
  await p.exito();
  await exitoCanje(s);
  revalidatePath("/", "layout");
  redirect(`/mi-espacio/biblioteca/${r.libro}?canje=ok`);
}

/* ───────── Botón de arrepentimiento ───────── */

type Arrepentimiento = {
  codigo: string;
  nombre: string;
  email: string;
  compra: string;
  fecha: string;
  /** Llegó con el campo trampa lleno: puede ser un bot o una persona con autocompletar. Revisarlo igual. */
  sospechoso?: boolean;
};

/** Código de seguimiento: ARR- y 6 signos al azar (sin 0/O ni 1/I/L). */
function codigoSeguimiento(): string {
  const A = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  return `ARR-${Array.from(crypto.getRandomValues(new Uint8Array(6)), (x) => A[x % A.length]).join("")}`;
}

/** Guarda un pedido de arrepentimiento; LLENO si el archivo llegó al tope. */
async function guardarArrepentimiento(a: Arrepentimiento): Promise<typeof LLENO | void> {
  return modificar<Arrepentimiento[], typeof LLENO | void>("arrepentimientos", (lista) => {
    const todos = Array.isArray(lista) ? lista : [];
    if (todos.length >= TOPE_FILAS) return { resultado: LLENO };
    return { datos: [...todos, a], resultado: undefined };
  });
}

/**
 * Botón de arrepentimiento (Res. 424/2020): registra el pedido y devuelve un código
 * de seguimiento. El primer envío desde un cliente nunca pide verificación.
 * Acá, a diferencia del resto, lo que parece de un bot (campo trampa lleno) NO se
 * descarta: un gestor de claves o el autocompletar pueden llenar «Sitio web», y una
 * persona que ejerce su derecho no puede quedarse con un código de un pedido que no
 * existe. Se guarda marcado como sospechoso (con su propio tope) para revisarlo.
 */
export async function accionArrepentimiento(_: Estado, f: FormData): Promise<Estado> {
  const t = await trampas("arrepentimiento", f);
  const nombre = texto(f, "nombre", { max: MAX.nombre, min: 2 });
  const email = crudo(f, "email").length <= MAX.mail ? mail(crudo(f, "email")) : null;
  const compra = texto(f, "compra", { max: MAX.compra, lineas: true, cortar: true }) ?? "";
  const recibido = (codigo: string, a: string) => ({ ok: `Recibimos tu pedido. Tu código de seguimiento es ${codigo}. Te escribimos a ${a}.` });
  if (t === "bot") {
    const codigo = codigoSeguimiento();
    if (nombre && email) {
      const v = await revisar("arrepentimientoSospechoso", await sujetosDe(await headers()));
      if (v.permitido) {
        const r = await guardarArrepentimiento({ codigo, nombre, email, compra: compra.slice(0, MAX.compra), fecha: new Date().toISOString(), sospechoso: true });
        if (r === LLENO) await avisarLleno("arrepentimientos");
      }
    }
    return recibido(codigo, email ?? "tu mail");
  }

  if (nombre === null) return { error: `Escribí tu nombre (hasta ${MAX.nombre} letras).` };
  if (!email) return { error: "Revisá el mail." };
  if (compra.length < 3) return { error: "Contanos qué compraste." };

  const p = await proteger("arrepentimiento", f, { destino: email, trampas: t === "rapido" });
  if (!p.ok) return p.estado;
  const codigo = codigoSeguimiento();
  if ((await guardarArrepentimiento({ codigo, nombre, email, compra, fecha: new Date().toISOString() })) === LLENO) {
    await avisarLleno("arrepentimientos");
    return { error: TEXTOS.muchosTarde };
  }
  return recibido(codigo, email);
}
