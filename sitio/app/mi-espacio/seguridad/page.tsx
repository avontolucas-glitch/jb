import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { miembro } from "@/lib/miembro";
import { esAdmin, estadoSesiones } from "@/lib/auth";
import { resumen, ultimos, type EventoSeguridad, type RegistroSeguridad } from "@/lib/registro-seguridad";
import { desafioActivo } from "@/lib/desafio";
import { secretoPropio } from "@/lib/cliente";
import { secretoValido } from "@/lib/totp";

export const metadata: Metadata = { title: "Seguridad", robots: { index: false } };
export const dynamic = "force-dynamic";

const NOMBRES: Record<EventoSeguridad, string> = {
  login_fallido: "Ingreso fallido",
  login_ok: "Ingreso",
  totp_fallido: "Código de la app equivocado",
  bloqueo: "Bloqueo",
  limite: "Límite alcanzado",
  alerta: "Alerta",
  desafio_pedido: "Verificación pedida",
  desafio_ok: "Verificación resuelta",
  desafio_fallido: "Verificación fallida",
  bot: "Bot detectado",
  cuenta_creada: "Cuenta creada",
  admin_accion: "Acción en tu cuenta",
  admin_ingreso: "Ingreso a tu cuenta",
};

const FUNCIONES: Record<string, string> = {
  login: "ingresar",
  loginAdmin: "tu cuenta",
  crearCuenta: "crear cuenta",
  canjear: "canjear código",
  arrepentimiento: "arrepentimiento",
  lista: "lista de avisos",
  pregunta: "preguntas",
  nota: "nota del encuentro",
  pagar: "pagar",
  progreso: "progreso",
  agenda: "agenda",
  desafio: "verificación",
};

const fmt = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** Un detalle corto y legible: qué función, qué motivo, cuántas veces se repitió. */
function detalle(r: RegistroSeguridad): string {
  const d = r.datos ?? {};
  const partes: string[] = [];
  if (typeof d.funcion === "string")
    partes.push(
      d.funcion
        .split("+")
        .map((f) => (Object.hasOwn(FUNCIONES, f) ? FUNCIONES[f] : f))
        .join(" · "),
    );
  if (typeof d.motivo === "string") partes.push(d.motivo);
  if (typeof d.accion === "string") partes.push(d.accion.replace(/_/g, " "));
  if (typeof d.reintentoSeg === "number" && d.reintentoSeg > 0) partes.push(`${Math.ceil(d.reintentoSeg / 60)} min`);
  if (r.omitidos) partes.push(`y ${r.omitidos} más iguales`);
  return partes.join(" · ");
}

