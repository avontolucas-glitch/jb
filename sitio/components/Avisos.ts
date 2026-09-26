/** Mensajes que muestra /ingresar según desde dónde se llegó. */
export const avisos: Record<string, string> = {
  privado: "Para entrar a tu espacio tenés que ingresar con tu cuenta.",
  checkout: "Para comprar necesitás una cuenta. Ingresá o creá una en un minuto.",
  sesion: "Tu sesión terminó. Volvé a ingresar.",
  canjear: "Para canjear el código del libro necesitás una cuenta: así el libro queda tuyo.",
};

export function volverSeguro(v?: string) {
  return v && v.startsWith("/") && !v.startsWith("//") && !v.startsWith("/\\") ? v : "/mi-espacio";
}
