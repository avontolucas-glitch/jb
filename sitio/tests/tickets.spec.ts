import { test, expect, crearCuenta, unico } from "./ayuda";
import type { Page } from "@playwright/test";

async function decirle(page: Page, texto: string) {
  const yo = page.getByTestId("yosoy");
  const campo = yo.getByLabel("Escribile a Yo Da");
  await campo.fill(texto);
  await campo.press("Enter");
  await expect(yo.locator(".yosoy-pensando")).toHaveCount(0);
}

test("la consulta a una persona no está a la vista: Yo Da primero intenta resolverlo", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("yosoy-boton").click();
  const yo = page.getByTestId("yosoy");
  await expect(yo.getByRole("button", { name: "Hablar con una persona" })).toHaveCount(0);
  await decirle(page, "quiero hablar con una persona");
  await expect(yo.locator(".yosoy-msj.yo").last()).toContainText("Antes, contame qué pasa");
  await expect(yo.getByTestId("ticket-form")).toHaveCount(0);
});

test("sin cuenta, después de varias vueltas, pide ingresar para dejar la consulta", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("yosoy-boton").click();
  const yo = page.getByTestId("yosoy");
  await decirle(page, "hablar con una persona");
  await decirle(page, "zzqq no anda nada");
  await decirle(page, "sigue sin funcionar el problema");
  await expect(yo.getByText("ingresar con tu cuenta debés").last()).toBeVisible();
  await expect(yo.getByTestId("ticket-form")).toHaveCount(0);
});

test("con cuenta, tras varios intentos deja la consulta, le llega al moderador y se resuelve", async ({ page, browser }) => {
  await crearCuenta(page, unico("consulta"), "Marta");
  await page.getByTestId("yosoy-boton").click();
  const yo = page.getByTestId("yosoy");
  await decirle(page, "tengo un problema, no funciona el video");
  await decirle(page, "sigue sin funcionar, error");
  await expect(yo.getByTestId("ticket-form")).toHaveCount(0);
  await decirle(page, "qwerty asdf");
  const form = yo.getByTestId("ticket-form").last();
  await expect(form).toBeVisible();
  await form.getByText("Problema con una compra").click();
  await form.getByLabel("Contá qué pasó").fill("Compré la masterclass grabada y el video no carga en el celular.");
  await page.waitForTimeout(1600);
  await form.getByRole("button", { name: "Dejar mi consulta" }).click();
  const ok = yo.getByTestId("ticket-ok");
  await expect(ok).toContainText(/Tu consulta es la T-[A-Z0-9]{6}/);
  const id = ((await ok.textContent()) ?? "").match(/T-[A-Z0-9]{6}/)![0];

  // una sola abierta por persona
  await decirle(page, "zzz otra vez nada");
  const otro = yo.getByTestId("ticket-form").last();
  if (await otro.count()) {
    await otro.getByLabel("Contá qué pasó").fill("Otra consulta más, para probar el tope por persona.");
    await page.waitForTimeout(1600);
    await otro.getByRole("button", { name: "Dejar mi consulta" }).click();
    await expect(yo.getByTestId("ticket-error").last()).toContainText("Ya tenés una consulta abierta");
  }

  // la ve en Mi espacio → Consultas
  await page.goto("/mi-espacio/consultas");
  await expect(page.getByTestId(`mi-ticket-${id}`)).toContainText("Abierta");

  // el moderador (la cuenta de Julián en las pruebas) la ve con la conversación y la resuelve
  const mod = await browser.newContext({ extraHTTPHeaders: { "x-jb-prueba": `moderador-${Date.now()}` } });
  const p2 = await mod.newPage();
  await p2.addInitScript(() => sessionStorage.setItem("jb-umbral", "1"));
  await p2.goto("/ingresar");
  await p2.locator("form").first().getByLabel("Mail").fill("julian@demo.com");
  await p2.locator("form").first().getByLabel("Clave").fill("demo1234");
  await p2.getByRole("button", { name: "Ingresar", exact: true }).click();
  await p2.waitForURL("**/mi-espacio");
  await expect(p2.getByTestId("acceso-consultas")).toBeVisible();
  await p2.goto("/mi-espacio/consultas");
  const t = p2.getByTestId(`ticket-${id}`);
  await expect(t).toContainText("Marta");
  await expect(t).toContainText("el video no carga");
  await expect(t.locator("details")).toContainText("Lo que habló con Yo Da");
  await t.getByTestId("ticket-estado").selectOption("resuelto");
  await t.getByTestId("ticket-guardar").click();
  await p2.goto("/mi-espacio/consultas?estado=resuelto");
  await expect(p2.getByTestId(`ticket-${id}`)).toContainText("Resuelta");
  await mod.close();

  await page.reload();
  await expect(page.getByTestId(`mi-ticket-${id}`)).toContainText("Resuelta");
});
