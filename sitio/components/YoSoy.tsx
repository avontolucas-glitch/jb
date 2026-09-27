"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import OjoPixel from "./OjoPixel";
import TicketYoDa from "./TicketYoDa";
import Tipeo from "./Tipeo";
import Hora from "./Hora";
import { abrirMusica } from "./Musica";
import { instalar } from "@/lib/instalar";
import { empezarRecorrido, recorridoVisto } from "@/lib/recorrido";
import { EVENTO_ATRAPAR_FIN, VUELTAS_MAX, empezarAtrapar, vueltasJugadas, type Resultado } from "@/lib/atrapar";
import { EVENTO_ESTADO, EVENTO_TEMA, otroTema, pausarMusica, ponerMusica, temaActual, type TemaSonando } from "@/lib/musica";
import { comentarTema, queSuena } from "@/content/yoda-musica";
import { activarSonido, sonidoActivo } from "@/lib/sonido";
import { cosquillas, despacio, interpretar, ESFUERZO_TICKET, horariosEnPausa, pausaAviso, pausaCuenta, pausaFin, ritmo, ofrecerTicket, ticketSinCuenta, invitacionQuieto, nombreBot, ofrecerRecorrido, nombreDicho, noEntendi, pedirCuenta, puertasCuenta, respuestaDe, resultadoAtrapar, saludo, saludoCon, saludoHora, temas, type Accion, type Interpretacion, type Tema } from "@/content/yosoy";
import { cargarRegiones, regionDelDispositivo } from "@/content/yoda-habla";
import { contextoEn, queHora, saludoConHora } from "@/content/yoda-hora";
import { extraDelDia, queTiempo, type Clima } from "@/content/yoda-estacion";
import { desfase } from "@/lib/zona";

type Mensaje = { de: "yo" | "vos"; texto: string; acciones?: Accion[]; chips?: boolean; sugerencias?: string[] };
type Libre = { id: string; inicio: string };

const chips = temas.filter((t) => t.chip);

/** Apagar o prender el sonido del sitio (al apagar, también se pausa la música). */
function useSonido(): [boolean, () => void] {
  const [si, setSi] = useState(true);
  useEffect(() => {
    const leer = () => setSi(sonidoActivo());
    leer();
    window.addEventListener("jb-sonido", leer);
    return () => window.removeEventListener("jb-sonido", leer);
  }, []);
  const cambiar = () => {
    const nuevo = !sonidoActivo();
    activarSonido(nuevo);
    if (!nuevo) window.dispatchEvent(new Event("jb:musica-pausa"));
  };
  return [si, cambiar];
}

function Altavoz({ si }: { si: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M4 9h4l5-4v14l-5-4H4z" />
      {si ? <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" /> : <path d="M17 9l5 6M22 9l-5 6" />}
    </svg>
  );
}

function BotonSonido() {
  const [si, cambiar] = useSonido();
  return (
    <button type="button" className="yosoy-accion inline-flex items-center gap-2" onClick={cambiar} aria-pressed={!si} data-testid="yosoy-sonido">
      <Altavoz si={si} />
      {si ? "Silenciar el sitio" : "Activar el sonido"}
    </button>
  );
}

/** Yo Da habla en voz alta (voz grave y pausada), si el navegador puede y el sonido está prendido. */
function hablar(texto: string): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !sonidoActivo()) return false;
  const v = new SpeechSynthesisUtterance(texto.replace(/Hmm\.?/g, "Mmm."));
  v.lang = "es-AR";
  const voces = window.speechSynthesis.getVoices();
  const es = voces.find((x) => x.lang?.startsWith("es-AR")) ?? voces.find((x) => x.lang?.startsWith("es"));
  if (es) v.voice = es;
  v.pitch = 0.55;
  v.rate = 0.88;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(v);
  return true;
}

const NOMBRE = "jb-yoda-nombre";
const nombreGuardado = () => {
  try {
    return localStorage.getItem(NOMBRE);
  } catch {
    return null;
  }
};

/** Cuántas veces se jugó en esta visita (para que el juego tenga un límite). */
function contarVisita(clave: string, sumar = false): number {
  try {
    const n = Number(sessionStorage.getItem(clave) || 0) + (sumar ? 1 : 0);
    if (sumar) sessionStorage.setItem(clave, String(n));
    return n;
  } catch {
    return 0;
  }
}
const PARTIDAS_MAX = 3; // partidas de piedra, papel o tijera por visita
const TIRADAS_MAX = 10; // tiradas de moneda por visita

/**
 * Lo que Yo Da cree que vas a jugar (0 piedra, 1 papel, 2 tijera), leyendo tus jugadas:
 * lo que más jugás (lo último pesa más), lo que solés jugar después de tu última jugada,
 * y dos costumbres de todos: el que gana repite, y el que pierde se pasa a lo que le
 * habría ganado a Yo Da. Sin datos todavía, null.
 */
function predecir(tuyas: number[], mias: number[], resultados: number[]): number | null {
  if (tuyas.length < 2) return null;
  const peso = [0, 0, 0];
  tuyas.forEach((m, i) => (peso[m] += 0.4 + i / tuyas.length));
  const ultima = tuyas[tuyas.length - 1];
  for (let i = 0; i < tuyas.length - 1; i++) if (tuyas[i] === ultima) peso[tuyas[i + 1]] += 2;
  const r = resultados[resultados.length - 1];
  if (r === 1) peso[ultima] += 1.6; // ganó: repite
  if (r === 2) peso[(mias[mias.length - 1] + 1) % 3] += 1.4; // perdió: va a lo que le ganaba a Yo Da
  if (r === 0) peso[(ultima + 1) % 3] += 0.8; // empate: suele cambiar
  const max = Math.max(...peso);
  const mejores = [0, 1, 2].filter((i) => peso[i] === max);
  return mejores[Math.floor(Math.random() * mejores.length)];
}

