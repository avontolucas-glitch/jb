/**
 * Validaciones y saneamiento reutilizables para las acciones y las rutas.
 * Corre en edge y en node. Regla de oro: el largo se mira ANTES de cualquier regex
 * o proceso, así una entrada gigante no cuesta nada.
 *
 * Topes de la auditoría: nombre ≤ 80, mail ≤ 254, WhatsApp ≤ 20 dígitos, código de
 * canje ≤ 40 antes de normalizar, clave ≤ 200, pregunta y nota ≤ 1500.
 */

export const TOPES = {
  nombre: 80,
  mail: 254,
  whatsapp: 20,
  codigo: 40,
  clave: 200,
  texto: 1500,
} as const;

/** Caracteres de control (menos tab, salto de línea y retorno si `lineas`) y marcas de dirección invisibles. */
const CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩﻿]/g;
const CONTROL_UNA_LINEA = /[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩﻿]/g;

/** Saca caracteres de control. Con `lineas` deja los saltos de línea (y los normaliza a \n). */
export function sinControl(v: string, lineas = false): string {
  return lineas ? v.replace(/\r\n?/g, "\n").replace(CONTROL, "") : v.replace(CONTROL_UNA_LINEA, " ");
}

/** Recorta a `max` caracteres sin partir un emoji ni un acento combinado a la mitad. */
export function recorte(v: string, max: number): string {
  if (v.length <= max) return v;
  let s = v.slice(0, max);
  if (/[\ud800-\udbff]$/.test(s)) s = s.slice(0, -1);
  return s;
}

/** Lee un campo del formulario como texto crudo (sin archivos). */
export function crudo(f: FormData, k: string): string {
  const v = f.get(k);
  return typeof v === "string" ? v : "";
}

/**
 * Un campo de texto saneado: sin caracteres de control, espacios de más fuera y recortado.
 * Devuelve null si falta (con min > 0), si es más corto que `min` o más largo que `max`.
 * Con `cortar: true`, en vez de rechazar lo largo, lo corta.
 *   const nombre = texto(f, "nombre", { max: TOPES.nombre, min: 2 });
 *   if (nombre === null) return { error: "Escribí tu nombre (hasta 80 letras)." };
 *   const pregunta = texto(f, "pregunta", { max: TOPES.texto, min: 3, lineas: true });
 */
export function texto(f: FormData, k: string, o: { max: number; min?: number; lineas?: boolean; cortar?: boolean }): string | null {
  const v = crudo(f, k);
  // Antes de procesar: nada que sea mucho más largo que el tope.
  if (v.length > o.max * 4 + 64 && !o.cortar) return null;
  let s = sinControl(o.cortar ? v.slice(0, o.max * 4 + 64) : v, o.lineas);
  s = o.lineas
    ? s
        .split("\n")
        .map((l) => l.replace(/[ \t]+/g, " ").trimEnd())
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
    : s.replace(/\s+/g, " ").trim();
  if (s.length > o.max) {
    if (!o.cortar) return null;
    s = recorte(s, o.max).trim();
  }
  if (s.length < (o.min ?? 0)) return null;
  return s;
}

/**
 * ¿Es un mail con forma válida? Lineal (sin backtracking): las partes del dominio no
 * pueden tener punto, así que no hay ambigüedad. El largo se mira antes.
 * Acepta ana@demo.com, nombre.apellido+x@mail.com.ar y üñí@correo.com.ar;
 * rechaza a@b, sin@punto, a@.com, a@b..com y dos@@x.com.
 */
export const mailValido = (m: string): boolean =>
  m.length <= TOPES.mail && /^[^\s@]{1,64}@[^\s@.]{1,63}(?:\.[^\s@.]{1,63})+$/.test(m);

/** Mail normalizado (sin espacios, en minúsculas) o null si no es válido. */
export function mail(v: string): string | null {
  if (v.length > TOPES.mail + 16) return null;
  const m = v.trim().toLowerCase();
  return mailValido(m) ? m : null;
}

/** Lee y valida un mail del formulario. */
export function mailDe(f: FormData, k = "email"): string | null {
  return mail(crudo(f, k));
}

/**
 * Número de WhatsApp: se aceptan espacios, guiones, paréntesis y un + adelante.
 * Devuelve "+" y los dígitos (entre 8 y 20), o null.
 *   whatsapp("+54 9 11 5555-1234") === "+5491155551234"
 */
export function whatsapp(v: string): string | null {
  if (v.length > 40) return null;
  const s = v.trim();
  if (!/^\+?[\d\s().-]+$/.test(s)) return null;
  const digitos = s.replace(/\D/g, "");
  if (digitos.length < 8 || digitos.length > TOPES.whatsapp) return null;
  return `+${digitos}`;
}

/**
 * Una clave tal como la escribió la persona (sin recortar espacios), o null si falta o
 * pasa el tope. Para el aviso: «La clave es demasiado larga.»
 */
export function clave(f: FormData, k = "clave", max: number = TOPES.clave): string | null {
  const v = crudo(f, k);
  if (!v || v.length > max) return null;
  return v;
}

/** Un número entero dentro de un rango, o null. */
export function entero(v: string | null | undefined, min: number, max: number): number | null {
  const s = (v ?? "").trim();
  if (!s || s.length > 16 || !/^-?\d+$/.test(s)) return null;
  const n = Number(s);
  return Number.isSafeInteger(n) && n >= min && n <= max ? n : null;
}

/** Uno de los valores permitidos, o null. */
export function opcion<T extends string>(v: string | null | undefined, permitidos: readonly T[]): T | null {
  return permitidos.includes(v as T) ? (v as T) : null;
}

/**
 * Un valor de un mapa fijo, solo si la clave es propia (no «__proto__», «constructor»…).
 *   {elegir(avisos, aviso) && <p>{elegir(avisos, aviso)}</p>}
 */
export function elegir<V>(mapa: Record<string, V>, k: string | null | undefined): V | undefined {
  return k && Object.hasOwn(mapa, k) ? mapa[k] : undefined;
}

/**
 * Solo se vuelve a rutas internas del sitio. Rechaza «//otro.com», «/\otro.com» y los
 * caracteres de control («/%09/evil.com» llega como «/\t/evil.com» y el navegador borra
 * el tab: terminaría en https://evil.com/).
 *   redirect(destinoSeguro(txt(f, "volver")));
 */
export function destinoSeguro(v = "", porDefecto = "/mi-espacio"): string {
  if (typeof v !== "string" || v.length > 2048 || !v.startsWith("/") || v.startsWith("//") || /[\x00-\x1f\x7f\\]/.test(v)) return porDefecto;
  try {
    const u = new URL(v, "https://interno.invalid");
    return u.origin === "https://interno.invalid" ? u.pathname + u.search + u.hash : porDefecto;
  } catch {
    return porDefecto;
  }
}
