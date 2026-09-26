"use client";

/**
 * Página de lectura: no se selecciona, no se copia, no se arrastra y lleva
 * el mail del lector como marca de agua. (Una captura de pantalla siempre es
 * posible: la marca de agua dice de quién era.)
 */
export default function LectorProtegido({ email, children }: { email: string; children: React.ReactNode }) {
  const bloquear = (e: React.SyntheticEvent) => e.preventDefault();
  return (
    <div className="sala relative" onCopy={bloquear} onCut={bloquear} onContextMenu={bloquear} onDragStart={bloquear} data-testid="lector">
      <div className="marca-lector" aria-hidden="true">
        {Array.from({ length: 14 }, (_, i) => (
          <span key={i}>{email}</span>
        ))}
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
