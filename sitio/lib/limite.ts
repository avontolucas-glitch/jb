/**
 * Límites de frecuencia y bloqueos temporales. Corre en edge y en node.
 *
 * Almacenamiento:
 *  - Sin variables: memoria del proceso. Los contadores van en un Map con tope de
 *    10.000 claves (se barren los vencidos cada minuto y, si se llena, se descartan los
 *    más viejos). Los bloqueos, las marcas de un solo uso y las alertas van en otro Map
 *    aparte, con su propio tope (20.000), del que solo se descartan las vencidas, nunca
 *    las vigentes: si se llena, unaVez() responde que no (falla cerrada). En Vercel
 *    cada instancia tiene su propia memoria (y el middleware edge otra distinta), así
 *    que es aproximado: un ataque repartido entre N instancias tiene N veces el cupo.
 *    Para el sitio publicado, Upstash es obligatorio (ver SEGURIDAD.md).
 *  - Con UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN: Upstash por su API REST,
 *    un solo fetch a /pipeline por consulta, con 400 ms de tope. Si falla o tarda, se
 *    usa la memoria por 15 s (nunca se abre la puerta del todo). Una caché local de
 *    «bloqueado hasta» evita gastar comandos pagos en claves que ya pasaron el límite.
 *    El límite global del middleware («paginas» y «api») va siempre en memoria local
 *    ({ soloMemoria: true }): no gasta un comando de Upstash por cada página vista.
 *
 * Ventana deslizante con dos cubetas: se cuenta en la cubeta actual y se suma la
 * anterior pesada por lo que queda de ella (como Cloudflare y Upstash Ratelimit).
 *
 * Uso típico (ver también lib/proteger.ts, que junta todo en un paso):
 *   const s = await sujetosDe(await headers(), { mail });
 *   const v = await revisar("login", s);      // suma los «intentos», mira «fallos» y «exitos»
 *   if (!v.permitido) return { error: v.mensaje };
 *   if (v.verificar) …pedir la verificación (lib/desafio.ts)…
 *   …si salió mal:  await fallo("login", s);
 *   …si salió bien: await exito("login", s);  // borra los fallos del mail y la cuenta
 */
import { clavePrueba, huella, huellaIp } from "./cliente";

/* ───────── Textos ───────── */

export const TEXTOS = {
  verificar: "Para seguir, confirmá que sos una persona.",
  muchos: "Hubo muchos intentos seguidos. Probá de nuevo en unos minutos.",
  muchosTarde: "Hubo muchos intentos. Probá de nuevo más tarde.",
} as const;

/* ───────── La tabla de cupos ───────── */

/** Contra quién se cuenta. «global» es todo el sitio junto. */
export type Por = "ip" | "cuenta" | "mail" | "destino" | "global";
/**
 * Qué se cuenta:
 *  - «intentos»: cada vez que se llama a revisar().
 *  - «fallos»:   solo lo que se registra con fallo() (clave mal, código inválido, trampa…).
 *  - «exitos»:   solo lo que se registra con exito() (una cuenta creada, un canje hecho).
 */
export type Cuenta = "intentos" | "fallos" | "exitos";

export type Regla = {
  por: Por;
  cuenta: Cuenta;
  ventanaSeg: number;
  /** Con esta cantidad ya registrada en la ventana, el siguiente pide verificación. */
  verificarTras?: number;
  /** Con esta cantidad ya registrada en la ventana, el siguiente no pasa (se multiplica por JB_LIMITES_FACTOR). */
  max?: number;
  /** Al llegar a `max`, bloqueo por este tiempo (si no, se espera a que baje la ventana). */
  bloqueoSeg?: number;
  /** Solo para «global»: al llegar a `verificarTras`, se pide verificación a TODOS durante este tiempo. */
  alertaSeg?: number;
};

export type Limite = {
  reglas: Regla[];
  /** El primer envío desde una IP nunca pide verificación (el arrepentimiento, por ley). */
  primeroLibre?: boolean;
  /** Aviso propio cuando no pasa (si no, TEXTOS.muchos o TEXTOS.muchosTarde). */
  aviso?: string;
};

const MIN = 60;
const HORA = 60 * MIN;
const DIA = 24 * HORA;

/**
 * Cupos por función. Los números salen de la auditoría de seguridad (sept. 2026).
 * Con CGNAT mucha gente comparte IP: por IP se pide verificación pronto y el bloqueo
 * duro queda para números altos. Nunca bloqueo duro por mail (si no, cualquiera
 * podría dejar afuera a Julián o a otra persona).
 */
