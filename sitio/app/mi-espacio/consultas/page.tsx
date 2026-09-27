import type { Metadata } from "next";
import Link from "next/link";
import { miembro } from "@/lib/miembro";
import { accionModerarTicket } from "@/lib/acciones-tickets";
import { deCuenta, ESTADOS, esModerador, TIPOS, todos, type EstadoTicket, type Ticket } from "@/lib/tickets";

export const metadata: Metadata = { title: "Consultas" };
export const dynamic = "force-dynamic";

const fecha = (iso: string) => new Date(iso).toLocaleString("es-AR", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Argentina/Buenos_Aires" });

function Etiqueta({ e }: { e: EstadoTicket }) {
  return (
    <span className={`text-xs border px-2 py-0.5 ${e === "resuelto" ? "borde texto-2" : "border-current"}`} data-testid="estado-ticket">
      {ESTADOS[e]}
    </span>
  );
}

/** Mi espacio → Consultas: los moderadores ven todas y las responden; cada persona ve las suyas. */
export default async function Consultas({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const { u } = await miembro();
  const moderador = esModerador(u);
  const { estado } = await searchParams;

  if (!moderador) {
    const mias = await deCuenta(u.id);
    return (
      <>
        <h1 className="titulo text-4xl">Mis consultas</h1>
        {mias.length === 0 ? (
          <p className="texto-2 mt-6">
            No dejaste ninguna consulta. Si algo no se resuelve, preguntale a Yo Da (el ojo de abajo a la derecha): si hace falta, te ofrece
            escribirle a una persona.
          </p>
        ) : (
          <ul className="border-t borde mt-8">
            {mias.map((t) => (
              <li key={t.id} className="border-b borde py-5" data-testid={`mi-ticket-${t.id}`}>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="cifras">{t.id}</span>
                  <Etiqueta e={t.estado} />
                  <span className="texto-2 text-sm">
                    {TIPOS[t.tipo]} · {fecha(t.creado)}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-line">{t.mensaje}</p>
              </li>
            ))}
          </ul>
        )}
      </>
    );
  }

  const lista = await todos();
  const filtro = (Object.keys(ESTADOS) as EstadoTicket[]).includes(estado as EstadoTicket) ? (estado as EstadoTicket) : null;
  const vistas = filtro ? lista.filter((t) => t.estado === filtro) : lista.filter((t) => t.estado !== "resuelto");
  const abiertas = lista.filter((t) => t.estado === "abierto").length;
  return (
    <>
      <h1 className="titulo text-4xl">Consultas</h1>
      <p className="texto-2 mt-2">
        Lo que la gente dejó desde Yo Da cuando no pudo resolverlo con él. {abiertas === 1 ? "Hay 1 abierta." : `Hay ${abiertas} abiertas.`}
      </p>
      <nav className="flex flex-wrap gap-2 mt-6 text-sm" aria-label="Filtrar consultas">
        {[{ k: null, t: "Pendientes" }, ...(Object.keys(ESTADOS) as EstadoTicket[]).map((k) => ({ k, t: ESTADOS[k] }))].map((x) => (
          <Link
            key={x.t}
            href={x.k ? `/mi-espacio/consultas?estado=${x.k}` : "/mi-espacio/consultas"}
            className={`boton !py-1 !px-3 ${filtro === x.k ? "boton-lleno" : ""}`}
            aria-current={filtro === x.k ? "page" : undefined}
          >
            {x.t}
          </Link>
        ))}
      </nav>
      {vistas.length === 0 ? (
        <p className="texto-2 mt-8">No hay consultas acá.</p>
      ) : (
        <ul className="border-t borde mt-8">
          {vistas.map((t: Ticket) => (
            <li key={t.id} className="border-b borde py-6" data-testid={`ticket-${t.id}`}>
              <div className="flex flex-wrap items-center gap-3">
                <span className="cifras text-lg">{t.id}</span>
                <Etiqueta e={t.estado} />
                <span className="texto-2 text-sm">
                  {TIPOS[t.tipo]} · {fecha(t.creado)} · desde {t.pagina}
                </span>
              </div>
              <p className="mt-2">
                {t.nombre} ·{" "}
                <a className="enlace break-all" href={`mailto:${t.email}?subject=${encodeURIComponent(`Tu consulta ${t.id} · julianbermudez.com`)}`}>
                  {t.email}
                </a>
              </p>
              <p className="mt-3 whitespace-pre-line">{t.mensaje}</p>
              {t.conversacion.length > 0 && (
                <details className="mt-3 text-sm">
                  <summary className="texto-2 cursor-pointer">Lo que habló con Yo Da ({t.conversacion.length})</summary>
                  <ol className="mt-2 space-y-1 border-l borde pl-3">
                    {t.conversacion.map((m, i) => (
                      <li key={i} className={m.de === "vos" ? "italic" : "texto-2"}>
                        {m.de === "vos" ? "Persona" : "Yo Da"}: {m.texto}
                      </li>
                    ))}
                  </ol>
                </details>
              )}
              <form action={accionModerarTicket} className="mt-4 flex flex-wrap items-end gap-3">
                <input type="hidden" name="id" value={t.id} />
                <label className="text-sm">
                  <span className="texto-2 block mb-1">Estado</span>
                  <select name="estado" defaultValue={t.estado} className="zona-select" data-testid="ticket-estado">
                    {(Object.keys(ESTADOS) as EstadoTicket[]).map((k) => (
                      <option key={k} value={k}>
                        {ESTADOS[k]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm flex-1 min-w-[12rem]">
                  <span className="texto-2 block mb-1">Nota interna (la persona no la ve)</span>
                  <input name="nota" defaultValue={t.nota ?? ""} maxLength={1000} className="w-full bg-transparent border-b borde py-1" />
                </label>
                <button type="submit" className="boton !py-1 !px-3 text-sm" data-testid="ticket-guardar">
                  Guardar
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
