/**
 * Lo que la música de fondo (components/Musica.tsx) le cuenta al resto del sitio,
 * sobre todo a Yo Da: qué tema suena, y los pedidos de afuera (abrir, pasar, pausar).
 */
import { fichas } from "@/content/musica";

export type TemaSonando = {
  id: string;
  titulo: string;
  artista: string;
  sonando: boolean;
  /** Spotify no reconoce la sesión: suenan 30 segundos. */
  fragmento: boolean;
  /** Lo pidió la persona («Otro tema», en la música o a Yo Da): Yo Da siempre lo comenta. */
  pedido?: boolean;
};

declare global {
  interface Window {
    __jbTema?: TemaSonando;
  }
}

/** Avisa cuando empieza un tema nuevo (detail: TemaSonando). */
export const EVENTO_TEMA = "jb:musica-tema";
/** Avisa si la música suena o no (detail: { sonando: boolean; pos?: ms del tema }): Yo Da asiente al ritmo mientras suena. */
export const EVENTO_ESTADO = "jb:musica-estado";

export const ficha = (id: string) => {
  const f = fichas[id];
  return { titulo: f?.[0] ?? "un tema de la playlist", artista: f?.[1] ?? "" };
};

export const temaActual = (): TemaSonando | null => (typeof window === "undefined" ? null : (window.__jbTema ?? null));

export const abrirMusica = () => window.dispatchEvent(new Event("jb:musica"));
/** Abre el panel y, si se puede, empieza a sonar (tiene que venir de un toque de la persona). */
export const ponerMusica = () => window.dispatchEvent(new Event("jb:musica-poner"));
export const otroTema = () => window.dispatchEvent(new Event("jb:musica-siguiente"));
export const pausarMusica = () => window.dispatchEvent(new Event("jb:musica-pausa"));

/** El navegador, para explicar por qué Spotify da fragmentos y qué hacer. */
export type Navegador = "safari" | "ios" | "firefox" | "brave" | "otro";
export function navegador(): Navegador {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
  if ((navigator as Navigator & { brave?: unknown }).brave) return "brave";
  if (/Firefox|FxiOS/.test(ua)) return "firefox";
  if (/Safari/.test(ua) && !/Chrome|Chromium|CriOS|Edg|OPR|SamsungBrowser/.test(ua)) return "safari";
  return "otro";
}

/** Computadora (no teléfono ni tablet): ahí la app se abre con «spotify:». */
export const esEscritorio = () => !/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) && !(navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));
