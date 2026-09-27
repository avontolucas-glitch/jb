import { test, expect } from "./ayuda";
import type { Page } from "@playwright/test";

/** Le escribe a Yo Da y devuelve su última respuesta. */
async function preguntar(page: Page, texto: string) {
  const yo = page.getByTestId("yosoy");
  if (!(await yo.isVisible())) await page.getByTestId("yosoy-boton").click();
  const antes = await yo.locator(".yosoy-msj.yo:not(.yosoy-pensando)").count();
  const campo = yo.getByLabel("Escribile a Yo Da");
  await campo.fill(texto);
  await campo.press("Enter");
  await expect.poll(() => yo.locator(".yosoy-msj.yo:not(.yosoy-pensando)").count()).toBeGreaterThan(antes);
  return yo.locator(".yosoy-msj.yo:not(.yosoy-pensando)").last();
}

/** Simula la conexión: la latitud aproximada y el tiempo que hace (solo en modo pruebas). */
async function conexion(page: Page, o: { lat?: number; clima?: { temp: number; cielo: string; noche?: boolean } }) {
  const h: Record<string, string> = {};
  if (o.lat !== undefined) h["x-jb-prueba-lat"] = String(o.lat);
  if (o.clima) h["x-jb-prueba-clima"] = JSON.stringify(o.clima);
  await page.route("**/api/yo", (route) => route.continue({ headers: { ...route.request().headers(), ...h } }));
}

for (const f of [
  { fecha: "2026-12-25T12:00:00-03:00", pregunta: "que se festeja hoy?", espera: "Feliz Navidad" },
  { fecha: "2027-01-06T12:00:00-03:00", pregunta: "es feriado?", espera: "Reyes" },
  // Pascua 2027: 28 de marzo; Viernes Santo, el 26
  { fecha: "2027-03-26T12:00:00-03:00", pregunta: "semana santa?", espera: "Viernes Santo" },
]) {
  test(`Yo Da sabe la fiesta del día en tu zona: ${f.espera}`, async ({ page }) => {
    await page.clock.setFixedTime(new Date(f.fecha));
    // el aviso de «Instalar la app» se cerró «hoy» (si no, con la fecha adelantada vuelve a aparecer)
    await page.addInitScript((t) => localStorage.setItem("jb-aviso-app-cerrado", String(t)), new Date(f.fecha).getTime());
    await page.goto("/");
    await expect(await preguntar(page, f.pregunta)).toContainText(f.espera);
  });
}

test("Yo Da sabe la estación según el hemisferio (sin decir dónde estás)", async ({ page }) => {
  await conexion(page, { lat: -34 });
  await page.clock.setFixedTime(new Date("2026-09-27T12:00:00-03:00"));
  await page.addInitScript((t) => localStorage.setItem("jb-aviso-app-cerrado", String(t)), new Date("2026-09-27T12:00:00-03:00").getTime());
  await page.goto("/");
  const r = await preguntar(page, "que estacion es?");
  await expect(r).toContainText(/[Pp]rimavera/);
  await expect(r).not.toContainText("Buenos Aires");
});

test("…y en el norte, en la misma fecha, otoño", async ({ page }) => {
  await conexion(page, { lat: 40 });
  await page.clock.setFixedTime(new Date("2026-10-15T12:00:00-03:00"));
  await page.addInitScript((t) => localStorage.setItem("jb-aviso-app-cerrado", String(t)), new Date("2026-10-15T12:00:00-03:00").getTime());
  await page.goto("/");
  await expect(await preguntar(page, "en que estacion estamos")).toContainText(/[Oo]toño/);
});

test("Yo Da comenta el tiempo que hace: calor, lluvia", async ({ page }) => {
  await conexion(page, { lat: -34, clima: { temp: 35.4, cielo: "despejado" } });
  await page.goto("/");
  const r = await preguntar(page, "hace calor?");
  await expect(r).toContainText("35 grados");
  await expect(r).toContainText("Calor fuerte");
});

test("Mientras suena la música, Yo Da asiente (y deja de asentir en pausa)", async ({ page }) => {
  await page.goto("/");
  const boton = page.getByTestId("yosoy-boton");
  // (se repite el aviso hasta que Yo Da ya está escuchando: la página puede estar terminando de cargar)
  await expect
    .poll(async () => {
      await page.evaluate(() => window.dispatchEvent(new CustomEvent("jb:musica-estado", { detail: { sonando: true } })));
      return boton.getAttribute("class");
    })
    .toContain("escuchando");
  await expect(boton.locator(".yosoy-asiente")).toHaveCSS("animation-name", "asentir");
  await page.evaluate(() => window.dispatchEvent(new CustomEvent("jb:musica-estado", { detail: { sonando: false } })));
  await expect(boton).not.toHaveClass(/escuchando/);
});

test("En el recorrido, Yo Da aclara que la música entera suena en la compu", async ({ page }) => {
  await page.goto("/");
  const r = await preguntar(page, "que musica hay?");
  await expect(r).toContainText("en la compu");
});

test("El día de tu cumpleaños (el de tu cuenta), Yo Da te saluda", async ({ page }) => {
  const hoy = new Date("2026-10-03T12:00:00-03:00");
  await page.clock.setFixedTime(hoy);
  await page.addInitScript((t) => localStorage.setItem("jb-aviso-app-cerrado", String(t)), hoy.getTime());
  // la cuenta (la respuesta de /api/yo, simulada): Ana, que cumple el 3 de octubre
  await page.route("**/api/yo", (route) => route.fulfill({ json: { nombre: "Ana", zonaConexion: null, lat: -34, clima: null, cumple: "10-03" } }));
  await page.goto("/");
  await expect(page.getByTestId("yosoy-nube")).toContainText("cumpleaños", { timeout: 15_000 });
  await expect(page.getByTestId("yosoy-nube")).toContainText("Ana");
  await page.getByTestId("yosoy-boton").click();
  await expect(page.getByTestId("yosoy").locator(".yosoy-msj.yo").first()).toContainText("cumpleaños");
});

test("…y otro día, no", async ({ page }) => {
  const hoy = new Date("2026-10-04T12:00:00-03:00");
  await page.clock.setFixedTime(hoy);
  await page.addInitScript((t) => localStorage.setItem("jb-aviso-app-cerrado", String(t)), hoy.getTime());
  await page.route("**/api/yo", (route) => route.fulfill({ json: { nombre: "Ana", zonaConexion: null, lat: -34, clima: null, cumple: "10-03" } }));
  await page.goto("/");
  await expect(page.getByTestId("yosoy-nube")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId("yosoy-nube")).not.toContainText("cumpleaños");
});
