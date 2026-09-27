/**
 * Cómo habla cada uno. Yo Da entiende saludos, modismos, abreviaturas, risas y
 * emojis de todo el mundo hispanohablante (y a quien le escribe en portugués o
 * en inglés), y contesta la charla con un guiño en el mismo registro, sin dejar
 * de ser él. Los datos de cada país están en content/yoda-regiones.ts: para
 * sumar una expresión, agregala ahí (en minúsculas, sin tildes ni signos).
 *
 * De dónde es alguien se sabe por cómo escribe («wena», «quiubo», «klk», «che»…)
 * y, si no se nota, por el idioma y la zona horaria del dispositivo.
 */
import { REGIONES, type Ficha } from "./yoda-regiones";

export type Intencion = "saludo" | "comoEstas" | "gracias" | "chau" | "si" | "no" | "risa" | "genial" | "enojo";

/** Abreviaturas y ortografía de chat → la palabra entera. */
const ABREV: Record<string, string> = {
  q: "que", k: "que", ke: "que", qe: "que", xq: "porque", pq: "porque", porq: "porque", xk: "porque", pk: "porque",
  tb: "tambien", tmb: "tambien", tbn: "tambien", tmbn: "tambien", x: "por", d: "de", bn: "bien", mb: "muy bien",
  msj: "mensaje", msg: "mensaje", info: "informacion", pls: "por favor", plis: "por favor", porfa: "por favor", porfis: "por favor",
  xfa: "por favor", xfavor: "por favor", pf: "por favor", ola: "hola", holis: "hola", holi: "hola", holu: "hola", holaa: "hola",
  grax: "gracias", grasias: "gracias", graciaz: "gracias", grcs: "gracias", grs: "gracias", thx: "thanks", ty: "thanks",
  kiero: "quiero", qiero: "quiero", nd: "nada", ntp: "no te preocupes", tqm: "te quiero mucho", tkm: "te quiero mucho",
  bno: "bueno", wno: "bueno", weno: "bueno", npn: "no pasa nada", ok: "ok", oki: "ok", okey: "ok", okay: "ok", oka: "ok", okis: "ok",
  sip: "si", sep: "si", sii: "si", sisi: "si", nop: "no", nope: "no", vdd: "verdad", cdo: "cuando", dnd: "donde", xa: "para",
  pa: "para", tons: "entonces", entons: "entonces", toy: "estoy", tas: "estas",
};

/** Lo que dicen algunos emojis. */
const EMOJIS: [RegExp, string][] = [
  [/(?:😂|🤣|😆|😹|😅|😁)/gu, " jaja "],
  [/(?:❤️|❤|😍|🥰|😘|💛|💖|💕|🫶)/gu, " te quiero "],
  [/(?:😡|🤬|😤|😠|🖕)/gu, " enojado "],
  [/(?:👋|🙋)/gu, " hola "],
  [/(?:🙏)/gu, " gracias "],
  [/(?:👍|👌|🤙)/gu, " dale "],
  [/(?:👎)/gu, " no "],
];

