import type { Page, TestInfo } from "@playwright/test";
import { test, expect, ingresar, crearCuenta, unico, elegirDia } from "./ayuda";

const RUTA = "/masterclass/1-a-1";

/** "AAAA-MM-DD" de dentro de n días, en hora de Argentina. */
const fechaAR = (n: number) => new Date(Date.now() - 3 * 3600e3 + n * 864e5).toISOString().slice(0, 10);
/** Las pruebas corren dos veces (celular y computadora) sobre los mismos datos: cada proyecto usa sus propios días. */
const dia = (info: TestInfo, n: number) => fechaAR(n + (info.project.name === "celular" ? 0 : 1));
/** Número de intento: si la prueba se repite sobre los mismos datos (--retries, --repeat-each), cambia. */
const intento = (info: TestInfo) => info.repeatEachIndex * 3 + info.retry;
/**
 * Hora de un horario de prueba ("HH:MM"). Cada intento usa otra hora, a dos
 * horas de las demás y lejos de los horarios fijos (11 y 18 h): así un
 * reintento no choca con lo que dejó el anterior (ni «ya estaba», ni «se pisa»).
 */
const HORAS = ["06", "08", "13", "15", "20", "22"];
const hora = (info: TestInfo, min: string) => `${HORAS[intento(info) % HORAS.length]}:${min}`;
/** Fecha y hora de Argentina → formato UTC de iCalendar (20261016T091500Z). */
const utcIcs = (fecha: string, h: string, masMin = 0) =>
  new Date(new Date(`${fecha}T${h}:00-03:00`).getTime() + masMin * 60e3).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
/** "HH:MM" más unos minutos. */
const sumar = (h: string, min: number) => {
  const t = Number(h.slice(0, 2)) * 60 + Number(h.slice(3)) + min;
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
};

/** Julián entra y llega a su panel como lo haría él: desde su espacio y el menú. */
async function entrarComoJulian(page: Page) {
  await ingresar(page, "julian@demo.com", "demo1234");
  await page.waitForURL("**/mi-espacio");
  await expect(page.getByTestId("acceso-agenda")).toBeVisible();
  await page.getByRole("navigation", { name: "Tu espacio" }).getByRole("link", { name: "Agenda", exact: true }).click();
  await page.waitForURL("**/mi-espacio/agenda");
  await expect(page.getByTestId("agenda-panel")).toBeVisible();
}

async function cargar(page: Page, fecha: string, h: string) {
  await page.getByLabel("Fecha", { exact: true }).fill(fecha);
  await page.getByLabel("Hora", { exact: true }).fill(h);
  await page.getByRole("button", { name: "Agregar horario" }).click();
}

/** Carga un horario desde el panel y devuelve su id ("AAAA-MM-DDTHH-MM"). */
async function agregarHorario(page: Page, fecha: string, h: string) {
  await cargar(page, fecha, h);
  await expect(page.getByTestId("mensaje-ok")).toContainText("agregaste");
  return `${fecha}T${h.replace(":", "-")}`;
}

async function reservar(p: Page, id: string, nota?: string) {
  await p.goto(`/checkout/sesion-${id}`);
  if (nota) await p.getByLabel(/Qué te gustaría trabajar/).fill(nota);
  await p.getByRole("button", { name: "Pagar (simulado)" }).click();
  await p.waitForURL("**/mi-espacio/sesiones?compra=ok");
}

/**
 * Busca un horario en el calendario público. Si el día quedó sin horarios,
 * ni siquiera aparece como día: el localizador devuelto queda vacío.
 */
async function enCalendarioPublico(page: Page, id: string) {
  await page.goto(RUTA);
  const fecha = id.slice(0, 10);
  const mes = page.getByTestId("mes");
  for (let i = 0; i < 12; i++) {
    const visto = (await mes.getAttribute("data-mes")) ?? "";
    if (visto === fecha.slice(0, 7)) break;
    const boton = page.getByRole("button", { name: visto > fecha.slice(0, 7) ? "Mes anterior" : "Mes siguiente" });
    if (!(await boton.isEnabled())) break;
    await boton.click();
    await expect(mes).not.toHaveAttribute("data-mes", visto);
  }
  const d = page.getByTestId(`dia-${fecha}`);
  if ((await d.count()) > 0) await d.click();
  return page.getByTestId(`horario-${id}`);
}

