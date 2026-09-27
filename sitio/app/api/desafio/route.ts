import { NextResponse } from "next/server";
import { desafioParaCliente } from "@/lib/desafio";
import { respuestaLimite, revisar, sujetosDe } from "@/lib/limite";

/**
 * Entrega una verificación nueva para components/Desafio.tsx:
 *  - { modo: "turnstile", siteKey }  con Cloudflare Turnstile;
 *  - { modo: "trabajo", sal, dificultad, exp, firma }  para la prueba de trabajo propia.
 * `?modo=trabajo` lo pide el navegador cuando el script de Turnstile no carga; solo se
 * concede si el sitio no usa Turnstile o si Cloudflare está caído (lib/desafio.ts).
 * Limitado por IP (LIMITES.desafio): pedir desafíos en bucle no sirve de nada.
 */
export const dynamic = "force-dynamic";

const SIN_CACHE = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };

export async function GET(req: Request) {
  const v = await revisar("desafio", await sujetosDe(req.headers));
  if (!v.permitido) return respuestaLimite(v);
  const pedido = new URL(req.url).searchParams.get("modo") === "trabajo" ? "trabajo" : undefined;
  return NextResponse.json(await desafioParaCliente(pedido), { headers: SIN_CACHE });
}
