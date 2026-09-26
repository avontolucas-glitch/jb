"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { Estado } from "@/lib/acciones";

function Enviar({ texto, enviando }: { texto: string; enviando: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="boton boton-lleno w-full sm:w-auto" disabled={pending}>
      {pending ? enviando : texto}
    </button>
  );
}

/** Formulario con mensaje de error o de éxito debajo del botón. */
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
  const [estado, enviar] = useActionState(accion, null);
  if (estado?.ok && ocultarAlTerminar) {
    return (
      <p role="status" className="border borde p-5" data-testid="mensaje-ok">
        {estado.ok}
      </p>
    );
  }
  return (
    <form action={enviar} className={`space-y-6 ${className}`} noValidate>
      {children}
      <div className="pt-2">
        <Enviar texto={boton} enviando={enviando} />
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
}: {
  nombre: string;
  etiqueta: string;
  tipo?: string;
  autoComplete?: string;
  requerido?: boolean;
  defecto?: string;
  ayuda?: string;
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
