import type { Page, TestInfo } from "@playwright/test";
import { test, expect, ingresar, elegirDia } from "./ayuda";

/**
 * Reprogramar, cancelar y liberar encuentros de la Masterclass 1 a 1.
 * Cada prueba usa sus propios horarios, que carga Julián (cuenta demo, con
 * JB_ADMIN_DEMO=1): días lejos de los de agenda.spec.ts (20 a 33) y horas
 * lejos de los horarios fijos (11 y 18 h).
 */
const RUTA = "/masterclass/1-a-1";

/** "AAAA-MM-DD" de dentro de n días, en hora de Argentina. */
const fechaAR = (n: number) => new Date(Date.now() - 3 * 3600e3 + n * 864e5).toISOString().slice(0, 10);
/** Las pruebas corren dos veces (celular y computadora) sobre los mismos datos: cada proyecto usa sus propios días. */
const dia = (info: TestInfo, n: number) => fechaAR(n + (info.project.name === "celular" ? 0 : 1));
/** Número de intento: si la prueba se repite sobre los mismos datos (--retries, --repeat-each), cambia. */
const intento = (info: TestInfo) => info.repeatEachIndex * 3 + info.retry;
/** Hora de un horario de prueba: cada intento usa otra, a dos horas de las demás. */
const HORAS = ["07", "09", "13", "15", "20", "22"];
const hora = (info: TestInfo, min = "10") => `${HORAS[intento(info) % HORAS.length]}:${min}`;

/**
 * Fecha y hora de Argentina de dentro de unas horas (entre las 12 de anticipación
 * mínima y las 48 del aviso para cambios), en múltiplos de 5 minutos. Cada
 * proyecto e intento usa otra franja, y se esquivan los horarios fijos (11 y 18 h).
 */
function dentroDeUnDia(info: TestInfo): { fecha: string; hora: string } {
  const horas = (info.project.name === "celular" ? 14 : 30) + (intento(info) % 4) * 4;
  let ms = Date.now() + horas * 3600e3;
  const minutos = (t: number) => Math.floor((t - 3 * 3600e3) / 60e3) % (24 * 60);
  const cerca = (m: number) => Math.abs(m - 11 * 60) < 70 || Math.abs(m - 18 * 60) < 70;
  if (cerca(minutos(ms))) ms += 150 * 60e3;
  const ar = new Date(ms - 3 * 3600e3);
  ar.setUTCMinutes(ar.getUTCMinutes() - (ar.getUTCMinutes() % 5));
  return { fecha: ar.toISOString().slice(0, 10), hora: ar.toISOString().slice(11, 16) };
}

/** Julián entra y va a su panel. */
async function entrarComoJulian(page: Page) {
  await ingresar(page, "julian@demo.com", "demo1234");
  await page.waitForURL("**/mi-espacio");
  await page.goto("/mi-espacio/agenda");
  await expect(page.getByTestId("agenda-panel")).toBeVisible();
}

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
/** "2026-11-12" → "12 de noviembre", como lo dice el aviso del panel. */
const diaYMes = (fecha: string) => `${Number(fecha.slice(8, 10))} de ${MESES[Number(fecha.slice(5, 7)) - 1]}`;

/**
 * Carga un horario desde el panel y devuelve su id ("AAAA-MM-DDTHH-MM"). Espera
 * el aviso de ese día (no el del horario anterior, que puede seguir a la vista).
 */
async function agregarHorario(page: Page, fecha: string, h: string) {
  await page.getByLabel("Fecha", { exact: true }).fill(fecha);
  await page.getByLabel("Hora", { exact: true }).fill(h);
  await page.getByRole("button", { name: "Agregar horario" }).click();
  const aviso = page.getByTestId("mensaje-ok");
  await expect(aviso).toContainText("agregaste");
  await expect(aviso).toContainText(`${diaYMes(fecha)}, ${h} h`);
  return `${fecha}T${h.replace(":", "-")}`;
}