export const LIMITES = {
  /** Ingresar. Contar solo los fallidos; un ingreso correcto borra el contador del mail. */
  login: {
    reglas: [
      { por: "ip", cuenta: "fallos", ventanaSeg: 15 * MIN, verificarTras: 3 },
      { por: "ip", cuenta: "fallos", ventanaSeg: HORA, max: 30, bloqueoSeg: 15 * MIN },
      { por: "mail", cuenta: "fallos", ventanaSeg: 15 * MIN, verificarTras: 5 },
      { por: "global", cuenta: "fallos", ventanaSeg: 10 * MIN, verificarTras: 200, alertaSeg: 30 * MIN },
      // Tope de CPU: cada intento corre PBKDF2 (150-300 ms). Además, lib/auth.ts no corre
      // más de 4 a la vez por instancia.
      { por: "ip", cuenta: "intentos", ventanaSeg: MIN, max: 10 },
    ],
  },
  /** Además de «login», cuando el mail es ADMIN_EMAIL: verificación desde el 2.º intento. */
  loginAdmin: {
    reglas: [{ por: "mail", cuenta: "fallos", ventanaSeg: HORA, verificarTras: 1 }],
  },
  /** Crear cuenta. Registrar cada alta con exito() y cada dato inválido o mail repetido con fallo(). */
  crearCuenta: {
    reglas: [
      { por: "ip", cuenta: "exitos", ventanaSeg: HORA, verificarTras: 1, max: 3 },
      { por: "ip", cuenta: "exitos", ventanaSeg: DIA, max: 10 },
      // un mail que ya tenía cuenta pesa 3 (accionCrearCuenta): probar mails ajenos cuesta
      { por: "ip", cuenta: "fallos", ventanaSeg: 10 * MIN, verificarTras: 3 },
      { por: "global", cuenta: "exitos", ventanaSeg: HORA, verificarTras: 30, alertaSeg: HORA },
      // tope duro para todo el sitio: un ataque repartido no llena usuarios.json
      { por: "global", cuenta: "exitos", ventanaSeg: HORA, max: 200 },
      { por: "ip", cuenta: "intentos", ventanaSeg: MIN, max: 20 },
    ],
  },
  /** Canjear el código del libro. Registrar los códigos inválidos o usados con fallo(). */
  canjear: {
    reglas: [
      { por: "cuenta", cuenta: "fallos", ventanaSeg: HORA, verificarTras: 3 },
      { por: "cuenta", cuenta: "fallos", ventanaSeg: DIA, max: 20, bloqueoSeg: DIA },
      { por: "ip", cuenta: "fallos", ventanaSeg: HORA, verificarTras: 20 },
      { por: "ip", cuenta: "intentos", ventanaSeg: MIN, max: 30 },
    ],
    aviso: TEXTOS.muchosTarde,
  },
  /** Botón de arrepentimiento: el 1.er envío NUNCA pide verificación (Res. 424/2020). destino = mail. */
  arrepentimiento: {
    reglas: [
      { por: "ip", cuenta: "intentos", ventanaSeg: HORA, verificarTras: 1, max: 3 },
      { por: "ip", cuenta: "intentos", ventanaSeg: DIA, max: 10 },
      { por: "destino", cuenta: "intentos", ventanaSeg: DIA, max: 3 },
      { por: "global", cuenta: "intentos", ventanaSeg: HORA, verificarTras: 50, alertaSeg: HORA },
      // tope duro para todo el sitio (primeroLibre no lo saltea: el tope corta antes)
      { por: "global", cuenta: "intentos", ventanaSeg: HORA, max: 500 },
    ],
    primeroLibre: true,
  },
  /**
   * Arrepentimientos que parecen de un bot (campo trampa lleno): igual se guardan, marcados
   * como sospechosos, para que no se pierda el de una persona con autocompletar. Con tope propio.
   */
  arrepentimientoSospechoso: {
    reglas: [{ por: "global", cuenta: "intentos", ventanaSeg: HORA, max: 300 }],
  },
  /** Lista de avisos. destino = el mail o el WhatsApp. */
  lista: {
    reglas: [
      { por: "ip", cuenta: "intentos", ventanaSeg: HORA, verificarTras: 2, max: 5 },
      { por: "ip", cuenta: "intentos", ventanaSeg: DIA, max: 20 },
      { por: "destino", cuenta: "intentos", ventanaSeg: DIA, max: 3 },
      { por: "global", cuenta: "intentos", ventanaSeg: HORA, verificarTras: 100, alertaSeg: HORA },
      { por: "global", cuenta: "intentos", ventanaSeg: HORA, max: 1000 },
    ],
  },
  /** Preguntas de la masterclass. En cuentas demo, usar cuenta+IP (sujetosDe con demo: true). */
  pregunta: {
    reglas: [
      { por: "cuenta", cuenta: "intentos", ventanaSeg: 10 * MIN, verificarTras: 3 },
      { por: "cuenta", cuenta: "intentos", ventanaSeg: HORA, max: 5 },
      { por: "cuenta", cuenta: "intentos", ventanaSeg: DIA, max: 20 },
      { por: "ip", cuenta: "intentos", ventanaSeg: HORA, max: 20 },
    ],
  },
  /** Nota para el encuentro 1 a 1. */
  nota: {
    reglas: [
      { por: "cuenta", cuenta: "intentos", ventanaSeg: 10 * MIN, verificarTras: 3, max: 10 },
      { por: "ip", cuenta: "intentos", ventanaSeg: 10 * MIN, max: 20 },
    ],
  },
  /** Pagar (simulado) y reservar. */
  pagar: {
    reglas: [
      { por: "cuenta", cuenta: "intentos", ventanaSeg: 10 * MIN, verificarTras: 3, max: 10 },
      { por: "ip", cuenta: "intentos", ventanaSeg: 10 * MIN, max: 20 },
    ],
  },
  /** Progreso de la masterclass: pasado el cupo se ignora en silencio, sin verificación. */
  progreso: {
    reglas: [{ por: "cuenta", cuenta: "intentos", ventanaSeg: MIN, max: 60 }],
  },
  /** Acciones de la agenda de Julián: sin verificación. */
  agenda: {
    reglas: [{ por: "cuenta", cuenta: "intentos", ventanaSeg: MIN, max: 60 }],
  },
  /** GET /api/horarios (Yo Da y el calendario). */
  apiHorarios: {
    reglas: [{ por: "ip", cuenta: "intentos", ventanaSeg: MIN, max: 30 }],
  },
  /** GET /api/yo. */
  apiYo: {
    reglas: [{ por: "ip", cuenta: "intentos", ventanaSeg: MIN, max: 60 }],
  },
  /** GET /api/sala (el chequeo de pantalla única). Un 429 no pausa la sala. */
  apiSala: {
    reglas: [
      { por: "cuenta", cuenta: "intentos", ventanaSeg: MIN, max: 30 },
      { por: "ip", cuenta: "intentos", ventanaSeg: MIN, max: 120 },
    ],
  },
  /** POST /api/sala (abrir la sala en esta pantalla). */
  apiSalaAbrir: {
    reglas: [
      { por: "cuenta", cuenta: "intentos", ventanaSeg: MIN, max: 10 },
      { por: "ip", cuenta: "intentos", ventanaSeg: MIN, max: 120 },
    ],
  },
  /** /api/agenda.ics y /api/sesion-ics. */
  apiIcs: {
    reglas: [
      { por: "cuenta", cuenta: "intentos", ventanaSeg: MIN, max: 30 },
      { por: "ip", cuenta: "intentos", ventanaSeg: MIN, max: 60 },
    ],
  },
  /** GET /api/desafio (pedir una verificación). */
  desafio: {
    reglas: [
      { por: "ip", cuenta: "intentos", ventanaSeg: MIN, max: 30 },
      { por: "ip", cuenta: "intentos", ventanaSeg: HORA, max: 300 },
    ],
  },
  /** Páginas (el middleware, siempre en memoria local). Alto a propósito: CGNAT y prefetch de Next. */
  paginas: {
    reglas: [{ por: "ip", cuenta: "intentos", ventanaSeg: MIN, max: 600 }],
  },
  /** Consultas a una persona desde Yo Da (tickets). Solo con cuenta; registrar cada una con exito(). */
  ticket: {
    reglas: [
      { por: "cuenta", cuenta: "exitos", ventanaSeg: DIA, max: 3 },
      { por: "ip", cuenta: "exitos", ventanaSeg: DIA, verificarTras: 2, max: 10 },
      { por: "ip", cuenta: "intentos", ventanaSeg: MIN, max: 10 },
    ],
  },
  /** Cualquier otra ruta de /api. */
  api: {
    reglas: [{ por: "ip", cuenta: "intentos", ventanaSeg: MIN, max: 120 }],
  },
} satisfies Record<string, Limite>;

