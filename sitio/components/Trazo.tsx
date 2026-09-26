/**
 * Una línea trazada a mano: grosor desparejo, leve temblor y una punta que se
 * afina, como una pluma sobre papel. Siempre la misma para la misma semilla.
 */
function azar(semilla: number) {
  let s = semilla >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export default function Trazo({ ancho = 260, semilla = 7, className = "", retardo = 0 }: { ancho?: number; semilla?: number; className?: string; retardo?: number }) {
  const r = azar(semilla);
  const pasos = 22;
  const arriba: string[] = [];
  const abajo: string[] = [];
  const centro: string[] = [];
  let deriva = 0;
  for (let i = 0; i <= pasos; i++) {
    const x = (i / pasos) * ancho;
    deriva += (r() - 0.5) * 1.3;
    deriva *= 0.8;
    // la pluma sube apenas al final, como al levantar la mano
    const y = 4 + deriva - Math.pow(i / pasos, 6) * 1.6;
    // más grueso al entrar la pluma, más fino al final
    const t = i / pasos;
    const g = (0.5 + 1.6 * Math.sin(Math.PI * Math.min(1, t * 1.1)) * (1 - 0.6 * t)) * (0.7 + r() * 0.6);
    arriba.push(`${x.toFixed(1)},${(y - g / 2).toFixed(2)}`);
    abajo.unshift(`${x.toFixed(1)},${(y + g / 2).toFixed(2)}`);
    centro.push(`${x.toFixed(1)},${y.toFixed(2)}`);
  }
  return (
    <svg width={ancho} height={8} viewBox={`0 0 ${ancho} 8`} className={`trazo-mano ${className}`} aria-hidden="true" style={{ ["--retardo" as string]: `${retardo}s` }}>
      <defs>
        <mask id={`m-${semilla}`}>
          <polyline points={centro.join(" ")} fill="none" stroke="#fff" strokeWidth={4} pathLength={1} className="trazo-mano-dibujo" />
        </mask>
      </defs>
      <polygon points={[...arriba, ...abajo].join(" ")} fill="currentColor" mask={`url(#m-${semilla})`} />
    </svg>
  );
}