const sinDesborde = async (page: Page) => expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);

test("Julián agrega un horario, aparece libre para todos y lo puede quitar", async ({ page, otraPersona }, info) => {
  await entrarComoJulian(page);

  // un horario que ya pasó no se puede cargar, y lo cargado no se borra
  await cargar(page, fechaAR(-1), "10:00");
  await expect(page.getByTestId("mensaje-error")).toContainText("ya pasó");
  await expect(page.getByLabel("Fecha", { exact: true })).toHaveValue(fechaAR(-1));
  await expect(page.getByLabel("Hora", { exact: true })).toHaveValue("10:00");

  const h = hora(info, "05");
  const id = await agregarHorario(page, dia(info, 20), h);
  // el calendario va solo al día nuevo
  await expect(page.getByTestId(`agenda-${id}`)).toHaveAttribute("data-estado", "libre");
  await expect(page.getByTestId(`agenda-${id}`)).toHaveAttribute("data-origen", "extra");

  // cargarlo de nuevo no lo duplica; uno que se pisa con él (media hora después) no entra
  await cargar(page, dia(info, 20), h);
  await expect(page.getByTestId("mensaje-ok")).toContainText("ya estaba en la agenda");
  await cargar(page, dia(info, 20), sumar(h, 30));
  await expect(page.getByTestId("mensaje-error")).toContainText("Se pisa con el horario");

  // cualquiera lo ve libre y puede ir a reservarlo
  const otra = await otraPersona("publico");
  const horario = await enCalendarioPublico(otra.p, id);
  await expect(horario).toHaveAttribute("data-estado", "libre");
  await expect(horario).toHaveAttribute("href", `/checkout/sesion-${id}`);

  // Julián lo quita: desaparece del panel y del calendario público
  await page.getByTestId(`quitar-${id}`).click();
  await expect(page.getByTestId(`agenda-${id}`)).toHaveCount(0);
  await expect(page.getByTestId("aviso-agenda")).toContainText("Quitaste");
  await expect(await enCalendarioPublico(otra.p, id)).toHaveCount(0);
});

test("Julián bloquea un horario con alguien en el checkout: no se puede pagar, y al cargarlo de nuevo vuelve", async ({ page, otraPersona }) => {
  // un horario fijo que hoy se puede reservar: el primero libre del calendario público
  const otra = await otraPersona("bloqueo");
  await otra.p.goto(RUTA);
  const libre = otra.p.getByTestId("turnos-del-dia").locator('[data-estado="libre"]').first();
  const id = (await libre.getAttribute("data-testid"))!.replace("horario-", "");
  // la otra persona ya tiene el checkout abierto
  await otra.p.goto(`/checkout/sesion-${id}`);
  await expect(otra.p.getByRole("button", { name: "Pagar (simulado)" })).toBeVisible();

  await entrarComoJulian(page);
  await elegirDia(page, id.slice(0, 10));
  await page.getByTestId(`bloquear-${id}`).click();
  await expect(page.getByTestId(`agenda-${id}`)).toHaveAttribute("data-estado", "bloqueado");
  // es el mismo botón, ahora para desbloquear, y el aviso llega también al lector de pantalla
  await expect(page.getByTestId(`desbloquear-${id}`)).toBeVisible();
  await expect(page.getByTestId("aviso-agenda")).toContainText("Bloqueaste");

  // aprieta «Pagar» después del bloqueo: el servidor lo rechaza
  await otra.p.getByRole("button", { name: "Pagar (simulado)" }).click();
  await expect(otra.p.getByTestId("mensaje-error")).toContainText("ya no está en la agenda");
  await expect(otra.p).toHaveURL(new RegExp(`/checkout/sesion-${id}$`));

  // ya no aparece, ni entrando directo al checkout
  await expect(await enCalendarioPublico(otra.p, id)).toHaveCount(0);
  await otra.p.goto(`/checkout/sesion-${id}`);
  await expect(otra.p.getByTestId("horario-no-disponible")).toBeVisible();

  // Julián lo vuelve a cargar desde el formulario y queda libre otra vez
  await agregarHorario(page, id.slice(0, 10), id.slice(11).replace("-", ":"));
  await expect(page.getByTestId(`agenda-${id}`)).toHaveAttribute("data-estado", "libre");
  await expect(page.getByTestId(`agenda-${id}`)).toHaveAttribute("data-origen", "base");
  await expect(await enCalendarioPublico(otra.p, id)).toHaveAttribute("data-estado", "libre");
});