export type Funcion = keyof typeof LIMITES;

/** JB_LIMITES_FACTOR (entero ≥ 1) multiplica los `max`; los umbrales de verificación no cambian. */
function factor(): number {
  const n = parseInt(process.env.JB_LIMITES_FACTOR ?? "", 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

/* ───────── Almacenamiento: memoria o Upstash ───────── */

type Cmd = (string | number)[];
type Valor = { v: string; vence: number }; // vence 0 = sin vencimiento

type Mem = {
  /** Contadores (se pueden descartar los más viejos si se llena). */
  datos: Map<string, Valor>;
  /** Bloqueos, marcas de un solo uso y alertas: nunca se descartan mientras estén vigentes. */
  criticas: Map<string, Valor>;
  /** Último barrido de `criticas` por estar llena (a lo sumo uno por segundo). */
  barridoCriticas: number;
  /** Caché local de «no pasa hasta» (ms), para no gastar comandos de Upstash. */
  hasta: Map<string, number>;
  barrido: number;
  pausaUpstash: number;
  avisoUpstash: number;
};
const g = globalThis as { __jbLimites?: Mem };
const mem: Mem = (g.__jbLimites ??= { datos: new Map(), criticas: new Map(), barridoCriticas: 0, hasta: new Map(), barrido: 0, pausaUpstash: 0, avisoUpstash: 0 });
// (si el módulo se recargó con una versión anterior del objeto)
mem.criticas ??= new Map();
mem.barridoCriticas ??= 0;
const TOPE_CLAVES = 10_000;
const TOPE_CRITICAS = 20_000;

/** Prefijo de las claves: separa producción, preview y local si comparten Upstash. */
const PREFIJO = `jb:${process.env.VERCEL_ENV ?? "local"}:`;

/** ¿Es un bloqueo, una marca de un solo uso o una alerta? (esas no se descartan nunca vigentes) */
const esCritica = (k: string) => k.startsWith(`${PREFIJO}b:`) || k.startsWith(`${PREFIJO}u:`) || k.startsWith(`${PREFIJO}a:`) || k.endsWith(":bloqueo");
const mapaDe = (k: string) => (esCritica(k) ? mem.criticas : mem.datos);

function barrerVencidas(m: Map<string, Valor>, ahora: number) {
  for (const [k, x] of m) if (x.vence && x.vence <= ahora) m.delete(k);
}

/** ¿Hay lugar en las críticas? Si está llena, primero se barren las vencidas (a lo sumo una vez por segundo). */
function hayLugarCritico(ahora: number): boolean {
  if (mem.criticas.size < TOPE_CRITICAS) return true;
  if (ahora - mem.barridoCriticas >= 1000) {
    mem.barridoCriticas = ahora;
    barrerVencidas(mem.criticas, ahora);
  }
  return mem.criticas.size < TOPE_CRITICAS;
}

function barrer(ahora: number) {
  if (ahora - mem.barrido >= 60_000) {
    mem.barrido = ahora;
    barrerVencidas(mem.datos, ahora);
    barrerVencidas(mem.criticas, ahora);
    for (const [k, t] of mem.hasta) if (t <= ahora) mem.hasta.delete(k);
  }
  // Si se llena (IPs rotadas), se descartan los contadores más viejos: el Map guarda el
  // orden de alta. `mem.hasta` es solo una caché (lo vigente sigue en `criticas`).
  for (const m of [mem.datos, mem.hasta] as Map<string, unknown>[]) {
    while (m.size > TOPE_CLAVES) {
      const primera = m.keys().next().value;
      if (primera === undefined) break;
      m.delete(primera);
    }
  }
}

function vivo(k: string, ahora: number): Valor | undefined {
  const m = mapaDe(k);
  const x = m.get(k);
  if (!x) return undefined;
  if (x.vence && x.vence <= ahora) {
    m.delete(k);
    return undefined;
  }
  return x;
}

/** Los pocos comandos de Redis que se usan acá, emulados en memoria. */
function enMemoria(cmds: Cmd[]): unknown[] {
  const ahora = Date.now();
  barrer(ahora);
  return cmds.map((c) => {
    const op = String(c[0]).toUpperCase();
    const k = String(c[1]);
    switch (op) {
      case "GET":
        return vivo(k, ahora)?.v ?? null;
      case "SET": {
        const opciones = c.slice(3).map((x) => String(x).toUpperCase());
        const nx = opciones.includes("NX");
        if (nx && vivo(k, ahora)) return null;
        const px = opciones.indexOf("PX");
        const vence = px >= 0 ? ahora + Number(c[3 + px + 1]) : 0;
        const m = mapaDe(k);
        // Llena de marcas vigentes: un «solo una vez» responde que no (falla cerrada). Los
        // bloqueos y las alertas se guardan igual (dejarlos afuera abriría la puerta).
        if (m === mem.criticas && !m.has(k) && !hayLugarCritico(ahora) && nx) return null;
        m.delete(k); // al final del orden: es lo más nuevo
        m.set(k, { v: String(c[2]), vence });
        return "OK";
      }
      case "INCRBY": {
        const x = vivo(k, ahora);
        const n = (x ? Number(x.v) || 0 : 0) + Number(c[2]);
        if (x) x.v = String(n);
        else mapaDe(k).set(k, { v: String(n), vence: 0 });
        return n;
      }
      case "PTTL": {
        const x = vivo(k, ahora);
        return !x ? -2 : x.vence ? x.vence - ahora : -1;
      }
      case "PEXPIRE": {
        const x = vivo(k, ahora);
        if (!x) return 0;
        x.vence = ahora + Number(c[2]);
        return 1;
      }
      case "DEL":
        return c.slice(1).reduce<number>((n, x) => n + (mapaDe(String(x)).delete(String(x)) ? 1 : 0), 0);
      default:
        throw new Error(`Comando no emulado: ${op}`);
    }
  });
}

function tiempoLimite(ms: number): AbortSignal {
  if (typeof AbortSignal.timeout === "function") return AbortSignal.timeout(ms);
  const c = new AbortController();
  setTimeout(() => c.abort(), ms);
  return c.signal;
}

async function enUpstash(cmds: Cmd[]): Promise<unknown[] | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/+$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const ahora = Date.now();
  if (ahora < mem.pausaUpstash) return null;
  try {
    const r = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(cmds.map((c) => c.map(String))),
      signal: tiempoLimite(400),
      cache: "no-store",
    });
    if (!r.ok) throw new Error(`Upstash respondió ${r.status}`);
    const res = (await r.json()) as { result?: unknown; error?: string }[];
    if (!Array.isArray(res) || res.length !== cmds.length) throw new Error("Upstash: respuesta inesperada");
    return res.map((x) => {
      if (x.error) throw new Error(`Upstash: ${x.error}`);
      return x.result ?? null;
    });
  } catch (e) {
    mem.pausaUpstash = ahora + 15_000;
    if (ahora - mem.avisoUpstash > 60_000) {
      mem.avisoUpstash = ahora;
      console.warn("Límites: Upstash no responde, se usa la memoria por un rato.", e instanceof Error ? e.message : e);
    }
    return null;
  }
}

