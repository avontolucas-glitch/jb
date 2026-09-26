/**
 * Quién ve qué.
 * - Masterclass: masterclass, audios y encuentro de preguntas.
 * - Entrada a una conferencia privada: solo esa conferencia.
 */
import { leer } from "./db";

export type Compra = {
  id: string;
  usuario: string;
  producto: string; // "masterclass" | "conferencia:<id>"
  monto: number;
  moneda: string;
  fecha: string;
  medio: string; // "simulado" (en producción: "mercadopago" | "hotmart")
};

export async function comprasDe(uid: string) {
  const compras = await leer<Compra[]>("compras");
  return compras.filter((c) => c.usuario === uid);
}

export async function accesos(uid: string) {
  const mias = await comprasDe(uid);
  const masterclass = mias.some((c) => c.producto === "masterclass");
  const conferencias = mias.filter((c) => c.producto.startsWith("conferencia:")).map((c) => c.producto.split(":")[1]);
  return {
    masterclass,
    audios: masterclass,
    encuentro: masterclass,
    conferencias,
    algo: mias.length > 0,
    compras: mias,
  };
}

export type Progreso = { usuario: string; modulo: string; fecha: string };

/** Módulos de la masterclass que el usuario marcó como vistos. */
export async function progresoDe(uid: string) {
  const lista = await leer<Progreso[]>("progreso");
  return new Set(lista.filter((p) => p.usuario === uid).map((p) => p.modulo));
}
