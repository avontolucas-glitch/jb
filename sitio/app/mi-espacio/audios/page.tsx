import { miembro } from "@/lib/miembro";
import SinAcceso from "@/components/SinAcceso";
import { audios } from "@/content/config";

export default async function Audios() {
  const { a } = await miembro();
  if (!a.audios)
    return <SinAcceso que="Los audios por tema vienen de regalo con la masterclass grabada." href="/masterclass/grabada" boton="Ver la masterclass grabada" />;
  return (
    <>
      <h1 className="titulo text-4xl">Audios por tema</h1>
      <p className="texto-2 mt-3">De regalo con la masterclass grabada. Por ahora suenan audios de muestra.</p>
      <ul className="border-t borde mt-10">
        {audios.map((x) => (
          <li key={x.id} className="border-b borde py-4">
            <p className="text-lg mb-2" id={`audio-${x.id}`}>
              {x.titulo} <span className="texto-2 italic text-base">· {x.tema}</span>
            </p>
            <audio controls preload="none" src={x.archivo} className="w-full" aria-labelledby={`audio-${x.id}`} />
          </li>
        ))}
      </ul>
    </>
  );
}