/**
 * Ejecuta comandos de Redis en Upstash (si está) o en memoria. Devuelve un resultado por comando.
 * `soloMemoria`: nunca va a Upstash (el límite global del middleware, en cada pedido).
 */
export async function ejecutar(cmds: Cmd[], o: { soloMemoria?: boolean } = {}): Promise<unknown[]> {
  if (!cmds.length) return [];
  if (o.soloMemoria) return enMemoria(cmds);
  return (await enUpstash(cmds)) ?? enMemoria(cmds);
}

const num = (x: unknown) => (x === null || x === undefined ? 0 : Number(x) || 0);

/* ───────── Ventana deslizante ───────── */

function cubetas(base: string, ventanaMs: number, ahora: number) {
  const i = Math.floor(ahora / ventanaMs);
  return { act: `${base}:${i}`, ant: `${base}:${i - 1}`, frac: (ahora - i * ventanaMs) / ventanaMs };
}

/** Estimación entera y conservadora (hacia arriba) de lo registrado en la ventana. */
const estimar = (act: number, ant: number, frac: number) => Math.ceil(ant * (1 - frac) + act - 1e-9);

/** Milisegundos hasta que la estimación baje a `objetivo` o menos. */
function esperaHasta(act: number, ant: number, frac: number, objetivo: number, ventanaMs: number): number {
  const obj = Math.max(0, objetivo);
  if (act > obj) {
    // Hay que pasar a la cubeta siguiente, donde esta pasa a ser la anterior.
    const f2 = act > 0 ? Math.max(0, 1 - obj / act) : 0;
    return (1 - frac) * ventanaMs + f2 * ventanaMs;
  }
  if (ant * (1 - frac) + act <= obj) return 0;
  const necesaria = 1 - (obj - act) / ant;
  return Math.max(0, (necesaria - frac) * ventanaMs);
}

