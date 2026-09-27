/**
 * «YODA»: el ojo que guía el sitio (el nombre, en `nombreBot`). Habla a su
 * manera, con las palabras dadas vuelta, y con un tono místico; pero es soporte,
 * no la voz de Julián: no lo cita, no enseña en su nombre, no interpreta sus
 * libros. Orienta (agenda, masterclass, libros, conferencias, app, cuenta,
 * reembolsos) con datos concretos y, para los problemas de una compra, un
 * encuentro o el acceso, pide ingresar o crear una cuenta.
 *
 * Cada tema tiene palabras que lo disparan (sin tildes, en minúscula), una
 * respuesta y a dónde lleva. Para sumar un tema, agregalo acá.
 *
 * PRODUCCIÓN: se le puede conectar una IA (por ejemplo Claude) con estas mismas
 * reglas y acceso a la agenda y a las compras de cada cuenta.
 */
import { enVivo, precios } from "./config";

export type Accion =
  | { tipo: "link"; texto: string; href: string }
  | { tipo: "instalar" }
  | { tipo: "musica" }
  | { tipo: "horarios" };

/** `cuenta: true`: tema de una compra, un encuentro o el acceso; sin sesión, YoDa primero pide ingresar o crear la cuenta. */
export type Tema = { id: string; chip?: string; claves: string[]; respuesta: string; acciones: Accion[]; cuenta?: boolean };

export const nombreBot = "YoDa";

export const CONTACTO = "(mail de contacto, a definir)";

export const saludo = "Hmm. Llegado has. YoDa soy, el ojo que guía este lugar. La agenda, la masterclass, los libros… en qué ayudarte puedo, decime.";
export const saludoCon = (nombre: string) => `Hmm. De vuelta estás, ${nombre}. Contento el ojo está. En qué ayudarte puedo, decime.`;

/** El globito que aparece junto al ojo al entrar (una vez por visita). */
export const aviso = "Hmm… ayudarte, puedo.";

export const noEntendi = `Claro no lo veo, eso. Con alguna de estas puertas probá, o a ${CONTACTO} escribí: una persona te responderá.`;

export const pedirCuenta = "Hmm. Para esto, saber quién sos necesito. Ingresá con tu cuenta, o crearla debés: un minuto es, nada más. Después, aquí te espero.";