/** Minúsculas, sin tildes ni signos, sin letras estiradas («holaaa»), con las risas unificadas y las abreviaturas enteras. */
export function limpiar(texto: string): string {
  let t = ` ${texto.toLowerCase()} `;
  for (const [re, v] of EMOJIS) t = t.replace(re, v);
  t = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  t = t.replace(/['’`´]/g, "");
  t = t.replace(/[^\p{L}\p{N}\s]/gu, " ");
  return t
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => (RISA.test(w) ? "jaja" : w.replace(/(\p{L})\1{2,}/gu, "$1")))
    .map((w) => ABREV[w] ?? w)
    .join(" ");
}

/** Risas escritas: jajaja, ajajaj, jsjsjs, jeje, jiji, hahaha, kkkk (Brasil), xd, lol, lmao. */
const RISA = /^(?:a?(?:j+[aeiosu]+){2,}j*|(?:h+[ae]+){2,}h*|k{3,}|x+d+|lol|lmao|rofl)$/;

/** ¿Está esa palabra o frase entera en el texto limpio? */
export const tiene = (t: string, frase: string) => frase.length > 0 && ` ${t} `.includes(` ${frase} `);

// ───────── índices (se arman una vez)

/** Cada expresión, limpia igual que el texto; las de dos palabras cortas, también pegadas («queonda»). */
function variantes(lista: string[] | undefined): string[] {
  const out = new Set<string>();
  for (const x of lista ?? []) {
    const n = limpiar(x);
    if (!n) continue;
    out.add(n);
    const p = n.split(" ");
    if (p.length === 2 && n.length <= 12) out.add(p.join(""));
  }
  return [...out];
}

const BASE = "ar";
const porId = new Map<string, Ficha>(REGIONES.map((r) => [r.id, r]));

/** Pistas que delatan a un solo país (si una aparece en dos, no delata a ninguno). */
const pistas: { region: string; frase: string }[] = (() => {
  const cuenta = new Map<string, Set<string>>();
  for (const r of REGIONES) for (const f of variantes(r.pistas)) (cuenta.get(f) ?? cuenta.set(f, new Set()).get(f)!).add(r.id);
  return [...cuenta.entries()].filter(([f, rs]) => rs.size === 1 && f.length >= 2).map(([frase, rs]) => ({ region: [...rs][0], frase }));
})();

const GLOBAL: Record<Intencion, string[]> = {
  saludo: ["hola", "buenas", "buen dia", "buenos dias", "buenas tardes", "buenas noches", "que tal", "que onda", "hey", "saludos", "hi", "hello", "oi", "ola", "ciao", "alo"],
  comoEstas: ["como estas", "como andas", "como va", "como te va", "como vas", "como estas vos", "como te sentis", "todo bien", "how are you", "tudo bem", "tudo bom"],
  gracias: ["gracias", "muchas gracias", "mil gracias", "te agradezco", "thanks", "thank you", "obrigado", "obrigada", "valeu", "grazie", "merci"],
  chau: ["chau", "chao", "adios", "nos vemos", "hasta luego", "hasta pronto", "hasta manana", "me voy", "bye", "tchau"],
  si: ["si", "dale", "ok", "bueno", "claro", "obvio", "de una", "vale", "listo", "yes", "sim", "por supuesto", "si por favor"],
  no: ["no", "nah", "no gracias", "para nada", "no quiero", "nao", "tampoco"],
  risa: ["jaja"],
  genial: ["genial", "buenisimo", "excelente", "espectacular", "que bueno", "me encanta", "crack", "idolo", "increible", "joya"],
  enojo: ["enojado", "sos un inutil", "no servis", "no sirves", "no sirve para nada", "bot inutil", "bot de mierda", "que bot de mierda", "sos malisimo"],
};

const INTENCIONES = Object.keys(GLOBAL) as Intencion[];
const LISTA: Record<Intencion, keyof Ficha> = { saludo: "saludos", comoEstas: "comoEstas", gracias: "gracias", chau: "chau", si: "si", no: "no", risa: "risas", genial: "genial", enojo: "enojo" };

const porIntencion: Record<Intencion, string[]> = Object.fromEntries(
  INTENCIONES.map((i) => [i, [...new Set([...variantes(GLOBAL[i]), ...REGIONES.flatMap((r) => variantes(r[LISTA[i]] as string[]))])]]),
) as Record<Intencion, string[]>;

/** Los de todas partes (los de cada país vienen en su ficha). */
const SINONIMOS_BASE: Record<string, string[]> = {
  clave: ["contrasena", "contrasenia", "password"],
  celular: ["celu", "cel", "movil", "telefono", "iphone", "android", "smartphone"],
  computadora: ["compu", "pc", "ordenador", "computador", "notebook", "laptop", "portatil", "mac", "macbook"],
  plata: ["dinero", "guita", "lana", "pasta", "platita"],
  "no funciona": ["no anda", "no sirve", "no carga", "no abre", "no arranca", "no me anda", "no me funciona", "no me carga", "no me sirve", "no me abre", "no me arranca", "no me jala", "esta roto", "esta caido", "se colgo", "se trabo", "se cayo", "no jala", "no furula"],
  precio: ["cuanto sale", "cuanto vale", "cuanto cuesta", "cuanto es", "que precio", "a cuanto"],
  descargar: ["bajarme", "descargarme"],
};

/** Modismos de cada país → la palabra que Yo Da ya conoce («lana», «guita», «feria» → «plata»; «no jala» → «no funciona»). */
const sinonimos: [string, string][] = (() => {
  const pares = new Map<string, string>();
  for (const [canonico, lista] of Object.entries(SINONIMOS_BASE)) for (const f of variantes(lista)) if (f !== canonico) pares.set(f, canonico);
  for (const r of REGIONES)
    for (const [canonico, lista] of Object.entries(r.sinonimos ?? {})) for (const f of variantes(lista)) if (f !== canonico && !pares.has(f)) pares.set(f, canonico);
  return [...pares.entries()].sort((a, b) => b[0].length - a[0].length);
})();

// ───────── lectura

export type Lectura = {
  /** El texto limpio, con los modismos cambiados por la palabra que Yo Da conoce («no jala el video» → «no funciona el video»). */
  limpio: string;
  /** De dónde es, si se nota por cómo escribe. */
  region: string | null;
  intenciones: Set<Intencion>;
  /** Mensaje corto (hasta 4 palabras): un «sí», un «no», un «gracias». */
  corto: boolean;
};

export function leer(texto: string): Lectura {
  const t = limpiar(texto);
  let limpio = ` ${t} `;
  for (const [f, c] of sinonimos) if (limpio.includes(` ${f} `)) limpio = limpio.split(` ${f} `).join(` ${c} `);
  limpio = limpio.trim();

  const puntos = new Map<string, number>();
  for (const p of pistas) if (tiene(t, p.frase)) puntos.set(p.region, (puntos.get(p.region) ?? 0) + p.frase.length);
  let region: string | null = null;
  let max = 0;
  for (const [r, n] of puntos) if (n > max) (region = r), (max = n);

  const intenciones = new Set<Intencion>();
  for (const i of INTENCIONES) if (porIntencion[i].some((f) => tiene(t, f))) intenciones.add(i);
  const palabras = t.split(" ").filter(Boolean).length;
  // «no» y «si» sueltos solo cuentan en mensajes cortos («no funciona» no es un «no»)
  if (palabras > 4) {
    intenciones.delete("si");
    intenciones.delete("no");
  }
  return { limpio, region, intenciones, corto: palabras <= 4 };
}

// ───────── respuestas

type ClaveRespuesta = keyof Ficha["respuestas"];

const azar = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];

