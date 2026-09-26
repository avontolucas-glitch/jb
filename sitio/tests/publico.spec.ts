import { test as sinAtajo } from "@playwright/test";
import { test, expect } from "./ayuda";

const paginas = [
  "/",
  "/libros",
  "/conferencias",
  "/conferencias/privada-1",
  "/masterclass",
  "/en-vivo",
  "/masterclass/grabada",
  "/fragmentos",
  "/lista",
  "/ingresar",
  "/crear-cuenta",
  "/legales/terminos",
  "/legales/privacidad",
  "/legales/reembolsos",
  "/app",
  "/canjear",
  "/sesiones",
  "/arrepentimiento",
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

test("los tres libros figuran como Próximamente y con su descripción", async ({ page }) => {
  await page.goto("/libros");
  for (const id of ["receta", "pensamiento", "biografia"]) {
    await expect(page.getByTestId(`estado-${id}`)).toHaveText("Próximamente");
  }
  await expect(page.locator("#receta")).toContainText("El libro de la práctica");
  await expect(page.locator("#biografia")).toContainText("Julián sin filtros");
});

test("las conferencias en vivo son todas con entrada simbólica", async ({ page }) => {
  await page.goto("/conferencias");
  await expect(page.locator("main")).not.toContainText(/gratis|abierta/i);
  await page.goto("/conferencias/abierta-2026");
  await expect(page.getByRole("heading", { name: "Esta página no existe" })).toBeVisible();
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

test.describe("celular chico", () => {
  test.use({ viewport: { width: 360, height: 740 } });
  test("la barra de arriba entra entera y muestra Ingresar", async ({ page }) => {
    for (const ruta of ["/", "/sesiones"]) {
      await page.goto(ruta);
      const ancho = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(ancho, `${ruta} desborda`).toBeLessThanOrEqual(1);
      await expect(page.getByTestId("cuenta-movil")).toBeVisible();
    }
  });
});

test("la masterclass es en vivo y los libros se leen online, separados", async ({ page }) => {
  await page.goto("/en-vivo");
  await expect(page).toHaveURL(/\/masterclass$/);
  await expect(page.getByTestId("directo-semana-1")).toBeVisible();
  await page.goto("/masterclass/grabada");
  await expect(page.locator("main")).not.toContainText("El Sentimiento Crea la Realidad");
  await page.goto("/libros");
  await expect(page.getByTestId("indice-receta").locator("li:not([aria-hidden])")).toHaveCount(6);
  await expect(page.getByTestId("leer-pensamiento")).toHaveAttribute("href", "/checkout/libro-pensamiento");
});

test("privacidad y reembolsos tienen texto, y el botón de arrepentimiento da un código", async ({ page }) => {
  await page.goto("/legales/privacidad");
  await expect(page.getByTestId("texto-legal")).toContainText("Ley 25.326");
  await page.goto("/legales/reembolsos");
  await expect(page.getByTestId("texto-legal")).toContainText("10 días corridos");
  await page.getByRole("link", { name: "Botón de arrepentimiento" }).last().click();
  await page.getByLabel("Nombre").fill("Ana");
  await page.getByLabel("Mail de la compra").fill("ana@prueba.com");
  await page.getByLabel("Qué compraste y cuándo").fill("Sesión privada del martes");
  await page.getByRole("button", { name: "Pedir la cancelación" }).click();
  await expect(page.getByTestId("mensaje-ok")).toContainText("ARR-");
});

test("la masterclass grabada está dentro de la sección Masterclass", async ({ page }) => {
  await page.goto("/masterclass");
  await expect(page.getByTestId("subnav-masterclass").getByRole("link", { name: "En vivo" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByTestId("bloque-grabada")).toBeVisible();
  await page.getByTestId("bloque-grabada").getByRole("link", { name: "Ver la masterclass grabada" }).click();
  await expect(page).toHaveURL(/\/masterclass\/grabada$/);
  await expect(page.getByTestId("subnav-masterclass").getByRole("link", { name: "Grabada" })).toHaveAttribute("aria-current", "page");
});
