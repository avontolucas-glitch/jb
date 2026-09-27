/**
 * Archivos de calendario (.ics, RFC 5545) para agregar la Masterclass 1 a 1
 * al calendario del teléfono o de la computadora.
 */
import { sitio, sesiones } from "@/content/config";
import type { Horario } from "./sesiones";

export type Evento = { horario: Horario; resumen: string; descripcion: string; url?: string };

/** Fecha en UTC con el formato de iCalendar: 20260929T210000Z */
const utc = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/**
 * Escapa el texto según iCalendar: saca los caracteres de control (un CR suelto
 * podría cortar la línea y meter propiedades o eventos ajenos) y escapa barra,
 * punto y coma, coma y saltos de línea.
 */
const texto = (t: string) =>
  t
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");

/** Corta las líneas largas a 75 bytes (UTF-8), sin partir una letra por la mitad. */
function plegar(linea: string): string {
  const enc = new TextEncoder();
  const partes: string[] = [];
  let actual = "";
  let bytes = 0;
  for (const c of linea) {
    const n = enc.encode(c).length;
    const limite = partes.length === 0 ? 75 : 74; // las líneas que siguen empiezan con un espacio
    if (bytes + n > limite) {
      partes.push(actual);
      actual = "";
      bytes = 0;
    }
    actual += c;
    bytes += n;
  }
  partes.push(actual);
  return partes.join("\r\n ");
}

/** UID estable: el mismo horario da siempre el mismo evento (si se agrega dos veces, no se duplica). */
export const uidDe = (id: string) => `masterclass-1-a-1-${id}@${sitio.dominio}`;

export function calendario(eventos: Evento[], nombre?: string, ahora = new Date()): string {
  const lineas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${sitio.dominio}//${sesiones.titulo}//ES`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...(nombre ? [`X-WR-CALNAME:${texto(nombre)}`] : []),
  ];
  for (const e of eventos) {
    const fin = new Date(e.horario.fecha.getTime() + sesiones.duracionMinutos * 60_000);
    lineas.push(
      "BEGIN:VEVENT",
      `UID:${uidDe(e.horario.id)}`,
      `DTSTAMP:${utc(ahora)}`,
      `DTSTART:${utc(e.horario.fecha)}`,
      `DTEND:${utc(fin)}`,
      `SUMMARY:${texto(e.resumen)}`,
      `DESCRIPTION:${texto(e.descripcion)}`,
      ...(e.url ? [`URL:${e.url}`] : []),
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${texto(e.resumen)}`,
      "TRIGGER:-PT30M",
      "END:VALARM",
      "END:VEVENT",
    );
  }
  lineas.push("END:VCALENDAR");
  return lineas.map(plegar).join("\r\n") + "\r\n";
}

/**
 * Respuesta HTTP con el archivo de calendario. Va `inline` (no `attachment`):
 * así el iPhone muestra «Agregar al calendario» en lugar de mandarlo a Archivos.
 */
export function respuestaIcs(contenido: string, archivo: string): Response {
  return new Response(contenido, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="${archivo}"`,
      "Cache-Control": "no-store",
    },
  });
}

/**
 * Link para agregar el evento en Google Calendar desde la web (la app de
 * Android no abre archivos .ics). Las fechas van en UTC: 20260929T210000Z/20260929T220000Z.
 */
export function linkGoogleCalendar(e: Evento): string {
  const final = new Date(e.horario.fecha.getTime() + sesiones.duracionMinutos * 60_000);
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: e.resumen,
    dates: `${utc(e.horario.fecha)}/${utc(final)}`,
    details: e.descripcion,
    ctz: "America/Argentina/Buenos_Aires",
  });
  if (e.url) q.set("location", e.url);
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}

/** Link de la videollamada de un horario (solo lo ve quien reservó y Julián). */
export const linkSala = (id: string) => `${sesiones.linkSala}${id}`;

/** El evento de una reserva, para quien la hizo: su archivo .ics y su link de Google Calendar dicen lo mismo. */
export function eventoDeReserva(h: Horario): Evento {
  const sala = linkSala(h.id);
  return {
    horario: h,
    resumen: `${sesiones.titulo} con ${sitio.nombre}`,
    descripcion: `${sesiones.modalidad}. Link de la videollamada: ${sala}\nEs solo para vos.`,
    url: sala,
  };
}
