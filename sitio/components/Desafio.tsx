"use client";
/**
 * «Confirmá que sos una persona»: la verificación que aparece después de varios intentos
 * (ver lib/desafio.ts y lib/limite.ts). Va DENTRO del <form>: al terminar deja un campo
 * oculto name="jb_desafio" con el token, que el servidor verifica con verificarDesafio().
 *
 *   {estado?.verificar && <Desafio reinicio={estado} />}
 *
 * `reinicio`: cada vez que cambia (por ejemplo, el estado que devuelve la acción), la
 * casilla vuelve a empezar, porque cada token sirve para un solo envío.
 *
 * Con Turnstile muestra el widget de Cloudflare; si no, resuelve una prueba de trabajo
 * en un Web Worker (SHA-256 en JS) y, si el navegador no deja crear el Worker, en el
 * hilo principal en tandas cortas para no trabar la página.
 */
import { useCallback, useEffect, useId, useRef, useState } from "react";

export type Fase = "inicial" | "cargando" | "trabajando" | "turnstile" | "listo" | "error";

/** ¿La casilla está en el medio de verificar? (el formulario no deja enviar mientras tanto) */
export const faseOcupada = (f: Fase) => f === "cargando" || f === "trabajando" || f === "turnstile";

type DesafioCliente =
  | { modo: "trabajo"; sal: string; dificultad: number; exp: number; firma: string }
  | { modo: "turnstile"; siteKey: string };

