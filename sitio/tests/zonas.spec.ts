import { test, expect, elegirDia } from "./ayuda";
import type { Page } from "@playwright/test";
import { enZona } from "../lib/zona";

/** "2026-09-29T18-00" (hora de Argentina) → instante */
const instante = (id: string) => new Date(`${id.slice(0, 10)}T${id.slice(11, 13)}:${id.slice(14, 16)}:00-03:00`);

async function primerLibre(page: Page) {
  const h = page.getByTestId("turnos-del-dia").locator('[data-estado="libre"]').first();
  await expect(h).toBeVisible();
  return ((await h.getAttribute("data-testid")) ?? "").replace("horario-", "");
}

test.describe("desde España", () => {
  test.use({ timezoneId: "Europe/Madrid" });
  test("ve los horarios en su hora, con la de Julián al lado", async ({ page }) => {
    await page.goto("/masterclass/1-a-1");
    await expect(page.getByTestId("zona")).toHaveAttribute("data-zona", "Europe/Madrid");
    await expect(page.getByTestId("zona-julian")).toContainText("horas más que Julián");
    const id = await primerLibre(page);
    const f = instante(id);
    await expect(page.getByTestId(`horario-${id}`)).toHaveAttribute("data-hora", enZona(f, "Europe/Madrid").hora);
    await expect(page.getByTestId(`julian-${id}`)).toContainText(`${enZona(f, "America/Argentina/Buenos_Aires").hora} h en Argentina`);

    // la confirmación de compra dice lo mismo
    await page.goto("/ingresar");
    await page.getByRole("button", { name: "Entrar como sincompras@demo.com" }).click();
    await page.waitForURL("**/mi-espacio");
    await page.goto(`/checkout/sesion-${id}`);
    const cuando = page.getByTestId("cuando");
    await expect(cuando).toContainText(`${enZona(f, "Europe/Madrid").hora} h (España)`);
    await expect(cuando).toContainText(`${enZona(f, "America/Argentina/Buenos_Aires").hora} h en Argentina`);
  });
});

test.describe("desde Japón", () => {
  test.use({ timezoneId: "Asia/Tokyo" });
  test("un horario de la tarde de Argentina cae al día siguiente, y se agrupa en ese día", async ({ page }) => {
    await page.goto("/masterclass/1-a-1");
    // los horarios de las 18 de Argentina son a las 6 de la mañana del día siguiente en Tokio
    const id = await primerLibre(page);
    const f = instante(id);
    const tokio = enZona(f, "Asia/Tokyo");
    await elegirDia(page, tokio.clave);
    await expect(page.getByTestId(`horario-${id}`)).toHaveAttribute("data-hora", tokio.hora);
    if (tokio.clave !== id.slice(0, 10)) await expect(page.getByTestId(`julian-${id}`)).toContainText(enZona(f, "America/Argentina/Buenos_Aires").dia);
  });
});

test.describe("desde México", () => {
  test.use({ timezoneId: "America/Mexico_City" });
  test("se puede cambiar la zona a mano y queda guardada", async ({ page }) => {
    await page.goto("/masterclass/1-a-1");
    await expect(page.getByTestId("zona")).toHaveAttribute("data-zona", "America/Mexico_City");
    const id = await primerLibre(page);
    const f = instante(id);
    await expect(page.getByTestId(`horario-${id}`)).toHaveAttribute("data-hora", enZona(f, "America/Mexico_City").hora);

    await page.getByLabel("Ves los horarios en").selectOption("America/New_York");
    await expect(page.getByTestId("zona")).toHaveAttribute("data-zona", "America/New_York");
    await elegirDia(page, enZona(f, "America/New_York").clave);
    await expect(page.getByTestId(`horario-${id}`)).toHaveAttribute("data-hora", enZona(f, "America/New_York").hora);
    await page.reload();
    await expect(page.getByTestId("zona")).toHaveAttribute("data-zona", "America/New_York");

    // en la hora de Julián no hace falta repetirla
    await page.getByLabel("Ves los horarios en").selectOption("America/Argentina/Buenos_Aires");
    await expect(page.getByTestId("zona-julian")).toContainText("Es la hora de Julián");
    await expect(page.locator('[data-testid^="julian-"]')).toHaveCount(0);
  });
});
