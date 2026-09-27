import { NextResponse } from "next/server";
import { horarios, ocupados } from "@/lib/sesiones";

/**
 * Los próximos horarios libres de la Masterclass 1 a 1 (lo mismo que muestra
 * el calendario público), para el bot «Yo Soy». `inicio` es el instante exacto:
 * cada visitante lo ve en su hora.
 */
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const n = Math.min(10, Math.max(1, Number(new URL(req.url).searchParams.get("n")) || 3));
  const tomados = await ocupados();
  const libres = (await horarios()).filter((h) => !tomados.has(h.id)).slice(0, n);
  return NextResponse.json(
    { horarios: libres.map((h) => ({ id: h.id, inicio: h.fecha.toISOString() })) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