/** Una respuesta de Yo Da en el registro de ese país (o en el de base). */
export function frase(region: string | null | undefined, clave: ClaveRespuesta): string | null {
  const propias = (region && porId.get(region)?.respuestas[clave]) || [];
  const lista = propias.length ? propias : porId.get(BASE)?.respuestas[clave] ?? [];
  return lista.length ? azar(lista) : null;
}

/** El saludo corto de ese país, para anteponer («¡Wena!», «¡Quiubo!»). */
export function saludoCorto(region: string | null | undefined): string | null {
  const s = frase(region, "saludo");
  const m = s && /^(¡[^!]{1,28}!|[^.!?]{1,24}[.!])/.exec(s);
  return m ? m[1] : null;
}

export const nombreRegion = (region: string | null | undefined) => (region ? porId.get(region)?.nombre ?? null : null);

// ───────── de dónde es el dispositivo

const ZONAS: [RegExp, string][] = [
  [/^America\/(Argentina\/|Buenos_Aires|Cordoba|Mendoza|Catamarca|Jujuy|Rosario)/, "ar"],
  [/^America\/Montevideo$/, "uy"],
  [/^America\/Asuncion$/, "py"],
  [/^America\/La_Paz$/, "bo"],
  [/^(America\/(Santiago|Punta_Arenas)|Pacific\/Easter)$/, "cl"],
  [/^America\/Lima$/, "pe"],
  [/^(America\/Guayaquil|Pacific\/Galapagos)$/, "ec"],
  [/^America\/Bogota$/, "co"],
  [/^America\/Caracas$/, "ve"],
  [/^America\/(Mexico_City|Monterrey|Merida|Cancun|Tijuana|Chihuahua|Ciudad_Juarez|Hermosillo|Mazatlan|Matamoros|Ojinaga|Bahia_Banderas)$/, "mx"],
  [/^America\/Guatemala$/, "gt"],
  [/^America\/El_Salvador$/, "sv"],
  [/^America\/Tegucigalpa$/, "hn"],
  [/^America\/Managua$/, "ni"],
  [/^America\/Costa_Rica$/, "cr"],
  [/^America\/Panama$/, "pa"],
  [/^America\/Havana$/, "cu"],
  [/^America\/Santo_Domingo$/, "do"],
  [/^America\/Puerto_Rico$/, "pr"],
  [/^(Europe\/Madrid|Atlantic\/Canary|Africa\/Ceuta)$/, "es"],
  [/^Africa\/Malabo$/, "gq"],
];

/**
 * El país del dispositivo (por el idioma y la zona horaria), solo si habla
 * español: a quien tiene el teléfono en inglés o portugués no se le cambia el
 * registro hasta que escriba así.
 */
export function regionDelDispositivo(): string | null {
  try {
    const idioma = (navigator.language || "").toLowerCase();
    if (!idioma.startsWith("es")) return null;
    const pais = idioma.split("-")[1];
    if (pais && porId.has(pais)) return pais;
    const zona = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const r = ZONAS.find(([re]) => re.test(zona));
    return r && porId.has(r[1]) ? r[1] : null;
  } catch {
    return null;
  }
}
