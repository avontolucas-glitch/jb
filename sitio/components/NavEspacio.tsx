"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavEspacio({ items }: { items: { href: string; texto: string; bloqueado?: boolean }[] }) {
  const ruta = usePathname();
  return (
    <nav aria-label="Tu espacio" className="border-b borde overflow-x-auto">
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
