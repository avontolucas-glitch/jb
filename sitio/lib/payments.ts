/**
 * Checkout SIMULADO. No cobra nada: registra la compra y habilita el acceso.
 *
 * PRODUCCIÓN — dónde va el pago real:
 *  1) Mercado Pago (cobro en pesos): en `iniciarPago` crear una "preferencia"
 *     con el SDK oficial (monto convertido a ARS) y redirigir al init_point.
 *     La compra se registra SOLO cuando llega la notificación (webhook) con el
 *     pago aprobado, nunca al volver del checkout.
 *     Para los directos a voluntad, el monto elegido viaja en la preferencia
 *     (o en el link de pago) y se toma el que confirma el webhook.
 *  2) Hotmart: en lugar de este checkout, el botón lleva al link de pago del
 *     producto en Hotmart, y el acceso se habilita con su webhook de compra.
 */
import { leer, escribir } from "./db";
import type { Compra } from "./access";
import { conferencias, enVivo, libros, precios } from "@/content/config";
import { horarioDesdeId } from "./sesiones";

export type Producto = {
  id: string;
  titulo: string;
  monto: number;
  moneda: string;
  aDefinir: boolean;
  /** Precio a voluntad: la persona elige cuánto pagar, desde `monto`. */
  aVoluntad?: { minimo: number; maximo: number; sugeridos: number[] };
};

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
  if (id.startsWith("sesion-")) {
    const h = horarioDesdeId(id.slice("sesion-".length));
    if (!h) return null;
    return { id: `sesion:${h.id}`, titulo: `Sesión privada · ${h.etiqueta}`, ...precios.sesionPrivada };
  }
  if (id.startsWith("libro-")) {
    const lid = id.slice("libro-".length);
    const l = libros.find((x) => x.id === lid);
    if (!l) return null;
    return { id: `libro:${lid}`, titulo: `${l.titulo} · edición digital`, ...precios.libroDigital };
  }
  if (id.startsWith("directo-")) {
    const did = id.slice("directo-".length);
    const d = enVivo.directos.find((x) => x.id === did);
    if (!d) return null;
    return {
      id: `directo:${did}`,
      titulo: `${enVivo.titulo} · ${d.titulo}`,
      monto: enVivo.minimo,
      moneda: enVivo.moneda,
      aDefinir: false,
      aVoluntad: { minimo: enVivo.minimo, maximo: enVivo.maximo, sugeridos: enVivo.sugeridos },
    };
  }
  return null;
}

/** Valida el monto elegido en un producto a voluntad. Devuelve el monto o un error. */
export function montoElegido(p: Producto, valor: string): { monto: number } | { error: string } {
  if (!p.aVoluntad) return { monto: p.monto };
  const n = Number(String(valor).replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) return { error: "Elegí cuánto querés pagar." };
  if (n < p.aVoluntad.minimo) return { error: `El mínimo es ${p.moneda} ${p.aVoluntad.minimo}.` };
  if (n > p.aVoluntad.maximo) return { error: `El máximo por pago es ${p.moneda} ${p.aVoluntad.maximo}.` };
  return { monto: Math.round(n * 100) / 100 };
}

/** Simula un pago aprobado. En producción esto lo dispara el webhook del medio de pago. */
export async function pagarSimulado(uid: string, p: Producto, monto = p.monto): Promise<void> {
  const compras = await leer<Compra[]>("compras");
  if (compras.some((c) => c.usuario === uid && c.producto === p.id)) return;
  compras.push({
    id: crypto.randomUUID(),
    usuario: uid,
    producto: p.id,
    monto,
    moneda: p.moneda,
    fecha: new Date().toISOString(),
    medio: "simulado",
  });
  await escribir("compras", compras);
}
