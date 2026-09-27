/**
 * Yo Da, con la hora de quien entra: saluda desde su contexto horario (la hora
 * y el día en su zona, la ciudad de esa zona) con un guiño místico y con gracia.
 * La zona sale del dispositivo; si no se puede saber, de la conexión (los
 * encabezados de Vercel, en /api/yo). La ciudad que se nombra es la de la ZONA
 * horaria («Buenos Aires», «Madrid»), nunca la que se deduce de la IP: saber la
 * hora de alguien está bien; decirle dónde está, no.
 */

export type Contexto = {
  /** Hora y minutos en la zona de la persona. */
  hora: number;
  minuto: number;
  /** 0 = domingo … 6 = sábado. */
  dia: number;
  /** La ciudad de la zona horaria («Buenos Aires»), si se sabe. */
  ciudad: string | null;
  /** La zona de la conexión es otra (viaje, VPN): un guiño, sin decir dónde. */
  otraZona?: boolean;
};

/** «America/Argentina/Buenos_Aires» → «Buenos Aires»; «Europe/Madrid» → «Madrid». */
export function ciudadDeZona(zona: string | null | undefined): string | null {
  if (!zona || !zona.includes("/")) return null;
  const c = zona.split("/").pop()!.replace(/_/g, " ");
  return /^(GMT|UTC|Etc)/i.test(c) ? null : c;
}

/** La hora y el día en una zona (o en la del dispositivo). */
export function contextoEn(zona?: string | null, ahora = new Date()): Contexto {
  let z = zona ?? undefined;
  try {
    z ??= Intl.DateTimeFormat().resolvedOptions().timeZone;
    const p = Object.fromEntries(
      new Intl.DateTimeFormat("en-US", { timeZone: z, hourCycle: "h23", hour: "2-digit", minute: "2-digit", weekday: "short" })
        .formatToParts(ahora)
        .map((x) => [x.type, x.value]),
    );
    const dia = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday);
    return { hora: Number(p.hour), minuto: Number(p.minute), dia, ciudad: ciudadDeZona(z) };
  } catch {
    return { hora: ahora.getHours(), minuto: ahora.getMinutes(), dia: ahora.getDay(), ciudad: null };
  }
}

const hhmm = (c: Contexto) => `${String(c.hora).padStart(2, "0")}:${String(c.minuto).padStart(2, "0")}`;
const en = (c: Contexto) => (c.ciudad ? ` en ${c.ciudad}` : "");
const azar = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];

/** El guiño según el momento del día (se usa en el saludo y cuando preguntan la hora). */
function momento(c: Contexto): string {
  const h = c.hora;
  if (h < 5)
    return azar([
      `Las ${hhmm(c)}${en(c)} son. Despierto a esta hora… la mejor para imaginar es: el mundo duerme, y vos creás.`,
      `Hmm. ${hhmm(c)}${en(c)}. A esta hora, lo que imaginás, poca competencia tiene.`,
    ]);
  if (h < 8)
    return azar([
      `Temprano${en(c)}: las ${hhmm(c)}. El día, en blanco está. Escribilo como ya vivido.`,
      `Las ${hhmm(c)}${en(c)}. Madrugaste. El primer pensamiento del día, elegilo bien: el tono pone.`,
    ]);
  if (h < 12)
    return azar([
      `Las ${hhmm(c)}${en(c)}. Mañana fresca; mente fresca, también.`,
      `${hhmm(c)}${en(c)}. Buena hora, para decidir cómo termina el día. Antes de que empiece, digo.`,
    ]);
  if (h < 15)
    return azar([
      `Mediodía${en(c)}: las ${hhmm(c)}. Almorzaste, espero. Con hambre, asumir cuesta. Hmm.`,
      `Las ${hhmm(c)}${en(c)}. La hora de la siesta se acerca: un estado parecido al sueño, ese. Aprovechalo.`,
    ]);
  if (h < 19)
    return azar([
      `Las ${hhmm(c)}${en(c)}. Tarde tranquila, ojalá. Si no lo es, imaginala así: por algo se empieza.`,
      `${hhmm(c)}${en(c)}. A esta hora, el día todavía se puede reescribir. Hmm.`,
    ]);
  if (h < 22)
    return azar([
      `Las ${hhmm(c)}${en(c)}. Buena hora, para revisar el día: lo que no te gustó, reescribilo como querías.`,
      `Noche${en(c)}: las ${hhmm(c)}. El día se va; lo que asumiste, se queda.`,
    ]);
  return azar([
    `Las ${hhmm(c)}${en(c)}. Tarde se hizo. Antes de dormir, el deseo cumplido sentí: esa, la hora buena es.`,
    `${hhmm(c)}${en(c)}. Lo último que pensás antes de dormir, cuidalo: con eso, mañana se arma.`,
  ]);
}

/** Un guiño por el día de la semana (a veces). */
function delDia(c: Contexto): string | null {
  if (c.dia === 1) return "Lunes, encima. Del color que le pongas, será.";
  if (c.dia === 5) return "Viernes. Hmm. El fin de semana, ya asumido lo tenés.";
  if (c.dia === 0 || c.dia === 6) return "Fin de semana: sin apuro, este lugar se recorre.";
  return null;
}

/** El saludo de la nube al entrar (lo demás —crear la cuenta, el recorrido— lo agrega Yo Da). */
export function saludoConHora(c: Contexto, nombre?: string | null, region?: string | null): string {
  const n = nombre ? `, ${nombre}` : "";
  const hola =
    c.hora < 5 ? `Hmm. Despierto estás${n}.` : c.hora < 13 ? `${!region || ["ar", "uy", "py"].includes(region) ? "Buen día" : "Buenos días"}${n}.` : c.hora < 20 ? `Buenas tardes${n}.` : `Buenas noches${n}.`;
  const dia = Math.random() < 0.35 ? delDia(c) : null;
  const viaje = c.otraZona ? " Tu conexión, de otra hora viene: ¿viajando, o por un túnel?" : "";
  return `${hola} ${momento(c)}${dia ? ` ${dia}` : ""}${viaje}`.replace(/\s+/g, " ").trim();
}

/** «¿Qué hora es?» */
export function queHora(c: Contexto): string {
  return momento(c);
}
