import { test, expect } from "./ayuda";
import type { Page } from "@playwright/test";

/** El globo y Yo Da quedan dentro de la pantalla, y la página no se ensancha. */
async function dentroDePantalla(page: Page) {
  const vp = page.viewportSize()!;
  const g = (await page.getByTestId("recorrido-globo").boundingBox())!;
  expect(g.x).toBeGreaterThanOrEqual(0);
  expect(g.y).toBeGreaterThanOrEqual(0);
  expect(g.x + g.width).toBeLessThanOrEqual(vp.width + 1);
  expect(g.y + g.height).toBeLessThanOrEqual(vp.height + 1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(vp.width);
}

/** La luz cae sobre el elemento de la parada. */
async function iluminado(page: Page, testid: string) {
  const luz = (await page.getByTestId("recorrido-luz").boundingBox())!;
  const el = (await page.getByTestId(testid).boundingBox())!;
  expect(luz.x).toBeLessThanOrEqual(el.x + 1);
  expect(luz.y).toBeLessThanOrEqual(el.y + 1);
  expect(luz.x + luz.width).toBeGreaterThanOrEqual(el.x + el.width - 1);
  expect(luz.y + luz.height).toBeGreaterThanOrEqual(el.y + el.height - 1);
}

test("Recorrido: a quien entra por primera vez sin cuenta, Yo Da le muestra el lugar volando", async ({ page }, info) => {
  const compu = info.project.name === "computadora";
  await page.goto("/");
  const nube = page.getByTestId("yosoy-nube");
  await expect(nube).toContainText("¿El lugar te muestro?");
  await expect(nube).toContainText("crearte una cuenta debés");
  await nube.getByTestId("yosoy-nube-recorrido").click();

  const r = page.getByTestId("recorrido");
  const globo = page.getByTestId("recorrido-globo");
  await expect(globo).toBeVisible();
  await expect(globo).toHaveAttribute("role", "dialog");
  await expect(r).toHaveAttribute("data-parada", "hola");
  const total = compu ? 8 : 5;
  await expect(globo).toContainText(`1 de ${total}`);
  await expect(page.getByTestId("recorrido-texto")).toContainText("El lugar de Julián Bermúdez, este es");
  await expect(page.getByTestId("recorrido-seguir")).toBeFocused();
  await dentroDePantalla(page);

  const esperadas = compu ? ["libros", "masterclass", "mas", "musica", "app", "cuenta", "yoda"] : ["menu", "musica", "cuenta", "yoda"];
  for (const parada of esperadas) {
    await page.getByTestId("recorrido-seguir").click();
    await expect(r).toHaveAttribute("data-parada", parada);
    await page.waitForTimeout(1000); // que termine el vuelo
    await dentroDePantalla(page);
    if (parada === "musica") {
      await expect(page.getByTestId("recorrido-texto")).toContainText("Si aquí tocás, música suena");
      await expect(page.getByTestId("recorrido-texto")).toContainText("Spotify");
      await iluminado(page, "musica-boton");
    }
    if (parada === "yoda") await iluminado(page, "yosoy-boton");
  }

  // la última parada invita a crear la cuenta
  await expect(page.getByTestId("recorrido-texto")).toContainText("crearte una cuenta debés");
  await expect(globo.getByRole("link", { name: "Crear cuenta" })).toHaveAttribute("href", "/crear-cuenta");
  await page.getByTestId("recorrido-seguir").click(); // «Listo»
  await expect(r).toHaveCount(0);
  await expect(page.getByTestId("yosoy-boton")).toBeFocused();

  // ya lo vio: en otra pestaña, Yo Da saluda sin ofrecerlo de nuevo
  const otra = await page.context().newPage();
  await otra.goto("/libros");
  await expect(otra.getByTestId("yosoy-nube")).toContainText("crearte una cuenta debés");
  await expect(otra.getByTestId("yosoy-nube-recorrido")).toHaveCount(0);
  await otra.close();
});

test("Recorrido: se pide desde Yo Da y se maneja con el teclado", async ({ page }) => {
  await page.goto("/masterclass");
  await page.getByTestId("yosoy-boton").click();
  const campo = page.getByTestId("yosoy").getByLabel("Escribile a Yo Da");
  await campo.fill("mostrame el lugar");
  await campo.press("Enter");
  await page.getByTestId("yosoy-recorrido").click();

  const r = page.getByTestId("recorrido");
  await expect(r).toHaveAttribute("data-parada", "hola");
  await expect(page.getByTestId("recorrido-seguir")).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("recorrido-globo")).toContainText("2 de");
  await page.keyboard.press("ArrowLeft");
  await expect(r).toHaveAttribute("data-parada", "hola");
  // Tab no se escapa del globo
  for (let k = 0; k < 4; k++) await page.keyboard.press("Tab");
  expect(await page.evaluate(() => !!document.activeElement?.closest("[data-testid=recorrido-globo]"))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(r).toHaveCount(0);
});

test("Recorrido: sin movimiento si la persona lo pidió", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByTestId("yosoy-nube-recorrido").click();
  await page.getByTestId("recorrido-seguir").click();
  const animaciones = await page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-testid=recorrido] *")).filter((el) => getComputedStyle(el).animationName !== "none").length,
  );
  expect(animaciones).toBe(0);
  await page.getByTestId("recorrido-saltar").click();
  await expect(page.getByTestId("recorrido")).toHaveCount(0);
});
