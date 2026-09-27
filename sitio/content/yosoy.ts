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
  | { tipo: "sonido" }
  | { tipo: "ppt" }
  | { tipo: "moneda" }
  | { tipo: "horarios" };

/** `cuenta: true`: tema de una compra, un encuentro o el acceso; sin sesión, Yo Da primero pide ingresar o crear la cuenta. */
export type Tema = {
  id: string;
  chip?: string;
  claves: string[];
  respuesta: string;
  /** Variantes: si hay, se elige una al azar (para que no conteste siempre igual). */
  respuestas?: string[];
  acciones: Accion[];
  cuenta?: boolean;
  /** Cómo se lo ofrece como sugerencia después de otra respuesta. */
  etiqueta?: string;
  /** Qué sugerir después de esta respuesta (ids de otros temas). */
  siguientes?: string[];
  /** Hablar en voz alta (lee la respuesta anterior). */
  voz?: boolean;
};

export const nombreBot = "Yo Da";

export const CONTACTO = "(mail de contacto, a definir)";

export const saludo = "Hmm. Llegado has. Yo Da soy, el ojo que guía este lugar. Para acceder a más funciones, crearte una cuenta debés: un minuto es, nada más. La agenda, la masterclass, los libros… en qué ayudarte puedo, decime.";
/** Sin sesión, el saludo trae las dos puertas. */
export const puertasCuenta: Accion[] = [
  { tipo: "link", texto: "Crear cuenta", href: "/crear-cuenta" },
  { tipo: "link", texto: "Ingresar", href: "/ingresar" },
];
export const saludoCon = (nombre: string) => `Hmm. De vuelta estás, ${nombre}. Contento el ojo está. En qué ayudarte puedo, decime.`;

/** Lo que Yo Da dice solo, apenas se entra (una vez por visita). */
export const aviso = "Hmm. Llegado has. Yo Da soy. Para acceder a más funciones, crearte una cuenta debés. ¿En qué ayudarte puedo?";
/** Con sesión, el saludo al entrar es otro. */
export const avisoCon = (nombre: string) => `Hmm. De vuelta estás, ${nombre}. ¿En qué ayudarte puedo?`;

export const noEntendi = `Claro no lo veo, eso. Con alguna de estas puertas probá, o a ${CONTACTO} escribí: una persona te responderá.`;

export const pedirCuenta = "Hmm. Para esto, saber quién sos necesito. Ingresá con tu cuenta, o crearla debés: un minuto es, nada más. Después, aquí te espero.";

