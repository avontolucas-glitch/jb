"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import NavEnlace, { type Enlace } from "./NavEnlace";
import InterruptorSonido from "./InterruptorSonido";

export default function MenuMovil({ enlaces, cuenta }: { enlaces: Enlace[]; cuenta: Enlace }) {
  const [abierto, setAbierto] = useState(false);
  const ruta = usePathname();
  useEffect(() => setAbierto(false), [ruta]);
  return (
    <div className="xl:hidden flex items-center gap-1.5 shrink-0">
      <Link href={cuenta.href} className="boton py-1 px-2.5 text-[0.92rem]" data-testid="cuenta-movil">
        {cuenta.texto}
      </Link>
      <button
        type="button"
        className="px-2 py-1 border borde min-w-[4.2rem] text-[0.95rem]"
        aria-expanded={abierto}
        aria-controls="menu-movil"
        onClick={() => setAbierto((v) => !v)}
      >
        {abierto ? "Cerrar" : "Menú"}
      </button>
      {abierto && (
        <nav id="menu-movil" aria-label="Principal" className="oscuro absolute left-0 right-0 top-full border-b borde menu-abre">
          <ul className="px-5 py-3">
            {enlaces.map((e, i) => (
              <li key={e.href} className="border-b borde" style={{ ["--i" as string]: i }}>
                <NavEnlace e={e} nota={i} className="py-3 text-lg" />
              </li>
            ))}
            <li className="flex items-center justify-between gap-4 py-3 text-sm texto-2">
              <Link href="/app" className="enlace">
                Instalar la app
              </Link>
              <InterruptorSonido />
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
