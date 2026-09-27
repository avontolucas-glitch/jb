import Link from "next/link";
import { redirect } from "next/navigation";
import { cerrarSesionEnTodos } from "@/lib/auth";
import { miembro } from "@/lib/miembro";
import { accionSalir } from "@/lib/acciones";
import { horarioDesdeId } from "@/lib/sesiones";
import { conferencias, enVivo, libros } from "@/content/config";

const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });

function nombreProducto(p: string) {
  if (p === "masterclass") return "Masterclass grabada";
  if (p.startsWith("sesion:")) {
    const h = horarioDesdeId(p.slice("sesion:".length));
    return h ? `Masterclass 1 a 1 · ${h.etiqueta} (hora de Argentina)` : "Masterclass 1 a 1";
  }
  const l = libros.find((x) => `libro:${x.id}` === p);
  if (l) return `${l.titulo} · edición digital`;
  const d = enVivo.directos.find((x) => `directo:${x.id}` === p);
  if (d) return `${enVivo.titulo} · ${d.titulo}`;
  const c = conferencias.find((x) => `conferencia:${x.id}` === p);
  return c ? `Entrada · ${c.titulo}` : p;
}

/**
 * Sube la versión de sesión de la cuenta: todas las sesiones abiertas (otro teléfono,
 * una computadora prestada) dejan de valer, esta también.
 */
async function salirDeTodos() {
  "use server";
  await cerrarSesionEnTodos();
  redirect("/?sesion=cerrada");
}

export default async function Cuenta() {
  const { u, a } = await miembro();
  return (
    <>
      <h1 className="titulo text-4xl">Mi cuenta</h1>
      <dl className="mt-8 border-t borde">
        {[
          ["Nombre", u.nombre],
          ["Mail", u.email],
          ["Cuenta creada", fecha(u.creado)],
        ].map(([k, v]) => (
          <div key={k} className="border-b borde py-4 grid grid-cols-[8rem_1fr] gap-4">
            <dt className="texto-2">{k}</dt>
            <dd className="break-all">{v}</dd>
          </div>
        ))}
      </dl>

      <h2 className="text-2xl mt-12 mb-4">Compras</h2>
      {a.compras.length === 0 ? (
        <p className="texto-2">Todavía no compraste nada.</p>
      ) : (
        <ul className="border-t borde" data-testid="compras">
          {a.compras.map((c) => (
            <li key={c.id} className="border-b borde py-4 flex flex-col sm:flex-row sm:justify-between gap-1">
              <span>{nombreProducto(c.producto)}</span>
              <span className="texto-2 text-sm">
                {c.moneda} {c.monto} · {fecha(c.fecha)} · {c.medio === "simulado" ? "pago de prueba" : c.medio === "codigo" ? "código del libro impreso" : c.medio}
                {c.cancelada && (
                  <>
                    {" · "}
                    <span data-testid="compra-cancelada">
                      cancelada · reembolso por el mismo medio{c.reembolso?.estado === "simulado" ? " (simulado)" : c.reembolso?.estado === "hecho" ? " (hecho)" : " (en camino)"}
                    </span>
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      <h2 className="text-2xl mt-12 mb-3">La app</h2>
      <p className="texto-2">
        Podés tener el sitio como una app en tu teléfono o computadora.{" "}
        <Link href="/app" className="enlace">
          Cómo instalarla
        </Link>
        .
      </p>

      <div className="mt-14 border-t borde pt-8 flex flex-col sm:flex-row sm:flex-wrap gap-4">
        <form action={accionSalir}>
          <button type="submit" className="boton">
            Cerrar sesión
          </button>
        </form>
        <form action={salirDeTodos}>
          <button type="submit" className="boton" data-testid="salir-de-todos">
            Cerrar sesión en todos los dispositivos
          </button>
        </form>
      </div>
      <p className="texto-2 text-sm mt-4">
        Si entraste desde un teléfono o una computadora que ya no usás, el segundo botón cierra la sesión en todos lados, también
        acá.
      </p>
    </>
  );
}
