"use client";
import { startTransition, useActionState, useEffect, useState } from "react";
import Link from "next/link";
import Desafio, { faseOcupada, type Fase } from "./Desafio";
import { ESPERA_VERIFICACION } from "./Formulario";
import { accionCrearTicket, type EstadoTicketForm } from "@/lib/acciones-tickets";

const TIPOS = [
  { v: "consulta", t: "Consulta" },
  { v: "queja", t: "Queja" },
  { v: "compra", t: "Problema con una compra" },
] as const;

function Enviar({ pendiente, verificando }: { pendiente: boolean; verificando: boolean }) {
  return (
    <button type="submit" className="yosoy-accion" disabled={pendiente || verificando} data-sonido="campana">
      {pendiente ? "Enviando…" : verificando ? ESPERA_VERIFICACION : "Dejar mi consulta"}
    </button>
  );
}

/**
 * La consulta a una persona, dentro de Yo Da. Solo aparece cuando la persona ya
 * lo intentó con el bot y no se resolvió (lo decide YoSoy.tsx). Lleva lo que
 * habló con Yo Da, para que quien responda sepa qué intentó.
 */
export default function TicketYoDa({ conversacion }: { conversacion: { de: "yo" | "vos"; texto: string }[] }) {
  const [estado, enviar, pendiente] = useActionState<EstadoTicketForm, FormData>(accionCrearTicket, null);
  const [fase, setFase] = useState<Fase>("inicial");
  const verificando = !!estado?.verificar && faseOcupada(fase);
  const [desde, setDesde] = useState(0);
  const [pagina, setPagina] = useState("/");
  useEffect(() => {
    setDesde(Date.now());
    setPagina(window.location.pathname);
  }, []);

  if (estado?.ok)
    return (
      <div className="w-full" data-testid="ticket-ok">
        <p className="italic">{estado.ok}</p>
        <Link href="/mi-espacio/consultas" className="yosoy-accion inline-block mt-2">
          Ver mis consultas
        </Link>
      </div>
    );

  return (
    // Por onSubmit (como components/Formulario.tsx): así React no vacía el mensaje si la acción pide la verificación.
    <form
      action={enviar}
      onSubmit={(e) => {
        e.preventDefault();
        if (pendiente || verificando) return;
        const datos = new FormData(e.currentTarget);
        startTransition(() => enviar(datos));
      }}
      className="w-full space-y-3 mt-1"
      data-testid="ticket-form"
      noValidate
    >
      <fieldset>
        <legend className="texto-2 text-sm mb-1">¿De qué se trata?</legend>
        <div className="yosoy-acciones !mt-0">
          {TIPOS.map((x, i) => (
            <label key={x.v} className="yosoy-chip cursor-pointer has-[:checked]:border-[var(--crema)]">
              <input type="radio" name="tipo" value={x.v} defaultChecked={i === 0} className="sr-only" />
              {x.t}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block">
        <span className="texto-2 text-sm">Contá qué pasó</span>
        <textarea
          name="mensaje"
          required
          minLength={15}
          maxLength={1500}
          rows={4}
          className="mt-1 w-full bg-transparent border borde p-2 text-[0.95rem] leading-snug"
          placeholder="Qué intentaste, en qué página, qué esperabas que pasara…"
        />
      </label>
      {/* trampas para bots: una persona no ve ni completa este campo */}
      <input type="text" name="sitio_web" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      {/* el instante en que se mostró el formulario (lib/trampas.ts lo compara con el reloj del servidor) */}
      <input type="hidden" name="jb_t" value={desde ? String(desde) : ""} readOnly />
      <input type="hidden" name="conversacion" value={JSON.stringify(conversacion.slice(-12))} readOnly />
      <input type="hidden" name="pagina" value={pagina} readOnly />
      {estado?.verificar && <Desafio reinicio={estado} alCambiarFase={setFase} />}
      <div className="flex items-center gap-3 flex-wrap">
        <Enviar pendiente={pendiente} verificando={verificando} />
        <span className="texto-2 text-xs">Te responden por mail, al de tu cuenta.</span>
      </div>
      {estado?.error && (
        <p role="alert" className="text-sm border-l-2 pl-2" style={{ borderColor: "currentColor" }} data-testid="ticket-error">
          {estado.error}
        </p>
      )}
    </form>
  );
}
