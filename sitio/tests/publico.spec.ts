import { test as sinAtajo } from "@playwright/test";
import { test, expect } from "./ayuda";

const paginas = [
  "/",
  "/libros",
  "/conferencias",
  "/conferencias/abierta-2026",
  "/masterclass",
  "/en-vivo",
  "/fragmentos",
  "/lista",
  "/ingresar",
  "/crear-cuenta",
  "/legales/terminos",
  "/legales/privacidad",
  "/legales/reembolsos",
  "/app",
];

test("todas las páginas públicas cargan, sin desbordar a lo ancho", async ({ page }) => {
  for (const ruta of paginas) {
    const r = await page.goto(ruta);
    expect(r?.status(), ruta).toBe(200);
    const ancho = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(ancho, `${ruta} desborda`).toBeLessThanOrEqual(1);
  }
});

test("el sitio no menciona inteligencia artificial ni usa emojis", async ({ page }) => {
  for (const ruta of paginas) {
    await page.goto(ruta);
    const texto = await page.locator("body").innerText();
    expect(texto, ruta).not.toMatch(/inteligencia artificial|\bIA\b|\bAI\b|chatbot/i);
    expect(texto, ruta).not.toMatch(/\p{Extended_Pictographic}/u);
  }
});

test("los tres libros figuran como Próximamente y con marcador de texto", async ({ page }) => {
  await page.goto("/libros");
  for (const id of ["receta", "pensamiento", "biografia"]) {
    await expect(page.getByTestId(`estado-${id}`)).toHaveText("Próximamente");
  }
  await expect(page.locator("[data-marcador]").first()).toContainText("[TEXTO DE JULIÁN]");
});

test("inscripción a la conferencia abierta", async ({ page }) => {
  await page.goto("/conferencias/abierta-2026");
  await page.getByLabel("Nombre").fill("Sofía");
  await page.getByLabel("Mail").fill("sofia@prueba.com");
  await page.getByRole("button", { name: "Inscribirme" }).click();
  await expect(page.getByTestId("mensaje-ok")).toContainText("Quedaste inscripto");
});

test("sumarse a la lista por WhatsApp o por mail", async ({ page }) => {
  await page.goto("/lista");
  await page.getByLabel("Tu mail").fill("no-es-un-mail");
  await page.getByRole("button", { name: "Sumarme" }).click();
  await expect(page.getByTestId("mensaje-error")).toContainText("Revisá el mail");
  await page.getByText("WhatsApp", { exact: true }).click();
  await page.getByLabel(/número de WhatsApp/).fill("+54 9 11 5555 1234");
  await page.getByRole("button", { name: "Sumarme" }).click();
  await expect(page.getByTestId("mensaje-ok")).toContainText("WhatsApp");
});

sinAtajo("al entrar aparece el cuadro de bienvenida, una vez por visita", async ({ page }) => {
  await page.goto("/libros");
  const umbral = page.getByTestId("umbral");
  await expect(umbral).toBeVisible();
  await expect(umbral).toContainText("espacio exclusivo");
  await expect(umbral).toContainText("prohibida toda reproducción o difusión");
  await expect(page.getByRole("button", { name: "Entrar" })).toBeFocused();
  // detrás de la bienvenida no se revela nada todavía
  await page.waitForTimeout(800);
  await expect(page.locator(".revelar.visto")).toHaveCount(0);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.locator("html")).toHaveClass(/umbral-saliendo/);
  await expect(umbral).toBeHidden();
  await expect(page.locator(".revelar.visto").first()).toBeAttached();
  await expect(page.getByRole("heading", { name: "Los libros" })).toBeVisible();
  await page.goto("/");
  await expect(page.getByTestId("umbral")).toBeHidden();
});
