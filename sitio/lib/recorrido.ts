/**
 * El recorrido de Yo Da: vuela por el sitio y muestra cada cosa (las paradas y
 * sus textos, en content/yosoy.ts → `recorrido`). Se le ofrece a quien entra por
 * primera vez sin cuenta, y cualquiera lo puede pedir desde Yo Da («Recorrido»).
 * Cada elemento que se muestra lleva `data-recorrido="…"`.
 */
export const EVENTO_RECORRIDO = "jb:recorrido";
const VISTO = "jb-yoda-recorrido";

export type Inicio = { sesion: boolean };

export function empezarRecorrido(o: Inicio = { sesion: false }) {
  window.dispatchEvent(new CustomEvent<Inicio>(EVENTO_RECORRIDO, { detail: o }));
}

/** ¿Ya lo vio (o lo salteó) en este navegador? */
export function recorridoVisto(): boolean {
  try {
    return !!localStorage.getItem(VISTO);
  } catch {
    return false;
  }
}

export function marcarRecorridoVisto() {
  try {
    localStorage.setItem(VISTO, String(Date.now()));
  } catch {}
}
