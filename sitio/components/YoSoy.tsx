"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import OjoPixel from "./OjoPixel";
import Hora from "./Hora";
import { abrirMusica } from "./Musica";
import { instalar } from "@/lib/instalar";
import { aviso, avisoCon, entender, nombreBot, noEntendi, pedirCuenta, puertasCuenta, saludo, saludoCon, temas, type Accion, type Tema } from "@/content/yosoy";

type Mensaje = { de: "yo" | "vos"; texto: string; acciones?: Accion[]; chips?: boolean };
type Libre = { id: string; inicio: string };

const chips = temas.filter((t) => t.chip);

/** La frase aparece de a una letra, como si Yo Da la estuviera diciendo. */
function Tipeo({ texto }: { texto: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(texto.length);
      return;
    }
    const t = window.setInterval(() => setN((i) => (i >= texto.length ? (window.clearInterval(t), i) : i + 1)), 38);
    return () => window.clearInterval(t);
  }, [texto]);
  return (
    <>
      <span className="sr-only">{texto}</span>
      <span aria-hidden="true">{texto.slice(0, n)}</span>
    </>
  );
}

/** Los próximos horarios libres de la 1 a 1, en la hora de quien pregunta. */
function Horarios() {
  const [libres, setLibres] = useState<Libre[] | null>(null);
  useEffect(() => {
    fetch("/api/horarios?n=3")
      .then((r) => r.json())
      .then((d) => setLibres(d.horarios ?? []))
      .catch(() => setLibres([]));
  }, []);
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

  const quienEs = () =>
    fetch("/api/yo")
      .then((r) => r.json())
      .then((d) => {
        nombre.current = d.nombre ?? null;
        setConSesion(d.nombre ?? null);
        setMensajes((m) =>
          m.length === 1 ? [d.nombre ? { de: "yo", texto: saludoCon(d.nombre), chips: true } : { de: "yo", texto: saludo, chips: true, acciones: puertasCuenta }] : m,
        );
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
          setNube(true);
          t2 = window.setTimeout(() => setNube(false), 16000);
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

  useEffect(() => {
    if (!abierto) return;
    setNube(false);
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

  const responder = (pregunta: string, tema: Tema | null) => {
    setMensajes((m) => [...m, { de: "vos", texto: pregunta }]);
    setPensando(true);
    // una pausa breve, como quien piensa antes de contestar
    window.setTimeout(() => {
      setPensando(false);
      const sinCuenta = tema?.cuenta && !nombre.current;
      setMensajes((m) => [
        ...m,
        !tema
          ? { de: "yo", texto: noEntendi, chips: true }
          : sinCuenta
            ? {
                de: "yo",
                texto: pedirCuenta,
                acciones: [
                  { tipo: "link", texto: "Ingresar", href: "/ingresar" },
                  { tipo: "link", texto: "Crear cuenta", href: "/crear-cuenta" },
                ],
              }
            : { de: "yo", texto: tema.respuesta, acciones: tema.acciones },
      ]);
    }, 650);
  };

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    const t = texto.trim();
    if (!t) return;
    setTexto("");
    responder(t, entender(t));
  };

  const accion = (a: Accion, i: number) => {
    if (a.tipo === "horarios") return <Horarios key={i} />;
    if (a.tipo === "link")
      return (
        <Link key={i} href={a.href} className="yosoy-accion" onClick={() => setAbierto(false)}>
          {a.texto}
        </Link>
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

  return (
    <>
      <button
        ref={boton}
        type="button"
        className={`yosoy-boton ${abierto ? "abierto" : ""} ${presente ? "presente" : ""}`}
        onClick={() => setAbierto((a) => !a)}
        aria-expanded={abierto}
        aria-controls="yosoy"
        aria-label={`${nombreBot}, la guía del sitio`}
        data-testid="yosoy-boton"
        data-sonido="cuenco"
      >
        <OjoPixel size={48} />
      </button>
      {nube && !abierto && (
        <div className="yosoy-nube" role="status" data-testid="yosoy-nube">
          <button type="button" className="yosoy-nube-texto" onClick={() => setAbierto(true)}>
            <Tipeo texto={conSesion ? avisoCon(conSesion) : aviso} />
          </button>
          {!conSesion && (
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
          <OjoPixel size={40} />
          <div className="flex-1">
            <p className="text-lg leading-none">{nombreBot}</p>
            <p className="firma texto-2 text-[0.7rem] mt-1">guía del sitio</p>
          </div>
          <button type="button" className="enlace texto-2 text-sm" onClick={() => setAbierto(false)}>
            Cerrar
          </button>
        </header>

        <div ref={lista} className="yosoy-mensajes" aria-live="polite">
          {mensajes.map((m, i) => (
            <div key={i} className={`yosoy-msj ${m.de}`}>
              <p>{m.texto}</p>
              {m.acciones && m.acciones.length > 0 && <div className="yosoy-acciones">{m.acciones.map(accion)}</div>}
              {m.chips && (
                <div className="yosoy-chips">
                  {chips.map((c) => (
                    <button key={c.id} type="button" className="yosoy-chip" onClick={() => responder(c.chip!, c)} data-sonido="toque">
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
          />
          <button type="submit" className="yosoy-enviar" aria-label="Enviar" disabled={!texto.trim()}>
            ↑
          </button>
        </form>
      </section>
    </>
  );
}