test("Julián bloquea con anticipación un día fijo que todavía no está a la vista", async ({ page }, info) => {
  await entrarComoJulian(page);
  // un martes (celular) o jueves (computadora) de dentro de dos meses o más: tiene horario fijo a las 18
  const buscado = info.project.name === "celular" ? 2 : 4;
  let n = 60 + 7 * intento(info);
  while (new Date(`${fechaAR(n)}T12:00:00Z`).getUTCDay() !== buscado) n++;
  const fecha = fechaAR(n);

  await page.getByLabel("Día", { exact: true }).fill(fecha);
  await page.getByRole("button", { name: "Bloquear día u horario" }).click();
  await expect(page.getByTestId("bloqueo-ok")).toContainText("Bloqueaste el horario del");
  // y ese horario de las 18 ya figura bloqueado
  await page.getByLabel("Día", { exact: true }).fill(fecha);
  await page.getByLabel("Hora (opcional)").fill("18:00");
  await page.getByRole("button", { name: "Bloquear día u horario" }).click();
  await expect(page.getByTestId("bloqueo-ok")).toContainText("ya estaba bloqueado");
});

test("una reserva aparece en el panel de Julián con lo que contó y el link de la sala", async ({ page, otraPersona }, info) => {
  await entrarComoJulian(page);
  const id = await agregarHorario(page, dia(info, 23), hora(info, "30"));

  const quien = await otraPersona("reserva", "Clara Prueba");
  await reservar(quien.p, id, "Quiero trabajar la paciencia.");

  await page.reload();
  const r = page.getByTestId(`reserva-${id}`);
  await expect(r).toContainText("Clara Prueba");
  await expect(r).toContainText(quien.email);
  await expect(r).toContainText("Quiero trabajar la paciencia.");
  await expect(r.getByTestId(`sala-${id}`)).toHaveAttribute("href", new RegExp(`${id}$`));
  await elegirDia(page, id.slice(0, 10));
  await expect(page.getByTestId(`agenda-${id}`)).toHaveAttribute("data-estado", "reservado");
  // una reserva no se bloquea desde el panel
  await expect(page.getByTestId(`bloquear-${id}`)).toHaveCount(0);
});

test("una cuenta que no es la de Julián no ve la agenda", async ({ page }) => {
  await crearCuenta(page, unico("curiosa"));
  await expect(page.getByRole("navigation", { name: "Tu espacio" }).getByRole("link", { name: "Agenda", exact: true })).toHaveCount(0);
  await expect(page.getByTestId("acceso-agenda")).toHaveCount(0);
  const r = await page.goto("/mi-espacio/agenda");
  expect(r?.status()).toBe(404);
  await expect(page.getByTestId("agenda-panel")).toHaveCount(0);
  expect((await page.request.get("/api/agenda.ics")).status()).toBe(404);

  // sin sesión, lleva a ingresar
  await page.context().clearCookies();
  await page.goto("/mi-espacio/agenda");
  await expect(page).toHaveURL(/\/ingresar\?aviso=privado/);
  const ics = await page.request.get("/api/agenda.ics", { maxRedirects: 0 });
  expect(ics.status()).toBe(307);
  expect(ics.headers()["location"]).toContain("/ingresar?aviso=sesion");
});

