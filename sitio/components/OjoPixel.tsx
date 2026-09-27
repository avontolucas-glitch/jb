/**
 * El ojo de Yo Da en pixel art: el ojo de la trilogía con dos orejas anchas y en punta
 * (el guiño de «yo-da»), dibujado de a un píxel: el ojo en dorado, las orejas
 * en blanco. Parpadea cada tanto, y la pupila (un bloque de 2 × 3) mira hacia un
 * costado o al otro con «mira» (-1, 0 o 1).
 * Cada tramo es [x, y, ancho] en una grilla de 32 × 9.
 */
const ABIERTO = [[0, 1, 2], [12, 1, 8], [13, 3, 6], [13, 4, 6], [13, 5, 6], [30, 1, 2], [1, 2, 5], [10, 2, 2], [14, 2, 4], [20, 2, 2], [26, 2, 5], [2, 3, 1], [4, 3, 5], [23, 3, 5], [29, 3, 1], [4, 4, 2], [7, 4, 3], [22, 4, 3], [26, 4, 2], [7, 5, 3], [22, 5, 3], [10, 6, 2], [14, 6, 4], [20, 6, 2], [12, 7, 8]];
const CERRADO = [[0, 1, 2], [30, 1, 2], [1, 2, 5], [26, 2, 5], [2, 3, 1], [4, 3, 5], [23, 3, 5], [29, 3, 1], [4, 4, 2], [7, 4, 3], [22, 4, 3], [26, 4, 2], [7, 5, 5], [20, 5, 5], [12, 6, 8], [13, 7, 1], [15, 7, 2], [18, 7, 1]];

/** Las orejas quedan a los costados (x < 10 o x ≥ 22); el ojo, en el medio. */
const esOreja = ([x]: number[]) => x < 10 || x >= 22;

function Tramos({ lista }: { lista: number[][] }) {
  return (
    <>
      <g className="ojo-pixel-orejas">
        {lista.filter(esOreja).map(([x, y, w]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={w} height={1} />
        ))}
      </g>
      <g className="ojo-pixel-ojo">
        {lista.filter((t) => !esOreja(t)).map(([x, y, w]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={w} height={1} />
        ))}
      </g>
    </>
  );
}

export default function OjoPixel({ size = 30, className = "", mira = 0 }: { size?: number; className?: string; mira?: -1 | 0 | 1 }) {
  return (
    <svg width={size} height={Math.round((size * 9) / 32)} viewBox="0 0 32 9" shapeRendering="crispEdges" aria-hidden="true" className={`ojo-pixel ${className}`}>
      <g className="ojo-pixel-abierto">
        <Tramos lista={ABIERTO} />
        <rect className="ojo-pixel-pupila" x={15 + mira} y={3} width={2} height={3} />
      </g>
      <g className="ojo-pixel-cerrado">
        <Tramos lista={CERRADO} />
      </g>
    </svg>
  );
}
