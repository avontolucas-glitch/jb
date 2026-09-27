"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import OjoPixel from "./OjoPixel";
import Hora from "./Hora";
import { abrirMusica } from "./Musica";
import { instalar } from "@/lib/instalar";
import { aviso, entender, nombreBot, noEntendi, pedirCuenta, saludo, saludoCon, temas, type Accion, type Tema } from "@/content/yosoy";

type Mensaje = { de: "yo" | "vos"; texto: string; acciones?: Accion[]; chips?: boolean };
type Libre = { id: string; inicio: string };

const chips = temas.filter((t) => t.chip);

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
 * YoDa: el ojo que guía. Abajo a la derecha; al tocarlo se abre y
 * acompaña con opciones o con lo que la persona escriba. Es soporte del sitio,
 * no la voz de Julián (las respuestas están en content/yosoy.ts).
 */
export default function YoSoy() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([{ de: "yo", texto: saludo, chips: true }]);
  const [texto, setTexto] = useState("");
  const [pensando, setPensando] = useState(false);
  const [presente, setPresente] = useState(false);
  const [nube, setNube] = useState(false);
  const nombre = useRef<string | null>(null);
  const lista = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLInputElement>(null);
  const boton = useRef<HTMLButtonElement>(null);

  // YoDa se hace presente unos segundos después de entrar (y después de la bienvenida)
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
          t2 = window.setTimeout(() => setNube(false), 7000);
        }
      }, 2800);
    };
    if (document.documentElement.classList.contains("en-umbral")) window.addEventListener("umbral:abierto", aparecer, { once: true });
    else aparecer();
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
    fetch("/api/yo")
      .then((r) => r.json())
      .then((d) => {
        nombre.current = d.nombre ?? null;
        setMensajes((m) => (m.length === 1 ? [{ ...m[0], texto: d.nombre ? saludoCon(d.nombre) : saludo }] : m));
      })
      .catch(() => {});
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
        <button type="button" className="yosoy-nube" onClick={() => setAbierto(true)} data-testid="yosoy-nube">
          {aviso}
        </button>
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
