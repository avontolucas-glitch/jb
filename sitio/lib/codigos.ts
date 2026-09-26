/**
 * Códigos del libro impreso: cada ejemplar trae uno distinto, de un solo uso.
 * Al canjearlo con una cuenta, esa cuenta queda con el libro digital.
 *
 * PRODUCCIÓN: generar un lote por tirada (`generarLote`), mandarlo a la
 * imprenta como datos variables (o en tarjetas/stickers raspables) y limitar
 * los intentos por cuenta e IP para que no se puedan adivinar.
 */
import { leer, escribir } from "./db";
import type { Compra } from "./access";

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

export async function canjear(uid: string, texto: string): Promise<{ ok: true; libro: string } | { ok: false; error: string }> {
  const buscado = normalizar(texto);
  if (buscado.length < 10) return { ok: false, error: "Revisá el código: está en la primera página del libro." };
  const codigos = await leer<Codigo[]>("codigos");
  const c = codigos.find((x) => normalizar(x.codigo) === buscado);
  if (!c) return { ok: false, error: "Ese código no existe. Revisalo letra por letra." };
  if (c.usadoPor && c.usadoPor !== uid) return { ok: false, error: "Ese código ya fue usado con otra cuenta." };
  if (!c.usadoPor) {
    c.usadoPor = uid;
    c.fecha = new Date().toISOString();
    await escribir("codigos", codigos);
  }
  const compras = await leer<Compra[]>("compras");
  if (!compras.some((x) => x.usuario === uid && x.producto === `libro:${c.libro}`)) {
    compras.push({ id: crypto.randomUUID(), usuario: uid, producto: `libro:${c.libro}`, monto: 0, moneda: "USD", fecha: new Date().toISOString(), medio: "codigo" });
    await escribir("compras", compras);
  }
  return { ok: true, libro: c.libro };
}
