"use client";
import { useEffect, useRef, useState } from "react";
import { temas } from "@/content/musica";

/**
 * Música de fondo: temas al azar de la playlist de Julián, con el reproductor
 * oficial de Spotify (la única forma legal de pasar su música en el sitio).
 * Nada suena hasta que la persona lo pide. El volumen lo maneja cada uno
 * desde su dispositivo: el reproductor de Spotify no deja cambiarlo desde
 * afuera. Sin sesión en Spotify, suenan 30 segundos de cada tema.
 * Al pasar de página la música sigue (el reproductor vive en el layout).
 */
type Control = {
  loadUri: (uri: string) => void;
  play: () => void;
  togglePlay: () => void;
  pause: () => void;
  destroy: () => void;
  addListener: (ev: string, cb: (e: { data: { isPaused: boolean; position: number; duration: number } }) => void) => void;
};
type IFrameAPI = { createController: (el: HTMLElement, o: { uri: string; width: string; height: number }, cb: (c: Control) => void) => void };
declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: IFrameAPI) => void;
    __jbSpotify?: IFrameAPI;
  }
}

const alAzar = (menos?: string) => {
  let t = temas[Math.floor(Math.random() * temas.length)];
  if (t === menos && temas.length > 1) t = temas[(temas.indexOf(t) + 1) % temas.length];
  return t;
};

function cargarAPI(): Promise<IFrameAPI> {
  if (window.__jbSpotify) return Promise.resolve(window.__jbSpotify);
  return new Promise((ok, mal) => {
    window.onSpotifyIframeApiReady = (api) => {
      window.__jbSpotify = api;
      ok(api);
    };
    const s = document.createElement("script");
    s.src = "https://open.spotify.com/embed/iframe-api/v1";
    s.async = true;
    s.onerror = () => mal(new Error("sin conexión con Spotify"));
    document.body.appendChild(s);
  });
}

export const abrirMusica = () => window.dispatchEvent(new Event("jb:musica"));

export default function Musica() {
  const [abierta, setAbierta] = useState(false);
  const [estado, setEstado] = useState<"quieta" | "cargando" | "sonando" | "pausa" | "error">("quieta");
  const lugar = useRef<HTMLDivElement>(null);
  const control = useRef<Control | null>(null);
  const actual = useRef<string>("");
  const ultimo = useRef({ pos: 0, dur: 0 });

  useEffect(() => {
    const abrir = () => setAbierta(true);
    window.addEventListener("jb:musica", abrir);
    return () => window.removeEventListener("jb:musica", abrir);
  }, []);

  const siguiente = () => {
    const c = control.current;
    if (!c) return;
    actual.current = alAzar(actual.current);
    ultimo.current = { pos: 0, dur: 0 };
    c.loadUri(`spotify:track:${actual.current}`);
    c.play();
  };

  async function empezar() {
    if (control.current) {
      control.current.togglePlay();
      return;
    }
    setEstado("cargando");
    try {
      const api = await cargarAPI();
      const el = document.createElement("div");
      lugar.current?.replaceChildren(el);
      actual.current = alAzar();
      api.createController(el, { uri: `spotify:track:${actual.current}`, width: "100%", height: 80 }, (c) => {
        control.current = c;
        c.addListener("ready", () => c.play());
        c.addListener("playback_update", (e) => {
          const { isPaused, position, duration } = e.data;
          setEstado(isPaused ? "pausa" : "sonando");
          // terminó el tema (o el fragmento de 30 s): otro al azar
          if (isPaused && ultimo.current.dur > 0 && ultimo.current.pos >= ultimo.current.dur - 1500) siguiente();
          else ultimo.current = { pos: position, dur: duration };
        });
      });
    } catch {
      setEstado("error");
    }
  }

  const sonando = estado === "sonando";
  return (
    <>
      <button
        type="button"
        className={`musica-boton ${sonando ? "sonando" : ""}`}
        onClick={() => setAbierta((a) => !a)}
        aria-expanded={abierta}
        aria-controls="musica-panel"
        aria-label={sonando ? "Música de fondo: sonando" : "Música de fondo"}
        data-testid="musica-boton"
        data-sonido="toque"
      >
        <span className="musica-ondas" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </button>
      {/* cerrado queda invisible pero no se desarma: así la música sigue sonando */}
      <div id="musica-panel" className={`musica-panel ${abierta ? "abierta" : ""}`} role="region" aria-label="Música de fondo" data-testid="musica-panel" aria-hidden={!abierta} inert={!abierta}>
        <p className="firma texto-2 text-xs">música de fondo</p>
        <p className="mt-1 text-[0.98rem] leading-snug">Temas al azar de la playlist de Julián en Spotify.</p>
        <div ref={lugar} className="musica-reproductor mt-3" />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" className="boton py-1 px-3 text-sm" onClick={empezar} data-testid="musica-play">
            {estado === "cargando" ? "Cargando…" : sonando ? "Pausa" : control.current ? "Seguir" : "Escuchar"}
          </button>
          {control.current && (
            <button type="button" className="boton py-1 px-3 text-sm" onClick={siguiente}>
              Otro tema
            </button>
          )}
          <button type="button" className="enlace texto-2 text-sm ml-auto" onClick={() => setAbierta(false)}>
            Cerrar
          </button>
        </div>
        {estado === "error" ? (
          <p className="texto-2 text-xs mt-3">No se pudo conectar con Spotify. Probá de nuevo en un rato.</p>
        ) : (
          <p className="texto-2 text-xs mt-3 leading-relaxed">
            El volumen, desde tu dispositivo. Si no tenés sesión abierta en Spotify, suenan 30 segundos de cada tema.
          </p>
        )}
      </div>
    </>
  );
}
