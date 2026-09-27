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

/** La luz cae sobre el elemento de la parada (cuando termina de llegar: con la máquina cargada, el vuelo tarda más). */
async function iluminado(page: Page, testid: string) {
  await expect(async () => {
    const luz = (await page.getByTestId("recorrido-luz").boundingBox())!;
    const el = (await page.getByTestId(testid).boundingBox())!;
    expect(luz.x).toBeLessThanOrEqual(el.x + 1);
    expect(luz.y).toBeLessThanOrEqual(el.y + 1);
    expect(luz.x + luz.width).toBeGreaterThanOrEqual(el.x + el.width - 1);
    expect(luz.y + luz.height).toBeGreaterThanOrEqual(el.y + el.height - 1);
  }).toPass({ timeout: 6000 });
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

/**
 * Cuántos Yo Da se ven en cada cuadro, desde ahora hasta que se pide el resultado: el del rincón, el
 * de la cabecera del chat y el que vuela en el recorrido. Se cuenta como visible si ocupa lugar en
 * pantalla, no está oculto y su opacidad efectiva (la suya por la de sus contenedores) se nota.
 * Antes de empezar no se mira: con el chat abierto se ven el del rincón y el de la cabecera (así es
 * el chat), y el del rincón puede estar todavía apareciendo. Se cuenta mientras dura el recorrido y,
 * con `yDespues`, también después de que termina.
 */
type Conteo = { __ojos: number[]; __primero: { x: number; y: number } | null; __parar: boolean; __empezo: boolean };
async function contarOjos(page: Page, yDespues = false) {
  await page.evaluate((despues) => {
    const w = window as unknown as Conteo;
    w.__ojos = [];
    w.__primero = null;
    w.__parar = false;
    w.__empezo = false;
    const selector = ".yosoy-boton .ojo-pixel, .yosoy-cabeza .ojo-pixel, .recorrido-yo .ojo-pixel";
    const seVe = (el: Element) => {
      const b = el.getBoundingClientRect();
      if (b.width < 2 || b.bottom < 0 || b.top > innerHeight || b.right < 0 || b.left > innerWidth) return false;
      if (getComputedStyle(el).visibility === "hidden") return false;
      let op = 1;
      for (let n: Element | null = el; n; n = n.parentElement) op *= Number(getComputedStyle(n).opacity);
      return op > 0.1;
    };
    const cuadro = () => {
      if (w.__parar) return;
      const enRecorrido = document.documentElement.classList.contains("en-recorrido");
      if (enRecorrido) w.__empezo = true;
      const vuela = document.querySelector(".recorrido-yo .ojo-pixel")?.getBoundingClientRect();
      if (vuela && !w.__primero) w.__primero = { x: vuela.x + vuela.width / 2, y: vuela.y + vuela.height / 2 };
      if (enRecorrido || (despues && w.__empezo)) w.__ojos.push(Array.from(document.querySelectorAll(selector)).filter(seVe).length);
      requestAnimationFrame(cuadro);
    };
    requestAnimationFrame(cuadro);
  }, yDespues);
}
const ojosContados = (page: Page) =>
  page.evaluate(() => {
    const w = window as unknown as Conteo;
    w.__parar = true;
    return { cuadros: w.__ojos, primero: w.__primero };
  });

test("Recorrido: al salir, Yo Da no deja una copia en su lugar (un solo ojo en cada cuadro)", async ({ page }) => {
  // desde el rincón
  await page.goto("/");
  await expect(page.getByTestId("yosoy-nube-recorrido")).toBeVisible({ timeout: 20_000 });
  await contarOjos(page);
  await page.getByTestId("yosoy-nube-recorrido").click();
  await expect(page.getByTestId("recorrido-globo")).toBeVisible();
  await page.waitForTimeout(1200); // que termine de salir
  let { cuadros, primero } = await ojosContados(page);
  expect(cuadros.length).toBeGreaterThan(1);
  expect(cuadros.filter((n) => n !== 1)).toEqual([]);
  await page.getByTestId("recorrido-saltar").click();
  await expect(page.getByTestId("recorrido")).toHaveCount(0);

  // desde el chat («Empezar el recorrido»): sale del ojo de la cabecera, no del rincón
  await page.goto("/masterclass");
  await page.getByTestId("yosoy-boton").click();
  const campo = page.getByTestId("yosoy").getByLabel("Escribile a Yo Da");
  await campo.fill("mostrame el lugar");
  await campo.press("Enter");
  await expect(page.getByTestId("yosoy-recorrido")).toBeVisible();
  const cabeza = (await page.locator(".yosoy-cabeza .ojo-pixel").boundingBox())!;
  await contarOjos(page);
  await page.getByTestId("yosoy-recorrido").click();
  await expect(page.getByTestId("recorrido-globo")).toBeVisible();
  await page.waitForTimeout(1200);
  ({ cuadros, primero } = await ojosContados(page));
  expect(cuadros.length).toBeGreaterThan(1);
  expect(cuadros.filter((n) => n !== 1)).toEqual([]);
  // el que vuela arranca justo encima del de la cabecera
  expect(primero).not.toBeNull();
  expect(Math.abs(primero!.x - (cabeza.x + cabeza.width / 2))).toBeLessThan(3);
  expect(Math.abs(primero!.y - (cabeza.y + cabeza.height / 2))).toBeLessThan(3);

  // y al volver tampoco: se cierra y queda uno solo, el de siempre
  await contarOjos(page, true);
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("recorrido")).toHaveCount(0);
  await page.waitForTimeout(600);
  ({ cuadros } = await ojosContados(page));
  expect(cuadros.length).toBeGreaterThan(1);
  expect(cuadros.filter((n) => n !== 1)).toEqual([]);
});

test("Recorrido: aunque la página esté bajada, muestra también las secciones de arriba", async ({ page }, info) => {
  test.skip(info.project.name !== "computadora", "las secciones de arriba, en la compu (en el celular van en el menú)");
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, 1500));
  await page.getByTestId("yosoy-boton").click();
  const campo = page.getByTestId("yosoy").getByLabel("Escribile a Yo Da");
  await campo.fill("mostrame el lugar");
  await campo.press("Enter");
  await page.getByTestId("yosoy-recorrido").click();
  await expect(page.getByTestId("recorrido-globo")).toContainText("1 de 8");
  await page.getByTestId("recorrido-seguir").click();
  await expect(page.getByTestId("recorrido")).toHaveAttribute("data-parada", "libros");
});
