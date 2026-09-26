import Link from "next/link";
import Grabado from "./Grabado";
import TituloTinta from "./TituloTinta";
import Trazo from "./Trazo";
import MarcasImprenta from "./MarcasImprenta";
import Estrellas from "./Estrellas";
import { sitio } from "@/content/config";

export type GrabadoPagina = { src: string; alt: string; pie: string };

/**
 * Apertura de cada página, compuesta como una portadilla impresa:
 * marcas de imprenta, sello con el folio, título con tinta de tipos, trazo de
 * pluma, bajada y (si tiene) el grabado del libro que le corresponde.
 * Todo aparece de a uno.
 */
export default function Apertura({
  titulo,
  bajada,
  children,
  folio,
  grabado,
  className = "",
}: {
  titulo: string;
  bajada?: string;
  children?: React.ReactNode;
  folio?: string;
  grabado?: GrabadoPagina;
  className?: string;
}) {
  const semilla = [...titulo].reduce((a, c) => a + c.charCodeAt(0), 0);
  return (
    <section className={`portada ${className}`}>
      <MarcasImprenta />
      <Estrellas />
      <div
        className={`relative mx-auto px-6 sm:px-10 pt-12 pb-20 sm:pt-16 sm:pb-24 grid gap-10 items-center ${
          grabado ? "max-w-6xl lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-6" : "max-w-3xl"
        }`}
      >
        {grabado && (
          <div className="lg:order-2 lg:pl-8">
            <Grabado src={grabado.src} alt={grabado.alt} ancho="min(56vw, 330px)" className="lamina" pasada />
            <p className="texto-2 text-xs mt-4 text-center italic aparece" style={{ animationDelay: "2.6s" }}>
              {grabado.pie}
            </p>
          </div>
        )}
        <div className="lg:order-1">
          <p className="firma texto-2 text-xs aparece" style={{ animationDelay: ".3s" }}>
            <Link href="/" className="hover:text-[var(--texto)]">
              {sitio.nombre}
            </Link>
            {folio && <> · {folio}</>}
          </p>
          <TituloTinta texto={titulo} desde={0.6} paso={0.05} className="titulo imprenta-tipo text-[2.7rem] leading-[1.02] sm:text-6xl mt-4" />
          <Trazo ancho={200} semilla={semilla} retardo={0.9 + titulo.length * 0.05} className="mt-6 texto-2" />
          {bajada && (
            <p className="mt-6 text-lg sm:text-xl italic prosa aparece" style={{ animationDelay: `${1.2 + titulo.length * 0.05}s` }}>
              {bajada}
            </p>
          )}
          {children && (
            <div className="aparece" style={{ animationDelay: `${1.6 + titulo.length * 0.05}s` }}>
              {children}
            </div>
          )}
        </div>
      </div>
      {folio && (
        <p className="folio texto-2 absolute bottom-7 left-0 right-0 text-center aparece" style={{ animationDelay: "2.8s" }} aria-hidden="true">
          · {folio} ·
        </p>
      )}
    </section>
  );
}
