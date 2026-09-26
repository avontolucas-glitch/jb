/** Entre secciones: un ojo cerrado que se abre cuando llegás. */
export default function Divisor() {
  return (
    <div className="divisor revelar" aria-hidden="true">
      <span className="linea" />
      <svg width="34" height="34" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" className="texto-2">
        <path className="parpado" d="M4 32 C 15 16, 49 16, 60 32 C 49 48, 15 48, 4 32 Z" />
        <g className="iris">
          <circle cx="32" cy="32" r="9.5" />
          <circle cx="32" cy="32" r="3.2" fill="currentColor" stroke="none" />
        </g>
      </svg>
      <span className="linea" />
    </div>
  );
}