async function reservar(p: Page, id: string, nota?: string) {
  await p.goto(`/checkout/sesion-${id}`);
  if (nota) await p.getByLabel(/Qué te gustaría trabajar/).fill(nota);
  await p.getByRole("button", { name: "Pagar (simulado)" }).click();
  await p.waitForURL("**/mi-espacio/sesiones?compra=ok");
}

/** El estado de un horario en el calendario público ("libre", "tuya", "ocupado"). */
async function estadoPublico(p: Page, id: string) {
  await p.goto(RUTA);
  await elegirDia(p, id.slice(0, 10));
  return p.getByTestId(`horario-${id}`);
}

test("reprogramar pasa el encuentro al horario nuevo y cancelar lo libera", async ({ page, otraPersona }, info) => {
  await entrarComoJulian(page);
  const viejo = await agregarHorario(page, dia(info, 40), hora(info));
  const nuevo = await agregarHorario(page, dia(info, 42), hora(info));

  const { p } = await otraPersona("reprograma");
  await reservar(p, viejo, "Quiero trabajar la constancia.");

  // a más de 48 horas: se puede reprogramar y cancelar
  const mia = p.getByTestId(`mi-sesion-${viejo}`);
  await expect(mia.getByTestId("sin-cambios")).toHaveCount(0);
  await mia.getByTestId("reprogramar").click();
  await p.waitForURL(/\/mi-espacio\/sesiones\/reprogramar\?id=/);
  await expect(p.getByTestId("encuentro-actual")).toBeVisible();

  // el calendario muestra el encuentro de ahora como tuyo y deja elegir otro
  await elegirDia(p, viejo.slice(0, 10));
  await expect(p.getByTestId(`horario-${viejo}`)).toHaveAttribute("data-estado", "tuya");
  await elegirDia(p, nuevo.slice(0, 10));
  await p.getByTestId(`horario-${nuevo}`).click();
  await expect(p.getByTestId("confirmar-reprogramacion")).toBeVisible();
  await p.getByTestId("confirmar-reprogramar").click();
  await p.waitForURL(/\/mi-espacio\/sesiones\?reprogramada=/);
  await expect(p.getByTestId("reprogramada-ok")).toBeVisible();

  // queda el nuevo, con lo que había contado; el viejo ya no está
  await expect(p.getByTestId(`mi-sesion-${viejo}`)).toHaveCount(0);
  await expect(p.getByTestId(`mi-sesion-${nuevo}`)).toContainText("Quiero trabajar la constancia.");

  // en el calendario público, el viejo quedó libre y el nuevo es «tu encuentro»
  await expect(await estadoPublico(p, viejo)).toHaveAttribute("data-estado", "libre");
  await expect(await estadoPublico(p, nuevo)).toHaveAttribute("data-estado", "tuya");

  // en el panel de Julián, la reserva figura en el horario nuevo
  await page.goto("/mi-espacio/agenda");
  await expect(page.getByTestId(`reserva-${nuevo}`)).toContainText("Quiero trabajar la constancia.");
  await expect(page.getByTestId(`reserva-${viejo}`)).toHaveCount(0);

  // cancelar pide confirmación; «No» deja todo como estaba
  await p.goto("/mi-espacio/sesiones");
  await p.getByTestId(`mi-sesion-${nuevo}`).getByTestId("cancelar").click();
  await expect(p.getByTestId("confirmar-cancelacion")).toBeVisible();
  await p.getByTestId("no-cancelar").click();
  await expect(p.getByTestId("confirmar-cancelacion")).toHaveCount(0);
  await expect(p.getByTestId(`mi-sesion-${nuevo}`)).toBeVisible();

  await p.getByTestId(`mi-sesion-${nuevo}`).getByTestId("cancelar").click();
  await p.getByTestId("confirmar-cancelar").click();
  await p.waitForURL(/\/mi-espacio\/sesiones\?cancelada=/);
  await expect(p.getByTestId("cancelada-ok")).toContainText("mismo medio con el que pagaste");
  await expect(p.getByTestId(`mi-sesion-${nuevo}`)).toHaveCount(0);

  // el horario quedó libre para todos y ya no está entre las reservas de Julián
  await expect(await estadoPublico(p, nuevo)).toHaveAttribute("data-estado", "libre");
  await page.goto("/mi-espacio/agenda");
  await expect(page.getByTestId(`reserva-${nuevo}`)).toHaveCount(0);

  // y se puede volver a reservar
  const { p: p3 } = await otraPersona("despues");
  await reservar(p3, nuevo);
  await expect(p3.getByTestId(`mi-sesion-${nuevo}`)).toBeVisible();
});

