import Link from "next/link";
import OjoVivo from "./OjoVivo";
import MenuMovil from "./MenuMovil";
import NavEnlace from "./NavEnlace";
import InstalarCabecera from "./InstalarCabecera";
import { usuarioActual } from "@/lib/auth";
import { sitio } from "@/content/config";

export const enlaces = [
  { href: "/libros", texto: "Libros", emblema: "pensamiento-2-observador-eterno" },
  { href: "/masterclass", texto: "Masterclass", emblema: "receta-5-cargar-el-estado" },
  { href: "/conferencias", texto: "Conferencias", emblema: "pensamiento-0-la-palabra" },
  { href: "/fragmentos", texto: "Fragmentos", emblema: "pensamiento-6-atravesar-el-tiempo" },
  { href: "/lista", texto: "Sumate", emblema: "biografia-0-primera-imagen" },
];

export default async function Encabezado() {
  const u = await usuarioActual();
  const cuenta = u ? { href: "/mi-espacio", texto: "Mi espacio" } : { href: "/ingresar", texto: "Ingresar" };
  return (
    <header className="oscuro border-b borde sticky top-0 z-40">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-4 px-4 sm:px-5 py-3">
        <Link href="/" className="flex items-center gap-2 min-w-0" aria-label={`${sitio.nombre}, inicio`}>
          <OjoVivo size={26} />
          <span className="text-[0.95rem] sm:text-lg sm:tracking-wide whitespace-nowrap">{sitio.nombre}</span>
        </Link>
        <nav aria-label="Principal" className="hidden xl:flex items-center gap-4 text-[0.96rem]">
          {enlaces.map((e, i) => (
            <NavEnlace key={e.href} e={e} nota={i} />
          ))}
          <InstalarCabecera />
          <Link href={cuenta.href} className="boton py-1.5 px-4 ml-1">
            {cuenta.texto}
          </Link>
        </nav>
        <MenuMovil enlaces={enlaces} cuenta={cuenta} />
      </div>
    </header>
  );
}
