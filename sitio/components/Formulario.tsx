"use client";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import type { Estado } from "@/lib/acciones";
import Desafio, { faseOcupada, type Fase } from "./Desafio";
import { CAMPO_TIEMPO, CAMPO_TRAMPA } from "@/lib/trampas";

/** Mientras la casilla está verificando, «Enviar» espera (si no, el pedido sale sin token). */
export const ESPERA_VERIFICACION = "Esperá a que termine la verificación";

function Enviar({ texto, enviando, pendiente, verificando }: { texto: string; enviando: string; pendiente: boolean; verificando: boolean }) {
  return (
    <button type="submit" className="boton boton-lleno w-full sm:w-auto" disabled={pendiente || verificando}>
      {pendiente ? enviando : verificando ? ESPERA_VERIFICACION : texto}
    </button>
  );
}

/**
 * Los dos campos contra bots de lib/trampas.ts, que van en todos los formularios:
 * - «sitio_web»: fuera de la vista (no con display:none, que algunos bots detectan),
 *   escondido para los lectores de pantalla, sin foco y sin autocompletar. Una persona
 *   no lo llena; un bot que completa todo, sí.
 * - «jb_t»: cuántos milisegundos pasaron desde que se mostró el formulario. Se completa
 *   justo al enviar (el onSubmit corre antes de que React arme el FormData). Sin
 *   JavaScript queda vacío y el servidor no decide nada por el tiempo.
 */
function Trampas({ tiempo }: { tiempo: React.RefObject<HTMLInputElement | null> }) {
  return (
    <>
      <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", top: "auto", width: 1, height: 1, overflow: "hidden" }}>
        <label>
          Sitio web
          <input type="text" name={CAMPO_TRAMPA} tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <input ref={tiempo} type="hidden" name={CAMPO_TIEMPO} defaultValue="" />
    </>
  );
}

/**
 * Formulario con mensaje de error o de éxito debajo del botón.
 * Si la acción pide verificación ({ verificar: true }), muestra la casilla
 * «Confirmá que sos una persona» antes del botón; al reenviar, va su token.
 *
 * Lo escrito no se borra al enviar: React 19 vacía el formulario después de cada
 * <form action={fn}>, salga bien o mal, y con la verificación (o un error) la persona
 * perdía el mail, la clave o la pregunta entera. Por eso el envío va por onSubmit
 * (preventDefault + la acción dentro de startTransition), que no pide ese reseteo.
 * `action={enviar}` queda igual para que ande sin JavaScript.
 */
export default function Formulario({
  accion,
  children,
  boton,
  enviando = "Enviando…",
  ocultarAlTerminar = false,
  className = "",
}: {
  accion: (e: Estado, f: FormData) => Promise<Estado>;
  children: React.ReactNode;
  boton: string;
  enviando?: string;
  ocultarAlTerminar?: boolean;
  className?: string;
}) {
  const [estado, enviar, pendiente] = useActionState(accion, null);
  const [fase, setFase] = useState<Fase>("inicial");
  const formulario = useRef<HTMLFormElement>(null);
  const tiempo = useRef<HTMLInputElement>(null);
  const mostrado = useRef(0);
  useEffect(() => {
    mostrado.current = performance.now();
  }, []);
  const marcarTiempo = () => {
    if (tiempo.current && mostrado.current) tiempo.current.value = String(Math.round(performance.now() - mostrado.current));
  };
  // salió bien: recién ahí se vacía (así no se manda dos veces lo mismo)
  useEffect(() => {
    if (estado?.ok) formulario.current?.reset();
  }, [estado]);
  const verificar = !!(estado?.verificar || estado?.desafio);
  const verificando = verificar && faseOcupada(fase);
  const alEnviar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pendiente || verificando) return;
    marcarTiempo();
    const datos = new FormData(e.currentTarget);
    startTransition(() => enviar(datos));
  };
  if (estado?.ok && ocultarAlTerminar) {
    return (
      <p role="status" className="border borde p-5" data-testid="mensaje-ok">
        {estado.ok}
      </p>
    );
  }
  return (
    <form ref={formulario} action={enviar} onSubmit={alEnviar} className={`space-y-6 ${className}`} noValidate>
      <Trampas tiempo={tiempo} />
      {children}
      {verificar && <Desafio reinicio={estado} alCambiarFase={setFase} />}
      <div className="pt-2">
        <Enviar texto={boton} enviando={enviando} pendiente={pendiente} verificando={verificando} />
      </div>
      <div aria-live="polite">
        {estado?.error && (
          <p role="alert" className="border-l-2 pl-3" style={{ borderColor: "currentColor" }} data-testid="mensaje-error">
            {estado.error}
          </p>
        )}
        {estado?.ok && !ocultarAlTerminar && (
          <p role="status" data-testid="mensaje-ok">
            {estado.ok}
          </p>
        )}
      </div>
    </form>
  );
}

export function Campo({
  nombre,
  etiqueta,
  tipo = "text",
  autoComplete,
  requerido = true,
  defecto,
  ayuda,
  min,
  max,
  step,
  maxLength,
}: {
  nombre: string;
  etiqueta: string;
  tipo?: string;
  autoComplete?: string;
  requerido?: boolean;
  defecto?: string;
  ayuda?: string;
  /** Para fechas y horas: el selector del teléfono no ofrece lo que queda afuera. */
  min?: string;
  max?: string;
  step?: number;
  /** El mismo tope que aplica el servidor (lib/acciones.ts), para no escribir de más. */
  maxLength?: number;
}) {
  const id = `campo-${nombre}`;
  return (
    <div>
      <label htmlFor={id} className="etiqueta">
        {etiqueta}
      </label>
      <input
        id={id}
        name={nombre}
        type={tipo}
        autoComplete={autoComplete}
        required={requerido}
        defaultValue={defecto}
        min={min}
        max={max}
        step={step}
        maxLength={maxLength}
        className="campo"
        aria-describedby={ayuda ? `${id}-ayuda` : undefined}
      />
      {ayuda && (
        <p id={`${id}-ayuda`} className="texto-2 text-sm mt-1">
          {ayuda}
        </p>
      )}
    </div>
  );
}
