/**
 * Quién ve qué.
 * - Masterclass: masterclass, audios y encuentro de preguntas.
 * - Entrada a una conferencia privada: solo esa conferencia.
 * - Directo en vivo (a voluntad): solo ese directo.
 * - Libro digital (comprado o con el código del libro impreso): leer ese libro.
 * - Masterclass 1 a 1: ese horario, con su link de videollamada.
 */
import { leer } from "./db";

export type Compra = {
  id: string;
  usuario: string;
  producto: string; // "masterclass" | "conferencia:<id>" | "directo:<id>"
  monto: number;
  moneda: string;
  fecha: string;
  medio: string; // "simulado" | "codigo" (en producción: "mercadopago" | "paypal" | ...)
  /** Masterclass 1 a 1 cancelada (fecha ISO): no da acceso ni ocupa el horario. Ver lib/sesiones.ts. */
  cancelada?: string;
  canceladaPor?: "cliente" | "julian";
  reembolso?: { monto: number; moneda: string; medio: string; estado: "simulado" | "pendiente" | "hecho" };
  reprogramaciones?: { de: string; a: string; fecha: string }[];
};

export async function comprasDe(uid: string) {
  const compras = await leer<Compra[]>("compras");
  return compras.filter((c) => c.usuario === uid);
}

/**
 * Lo que habilitan las compras de una persona. Las canceladas no habilitan nada (un
 * encuentro 1 a 1 cancelado no aparece como próximo), pero siguen en `compras`, para
 * el historial de la cuenta.
 */
export async function accesos(uid: string) {
  const todas = await comprasDe(uid);
  const mias = todas.filter((c) => !c.cancelada);
  const masterclass = mias.some((c) => c.producto === "masterclass");
  const conferencias = mias.filter((c) => c.producto.startsWith("conferencia:")).map((c) => c.producto.split(":")[1]);
  const directos = mias.filter((c) => c.producto.startsWith("directo:")).map((c) => c.producto.split(":")[1]);
  const libros = mias.filter((c) => c.producto.startsWith("libro:")).map((c) => c.producto.split(":")[1]);
  const sesiones = mias.filter((c) => c.producto.startsWith("sesion:")).map((c) => c.producto.slice("sesion:".length));
  return {
    masterclass,
    audios: masterclass,
    encuentro: masterclass,
    conferencias,
    directos,
    libros,
    sesiones,
    algo: mias.length > 0,
    compras: todas,
  };
}

export type Progreso = { usuario: string; modulo: string; fecha: string };

/** Módulos de la masterclass que el usuario marcó como vistos. */
export async function progresoDe(uid: string) {
  const lista = await leer<Progreso[]>("progreso");
  return new Set(lista.filter((p) => p.usuario === uid).map((p) => p.modulo));
}
