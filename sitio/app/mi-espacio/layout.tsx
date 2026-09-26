import type { Metadata } from "next";
import NavEspacio from "@/components/NavEspacio";
import { miembro } from "@/lib/miembro";

export const metadata: Metadata = { title: "Mi espacio", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function LayoutEspacio({ children }: { children: React.ReactNode }) {
  const { a } = await miembro();
  const items = [
    { href: "/mi-espacio", texto: "Inicio" },
    { href: "/mi-espacio/en-vivo", texto: "Masterclass", bloqueado: a.directos.length === 0 },
    { href: "/mi-espacio/sesiones", texto: "Sesiones", bloqueado: a.sesiones.length === 0 },
    { href: "/mi-espacio/biblioteca", texto: "Biblioteca", bloqueado: a.libros.length === 0 },
    { href: "/mi-espacio/masterclass", texto: "Masterclass grabada", bloqueado: !a.masterclass },
    { href: "/mi-espacio/audios", texto: "Audios", bloqueado: !a.audios },
    { href: "/mi-espacio/conferencias", texto: "Conferencias", bloqueado: a.conferencias.length === 0 },
    { href: "/mi-espacio/encuentro", texto: "Encuentro", bloqueado: !a.encuentro },
    { href: "/mi-espacio/cuenta", texto: "Mi cuenta" },
  ];
  return (
    <div className="min-h-[70vh]">
      <NavEspacio items={items} />
      <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">{children}</div>
    </div>
  );
}
