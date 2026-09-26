export type Plataforma = "instalada" | "ios" | "safari-mac" | "chromium" | "firefox" | "otra";

/** Detecta el sistema para mostrar la forma correcta de instalar la app. */
export function detectarPlataforma(): Plataforma {
  if (typeof window === "undefined") return "otra";
  const nav = navigator as Navigator & { standalone?: boolean };
  if (window.matchMedia("(display-mode: standalone)").matches || nav.standalone) return "instalada";
  const ua = navigator.userAgent;
  const ipadOS = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  if (/iPhone|iPad|iPod/.test(ua) || ipadOS) return "ios";
  if (/Firefox\//.test(ua) && !/Android/.test(ua)) return "firefox";
  if (/Safari\//.test(ua) && /Macintosh/.test(ua) && !/Chrome|Chromium|Edg\//.test(ua)) return "safari-mac";
  if (/Chrome|Chromium|Edg\/|Android/.test(ua)) return "chromium";
  return "otra";
}
