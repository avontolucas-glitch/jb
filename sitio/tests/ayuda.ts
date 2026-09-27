import { test as base, expect, type BrowserContext, type Page } from "@playwright/test";

/** En las pruebas se entra directo, salteando el cuadro de bienvenida (se prueba aparte). */
function saltearAvisos() {
  try {
    sessionStorage.setItem("jb-umbral", "1");
    // el aviso de «Instalar la app» se prueba aparte (app.spec.ts): acá no tapa nada
    if (!localStorage.getItem("jb-aviso-app-cerrado")) localStorage.setItem("jb-aviso-app-cerrado", String(Date.now()));
  } catch {}
}

/** Otra persona, con su propia cuenta, en otro navegador. */
export type Persona = { ctx: BrowserContext; p: Page; email: string };

export const test = base.extend<{ otraPersona: (prefijo: string, nombre?: string) => Promise<Persona> }>({
  context: async ({ context }, use) => {
    await context.addInitScript(saltearAvisos);
    await use(context);
  },
  // Los navegadores de las otras personas se cierran solos al terminar la prueba, aunque falle.
  otraPersona: async ({ browser, locale, timezoneId }, use) => {
    const abiertos: BrowserContext[] = [];
    await use(async (prefijo, nombre = "Prueba") => {
      const ctx = await browser.newContext({ locale, timezoneId });
      abiertos.push(ctx);
      await ctx.addInitScript(saltearAvisos);
      const p = await ctx.newPage();
      const email = unico(prefijo);
      await crearCuenta(p, email, nombre);
      return { ctx, p, email };
    });
    await Promise.all(abiertos.map((c) => c.close().catch(() => {})));
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

/** Lleva el calendario (público o el de la agenda) al mes del día pedido y lo elige. */
export async function elegirDia(page: Page, fecha: string) {
  const dia = page.getByTestId(`dia-${fecha}`);
  for (let i = 0; i < 12 && (await dia.count()) === 0; i++) {
    const mesVisto = (await page.getByTestId("mes").first().getAttribute("data-mes")) ?? "";
    const atras = page.getByRole("button", { name: "Mes anterior" });
    const adelante = page.getByRole("button", { name: "Mes siguiente" });
    if (mesVisto && mesVisto > fecha.slice(0, 7) && (await atras.isEnabled())) await atras.click();
    else if (await adelante.isEnabled()) await adelante.click();
    else if (await atras.isEnabled()) await atras.click();
    else break;
  }
  await dia.click();
}
