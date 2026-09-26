"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function MenuMovil({ enlaces }: { enlaces: { href: string; texto: string }[] }) {
  const [abierto, setAbierto] = useState(false);
  const ruta = usePathname();
  useEffect(() => setAbierto(false), [ruta]);
  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="px-2 py-1 border borde"
        aria-expanded={abierto}
        aria-controls="menu-movil"
        onClick={() => setAbierto((v) => !v)}
      >
        {abierto ? "Cerrar" : "Menú"}
      </button>
      {abierto && (
        <nav id="menu-movil" aria-label="Principal" className="oscuro absolute left-0 right-0 top-full border-b borde">
          <ul className="px-5 py-3">
            {enlaces.map((e) => (
              <li key={e.href}>
                <Link href={e.href} className="block py-3 border-b borde text-lg">
                  {e.texto}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