export const temas: Tema[] = [
  {
    id: "agenda",
    chip: "Agendar un 1 a 1",
    claves: ["agenda", "agendar", "turno", "reserv", "horario", "1 a 1", "uno a uno", "1a1", "sesion", "encuentro", "cita", "videollamada", "privad", "disponib", "fecha libre"],
    respuesta: "Un encuentro uno a uno con Julián buscás, por videollamada. Estos horarios libres hay, en tu hora. Elegí uno, y como ya hecho, sentilo:",
    acciones: [{ tipo: "horarios" }, { tipo: "link", texto: "Ver todo el calendario", href: "/masterclass/1-a-1" }],
  },
  {
    id: "mis-encuentros",
    claves: ["mis encuentros", "mi encuentro", "mi reserva", "reprogram", "cambiar el horario", "cambiar horario", "cancelar el encuentro", "link de la videollamada", "no me llego el link"],
    respuesta: "En tu espacio, tus encuentros están: con el link de la videollamada y el botón para tu calendario. Reprogramar o cancelar sin costo podés, si con 48 horas avisás.",
    acciones: [
      { tipo: "link", texto: "Mis encuentros", href: "/mi-espacio/sesiones" },
      { tipo: "link", texto: "Condiciones", href: "/legales/reembolsos" },
    ],
    cuenta: true,
  },
  {
    id: "en-vivo",
    chip: "La masterclass en vivo",
    claves: ["vivo", "directo", "masterclass", "clase", "semanal", "transmision", "streaming", "sala"],
    respuesta: `Julián en vivo, la Masterclass es. ${enVivo.frecuencia}, y solo aquí se ve, con tu cuenta. Cuánto dar, vos elegís: desde ${enVivo.moneda} ${enVivo.minimo}. Lo que das, vuelve.`,
    acciones: [
      { tipo: "link", texto: "Próximos directos", href: "/masterclass" },
      { tipo: "link", texto: "Masterclass grabada", href: "/masterclass/grabada" },
    ],
  },
  {
    id: "grabada",
    claves: ["grabada", "modulo", "audios", "curso", "a mi ritmo"],
    respuesta: "Sin apuro, la Masterclass grabada se ve. A tu ritmo, módulo a módulo, con sus audios. El tiempo, tuyo es.",
    acciones: [{ tipo: "link", texto: "Masterclass grabada", href: "/masterclass/grabada" }],
  },
  {
    id: "libros",
    chip: "Los libros",
    claves: ["libro", "leer", "receta", "pensamiento", "biografia", "trilogia", "capitulo", "digital", "ebook"],
    respuesta: "Tres libros, una misma verdad: La Receta de la Manifestación, El Pensamiento es Tu Fe y la Biografía. Online se leen, aquí o en la app: con la edición digital, o con el código que el impreso trae.",
    acciones: [
      { tipo: "link", texto: "Ver los libros", href: "/libros" },
      { tipo: "link", texto: "Canjear el código", href: "/canjear" },
    ],
  },
  {
    id: "canjear",
    claves: ["codigo", "canje", "impreso", "fisico", "qr", "papel"],
    respuesta: "Un código único, cada libro impreso trae. Canjealo, y en tu cuenta el libro aparecerá, para leerlo también aquí. Una sola vez sirve.",
    acciones: [{ tipo: "link", texto: "Canjear el código", href: "/canjear" }],
  },
  {
    id: "conferencias",
    chip: "Conferencias",
    claves: ["conferencia", "entrada", "evento", "charla", "presencial"],
    respuesta: "En vivo, las conferencias son, y una entrada simbólica todas llevan. Tu entrada comprás, y en tu espacio el acceso aparece.",
    acciones: [{ tipo: "link", texto: "Ver las conferencias", href: "/conferencias" }],
  },
  {
    id: "app",
    chip: "Instalar la app",
    claves: ["app", "instal", "aplicacion", "celular", "pantalla de inicio", "descargar"],
    respuesta: "En tu teléfono, tablet o computadora, este lugar vivir puede. El botón tocá: tu sistema yo reconozco, y el camino te muestro.",
    acciones: [{ tipo: "instalar" }],
  },
  {
    id: "cuenta",
    chip: "Mi cuenta",
    claves: ["cuenta", "ingres", "login", "iniciar sesion", "clave", "contrasena", "registr", "usuario", "mi espacio"],
    respuesta: `Con tu cuenta, lo tuyo ves: tus compras, tus encuentros, tus libros. ¿Tu clave olvidaste? A ${CONTACTO} escribí.`,
    acciones: [
      { tipo: "link", texto: "Ingresar", href: "/ingresar" },
      { tipo: "link", texto: "Crear cuenta", href: "/crear-cuenta" },
      { tipo: "link", texto: "Mi espacio", href: "/mi-espacio" },
    ],
  },
  {
    id: "precios",
    claves: ["precio", "cuesta", "cuanto", "pagar", "pago", "tarjeta", "mercado pago", "paypal", "dolar", "valor"],
    respuesta: `En la Masterclass en vivo, cuánto pagar vos elegís: desde ${enVivo.moneda} ${enVivo.minimo}. Una entrada simbólica, las conferencias llevan. ${precios.sesionPrivada.aDefinir ? "El valor de la Masterclass 1 a 1, pronto anunciado será." : ""} Antes de pagar, cada página su precio muestra.`.replace(/\s+/g, " "),
    acciones: [
      { tipo: "link", texto: "Masterclass", href: "/masterclass" },
      { tipo: "link", texto: "Masterclass 1 a 1", href: "/masterclass/1-a-1" },
    ],
  },
  {
    id: "reembolso",
    chip: "Reembolsos",
    claves: ["reembolso", "devol", "arrepent", "cancelar la compra", "cancelar mi compra"],
    respuesta: "Diez días tenés, desde la compra, para arrepentirte. Cada cosa sus plazos tiene. Desde el Botón de arrepentimiento, pedirlo podés.",
    acciones: [
      { tipo: "link", texto: "Botón de arrepentimiento", href: "/arrepentimiento" },
      { tipo: "link", texto: "Política de reembolsos", href: "/legales/reembolsos" },
    ],
  },
  {
    id: "problema",
    claves: ["no funciona", "no anda", "error", "problema", "no puedo entrar", "no me deja", "no veo mi compra", "no aparece", "me cobraron", "pague y", "no me llego", "falla"],
    respuesta: `Hmm. Un nudo hay. Tranquilo: todo nudo, desatarse puede. Contame qué pasó, con el mail de tu cuenta, a ${CONTACTO}: una persona te responderá. En tu espacio, tus compras y accesos ver podés.`,
    acciones: [
      { tipo: "link", texto: "Mi espacio", href: "/mi-espacio" },
      { tipo: "link", texto: "Mi cuenta", href: "/mi-espacio/cuenta" },
    ],
    cuenta: true,
  },
  {
    id: "musica",
    claves: ["musica", "cancion", "playlist", "spotify", "escuchar"],
    respuesta: "Música, hay. De la playlist de Julián, al azar los temas llegan. Solo si la pedís, suena.",
    acciones: [{ tipo: "musica" }],
  },
  {
    id: "quien",
    claves: ["quien es", "julian", "chef", "gran premio", "cocina", "trayectoria"],
    respuesta: "Chef y conferencista, Julián Bermúdez es. Su historia, en «Quién es» la encontrás, en el inicio.",
    acciones: [{ tipo: "link", texto: "Quién es", href: "/#quien" }],
  },
  {
    id: "contacto",
    chip: "Hablar con una persona",
    claves: ["persona", "humano", "contacto", "soporte", "ayuda", "whatsapp", "mail"],
    respuesta: `Con una persona hablar querés. A ${CONTACTO} escribí: qué pasó contá, y con qué mail tu cuenta tenés.`,
    acciones: [],
  },
  {
    id: "gracias",
    claves: ["gracias", "genial", "perfecto", "buenisimo"],
    respuesta: "Nada que agradecer hay. Aquí estaré, cuando me necesites.",
    acciones: [],
  },
  {
    id: "hola",
    claves: ["hola", "buenas", "buen dia", "buenos dias", "buenas tardes", "buenas noches", "que tal"],
    respuesta: "Hola. Buscando algo estás, lo siento. ¿Qué es, decime?",
    acciones: [],
  },
];

const sinTildes = (t: string) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[¿?¡!.,;:]/g, " ");

/** El tema que mejor coincide con lo que escribió la persona (o null). */
export function entender(texto: string): Tema | null {
  const t = ` ${sinTildes(texto).replace(/\s+/g, " ")} `;
  let mejor: Tema | null = null;
  let puntos = 0;
  for (const tema of temas) {
    // las frases largas pesan más que las palabras sueltas
    const p = tema.claves.reduce((s, c) => (t.includes(c) ? s + c.length : s), 0);
    if (p > puntos) {
      puntos = p;
      mejor = tema;
    }
  }
  return mejor;
}