/* ───────── API de bajo nivel ───────── */

export type Conteo = { permitido: boolean; cuenta: number; restantes: number; reintentoSeg: number };

/**
 * Suma `peso` (1 por defecto) a `clave` y dice si sigue dentro de `max` por ventana.
 *   const r = await contar(`ics:${uid}`, { ventanaSeg: 60, max: 30 });
 *   if (!r.permitido) return new Response("…", { status: 429, headers: { "Retry-After": String(r.reintentoSeg) } });
 */
export async function contar(clave: string, o: { ventanaSeg: number; max: number; peso?: number }): Promise<Conteo> {
  const vms = o.ventanaSeg * 1000;
  const ahora = Date.now();
  const { act, ant, frac } = cubetas(`${PREFIJO}x:${clave}`, vms, ahora);
  const r = await ejecutar([
    ["SET", act, 0, "NX", "PX", 2 * vms],
    ["INCRBY", act, o.peso ?? 1],
    ["GET", ant],
  ]);
  const a = num(r[1]);
  const b = num(r[2]);
  const cuenta = estimar(a, b, frac);
  const permitido = cuenta <= o.max;
  return {
    permitido,
    cuenta,
    restantes: Math.max(0, o.max - cuenta),
    reintentoSeg: permitido ? 0 : Math.ceil(esperaHasta(a, b, frac, o.max - 1, vms) / 1000),
  };
}

/** Lo registrado en la ventana, sin sumar nada. */
export async function mirar(clave: string, o: { ventanaSeg: number }): Promise<number> {
  const vms = o.ventanaSeg * 1000;
  const { act, ant, frac } = cubetas(`${PREFIJO}x:${clave}`, vms, Date.now());
  const r = await ejecutar([
    ["GET", act],
    ["GET", ant],
  ]);
  return estimar(num(r[0]), num(r[1]), frac);
}

/** Borra el contador de `clave` (por ejemplo, los fallos de un mail tras un ingreso correcto). */
export async function limpiar(clave: string, o: { ventanaSeg: number }): Promise<void> {
  const vms = o.ventanaSeg * 1000;
  const { act, ant } = cubetas(`${PREFIJO}x:${clave}`, vms, Date.now());
  await ejecutar([["DEL", act, ant]]);
}

