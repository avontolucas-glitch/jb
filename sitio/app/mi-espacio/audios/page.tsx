import { miembro } from "@/lib/miembro";
import SinAcceso from "@/components/SinAcceso";
import { audios, libros } from "@/content/config";

export default async function Audios() {
  const { a } = await miembro();
  if (!a.audios)
    return <SinAcceso que="Los audios por tema vienen de regalo con la masterclass." href="/masterclass" boton="Ver la masterclass" />;
  return (
    <>
      <h1 className="titulo text-4xl">Audios por tema</h1>
      <p className="texto-2 mt-3">Agrupados por libro. Por ahora suenan audios de muestra.</p>
      {libros
        .filter((l) => audios.some((x) => x.libro === l.id))
        .map((l) => (
          <section key={l.id} className="mt-12">
            <h2 className="texto-2 italic mb-3">
              {l.numero} · {l.titulo}
            </h2>
            <ul className="border-t borde">
              {audios
                .filter((x) => x.libro === l.id)
                .map((x) => (
                  <li key={x.id} className="border-b borde py-4">
                    <p className="text-lg mb-2" id={`audio-${x.id}`}>
                      {x.titulo}
                    </p>
                    <audio controls preload="none" src={x.archivo} className="w-full" aria-labelledby={`audio-${x.id}`} />
                  </li>
                ))}
            </ul>
          </section>
        ))}
    </>
  );
}