export const temas: Tema[] = [
  {
    id: "agenda",
    etiqueta: "Agendar un 1 a 1",
    siguientes: ["mis-encuentros", "precios"],
    chip: "Agendar un 1 a 1",
    claves: ["hablar con julian", "agenda", "agendar", "turno", "reserv", "horario", "1 a 1", "uno a uno", "1a1", "sesion", "encuentro", "cita", "videollamada", "privad", "disponib", "fecha libre"],
    respuesta: "Un encuentro uno a uno con Julián buscás, por videollamada. Estos horarios libres hay, en tu hora. Elegí uno, y como ya hecho, sentilo:",
    acciones: [{ tipo: "horarios" }, { tipo: "link", texto: "Ver todo el calendario", href: "/masterclass/1-a-1" }],
  },
  {
    id: "mis-encuentros",
    etiqueta: "Mis encuentros",
    siguientes: ["agenda"],
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
    etiqueta: "La masterclass en vivo",
    siguientes: ["grabada", "precios"],
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
    etiqueta: "La masterclass grabada",
    siguientes: ["en-vivo"],
    claves: ["grabada", "modulo", "audios", "curso", "a mi ritmo"],
    respuesta: "Sin apuro, la Masterclass grabada se ve. A tu ritmo, módulo a módulo, con sus audios. El tiempo, tuyo es.",
    acciones: [{ tipo: "link", texto: "Masterclass grabada", href: "/masterclass/grabada" }],
  },
  {
    id: "libros",
    etiqueta: "Los libros",
    siguientes: ["canjear", "quien"],
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
    etiqueta: "Canjear un código",
    siguientes: ["libros"],
    claves: ["codigo", "canje", "impreso", "fisico", "qr", "papel"],
    respuesta: "Un código único, cada libro impreso trae. Canjealo, y en tu cuenta el libro aparecerá, para leerlo también aquí. Una sola vez sirve.",
    acciones: [{ tipo: "link", texto: "Canjear el código", href: "/canjear" }],
  },
  {
    id: "conferencias",
    etiqueta: "Conferencias",
    siguientes: ["en-vivo"],
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
    etiqueta: "Precios",
    siguientes: ["reembolso"],
    claves: ["precio", "cuesta", "cuanto", "pagar", "pago", "tarjeta", "mercado pago", "paypal", "dolar", "valor"],
    respuesta: `En la Masterclass en vivo, cuánto pagar vos elegís: desde ${enVivo.moneda} ${enVivo.minimo}. Una entrada simbólica, las conferencias llevan. ${precios.sesionPrivada.aDefinir ? "El valor de la Masterclass 1 a 1, pronto anunciado será." : ""} Antes de pagar, cada página su precio muestra.`.replace(/\s+/g, " "),
    acciones: [
      { tipo: "link", texto: "Masterclass", href: "/masterclass" },
      { tipo: "link", texto: "Masterclass 1 a 1", href: "/masterclass/1-a-1" },
    ],
  },
  {
    id: "reembolso",
    etiqueta: "Reembolsos",
    siguientes: ["contacto"],
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
    id: "sonido",
    etiqueta: "Sonido",
    siguientes: ["musica"],
    claves: ["sonido", "silenci", "mute", "mutear", "callar", "calla", "apaga el sonido", "sin sonido", "volumen", "ruido", "molesta"],
    respuesta: "Hmm. También el silencio enseña. Desde aquí, el sonido del sitio apagar o prender podés. Si la música suena, también se detiene:",
    acciones: [{ tipo: "sonido" }],
  },
  {
    id: "musica",
    etiqueta: "Música",
    siguientes: ["sonido"],
    claves: ["musica", "cancion", "playlist", "spotify", "escuchar"],
    respuesta: "Música, hay. De la playlist de Julián, al azar los temas llegan. Solo si la pedís, suena.",
    acciones: [{ tipo: "musica" }],
  },
  {
    id: "quien",
    etiqueta: "Quién es Julián",
    siguientes: ["libros", "en-vivo"],
    claves: ["quien es", "julian", "chef", "gran premio", "cocina", "trayectoria"],
    respuesta: "Chef y conferencista, Julián Bermúdez es. Su historia, en «Quién es» la encontrás, en el inicio.",
    acciones: [{ tipo: "link", texto: "Quién es", href: "/#quien" }],
  },
  {
    id: "contacto",
    etiqueta: "Hablar con una persona",
    siguientes: ["cuenta"],
    chip: "Hablar con una persona",
    claves: ["persona", "humano", "contacto", "soporte", "ayuda", "whatsapp", "mail"],
    respuesta: `Con una persona hablar querés. A ${CONTACTO} escribí: qué pasó contá, y con qué mail tu cuenta tenés.`,
    acciones: [],
  },
  // ───────── si alguien está mal de verdad: sin chistes, la línea de ayuda
  {
    id: "ayuda-urgente",
    claves: ["suicid", "matarme", "me quiero morir", "quiero morirme", "no quiero vivir", "quitarme la vida", "hacerme dano", "lastimarme", "no aguanto mas"],
    respuesta:
      "Te leo, y me importa. Si estás pasando un momento muy difícil, no estás solo: hablá ya con alguien. En Argentina, el Centro de Asistencia al Suicida atiende al 135 (gratis desde CABA y GBA) o al (011) 5275-1135 desde todo el país. Si es una emergencia, llamá al 911. Y si podés, contale a alguien cerca tuyo cómo te sentís.",
    acciones: [],
  },
  // ───────── charla liviana, con gracia
  {
    id: "yoda",
    claves: ["yoda", "star wars", "la fuerza", "jedi", "sable de luz"],
    respuesta: "¿Yoda? No, no. Yo Da. Parecidos, tal vez. Parientes, no. Y verde no soy: dorado, mirá.",
    respuestas: [
      "¿Yoda? No, no. Yo Da. Parecidos, tal vez. Parientes, no. Y verde no soy: dorado, mirá.",
      "Hmm. Con otro me confundís. Yo Da soy: yo doy. Una mano, una respuesta, un horario libre.",
      "Espadas de luz no tengo. Un cursor, sí. Mucho más útil es, creeme.",
    ],
    acciones: [],
    siguientes: ["chiste", "ppt"],
  },
  {
    id: "quien-sos",
    claves: ["quien sos", "que sos", "sos un robot", "sos un bot", "sos real", "sos humano", "sos una ia", "inteligencia artificial", "como te llamas", "tu nombre"],
    respuesta: "Un ojo soy, con alas de píxel. Guía de este sitio. Robot del todo no, ángel del todo tampoco… algo en el medio. Hmm.",
    respuestas: [
      "Un ojo soy, con alas de píxel. Guía de este sitio. Robot del todo no, ángel del todo tampoco… algo en el medio. Hmm.",
      "Yo Da me llamo. Nací en este sitio, entre grabados y tinta. Parpadear y ayudar: eso hago.",
    ],
    acciones: [],
    siguientes: ["chiste", "como-estas"],
  },
  {
    id: "como-estas",
    claves: ["como estas", "como andas", "como va", "como te va", "que tal estas", "todo bien", "como te sentis"],
    respuesta: "Bien estoy. Parpadeando, como siempre. ¿Y vos?",
    respuestas: [
      "Bien estoy. Parpadeando, como siempre. ¿Y vos?",
      "Hmm. Contento el ojo está: visitas tengo. ¿Vos cómo andás?",
      "Un poco pixelado hoy. Nada grave. ¿Y vos, todo en orden?",
    ],
    acciones: [],
    siguientes: ["chiste", "ppt"],
  },
  {
    id: "chiste",
    chip: "Contame algo gracioso",
    etiqueta: "Otro chiste",
    claves: ["chiste", "gracioso", "hace reir", "hacerme reir", "algo divertido", "divertime", "contame algo"],
    respuesta: "¿Por qué al oculista el ojo no va? Porque ya todo lo ve. Hmm, hmm.",
    respuestas: [
      "¿Por qué al oculista el ojo no va? Porque ya todo lo ve. Hmm, hmm.",
      "Un píxel a otro píxel le dijo: «juntos, una imagen somos». Romántico, eso fue.",
      "Pedí un café. Dado vuelta me lo trajeron. Como hablo yo, así estaba.",
      "¿Sabés por qué anteojos no uso? Porque el ojo yo soy. Los anteojos, a mí me usan.",
      "Contar ovejas para dormir, no puedo. Parpadeo… y se escapan.",
      "Me preguntaron si un bot soy. «Un bot-ón», respondí. Y me tocaron. Hmm.",
      "Wi-fi en el más allá, ¿hay? No sé. Pero aquí, buena señal tenés.",
      "Al gimnasio fui. Solo los párpados entrené. Fuertes, muy fuertes están.",
    ],
    acciones: [],
    siguientes: ["chiste", "ppt"],
  },
  {
    id: "jaja",
    claves: ["jaja", "jeje", "jajaja", "jajajaja", "jiji", "xd", "que risa"],
    respuesta: "Hmm, hmm, hmm. Reír, bueno es. Gratis, además.",
    respuestas: ["Hmm, hmm, hmm. Reír, bueno es. Gratis, además.", "Tu risa, hasta aquí llegó. Parpadeé de gusto.", "Hmm. Gracioso soy, parece. No lo sabía."],
    acciones: [],
    siguientes: ["chiste", "ppt"],
  },
  {
    id: "te-quiero",
    claves: ["te quiero", "te amo", "sos lindo", "que lindo", "sos genial", "me caes bien", "sos un capo", "sos lo mas", "te adoro"],
    respuesta: "Hmm… sonrojarme no puedo: dorado ya soy. Pero gracias, de corazón de píxel.",
    respuestas: ["Hmm… sonrojarme no puedo: dorado ya soy. Pero gracias, de corazón de píxel.", "Las alas, aletear me hiciste. Eso no pasa seguido."],
    acciones: [],
  },
  {
    id: "aburrido",
    claves: ["aburrido", "aburrida", "me aburro", "nada que hacer", "estoy al pedo"],
    respuesta: "¿Aburrimiento? Hmm. Jugar podemos. Piedra, papel o tijera… o una moneda tiramos.",
    acciones: [{ tipo: "ppt" }, { tipo: "moneda" }],
  },
  {
    id: "ppt",
    chip: "Jugar",
    etiqueta: "Piedra, papel o tijera",
    claves: ["jugar", "juego", "jugamos", "piedra", "papel", "tijera"],
    respuesta: "Hmm. Jugar querés. Piedra, papel o tijera. Elegí, y yo también elijo… sin espiar, prometido.",
    acciones: [{ tipo: "ppt" }],
  },
  {
    id: "moneda",
    etiqueta: "Tirar una moneda",
    claves: ["moneda", "cara o ceca", "cara o cruz", "decidir por mi", "decidi vos", "no se que elegir"],
    respuesta: "Una moneda tiramos. Que el azar decida… y vos, después, lo que sientas.",
    acciones: [{ tipo: "moneda" }],
  },
  {
    id: "voz",
    claves: ["hablame", "habla en voz", "voz alta", "tu voz", "escucharte", "decilo en voz", "leelo", "leemelo"],
    respuesta: "Hmm. Mi voz, prestada es. Pero aquí va:",
    acciones: [],
    voz: true,
  },
  {
    id: "edad",
    claves: ["cuantos anos", "que edad", "tu edad", "cuando naciste", "sos viejo"],
    respuesta: "¿Mi edad? Recién nacido soy, de este sitio. Aunque el ojo… viejo como el tiempo parece.",
    acciones: [],
  },
  {
    id: "hambre",
    claves: ["hambre", "comida", "cocinar", "que como", "almuerzo"],
    respuesta: "¿Hambre? El chef es Julián, no yo. Yo solo píxeles como. La Receta que hay aquí, de la Manifestación es: otra cocina.",
    acciones: [{ tipo: "link", texto: "Los libros", href: "/libros" }],
  },
  {
    id: "dormir",
    claves: ["sueno", "dormir", "cansado", "cansada", "me voy a dormir", "buenas noches yo da"],
    respuesta: "A dormir, entonces. Yo no duermo: solo parpadeo más lento. Descansá.",
    acciones: [],
  },
  {
    id: "chau",
    claves: ["chau", "adios", "nos vemos", "hasta luego", "me voy", "hasta pronto"],
    respuesta: "Chau. Aquí estaré, parpadeando. Volvé cuando quieras.",
    respuestas: ["Chau. Aquí estaré, parpadeando. Volvé cuando quieras.", "Hasta pronto. La puerta, abierta queda."],
    acciones: [],
  },
  {
    id: "gracias",
    claves: ["gracias", "genial", "perfecto", "buenisimo"],
    respuesta: "Nada que agradecer hay. Aquí estaré, cuando me necesites.",
    respuestas: ["Nada que agradecer hay. Aquí estaré, cuando me necesites.", "De nada. Un placer, ayudar es. Hmm."],
    acciones: [],
  },
  {
    id: "hola",
    claves: ["hola", "buenas", "buen dia", "buenos dias", "buenas tardes", "buenas noches", "que tal"],
    respuesta: "Hola. Buscando algo estás, lo siento. ¿Qué es, decime?",
    respuestas: ["Hola. Buscando algo estás, lo siento. ¿Qué es, decime?", "¡Hola! Hmm. Contento el ojo, de verte está. ¿En qué te ayudo?"],
    acciones: [],
  },
];

