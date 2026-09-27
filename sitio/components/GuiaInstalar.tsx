"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Ojo from "./Ojo";
import { GUIA, useInstalar } from "@/lib/instalar";
import { nombreSistema, type Sistema } from "@/lib/plataforma";

export function IconoCompartir() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="inline align-[-3px]">
      <path d="M12 3v12M8 7l4-4 4 4" />
      <path d="M6 11H5v10h14V11h-1" />
    </svg>
  );
}

const Tecla = ({ children, nombre }: { children: React.ReactNode; nombre: string }) => (
  <span className="tecla" role="img" aria-label={nombre}>
    {children}
  </span>
);

type Senal = "abajo" | "abajo-derecha" | "arriba-derecha" | "arriba-izquierda" | null;
type Guia = { titulo: string; pasos: React.ReactNode[]; senal: Senal; nota?: string; copiar?: boolean };

/** Los pasos exactos de cada sistema y navegador, y hacia dónde apunta la señal. */
function guiaPara(s: Sistema): Guia {
  const esIOS = s.so === "ios" || s.so === "ipados";
  if (s.enApp)
    return esIOS
      ? {
          titulo: `Desde ${s.enApp} no se puede instalar`,
          pasos: [
            <>Tocá <Tecla nombre="más opciones">···</Tecla> o <IconoCompartir />, arriba o abajo de la pantalla.</>,
            <>Elegí <strong>Abrir en Safari</strong> (o <strong>Abrir en el navegador</strong>).</>,
            <>En Safari, tocá otra vez <strong>Instalar la app</strong>.</>,
          ],
          senal: "arriba-derecha",
        }
      : {
          titulo: `Desde ${s.enApp} no se puede instalar`,
          pasos: [
            <>Tocá <Tecla nombre="menú">⋮</Tecla> arriba a la derecha.</>,
            <>Elegí <strong>Abrir en Chrome</strong> (o <strong>Abrir en el navegador</strong>).</>,
            <>En Chrome, tocá otra vez <strong>Instalar la app</strong>.</>,
          ],
          senal: "arriba-derecha",
        };
  if (esIOS) {
    const ipad = s.so === "ipados";
    if (s.navegador === "safari")
      return {
        titulo: `Instalá la app en tu ${ipad ? "iPad" : "iPhone"}`,
        pasos: [
          <>Tocá <IconoCompartir /> <strong>Compartir</strong>, {ipad ? "arriba a la derecha" : "en la barra de abajo"} (si no lo ves, primero <Tecla nombre="más opciones">···</Tecla>).</>,
          <>Bajá y elegí <strong>Agregar a pantalla de inicio</strong>.</>,
          <>Tocá <strong>Agregar</strong>: el ojo queda entre tus apps.</>,
        ],
        senal: ipad ? "arriba-derecha" : "abajo",
      };
    return {
      titulo: `Instalá la app en tu ${ipad ? "iPad" : "iPhone"}`,
      pasos: [
        <>Tocá <IconoCompartir /> <strong>Compartir</strong>, en la barra de direcciones o en el menú del navegador.</>,
        <>Elegí <strong>Agregar a pantalla de inicio</strong> y confirmá.</>,
        <>Si no aparece, abrí esta página en <strong>Safari</strong> y seguí los mismos pasos.</>,
      ],
      senal: s.navegador === "chrome" ? "arriba-derecha" : null,
    };
  }
  if (s.so === "android") {
    if (s.navegador === "samsung")
      return {
        titulo: "Instalá la app en tu teléfono",
        pasos: [
          <>Tocá <Tecla nombre="menú">☰</Tecla> abajo a la derecha.</>,
          <>Elegí <strong>Agregar página a</strong> y después <strong>Pantalla de inicio</strong>.</>,
          <>Confirmá con <strong>Agregar</strong>.</>,
        ],
        senal: "abajo-derecha",
      };
    return {
      titulo: "Instalá la app en tu teléfono",
      pasos: [
        <>Tocá <Tecla nombre="menú">⋮</Tecla> {s.navegador === "edge" ? "abajo, en la barra del navegador" : "arriba a la derecha"}.</>,
        <>Elegí <strong>Instalar app</strong> o <strong>Agregar a la pantalla principal</strong>.</>,
        <>Confirmá con <strong>Instalar</strong>: el ojo queda entre tus apps.</>,
      ],
      senal: s.navegador === "edge" ? "abajo" : "arriba-derecha",
    };
  }
  if (s.so === "mac" && s.navegador === "safari")
    return {
      titulo: "Instalá la app en tu Mac",
      pasos: [
        <>Arriba, en la barra de menú, abrí <strong>Archivo</strong>.</>,
        <>Elegí <strong>Agregar al Dock…</strong></>,
        <>Confirmá con <strong>Agregar</strong>: queda en el Dock, como cualquier app.</>,
      ],
      senal: "arriba-izquierda",
    };
  if (s.navegador === "firefox")
    return {
      titulo: "Firefox no instala apps web",
      pasos: [
        <>Copiá el link de esta página.</>,
        <>Abrilo en <strong>Chrome</strong>, <strong>Edge</strong> o <strong>Safari</strong>.</>,
        <>Ahí, el mismo botón <strong>Instalar la app</strong> la instala.</>,
      ],
      senal: null,
      copiar: true,
    };
  if (s.navegador === "chrome" || s.navegador === "edge" || s.navegador === "opera")
    return {
      titulo: "Instalá la app en tu computadora",
      pasos: [
        <>A la derecha de la barra de direcciones, tocá el ícono de <strong>instalar</strong> (una pantalla con una flecha).</>,
        <>
          Si no está: menú <Tecla nombre="menú">{s.navegador === "edge" ? "···" : "⋮"}</Tecla> y{" "}
          {s.navegador === "edge" ? <><strong>Aplicaciones</strong> → <strong>Instalar este sitio como aplicación</strong></> : <><strong>Transmitir, guardar y compartir</strong> → <strong>Instalar página como app</strong></>}.
        </>,
        <>Confirmá con <strong>Instalar</strong>: se abre en su propia ventana.</>,
      ],
      senal: "arriba-derecha",
      nota: "Si ya la instalaste en esta computadora, la encontrás entre tus aplicaciones.",
    };
  return {
    titulo: "Instalá la app",
    pasos: [
      <>Abrí el menú de tu navegador.</>,
      <>Buscá <strong>Instalar</strong> o <strong>Agregar a pantalla de inicio</strong>.</>,
      <>Si no aparece, abrí esta página en Chrome, Edge o Safari.</>,
    ],
    senal: null,
    copiar: true,
  };
}

