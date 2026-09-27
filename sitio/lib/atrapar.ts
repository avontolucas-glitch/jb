/**
 * «Atrapame»: Yo Da sale de su rincón y vuela rapidísimo por la página, como la
 * snitch dorada; si lo tocás, ganás. Cada vez que lo atrapan, vuela un poco más rápido.
 * Lo arranca Yo Da (content/yosoy.ts → acción «atrapar»); el vuelo lo hace
 * components/AtraparYoDa.tsx, que al terminar avisa cómo salió.
 */
export const EVENTO_ATRAPAR = "jb:yoda-atrapar";
export const EVENTO_ATRAPAR_FIN = "jb:yoda-atrapar-fin";

export type Resultado = {
  atrapado: boolean;
  /** Cuánto tardó en atraparlo (ms), o cuánto duró la vuelta si no lo atrapó. */
  ms: number;
  /** 1 la primera vez; sube con cada vez que lo atrapan (y vuela más rápido). */
  nivel: number;
  /** El mejor tiempo que había antes de esta vuelta (ms), si había. */
  recordAnterior: number | null;
  /** La persona lo cortó (Esc o «Salir»). */
  salio?: boolean;
};

/** Cuánto dura una vuelta, en ms. */
export const DURACION_MS = 15_000;
/** Vueltas por visita (como los otros juegos de Yo Da, tiene un límite). */
export const VUELTAS_MAX = 8;

const NIVEL = "jb-yoda-atrapar-nivel";
const VUELTAS = "jb-yoda-atrapar-vueltas";
const RECORD = "jb-yoda-atrapar-record";

const leerNumero = (almacen: () => Storage, clave: string): number => {
  try {
    return Number(almacen().getItem(clave) || 0);
  } catch {
    return 0;
  }
};
const guardar = (almacen: () => Storage, clave: string, valor: number) => {
  try {
    almacen().setItem(clave, String(valor));
  } catch {}
};
const sesion = () => sessionStorage;
const local = () => localStorage;

export const nivelActual = () => Math.max(1, leerNumero(sesion, NIVEL) || 1);
export const vueltasJugadas = () => leerNumero(sesion, VUELTAS);
export const record = (): number | null => leerNumero(local, RECORD) || null;

/** Anota la vuelta: sube el nivel si lo atraparon y guarda el récord. Devuelve el récord anterior. */
export function anotar(atrapado: boolean, ms: number): number | null {
  guardar(sesion, VUELTAS, vueltasJugadas() + 1);
  const antes = record();
  if (atrapado) {
    guardar(sesion, NIVEL, nivelActual() + 1);
    if (!antes || ms < antes) guardar(local, RECORD, Math.round(ms));
  }
  return antes;
}

export function empezarAtrapar() {
  window.dispatchEvent(new Event(EVENTO_ATRAPAR));
}
