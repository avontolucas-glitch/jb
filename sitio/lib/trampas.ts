/**
 * Primera capa contra bots en los formularios públicos: gratis, sin variables y sin
 * molestar a nadie. Corre en edge y en node.
 *
 * Dos campos que el formulario tiene que llevar (los agrega el componente del formulario):
 *
 * 1) Campo trampa (honeypot), name="sitio_web": una persona no lo ve ni lo completa;
 *    un bot que llena todo, sí. Fuera de la vista (no con display:none, que algunos bots
 *    detectan), sin foco y sin autocompletar:
 *
 *      <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", top: "auto", width: 1, height: 1, overflow: "hidden" }}>
 *        <label>Sitio web <input type="text" name="sitio_web" tabIndex={-1} autoComplete="off" defaultValue="" /></label>
 *      </div>
 *
 * 2) Marca de tiempo, name="jb_t": los MILISEGUNDOS que pasaron desde que se mostró el
 *    formulario hasta que se envió (se calcula en el navegador al enviar, así no importa
 *    si el reloj del teléfono está mal). También se acepta el instante en que se mostró
 *    (Date.now(), más de 10^12): ahí se compara con el reloj del servidor.
 *    Un envío en menos de 1,5 s no lo hace una persona.
 *
 *      <input type="hidden" name="jb_t" defaultValue="" />   // al enviar: String(Date.now() - mostradoEn)
 *
 * Si «sitio_web» falta del todo, el bot llamó a la acción directo, sin el formulario.
 * Si «jb_t» llega vacío (sin JavaScript), no se decide nada por el tiempo.
 *
 * Qué hacer con un bot: no avisarle. Contarlo como varios intentos fallidos
 * (`peso`, con fallo() de lib/limite.ts) y pedir la verificación. lib/proteger.ts ya lo hace.
 */

export const CAMPO_TRAMPA = "sitio_web";
export const CAMPO_TIEMPO = "jb_t";
/** Menos que esto, entre que se mostró y se envió, no es una persona. */
export const TIEMPO_MINIMO_MS = 1500;

export type Trampa = {
  bot: boolean;
  /** «trampa»: llenó el campo oculto. «falta»: no vino el campo (acción llamada directo) o vino basura. «rapido»: menos de 1,5 s. */
  motivo: "ok" | "trampa" | "falta" | "rapido";
  /** Cuántos intentos fallidos vale (0 si no es bot). */
  peso: number;
};

const OK: Trampa = { bot: false, motivo: "ok", peso: 0 };

/** ¿Lo mandó un bot? Mirá la cabecera del archivo para los campos que tiene que tener el formulario. */
export function esBot(f: FormData, o: { minimoMs?: number } = {}): Trampa {
  const minimo = o.minimoMs ?? TIEMPO_MINIMO_MS;
  const trampa = f.get(CAMPO_TRAMPA);
  if (trampa === null) return { bot: true, motivo: "falta", peso: 3 };
  if (typeof trampa !== "string" || trampa.length > 0) return { bot: true, motivo: "trampa", peso: 3 };

  const t = f.get(CAMPO_TIEMPO);
  if (t === null || t === "") return OK; // sin JavaScript: no se decide por el tiempo
  if (typeof t !== "string" || t.length > 16 || !/^\d+$/.test(t)) return { bot: true, motivo: "falta", peso: 3 };
  const n = Number(t);
  // Instante en que se mostró (reloj del teléfono): solo cuenta si da un tiempo creíble.
  const transcurrido = n > 1e12 ? Date.now() - n : n;
  if (transcurrido >= 0 && transcurrido < minimo) return { bot: true, motivo: "rapido", peso: 3 };
  return OK;
}