/** La guía de instalación: se abre desde cualquier botón «Instalar la app» cuando el navegador no instala directo. */
export default function GuiaInstalar() {
  const { sistema, directo, instalada, instalar } = useInstalar();
  const [abierta, setAbierta] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const cerrarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const abrir = () => setAbierta(true);
    window.addEventListener(GUIA, abrir);
    // se llegó desde otro navegador para seguir instalando
    const u = new URL(window.location.href);
    if (u.searchParams.has("instalar")) {
      u.searchParams.delete("instalar");
      window.history.replaceState(null, "", u.pathname + u.search + u.hash);
      setAbierta(true);
    }
    return () => window.removeEventListener(GUIA, abrir);
  }, []);

  useEffect(() => {
    if (!abierta) return;
    cerrarRef.current?.focus();
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && setAbierta(false);
    window.addEventListener("keydown", tecla);
    document.documentElement.classList.add("guia-abierta");
    return () => {
      window.removeEventListener("keydown", tecla);
      document.documentElement.classList.remove("guia-abierta");
    };
  }, [abierta]);

  useEffect(() => {
    if (instalada) setAbierta(false);
  }, [instalada]);

  if (!abierta || !sistema) return null;
  const g = guiaPara(sistema);
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="guia-titulo" className="guia-instalar" data-testid="guia-instalar" onClick={(e) => e.target === e.currentTarget && setAbierta(false)}>
      {g.senal && !directo && (
        <div className={`guia-senal guia-senal-${g.senal}`} aria-hidden="true">
          <span className="guia-aro" />
          <span className="guia-flecha">↑</span>
        </div>
      )}
      <div className="guia-cuerpo">
        <Ojo size={34} className="mx-auto mb-5 guia-ojo" />
        <p className="guia-sistema">{nombreSistema(sistema)}</p>
        <h2 id="guia-titulo" className="titulo text-2xl sm:text-3xl mb-7">{directo ? "Instalá la app" : g.titulo}</h2>
        {directo ? (
          <button type="button" className="boton boton-lleno" data-sonido="campana" onClick={() => instalar()}>
            Instalar ahora
          </button>
        ) : (
          <ol className="guia-pasos">
            {g.pasos.map((p, i) => (
              <li key={i} style={{ ["--i" as string]: i }}>
                <span className="guia-num">{["I", "II", "III"][i]}</span>
                <span>{p}</span>
              </li>
            ))}
          </ol>
        )}
        {g.nota && !directo && <p className="texto-2 text-sm mt-5">{g.nota}</p>}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
          {g.copiar && (
            <button
              type="button"
              className="boton py-1.5"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(window.location.origin + window.location.pathname);
                  setCopiado(true);
                } catch {}
              }}
            >
              {copiado ? "Link copiado" : "Copiar el link"}
            </button>
          )}
          <Link href="/app" className="enlace texto-2" onClick={() => setAbierta(false)}>
            Todos los sistemas
          </Link>
          <button ref={cerrarRef} type="button" className="enlace texto-2" onClick={() => setAbierta(false)}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
