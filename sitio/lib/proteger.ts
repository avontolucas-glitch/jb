/**
 * La puerta de cada acción pública: junta en un paso las trampas para bots
 * (lib/trampas.ts), los límites (lib/limite.ts), la verificación tipo CAPTCHA
 * (lib/desafio.ts) y el registro (lib/registro-seguridad.ts). Solo node.
 *
 * Uso en una acción de formulario:
 *
 *   export async function accionLista(_: Estado, f: FormData): Promise<Estado> {
 *     const contacto = …validado y con tope de largo…;
 *     const p = await proteger("lista", f, { destino: contacto });
 *     if (!p.ok) return p.estado;                 // { error, verificar? }
 *     …guardar…
 *   }
 *
 *   export async function accionIngresar(_: Estado, f: FormData): Promise<Estado> {
 *     const email = …;
 *     const p = await proteger(esMailAdmin(email) ? ["login", "loginAdmin"] : "login", f, { mail: email, trampas: false });
 *     if (!p.ok) return p.estado;
 *     const r = await ingresar(email, clave);     // recién acá el PBKDF2
 *     if (!r.ok) { await p.fallo(); await registrar("login_fallido", {}, p.h); return { error: r.error }; }
 *     await p.exito();                            // borra los fallos de ese mail
 *     …
 *   }
 *
 * El formulario muestra <Desafio reinicio={estado} /> cuando `estado.verificar` es true.
 */
import { headers } from "next/headers";
import { verificarDesafio } from "./desafio";
import { exito, fallo, respuestaLimite, revisar, sujetosDe, TEXTOS, type Funcion, type Por, type Sujetos, type Veredicto } from "./limite";
import { registrar } from "./registro-seguridad";
import { esBot, type Trampa } from "./trampas";

export type EstadoProteccion = { error: string; verificar?: boolean };

export type Proteccion =
  | {
      ok: true;
      /** Los sujetos ya calculados (huellas), por si hace falta otra consulta. */
      s: Sujetos;
      h: Headers;
      v: Veredicto;
      /** Registrar que salió mal (clave incorrecta, código inválido, dato repetido…). */
      fallo: (peso?: number) => Promise<void>;
      /** Registrar que salió bien; borra los fallos del mail y la cuenta. */
      exito: (limpiarPor?: Por[]) => Promise<void>;
    }
  | { ok: false; estado: EstadoProteccion; h: Headers; v?: Veredicto; trampa?: Trampa };

export type OpcionesProteccion = {
  /** uid de la cuenta con sesión (para las reglas «por cuenta»). */
  cuenta?: string | null;
  /** Cuenta demo (clave publicada): se cuenta por cuenta+IP. */
  demo?: boolean;
  /** Mail que se intenta usar (login, crear cuenta). */
  mail?: string | null;
  /** A quién se le escribiría (lista, arrepentimiento). */
  destino?: string | null;
  /** Mirar el campo trampa y el tiempo (true por defecto si hay FormData). */
  trampas?: boolean;
  /** Encabezados del pedido (por defecto, los de next/headers). */
  h?: Headers;
};

/**
 * Revisa todo antes de hacer el trabajo caro. Devuelve { ok: false, estado } para
 * responder tal cual, o { ok: true, fallo, exito } para seguir.
 */
export async function proteger(funcion: Funcion | Funcion[], f: FormData | null, o: OpcionesProteccion = {}): Promise<Proteccion> {
  const h = o.h ?? (await headers());
  const funciones = Array.isArray(funcion) ? funcion : [funcion];
  const nombre = funciones.join("+");
  const s = await sujetosDe(h, { cuenta: o.cuenta, demo: o.demo, mail: o.mail, destino: o.destino });

  // 1) Trampas: un bot cuenta como varios fallos y queda obligado a verificar.
  let trampa: Trampa | undefined;
  if (f && o.trampas !== false) {
    trampa = esBot(f);
    if (trampa.bot) {
      await fallo(funciones, s, trampa.peso);
      await registrar("bot", { funcion: nombre, motivo: trampa.motivo }, h);
    }
  }

  // 2) Límites.
  const v = await revisar(funciones, s);
  if (!v.permitido) {
    await registrar(v.motivo === "bloqueo" ? "bloqueo" : "limite", { funcion: nombre, regla: v.regla ?? null, reintentoSeg: v.reintentoSeg }, h);
    return { ok: false, estado: { error: v.mensaje ?? TEXTOS.muchos }, h, v, trampa };
  }

  // 3) Verificación, si la piden los límites o si pareció un bot.
  if (v.verificar || trampa?.bot) {
    const token = f?.get("jb_desafio");
    if (!token) {
      await registrar("desafio_pedido", { funcion: nombre, regla: v.regla ?? (trampa?.bot ? "trampa" : null) }, h);
      return { ok: false, estado: { error: TEXTOS.verificar, verificar: true }, h, v, trampa };
    }
    if (!(await verificarDesafio(f, h))) {
      await fallo(funciones, s);
      await registrar("desafio_fallido", { funcion: nombre }, h);
      return { ok: false, estado: { error: TEXTOS.verificar, verificar: true }, h, v, trampa };
    }
    await registrar("desafio_ok", { funcion: nombre }, h);
  }

  return {
    ok: true,
    s,
    h,
    v,
    fallo: (peso = 1) => fallo(funciones, s, peso),
    exito: (limpiarPor?: Por[]) => exito(funciones, s, limpiarPor),
  };
}

/**
 * Para las rutas de /api (GET/POST con Request): solo límites, sin trampas ni
 * verificación. Devuelve la respuesta 429 lista, o null si pasa.
 *   const no = await limitarRuta("apiYo", req);
 *   if (no) return no;
 */
export async function limitarRuta(funcion: Funcion | Funcion[], req: Request, o: { cuenta?: string | null; demo?: boolean } = {}): Promise<Response | null> {
  const v = await revisar(funcion, await sujetosDe(req.headers, o));
  if (v.permitido) return null;
  await registrar("limite", { funcion: Array.isArray(funcion) ? funcion.join("+") : funcion, regla: v.regla ?? null }, req.headers);
  return respuestaLimite(v);
}