test("nadie reprograma ni cancela un encuentro ajeno", async ({ page, otraPersona }, info) => {
  await entrarComoJulian(page);
  const id = await agregarHorario(page, dia(info, 44), hora(info));
  const { p } = await otraPersona("duena");
  await reservar(p, id);

  const { p: ajena } = await otraPersona("ajena");
  await ajena.goto(`/mi-espacio/sesiones/reprogramar?id=${id}`);
  await expect(ajena.getByTestId("reprogramar-no")).toBeVisible();
  await expect(ajena.getByTestId("confirmar-reprogramar")).toHaveCount(0);
  await ajena.goto(`/mi-espacio/sesiones?cancelar=${id}`);
  await expect(ajena.getByTestId("confirmar-cancelar")).toHaveCount(0);

  // sigue siendo de quien lo reservó
  await p.goto("/mi-espacio/sesiones");
  await expect(p.getByTestId(`mi-sesion-${id}`)).toBeVisible();
});

test("a menos de 48 horas no hay botones: se explica a quién escribir", async ({ page, otraPersona }, info) => {
  await entrarComoJulian(page);
  const cuando = dentroDeUnDia(info);
  const id = await agregarHorario(page, cuando.fecha, cuando.hora);

  const { p } = await otraPersona("cerca");
  await reservar(p, id);
  const mia = p.getByTestId(`mi-sesion-${id}`);
  await expect(mia).toBeVisible();
  await expect(mia.getByTestId("reprogramar")).toHaveCount(0);
  await expect(mia.getByTestId("cancelar")).toHaveCount(0);
  await expect(mia.getByTestId("sin-cambios")).toContainText("(mail de contacto, a definir)");

  // tampoco entrando directo
  await p.goto(`/mi-espacio/sesiones/reprogramar?id=${id}`);
  await expect(p.getByTestId("sin-cambios")).toBeVisible();
  await expect(p.getByTestId("confirmar-reprogramar")).toHaveCount(0);
  await p.goto(`/mi-espacio/sesiones?cancelar=${id}`);
  await expect(p.getByTestId("confirmar-cancelar")).toHaveCount(0);
});

test("Julián libera una reserva: se cancela y el horario queda libre", async ({ page, otraPersona }, info) => {
  await entrarComoJulian(page);
  const id = await agregarHorario(page, dia(info, 46), hora(info));
  const { p } = await otraPersona("liberada", "Persona Liberada");
  await reservar(p, id);

  await page.goto("/mi-espacio/agenda");
  const reserva = page.getByTestId(`reserva-${id}`);
  await expect(reserva).toContainText("Persona Liberada");
  await reserva.getByTestId(`liberar-${id}`).click();
  await expect(page.getByTestId("confirmar-liberacion")).toContainText("Persona Liberada");
  await page.getByTestId("confirmar-liberar").click();
  await page.waitForURL(/\/mi-espacio\/agenda\?liberada=/);
  await expect(page.getByTestId("liberada-ok")).toBeVisible();
  await expect(page.getByTestId(`reserva-${id}`)).toHaveCount(0);

  // en el calendario del panel figura libre
  await elegirDia(page, id.slice(0, 10));
  await expect(page.getByTestId(`agenda-${id}`)).toHaveAttribute("data-estado", "libre");

  // quien lo había reservado ya no lo tiene, y en el calendario público está libre
  await p.goto("/mi-espacio/sesiones");
  await expect(p.getByTestId(`mi-sesion-${id}`)).toHaveCount(0);
  await expect(await estadoPublico(p, id)).toHaveAttribute("data-estado", "libre");
});
