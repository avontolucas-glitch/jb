/** El único ícono del sitio: un ojo de línea fina. */
export default function Ojo({
  size = 28,
  grosor = 1.3,
  className = "",
  titulo,
}: {
  size?: number | string;
  grosor?: number;
  className?: string;
  titulo?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={grosor}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={titulo ? "img" : undefined}
      aria-hidden={titulo ? undefined : true}
      aria-label={titulo}
    >
      <path d="M4 32 C 15 16, 49 16, 60 32 C 49 48, 15 48, 4 32 Z" />
      <circle cx="32" cy="32" r="9.5" />
      <circle cx="32" cy="32" r="3.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Ojo gigante y fantasma (5–6 % de opacidad) detrás del texto de las aperturas. */
export function OjoFantasma() {
  return (
    <div className="fantasma" aria-hidden="true">
      <Ojo size="min(140vw, 1100px)" grosor={0.5} />
    </div>
  );
}