/** Bloquea `clave` por `seg` segundos. */
export async function bloquear(clave: string, seg: number): Promise<void> {
  const k = `${PREFIJO}b:${clave}`;
  mem.hasta.set(k, Date.now() + seg * 1000);
  await ejecutar([["SET", k, 1, "PX", Math.max(1, Math.round(seg * 1000))]]);
}

/** Segundos que le quedan al bloqueo de `clave` (0 si no está bloqueada). */
export async function bloqueadoPor(clave: string): Promise<number> {
  const k = `${PREFIJO}b:${clave}`;
  const local = (mem.hasta.get(k) ?? 0) - Date.now();
  if (local > 0) return Math.ceil(local / 1000);
  const [ms] = await ejecutar([["PTTL", k]]);
  const n = num(ms);
  return n > 0 ? Math.ceil(n / 1000) : 0;
}

/** Levanta el bloqueo de `clave`. */
export async function desbloquear(clave: string): Promise<void> {
  const k = `${PREFIJO}b:${clave}`;
  mem.hasta.delete(k);
  await ejecutar([["DEL", k]]);
}

/**
 * Marca `clave` como usada durante `seg` segundos. Devuelve true solo la PRIMERA vez
 * (SET NX): sirve para que una verificación o un enlace se usen una sola vez.
 */
export async function unaVez(clave: string, seg: number): Promise<boolean> {
  const [r] = await ejecutar([["SET", `${PREFIJO}u:${clave}`, 1, "NX", "PX", Math.max(1000, Math.round(seg * 1000))]]);
  return r === "OK";
}

/* ───────── API por función (usa la tabla LIMITES) ───────── */

/**
 * Contra quién se cuenta. Todo va en huellas (nunca IP, mail ni contacto en claro).
 * Armalo con sujetosDe(); `prueba` solo existe en modo pruebas.
 */
export type Sujetos = { ip?: string; cuenta?: string; mail?: string; destino?: string; prueba?: string | null };

/** Normaliza un mail para usarlo de clave (minúsculas, sin espacios). */
const normal = (v: string) => v.trim().toLowerCase().replace(/\s+/g, "");

/**
 * Arma los sujetos de un pedido.
 *   const s = await sujetosDe(await headers(), { mail: email });              // login
 *   const s = await sujetosDe(await headers(), { cuenta: u.id, demo: u.demo }); // con sesión
 *   const s = await sujetosDe(req.headers, { destino: contacto });           // lista
 * `demo: true` combina cuenta+IP: en las cuentas demo (clave publicada) un troll no deja sin cupo a los demás.
 */
export async function sujetosDe(
  h: Headers,
  o: { cuenta?: string | null; mail?: string | null; destino?: string | null; demo?: boolean } = {},
): Promise<Sujetos> {
  const ipH = await huellaIp(h);
  return {
    ip: ipH,
    cuenta: o.cuenta ? (o.demo ? `${o.cuenta}.${ipH}` : o.cuenta) : undefined,
    mail: o.mail ? await huella(normal(o.mail), "mail") : undefined,
    destino: o.destino ? await huella(normal(o.destino), "destino") : undefined,
    prueba: clavePrueba(h),
  };
}

export type Veredicto = {
  /** false: no pasa (límite o bloqueo). Responder con `mensaje` (o 429 en las rutas). */
  permitido: boolean;
  /** true: pasa solo con la verificación (lib/desafio.ts). */
  verificar: boolean;
  /** Segundos hasta poder reintentar (0 si pasa). */
  reintentoSeg: number;
  motivo: "ok" | "verificar" | "limite" | "bloqueo";
  /** Qué regla decidió (para el registro): «login:ip:fallos:3600». */
  regla?: string;
  /** Texto para mostrar cuando no pasa o cuando pide verificación. */
  mensaje?: string;
};

type Aplicada = { funcion: Funcion; regla: Regla; id: string; base: string };

function aplicar(funciones: Funcion[], s: Sujetos): Aplicada[] {
  const sufijo = s.prueba ? `~${s.prueba}` : "";
  const out: Aplicada[] = [];
  for (const funcion of funciones) {
    for (const regla of LIMITES[funcion].reglas as Regla[]) {
      const sujeto = regla.por === "global" ? "*" : s[regla.por];
      if (!sujeto) continue;
      const id = `${funcion}:${regla.por}:${regla.cuenta}:${regla.ventanaSeg}`;
      out.push({ funcion, regla, id, base: `${PREFIJO}l:${id}:${sujeto}${sufijo}` });
    }
  }
  return out;
}

const claveAlerta = (funcion: Funcion, s: Pick<Sujetos, "prueba">) => `${PREFIJO}a:${funcion}${s.prueba ? `~${s.prueba}` : ""}`;

/**
 * ¿Está vigente la alerta global de `funcion` (por ejemplo, muchos fallos de login en
 * todo el sitio)? Sirve para endurecer la verificación mientras dura.
 */
