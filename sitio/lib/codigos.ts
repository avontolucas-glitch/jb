/**
 * Códigos del libro impreso: cada ejemplar trae uno distinto, de un solo uso.
 * Al canjearlo con una cuenta, esa cuenta queda con el libro digital.
 *
 * PRODUCCIÓN: generar un lote por tirada (`generarLote`), mandarlo a la
 * imprenta como datos variables (o en tarjetas/stickers raspables).
 *
 * Contra la fuerza bruta (probar códigos hasta acertar uno): el alfabeto de 31
 * signos y 12 posiciones da ~8·10^17 combinaciones por libro, y además
 * `vigilanciaCanje` / `falloCanje` cuentan los códigos equivocados por cuenta y
 * por cliente (huella de la IP): desde el 3.er fallo en una hora se pide la
 * verificación y con 10 fallos en una hora se bloquea el canje por una hora.
 * Esto va sumado a la tabla LIMITES.canjear de lib/limite.ts (lib/acciones.ts
 * usa las dos cosas).
 */
import { modificar } from "./db";
import type { Compra } from "./access";
import { bloqueadoPor, bloquear, contar, limpiar, mirar, type Sujetos } from "./limite";
import { TOPES } from "./validar";

type Codigo = { codigo: string; libro: string; usadoPor: string | null; fecha: string | null };

// Sin letras ni números que se confunden (0/O, 1/I/L)
const ALFABETO = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function normalizar(txt: string) {
  return txt.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function generarLote(libro: string, cantidad: number): Codigo[] {
  const prefijo = libro.slice(0, 3).toUpperCase();
  return Array.from({ length: cantidad }, () => {
    const b = crypto.getRandomValues(new Uint8Array(12));
    const c = Array.from(b, (x) => ALFABETO[x % ALFABETO.length]).join("");
    return { codigo: `${prefijo}-${c.slice(0, 4)}-${c.slice(4, 8)}-${c.slice(8, 12)}`, libro, usadoPor: null, fecha: null };
  });
}

export const REVISA_CODIGO = "Revisá el código: está en la última página del libro.";

type ResultadoCanje = { ok: true; libro: string } | { ok: false; error: string };

export async function canjear(uid: string, texto: string): Promise<ResultadoCanje> {
  // el largo se mira antes de normalizar: nada de procesar textos gigantes
  if (texto.length > TOPES.codigo) return { ok: false, error: REVISA_CODIGO };
  const buscado = normalizar(texto);
  if (buscado.length < 10) return { ok: false, error: REVISA_CODIGO };

  // mirar y marcar pasa de una sola vez (lib/db.ts): dos cuentas que canjean el mismo
  // código casi a la vez no se lo quedan las dos
  const r = await modificar<Codigo[], ResultadoCanje>("codigos", (codigos) => {
    const c = codigos.find((x) => normalizar(x.codigo) === buscado);
    if (!c) return { resultado: { ok: false, error: "Ese código no existe. Revisalo letra por letra." } };
    if (c.usadoPor && c.usadoPor !== uid) return { resultado: { ok: false, error: "Ese código ya fue usado con otra cuenta." } };
    if (c.usadoPor) return { resultado: { ok: true, libro: c.libro } };
    const datos = codigos.map((x) => (x === c ? { ...x, usadoPor: uid, fecha: new Date().toISOString() } : x));
    return { datos, resultado: { ok: true, libro: c.libro } };
  });
  if (!r.ok) return r;

  const producto = `libro:${r.libro}`;
  await modificar<Compra[], void>("compras", (compras) => {
    if (compras.some((x) => x.usuario === uid && x.producto === producto)) return { resultado: undefined };
    const nueva: Compra = { id: crypto.randomUUID(), usuario: uid, producto, monto: 0, moneda: "USD", fecha: new Date().toISOString(), medio: "codigo" };
    return { datos: [...compras, nueva], resultado: undefined };
  });
  return r;
}

/* ───────── Fuerza bruta: fallos por cuenta y por cliente ───────── */

export const CANJE = {
  /** Con esta cantidad de fallos en la ventana, el siguiente intento pide verificación. */
  verificarTras: 3,
  /** Con esta cantidad de fallos en la ventana, bloqueo. */
  max: 10,
  ventanaSeg: 60 * 60,
  bloqueoSeg: 60 * 60,
} as const;

/** Las claves de los contadores: por cuenta y por huella de IP (en pruebas, con su sufijo). */
function clavesCanje(s: Sujetos): string[] {
  const sufijo = s.prueba ? `~${s.prueba}` : "";
  const claves: string[] = [];
  if (s.cuenta) claves.push(`canje:cuenta:${s.cuenta}${sufijo}`);
  if (s.ip) claves.push(`canje:ip:${s.ip}${sufijo}`);
  return claves;
}

/** Antes de canjear: ¿está bloqueado (y por cuánto) o hace falta verificar? */
export async function vigilanciaCanje(s: Sujetos): Promise<{ bloqueoSeg: number; verificar: boolean }> {
  const claves = clavesCanje(s);
  const bloqueos = await Promise.all(claves.map((k) => bloqueadoPor(k)));
  const bloqueoSeg = Math.max(0, ...bloqueos);
  if (bloqueoSeg > 0) return { bloqueoSeg, verificar: false };
  const fallos = await Promise.all(claves.map((k) => mirar(k, { ventanaSeg: CANJE.ventanaSeg })));
  return { bloqueoSeg: 0, verificar: fallos.some((n) => n >= CANJE.verificarTras) };
}

/** Un código equivocado (o ya usado por otra cuenta). Devuelve true si con este quedó bloqueado. */
export async function falloCanje(s: Sujetos): Promise<boolean> {
  let bloqueado = false;
  for (const k of clavesCanje(s)) {
    const r = await contar(k, { ventanaSeg: CANJE.ventanaSeg, max: CANJE.max });
    if (r.cuenta >= CANJE.max) {
      await bloquear(k, CANJE.bloqueoSeg);
      bloqueado = true;
    }
  }
  return bloqueado;
}

/** Un canje correcto: se olvidan los fallos de la cuenta (los de la IP, no). */
export async function exitoCanje(s: Sujetos): Promise<void> {
  const [cuenta] = clavesCanje({ ...s, ip: undefined });
  if (cuenta) await limpiar(cuenta, { ventanaSeg: CANJE.ventanaSeg });
}
