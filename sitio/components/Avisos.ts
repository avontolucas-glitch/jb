import { destinoSeguro } from "@/lib/validar";

/** Mensajes que muestra /ingresar según desde dónde se llegó. */
export const avisos: Record<string, string> = {
  privado: "Para entrar a tu espacio tenés que ingresar con tu cuenta.",
  checkout: "Para comprar necesitás una cuenta. Ingresá o creá una en un minuto.",
  sesion: "Tu sesión terminó. Volvé a ingresar.",
  canjear: "Para canjear el código del libro necesitás una cuenta: así el libro queda tuyo.",
};

/**
 * A dónde volver después de ingresar o crear la cuenta: solo rutas del mismo sitio.
 * Usa destinoSeguro() (lib/validar.ts), que además rechaza tabs, saltos de línea y
 * barras invertidas: «/<tab>/evil.com» el navegador lo lee como «//evil.com».
 */
export function volverSeguro(v?: string) {
  return destinoSeguro(v ?? "");
}
