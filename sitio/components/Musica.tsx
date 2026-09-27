"use client";
import { useEffect, useRef, useState } from "react";
import { playlist, temas } from "@/content/musica";
import { EVENTO_TEMA, esEscritorio, ficha, navegador, type Navegador, type TemaSonando } from "@/lib/musica";

/**
 * Música de fondo: temas al azar de la playlist de Julián, con el reproductor
 * oficial de Spotify (la única forma legal de pasar su música en el sitio).
 * Nada suena hasta que la persona lo pide. El volumen lo maneja cada uno
 * desde su dispositivo: el reproductor de Spotify no deja cambiarlo desde
 * afuera. Con la sesión de Spotify en ESTE navegador (gratis o Premium) los
 * temas suenan enteros; sin ella, 30 segundos de cada uno. La app de la
 * computadora o del teléfono no le presta su sesión a una página: para eso
 * está «Escuchar en tu app».
 * Al pasar de página la música sigue (el reproductor vive en el layout).
 * Cada tema nuevo se avisa (lib/musica.ts), así Yo Da lo puede comentar.
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

/** Si en este tiempo el reproductor de Spotify no avisó que está listo, se da por fallado. */
const PLAZO_SPOTIFY_MS = 12_000;
let cargaSpotify: Promise<IFrameAPI> | null = null;

/**
 * Carga la API del reproductor de Spotify una sola vez. Con un plazo: si no llega
 * (sin red, un bloqueador, la política de contenidos), la promesa se rechaza y el
 * botón pasa a «error» en lugar de quedar en «Cargando…» para siempre. Si falla, se
 * puede volver a intentar.
 */
function cargarAPI(): Promise<IFrameAPI> {
  if (window.__jbSpotify) return Promise.resolve(window.__jbSpotify);
  cargaSpotify ??= new Promise<IFrameAPI>((ok, mal) => {
    const plazo = setTimeout(() => mal(new Error("Spotify no respondió a tiempo")), PLAZO_SPOTIFY_MS);
    window.onSpotifyIframeApiReady = (api) => {
      clearTimeout(plazo);
      window.__jbSpotify = api;
      ok(api);
    };
    const s = document.createElement("script");
    s.src = "https://open.spotify.com/embed/iframe-api/v1";
    s.async = true;
    s.onerror = () => {
      clearTimeout(plazo);
      s.remove();
      mal(new Error("sin conexión con Spotify"));
    };
    document.body.appendChild(s);
  }).catch((e) => {
    cargaSpotify = null;
    throw e;
  });
  return cargaSpotify;
}

export { abrirMusica } from "@/lib/musica";

const PLAYLIST_WEB = `https://open.spotify.com/playlist/${playlist}`;

/** Por qué da fragmentos y qué hacer, según el navegador. */
const AYUDA: Record<Navegador, string> = {
  ios: "En el iPhone y el iPad, ningún navegador deja que Spotify reconozca tu sesión dentro de otra página: acá suenan fragmentos sí o sí. Entera, en tu app.",
  safari: "Safari no deja que Spotify reconozca tu sesión dentro de otras páginas: acá suenan fragmentos. Entera, en tu app (o con Chrome, Edge o Firefox y tu sesión iniciada).",
  firefox: "Firefox a veces le esconde tu sesión a Spotify dentro de otras páginas. Iniciá sesión y, si siguen los fragmentos, desactivá la protección contra rastreo para este sitio (el escudo, al lado de la dirección), o escuchala en tu app.",
  brave: "Brave le esconde tu sesión a Spotify dentro de otras páginas. Iniciá sesión y bajá los escudos para este sitio (el león, al lado de la dirección), o escuchala en tu app.",
  otro: "Iniciá sesión en Spotify en este navegador (gratis o Premium, da igual) y, al volver, pruebo de nuevo sola. En modo incógnito, o con las cookies de terceros bloqueadas, siguen los fragmentos: ahí, mejor en tu app.",
};

