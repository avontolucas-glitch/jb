import { test, expect, crearCuenta, unico } from "./ayuda";
import type { Page } from "@playwright/test";

/** Lleva el calendario al mes del día pedido y lo elige. */
async function elegirDia(page: Page, fecha: string) {
  const dia = page.getByTestId(`dia-${fecha}`);
  for (let i = 0; i < 4 && (await dia.count()) === 0; i++) {
    const atras = page.getByRole("button", { name: "Mes anterior" });
    if (await atras.isEnabled()) await atras.click();
    else await page.getByRole("button", { name: "Mes siguiente" }).click();
  }
  await dia.click();
}

test("el calendario muestra días libres y, al elegir uno, sus horarios", async ({ page }) => {
  await page.goto("/sesiones");
  const cal = page.getByTestId("calendario");
  await expect(cal).toBeVisible();
  await expect(cal.locator(".cal-dia.libre").first()).toBeVisible();
  await expect(page.getByTestId("turnos-del-dia").locator('[data-estado="libre"]').first()).toBeVisible();
});

test("sin cuenta, reservar pide ingresar", async ({ page }) => {
  await page.goto("/sesiones");
  await page.getByTestId("turnos-del-dia").locator('[data-estado="libre"]').first().click();
  await expect(page).toHaveURL(/\/ingresar\?aviso=checkout/);
});

test("reservar una sesión la deja en tu espacio y el horario queda ocupado para los demás", async ({ page, browser }) => {
  await crearCuenta(page, unico("sesion"));
  await page.goto("/sesiones");
  const libre = page.getByTestId("turnos-del-dia").locator('[data-estado="libre"]').first();
  const testid = (await libre.getAttribute("data-testid"))!;
  const id = testid.replace("horario-", "");
  await libre.click();
  await expect(page).toHaveURL(new RegExp(`/checkout/sesion-${id}`));
  await page.getByLabel(/Qué te gustaría trabajar/).fill("Quiero trabajar la constancia.");
  await page.getByRole("button", { name: "Pagar (simulado)" }).click();
  await page.waitForURL("**/mi-espacio/sesiones?compra=ok");
  const mia = page.getByTestId(`mi-sesion-${id}`);
  await expect(mia).toBeVisible();
  await expect(mia.getByTestId("link-sesion")).toHaveAttribute("href", new RegExp(id));
  await expect(mia).toContainText("Quiero trabajar la constancia.");

  // en el calendario, para mí figura como «tu sesión»
  await page.goto("/sesiones");
  await elegirDia(page, id.slice(0, 10));
  await expect(page.getByTestId(testid)).toHaveAttribute("data-estado", "tuya");

  // otra persona lo ve ocupado y no puede reservarlo ni entrando directo
  const otro = await browser.newContext();
  await otro.addInitScript(() => sessionStorage.setItem("jb-umbral", "1"));
  const p2 = await otro.newPage();
  await crearCuenta(p2, unico("otra"));
  await p2.goto("/sesiones");
  await elegirDia(p2, id.slice(0, 10));
  await expect(p2.getByTestId(testid)).toHaveAttribute("data-estado", "ocupado");
  await p2.goto(`/checkout/sesion-${id}`);
  await expect(p2.getByTestId("horario-tomado")).toBeVisible();
  await p2.goto("/mi-espacio/sesiones");
  await expect(p2.getByTestId("sin-acceso")).toBeVisible();
  await otro.close();
});
