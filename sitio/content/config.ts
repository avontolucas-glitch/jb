/**
 * ─────────────────────────────────────────────────────────────
 *  ÚNICO ARCHIVO PARA EDITAR PRECIOS, FECHAS Y TEXTOS DEL SITIO
 * ─────────────────────────────────────────────────────────────
 *  - Cambiá el texto entre comillas y guardá: el sitio se actualiza solo.
 *  - Donde dice MARCADOR va un texto que todavía falta: no se inventa, se
 *    reemplaza por el texto real (lo de Julián, siempre en sus palabras).
 *  - Los precios en USD están marcados como "a definir" (aDefinir: true).
 */

/** Marcadores visibles de lo que falta escribir (se reemplazan por el texto real). */
export const MARCADOR = "(Texto a definir)";
export const MARCADOR_JULIAN = "(Texto acerca de Julián, a definir)";
export const MARCADOR_LIBRO = "(Texto acerca del libro, a definir)";
/** Un texto es marcador si va entre paréntesis y termina en «a definir». */
export const esMarcador = (t: string) => /^\(.*a definir\)$/.test(t);

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
  /** Sesión privada 1 a 1 con Julián. monto 0 = precio a definir. */
  sesionPrivada: { monto: 0, moneda: "USD", aDefinir: true },
  masterclass: { monto: 20, moneda: "USD", aDefinir: true },
  conferenciaPrivada: { monto: 3, moneda: "USD", aDefinir: true },
};

export const inicio = {
  bajada: "Conferencias, masterclass en vivo y una trilogía en camino.",
  /**
   * Presentación de Julián en tercera persona, con datos de fuentes públicas
   * (prensa y su canal). A confirmar con él antes de publicar.
   */
  quienEs: [
    "Julián Bermúdez es chef y conferencista. En febrero de 2021 ganó la décima temporada de El Gran Premio de la Cocina, en eltrece, con un menú de autor en la final.",
    "Ese mismo año fue el chef de «Ernestina y el otro país», el programa de Ernestina Pais en NET TV.",
    "Hoy da conferencias y masterclass en vivo sobre la manifestación y la ley de asunción, en la línea de Neville Goddard, y compila su obra oral en una trilogía: La Receta de la Manifestación, El Pensamiento es Tu Fe y su Biografía.",
  ],
  quienEsNota: "Datos de fuentes públicas, a confirmar con Julián.",
  trayectoria: [
    { anio: 2021, hecho: "Campeón de El Gran Premio de la Cocina, décima temporada (eltrece)" },
    { anio: 2021, hecho: "Chef de «Ernestina y el otro país» (NET TV)" },
    { anio: 2024, hecho: "The Conference: cuatro conferencias en vivo" },
    { anio: 2026, hecho: "Masterclass Reseteo" },
    { anio: 2026, hecho: "La trilogía, en camino" },
  ],
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
    descripcion: MARCADOR_LIBRO,
    epigrafe: citas.pesca,
  },
  {
    id: "pensamiento",
    numero: "II",
    titulo: "El Pensamiento es Tu Fe",
    pregunta: "¿Por qué funciona?",
    estado: "Próximamente",
    descripcion: MARCADOR_LIBRO,
    epigrafe: citas.tiempo,
  },
  {
    id: "biografia",
    numero: "III",
    titulo: "Biografía",
    pregunta: "¿Quién lo descubrió?",
    estado: "Próximamente",
    descripcion: MARCADOR_LIBRO,
    epigrafe: citas.observador,
  },
];

export type Conferencia = {
  id: string;
  tipo: "privada"; // todas en vivo, con entrada simbólica obligatoria
  titulo: string;
  fecha: string; // texto libre: "a definir" o "Sábado 14 de marzo, 19 h"
  lugar: string;
  descripcion: string;
  /** Solo privadas: link de acceso que ve únicamente quien tiene entrada. */
  linkAcceso?: string;
};

export const conferencias: Conferencia[] = [
  {
    id: "privada-1",
    tipo: "privada",
    titulo: "Conferencia I",
    fecha: "Fecha a definir",
    lugar: "En línea",
    descripcion: MARCADOR,
    linkAcceso: "https://ejemplo.invalid/sala/privada-1",
  },
  {
    id: "privada-2",
    tipo: "privada",
    titulo: "Conferencia II",
    fecha: "Fecha a definir",
    lugar: "En línea",
    descripcion: MARCADOR,
    linkAcceso: "https://ejemplo.invalid/sala/privada-2",
  },
];

/**
 * Masterclass GRABADA: módulos en video. Los temas los define Julián
 * (los capítulos de los libros van en Libros, para leer online).
 */
const ROMANOS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
export const modulos = ROMANOS.map((r, i) => ({
  id: `modulo-${i + 1}`,
  titulo: `Módulo ${r}`,
  tema: "Tema a definir",
  duracion: "a definir",
}));

