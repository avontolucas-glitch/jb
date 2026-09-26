import { test, expect } from "@playwright/test";

const paginas = [
  "/",
  "/libros",
  "/conferencias",
  "/conferencias/abierta-2026",
  "/masterclass",
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
  await expect(page.locator("[data-marcador]").first()).toContainText("[TEXTO DE JULIAN]");
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
