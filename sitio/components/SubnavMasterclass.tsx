import Link from "next/link";

/** La masterclass es una sola sección con tres formas: en vivo, 1 a 1 y grabada. */
export default function SubnavMasterclass({ actual }: { actual: "vivo" | "uno" | "grabada" }) {
  const item = (href: string, texto: string, activo: boolean) => (
    <Link
      href={href}
      aria-current={activo ? "page" : undefined}
      className={`px-4 sm:px-6 py-2 border borde transition-colors duration-500 ${activo ? "bg-[var(--texto)] text-[var(--fondo)]" : "texto-2 hover:text-[var(--texto)]"}`}
    >
      {texto}
    </Link>
  );
  return (
    <nav aria-label="Masterclass" className="flex justify-center -mt-6 mb-2 relative z-10" data-testid="subnav-masterclass">
      <div className="inline-flex text-sm tracking-wide">
        {item("/masterclass", "En vivo", actual === "vivo")}
        {item("/masterclass/1-a-1", "1 a 1", actual === "uno")}
        {item("/masterclass/grabada", "Grabada", actual === "grabada")}
      </div>
    </nav>
  );
}
