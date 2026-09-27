import { test as base, expect, type BrowserContext, type Page, type TestInfo } from "@playwright/test";

/** En las pruebas se entra directo, salteando el cuadro de bienvenida (se prueba aparte). */
function saltearAvisos() {
  try {
    sessionStorage.setItem("jb-umbral", "1");
    // el aviso de «Instalar la app» se prueba aparte (app.spec.ts): acá no tapa nada
    if (!localStorage.getItem("jb-aviso-app-cerrado")) localStorage.setItem("jb-aviso-app-cerrado", String(Date.now()));
  } catch {}
}

/**
 * Un valor distinto por prueba para el encabezado «x-jb-prueba». El servidor (solo con
 * JB_PRUEBAS=1, que pone playwright.config.ts) lo suma a la clave de los límites: así
 * cada prueba tiene su propio cupo aunque todas salgan de la misma IP. `extra` separa
 * los navegadores de otras personas dentro de una misma prueba.
 */
export function idPrueba(info: TestInfo, extra = ""): string {
  const titulo = info.titlePath.slice(1).join("-").normalize("NFD").replace(/[^\w]+/g, "_").slice(0, 60);
  const azar = Math.floor(Math.random() * 1e9).toString(36);
  return `${titulo}.${info.project.name}.${info.retry}.${azar}${extra ? `.${extra}` : ""}`.slice(0, 120);
}

/** Opciones para un navegador nuevo creado a mano dentro de una prueba (con su propio cupo). */
export const cupoPropio = (info: TestInfo, extra: string) => ({ extraHTTPHeaders: { "x-jb-prueba": idPrueba(info, extra) } });

/** Otra persona, con su propia cuenta, en otro navegador. */
export type Persona = { ctx: BrowserContext; p: Page; email: string };

export const test = base.extend<{ otraPersona: (prefijo: string, nombre?: string) => Promise<Persona> }>({
  // cada prueba con su propio cupo en los límites del servidor
  extraHTTPHeaders: async ({ extraHTTPHeaders }, use, info) => {
    await use({ ...(extraHTTPHeaders ?? {}), "x-jb-prueba": idPrueba(info) });
  },
  context: async ({ context }, use) => {
    await context.addInitScript(saltearAvisos);
    await use(context);
  },
  // Los navegadores de las otras personas se cierran solos al terminar la prueba, aunque falle.
  otraPersona: async ({ browser, locale, timezoneId }, use, info) => {
    const abiertos: BrowserContext[] = [];
    await use(async (prefijo, nombre = "Prueba") => {
      const ctx = await browser.newContext({ locale, timezoneId, ...cupoPropio(info, `persona${abiertos.length + 1}`) });
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
  // con Enter desde el campo: el saludo de Yo Da (la nube) puede tapar el botón en el celular
  await page.getByLabel("Clave").press("Enter");
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
  await page.getByRole("button", { name: "Cerrar sesión", exact: true }).click();
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
