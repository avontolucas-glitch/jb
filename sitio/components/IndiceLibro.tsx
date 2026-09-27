import { useId } from "react";
import Link from "next/link";
import styles from "./IndiceLibro.module.css";

/** Un renglón del índice: título, puntos guía y folio romano. */
export type EntradaIndice = {
  /** Numeral romano del folio, por ejemplo "IV". */
  folio: string;
  titulo: string;
  href: string;
  /** Línea chica en itálica debajo del título (opcional). */
  nota?: string;
};

/**
 * Retardo de entrada de cada renglón: uno después del otro, cada vez un poco
 * menos, sin pasar nunca de 0,75 s. Así la cascada se ve entera cuando entra
 * todo el índice junto, y en un celular, donde los renglones llegan de a uno
 * al bajar, el último no queda esperando.
 */
const retardo = (i: number) => `${(0.15 + 0.6 * (1 - 0.8 ** i)).toFixed(2)}s`;

/**
 * Índice como el de un libro impreso, para cerrar la portada.
 * Cada renglón: el título a la izquierda, los puntos guía que llenan el
 * espacio sobre la línea de base y el folio romano a la derecha. Con un
 * título largo, los puntos y el folio quedan en la última línea, como en
 * los índices compuestos a mano.
 *
 * El título tapa los puntos con el color de fondo de la superficie
 * (--fondo): va sobre una superficie lisa del sitio. Si va sobre otro fondo,
 * se le pasa ese color con --fondo-indice.
 */
export default function IndiceLibro({
  titulo = "Índice",
  items,
  className = "",
  revelar = true,
}: {
  titulo?: string;
  items: EntradaIndice[];
  className?: string;
  /** Los renglones emergen de a uno al llegar (usa el .revelar del sitio). */
  revelar?: boolean;
}) {
  const id = useId();
  if (items.length === 0) return null;
  const aparece = revelar ? " revelar" : "";
  return (
    <div className={`${styles.indice} ${className}`.trim()}>
      {/* .revelar va en el contenedor y no en el h2: la regla global de
          h2.revelar le cambiaría el espaciado a las versalitas de .firma. */}
      <div className={revelar ? "revelar" : undefined}>
        <h2 id={id} className={`firma ${styles.encabezado}`}>
          {titulo}
        </h2>
      </div>
      <span className={`${styles.filete}${revelar ? " trazo" : ""}`} aria-hidden="true" />
      {/* role="list" mantiene la lista para VoiceOver aunque no lleve viñetas */}
      <ol role="list" aria-labelledby={id} className={styles.lista}>
        {items.map((it, i) => (
          <li
            key={`${it.href}-${i}`}
            className={`${styles.renglon}${aparece}`}
            style={revelar ? { ["--retardo" as string]: retardo(i) } : undefined}
          >
            <Link href={it.href} className={styles.vinculo}>
              <span className={styles.linea}>
                <span className={styles.texto}>
                  <span className={styles.nombre}>{it.titulo}</span>
                  <span className={styles.puntos} aria-hidden="true" />
                </span>
                <span className={styles.folio}>{it.folio}</span>
              </span>
              {it.nota && <span className={styles.nota}>{it.nota}</span>}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