/** Panel de Julián: qué pasó en las últimas horas. Solo para su cuenta. */
export default async function Seguridad() {
  const { u } = await miembro();
  if (!esAdmin(u)) notFound();
  const [r, eventos] = await Promise.all([resumen(24), ultimos(80)]);
  const n = (e: EventoSeguridad) => r[e] ?? 0;

  const cifras = [
    { t: "Bloqueos", v: n("bloqueo"), a: "Alguien insistió demasiado y tuvo que esperar." },
    { t: "Límites alcanzados", v: n("limite"), a: "Pedidos de más, frenados sin bloquear." },
    { t: "Verificaciones pedidas", v: n("desafio_pedido"), a: "Veces que se pidió «Confirmá que sos una persona»." },
    { t: "Verificaciones resueltas", v: n("desafio_ok"), a: `Fallidas: ${n("desafio_fallido")}.` },
    { t: "Ingresos fallidos", v: n("login_fallido") + n("totp_fallido"), a: `Con el código de la app: ${n("totp_fallido")}.` },
    { t: "Bots detectados", v: n("bot"), a: `Alertas: ${n("alerta")}.` },
  ];

  const sesiones = estadoSesiones();
  const totp = (process.env.ADMIN_TOTP_SECRET ?? "").trim();
  const upstash = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
  const estado = [
    {
      t: "Sesiones",
      v: sesiones.respaldo
        ? "Con la llave pública de respaldo: falta SESSION_SECRET en el sitio publicado. La cuenta de Julián no entra hasta cargarla."
        : secretoPropio
          ? "Con llave propia."
          : "Con la llave de prueba del prototipo (cargar SESSION_SECRET antes de publicar).",
    },
    {
      t: "Cuenta de Julián",
      v: sesiones.cuentaAdmin
        ? `Apagada: ${sesiones.cuentaAdmin === "falta SESSION_SECRET" ? "falta SESSION_SECRET." : `ADMIN_CLAVE no cumple la política (${sesiones.cuentaAdmin})`}`
        : process.env.ADMIN_EMAIL && process.env.ADMIN_CLAVE
          ? "Activa (ADMIN_EMAIL y ADMIN_CLAVE)."
          : "Sin configurar (ADMIN_EMAIL y ADMIN_CLAVE).",
    },
    {
      t: "Código de la app para tu cuenta",
      v: !totp ? "Sin configurar (ADMIN_TOTP_SECRET)." : secretoValido(totp) ? "Activo." : "Mal cargado: revisar ADMIN_TOTP_SECRET.",
    },
    { t: "Verificación", v: desafioActivo() === "turnstile" ? "Cloudflare Turnstile." : "Prueba en el navegador (sin Turnstile)." },
    { t: "Límites", v: upstash ? "Compartidos entre servidores (Upstash)." : "En la memoria de cada servidor." },
  ];

  return (
    <div data-testid="seguridad-panel">
      <h1 className="titulo text-4xl">Seguridad</h1>
      <p className="texto-2 text-lg mt-3">Lo que pasó en el sitio en las últimas 24 horas. Nunca se guardan direcciones IP ni mails: solo una huella.</p>

      <section className="mt-12" aria-labelledby="resumen">
        <h2 id="resumen" className="text-2xl mb-4">
          Últimas 24 horas
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-px border borde" data-testid="seguridad-resumen">
          {cifras.map((c) => (
            <div key={c.t} className="p-5 border-b borde sm:[&:nth-last-child(-n+2)]:border-b-0">
              <dt className="texto-2 text-sm">{c.t}</dt>
              <dd className="text-3xl mt-1 tabular-nums">{c.v}</dd>
              <dd className="texto-2 text-xs mt-2">{c.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-12" aria-labelledby="estado">
        <h2 id="estado" className="text-2xl mb-4">
          Cómo está configurado
        </h2>
        <dl className="border-t borde">
          {estado.map((e) => (
            <div key={e.t} className="border-b borde py-4 grid grid-cols-1 sm:grid-cols-[14rem_1fr] gap-1 sm:gap-4">
              <dt className="texto-2">{e.t}</dt>
              <dd>{e.v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-12" aria-labelledby="eventos">
        <h2 id="eventos" className="text-2xl mb-4">
          Últimos eventos
        </h2>
        {eventos.length === 0 ? (
          <p className="texto-2 border-t borde pt-5">Todavía no hay nada anotado.</p>
        ) : (
          <ul className="border-t borde" data-testid="seguridad-eventos">
            {eventos.map((e, i) => (
              <li key={`${e.fecha}-${i}`} className="border-b borde py-3 grid grid-cols-[6.5rem_1fr] sm:grid-cols-[8rem_1fr_6rem] gap-x-4 gap-y-1 text-sm">
                <time dateTime={e.fecha} className="texto-2 tabular-nums">
                  {fmt.format(new Date(e.fecha))}
                </time>
                <div>
                  <p>{Object.hasOwn(NOMBRES, e.evento) ? NOMBRES[e.evento] : e.evento}</p>
                  {detalle(e) && <p className="texto-2 text-xs mt-0.5">{detalle(e)}</p>}
                </div>
                <code className="texto-2 text-xs col-start-2 sm:col-start-auto sm:text-right" title="Huella de la conexión (no es la IP)">
                  {e.ip ? e.ip.slice(0, 8) : "—"}
                </code>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
