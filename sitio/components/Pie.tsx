import Link from "next/link";
import Ojo from "./Ojo";
import { redes, sitio } from "@/content/config";
import InterruptorSonido from "./InterruptorSonido";

export default function Pie() {
  return (
    <footer className="hondo border-t borde px-5 pt-12 pb-10">
      <div className="mx-auto max-w-6xl grid gap-10 sm:grid-cols-3">
        <div>
          <Ojo size={24} />
          <p className="mt-3">{sitio.nombre}</p>
          <p className="texto-2 text-sm mt-1">{sitio.dominio}</p>
        </div>
        <nav aria-label="Legales y app" className="text-sm space-y-2">
          <Link href="/legales/terminos" className="block hover:underline">Términos</Link>
          <Link href="/legales/privacidad" className="block hover:underline">Privacidad</Link>
          <Link href="/legales/reembolsos" className="block hover:underline">Reembolsos</Link>
          <Link href="/arrepentimiento" className="block hover:underline">Botón de arrepentimiento</Link>
          <Link href="/app" className="block hover:underline">Instalar la app</Link>
          <InterruptorSonido className="texto-2 pt-2" />
        </nav>
        <nav aria-label="Redes" className="text-sm space-y-2">
          {redes.map((r) => (
            <a key={r.nombre} href={r.url} className="block hover:underline" target="_blank" rel="noopener noreferrer">
              {r.nombre} <span className="texto-2">{r.usuario}</span>
            </a>
          ))}
        </nav>
      </div>
      <p className="firma text-center text-xs texto-2 mt-12">
        {sitio.nombre} · {sitio.anio}
      </p>
    </footer>
  );
}
