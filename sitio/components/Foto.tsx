/**
 * Foto de Julián como lámina de libro: marco fino, se descubre de arriba hacia
 * abajo al llegar a la pantalla y lleva el pie en versalitas.
 * Las fotos están en public/fotos/ en dos anchos (herramientas/fotos_web.py).
 */
const FOTOS = {
  "julian-chef": { w: 1200, h: 1800, alt: "Julián Bermúdez de perfil, con chaqueta de cocinero, en blanco y negro" },
  "julian-doble-exposicion": { w: 1200, h: 1800, alt: "Retrato de Julián Bermúdez en doble exposición" },
  "julian-trofeo": { w: 1117, h: 1408, alt: "Julián Bermúdez de brazos cruzados con el trofeo, en el set de El Gran Premio de la Cocina" },
  "julian-emplatando": { w: 1123, h: 1401, alt: "Julián Bermúdez emplatando en una cocina" },
  "julian-movimiento": { w: 1123, h: 1401, alt: "Retrato de Julián Bermúdez en movimiento, en blanco y negro" },
  "julian-mirada": { w: 2000, h: 808, alt: "La mirada de Julián Bermúdez detrás de sus anteojos" },
} as const;

export type NombreFoto = keyof typeof FOTOS;

export default function Foto({
  nombre,
  pie,
  sizes = "(min-width: 1024px) 28rem, 90vw",
  className = "",
  inclinada = 0,
  retardo = 0,
}: {
  nombre: NombreFoto;
  pie?: string;
  sizes?: string;
  className?: string;
  inclinada?: number;
  retardo?: number;
}) {
  const f = FOTOS[nombre];
  const chica = nombre === "julian-mirada" ? `/fotos/${nombre}-1200.webp 1200w` : `/fotos/${nombre}-720.webp 720w`;
  const grande = nombre === "julian-mirada" ? `/fotos/${nombre}-2000.webp` : `/fotos/${nombre}-1200.webp`;
  return (
    <figure className={`foto ${className}`} style={{ ["--giro" as string]: `${inclinada}deg` }} data-testid={`foto-${nombre}`}>
      <div className="foto-marco revelar cortina" style={{ ["--retardo" as string]: `${retardo}s` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={grande} srcSet={`${chica}, ${grande} ${f.w}w`} sizes={sizes} width={f.w} height={f.h} alt={f.alt} loading="lazy" decoding="async" />
      </div>
      {pie && (
        <figcaption className="foto-pie firma texto-2 revelar" style={{ ["--retardo" as string]: `${retardo + 0.5}s` }}>
          {pie}
        </figcaption>
      )}
    </figure>
  );
}
