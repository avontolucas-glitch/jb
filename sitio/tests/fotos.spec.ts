import { test, expect } from "./ayuda";

test("las fotos de Julián se descubren y cargan al llegar a la pantalla", async ({ page }) => {
  await page.goto("/");
  for (const id of ["foto-julian-chef", "foto-julian-trofeo", "foto-julian-emplatando", "foto-julian-doble-exposicion", "foto-julian-mirada"]) {
    const foto = page.getByTestId(id);
    await foto.scrollIntoViewIfNeeded();
    await expect(foto).toHaveClass(/visto/);
    await expect.poll(() => foto.locator("img").evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth), { message: `${id} no cargó` }).toBeGreaterThan(0);
    await expect.poll(() => foto.locator(".foto-marco").evaluate((m) => getComputedStyle(m).clipPath), { timeout: 6000 }).toMatch(/inset\(0px( 0px)*\)|none/);
  }
  await page.goto("/masterclass");
  const mov = page.getByTestId("foto-julian-movimiento");
  await mov.scrollIntoViewIfNeeded();
  await expect.poll(() => mov.locator("img").evaluate((i: HTMLImageElement) => i.naturalWidth)).toBeGreaterThan(0);
});
