/**
 * ─────────────────────────────────────────────────────────────
 *  ÚNICO ARCHIVO PARA EDITAR PRECIOS, FECHAS Y TEXTOS DEL SITIO
 * ─────────────────────────────────────────────────────────────
 *  - Cambiá el texto entre comillas y guardá: el sitio se actualiza solo.
 *  - Donde dice MARCADOR va la voz de Julian: no se inventa, se reemplaza
 *    por lo que él escriba o dicte.
 *  - Los precios en USD están marcados como "a definir" (aDefinir: true).
 */

/** Marcador visible para los textos que tiene que escribir Julian. */
export const MARCADOR = "[TEXTO DE JULIAN]";

export const sitio = {
  nombre: "Julian Bermúdez",
  nombreCorto: "Julian",
  dominio: "julianbermudez.com",
  descripcion: "Conferencias, masterclass y la trilogía de Julian Bermúdez.",
  editorial: "ELVERBO",
  anio: 2026,
};

/** Las únicas citas textuales de Julian que usa el sitio (epígrafes). */
export const citas = {
  pesca: "No podés pescar una ballena con las herramientas para pescar un dorado.",
  tiempo: "Logré atravesar el tiempo con éxito.",
  observador:
    "Detrás del que está llorando hay alguien que está muy tranquilo observando cómo vos estás llorando.",
};

export const precios = {
  masterclass: { monto: 20, moneda: "USD", aDefinir: true },
  conferenciaPrivada: { monto: 3, moneda: "USD", aDefinir: true },
};

export const inicio = {
  bajada: "Conferencias, una masterclass y una trilogía en camino.",
  quienEs: MARCADOR, // Presentación de Julian, en sus palabras.
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
  titulo: "Masterclass",
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
