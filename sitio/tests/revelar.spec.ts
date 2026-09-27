import { test as base, expect, type Page } from "@playwright/test";

/** Baja la página de a poco, como una persona, hasta el final. */
async function bajarHastaElFinal(page: Page) {
  for (let i = 0; i < 40; i++) {
    const fin = await page.evaluate(() => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4);
    if (fin) break;
    await page.mouse.wheel(0, 450);
    await page.waitForTimeout(260);
  }
  await page.waitForTimeout(900);
}

const pendientes = (page: Page) =>
  page.evaluate(() => [...document.querySelectorAll("main .revelar:not(.visto)")].map((e) => (e.textContent ?? e.className).trim().slice(0, 40)));

base("entrando por el ojo, todo el contenido aparece al bajar, en cada página", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByTestId("umbral")).toBeHidden();
  for (const ruta of ["/", "/masterclass", "/masterclass/1-a-1", "/masterclass/grabada", "/libros", "/conferencias", "/app"]) {
    if (ruta !== "/") await page.goto(ruta);
    await bajarHastaElFinal(page);
    expect(await pendientes(page), `${ruta}: quedaron bloques sin aparecer`).toEqual([]);
  }
});

base("si el JavaScript del sitio no carga, a los pocos segundos se ve todo igual", async ({ page }) => {
  await page.route("**/_next/static/chunks/**", (r) => r.abort());
  await page.goto("/");
  await page.waitForTimeout(7800);
  await expect(page.locator("html")).toHaveClass(/sin-revelar/);
  await expect(page.getByTestId("umbral")).toBeHidden();
  const quien = page.locator("#quien");
  await quien.scrollIntoViewIfNeeded();
  await expect(quien).toBeVisible();
  expect(await page.locator("main .revelar").first().evaluate((e) => getComputedStyle(e).opacity)).toBe("1");
});
