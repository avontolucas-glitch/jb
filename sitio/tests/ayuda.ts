import { test as base, expect, type Page } from "@playwright/test";

/** En las pruebas se entra directo, salteando el cuadro de bienvenida (se prueba aparte). */
export const test = base.extend({
  context: async ({ context }, use) => {
    await context.addInitScript(() => {
      try {
        sessionStorage.setItem("jb-umbral", "1");
      } catch {}
    });
    await use(context);
  },
});
export { expect };

export const unico = (p: string) => `${p}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@prueba.com`;

export async function crearCuenta(page: Page, email: string, nombre = "Prueba") {
  await page.goto("/crear-cuenta");
  await page.getByLabel("Nombre").fill(nombre);
  await page.getByLabel("Mail").fill(email);
  await page.getByLabel("Clave").fill("clave-segura-1");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await page.waitForURL("**/mi-espacio");
}

export async function ingresar(page: Page, email: string, clave: string) {
  await page.goto("/ingresar");
  const form = page.locator("form").first();
  await form.getByLabel("Mail").fill(email);
  await form.getByLabel("Clave").fill(clave);
  await page.getByRole("button", { name: "Ingresar", exact: true }).click();
}

export async function cerrarSesion(page: Page) {
  await page.goto("/mi-espacio/cuenta");
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await page.waitForURL("**/?sesion=cerrada");
  await expect(page.getByText("Cerraste la sesión.")).toBeVisible();
}
