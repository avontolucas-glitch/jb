"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export type Enlace = { href: string; texto: string; emblema?: string };

/**
 * Enlace del menú con su emblema de los libros. Al tocarlo, el emblema se
 * estampa como un sello y deja una onda de tinta (y suena una nota: ver Sonidos).
 */
export default function NavEnlace({ e, nota, className = "" }: { e: Enlace; nota: number; className?: string }) {
  const ruta = usePathname();
  const activo = e.href !== "/" && ruta.startsWith(e.href);
  const [golpe, setGolpe] = useState(0);
  return (
    <Link
      href={e.href}
      onClick={() => setGolpe((g) => g + 1)}
      aria-current={activo ? "page" : undefined}
      className={`nav-enlace ${activo ? "activo" : ""} ${className}`}
      data-sonido="nav"
      data-nota={nota}
      data-recorrido={e.href.replace(/^\//, "") || undefined}
    >
      {e.emblema && (
        <span key={golpe} className={`nav-icono ${golpe ? "golpe" : ""}`} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/emblemas/${e.emblema}.webp`} alt="" width={40} height={40} draggable={false} />
        </span>
      )}
      <span className="nav-texto">{e.texto}</span>
    </Link>
  );
}