type Turnstile = {
  render: (el: HTMLElement, o: Record<string, unknown>) => string;
  remove: (id: string) => void;
  reset: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

const SCRIPT_TURNSTILE = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/**
 * Busca n tal que SHA-256(sal + n) empiece con `dif` bits en cero, probando de `desde`
 * a `hasta`; devuelve -1 si no hay. SHA-256 de un solo bloque (mensajes ASCII de hasta
 * 55 bytes: sal de 32 + número). Autocontenida a propósito: el Worker se arma con su
 * texto (toString), así no hace falta eval ni un archivo aparte.
 */
function buscarTrabajo(sal: string, dif: number, desde: number, hasta: number): number {
  const K = new Int32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01,
    0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
    0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
    0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08,
    0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ]);
  const W = new Int32Array(64);
  for (let n = desde; n < hasta; n++) {
    const s = sal + n;
    const L = s.length;
    for (let i = 0; i < 16; i++) W[i] = 0;
    for (let i = 0; i < L; i++) W[i >> 2] |= s.charCodeAt(i) << (24 - (i & 3) * 8);
    W[L >> 2] |= 0x80 << (24 - (L & 3) * 8);
    W[15] = L * 8;
    for (let i = 16; i < 64; i++) {
      const x = W[i - 15];
      const y = W[i - 2];
      W[i] =
        (W[i - 16] +
          (((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3)) +
          W[i - 7] +
          (((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10))) |
        0;
    }
    let a = 0x6a09e667 | 0, b = 0xbb67ae85 | 0, c = 0x3c6ef372 | 0, d = 0xa54ff53a | 0;
    let e = 0x510e527f | 0, f = 0x9b05688c | 0, g = 0x1f83d9ab | 0, h = 0x5be0cd19 | 0;
    for (let i = 0; i < 64; i++) {
      const t1 = (h + (((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7))) + ((e & f) ^ (~e & g)) + K[i] + W[i]) | 0;
      const t2 = ((((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10))) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    const H = [(0x6a09e667 + a) | 0, (0xbb67ae85 + b) | 0, (0x3c6ef372 + c) | 0, (0xa54ff53a + d) | 0];
    let ceros = 0;
    for (let i = 0; i < 4; i++) {
      if (H[i] === 0) {
        ceros += 32;
        continue;
      }
      ceros += Math.clz32(H[i]);
      break;
    }
    if (ceros >= dif) return n;
  }
  return -1;
}

/** Tope de números a probar: 2^(dif+8), 256 veces lo esperado. */
const topeTrabajo = (dif: number) => 2 ** Math.min(32, dif + 8);

/** Resuelve en un Worker creado desde un Blob; si no se puede, en el hilo principal por tandas. */
function resolver(sal: string, dif: number, senal: AbortSignal): Promise<number> {
  const tope = topeTrabajo(dif);
  const enHilo = () =>
    new Promise<number>((ok, mal) => {
      let desde = 0;
      const tanda = () => {
        if (senal.aborted) return mal(new Error("cancelado"));
        const n = buscarTrabajo(sal, dif, desde, Math.min(tope, desde + 20_000));
        if (n >= 0) return ok(n);
        desde += 20_000;
        if (desde >= tope) return mal(new Error("sin solución"));
        setTimeout(tanda, 0);
      };
      tanda();
    });

  return new Promise<number>((ok, mal) => {
    let w: Worker | null = null;
    let url = "";
    const cerrar = () => {
      w?.terminate();
      w = null;
      if (url) URL.revokeObjectURL(url);
      url = "";
    };
    const alHilo = () => {
      cerrar();
      enHilo().then(ok, mal);
    };
    try {
      const fuente = `var buscar=${buscarTrabajo.toString()};onmessage=function(ev){var d=ev.data;postMessage({n:buscar(d.sal,d.dificultad,0,d.tope)});};`;
      url = URL.createObjectURL(new Blob([fuente], { type: "text/javascript" }));
      w = new Worker(url);
    } catch {
      return alHilo();
    }
    senal.addEventListener("abort", () => {
      cerrar();
      mal(new Error("cancelado"));
    });
    w.onmessage = (ev: MessageEvent<{ n: number }>) => {
      cerrar();
      if (ev.data.n >= 0) ok(ev.data.n);
      else mal(new Error("sin solución"));
    };
    // Si la política de contenidos (CSP) bloquea los Worker desde un Blob, llega acá.
    w.onerror = (ev) => {
      ev.preventDefault?.();
      alHilo();
    };
    w.postMessage({ sal, dificultad: dif, tope });
  });
}

let cargaTurnstile: Promise<Turnstile> | null = null;

/** Carga el script de Turnstile una sola vez (si falla, se puede reintentar). */
function cargarTurnstile(): Promise<Turnstile> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  cargaTurnstile ??= new Promise<Turnstile>((ok, mal) => {
    const s = document.createElement("script");
    s.src = SCRIPT_TURNSTILE;
    s.async = true;
    const plazo = setTimeout(() => mal(new Error("tiempo")), 10_000);
    s.onload = () => {
      clearTimeout(plazo);
      if (window.turnstile) ok(window.turnstile);
      else mal(new Error("sin turnstile"));
    };
    s.onerror = () => {
      clearTimeout(plazo);
      s.remove();
      mal(new Error("no cargó"));
    };
    document.head.appendChild(s);
  }).catch((e) => {
    cargaTurnstile = null;
    throw e;
  });
  return cargaTurnstile;
}

const MENSAJES: Record<Fase, string> = {
  inicial: "",
  cargando: "Un momento…",
  trabajando: "Verificando, es un momento…",
  turnstile: "Seguí la verificación de abajo.",
  listo: "Listo. Ya podés enviar.",
  error: "No se pudo verificar. Tocá de nuevo para reintentar.",
};

export default function Desafio({
  nombre = "jb_desafio",
  reinicio,
  texto = "Confirmá que sos una persona",
  alResolver,
  alCambiarFase,
}: {
  /** Nombre del campo oculto (el servidor lee «jb_desafio»). */
  nombre?: string;
  /** Al cambiar, vuelve a empezar (cada token sirve para un solo envío). */
  reinicio?: unknown;
  texto?: string;
  alResolver?: (token: string) => void;
  /** Avisa cada cambio de fase (el formulario deshabilita «Enviar» mientras se verifica). */
  alCambiarFase?: (fase: Fase) => void;
}) {
  const id = useId();
  const [fase, setFase] = useState<Fase>("inicial");
  const [token, setToken] = useState("");
  const [aviso, setAviso] = useState("");
  const cajaTs = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const corte = useRef<AbortController | null>(null);
  const vence = useRef<ReturnType<typeof setTimeout> | null>(null);
  const primero = useRef(true);
  const avisarFase = useRef(alCambiarFase);
  avisarFase.current = alCambiarFase;
  useEffect(() => {
    avisarFase.current?.(fase);
  }, [fase]);
  // al desmontarse (la acción ya no pide verificación), el formulario vuelve a quedar libre
  useEffect(() => () => avisarFase.current?.("inicial"), []);

  const limpiar = useCallback(() => {
    corte.current?.abort();
    corte.current = null;
    if (vence.current) clearTimeout(vence.current);
    vence.current = null;
    if (widget.current && window.turnstile) {
      try {
        window.turnstile.remove(widget.current);
      } catch {
        /* ya no estaba */
      }
    }
    widget.current = null;
  }, []);

  const reiniciar = useCallback(
    (mensaje = "") => {
      limpiar();
      setToken("");
      setFase("inicial");
      setAviso(mensaje);
    },
    [limpiar],
  );

  // Cada envío consume el token: al cambiar `reinicio`, se empieza de nuevo.
  useEffect(() => {
    if (primero.current) {
      primero.current = false;
      return;
    }
    reiniciar();
  }, [reinicio, reiniciar]);

  useEffect(() => limpiar, [limpiar]);

  const terminar = useCallback(
    (t: string, venceEn: number) => {
      setToken(t);
      setFase("listo");
      setAviso("");
      alResolver?.(t);
      if (vence.current) clearTimeout(vence.current);
      vence.current = setTimeout(() => reiniciar("La verificación venció. Tocá de nuevo la casilla."), Math.max(5_000, venceEn));
    },
    [alResolver, reiniciar],
  );

  async function pedir(modo?: "trabajo"): Promise<DesafioCliente | null> {
    const r = await fetch(`/api/desafio${modo ? "?modo=trabajo" : ""}`, { cache: "no-store" });
    if (r.status === 429) {
      const d = (await r.json().catch(() => ({}))) as { error?: string };
      setFase("error");
      setAviso(d.error ?? "Hubo muchos intentos seguidos. Probá de nuevo en unos minutos.");
      return null;
    }
    if (!r.ok) throw new Error(String(r.status));
    return (await r.json()) as DesafioCliente;
  }

  async function porTrabajo(d: Extract<DesafioCliente, { modo: "trabajo" }>, senal: AbortSignal) {
    setFase("trabajando");
    const n = await resolver(d.sal, d.dificultad, senal);
    if (senal.aborted) return;
    terminar(`pt.${d.sal}.${d.dificultad}.${d.exp}.${d.firma}.${n}`, d.exp - Date.now() - 15_000);
  }

  async function empezar() {
    if (fase === "cargando" || fase === "trabajando" || fase === "turnstile" || fase === "listo") return;
    limpiar();
    const c = new AbortController();
    corte.current = c;
    setAviso("");
    setFase("cargando");
    try {
      const d = await pedir();
      if (!d || c.signal.aborted) return;
      if (d.modo === "trabajo") return await porTrabajo(d, c.signal);

      let ts: Turnstile;
      try {
        ts = await cargarTurnstile();
      } catch {
        // No cargó el script de Cloudflare: se pide la prueba de trabajo (solo se concede si Cloudflare está caído).
        const otro = await pedir("trabajo");
        if (!otro || c.signal.aborted) return;
        if (otro.modo === "trabajo") return await porTrabajo(otro, c.signal);
        setFase("error");
        setAviso("No se pudo cargar la verificación. Revisá la conexión y tocá de nuevo.");
        return;
      }
      if (c.signal.aborted || !cajaTs.current) return;
      setFase("turnstile");
      widget.current = ts.render(cajaTs.current, {
        sitekey: d.siteKey,
        theme: "dark",
        // «flexible» pide 300 px como mínimo: en un celular angosto (o dentro de Yo Da) va el compacto
        size: cajaTs.current.clientWidth < 300 ? "compact" : "flexible",
        language: "es",
        appearance: "always",
        "response-field": false,
        callback: (t: string) => terminar(`ts.${t}`, 290_000),
        "expired-callback": () => reiniciar("La verificación venció. Tocá de nuevo la casilla."),
        "timeout-callback": () => reiniciar("La verificación venció. Tocá de nuevo la casilla."),
        "error-callback": () => {
          limpiar();
          setFase("error");
          setAviso(MENSAJES.error);
          return true;
        },
      });
    } catch {
      if (c.signal.aborted) return;
      limpiar();
      setFase("error");
      setAviso(MENSAJES.error);
    }
  }

  const ocupado = fase === "cargando" || fase === "trabajando";
  const listo = fase === "listo";
  const mensaje = aviso || MENSAJES[fase];

  return (
    <div className="border borde p-3 sm:p-4 w-full max-w-sm min-w-0" data-testid="desafio" data-fase={fase}>
      <button
        type="button"
        role="checkbox"
        aria-checked={listo}
        aria-busy={ocupado}
        aria-describedby={`${id}-estado`}
        aria-disabled={listo || ocupado || fase === "turnstile" ? true : undefined}
        onClick={empezar}
        className="flex w-full min-w-0 items-center gap-3 text-left"
        style={{ cursor: listo ? "default" : ocupado ? "progress" : "pointer" }}
        data-testid="desafio-casilla"
      >
        <span
          aria-hidden="true"
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center border"
          style={{ borderColor: "currentColor" }}
        >
          {listo ? (
            <span style={{ lineHeight: 1 }}>✓</span>
          ) : ocupado ? (
            <span className="block h-2 w-2 rounded-full animate-pulse motion-reduce:animate-none" style={{ background: "currentColor" }} />
          ) : null}
        </span>
        <span className="min-w-0 break-words">{texto}</span>
      </button>
      {/* Siempre montada (Turnstile no se dibuja bien en algo oculto); vacía no ocupa lugar. */}
      <div ref={cajaTs} className="mt-3 w-full max-w-full overflow-visible empty:hidden" />
      <p id={`${id}-estado`} role="status" aria-live="polite" className="texto-2 text-sm mt-2 min-h-[1.25rem]">
        {mensaje}
      </p>
      {token && <input type="hidden" name={nombre} value={token} data-testid="desafio-token" />}
    </div>
  );
}
