/**
 * Checkout SIMULADO. No cobra nada: registra la compra y habilita el acceso.
 *
 * PRODUCCIÓN — dónde va el pago real:
 *  1) Mercado Pago (cobro en pesos): en `iniciarPago` crear una "preferencia"
 *     con el SDK oficial (monto convertido a ARS) y redirigir al init_point.
 *     La compra se registra SOLO cuando llega la notificación (webhook) con el
 *     pago aprobado, nunca al volver del checkout.
 *  2) Hotmart: en lugar de este checkout, el botón lleva al link de pago del
 *     producto en Hotmart, y el acceso se habilita con su webhook de compra.
 */
import { leer, escribir } from "./db";
import type { Compra } from "./access";
import { conferencias, precios } from "@/content/config";

export type Producto = { id: string; titulo: string; monto: number; moneda: string; aDefinir: boolean };

export function producto(id: string): Producto | null {
  if (id === "masterclass") {
    return { id, titulo: "Masterclass", ...precios.masterclass };
  }
  if (id.startsWith("conferencia-")) {
    const cid = id.slice("conferencia-".length);
    const c = conferencias.find((x) => x.id === cid && x.tipo === "privada");
    if (!c) return null;
    return { id: `conferencia:${cid}`, titulo: `Entrada · ${c.titulo}`, ...precios.conferenciaPrivada };
  }
  return null;
}

/** Simula un pago aprobado. En producción esto lo dispara el webhook del medio de pago. */
export async function pagarSimulado(uid: string, p: Producto): Promise<void> {
  const compras = await leer<Compra[]>("compras");
  if (compras.some((c) => c.usuario === uid && c.producto === p.id)) return;
  compras.push({
    id: crypto.randomUUID(),
    usuario: uid,
    producto: p.id,
    monto: p.monto,
    moneda: p.moneda,
    fecha: new Date().toISOString(),
    medio: "simulado",
  });
  await escribir("compras", compras);
}
