/**
 * El tiempo que hace donde está la persona, para que Yo Da lo comente (solo en el
 * servidor, desde /api/yo). Usa la latitud y la longitud aproximadas que pone Vercel
 * (de la conexión) y el servicio meteorológico de Noruega (MET Norway, api.met.no:
 * libre, también para uso comercial, con atribución: «Datos del tiempo: MET Norway»,
 * en la política de privacidad). Las coordenadas se redondean a una décima (unos 10
 * km) antes de pedir nada, no se guardan y nunca se le muestran a nadie: Yo Da solo
 * dice la temperatura y el cielo. Una respuesta por zona cada 30 minutos.
 * En las pruebas no hay llamadas de red (se puede simular con encabezados).
 */
import type { Cielo, Clima } from "@/content/yoda-estacion";
import { modoPruebas } from "./cliente";

const cache = new Map<string, { clima: Clima | null; hasta: number }>();
const MINUTOS = 30;

function cieloDe(simbolo: string): { cielo: Cielo; noche: boolean } {
  const s = simbolo.toLowerCase();
  const noche = s.endsWith("_night") || s.endsWith("_polartwilight");
  if (s.includes("thunder")) return { cielo: "tormenta", noche };
  if (s.includes("snow") || s.includes("sleet")) return { cielo: "nieve", noche };
  if (s.includes("rain")) return { cielo: "lluvia", noche };
  if (s.includes("fog")) return { cielo: "niebla", noche };
  if (s.startsWith("clearsky")) return { cielo: "despejado", noche };
  if (s.startsWith("fair") || s.startsWith("partlycloudy")) return { cielo: "nubes", noche };
  return { cielo: "nublado", noche };
}

/** Latitud aproximada (en grados enteros), solo para saber el hemisferio y si es zona tropical. */
export function latitudAproximada(h: Headers): number | null {
  const prueba = modoPruebas() ? h.get("x-jb-prueba-lat") : null;
  const v = Number(prueba ?? h.get("x-vercel-ip-latitude"));
  return (prueba ?? h.get("x-vercel-ip-latitude")) && Number.isFinite(v) && Math.abs(v) <= 90 ? Math.round(v) : null;
}

export async function climaDe(h: Headers): Promise<Clima | null> {
  if (modoPruebas()) {
    const p = h.get("x-jb-prueba-clima");
    if (!p) return null;
    try {
      const c = JSON.parse(p) as Clima;
      return typeof c.temp === "number" ? c : null;
    } catch {
      return null;
    }
  }
  const lat = Number(h.get("x-vercel-ip-latitude"));
  const lon = Number(h.get("x-vercel-ip-longitude"));
  if (!h.get("x-vercel-ip-latitude") || !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  const clave = `${lat.toFixed(1)},${lon.toFixed(1)}`;
  const ahora = Date.now();
  const guardado = cache.get(clave);
  if (guardado && guardado.hasta > ahora) return guardado.clima;
  let clima: Clima | null = null;
  try {
    const r = await fetch(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat.toFixed(1)}&lon=${lon.toFixed(1)}`, {
      headers: { "User-Agent": `julianbermudez.com/1.0 ${process.env.SITIO_URL ?? "https://julianbermudez.com"}` },
      signal: AbortSignal.timeout(1500),
    });
    if (r.ok) {
      const d = (await r.json()) as { properties?: { timeseries?: { data?: { instant?: { details?: { air_temperature?: number } }; next_1_hours?: { summary?: { symbol_code?: string } } } }[] } };
      const ahoraMismo = d.properties?.timeseries?.[0]?.data;
      const temp = ahoraMismo?.instant?.details?.air_temperature;
      if (typeof temp === "number") clima = { temp, ...cieloDe(ahoraMismo?.next_1_hours?.summary?.symbol_code ?? "cloudy") };
    }
  } catch {}
  cache.set(clave, { clima, hasta: ahora + MINUTOS * 60_000 });
  if (cache.size > 2000) cache.delete(cache.keys().next().value!);
  return clima;
}