test("el .ics y el link de Google Calendar de una reserva son solo de quien la hizo", async ({ page, otraPersona, request }, info) => {
  await entrarComoJulian(page);
  const fecha = dia(info, 26);
  const h = hora(info, "15");
  const id = await agregarHorario(page, fecha, h);

  const duena = await otraPersona("ics");
  await reservar(duena.p, id);
  const mia = duena.p.getByTestId(`mi-sesion-${id}`);
  const enlace = mia.getByTestId("agregar-calendario");
  await expect(enlace).toHaveText("Agregar a mi calendario");
  // sin «download»: el teléfono lo abre con su calendario
  await expect(enlace).not.toHaveAttribute("download");
  const href = (await enlace.getAttribute("href"))!;

  // la hora de Argentina pasa a UTC (+3) y dura 60 minutos
  const inicio = utcIcs(fecha, h);
  const final = utcIcs(fecha, h, 60);
  const google = new URL((await mia.getByTestId("google-calendar").getAttribute("href"))!);
  expect(google.origin + google.pathname).toBe("https://calendar.google.com/calendar/render");
  expect(google.searchParams.get("action")).toBe("TEMPLATE");
  expect(google.searchParams.get("dates")).toBe(`${inicio}/${final}`);
  expect(google.searchParams.get("text")).toBe("Masterclass 1 a 1 con Julián Bermúdez");

  const r = await duena.p.request.get(href);
  expect(r.status()).toBe(200);
  expect(r.headers()["content-type"]).toContain("text/calendar");
  expect(r.headers()["content-disposition"]).toContain(`filename="masterclass-1-a-1-${id}.ics"`);
  const ics = await r.text();
  expect(ics).toContain("BEGIN:VCALENDAR");
  expect(ics).toContain("BEGIN:VEVENT");
  expect(ics).toContain(`DTSTART:${inicio}`);
  expect(ics).toContain(`DTEND:${final}`);
  expect(ics).toContain("SUMMARY:Masterclass 1 a 1 con Julián Bermúdez");
  expect(ics).toContain(`UID:masterclass-1-a-1-${id}@julianbermudez.com`);

  // otra persona no puede bajar el evento ajeno; sin sesión, lleva a ingresar (nunca un archivo roto)
  const ajena = await otraPersona("ajena");
  expect((await ajena.p.request.get(href)).status()).toBe(404);
  const sinSesion = await request.get(href, { maxRedirects: 0 });
  expect(sinSesion.status()).toBe(307);
  expect(sinSesion.headers()["location"]).toContain("/ingresar?aviso=sesion");

  // Julián baja todas sus reservas juntas, desde el botón de su panel
  await page.reload();
  await expect(page.getByTestId("agenda-ics")).toHaveAttribute("href", "/api/agenda.ics");
  await expect(page.getByTestId("agenda-ics")).not.toHaveAttribute("download");
  const agenda = await page.request.get("/api/agenda.ics");
  expect(agenda.status()).toBe(200);
  expect(agenda.headers()["content-type"]).toContain("text/calendar");
  expect(await agenda.text()).toContain(`UID:masterclass-1-a-1-${id}@julianbermudez.com`);
});

test.describe("celular chico", () => {
  test.use({ viewport: { width: 360, height: 740 } });

  test("el panel de la agenda y los encuentros entran en 360 px", async ({ page, otraPersona }, info) => {
    await entrarComoJulian(page);
    const reservado = await agregarHorario(page, dia(info, 29), hora(info, "45"));
    const libre = await agregarHorario(page, dia(info, 32), hora(info, "45"));

    // (la parte de antes de la @ puede tener hasta 64 caracteres: lib/validar.ts)
    const quien = await otraPersona("persona-con-un-mail-bastante-largo", "Persona Con Un Nombre Bastante Largo");
    await reservar(quien.p, reservado, "Una nota con varias líneas.\nPara ver cómo se acomoda en un teléfono chico, sin cortarse.");

    // Julián: reservas con mail largo, sala, calendario y la fila de botones
    await page.goto("/mi-espacio/agenda");
    // el menú de su espacio muestra «Agenda» sin tener que buscarla
    await expect(page.getByRole("navigation", { name: "Tu espacio" }).getByRole("link", { name: "Agenda", exact: true })).toBeInViewport();
    await expect(page.getByTestId(`reserva-${reservado}`)).toContainText(quien.email);
    await elegirDia(page, libre.slice(0, 10));
    await expect(page.getByTestId(`bloquear-${libre}`)).toBeVisible();
    await expect(page.getByTestId(`quitar-${libre}`)).toBeVisible();
    await sinDesborde(page);

    // quien reservó: su encuentro, con el link y los botones del calendario
    await quien.p.goto("/mi-espacio/sesiones");
    const mia = quien.p.getByTestId(`mi-sesion-${reservado}`);
    await expect(mia.getByTestId("agregar-calendario")).toBeVisible();
    await expect(mia.getByTestId("google-calendar")).toBeVisible();
    await sinDesborde(quien.p);
  });
});
