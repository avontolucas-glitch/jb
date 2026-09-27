/**
 * Zonas horarias. Julián agenda en hora de Argentina (Buenos Aires, UTC−3, sin
 * horario de verano); cada visitante ve los horarios en su propia hora, con la
 * de Julián al lado para concordar. Todo se calcula con el instante exacto de
 * cada horario, así el horario de verano de Europa o Estados Unidos queda bien
 * aunque cambie entre una semana y otra.
 */
export const ZONA_JULIAN = "America/Argentina/Buenos_Aires";

/** Zonas frecuentes para elegir a mano (la del dispositivo se agrega sola si no está). */
export const ZONAS: { zona: string; nombre: string }[] = [
  { zona: "America/Argentina/Buenos_Aires", nombre: "Argentina" },
  { zona: "America/Montevideo", nombre: "Uruguay" },
  { zona: "America/Asuncion", nombre: "Paraguay" },
  { zona: "America/Santiago", nombre: "Chile" },
  { zona: "America/La_Paz", nombre: "Bolivia" },
  { zona: "America/Sao_Paulo", nombre: "Brasil (San Pablo)" },
  { zona: "America/Lima", nombre: "Perú" },
  { zona: "America/Bogota", nombre: "Colombia" },
  { zona: "America/Guayaquil", nombre: "Ecuador" },
  { zona: "America/Caracas", nombre: "Venezuela" },
  { zona: "America/Panama", nombre: "Panamá" },
  { zona: "America/Costa_Rica", nombre: "Costa Rica" },
  { zona: "America/Guatemala", nombre: "Guatemala" },
  { zona: "America/Mexico_City", nombre: "México (Ciudad de México)" },
  { zona: "America/Santo_Domingo", nombre: "República Dominicana" },
  { zona: "America/Puerto_Rico", nombre: "Puerto Rico" },
  { zona: "America/New_York", nombre: "Estados Unidos (Nueva York, Miami)" },
  { zona: "America/Chicago", nombre: "Estados Unidos (Chicago, Texas)" },
  { zona: "America/Denver", nombre: "Estados Unidos (Denver)" },
  { zona: "America/Los_Angeles", nombre: "Estados Unidos (Los Ángeles)" },
  { zona: "America/Toronto", nombre: "Canadá (Toronto)" },
  { zona: "Europe/Madrid", nombre: "España" },
  { zona: "Atlantic/Canary", nombre: "Islas Canarias" },
  { zona: "Europe/Lisbon", nombre: "Portugal" },
  { zona: "Europe/London", nombre: "Reino Unido" },
  { zona: "Europe/Rome", nombre: "Italia" },
  { zona: "Europe/Berlin", nombre: "Alemania" },
  { zona: "Europe/Paris", nombre: "Francia" },
  { zona: "Asia/Jerusalem", nombre: "Israel" },
  { zona: "Asia/Tokyo", nombre: "Japón" },
  { zona: "Australia/Sydney", nombre: "Australia (Sídney)" },
];

export function zonaValida(z: string | null | undefined): z is string {
  if (!z) return false;
  try {
    new Intl.DateTimeFormat("es-AR", { timeZone: z });
    return true;
  } catch {
    return false;
  }
}

/** El nombre canónico de una zona: los navegadores llaman distinto a la misma (America/Buenos_Aires = America/Argentina/Buenos_Aires). */
export function canonica(z: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", { timeZone: z }).resolvedOptions().timeZone;
  } catch {
    return z;
  }
}

/** Una zona tal como figura en la lista (si está), para que el selector la encuentre. */
export function normalizar(z: string): string {
  const c = canonica(z);
  return ZONAS.find((x) => canonica(x.zona) === c)?.zona ?? z;
}

/** La zona del dispositivo (o la de Julián si no se puede saber). */
export function zonaDelDispositivo(): string {
  try {
    const z = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return zonaValida(z) ? normalizar(z) : ZONA_JULIAN;
  } catch {
    return ZONA_JULIAN;
  }
}

/** Nombre para mostrar: el de la lista, o la ciudad de la zona («America/Mexico_City» → «Mexico City»). */
export function nombreZona(zona: string): string {
  const f = ZONAS.find((z) => z.zona === zona);
  if (f) return f.nombre;
  return (zona.split("/").pop() ?? zona).replace(/_/g, " ");
}

/** Diferencia con UTC en minutos, en ese instante (tiene en cuenta el horario de verano). */
export function desfase(fecha: Date, zona: string): number {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: zona, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })
      .formatToParts(fecha)
      .map((x) => [x.type, x.value]),
  );
  const local = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return Math.round((local - Math.floor(fecha.getTime() / 1000) * 1000) / 60000);
}

/** «UTC−3», «UTC+5:30» */
export function textoUTC(fecha: Date, zona: string): string {
  const m = desfase(fecha, zona);
  const s = m < 0 ? "−" : "+";
  const a = Math.abs(m);
  return `UTC${s}${Math.floor(a / 60)}${a % 60 ? `:${String(a % 60).padStart(2, "0")}` : ""}`;
}

/** Cuántas horas le lleva (o le saca) esa zona a la de Julián: «5 horas más», «1 hora menos», «la misma hora». */
export function diferenciaConJulian(fecha: Date, zona: string): string {
  const d = (desfase(fecha, zona) - desfase(fecha, ZONA_JULIAN)) / 60;
  if (d === 0) return "la misma hora que Julián";
  const n = Math.abs(d);
  const h = Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ",");
  return `${h} ${n === 1 ? "hora" : "horas"} ${d > 0 ? "más" : "menos"} que Julián`;
}

/** Fecha y hora de un instante en una zona: clave del día, día escrito y hora. */
export function enZona(fecha: Date, zona: string) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: zona, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
      .formatToParts(fecha)
      .map((x) => [x.type, x.value]),
  );
  return {
    clave: `${p.year}-${p.month}-${p.day}`,
    dia: new Intl.DateTimeFormat("es-AR", { timeZone: zona, weekday: "long", day: "numeric", month: "long" }).format(fecha),
    hora: `${p.hour}:${p.minute}`,
  };
}
