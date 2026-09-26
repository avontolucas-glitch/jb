/**
 * ─────────────────────────────────────────────────────────────
 *  ÚNICO ARCHIVO PARA EDITAR PRECIOS, FECHAS Y TEXTOS DEL SITIO
 * ─────────────────────────────────────────────────────────────
 *  - Cambiá el texto entre comillas y guardá: el sitio se actualiza solo.
 *  - Donde dice MARCADOR va la voz de Julián: no se inventa, se reemplaza
 *    por lo que él escriba o dicte.
 *  - Los precios en USD están marcados como "a definir" (aDefinir: true).
 */

/** Marcador visible para los textos que tiene que escribir Julián. */
export const MARCADOR = "[TEXTO DE JULIÁN]";

export const sitio = {
  nombre: "Julián Bermúdez",
  nombreCorto: "Julián",
  dominio: "julianbermudez.com",
  descripcion: "Conferencias, masterclass en vivo y la trilogía de Julián Bermúdez.",
  editorial: "ELVERBO",
  anio: 2026,
};

/** Las únicas citas textuales de Julián que usa el sitio (epígrafes). */
export const citas = {
  pesca: "No podés pescar una ballena con las herramientas para pescar un dorado.",
  tiempo: "Logré atravesar el tiempo con éxito.",
  observador:
    "Detrás del que está llorando hay alguien que está muy tranquilo observando cómo vos estás llorando.",
};

export const precios = {
  /** Libro digital: se lee dentro del sitio. monto 0 = precio a definir. */
  libroDigital: { monto: 0, moneda: "USD", aDefinir: true },
  masterclass: { monto: 20, moneda: "USD", aDefinir: true },
  conferenciaPrivada: { monto: 3, moneda: "USD", aDefinir: true },
};

export const inicio = {
  bajada: "Conferencias, masterclass en vivo y una trilogía en camino.",
  quienEs: MARCADOR, // Presentación de Julián, en sus palabras.
  propuesta:
    "Lo esencial queda grabado en la masterclass. El vivo pasa a ser para responder, solo con quienes eligieron entrar.",
  propuestaDetalle: MARCADOR,
};

export type Libro = {
  id: "receta" | "pensamiento" | "biografia";
  numero: string;
  titulo: string;
  pregunta: string;
  estado: string;
  descripcion: string;
  epigrafe?: string;
};

export const libros: Libro[] = [
  {
    id: "receta",
    numero: "I",
    titulo: "La Receta de la Manifestación",
    pregunta: "¿Cómo funciona?",
    estado: "Próximamente",
    descripcion: MARCADOR,
    epigrafe: citas.pesca,
  },
  {
    id: "pensamiento",
    numero: "II",
    titulo: "El Pensamiento es Tu Fe",
    pregunta: "¿Por qué funciona?",
    estado: "Próximamente",
    descripcion: MARCADOR,
    epigrafe: citas.tiempo,
  },
  {
    id: "biografia",
    numero: "III",
    titulo: "Biografía",
    pregunta: "¿Quién lo descubrió?",
    estado: "Próximamente",
    descripcion: MARCADOR,
    epigrafe: citas.observador,
  },
];

export type Conferencia = {
  id: string;
  tipo: "abierta" | "privada";
  titulo: string;
  fecha: string; // texto libre: "a definir" o "Sábado 14 de marzo, 19 h"
  lugar: string;
  descripcion: string;
  /** Solo privadas: link de acceso que ve únicamente quien tiene entrada. */
  linkAcceso?: string;
};

export const conferencias: Conferencia[] = [
  {
    id: "abierta-2026",
    tipo: "abierta",
    titulo: "Conferencia abierta anual",
    fecha: "Fecha a definir",
    lugar: "Lugar a definir",
    descripcion: "Una vez por año, abierta y gratuita. Solo hace falta inscribirse.",
  },
  {
    id: "privada-1",
    tipo: "privada",
    titulo: "Conferencia privada I",
    fecha: "Fecha a definir",
    lugar: "En línea",
    descripcion: MARCADOR,
    linkAcceso: "https://ejemplo.invalid/sala/privada-1",
  },
  {
    id: "privada-2",
    tipo: "privada",
    titulo: "Conferencia privada II",
    fecha: "Fecha a definir",
    lugar: "En línea",
    descripcion: MARCADOR,
    linkAcceso: "https://ejemplo.invalid/sala/privada-2",
  },
];