export default function Musica() {
  const [abierta, setAbierta] = useState(false);
  const [estado, setEstado] = useState<"quieta" | "cargando" | "sonando" | "pausa" | "error">("quieta");
  // Spotify pasa fragmentos de 30 s cuando no reconoce la sesión EN ESTE NAVEGADOR
  // (la app de la computadora o del celular no cuenta, y muchos navegadores no le dejan
  // leer su sesión dentro de otra página). Si pasa, se ofrece iniciar sesión o abrir la app.
  const [fragmentos, setFragmentos] = useState(false);
  const lugar = useRef<HTMLDivElement>(null);
  const control = useRef<Control | null>(null);
  const actual = useRef<string>("");
  const ultimo = useRef({ pos: 0, dur: 0 });
  const anunciado = useRef("");
  const esperandoSesion = useRef(false);
  const [nav, setNav] = useState<Navegador>("otro");
  const [probando, setProbando] = useState(false);
  const [noAbrio, setNoAbrio] = useState(false);
  const estadoRef = useRef(estado);
  estadoRef.current = estado;
  // las funciones de adentro cambian en cada render: los eventos usan siempre la última
  const accionesRef = useRef({ empezar: () => {}, siguiente: () => {}, recargar: () => {} });

  useEffect(() => {
    setNav(navegador());
    const abrir = () => setAbierta(true);
    // cuando se silencia el sitio (desde Yo Da), la música también se detiene
    const pausar = () => control.current?.pause();
    // desde Yo Da: «poné música», «otro tema»
    const poner = () => {
      setAbierta(true);
      if (estadoRef.current !== "sonando" && estadoRef.current !== "cargando") accionesRef.current.empezar();
    };
    const pasar = () => (control.current ? accionesRef.current.siguiente() : poner());
    // al volver de iniciar sesión en Spotify, se prueba de nuevo sola
    const volver = () => {
      if (!esperandoSesion.current || document.visibilityState !== "visible") return;
      esperandoSesion.current = false;
      setProbando(true);
      window.setTimeout(() => {
        setProbando(false);
        accionesRef.current.recargar();
      }, 700);
    };
    window.addEventListener("jb:musica", abrir);
    window.addEventListener("jb:musica-pausa", pausar);
    window.addEventListener("jb:musica-poner", poner);
    window.addEventListener("jb:musica-siguiente", pasar);
    window.addEventListener("focus", volver);
    document.addEventListener("visibilitychange", volver);
    return () => {
      window.removeEventListener("jb:musica", abrir);
      window.removeEventListener("jb:musica-pausa", pausar);
      window.removeEventListener("jb:musica-poner", poner);
      window.removeEventListener("jb:musica-siguiente", pasar);
      window.removeEventListener("focus", volver);
      document.removeEventListener("visibilitychange", volver);
    };
  }, []);

  const siguiente = () => {
    const c = control.current;
    if (!c) return;
    actual.current = alAzar(actual.current);
    ultimo.current = { pos: 0, dur: 0 };
    c.loadUri(`spotify:track:${actual.current}`);
    c.play();
  };

  /** Vuelve a armar el reproductor (después de iniciar sesión en Spotify en este navegador). */
  function recargar() {
    control.current?.destroy();
    control.current = null;
    setFragmentos(false);
    setEstado("quieta");
    empezar();
  }

  function iniciarSesion() {
    esperandoSesion.current = true;
    window.open("https://accounts.spotify.com/es/login?continue=https%3A%2F%2Fopen.spotify.com%2F", "spotify-login", "width=480,height=720,noopener");
  }

  /** En la computadora abre la app de escritorio («spotify:»); en el teléfono, el enlace abre la app solo. */
  function abrirEnApp(e: React.MouseEvent) {
    control.current?.pause();
    if (!esEscritorio()) return;
    e.preventDefault();
    let seFue = false;
    const irse = () => (seFue = true);
    window.addEventListener("blur", irse, { once: true });
    window.location.href = `spotify:playlist:${playlist}`;
    window.setTimeout(() => {
      window.removeEventListener("blur", irse);
      if (!seFue && document.visibilityState === "visible") setNoAbrio(true);
    }, 1600);
  }

  /** Deja a mano cuál suena y avisa el tema nuevo (una vez por tema). */
  function contar(sonando: boolean, duracion: number) {
    const id = actual.current;
    if (!id) return;
    const t: TemaSonando = { id, ...ficha(id), sonando, fragmento: duracion > 0 && duracion <= 31000 };
    window.__jbTema = t;
    if (sonando && duracion > 0 && anunciado.current !== id) {
      anunciado.current = id;
      window.dispatchEvent(new CustomEvent<TemaSonando>(EVENTO_TEMA, { detail: t }));
    }
  }

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
          if (duration > 0) setFragmentos(duration <= 31000);
          contar(!isPaused, duration);
          // terminó el tema (o el fragmento de 30 s): otro al azar
          if (isPaused && ultimo.current.dur > 0 && ultimo.current.pos >= ultimo.current.dur - 1500) siguiente();
          else ultimo.current = { pos: position, dur: duration };
        });
      });
    } catch {
      setEstado("error");
    }
  }

  accionesRef.current = { empezar, siguiente, recargar };
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
        data-recorrido="musica"
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
        {fragmentos && (
          <div className="mt-3 border-t borde pt-3 text-sm" data-testid="musica-fragmentos">
            <p className="leading-snug">
              Suenan fragmentos de 30 segundos: Spotify no reconoce tu sesión <em>en este navegador</em>.
            </p>
            <p className="texto-2 text-xs mt-2 leading-relaxed" data-testid="musica-ayuda">
              {AYUDA[nav]}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {nav !== "ios" && nav !== "safari" && (
                <button type="button" className="boton py-1 px-3 text-sm" onClick={iniciarSesion} data-testid="musica-sesion">
                  Iniciar sesión en Spotify
                </button>
              )}
              <a href={PLAYLIST_WEB} target="_blank" rel="noopener noreferrer" className="boton py-1 px-3 text-sm" onClick={abrirEnApp} data-testid="musica-app">
                Escuchar en tu app
              </a>
              {nav !== "ios" && nav !== "safari" && (
                <button type="button" className="enlace texto-2 text-sm" onClick={recargar}>
                  {probando ? "Probando…" : "Probar de nuevo"}
                </button>
              )}
            </div>
          </div>
        )}
        {noAbrio && (
          <p className="texto-2 text-xs mt-2 leading-relaxed" role="status">
            ¿No se abrió la app?{" "}
            <a href={PLAYLIST_WEB} target="_blank" rel="noopener noreferrer" className="enlace">
              Abrila en la web de Spotify
            </a>
            .
          </p>
        )}
        {estado === "error" ? (
          <p className="texto-2 text-xs mt-3">No se pudo conectar con Spotify. Probá de nuevo en un rato.</p>
        ) : (
          <p className="texto-2 text-xs mt-3 leading-relaxed">
            El volumen, desde tu dispositivo. Con tu sesión de Spotify en este navegador (gratis o Premium), los temas suenan enteros; si no, 30
            segundos de cada uno.
            {!fragmentos && (
              <>
                {" "}
                <a href={PLAYLIST_WEB} target="_blank" rel="noopener noreferrer" className="enlace" onClick={abrirEnApp} data-testid="musica-app-siempre">
                  ¿Preferís tu app?
                </a>
              </>
            )}
          </p>
        )}
      </div>
    </>
  );
}
