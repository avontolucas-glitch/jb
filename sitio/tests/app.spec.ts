import { test, expect } from "./ayuda";

test("el manifiesto de la app es válido e instalable", async ({ request }) => {
  const r = await request.get("/manifest.webmanifest");
  expect(r.ok()).toBeTruthy();
  const m = await r.json();
  expect(m.display).toBe("standalone");
  expect(m.start_url).toBeTruthy();
  const tamanos = m.icons.map((i: { sizes: string }) => i.sizes);
  expect(tamanos).toContain("192x192");
  expect(tamanos).toContain("512x512");
  expect(m.icons.some((i: { purpose?: string }) => i.purpose === "maskable")).toBeTruthy();
  for (const i of m.icons) expect((await request.get(i.src)).ok(), i.src).toBeTruthy();
  expect((await request.get("/icons/apple-touch-icon.png")).ok()).toBeTruthy();
});

test("el service worker se registra y la página sin conexión existe", async ({ page }) => {
  await page.goto("/");
  const activo = await page.evaluate(async () => !!(await navigator.serviceWorker.ready).active);
  expect(activo).toBeTruthy();
  expect((await page.request.get("/sin-conexion")).status()).toBe(200);
});

test("el dispositivo guarda lo público para usar sin internet, nunca el área privada", async ({ page }) => {
  await page.goto("/ingresar");
  await page.getByRole("button", { name: "Entrar como comprador@demo.com" }).click();
  await page.waitForURL("**/mi-espacio");
  await page.goto("/");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload(); // desde acá la página ya la controla el service worker
  await page.goto("/libros");
  await page.goto("/mi-espacio/cuenta");

  const guardadas = await page.evaluate(async () => {
    const urls: string[] = [];
    for (const k of await caches.keys())
      for (const r of await (await caches.open(k)).keys()) urls.push(new URL(r.url).pathname);
    return urls;
  });
  expect(guardadas).toContain("/libros");
  expect(guardadas).toContain("/sin-conexion");
  expect(guardadas.some((u) => u.startsWith("/mi-espacio"))).toBeFalsy();
  // (El modo sin conexión de Playwright no corta la red del service worker,
  //  así que la navegación offline se prueba a mano: ver README.)
});

test("la página /app muestra los pasos para cada sistema", async ({ page }) => {
  await page.goto("/app");
  for (const s of ["iPhone y iPad", "Android, Windows, Linux y Chromebook", "Mac", "Firefox"]) {
    await expect(page.getByRole("heading", { name: s, exact: true })).toBeVisible();
  }
  await expect(page.getByTestId("estado-app")).toBeVisible();
});

test.describe("aviso de instalación en iPhone", () => {
  test.use({
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  });
  test("explica Compartir y Agregar a pantalla de inicio, y recuerda si se cierra", async ({ page }) => {
    await page.goto("/");
    const aviso = page.getByTestId("aviso-app");
    await expect(aviso).toBeVisible();
    await expect(aviso).toHaveAttribute("data-plataforma", "ios");
    await expect(aviso).toContainText("Agregar a pantalla de inicio");
    await aviso.getByRole("button", { name: /Cerrar el aviso/ }).click();
    await expect(aviso).toHaveCount(0);
    await page.reload();
    await page.waitForTimeout(2500);
    await expect(page.getByTestId("aviso-app")).toHaveCount(0);
  });
});

test.describe("aviso de instalación en Safari de Mac", () => {
  test.use({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
    hasTouch: false,
    isMobile: false,
  });
  test("explica Archivo y Agregar al Dock", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("aviso-app")).toHaveAttribute("data-plataforma", "safari-mac");
    await expect(page.getByTestId("aviso-app")).toContainText("Agregar al Dock");
  });
});