/** Temas provisorios: son títulos de capítulos de la trilogía. */
export const modulos = [
  { id: "dos-formatos", titulo: "Dos formatos de la mente", libro: "receta", duracion: "a definir" },
  { id: "sentimiento", titulo: "El sentimiento crea la realidad", libro: "receta", duracion: "a definir" },
  { id: "ahora-mismo", titulo: "Ahora mismo", libro: "receta", duracion: "a definir" },
  { id: "la-pesca", titulo: "La pesca", libro: "receta", duracion: "a definir" },
  { id: "la-palabra", titulo: "La palabra", libro: "pensamiento", duracion: "a definir" },
  { id: "libertad-interna", titulo: "Libertad interna", libro: "pensamiento", duracion: "a definir" },
  { id: "conversaciones", titulo: "Conversaciones sinceras", libro: "pensamiento", duracion: "a definir" },
  { id: "atravesar-el-tiempo", titulo: "Atravesar el tiempo", libro: "pensamiento", duracion: "a definir" },
] as const;

export const audios = modulos.map((m) => ({
  id: m.id,
  titulo: m.titulo,
  libro: m.libro,
  archivo: "/audio/muestra.wav", // audio de muestra (silencio)
}));

export const masterclass = {
  titulo: "Masterclass grabada",
  bajada: "Lo esencial, grabado. Para verlo a tu ritmo y volver cuando lo necesites.",
  descripcion: MARCADOR,
  incluye: [
    "La masterclass en video, en módulos.",
    "De regalo: los audios por tema, agrupados por libro.",
    "De regalo: un encuentro de preguntas en vivo por cada tanda de compradores.",
  ],
};

export const encuentro = {
  proximo: "Fecha a definir",
  modalidad: "En vivo, en línea",
  explicacion:
    "Mandá tus preguntas antes del encuentro. Las respuestas se dan en vivo, solo con quienes compraron la masterclass en esta tanda.",
};

export const fragmentos = [
  { id: "f1", titulo: "Fragmento 1", tema: "Dos formatos de la mente" },
  { id: "f2", titulo: "Fragmento 2", tema: "La pesca" },
  { id: "f3", titulo: "Fragmento 3", tema: "Atravesar el tiempo" },
  { id: "f4", titulo: "Fragmento 4", tema: "La palabra" },
];

/** Redes: reemplazá el # por el link real. */
export const redes = [
  { nombre: "Instagram", url: "#" },
  { nombre: "YouTube", url: "#" },
  { nombre: "TikTok", url: "#" },
];

export const lista = {
  titulo: "Sumate a la lista",
  bajada: "Un aviso cuando salga cada libro, cuando se abra una conferencia o una nueva tanda de la masterclass. Nada más.",
};

/**
 * MASTERCLASS EN VIVO: un directo por semana, que se ve solo en el sitio.
 * Precio a voluntad: cada persona elige cuánto pagar, desde `minimo`.
 */
export const enVivo = {
  titulo: "Masterclass en vivo",
  bajada: "Un directo por semana. Se ve solo acá, en el sitio. Pagás lo que quieras, desde USD 1.",
  descripcion: MARCADOR,
  frecuencia: "Una vez por semana",
  moneda: "USD",
  minimo: 1,
  maximo: 500,
  sugeridos: [1, 3, 5, 10],
  directos: [
    { id: "semana-1", titulo: "Directo · semana 1", fecha: "Fecha a definir", tema: "Tema a definir" },
    { id: "semana-2", titulo: "Directo · semana 2", fecha: "Fecha a definir", tema: "Tema a definir" },
    { id: "semana-3", titulo: "Directo · semana 3", fecha: "Fecha a definir", tema: "Tema a definir" },
  ],
};

/** Cuadro de bienvenida que aparece al entrar al sitio (una vez por visita). */
export const umbral = {
  aviso:
    "Este es un espacio exclusivo. Queda prohibida toda reproducción o difusión de su contenido fuera de este espacio.",
  bienvenida: "Te damos la bienvenida",
  boton: "Entrar",
};

/**
 * Portadillas de cada página: el folio (como en un índice) y el grabado de
 * los libros que le corresponde por sentido.
 */
