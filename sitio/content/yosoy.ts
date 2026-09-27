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
import { frase, leer, limpiar, saludoCorto, type Intencion } from "./yoda-habla";

export type Accion =
  | { tipo: "link"; texto: string; href: string; externo?: boolean }
  | { tipo: "instalar" }
  | { tipo: "musica" }
  | { tipo: "sonido" }
  | { tipo: "ppt" }
  | { tipo: "moneda" }
  | { tipo: "horarios" }
  | { tipo: "ticket" }
  | { tipo: "recorrido" }
  | { tipo: "musica-otro" }
  | { tipo: "musica-poner" };

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
  /** La persona está trabada con algo (suma para ofrecerle, recién después de varios intentos, escribirle a una persona). */
  atasca?: boolean;
  /** Sin sesión, en vez del pedido general de cuenta, este texto (la función se desbloquea con la cuenta). */
  sinCuenta?: string;
  /** Problema serio (plata, acceso): cuenta doble para ofrecer, antes, escribirle a una persona. */
  urgente?: boolean;
  /** Algo que Yo Da hace además de contestar (con la música de fondo). */
  efecto?: "que-suena" | "otro-tema" | "pausar" | "poner" | "hora";
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

export const noEntendi = "Claro no lo veo, eso. Con otras palabras probá, o elegí alguna de estas puertas.";

