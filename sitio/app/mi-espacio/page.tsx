import Link from "next/link";
import Hora from "@/components/Hora";
import { miembro } from "@/lib/miembro";
import Precio from "@/components/Precio";
import { conferencias, encuentro, enVivo, libros, precios, sesiones } from "@/content/config";
import { horarioDesdeId } from "@/lib/sesiones";
import { esAdmin } from "@/lib/auth";
import { reservasFuturas } from "@/lib/agenda";

export default async function Espacio() {
  const { u, a } = await miembro();
  const nombre = u.nombre.replace(/\s*\(demo\)$/, "");
  const mias = conferencias.filter((c) => a.conferencias.includes(c.id));
  const directos = enVivo.directos.filter((d) => a.directos.includes(d.id));
  const admin = esAdmin(u);
  const reservas = admin ? (await reservasFuturas()).length : 0;
  return (
    <>
      <h1 className="titulo text-4xl">Hola, {nombre}.</h1>
      {admin && (
        <div className="border borde p-5 mt-6" data-testid="acceso-agenda">
          <Link href="/mi-espacio/agenda" className="text-xl enlace">
            Tu agenda de la {sesiones.titulo}
          </Link>
          <p className="texto-2 mt-1" data-testid="reservas-por-delante">
            {reservas === 0 ? "Todavía no hay reservas por delante." : reservas === 1 ? "Una reserva por delante." : `${reservas} reservas por delante.`}{" "}
            Horarios, bloqueos y reservas.
          </p>
        </div>
      )}
      {/* la cuenta de Julián no compra: no se le ofrece «por dónde empezar» (ni su propia Masterclass 1 a 1) */}
      {admin && !a.algo ? null : !a.algo ? (
        <div data-testid="espacio-vacio">
          <p className="texto-2 text-lg mt-4">Todavía no tenés nada acá. Cuando compres algo, aparece en este lugar.</p>
          <h2 className="text-2xl mt-12 mb-4">Por dónde empezar</h2>
          <ul className="border-t borde">
            <li className="border-b borde py-5">
              <Link href="/masterclass" className="text-xl enlace">
                La masterclass, con Julián en vivo
              </Link>
              <p className="texto-2 mt-1">
                Una vez por semana. Pagás lo que quieras, desde {enVivo.moneda} {enVivo.minimo}.
              </p>
            </li>
            <li className="border-b borde py-5">
              <Link href="/masterclass/grabada" className="text-xl enlace">
                La masterclass grabada
              </Link>
              <p className="texto-2 mt-1">
                Con los audios por tema y el encuentro de preguntas de regalo. <Precio {...precios.masterclass} />
              </p>
            </li>
            <li className="border-b borde py-5">
              <Link href="/masterclass/1-a-1" className="text-xl enlace">
                La Masterclass 1 a 1 con Julián
              </Link>
              <p className="texto-2 mt-1">
                Uno a uno, {sesiones.modalidad.toLowerCase()}. <Precio {...precios.sesionPrivada} />
              </p>
            </li>
            <li className="border-b borde py-5">
              <Link href="/canjear" className="text-xl enlace">
                ¿Tenés un libro impreso?
              </Link>
              <p className="texto-2 mt-1">Cargá su código y leelo también acá.</p>
            </li>
            <li className="border-b borde py-5">
              <Link href="/conferencias" className="text-xl enlace">
                Una conferencia
              </Link>
              <p className="texto-2 mt-1">
                Entrada simbólica. <Precio {...precios.conferenciaPrivada} />
              </p>
            </li>
          </ul>
        </div>
      ) : (
        <div data-testid="tus-accesos">
          <h2 className="text-2xl mt-10 mb-4">Tus accesos</h2>
          <ul className="border-t borde">
            {a.masterclass && (
              <>
                <li className="border-b borde py-5">
                  <Link href="/mi-espacio/masterclass" className="text-xl enlace">
                    Masterclass grabada
                  </Link>
                  <p className="texto-2 mt-1">Seguí desde donde dejaste.</p>
                </li>
                <li className="border-b borde py-5">
                  <Link href="/mi-espacio/audios" className="text-xl enlace">
                    Audios por tema
                  </Link>
                </li>
                <li className="border-b borde py-5">
                  <Link href="/mi-espacio/encuentro" className="text-xl enlace">
                    Encuentro de preguntas
                  </Link>
                  <p className="texto-2 mt-1">Próximo: {encuentro.proximo}</p>
                </li>
              </>
            )}
            {a.sesiones.map((id) => {
              const h = horarioDesdeId(id);
              return h ? (
                <li key={id} className="border-b borde py-5">
                  <Link href="/mi-espacio/sesiones" className="text-xl enlace">
                    Masterclass 1 a 1
                  </Link>
                  <p className="texto-2 mt-1">
                    <Hora inicio={h.fecha.toISOString()} />
                  </p>
                </li>
              ) : null;
            })}
            {libros
              .filter((l) => a.libros.includes(l.id))
              .map((l) => (
                <li key={l.id} className="border-b borde py-5">
                  <Link href={`/mi-espacio/biblioteca/${l.id}`} className="text-xl enlace">
                    {l.titulo}
                  </Link>
                  <p className="texto-2 mt-1">Para leer en la biblioteca</p>
                </li>
              ))}
            {directos.map((d) => (
              <li key={d.id} className="border-b borde py-5">
                <Link href={`/mi-espacio/en-vivo/${d.id}`} prefetch={false} className="text-xl enlace">
                  {d.titulo}
                </Link>
                <p className="texto-2 mt-1">En vivo · {d.fecha}</p>
              </li>
            ))}
            {mias.map((c) => (
              <li key={c.id} className="border-b borde py-5">
                <Link href="/mi-espacio/conferencias" className="text-xl enlace">
                  {c.titulo}
                </Link>
                <p className="texto-2 mt-1">{c.fecha}</p>
              </li>
            ))}
          </ul>
          {!a.masterclass && (
            <p className="texto-2 mt-10">
              También está la{" "}
              <Link href="/masterclass" className="enlace">
                masterclass
              </Link>
              .
            </p>
          )}
        </div>
      )}
    </>
  );
}