export async function alertaVigente(funcion: Funcion, h?: Headers): Promise<boolean> {
  const [ms] = await ejecutar([["PTTL", claveAlerta(funcion, { prueba: h ? clavePrueba(h) : null })]]);
  return num(ms) > 0;
}
const claveBloqueo = (a: Aplicada) => `${a.base}:bloqueo`;

function mensajeDe(funciones: Funcion[], reintentoSeg: number): string {
  for (const f of funciones) {
    const aviso = (LIMITES[f] as Limite).aviso;
    if (aviso) return aviso;
  }
  return reintentoSeg > 30 * MIN ? TEXTOS.muchosTarde : TEXTOS.muchos;
}

/**
 * Revisa los límites de una o varias funciones antes de hacer el trabajo caro.
 * Suma 1 a las reglas de «intentos»; las de «fallos» y «exitos» solo se miran.
 *   const v = await revisar(esMailAdmin ? ["login", "loginAdmin"] : "login", s);
 * `soloMemoria`: cuenta en la memoria de la instancia, sin ir a Upstash (el middleware).
 */
export async function revisar(funcion: Funcion | Funcion[], s: Sujetos, o: { soloMemoria?: boolean } = {}): Promise<Veredicto> {
  const funciones = Array.isArray(funcion) ? funcion : [funcion];
  const reglas = aplicar(funciones, s);
  const ahora = Date.now();
  const tope = factor();

  // 1) Caché local: si ya se sabe que no pasa, no se consulta nada.
  for (const a of reglas) {
    for (const k of [claveBloqueo(a), a.base]) {
      const hasta = mem.hasta.get(k) ?? 0;
      if (hasta > ahora) {
        const reintentoSeg = Math.ceil((hasta - ahora) / 1000);
        return { permitido: false, verificar: false, reintentoSeg, motivo: k === a.base ? "limite" : "bloqueo", regla: a.id, mensaje: mensajeDe(funciones, reintentoSeg) };
      }
    }
  }

  // 2) Un solo viaje al almacenamiento para todas las reglas.
  const cmds: Cmd[] = [];
  const pos: { a: Aplicada; i: number; cubetas: ReturnType<typeof cubetas>; bloq?: number }[] = [];
  for (const a of reglas) {
    const vms = a.regla.ventanaSeg * 1000;
    const c = cubetas(a.base, vms, ahora);
    const i = cmds.length;
    if (a.regla.cuenta === "intentos") cmds.push(["SET", c.act, 0, "NX", "PX", 2 * vms], ["INCRBY", c.act, 1], ["GET", c.ant]);
    else cmds.push(["GET", c.act], ["GET", c.ant]);
    let bloq: number | undefined;
    if (a.regla.bloqueoSeg) {
      bloq = cmds.length;
      cmds.push(["PTTL", claveBloqueo(a)]);
    }
    pos.push({ a, i, cubetas: c, bloq });
  }
  const alertas = funciones.filter((f) => (LIMITES[f].reglas as Regla[]).some((r) => r.por === "global" && r.alertaSeg));
  const posAlerta = cmds.length;
  for (const f of alertas) cmds.push(["PTTL", claveAlerta(f, s)]);
  const r = await ejecutar(cmds, o);

  // 3) Evaluar.
  let permitido = true;
  let verificar = false;
  let reintentoMs = 0;
  let motivo: Veredicto["motivo"] = "ok";
  let regla: string | undefined;
  let primero = true; // ¿ninguna regla de intentos por IP tenía nada antes de este?
  const despues: Cmd[] = [];

  for (const { a, i, cubetas: c, bloq } of pos) {
    const vms = a.regla.ventanaSeg * 1000;
    const esIntento = a.regla.cuenta === "intentos";
    const act = num(r[esIntento ? i + 1 : i]);
    const ant = num(r[esIntento ? i + 2 : i + 1]);
    // Lo que ya había antes de este pedido.
    const previos = estimar(esIntento ? act - 1 : act, ant, c.frac);
    if (esIntento && a.regla.por === "ip" && previos > 0) primero = false;

    if (bloq !== undefined) {
      const ms = num(r[bloq]);
      if (ms > 0) {
        permitido = false;
        motivo = "bloqueo";
        regla = a.id;
        reintentoMs = Math.max(reintentoMs, ms);
        mem.hasta.set(claveBloqueo(a), ahora + ms);
        continue;
      }
    }
    if (a.regla.max !== undefined && previos >= a.regla.max * tope) {
      const espera = esperaHasta(esIntento ? act - 1 : act, ant, c.frac, a.regla.max * tope - 1, vms);
      permitido = false;
      if (motivo !== "bloqueo") {
        motivo = "limite";
        regla = a.id;
      }
      if (a.regla.bloqueoSeg) {
        const ms = a.regla.bloqueoSeg * 1000;
        despues.push(["SET", claveBloqueo(a), 1, "PX", ms]);
        mem.hasta.set(claveBloqueo(a), ahora + ms);
        reintentoMs = Math.max(reintentoMs, ms);
        motivo = "bloqueo";
        regla = a.id;
      } else {
        reintentoMs = Math.max(reintentoMs, espera);
        if (espera > 0) mem.hasta.set(a.base, ahora + espera);
      }
      continue;
    }
    if (a.regla.verificarTras !== undefined && previos >= a.regla.verificarTras) {
      verificar = true;
      regla ??= a.id;
      if (a.regla.por === "global" && a.regla.alertaSeg) despues.push(["SET", claveAlerta(a.funcion, s), 1, "NX", "PX", a.regla.alertaSeg * 1000]);
    }
  }
  alertas.forEach((f, j) => {
    if (num(r[posAlerta + j]) > 0) {
      verificar = true;
      regla ??= `${f}:alerta`;
    }
  });
  if (despues.length) await ejecutar(despues, o);

  if (!permitido) {
    const reintentoSeg = Math.max(1, Math.ceil(reintentoMs / 1000));
    return { permitido: false, verificar: false, reintentoSeg, motivo, regla, mensaje: mensajeDe(funciones, reintentoSeg) };
  }
  if (verificar && primero && funciones.some((f) => (LIMITES[f] as Limite).primeroLibre)) verificar = false;
  return verificar
    ? { permitido: true, verificar: true, reintentoSeg: 0, motivo: "verificar", regla, mensaje: TEXTOS.verificar }
    : { permitido: true, verificar: false, reintentoSeg: 0, motivo: "ok" };
}

