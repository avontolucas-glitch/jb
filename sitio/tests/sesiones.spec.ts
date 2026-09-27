import { test, expect, crearCuenta, cupoPropio, unico, elegirDia } from "./ayuda";

const RUTA = "/masterclass/1-a-1";

test("la Masterclass 1 a 1 vive dentro de Masterclass y /sesiones lleva ahí", async ({ page }) => {
  await page.goto("/sesiones");
  await expect(page).toHaveURL(new RegExp(`${RUTA}$`));
  await expect(page.getByRole("heading", { level: 1, name: "Masterclass 1 a 1" })).toBeVisible();
  await expect(page.getByText("Un encuentro uno a uno con Julián, por videollamada.")).toBeVisible();
  const subnav = page.getByTestId("subnav-masterclass");
  await expect(subnav.getByRole("link")).toHaveText(["En vivo", "1 a 1", "Grabada"]);
  await expect(subnav.getByRole("link", { name: "1 a 1" })).toHaveAttribute("aria-current", "page");
  await expect(subnav.getByRole("link", { name: "En vivo" })).not.toHaveAttribute("aria-current", "page");
  // en el encabezado ya no hay un enlace suelto a «Sesiones»
  await expect(page.locator('header a[href="/sesiones"]')).toHaveCount(0);
});

test("el calendario muestra días libres y, al elegir uno, sus horarios", async ({ page }) => {
  await page.goto(RUTA);
  const cal = page.getByTestId("calendario");
  await expect(cal).toBeVisible();
  await expect(cal.locator(".cal-dia.libre").first()).toBeVisible();
  const lista = page.getByTestId("turnos-del-dia");
  await expect(lista.locator('[data-estado="libre"]').first()).toBeVisible();

  // otro día con horarios libres (si en este mes no hay, en el que sigue)
  const otros = cal.locator(".cal-dia.libre:not(.elegido)");
  if ((await otros.count()) === 0) await page.getByRole("button", { name: "Mes siguiente" }).click();
  const testid = (await otros.first().getAttribute("data-testid"))!;
  const fecha = testid.replace("dia-", "");
  await page.getByTestId(testid).click();
  await expect(page.getByTestId(testid)).toHaveAttribute("aria-pressed", "true");
  // abajo, los horarios de ese día
  await expect(lista.locator('[data-testid^="horario-"]').first()).toHaveAttribute("data-testid", new RegExp(`^horario-${fecha}T`));
});

test("sin cuenta, reservar pide ingresar", async ({ page }) => {
  await page.goto(RUTA);
  await page.getByTestId("turnos-del-dia").locator('[data-estado="libre"]').first().click();
  await expect(page).toHaveURL(/\/ingresar\?aviso=checkout/);
});

test("reservar una sesión la deja en tu espacio y el horario queda ocupado para los demás", async ({ page, browser }) => {
  await crearCuenta(page, unico("sesion"));
  await page.goto(RUTA);
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
  await expect(mia.getByTestId("agregar-calendario")).toHaveAttribute("href", `/api/sesion-ics?id=${id}`);

  // en el calendario, para mí figura como «tu encuentro»
  await page.goto(RUTA);
  await elegirDia(page, id.slice(0, 10));
  await expect(page.getByTestId(testid)).toHaveAttribute("data-estado", "tuya");

  // otra persona lo ve ocupado y no puede reservarlo ni entrando directo
  const otro = await browser.newContext(cupoPropio(test.info(), "otro"));
  await otro.addInitScript(() => sessionStorage.setItem("jb-umbral", "1"));
  const p2 = await otro.newPage();
  await crearCuenta(p2, unico("otra"));
  await p2.goto(RUTA);
  await elegirDia(p2, id.slice(0, 10));
  await expect(p2.getByTestId(testid)).toHaveAttribute("data-estado", "ocupado");
  await p2.goto(`/checkout/sesion-${id}`);
  await expect(p2.getByTestId("horario-tomado")).toBeVisible();
  await p2.goto("/mi-espacio/sesiones");
  await expect(p2.getByTestId("sin-acceso")).toBeVisible();
  await otro.close();
});
