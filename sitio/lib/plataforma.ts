export type Plataforma = "instalada" | "ios" | "safari-mac" | "chromium" | "firefox" | "otra";

/** Sistema y navegador con los que se entra, para saber cómo se instala la app. */
export type Sistema = {
  so: "ios" | "ipados" | "android" | "mac" | "windows" | "linux" | "chromeos" | "otro";
  navegador: "safari" | "chrome" | "edge" | "firefox" | "samsung" | "opera" | "otro";
  /** Navegador de adentro de una red social (Instagram, Facebook, TikTok…): desde ahí no se puede instalar. */
  enApp: string | null;
  instalada: boolean;
};

export function detectarSistema(ua = typeof navigator === "undefined" ? "" : navigator.userAgent): Sistema {
  const w = typeof window === "undefined" ? null : window;
  const nav = (w ? navigator : {}) as Navigator & { standalone?: boolean };
  const instalada = !!w && (w.matchMedia?.("(display-mode: standalone)").matches || w.matchMedia?.("(display-mode: window-controls-overlay)").matches || !!nav.standalone);
  const toque = !!w && navigator.maxTouchPoints > 1;

  let so: Sistema["so"] = "otro";
  if (/iPhone|iPod/.test(ua)) so = "ios";
  else if (/iPad/.test(ua) || (/Macintosh/.test(ua) && toque)) so = "ipados";
  else if (/Android/.test(ua)) so = "android";
  else if (/CrOS/.test(ua)) so = "chromeos";
  else if (/Macintosh|Mac OS X/.test(ua)) so = "mac";
  else if (/Windows/.test(ua)) so = "windows";
  else if (/Linux/.test(ua)) so = "linux";

  let enApp: string | null = null;
  if (/Instagram/.test(ua)) enApp = "Instagram";
  else if (/FBAN|FBAV|FB_IAB|FBIOS|Messenger/.test(ua)) enApp = "Facebook";
  else if (/BytedanceWebview|musical_ly|TikTok/i.test(ua)) enApp = "TikTok";
  else if (/LinkedInApp/.test(ua)) enApp = "LinkedIn";
  else if (/Twitter/.test(ua)) enApp = "X";
  else if (/ Line\//.test(ua)) enApp = "LINE";
  else if (so === "android" && /; wv\)/.test(ua)) enApp = "una app";

  let navegador: Sistema["navegador"] = "otro";
  if (so === "ios" || so === "ipados") {
    if (/CriOS/.test(ua)) navegador = "chrome";
    else if (/FxiOS/.test(ua)) navegador = "firefox";
    else if (/EdgiOS/.test(ua)) navegador = "edge";
    else if (/OPiOS|OPT\//.test(ua)) navegador = "opera";
    else if (/Safari\//.test(ua) && /Version\//.test(ua)) navegador = "safari";
  } else if (/SamsungBrowser/.test(ua)) navegador = "samsung";
  else if (/EdgA?\/|Edg\//.test(ua)) navegador = "edge";
  else if (/OPR\/|Opera/.test(ua)) navegador = "opera";
  else if (/Firefox\//.test(ua)) navegador = "firefox";
  else if (/Chrome|Chromium/.test(ua)) navegador = "chrome";
  else if (/Safari\//.test(ua)) navegador = "safari";

  return { so, navegador, enApp, instalada };
}

/** La forma gruesa (la que usan los avisos y la página /app). */
export function plataformaDe(s: Sistema): Plataforma {
  if (s.instalada) return "instalada";
  if (s.so === "ios" || s.so === "ipados") return "ios";
  if (s.so === "mac" && s.navegador === "safari") return "safari-mac";
  if (s.navegador === "firefox" && s.so !== "android") return "firefox";
  if (["chrome", "edge", "samsung", "opera"].includes(s.navegador) || s.so === "android") return "chromium";
  return "otra";
}

/** Detecta el sistema para mostrar la forma correcta de instalar la app. */
export function detectarPlataforma(): Plataforma {
  if (typeof window === "undefined") return "otra";
  return plataformaDe(detectarSistema());
}

const SO: Record<Sistema["so"], string> = {
  ios: "iPhone", ipados: "iPad", android: "Android", mac: "Mac", windows: "Windows", linux: "Linux", chromeos: "Chromebook", otro: "",
};
const NAV: Record<Sistema["navegador"], string> = {
  safari: "Safari", chrome: "Chrome", edge: "Edge", firefox: "Firefox", samsung: "Samsung Internet", opera: "Opera", otro: "",
};

/** «iPhone · Safari», «Android · dentro de Instagram»… */
export function nombreSistema(s: Sistema): string {
  const partes = [SO[s.so], s.enApp ? `dentro de ${s.enApp}` : NAV[s.navegador]].filter(Boolean);
  return partes.length ? partes.join(" · ") : "otro navegador";
}
