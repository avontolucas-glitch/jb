import Ojo, { OjoFantasma } from "./Ojo";

/** Apertura de sección: ojo chico, título, bajada y el ojo gigante fantasma detrás. */
export default function Apertura({
  titulo,
  bajada,
  children,
  className = "",
}: {
  titulo: string;
  bajada?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`relative overflow-hidden px-5 pt-16 pb-14 sm:pt-24 sm:pb-20 ${className}`}>
      <OjoFantasma />
      <div className="relative mx-auto max-w-3xl text-center aparece">
        <Ojo size={30} className="mx-auto mb-6" />
        <h1 className="titulo text-4xl sm:text-5xl">{titulo}</h1>
        {bajada && <p className="texto-2 mt-5 text-lg sm:text-xl prosa mx-auto">{bajada}</p>}
        {children}
      </div>
    </section>
  );
}