/** Suma `peso` a las reglas de un tipo y aplica bloqueos y alertas si corresponde. */
async function sumar(funciones: Funcion[], s: Sujetos, cuenta: Cuenta, peso: number): Promise<void> {
  const reglas = aplicar(funciones, s).filter((a) => a.regla.cuenta === cuenta);
  if (!reglas.length) return;
  const ahora = Date.now();
  const tope = factor();
  const cmds: Cmd[] = [];
  const cs = reglas.map((a) => {
    const vms = a.regla.ventanaSeg * 1000;
    const c = cubetas(a.base, vms, ahora);
    cmds.push(["SET", c.act, 0, "NX", "PX", 2 * vms], ["INCRBY", c.act, peso], ["GET", c.ant]);
    return c;
  });
  const r = await ejecutar(cmds);
  const despues: Cmd[] = [];
  reglas.forEach((a, j) => {
    const total = estimar(num(r[j * 3 + 1]), num(r[j * 3 + 2]), cs[j].frac);
    if (a.regla.bloqueoSeg && a.regla.max !== undefined && total >= a.regla.max * tope) {
      despues.push(["SET", claveBloqueo(a), 1, "PX", a.regla.bloqueoSeg * 1000]);
      mem.hasta.set(claveBloqueo(a), ahora + a.regla.bloqueoSeg * 1000);
    }
    if (a.regla.por === "global" && a.regla.alertaSeg && a.regla.verificarTras !== undefined && total >= a.regla.verificarTras) {
      despues.push(["SET", claveAlerta(a.funcion, s), 1, "NX", "PX", a.regla.alertaSeg * 1000]);
    }
  });
  if (despues.length) await ejecutar(despues);
}

/**
 * Registra un fallo (clave mal, código inválido, mail repetido, trampa de bots…).
 * `peso` > 1 cuenta como varios (una trampa de bots cuenta 3).
 */
export async function fallo(funcion: Funcion | Funcion[], s: Sujetos, peso = 1): Promise<void> {
  await sumar(Array.isArray(funcion) ? funcion : [funcion], s, "fallos", peso);
}

/**
 * Registra un éxito (cuenta creada, canje hecho, ingreso correcto) y borra los fallos
 * acumulados de `limpiarPor` (por defecto el mail y la cuenta; nunca los de la IP ni los globales).
 */
export async function exito(funcion: Funcion | Funcion[], s: Sujetos, limpiarPor: Por[] = ["mail", "cuenta"]): Promise<void> {
  const funciones = Array.isArray(funcion) ? funcion : [funcion];
  await sumar(funciones, s, "exitos", 1);
  const ahora = Date.now();
  const borrar = aplicar(funciones, s).filter((a) => a.regla.cuenta === "fallos" && limpiarPor.includes(a.regla.por) && a.regla.por !== "global");
  if (!borrar.length) return;
  const cmds: Cmd[] = borrar.map((a) => {
    const c = cubetas(a.base, a.regla.ventanaSeg * 1000, ahora);
    mem.hasta.delete(a.base);
    return ["DEL", c.act, c.ant];
  });
  await ejecutar(cmds);
}

/**
 * Respuesta 429 en JSON para las rutas de /api (edge o node).
 *   const v = await revisar("apiYo", await sujetosDe(req.headers));
 *   if (!v.permitido) return respuestaLimite(v);
 */
export function respuestaLimite(v: Veredicto): Response {
  return new Response(JSON.stringify({ error: v.mensaje ?? TEXTOS.muchos, reintentoSeg: v.reintentoSeg }), {
    status: 429,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "Retry-After": String(Math.max(1, v.reintentoSeg)) },
  });
}
