/**
 * Sonidos del sitio, sintetizados en el navegador (sin archivos).
 * Todos suaves y cortos. Se silencian con el interruptor (queda recordado).
 */
const CLAVE = "jb-sonido";
let ctx: AudioContext | null = null;
let salida: GainNode | null = null;

export function sonidoActivo() {
  try {
    return localStorage.getItem(CLAVE) !== "no";
  } catch {
    return true;
  }
}
export function activarSonido(si: boolean) {
  try {
    localStorage.setItem(CLAVE, si ? "si" : "no");
  } catch {}
  window.dispatchEvent(new Event("jb-sonido"));
}

function audio() {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    ctx = new AC();
    // un poco de reverberación simple (dos ecos suaves) para que suene a sala
    salida = ctx.createGain();
    salida.gain.value = 0.9;
    const eco = ctx.createDelay(1);
    eco.delayTime.value = 0.19;
    const vuelta = ctx.createGain();
    vuelta.gain.value = 0.22;
    const filtro = ctx.createBiquadFilter();
    filtro.type = "lowpass";
    filtro.frequency.value = 2400;
    salida.connect(ctx.destination);
    salida.connect(eco);
    eco.connect(filtro);
    filtro.connect(vuelta);
    vuelta.connect(eco);
    vuelta.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

/** Un tono con parciales (campana, cristal, cuenco): frecuencia, parciales y caída. */
function tono(f: number, parciales: [number, number][], caida: number, volumen: number, ataque = 0.004, batido = 0) {
  const a = audio();
  if (!a || !salida) return;
  const t = a.currentTime + 0.005;
  const env = a.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(volumen, t + ataque);
  env.gain.exponentialRampToValueAtTime(0.0001, t + caida);
  env.connect(salida);
  for (const [mult, g] of parciales) {
    for (const d of batido ? [-batido, batido] : [0]) {
      const o = a.createOscillator();
      const pg = a.createGain();
      o.type = "sine";
      o.frequency.value = f * mult + d;
      pg.gain.value = batido ? g / 2 : g;
      o.connect(pg);
      pg.connect(env);
      o.start(t);
      o.stop(t + caida + 0.05);
    }
  }
}

// Re menor pentatónica: cualquier combinación suena bien
const ESCALA = [587.33, 698.46, 783.99, 880, 1046.5, 1174.66, 1396.91, 1567.98];

export type TipoSonido = "cuenco" | "nav" | "campana" | "toque";

export function tocar(tipo: TipoSonido, nota = 0) {
  if (!sonidoActivo()) return;
  switch (tipo) {
    case "cuenco": // cuenco tibetano: grave, largo, con batido lento
      tono(196, [[1, 1], [2.76, 0.35], [5.1, 0.12]], 4.2, 0.16, 0.03, 0.9);
      break;
    case "nav": // cristal: una nota de la escala por sección
      tono(ESCALA[nota % ESCALA.length], [[1, 1], [2, 0.18], [3.01, 0.06]], 1.1, 0.06);
      break;
    case "campana": // campanita: parciales inarmónicos
      tono(880, [[1, 1], [2.76, 0.3], [5.4, 0.1]], 1.6, 0.07);
      break;
    case "toque": // un toque de madera, apenas
      tono(1320, [[1, 1], [1.5, 0.2]], 0.12, 0.025, 0.002);
      break;
  }
}
