"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function NavEspacio({ items }: { items: { href: string; texto: string; bloqueado?: boolean }[] }) {
  const ruta = usePathname();
  const nav = useRef<HTMLElement>(null);
  // en el celular el menú se desliza de costado: la sección en la que estás queda a la vista (sin animación)
  useEffect(() => {
    nav.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [ruta]);
  return (
    <nav ref={nav} aria-label="Tu espacio" className="relative border-b borde overflow-x-auto">
      <ul className="mx-auto max-w-5xl px-5 flex gap-6 whitespace-nowrap">
        {items.map((i) => {
          const actual = i.href === "/mi-espacio" ? ruta === i.href : ruta.startsWith(i.href);
          return (
            <li key={i.href}>
              <Link
                href={i.href}
                aria-current={actual ? "page" : undefined}
                className={`block py-3 border-b-2 ${actual ? "border-current" : "border-transparent texto-2 hover:text-[var(--texto)]"}`}
              >
                {i.texto}
                {i.bloqueado && <span className="sr-only"> (sin acceso)</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