/**
 * Piedra, papel o tijera: a 5 o a 10 puntos (el que llega primero gana; los empates no suman); hasta 3 partidas por visita.
 * Difícil: Yo Da aprende tus costumbres en la partida y juega a ganarles (casi siempre; algo de azar le queda).
 */
function Ppt({ alDejar }: { alDejar?: () => void }) {
  const OPC = ["Piedra", "Papel", "Tijera"] as const;
  const [meta, setMeta] = useState<5 | 10 | null>(null);
  const [cuenta, setCuenta] = useState({ vos: 0, yo: 0, jugadas: 0 });
  const [ultima, setUltima] = useState<string | null>(null);
  const [agotado, setAgotado] = useState(false);
  const [dejado, setDejado] = useState(false);
  const historia = useRef<{ tuyas: number[]; mias: number[]; resultados: number[] }>({ tuyas: [], mias: [], resultados: [] });
  const resultado = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setAgotado(contarVisita("jb-yoda-partidas") >= PARTIDAS_MAX);
  }, []);
  useEffect(() => {
    if (ultima) resultado.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [ultima, cuenta]);

  const empezar = (n: 5 | 10) => {
    if (contarVisita("jb-yoda-partidas") >= PARTIDAS_MAX) return setAgotado(true);
    contarVisita("jb-yoda-partidas", true);
    setMeta(n);
    setCuenta({ vos: 0, yo: 0, jugadas: 0 });
    setUltima(null);
    historia.current = { tuyas: [], mias: [], resultados: [] };
  };
  const terminada = meta !== null && (cuenta.vos >= meta || cuenta.yo >= meta);

  const jugar = (i: number) => {
    if (!meta || terminada) return;
    // Yo Da lee tus costumbres y juega a ganarle a lo que cree que vas a jugar (con algo de azar: invencible no es)
    const h = historia.current;
    const prevista = predecir(h.tuyas, h.mias, h.resultados);
    const confianza = Math.min(meta === 10 ? 0.82 : 0.76, 0.5 + h.tuyas.length * 0.05);
    const leyo = prevista !== null && Math.random() < confianza;
    const mia = leyo ? (prevista + 1) % 3 : Math.floor(Math.random() * 3);
    const r = (i - mia + 3) % 3; // 0 empate, 1 gana la persona, 2 gana Yo Da
    h.tuyas.push(i);
    h.mias.push(mia);
    h.resultados.push(r);
    const frases = [
      [`${OPC[mia]} también. Empate. Pensamos igual, parece. Hmm.`, `Empate: ${OPC[mia].toLowerCase()} y ${OPC[mia].toLowerCase()}. Conectados estamos.`],
      [`${OPC[mia]} elegí… ganaste. Hmm. Suerte de principiante, será.`, `Ganaste. ${OPC[i]} le gana a ${OPC[mia].toLowerCase()}. Aprendiendo estoy.`],
      leyo
        ? [`${OPC[mia]}. ¡Gané! Hmm. Tu patrón, leí: el ojo, todo lo ve.`, `${OPC[mia]} le gana a ${OPC[i].toLowerCase()}. Predecible, un poco, sos. Hmm, hmm.`]
        : [`${OPC[mia]}. ¡Gané! Hmm, hmm. Ojo que todo lo ve, soy.`, `${OPC[mia]} le gana a ${OPC[i].toLowerCase()}. Perdón. Bueno, no tanto.`],
    ][r];
    setUltima(frases[Math.floor(Math.random() * 2)]);
    setCuenta((c) => ({ vos: c.vos + (r === 1 ? 1 : 0), yo: c.yo + (r === 2 ? 1 : 0), jugadas: c.jugadas + 1 }));
  };

  const final =
    cuenta.vos > cuenta.yo
      ? `¡Llegaste a ${meta}! Ganaste ${cuenta.vos} a ${cuenta.yo}. Hmm. Buen rival, sos.`
      : `A ${meta} llegué primero: gané ${cuenta.yo} a ${cuenta.vos}. Hmm, hmm. La revancha, otro día.`;

  if (dejado)
    return (
      <p className="italic w-full" data-testid="yosoy-ppt-dejado">
        Hmm. Cuando quieras, la revancha. Aquí, atento, te espero.
      </p>
    );

  if (agotado && !meta)
    return (
      <p className="italic w-full" data-testid="yosoy-ppt-agotado">
        Hmm. Suficiente juego por hoy. Descansar, el ojo necesita. Mañana, la revancha.
      </p>
    );

  if (!meta)
    return (
      <div className="w-full" data-testid="yosoy-ppt">
        <p className="texto-2 text-sm mb-1">¿A cuántos puntos? El que llega primero, gana.</p>
        <div className="yosoy-acciones">
          <button type="button" className="yosoy-accion" onClick={() => empezar(5)} data-sonido="toque">
            A 5
          </button>
          <button type="button" className="yosoy-accion" onClick={() => empezar(10)} data-sonido="toque">
            A 10
          </button>
        </div>
      </div>
    );

  return (
    <div className="w-full" data-testid="yosoy-ppt">
      {!terminada && (
        <div className="yosoy-acciones">
          {OPC.map((o, i) => (
            <button key={o} type="button" className="yosoy-accion" onClick={() => jugar(i)} data-sonido="toque">
              {o}
            </button>
          ))}
        </div>
      )}
      <div ref={resultado} aria-live="polite">
        {ultima && (
          <p className="mt-2 italic" data-testid="yosoy-ppt-resultado">
            {ultima}{" "}
            <span className="texto-2 not-italic text-sm">
              (vos {cuenta.vos} · Yo Da {cuenta.yo} · a {meta})
            </span>
          </p>
        )}
        {terminada && (
          <>
            <p className="mt-2" data-testid="yosoy-ppt-final">
              {final}
            </p>
            {contarVisita("jb-yoda-partidas") < PARTIDAS_MAX ? (
              <div className="yosoy-acciones">
                <button type="button" className="yosoy-accion" onClick={() => setMeta(null)} data-sonido="toque" data-testid="yosoy-ppt-otra">
                  Otra partida
                </button>
                <button
                  type="button"
                  className="yosoy-accion"
                  onClick={() => {
                    setDejado(true);
                    alDejar?.();
                  }}
                  data-testid="yosoy-ppt-dejar"
                >
                  Dejar de jugar
                </button>
              </div>
            ) : (
              <p className="italic mt-2 texto-2">Hmm. Suficiente juego por hoy. Descansar, el ojo necesita.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/** Cara o ceca, hasta 10 tiradas por visita. */
function Moneda() {
  const [lado, setLado] = useState<string | null>(null);
  const [girando, setGirando] = useState(false);
  const [cansada, setCansada] = useState(false);
  const caja = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setCansada(contarVisita("jb-yoda-tiradas") >= TIRADAS_MAX);
  }, []);
  useEffect(() => {
    if (lado) caja.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [lado]);
  const tirar = () => {
    if (contarVisita("jb-yoda-tiradas") >= TIRADAS_MAX) return setCansada(true);
    contarVisita("jb-yoda-tiradas", true);
    setGirando(true);
    setLado(null);
    window.setTimeout(() => {
      setGirando(false);
      setLado(Math.random() < 0.5 ? "Cara" : "Ceca");
    }, 900);
  };
  if (cansada && !lado && !girando)
    return (
      <p className="italic w-full" data-testid="yosoy-moneda-cansada">
        Hmm. La moneda, cansada está: diez vueltas ya dio. Decidir, ahora te toca a vos.
      </p>
    );
  return (
    <div ref={caja} className="w-full flex flex-wrap items-center gap-2 mt-1" data-testid="yosoy-moneda">
      <span className={`yosoy-moneda ${girando ? "girando" : ""}`} aria-hidden="true">
        {lado ? lado[0] : "¤"}
      </span>
      {!cansada && (
        <button type="button" className="yosoy-accion" onClick={tirar} disabled={girando} data-sonido="campana">
          {lado ? "Otra vez" : "Tirar la moneda"}
        </button>
      )}
      <span aria-live="polite" className="italic" data-testid="yosoy-moneda-resultado">
        {girando ? "Girando…" : lado ? `${lado}. ${lado === "Cara" ? "Hmm. La cara, el destino mostró." : "Ceca salió. Hmm. Así es."}` : ""}
      </span>
    </div>
  );
}

/** Los próximos horarios libres de la 1 a 1, en la hora de quien pregunta. */
function Horarios() {
  const [libres, setLibres] = useState<Libre[] | null>(null);
  // sin respuesta (429 si el sitio pide un respiro, o sin conexión): no es que no haya horarios
  const [sinRespuesta, setSinRespuesta] = useState(false);
  useEffect(() => {
    fetch("/api/horarios?n=3")
      .then(async (r) => {
        if (!r.ok) return setSinRespuesta(true);
        const d = (await r.json()) as { horarios?: Libre[] };
        setLibres(d.horarios ?? []);
      })
      .catch(() => setSinRespuesta(true));
  }, []);
  if (sinRespuesta)
    return (
      <p className="texto-2 text-sm" data-testid="yosoy-horarios-pausa">
        {horariosEnPausa}{" "}
        <Link href="/masterclass/1-a-1" className="enlace">
          Ver la agenda
        </Link>
      </p>
    );
  if (!libres) return <p className="texto-2 text-sm">Buscando horarios…</p>;
  if (!libres.length) return <p className="texto-2 text-sm">Por ahora no hay horarios libres. Julián carga nuevos cada semana.</p>;
  return (
    <ul className="yosoy-horarios" data-testid="yosoy-horarios">
      {libres.map((h) => (
        <li key={h.id}>
          <Link href={`/checkout/sesion-${h.id}`} className="yosoy-horario" data-testid={`yosoy-horario-${h.id}`}>
            <Hora inicio={h.inicio} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * Yo Da: el ojo que guía. Abajo a la derecha; al tocarlo se abre y
 * acompaña con opciones o con lo que la persona escriba. Es soporte del sitio,
 * no la voz de Julián (las respuestas están en content/yosoy.ts).
 */
export default function YoSoy() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([{ de: "yo", texto: saludo, chips: true, acciones: puertasCuenta }]);
  const [texto, setTexto] = useState("");
  const [pensando, setPensando] = useState(false);
  const [presente, setPresente] = useState(false);
  const [nube, setNube] = useState(false);
  const nombre = useRef<string | null>(null);
  const [conSesion, setConSesion] = useState<string | null>(null);
  const [sonidoSi, cambiarSonido] = useSonido();
  const [mira, setMira] = useState<-1 | 0 | 1>(0);
  const [hablando, setHablando] = useState(false);
  const [cosquilla, setCosquilla] = useState(false);
  const [nubeTexto, setNubeTexto] = useState("");
  const [nubeJuego, setNubeJuego] = useState(false);
  const [ofrecer, setOfrecer] = useState(false);
  const [nubeMusica, setNubeMusica] = useState(false);
  // la nube cuenta cómo salió «Atrapame» (con «Otra vez»)
  const [nubeAtrapar, setNubeAtrapar] = useState(false);
  const [zonaConexion, setZonaConexion] = useState<string | null>(null);
  const ultimaRespuesta = useRef<string>(saludo);
  // cuántas vueltas dio la persona sin resolver (para ofrecer, recién ahí, escribirle a una persona)
  const esfuerzo = useRef(0);
  const ultimoTema = useRef<string | null>(null);
  // de dónde es quien escribe (por cómo escribe; si no, por el dispositivo) y lo último que Yo Da ofreció
  const region = useRef<string | null>(null);
  const ofrecido = useRef<string[]>([]);
  useEffect(() => {
    try {
      region.current = sessionStorage.getItem("jb-yoda-region") || regionDelDispositivo();
    } catch {
      region.current = regionDelDispositivo();
    }
  }, []);
  // ritmo: fichas que se recargan de a una cada `ritmo.cadaMs` y los envíos del último minuto
  const fichas = useRef<{ n: number; t: number }>({ n: ritmo.rafaga, t: 0 });
  const envios = useRef<number[]>([]);
  const pausaHasta = useRef(0);
  const [pausa, setPausa] = useState(0);
  const [avisoPausa, setAvisoPausa] = useState("");
  const enPausa = pausa > 0;

  // la latitud aproximada (grados enteros: solo para la estación) y el tiempo que hace, de /api/yo
  const lugar = useRef<{ lat: number | null; clima: Clima | null }>({ lat: null, clima: null });
  // mientras suena la música, Yo Da asiente, escuchando con vos
  const [escuchando, setEscuchando] = useState(false);
  useEffect(() => {
    const oir = (e: Event) => setEscuchando(!!(e as CustomEvent<{ sonando: boolean }>).detail?.sonando);
    window.addEventListener(EVENTO_ESTADO, oir);
    return () => window.removeEventListener(EVENTO_ESTADO, oir);
  }, []);

  const quienEs = () =>
    fetch("/api/yo")
      // con 429 (o cualquier error) no se toca nada: sigue como estaba (sin sesión, si no se sabía)
      .then((r) => (r.ok ? (r.json() as Promise<{ nombre?: string | null; zonaConexion?: string | null; lat?: number | null; clima?: Clima | null }>) : null))
      .then((d) => {
        if (!d) return;
        setZonaConexion(d.zonaConexion ?? null);
        lugar.current = { lat: d.lat ?? null, clima: d.clima ?? null };
        nombre.current = d.nombre ?? null;
        setConSesion(d.nombre ?? null);
        const guardado = nombreGuardado();
        const inicial: Mensaje = d.nombre
          ? { de: "yo", texto: saludoCon(d.nombre), chips: true }
          : guardado
            ? { de: "yo", texto: `Hmm. De vuelta estás, ${guardado}. ${saludo.replace(/^Hmm\. Llegado has\. /, "")}`, chips: true, acciones: puertasCuenta }
            : { de: "yo", texto: saludo, chips: true, acciones: puertasCuenta };
        setMensajes((m) => (m.length === 1 ? [inicial] : m));
      })
      .catch(() => {});
  const lista = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLInputElement>(null);
  const boton = useRef<HTMLButtonElement>(null);

  // Yo Da se hace presente apenas se entra (después de la bienvenida) y habla solo, sin esperar un clic
  useEffect(() => {
    let t: number | undefined;
    let t2: number | undefined;
    const aparecer = () => {
      t = window.setTimeout(() => {
        setPresente(true);
        let visto = false;
        try {
          visto = !!sessionStorage.getItem("jb-yoda-nube");
          sessionStorage.setItem("jb-yoda-nube", "1");
        } catch {}
        if (!visto) {
          const nuevo = !recorridoVisto();
          setOfrecer(nuevo);
          setNubeJuego(false);
          setNubeMusica(false);
          setNubeTexto("");
          setNube(true);
          t2 = window.setTimeout(() => setNube(false), nuevo ? 30000 : 16000);
        }
      }, 700);
    };
    if (document.documentElement.classList.contains("en-umbral")) window.addEventListener("umbral:abierto", aparecer, { once: true });
    else aparecer();
    quienEs();
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(t2);
      window.removeEventListener("umbral:abierto", aparecer);
    };
  }, []);

  // al terminar «Atrapame», Yo Da cuenta cómo salió (y ofrece otra vuelta)
  useEffect(() => {
    let t: number | undefined;
    const alTerminar = (e: Event) => {
      const r = (e as CustomEvent<Resultado>).detail;
      setNubeJuego(false);
      setNubeMusica(false);
      setOfrecer(false);
      setNubeAtrapar(true);
      setNubeTexto(resultadoAtrapar(r, vueltasJugadas() >= VUELTAS_MAX));
      setNube(true);
      setHablando(true);
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        setNube(false);
        setHablando(false);
        setNubeAtrapar(false);
      }, 14000);
    };
    window.addEventListener(EVENTO_ATRAPAR_FIN, alTerminar);
    return () => {
      window.removeEventListener(EVENTO_ATRAPAR_FIN, alTerminar);
      window.clearTimeout(t);
    };
  }, []);

  // cuando empieza un tema, Yo Da lo comenta (sin pesar: el primero, los que tienen guiño, y cada tanto otro)
  const abiertoRef = useRef(abierto);
  abiertoRef.current = abierto;
  const nubeRef = useRef(nube);
  nubeRef.current = nube;
  const nubeMusicaRef = useRef(nubeMusica);
  nubeMusicaRef.current = nubeMusica;
  const musica = useRef({ ultimo: 0, temas: 0 });
  useEffect(() => {
    let t: number | undefined;
    const alEmpezar = (e: Event) => {
      const tema = (e as CustomEvent<TemaSonando>).detail;
      const m = musica.current;
      m.temas += 1;
      const { texto, especial } = comentarTema(tema);
      const ahora = Date.now();
      // si la persona pidió el tema («Otro tema»), lo comenta siempre: con el chat abierto, ahí; si no, en la nube
      const decir = tema.pedido || m.temas === 1 || (especial && ahora - m.ultimo > 90_000) || (m.temas % 3 === 0 && ahora - m.ultimo > 240_000);
      if (!decir || document.querySelector("[data-testid=recorrido], [data-testid=atrapar]")) return;
      if (abiertoRef.current) {
        if (tema.pedido) {
          m.ultimo = ahora;
          setMensajes((ms) => [...ms, { de: "yo", texto, acciones: [{ tipo: "musica-otro" }] }]);
        }
        return;
      }
      if (nubeRef.current && !(tema.pedido && nubeMusicaRef.current)) return;
      m.ultimo = ahora;
      setNubeJuego(false);
      setNubeAtrapar(false);
      setNubeMusica(true);
      setOfrecer(false);
      setNubeTexto(texto);
      setNube(true);
      setHablando(true);
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        setNube(false);
        setHablando(false);
      }, 11000);
    };
    window.addEventListener(EVENTO_TEMA, alEmpezar);
    return () => {
      window.removeEventListener(EVENTO_TEMA, alEmpezar);
      window.clearTimeout(t);
    };
  }, []);

  // la pupila sigue al puntero (o mira de reojo, cada tanto, en el celular)
  useEffect(() => {
    const fino = window.matchMedia("(pointer: fine)").matches;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!fino) {
      const t = window.setInterval(() => setMira(([-1, 0, 0, 1] as const)[Math.floor(Math.random() * 4)]), 3200);
      return () => window.clearInterval(t);
    }
    let raf = 0;
    const mover = (e: PointerEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = boton.current?.getBoundingClientRect();
        if (!r) return;
        const dx = e.clientX - (r.left + r.width / 2);
        setMira(dx < -90 ? -1 : dx > 90 ? 1 : 0);
      });
    };
    window.addEventListener("pointermove", mover, { passive: true });
    return () => {
      window.removeEventListener("pointermove", mover);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // si alguien se queda quieto un rato, Yo Da lo invita a jugar (una vez por visita)
  useEffect(() => {
    let t: number | undefined;
    const armar = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        try {
          if (sessionStorage.getItem("jb-yoda-quieto")) return;
          sessionStorage.setItem("jb-yoda-quieto", "1");
        } catch {}
        if (document.documentElement.classList.contains("en-umbral")) return;
        setNubeJuego(true);
        setNubeMusica(false);
        setNubeAtrapar(false);
        setNubeTexto(invitacionQuieto);
        setNube(true);
        window.setTimeout(() => setNube(false), 14000);
      }, 45000);
    };
    const eventos = ["pointermove", "keydown", "scroll", "touchstart"] as const;
    eventos.forEach((e) => window.addEventListener(e, armar, { passive: true }));
    armar();
    return () => {
      window.clearTimeout(t);
      eventos.forEach((e) => window.removeEventListener(e, armar));
    };
  }, []);

  // cada vez que Yo Da contesta, aletea un momento
  useEffect(() => {
    const ultimo = mensajes[mensajes.length - 1];
    if (mensajes.length < 2 || ultimo?.de !== "yo") return;
    ultimaRespuesta.current = ultimo.texto;
    setHablando(true);
    const t = window.setTimeout(() => setHablando(false), 1300);
    return () => window.clearTimeout(t);
  }, [mensajes]);

  useEffect(() => {
    if (!abierto) return;
    setNube(false);
    cargarRegiones();
    // cada vez que se abre, se fija si hay sesión (pudo haber ingresado recién)
    quienEs();
    // en computadora, listo para escribir; en el celular no, para que el teclado no tape las opciones
    if (window.matchMedia("(pointer: fine)").matches) campo.current?.focus({ preventScroll: true });
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAbierto(false);
        boton.current?.focus();
      }
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [abierto]);

  useEffect(() => {
    lista.current?.scrollTo({ top: lista.current.scrollHeight, behavior: "smooth" });
  }, [mensajes, pensando]);

  // la cuenta atrás de la pausa (con la hora de fin, así no se atrasa)
  useEffect(() => {
    if (!enPausa) return;
    const t = window.setTimeout(() => {
      const quedan = Math.max(0, Math.ceil((pausaHasta.current - Date.now()) / 1000));
      setPausa(quedan);
      if (quedan === 0) setAvisoPausa(pausaFin);
    }, 1000);
    return () => window.clearTimeout(t);
  }, [pausa, enPausa]);

  /**
   * ¿Puede mandar otro mensaje ya? Si le escriben demasiado seguido, Yo Da pide calma
   * y el campo queda en pausa unos segundos. Todo en el navegador: no cuesta nada.
   * `escrito`: lo que se escribe en el campo pasa por la ráfaga y por el tope por minuto;
   * los chips y las sugerencias, solo por la ráfaga (recorrer el menú no es spam).
   */
  const dejar = (escrito = true): boolean => {
    const ahora = Date.now();
    if (ahora < pausaHasta.current) return false;
    const f = fichas.current;
    f.n = Math.min(ritmo.rafaga, f.n + (ahora - f.t) / ritmo.cadaMs);
    f.t = ahora;
    envios.current = envios.current.filter((t) => ahora - t < 60_000);
    let espera = 0;
    if (escrito && envios.current.length >= ritmo.porMinuto) {
      const libera = Math.ceil((envios.current[0] + 60_000 - ahora) / 1000);
      espera = Math.min(ritmo.pausaMaxSeg, Math.max(ritmo.pausaSeg, libera));
    } else if (f.n < 1) espera = ritmo.pausaSeg;
    if (espera) {
      pausaHasta.current = ahora + espera * 1000;
      setPausa(espera);
      setAvisoPausa(pausaAviso(espera));
      setMensajes((m) => [...m, { de: "yo", texto: despacio }]);
      return false;
    }
    f.n -= 1;
    if (escrito) envios.current.push(ahora);
    return true;
  };

  /** Chips, sugerencias y la nube: pasan solo por la ráfaga antes de contestar. */
  const responder = (pregunta: string, tema: Tema | null) => {
    if (dejar(false)) contestar(pregunta, tema);
  };

  const contestar = (pregunta: string, tema: Tema | null, r?: Interpretacion) => {
    setMensajes((m) => [...m, { de: "vos", texto: pregunta }]);
    setPensando(true);
    // «me llamo Lucía»: Yo Da se lo guarda
    const dicho = nombreDicho(pregunta);
    if (dicho && (!tema || tema.id === "quien-sos" || tema.id === "hola")) {
      try {
        localStorage.setItem(NOMBRE, dicho);
      } catch {}
      window.setTimeout(() => {
        setPensando(false);
        setMensajes((m) => [...m, { de: "yo", texto: `Hmm. ${dicho}. Lindo nombre. Recordarte, voy.`, sugerencias: ["chiste", "ppt"] }]);
      }, 650);
      return;
    }
    if (tema?.voz) {
      const dicha = ultimaRespuesta.current;
      window.setTimeout(() => {
        setPensando(false);
        const pudo = hablar(dicha);
        setMensajes((m) => [
          ...m,
          { de: "yo", texto: pudo ? `${respuestaDe(tema)} «${dicha}»` : "Hmm. Voz aquí no tengo: el sonido apagado está, o tu navegador no me deja hablar." },
        ]);
      }, 650);
      return;
    }
    // la hora de quien escribe
    if (tema?.efecto === "clima") {
      window.setTimeout(() => {
        setPensando(false);
        ultimoTema.current = tema.id;
        let zona: string | null = null;
        try {
          zona = Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch {}
        setMensajes((m) => [...m, { de: "yo", texto: queTiempo({ zona, lat: lugar.current.lat, clima: lugar.current.clima, region: region.current }) }]);
      }, 650);
      return;
    }
    if (tema?.efecto === "hora") {
      window.setTimeout(() => {
        setPensando(false);
        ultimoTema.current = tema.id;
        setMensajes((m) => [...m, { de: "yo", texto: queHora(contextoEn()) }]);
      }, 650);
      return;
    }
    // con la música: qué suena, otro tema, pausa, play
    if (tema?.efecto) {
      const ef = tema.efecto;
      if (ef === "otro-tema") otroTema();
      if (ef === "pausar") pausarMusica();
      if (ef === "poner") ponerMusica();
      window.setTimeout(() => {
        setPensando(false);
        ultimoTema.current = tema.id;
        if (ef !== "que-suena") return setMensajes((m) => [...m, { de: "yo", texto: respuestaDe(tema), sugerencias: ["que-suena"] }]);
        const t = temaActual();
        setMensajes((m) => [
          ...m,
          {
            de: "yo",
            texto: queSuena(t),
            acciones: t
              ? [{ tipo: "musica-otro" }, { tipo: "link", texto: "Abrir en Spotify", href: `https://open.spotify.com/track/${t.id}`, externo: true }]
              : [{ tipo: "musica-poner" }],
          },
        ]);
      }, 650);
      return;
    }
    // una pausa breve, como quien piensa antes de contestar
    window.setTimeout(() => {
      setPensando(false);
      const sinCuenta = tema?.cuenta && !nombre.current;
      // ¿sigue trabada? no entendí, un problema, un enojo, pedir una persona o repetir lo mismo suman (la charla, no)
      const trabada = r?.charla ? false : !!r?.enojo || !tema || !!tema.atasca || (!!tema && tema.id === ultimoTema.current && !tema.chip && !tema.respuestas);
      if (trabada) esfuerzo.current += tema?.urgente ? 2 : 1;
      ultimoTema.current = tema?.id ?? null;
      const ofrecer = trabada && esfuerzo.current >= ESFUERZO_TICKET;
      const oferta: Mensaje[] = ofrecer
        ? [
            nombre.current
              ? { de: "yo", texto: ofrecerTicket, acciones: [{ tipo: "ticket" }] }
              : {
                  de: "yo",
                  texto: ticketSinCuenta,
                  acciones: [
                    { tipo: "link", texto: "Ingresar", href: "/ingresar" },
                    { tipo: "link", texto: "Crear cuenta", href: "/crear-cuenta" },
                  ],
                },
          ]
        : [];
      const cerca = r?.cercanos?.length ? r.cercanos : undefined;
      const principal: Mensaje =
        !tema || (r?.texto && (r.charla || r.enojo))
          ? { de: "yo", texto: r?.texto ?? noEntendi, chips: !tema && !r?.charla && !ofrecer && !cerca, sugerencias: tema?.siguientes ?? cerca }
          : sinCuenta && !ofrecer
            ? {
                de: "yo",
                texto: tema.sinCuenta ?? pedirCuenta,
                acciones: [
                  { tipo: "link", texto: "Ingresar", href: "/ingresar" },
                  { tipo: "link", texto: "Crear cuenta", href: "/crear-cuenta" },
                ],
              }
            : { de: "yo", texto: `${r?.prefijo ? `${r.prefijo} ` : ""}${respuestaDe(tema)}`, acciones: sinCuenta ? [] : tema.acciones, sugerencias: tema.siguientes };
      ofrecido.current = principal.sugerencias ?? [];
      setMensajes((m) => [...m, principal, ...oferta]);
    }, 650);
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = texto.trim();
    if (!t || enPausa) return;
    // si se pasa del ritmo, lo escrito queda en el campo para mandarlo después
    if (!dejar()) return;
    setTexto("");
    await cargarRegiones();
    const r = interpretar(t, { region: region.current, sugerencias: ofrecido.current });
    if (r.detectada) {
      region.current = r.region;
      try {
        if (r.region) sessionStorage.setItem("jb-yoda-region", r.region);
      } catch {}
    }
    contestar(t, r.tema, r);
  };

  const accion = (a: Accion, i: number) => {
    if (a.tipo === "horarios") return <Horarios key={i} />;
    if (a.tipo === "sonido") return <BotonSonido key={i} />;
    if (a.tipo === "ppt") return <Ppt key={i} />;
    if (a.tipo === "ticket")
      return <TicketYoDa key={i} conversacion={mensajes.filter((m) => m.texto).map(({ de, texto }) => ({ de, texto }))} />;
    if (a.tipo === "moneda") return <Moneda key={i} />;
    if (a.tipo === "atrapar")
      return (
        <button
          key={i}
          type="button"
          className="yosoy-accion"
          onClick={() => {
            if (vueltasJugadas() >= VUELTAS_MAX) {
              setMensajes((m) => [...m, { de: "yo", texto: "Hmm. Suficiente vuelo por hoy: las alas, cansadas están. Mañana, la revancha." }]);
              return;
            }
            setAbierto(false);
            setNube(false);
            window.setTimeout(empezarAtrapar, 420);
          }}
          data-testid="yosoy-atrapar"
        >
          Atrapame
        </button>
      );
    if (a.tipo === "link" && a.externo)
      return (
        <a key={i} href={a.href} target="_blank" rel="noopener noreferrer" className="yosoy-accion">
          {a.texto}
        </a>
      );
    if (a.tipo === "link")
      return (
        <Link key={i} href={a.href} className="yosoy-accion" onClick={() => setAbierto(false)}>
          {a.texto}
        </Link>
      );
    if (a.tipo === "musica-otro")
      return (
        <button key={i} type="button" className="yosoy-accion" onClick={() => otroTema()} data-testid="yosoy-otro-tema">
          Otro tema
        </button>
      );
    if (a.tipo === "musica-poner")
      return (
        <button key={i} type="button" className="yosoy-accion" onClick={() => ponerMusica()} data-testid="yosoy-poner-musica">
          Poner música
        </button>
      );
    if (a.tipo === "recorrido")
      return (
        <button
          key={i}
          type="button"
          className="yosoy-accion"
          onClick={() => {
            setAbierto(false);
            empezarRecorrido({ sesion: !!conSesion });
          }}
          data-testid="yosoy-recorrido"
        >
          Empezar el recorrido
        </button>
      );
    if (a.tipo === "instalar")
      return (
        <button key={i} type="button" className="yosoy-accion" onClick={() => { setAbierto(false); instalar(); }}>
          Instalar la app
        </button>
      );
    return (
      <button key={i} type="button" className="yosoy-accion" onClick={() => { setAbierto(false); abrirMusica(); }}>
        Abrir la música
      </button>
    );
  };

  // quien entra por primera vez, sin cuenta: Yo Da le ofrece el recorrido
  const nuevo = ofrecer && !conSesion && !nubeJuego && !nubeMusica && !nubeAtrapar;

  // el saludo de la nube, desde la hora de quien entra (se arma una vez por nube: tiene su parte al azar)
  const zonaRef = useRef(zonaConexion);
  zonaRef.current = zonaConexion;
  const saludoNube = useMemo(() => {
    if (!nube) return "";
    const ctx = contextoEn();
    try {
      const ahora = new Date();
      const propia = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (zonaRef.current && desfase(ahora, zonaRef.current) !== desfase(ahora, propia)) ctx.otraZona = true;
    } catch {}
    const nombreVisto = conSesion ?? nombreGuardado();
    // la fiesta del día, el comienzo de la estación o el tiempo que hace (a lo sumo una cosa)
    let zona: string | null = null;
    try {
      zona = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {}
    const delDia = extraDelDia({ zona, lat: lugar.current.lat, clima: lugar.current.clima, region: region.current });
    const extra = delDia ? ` ${delDia}` : "";
    if (conSesion) return `${saludoConHora(ctx, conSesion, region.current)}${extra} ¿En qué ayudarte puedo?`;
    // quien llega por primera vez: el saludo corto, así entra el recorrido
    if (nuevo) return `${saludoHora(ctx.hora, nombreVisto, region.current)} Yo Da soy. ${ofrecerRecorrido} Para acceder a más funciones, crearte una cuenta debés.`;
    return `${saludoConHora(ctx, nombreVisto, region.current)}${extra} Yo Da soy. Para acceder a más funciones, crearte una cuenta debés. ¿En qué ayudarte puedo?`;
  }, [nube, conSesion, nuevo]);

  return (
    <>
      <button
        ref={boton}
        type="button"
        className={`yosoy-boton ${abierto ? "abierto" : ""} ${presente ? "presente" : ""} ${hablando || nube ? "hablando" : ""} ${escuchando ? "escuchando" : ""}`}
        onClick={() => setAbierto((a) => !a)}
        aria-expanded={abierto}
        aria-controls="yosoy"
        aria-label={`${nombreBot}, la guía del sitio`}
        data-testid="yosoy-boton"
        data-recorrido="yoda"
        data-sonido="cuenco"
      >
        <span className="yosoy-asiente">
          <OjoPixel size={48} mira={mira} />
        </span>
      </button>
      {nube && !abierto && (
        <div className={`yosoy-nube ${nuevo ? "larga" : ""}`} role="status" data-testid="yosoy-nube">
          <button
            type="button"
            className="yosoy-nube-texto"
            onClick={() => {
              setAbierto(true);
              if (nubeJuego) {
                const ppt = temas.find((t) => t.id === "ppt");
                if (ppt) responder("Dale, juguemos", ppt);
              }
              if (nubeMusica) {
                const q = temas.find((t) => t.id === "que-suena");
                if (q) responder("¿Qué suena?", q);
              }
            }}
          >
            <Tipeo
              texto={
                nubeTexto || saludoNube
              }
            />
          </button>
          {nuevo && (
            <button
              type="button"
              className="yosoy-nube-cuenta yosoy-nube-mostrar"
              onClick={() => {
                setNube(false);
                empezarRecorrido({ sesion: false });
              }}
              data-testid="yosoy-nube-recorrido"
            >
              Mostrame el lugar
            </button>
          )}
          {nubeAtrapar && vueltasJugadas() < VUELTAS_MAX && (
            <button
              type="button"
              className="yosoy-nube-cuenta yosoy-nube-mostrar"
              onClick={() => {
                setNube(false);
                window.setTimeout(empezarAtrapar, 250);
              }}
              data-testid="yosoy-nube-atrapar"
            >
              Otra partida
            </button>
          )}
          {nubeAtrapar && (
            <button
              type="button"
              className="yosoy-nube-cuenta"
              onClick={() => {
                setNubeTexto("Hmm. Cuando quieras, la revancha. Aquí, quieto, te espero.");
                setNubeAtrapar(false);
                window.setTimeout(() => setNube(false), 3500);
              }}
              data-testid="yosoy-nube-dejar"
            >
              Dejar de jugar
            </button>
          )}
          {!conSesion && !nubeJuego && !nubeMusica && !nubeAtrapar && (
            <Link href="/crear-cuenta" className="yosoy-nube-cuenta" onClick={() => setNube(false)}>
              Crear cuenta
            </Link>
          )}
          <button type="button" className="yosoy-nube-cerrar" onClick={() => setNube(false)} aria-label="Cerrar el saludo de Yo Da">
            ×
          </button>
        </div>
      )}

      <section id="yosoy" className={`yosoy ${abierto ? "abierto" : ""}`} aria-label={`${nombreBot}, la guía del sitio`} aria-hidden={!abierto} inert={!abierto} data-testid="yosoy">
        <header className="yosoy-cabecera">
          <button
            type="button"
            className={`yosoy-cabeza ${cosquilla ? "cosquillas" : ""} ${escuchando ? "escuchando" : ""}`}
            aria-label="Hacerle cosquillas a Yo Da"
            data-testid="yosoy-cabeza"
            data-sonido="toque"
            onClick={() => {
              setCosquilla(true);
              window.setTimeout(() => setCosquilla(false), 600);
              setMensajes((m) => [...m, { de: "yo", texto: cosquillas[Math.floor(Math.random() * cosquillas.length)] }]);
            }}
          >
            <span className="yosoy-asiente">
              <OjoPixel size={40} mira={mira} />
            </span>
          </button>
          <div className="flex-1">
            <p className="text-lg leading-none">{nombreBot}</p>
            <p className="firma texto-2 text-[0.7rem] mt-1">guía del sitio</p>
          </div>
          <button
            type="button"
            className="yosoy-altavoz"
            onClick={cambiarSonido}
            aria-pressed={!sonidoSi}
            aria-label={sonidoSi ? "Silenciar el sitio" : "Activar el sonido"}
            title={sonidoSi ? "Silenciar el sitio" : "Activar el sonido"}
            data-testid="yosoy-altavoz"
          >
            <Altavoz si={sonidoSi} />
          </button>
          <button type="button" className="enlace texto-2 text-sm" onClick={() => setAbierto(false)}>
            Cerrar
          </button>
        </header>

        <div ref={lista} className="yosoy-mensajes" aria-live="polite">
          {mensajes.map((m, i) => (
            <div key={i} className={`yosoy-msj ${m.de}`}>
              <p>{m.texto}</p>
              {m.acciones && m.acciones.length > 0 && <div className="yosoy-acciones">{m.acciones.map(accion)}</div>}
              {m.sugerencias && m.sugerencias.length > 0 && (
                <div className="yosoy-sugerencias">
                  {m.sugerencias
                    .map((id) => temas.find((t) => t.id === id))
                    .filter((t): t is Tema => !!t)
                    .map((t) => (
                      <button key={t.id} type="button" className="yosoy-sugerencia disabled:opacity-40" disabled={enPausa} onClick={() => responder(t.etiqueta ?? t.chip ?? t.id, t)} data-sonido="toque">
                        {t.etiqueta ?? t.chip}
                      </button>
                    ))}
                </div>
              )}
              {m.chips && (
                <div className="yosoy-chips">
                  {chips.map((c) => (
                    <button key={c.id} type="button" className="yosoy-chip disabled:opacity-40" disabled={enPausa} onClick={() => responder(c.chip!, c)} data-sonido="toque">
                      {c.chip}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {pensando && (
            <div className="yosoy-msj yo yosoy-pensando" aria-label="Escribiendo">
              <span />
              <span />
              <span />
            </div>
          )}
        </div>

        {enPausa && (
          <p id="yosoy-pausa" className="texto-2 text-sm px-3 pt-2" aria-live="off" data-testid="yosoy-pausa">
            {pausaCuenta(pausa)}
          </p>
        )}
        {/* Para lectores de pantalla: se anuncia al empezar y al terminar la pausa, no cada segundo. */}
        <p className="sr-only" role="status" aria-live="polite">
          {avisoPausa}
        </p>
        <form onSubmit={enviar} className="yosoy-form">
          <label htmlFor="yosoy-campo" className="sr-only">
            {`Escribile a ${nombreBot}`}
          </label>
          <input
            ref={campo}
            id="yosoy-campo"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder={`Escribile a ${nombreBot}…`}
            autoComplete="off"
            maxLength={300}
            readOnly={enPausa}
            aria-describedby={enPausa ? "yosoy-pausa" : undefined}
          />
          <button type="submit" className="yosoy-enviar" aria-label="Enviar" disabled={!texto.trim() || enPausa}>
            ↑
          </button>
        </form>
      </section>
    </>
  );
}
