import { NextResponse } from "next/server";
import { horarios, ocupados } from "@/lib/sesiones";
import { limitarRuta } from "@/lib/proteger";
import { modoPruebas } from "@/lib/cliente";

/**
 * Los próximos horarios libres de la Masterclass 1 a 1 (lo mismo que muestra
 * el calendario público), para el bot «Yo Soy». `inicio` es el instante exacto:
 * cada visitante lo ve en su hora.
 *
 * Con límite por cliente (LIMITES.apiHorarios) y una caché en memoria de 30 s: los
 * pedidos seguidos (o muchos a la vez) no recalculan la agenda cada vez. Una reserva
 * o un bloqueo nuevo puede tardar hasta 30 s en verse acá (en el calendario de la
 * página, no). En modo pruebas no hay caché, para que cada prueba vea lo último.
 */
export const dynamic = "force-dynamic";

const CACHE_MS = 30_000;
const MAXIMO = 10;
type Libre = { id: string; inicio: string };

const g = globalThis as unknown as { __jbHorarios?: { hasta: number; datos: Promise<Libre[]> } };

async function calcular(): Promise<Libre[]> {
  const [todos, tomados] = await Promise.all([horarios(), ocupados()]);
  return todos
    .filter((h) => !tomados.has(h.id))
    .slice(0, MAXIMO)
    .map((h) => ({ id: h.id, inicio: h.fecha.toISOString() }));
}

/** Los primeros 10 libres; si varios piden a la vez, comparten el mismo cálculo. */
function libres(): Promise<Libre[]> {
  const ahora = Date.now();
  const c = g.__jbHorarios;
  if (c && c.hasta > ahora && !modoPruebas()) return c.datos;
  const datos = calcular();
  g.__jbHorarios = { hasta: ahora + CACHE_MS, datos };
  // si falla, no se guarda el error: el próximo pedido vuelve a probar
  datos.catch(() => {
    if (g.__jbHorarios?.datos === datos) g.__jbHorarios = undefined;
  });
  return datos;
}

export async function GET(req: Request) {
  const limite = await limitarRuta("apiHorarios", req);
  if (limite) return limite;
  const n = Math.min(MAXIMO, Math.max(1, Number(new URL(req.url).searchParams.get("n")) || 3));
  // un horario que ya empezó (o que entró en la anticipación mínima) puede seguir en la caché
  // hasta 30 s: se descartan los que ya pasaron
  const ahora = Date.now();
  const lista = (await libres()).filter((h) => Date.parse(h.inicio) > ahora).slice(0, n);
  return NextResponse.json({ horarios: lista }, { headers: { "Cache-Control": "no-store" } });
}
