import type { CSSProperties } from "react";
import estilos from "./MarcoPagina.module.css";

/**
 * Orla de página: un filete doble finísimo alrededor de la ventana, como el marco
 * de la página de un libro, con un rombo pequeño en cada esquina. Tinta crema muy
 * tenue, fija, sin recibir clics. Solo en computadora (desde 1024px de ancho).
 *
 * Al cargar, las líneas nacen en los rombos y se trazan despacio hasta encontrarse
 * en el medio de cada lado. Si la bienvenida está abierta, espera a que se entre.
 * Con «reducir movimiento» aparece quieto. Es solo CSS: no necesita JavaScript.
 *
 * Tiene z-index 2, igual que main y el pie: para que quede por encima de las
 * secciones con fondo propio (.hondo) va después de <Pie /> en el layout, como
 * hijo directo de <body> (dentro de <main> o de <header> sus animaciones de
 * entrada lo moverían con ellos). Arriba empieza debajo del encabezado (z 40),
 * que es opaco y lo taparía.
 */

type Lado = "arriba" | "derecha" | "abajo" | "izquierda";
type Esquina = "noroeste" | "noreste" | "sureste" | "suroeste";

const LADOS: ReadonlyArray<{ lado: Lado; eje: "horizontal" | "vertical" }> = [
  { lado: "arriba", eje: "horizontal" },
  { lado: "derecha", eje: "vertical" },
  { lado: "abajo", eje: "horizontal" },
  { lado: "izquierda", eje: "vertical" },
];

const ESQUINAS: ReadonlyArray<Esquina> = ["noroeste", "noreste", "sureste", "suroeste"];

export default function MarcoPagina({
  arriba,
  className = "",
}: {
  /**
   * Distancia desde el borde superior de la ventana, si hace falta otra. Por
   * defecto es la altura del encabezado (--alto-encabezado) más los 12px de los
   * otros lados. Acepta cualquier valor de CSS, p. ej. "calc(var(--alto-encabezado) + 2rem)".
   */
  arriba?: string;
  className?: string;
}) {
  const estilo = arriba ? ({ ["--marco-arriba" as string]: arriba } as CSSProperties) : undefined;

  return (
    <div className={`${estilos.marco} ${className}`.trim()} style={estilo} aria-hidden="true">
      {LADOS.map(({ lado, eje }) => (
        <span key={lado} className={`${estilos.lado} ${estilos[lado]} ${estilos[eje]}`}>
          <span className={`${estilos.mitad} ${estilos.inicio}`} />
          <span className={`${estilos.mitad} ${estilos.fin}`} />
        </span>
      ))}
      {ESQUINAS.map((esquina) => (
        <span key={esquina} className={`${estilos.rombo} ${estilos[esquina]}`} />
      ))}
    </div>
  );
}
