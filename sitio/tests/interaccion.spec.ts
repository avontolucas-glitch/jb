import { test, expect } from "./ayuda";

test("el interruptor de sonido silencia y queda recordado", async ({ page }) => {
  await page.goto("/");
  const boton = page.getByTestId("interruptor-sonido").last();
  await boton.scrollIntoViewIfNeeded();
  await expect(boton).toHaveText(/Sonido activado/);
  await boton.click();
  await expect(boton).toHaveText(/Sonido silenciado/);
  await page.reload();
  await expect(page.getByTestId("interruptor-sonido").last()).toHaveText(/Sonido silenciado/);
});

test("tocar una sección del menú estampa su emblema", async ({ page, isMobile }) => {
  await page.goto("/");
  if (isMobile) await page.getByRole("button", { name: "Menú" }).click();
  const enlace = page.locator(isMobile ? "#menu-movil .nav-enlace" : "header nav .nav-enlace", { hasText: "Conferencias" }).first();
  await enlace.click();
  await expect(page).toHaveURL(/\/conferencias/);
  if (!isMobile) await expect(enlace.locator(".nav-icono")).toHaveClass(/golpe/);
});

test("la app tiene capturas e identidad para la ventana de instalación", async ({ request }) => {
  const m = await (await request.get("/manifest.webmanifest")).json();
  expect(m.id).toBe("/");
  expect(m.screenshots.map((s: { form_factor: string }) => s.form_factor)).toEqual(["narrow", "wide"]);
  for (const s of m.screenshots) expect((await request.get(s.src)).ok(), s.src).toBeTruthy();
});