const g = (src: string, alt: string, pie: string) => ({ src: `/grabados/${src}.webp`, alt: `Grabado: ${alt}`, pie });
export const portadillas = {
  libros: { folio: "II" },
  conferencias: { folio: "III", grabado: g("la-palabra", "la pluma de La Palabra", "La Palabra · El Pensamiento es Tu Fe, cap. 0") },
  masterclass: { folio: "IV", grabado: g("el-sentimiento", "el corazón con ojo y raíz", "El sentimiento crea la realidad · La Receta de la Manifestación, cap. 1") },
  enVivo: { folio: "V", grabado: g("receta-ojo", "el ojo de luz y sombra", "Conocedores del bien y el mal · La Receta de la Manifestación, cap. 2") },
  fragmentos: { folio: "VI", grabado: g("atravesar-el-tiempo", "la espiral", "Atravesar el tiempo · El Pensamiento es Tu Fe, cap. 6") },
  lista: { folio: "VII", grabado: g("primera-imagen", "la semilla que germina", "Primera imagen · Biografía, cap. 0") },
  ingresar: { folio: "VIII", grabado: g("libertad-interna", "el corazón con cerradura", "Libertad interna · El Pensamiento es Tu Fe, cap. 1") },
  crearCuenta: { folio: "VIII", grabado: g("el-reconocimiento", "el corazón coronado", "El reconocimiento · Biografía, cap. 1") },
  canjear: { folio: "IX", grabado: g("ahora-mismo", "el reloj de arena", "Ahora mismo · La Receta de la Manifestación, cap. 3") },
  app: { folio: "X", grabado: g("cargar-el-estado", "la lámpara de aceite", "Cargar el estado · La Receta de la Manifestación, cap. 5") },
};

/**
 * LIBROS DIGITALES: se leen dentro del sitio, en Mi espacio → Biblioteca.
 * Se desbloquean comprando el digital o con el código único que trae cada
 * libro impreso. Los capítulos son los de la trilogía; el texto se carga del
 * manuscrito final (en el prototipo, un marcador).
 */
export const TEXTO_LIBRO = "[TEXTO DEL LIBRO: se carga del manuscrito final]";
export const capitulos: Record<"receta" | "pensamiento" | "biografia", { n: number; titulo: string; emblema: string }[]> = {
  receta: [
    { n: 0, titulo: "Dos Formatos de la Mente", emblema: "receta-0-dos-formatos" },
    { n: 1, titulo: "El Sentimiento Crea la Realidad", emblema: "receta-1-el-sentimiento" },
    { n: 2, titulo: "Conocedores del Bien y el Mal", emblema: "receta-2-bien-y-mal" },
    { n: 3, titulo: "Ahora Mismo", emblema: "receta-3-ahora-mismo" },
    { n: 4, titulo: "La Pesca", emblema: "receta-4-la-pesca" },
    { n: 5, titulo: "Cargar el Estado", emblema: "receta-5-cargar-el-estado" },
  ],
  pensamiento: [
    { n: 0, titulo: "La Palabra", emblema: "pensamiento-0-la-palabra" },
    { n: 1, titulo: "Libertad Interna", emblema: "pensamiento-1-libertad-interna" },
    { n: 2, titulo: "El Observador Eterno", emblema: "pensamiento-2-observador-eterno" },
    { n: 3, titulo: "Conversaciones Sinceras", emblema: "pensamiento-3-conversaciones-sinceras" },
    { n: 4, titulo: "La Inteligencia Natural", emblema: "pensamiento-4-inteligencia-natural" },
    { n: 5, titulo: "Arquetipos", emblema: "pensamiento-5-arquetipos" },
    { n: 6, titulo: "Atravesar el Tiempo", emblema: "pensamiento-6-atravesar-el-tiempo" },
  ],
  biografia: [
    { n: 0, titulo: "Primera Imagen", emblema: "biografia-0-primera-imagen" },
    { n: 1, titulo: "El Reconocimiento", emblema: "biografia-1-el-reconocimiento" },
    { n: 2, titulo: "El Desastre", emblema: "biografia-2-el-desastre" },
    { n: 3, titulo: "Poner a Prueba", emblema: "biografia-3-poner-a-prueba" },
  ],
};