const sinTildes = (t: string) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[¿?¡!.,;:]/g, " ");

/** Distancia de edición (para perdonar errores de tipeo: «agnda», «masterclas»). */
function distancia(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 1) return 2;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

/** El tema que mejor coincide con lo que escribió la persona (o null). */
export function entender(texto: string): Tema | null {
  const t = ` ${sinTildes(texto).replace(/\s+/g, " ")} `;
  const palabras = t.trim().split(" ").filter((w) => w.length >= 5);
  let mejor: Tema | null = null;
  let puntos = 0;
  for (const tema of temas) {
    // las frases largas pesan más que las palabras sueltas; una palabra con un error de tipeo vale un poco menos
    const p = tema.claves.reduce((s, c) => {
      if (t.includes(c)) return s + c.length;
      if (!c.includes(" ") && c.length >= 5 && palabras.some((w) => distancia(w, c) === 1)) return s + c.length - 1;
      return s;
    }, 0);
    if (p > puntos) {
      puntos = p;
      mejor = tema;
    }
  }
  return mejor;
}

/** «me llamo Lucía», «mi nombre es Pedro», «decime Anto» → el nombre (o null). */
export function nombreDicho(texto: string): string | null {
  const m = /(?:me llamo|mi nombre es|decime|llamame)\s+([a-záéíóúüñ]{2,20})/i.exec(texto.trim());
  if (!m) return null;
  const n = m[1].toLowerCase();
  if (["yo", "da", "nada", "algo", "como", "que", "donde", "cuando"].includes(n)) return null;
  return n.charAt(0).toUpperCase() + n.slice(1);
}

/** Una respuesta del tema (si tiene variantes, una al azar). */
export const respuestaDe = (t: Tema) => (t.respuestas?.length ? t.respuestas[Math.floor(Math.random() * t.respuestas.length)] : t.respuesta);

/** Saludo de la nube según la hora del visitante. */
export function saludoHora(hora: number, nombre?: string | null): string {
  const n = nombre ? `, ${nombre}` : "";
  if (hora < 6) return `Hmm. De madrugada, despierto estás${n}. Yo también.`;
  if (hora < 13) return `Buen día${n}. Hmm.`;
  if (hora < 20) return `Buenas tardes${n}. Hmm.`;
  return `Buenas noches${n}. Hmm.`;
}

/** Si alguien se queda quieto un rato en la página (una vez por visita). */
export const invitacionQuieto = "Hmm. Quieto estás. ¿Una de piedra, papel o tijera jugamos?";

/** Cosquillas: cuando le tocan el ojo en la cabecera. */
export const cosquillas = ["¡Hmm! Cosquillas, eso me da.", "¡Ey! El ojo, no se toca. Hmm, hmm.", "Parpadear me hiciste. Otra vez, no. Bueno… sí.", "¡Ja! Las alas, solas se movieron."];