export const audios = modulos.map((m, i) => ({
  id: `audio-${i + 1}`,
  titulo: `Audio ${ROMANOS[i]}`,
  tema: "Tema a definir",
  archivo: "/audio/muestra.wav", // audio de muestra (silencio)
}));

export const masterclass = {
  titulo: "Masterclass grabada",
  bajada: "Para verla a tu ritmo y volver cuando la necesites.",
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

/** Redes. Las que tienen "#" no se muestran hasta tener su link real. */
export const redes = [
  { nombre: "Instagram", usuario: "@coacher.julian", url: "https://www.instagram.com/coacher.julian/" },
  { nombre: "YouTube", usuario: "@coacherjulian", url: "https://www.youtube.com/@coacherjulian" },
  { nombre: "TikTok", usuario: "", url: "#" },
].filter((r) => r.url !== "#");

export const lista = {
  titulo: "Sumate a la lista",
  bajada: "Un aviso cuando salga cada libro, cuando se abra una conferencia o una nueva tanda de la masterclass. Nada más.",
};

/**
 * MASTERCLASS EN VIVO: un directo por semana, que se ve solo en el sitio.
 * Precio a voluntad: cada persona elige cuánto pagar, desde `minimo`.
 */
export const enVivo = {
  titulo: "Masterclass",
  bajada: "Julián en vivo, una vez por semana. Se ve solo acá, en el sitio. Pagás lo que quieras, desde USD 1.",
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
  indicacion: "Tocá el ojo para entrar",
};

/**
 * Portadillas de cada página: el folio (como en un índice) y el grabado de
 * los libros que le corresponde por sentido.
 */
const g = (src: string, alt: string, pie: string) => ({ src: `/grabados/${src}.webp`, alt: `Grabado: ${alt}`, pie });
export const portadillas = {
  libros: { folio: "II" },
  conferencias: { folio: "III", grabado: g("la-palabra", "la pluma de La Palabra", "La Palabra · El Pensamiento es Tu Fe, cap. 0") },
  masterclass: { folio: "IV", grabado: g("cargar-el-estado", "la lámpara de aceite encendida", "Cargar el estado · La Receta de la Manifestación, cap. 5") },
  grabada: { folio: "V", grabado: g("el-sentimiento", "el corazón con ojo y raíz", "El sentimiento crea la realidad · La Receta de la Manifestación, cap. 1") },
  fragmentos: { folio: "VI", grabado: g("atravesar-el-tiempo", "la espiral", "Atravesar el tiempo · El Pensamiento es Tu Fe, cap. 6") },
  lista: { folio: "VII", grabado: g("primera-imagen", "la semilla que germina", "Primera imagen · Biografía, cap. 0") },
  ingresar: { folio: "VIII", grabado: g("libertad-interna", "el corazón con cerradura", "Libertad interna · El Pensamiento es Tu Fe, cap. 1") },
  crearCuenta: { folio: "VIII", grabado: g("el-reconocimiento", "el corazón coronado", "El reconocimiento · Biografía, cap. 1") },
  canjear: { folio: "IX", grabado: g("ahora-mismo", "el reloj de arena", "Ahora mismo · La Receta de la Manifestación, cap. 3") },
  sesiones: { folio: "XI", grabado: g("conversaciones-sinceras", "el fruto de Conversaciones Sinceras", "Conversaciones sinceras · El Pensamiento es Tu Fe, cap. 3") },
  app: { folio: "X", grabado: g("receta-ojo", "el ojo de luz y sombra", "Conocedores del bien y el mal · La Receta de la Manifestación, cap. 2") },
};

/**
 * LIBROS DIGITALES: se leen dentro del sitio, en Mi espacio → Biblioteca.
 * Se desbloquean comprando el digital o con el código único que trae cada
 * libro impreso. Los capítulos son los de la trilogía; el texto se carga del
 * manuscrito final (en el prototipo, un marcador).
 */
export const TEXTO_LIBRO = "(Texto del capítulo, a definir)";
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

/**
 * SESIONES PRIVADAS: un encuentro 1 a 1 con Julián, por videollamada.
 * Los horarios son de EJEMPLO (se generan para las próximas semanas):
 * cambiá `dias` y `semanas`, o reemplazalos por la agenda real.
 */
export const sesiones = {
  titulo: "Sesiones privadas",
  bajada: "Un encuentro uno a uno con Julián, por videollamada.",
  descripcion: MARCADOR,
  duracion: "Duración a definir",
  modalidad: "Por videollamada",
  zonaHoraria: "hora de Argentina",
  // día de la semana (0 = domingo) y hora, en hora de Argentina
  dias: [
    { dia: 2, hora: 18 },
    { dia: 4, hora: 18 },
    { dia: 6, hora: 11 },
  ],
  semanas: 3,
  /** Link de la videollamada: solo lo ve quien reservó ese horario. */
  linkSala: "https://ejemplo.invalid/sesion/",
};
