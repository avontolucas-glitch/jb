import Link from "next/link";
import OjoVivo from "./OjoVivo";
import MenuMovil from "./MenuMovil";
import { usuarioActual } from "@/lib/auth";
import { sitio } from "@/content/config";

export const enlaces = [
  { href: "/libros", texto: "Libros" },
  { href: "/conferencias", texto: "Conferencias" },
  { href: "/masterclass", texto: "Masterclass" },
  { href: "/en-vivo", texto: "En vivo" },
  { href: "/fragmentos", texto: "Fragmentos" },
  { href: "/lista", texto: "Sumate a la lista" },
];

export default async function Encabezado() {
  const u = await usuarioActual();
  const cuenta = u ? { href: "/mi-espacio", texto: "Mi espacio" } : { href: "/ingresar", texto: "Ingresar" };
  return (
    <header className="oscuro border-b borde sticky top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/" className="flex items-center gap-2.5" aria-label={`${sitio.nombre}, inicio`}>
          <OjoVivo size={26} />
          <span className="text-lg tracking-wide">{sitio.nombre}</span>
        </Link>
        <nav aria-label="Principal" className="hidden lg:flex items-center gap-5 text-[0.98rem]">
          {enlaces.map((e) => (
            <Link key={e.href} href={e.href} className="hover:underline underline-offset-4">
              {e.texto}
            </Link>
          ))}
          <Link href={cuenta.href} className="boton py-1.5 px-4">
            {cuenta.texto}
          </Link>
        </nav>
        <MenuMovil enlaces={[...enlaces, cuenta]} />
      </div>
    </header>
  );
}
