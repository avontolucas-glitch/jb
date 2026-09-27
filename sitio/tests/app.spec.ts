import { test, expect } from "./ayuda";
import type { Page } from "@playwright/test";

/** Las pruebas esconden el aviso de la app; estas lo quieren ver (una sola vez: después vale lo que elija la persona). */
const verAviso = (page: Page) =>
  page.addInitScript(() => {
    if (sessionStorage.getItem("jb-probar-aviso")) return;
    sessionStorage.setItem("jb-probar-aviso", "1");
    localStorage.removeItem("jb-aviso-app-cerrado");
  });

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
  await expect(page.getByTestId("estado-app")).toContainText("Estás en");
});

test("un solo botón: sin instalación directa, abre la guía del sistema detectado", async ({ page }, info) => {
  await page.goto("/app");
  await page.getByTestId("estado-app").getByRole("button", { name: "Instalar la app" }).click();
  const guia = page.getByTestId("guia-instalar");
  await expect(guia).toBeVisible();
  await expect(guia).toContainText(info.project.name === "celular" ? "Instalá la app en tu teléfono" : "Instalá la app en tu computadora");
  await guia.getByRole("button", { name: "Cerrar" }).click();
  await expect(guia).toHaveCount(0);
});

test("un solo botón: donde el navegador instala directo, abre su ventana de instalación", async ({ page }, info) => {
  await page.goto("/app");
  await page.evaluate(() => {
    const e = new Event("beforeinstallprompt", { cancelable: true }) as Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
    e.prompt = async () => {
      (window as unknown as { __pidio: number }).__pidio = 1;
    };
    e.userChoice = Promise.resolve({ outcome: "accepted" });
    window.dispatchEvent(e);
  });
  const boton = info.project.name === "celular" ? page.getByTestId("estado-app").getByRole("button", { name: "Instalar la app" }) : page.getByTestId("instalar-nav");
  await boton.click();
  expect(await page.evaluate(() => (window as unknown as { __pidio?: number }).__pidio)).toBe(1);
  await expect(page.getByTestId("guia-instalar")).toHaveCount(0);
  await expect(page.getByTestId("estado-app")).toContainText("ya está instalada");
});

test("al llegar desde otro navegador para instalar, la guía se abre sola", async ({ page }) => {
  await page.goto("/app?instalar=1");
  await expect(page.getByTestId("guia-instalar")).toBeVisible();
  await expect(page).toHaveURL(/\/app$/);
});

test.describe("aviso de instalación en iPhone", () => {
  test.use({
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  });
  test("el aviso recuerda si se cierra, y el botón muestra Compartir y Agregar a pantalla de inicio", async ({ page }) => {
    await verAviso(page);
    await page.goto("/");
    const aviso = page.getByTestId("aviso-app");
    await expect(aviso).toBeVisible();
    await expect(aviso).toHaveAttribute("data-plataforma", "ios");
    await aviso.getByRole("button", { name: /Cerrar el aviso/ }).click();
    await expect(aviso).toHaveCount(0);
    await page.reload();
    await page.waitForTimeout(2500);
    await expect(page.getByTestId("aviso-app")).toHaveCount(0);

    await page.goto("/app");
    await page.getByTestId("estado-app").getByRole("button", { name: "Instalar la app" }).click();
    const guia = page.getByTestId("guia-instalar");
    await expect(guia).toContainText("Agregar a pantalla de inicio");
    await expect(guia).toContainText("iPhone · Safari");
  });
});

test.describe("aviso de instalación en Safari de Mac", () => {
  test.use({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
    hasTouch: false,
    isMobile: false,
  });
  test("el botón explica Archivo y Agregar al Dock", async ({ page }) => {
    await verAviso(page);
    await page.goto("/");
    await expect(page.getByTestId("aviso-app")).toHaveAttribute("data-plataforma", "safari-mac");
    await page.getByTestId("aviso-app").getByRole("button", { name: "Instalar la app" }).click();
    await expect(page.getByTestId("guia-instalar")).toContainText("Agregar al Dock");
  });
});

test.describe("desde el navegador de Instagram", () => {
  test.use({
    userAgent:
      "Mozilla/5.0 (Linux; Android 14; Pixel 7 Build/UQ1A.240205.004; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/128.0.6613.127 Mobile Safari/537.36 Instagram 348.0.0.36.101 Android",
  });
  test("intenta abrir Chrome y, si no puede, explica cómo salir de Instagram", async ({ page }) => {
    await page.goto("/app");
    await page.getByTestId("estado-app").getByRole("button", { name: "Instalar la app" }).click();
    await expect(page.getByTestId("guia-instalar")).toContainText("Desde Instagram no se puede instalar");
    await expect(page.getByTestId("guia-instalar")).toContainText("Abrir en Chrome");
  });
});
