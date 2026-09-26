import Ojo from "./Ojo";

export default function Seccion({
  titulo,
  children,
  id,
  className = "",
  conOjo = true,
}: {
  titulo?: string;
  children: React.ReactNode;
  id?: string;
  className?: string;
  conOjo?: boolean;
}) {
  return (
    <section id={id} className={`px-5 py-14 sm:py-20 ${className}`}>
      <div className="mx-auto max-w-3xl">
        {titulo && (
          <div className="mb-8 flex items-center gap-3">
            {conOjo && <Ojo size={20} />}
            <h2 className="titulo text-2xl sm:text-3xl">{titulo}</h2>
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