/** Cuando ya dio varias vueltas y sigue trabada: recién ahí, una persona. */
export const ofrecerTicket = "Hmm. Varias vueltas le dimos, y resuelto no está. Dejarle tu consulta a una persona, podés: por mail te responde.";
export const ticketSinCuenta = "Para dejarle tu consulta a una persona, ingresar con tu cuenta debés. Así sabe a quién responderle.";
/** Desde cuántos intentos sin resolver se ofrece la consulta a una persona. */
export const ESFUERZO_TICKET = 3;

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
    cuenta: true,
    sinCuenta: "Hmm. Para agendar un 1 a 1, crear una cuenta debés. Un minuto es; después, los horarios libres aquí mismo te muestro, en tu hora.",
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
    respuesta: "Con tu cuenta, lo tuyo ves: tus compras, tus encuentros, tus libros. ¿Tu clave olvidaste? Contámelo: si aquí no se resuelve, a una persona te acerco.",
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
    siguientes: ["precios"],
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
    claves: ["no funciona", "no anda", "error", "problema", "no me deja", "no veo mi compra", "no aparece", "no me llego", "falla", "ayuda", "ayudame", "socorro", "auxilio"],
    respuesta: "Hmm. Un nudo hay. Tranquilo: todo nudo, desatarse puede. Contame más: qué pasó, en qué página, qué esperabas. En tu espacio, tus compras y accesos ver podés.",
    acciones: [
      { tipo: "link", texto: "Mi espacio", href: "/mi-espacio" },
      { tipo: "link", texto: "Mi cuenta", href: "/mi-espacio/cuenta" },
    ],
    cuenta: true,
    atasca: true,
  },
  // ───────── problemas concretos: la solución primero, sin vueltas
  {
    id: "pago-problema",
    claves: ["me cobraron", "me cobro", "cobro doble", "me cobraron dos veces", "pague y", "pague pero", "ya pague", "no se acredito", "no me acredito", "rechazada", "rechazaron", "rechazo el pago", "no pasa el pago", "no puedo pagar", "error al pagar", "no me deja pagar", "fallo el pago", "debitaron", "descontaron"],
    respuesta: "Hmm. Con la plata, cuidado máximo. Si te cobraron y en «Mi espacio» la compra no aparece, una persona lo revisa: contame qué compraste y cuándo. Si el pago no pasa, otra tarjeta u otro medio probá.",
    acciones: [{ tipo: "link", texto: "Mi espacio", href: "/mi-espacio" }],
    cuenta: true,
    atasca: true,
    urgente: true,
  },
  {
    id: "no-puedo-entrar",
    claves: ["no puedo entrar", "no puedo ingresar", "no me deja entrar", "no me deja ingresar", "no puedo iniciar sesion", "no me deja iniciar sesion", "clave incorrecta", "dice que la clave", "mail incorrecto", "no reconoce mi mail", "bloquearon mi cuenta", "cuenta bloqueada"],
    respuesta: "Hmm. La puerta, trabada. Revisá el mail (el mismo con que la cuenta creaste) y la clave, sin espacios. Tras muchos intentos seguidos, la puerta un rato se cierra: unos minutos esperá. ¿La clave olvidaste? Decímelo.",
    acciones: [{ tipo: "link", texto: "Ingresar", href: "/ingresar" }],
    atasca: true,
    siguientes: ["clave-olvidada"],
    etiqueta: "No puedo entrar",
  },
  {
    id: "clave-olvidada",
    etiqueta: "Olvidé mi clave",
    claves: ["olvide mi clave", "olvide la clave", "me olvide la clave", "me olvide mi clave", "no me acuerdo la clave", "no me acuerdo mi clave", "no recuerdo la clave", "no recuerdo mi clave", "perdi la clave", "perdi mi clave", "recuperar la clave", "recuperar mi clave", "recuperar la cuenta", "restablecer", "resetear la clave", "cambiar la clave"],
    respuesta: `Hmm. La clave, a todos se nos pierde alguna vez. Recuperarla sola, la página todavía no puede: desde el mail de tu cuenta, a ${CONTACTO} escribí, y una persona te la restablece.`,
    acciones: [],
    atasca: true,
    urgente: true,
  },
  {
    id: "video-problema",
    claves: ["no se ve el video", "no carga el video", "no anda el video", "no funciona el video", "no se ve la clase", "no se ve el directo", "no se ve la masterclass", "no puedo ver la masterclass", "no puedo ver el video", "no se escucha", "no hay sonido", "sin sonido el video", "se corta el video", "se traba el video", "se congela", "pantalla negra", "no carga la sala", "no entra a la sala"],
    respuesta: "Hmm. Imagen o sonido, fallando. Primero, la página recargá. Si sigue: otro navegador probá, el ahorro de datos apagá, y el volumen del dispositivo mirá. ¿Nada? En qué dispositivo estás, contame.",
    acciones: [{ tipo: "link", texto: "Mi espacio", href: "/mi-espacio" }],
    cuenta: true,
    atasca: true,
  },
  {
    id: "codigo-problema",
    claves: ["codigo no funciona", "no funciona el codigo", "el codigo no anda", "no anda el codigo", "codigo invalido", "codigo incorrecto", "codigo ya usado", "codigo usado", "ya fue usado", "no acepta el codigo", "no me toma el codigo", "no me acepta el codigo", "no encuentro el codigo", "donde esta el codigo"],
    respuesta: "Hmm. El código del libro, una sola vez sirve. Mayúsculas, guiones o espacios, no importan: copialo tal cual. Si «ya usado» dice y vos no lo usaste, una persona lo revisa: contame.",
    acciones: [{ tipo: "link", texto: "Canjear el código", href: "/canjear" }],
    cuenta: true,
    atasca: true,
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
    id: "que-suena",
    etiqueta: "¿Qué suena?",
    claves: ["que suena", "que esta sonando", "que tema es", "que cancion es", "que musica es", "como se llama el tema", "como se llama la cancion", "como se llama esta cancion", "quien canta", "de quien es el tema", "de quien es la cancion", "que estoy escuchando", "que tema es este", "temazo", "que temon", "whats playing", "what song"],
    respuesta: "",
    acciones: [],
    efecto: "que-suena",
  },
  {
    id: "otro-tema",
    claves: ["otro tema", "otra cancion", "pasa el tema", "pasa la cancion", "cambia el tema", "cambia la cancion", "siguiente tema", "siguiente cancion", "saltea", "salta el tema", "next", "skip", "no me gusta este tema", "no me gusta esta cancion"],
    respuesta: "Hmm. Otro tema, al azar. A ver qué sale.",
    acciones: [],
    efecto: "otro-tema",
  },
  {
    id: "pausar-musica",
    claves: ["para la musica", "pausa la musica", "pausa", "pausar", "frena la musica", "deten la musica", "apaga la musica", "stop", "silencio por favor", "basta de musica"],
    respuesta: "En pausa. El silencio, también música es.",
    acciones: [],
    efecto: "pausar",
  },
  {
    id: "poner-musica",
    claves: ["pone musica", "pon musica", "poneme musica", "ponme musica", "pone un tema", "pon un tema", "quiero musica", "quiero escuchar musica", "play", "dale play", "musica por favor", "algo de musica", "tira un tema", "mete musica"],
    respuesta: "Hmm. Música, entonces. Abajo a la izquierda, el reproductor se abre. Si no suena, «Escuchar» tocá.",
    acciones: [],
    efecto: "poner",
  },
  {
    id: "hora",
    claves: ["que hora es", "que hora tenes", "que hora son", "hora es", "que dia es hoy", "que dia es", "que fecha es", "what time"],
    respuesta: "",
    acciones: [],
    efecto: "hora",
  },
  {
    id: "recorrido",
    chip: "Recorrido",
    etiqueta: "Un recorrido por el lugar",
    claves: ["recorrido", "recorrer", "tour", "mostrame el lugar", "mostrame el sitio", "mostrame la pagina", "que hay en la pagina", "que hay en el sitio", "que hay aca", "como funciona la pagina", "como funciona el sitio", "como se usa", "soy nuevo", "soy nueva", "primera vez", "guiame"],
    respuesta: "Hmm. Volando el lugar te muestro, sí. Un minuto es. Seguime.",
    acciones: [{ tipo: "recorrido" }],
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
    claves: ["persona", "humano", "moderador", "reclamo", "queja", "hablar con alguien", "persona real", "contacto", "soporte", "atencion al cliente", "whatsapp", "mail"],
    respuesta: "Con una persona hablar querés. Antes, contame qué pasa: quizás aquí mismo resolverlo podemos. ¿Es sobre una compra, un encuentro, tu cuenta o los libros?",
    acciones: [],
    atasca: true,
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

/** Distancia de edición (para perdonar errores de tipeo: «agnda», «masterclas»). */
function distancia(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 1) return 2;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

/** El tema que mejor coincide con un texto ya limpio (content/yoda-habla.ts → limpiar), o null. */
function temaDe(limpio: string): Tema | null {
  // las claves se buscan al principio de una palabra: «reserv» encuentra «reservar», pero «app» no encuentra «happy»
  const t = ` ${limpio} `;
  const palabras = limpio.split(" ").filter((w) => w.length >= 5);
  let mejor: Tema | null = null;
  let puntos = 0;
  for (const tema of temas) {
    // las frases largas pesan más que las palabras sueltas; una palabra con un error de tipeo vale un poco menos
    const p = tema.claves.reduce((s, c) => {
      if (t.includes(` ${c}`)) return s + c.length;
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

/** El tema que mejor coincide con lo que escribió la persona (o null). */
export const entender = (texto: string): Tema | null => temaDe(leer(texto).limpio);

const COMUNES = new Set(["como", "para", "quiero", "tengo", "esta", "este", "esto", "algo", "hola", "donde", "cuando", "porque", "sobre", "hacer", "puedo", "tiene", "tienen", "necesito", "saber", "favor", "gracias", "buenas", "bien", "todo", "nada", "mucho", "ahora", "entonces"]);

/** Cuando no entendió: los temas que más se parecen (para ofrecerlos como opciones). */
export function cercanos(limpio: string): string[] {
  const ws = limpio.split(" ").filter((w) => w.length >= 4 && !COMUNES.has(w));
  const puntos = new Map<string, number>();
  for (const tema of temas) {
    if (!tema.etiqueta && !tema.chip) continue;
    let p = 0;
    for (const c of tema.claves)
      for (const cw of c.split(" "))
        if (cw.length >= 4 && !COMUNES.has(cw)) for (const w of ws) if (w.slice(0, 4) === cw.slice(0, 4) || distancia(w, cw) === 1) p++;
    if (p) puntos.set(tema.id, p);
  }
  return [...puntos.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id]) => id);
}

/** Los temas de charla y la intención que les corresponde (se contestan en el registro de cada uno). */
type DeCharla = Exclude<Intencion, "si" | "no" | "enojo">;
const CHARLA: Partial<Record<string, DeCharla>> = { hola: "saludo", "como-estas": "comoEstas", gracias: "gracias", chau: "chau", jaja: "risa" };

export const siSuelto = "Hmm. Sí… ¿a qué? Qué buscás, contame.";
export const calmaConTema = "Hmm. Enojo siento, y razón tendrás. A lo concreto vamos:";
export const calmaSola = "Hmm. Enojo siento. Razón quizás tenés: contame qué pasó, y lo arreglamos.";

export type Interpretacion = {
  tema: Tema | null;
  /** Lo que contesta Yo Da en lugar de la respuesta del tema (la charla, en el registro de cada uno). */
  texto?: string;
  /** Va antes de la respuesta del tema («¡Wena!», «Órale.»). */
  prefijo?: string;
  /** Charla: no cuenta como que la persona está trabada. */
  charla?: boolean;
  /** Enojo: se contesta con calma, y cuenta como trabada. */
  enojo?: boolean;
  /** No entendió: los temas parecidos para ofrecer. */
  cercanos?: string[];
  /** De dónde es (por cómo escribe, o lo que se sabía antes). */
  region: string | null;
  /** La región se notó por cómo escribió en este mensaje. */
  detectada: boolean;
};

/**
 * Qué dijo la persona y cómo contestarle: el tema, y si es charla (un saludo,
 * un gracias, un «¿cómo estás?», una risa), la respuesta en su registro. Un
 * «sí» o un «no» sueltos se entienden según lo último que Yo Da ofreció.
 */
export function interpretar(texto: string, ctx: { region: string | null; sugerencias?: string[] }): Interpretacion {
  const l = leer(texto);
  const region = l.region ?? ctx.region;
  const base = { region, detectada: !!l.region };
  const i = l.intenciones;
  const tema = temaDe(l.limpio);
  const deCharla = tema ? CHARLA[tema.id] : undefined;
  const concreto = tema && !deCharla && tema.id !== "te-quiero" ? tema : null;

  if (i.has("enojo")) {
    if (concreto) return { ...base, tema: concreto, prefijo: calmaConTema, enojo: true };
    return { ...base, tema: null, texto: frase(region, "enojo") ?? calmaSola, enojo: true };
  }
  if (l.corto && !concreto) {
    if (i.has("no")) return { ...base, tema: null, texto: frase(region, "no") ?? "Bueno. Aquí estoy, si algo necesitás.", charla: true };
    if (i.has("si")) {
      const sig = ctx.sugerencias?.length ? temas.find((t) => t.id === ctx.sugerencias![0]) : undefined;
      if (sig) return { ...base, tema: sig, prefijo: frase(region, "dale") ?? undefined };
      if (!tema) return { ...base, tema: null, texto: siSuelto, charla: true };
    }
  }
  if (!concreto) {
    const orden: DeCharla[] = ["comoEstas", "gracias", "chau", "genial", "risa", "saludo"];
    const it = orden.find((x) => i.has(x)) ?? deCharla;
    const f = it ? frase(region, it) : null;
    if (f) return { ...base, tema, texto: f, charla: true };
    if (tema) return { ...base, tema, charla: true };
    return { ...base, tema: null, texto: frase(region, "noEntendi") ?? undefined, cercanos: cercanos(l.limpio) };
  }
  return { ...base, tema: concreto, prefijo: i.has("saludo") ? saludoCorto(region) ?? undefined : undefined };
}

export { limpiar };

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
export function saludoHora(hora: number, nombre?: string | null, region?: string | null): string {
  const n = nombre ? `, ${nombre}` : "";
  if (hora < 6) return `Hmm. De madrugada, despierto estás${n}. Yo también.`;
  if (hora < 13) return `${!region || ["ar", "uy", "py"].includes(region) ? "Buen día" : "Buenos días"}${n}. Hmm.`;
  if (hora < 20) return `Buenas tardes${n}. Hmm.`;
  return `Buenas noches${n}. Hmm.`;
}

/** Si alguien se queda quieto un rato en la página (una vez por visita). */
export const invitacionQuieto = "Hmm. Quieto estás. ¿Una de piedra, papel o tijera jugamos?";

/** Cosquillas: cuando le tocan el ojo en la cabecera. */
export const cosquillas = ["¡Hmm! Cosquillas, eso me da.", "¡Ey! El ojo, no se toca. Hmm, hmm.", "Parpadear me hiciste. Otra vez, no. Bueno… sí.", "¡Ja! Las alas, solas se movieron."];

/* ───────── Ritmo: que nadie sature a Yo Da ───────── */

/**
 * Cuánto se le puede escribir (en el navegador, no hace falta el servidor):
 * en promedio un mensaje cada `cadaMs`, con una ráfaga corta de `rafaga`
 * (quien escribe rápido dos cosas seguidas no choca), y no más de `porMinuto`.
 * Si se pasa, Yo Da pide calma y el campo queda en pausa `pausaSeg` segundos
 * (o hasta que se libere el minuto, con un tope de `pausaMaxSeg`).
 * El tope por minuto cuenta solo lo que se escribe en el campo: los chips y las
 * sugerencias pasan solo por la ráfaga (quien recorre el menú no está haciendo spam).
 */
export const ritmo = { cadaMs: 1200, rafaga: 4, porMinuto: 12, pausaSeg: 6, pausaMaxSeg: 30 } as const;

/** Lo que dice Yo Da cuando le escriben demasiado seguido. */
export const despacio = "Hmm. Despacio. Respirar, primero debés.";
/** La cuenta atrás, a la vista, debajo de los mensajes. */
export const pausaCuenta = (seg: number) => `Hmm. En ${seg} ${seg === 1 ? "segundo" : "segundos"}, seguir podemos.`;
/** Para los lectores de pantalla: al empezar la pausa y al terminar (no cada segundo). */
export const pausaAviso = (seg: number) => `El campo queda en pausa ${seg} segundos.`;
export const pausaFin = "Listo, ya podés escribirle de nuevo.";
/** Cuando el sitio pide un respiro (429) o no se pudo traer la agenda. */
export const horariosEnPausa = "Hmm. Los horarios traer ahora no puedo. En un momento, probá de nuevo.";

/**
 * El recorrido (components/RecorridoYoDa.tsx): Yo Da vuela de parada en parada.
 * `donde`: los `data-recorrido` que se iluminan juntos; si ninguno se ve en esta
 * pantalla (en el celular, los enlaces están dentro del menú), la parada se saltea.
 * `conSesion` / `sinSesion`: otro texto, o algo que se suma, según haya cuenta.
 */
export type Parada = { id: string; donde?: string[]; texto: string; conSesion?: string; sinSesion?: string };

/** Lo que Yo Da le ofrece a quien entra por primera vez sin cuenta. */
export const ofrecerRecorrido = "Nuevo aquí eres, parece. ¿El lugar te muestro? Volando, un minuto nomás.";

export const recorrido: Parada[] = [
  { id: "hola", texto: "Hmm. El lugar de Julián Bermúdez, este es. Volando te lo muestro: un minuto, nada más. Seguime." },
  { id: "libros", donde: ["libros"], texto: "Los libros de Julián, aquí están. Tres son, y una sola obra: cómo funciona, por qué funciona, quién lo descubrió." },
  { id: "masterclass", donde: ["masterclass"], texto: "La masterclass: en vivo, grabada, o a solas con Julián, uno a uno. Los horarios, en tu propia hora los ves." },
  { id: "mas", donde: ["conferencias", "fragmentos", "lista"], texto: "Conferencias, fragmentos de su obra, y una lista para que de lo que viene te avisen. Todo, aquí arriba." },
  { id: "menu", donde: ["menu"], texto: "En este menú, todo el lugar está: libros, masterclass, conferencias, fragmentos. Y la app, para instalar." },
  { id: "musica", donde: ["musica"], texto: "Si aquí tocás, música suena: la playlist de Julián es. Con tu Spotify abierto en este navegador, los temas enteros escuchás; si no, un pedacito nomás." },
  { id: "app", donde: ["instalar"], texto: "La app, instalar podés: en el teléfono o en la compu, a un toque la tenés." },
  {
    id: "cuenta",
    donde: ["cuenta"],
    texto: "Tu cuenta, aquí. Con ella, más puertas se abren: tus libros, tus encuentros, la agenda.",
    conSesion: "Tu espacio, aquí: tus libros, tus encuentros, la agenda.",
  },
  {
    id: "yoda",
    donde: ["yoda"],
    texto: "Y yo, aquí me quedo. Lo que sea preguntame: la agenda, la masterclass, los libros. Jugar también podemos. Y si el sonido molesta, callarlo desde mí podés.",
    sinSesion: "Para acceder a más funciones, crearte una cuenta debés.",
  },
];
