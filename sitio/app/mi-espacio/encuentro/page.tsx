import { miembro } from "@/lib/miembro";
import { leer } from "@/lib/db";
import { accionPregunta, type Pregunta } from "@/lib/acciones";
import SinAcceso from "@/components/SinAcceso";
import Formulario from "@/components/Formulario";
import { encuentro } from "@/content/config";

const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });

export default async function Encuentro() {
  const { u, a } = await miembro();
  if (!a.encuentro)
    return <SinAcceso que="El encuentro de preguntas viene de regalo con la masterclass." href="/masterclass" boton="Ver la masterclass" />;
  const mias = (await leer<Pregunta[]>("preguntas")).filter((p) => p.usuario === u.id).reverse();
  return (
    <>
      <h1 className="titulo text-4xl">Encuentro de preguntas</h1>
      <p className="mt-4 text-lg">
        Próximo encuentro: <strong>{encuentro.proximo}</strong> · {encuentro.modalidad}
      </p>
      <p className="texto-2 mt-3 prosa">{encuentro.explicacion}</p>
      <section className="mt-12">
        <h2 className="text-2xl mb-4">Mandá tu pregunta</h2>
        <Formulario accion={accionPregunta} boton="Enviar pregunta">
          <div>
            <label htmlFor="campo-pregunta" className="etiqueta">
              Tu pregunta
            </label>
            <textarea id="campo-pregunta" name="pregunta" required maxLength={1500} className="campo" />
          </div>
        </Formulario>
      </section>
      <section className="mt-14">
        <h2 className="text-2xl mb-4">Las que ya mandaste</h2>
        {mias.length === 0 ? (
          <p className="texto-2">Todavía no mandaste ninguna.</p>
        ) : (
          <ul className="border-t borde" data-testid="mis-preguntas">
            {mias.map((p) => (
              <li key={p.id} className="border-b borde py-4">
                <p className="whitespace-pre-line">{p.texto}</p>
                <p className="texto-2 text-sm mt-1">{fecha(p.fecha)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
