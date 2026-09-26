import { test, expect, crearCuenta, unico } from "./ayuda";

test("reservar un directo a voluntad: respeta el mínimo y habilita solo ese directo", async ({ page }) => {
  const email = unico("vivo");
  await crearCuenta(page, email);

  await page.goto("/masterclass");
  await page.getByTestId("directo-semana-1").getByRole("link", { name: "Reservar mi lugar" }).click();
  await expect(page).toHaveURL(/\/checkout\/directo-semana-1/);

  // menos del mínimo: no deja
  await page.getByText("Otro monto").click();
  await page.getByLabel("Tu monto en USD").fill("0.5");
  await page.getByRole("button", { name: "Pagar (simulado)" }).click();
  await expect(page.getByTestId("mensaje-error")).toContainText("El mínimo es USD 1");

  // un monto propio
  await page.getByLabel("Tu monto en USD").fill("7");
  await page.getByRole("button", { name: "Pagar (simulado)" }).click();
  await page.waitForURL("**/mi-espacio/en-vivo?compra=ok");
  await expect(page.getByTestId("mi-directo-semana-1")).toBeVisible();
  await expect(page.getByTestId("mi-directo-semana-2")).toHaveCount(0);

  await page.goto("/mi-espacio/cuenta");
  await expect(page.getByTestId("compras")).toContainText("USD 7");

  // la sala: marca de agua con el mail, sin link de video a la vista
  await page.goto("/mi-espacio/en-vivo/semana-1");
  await expect(page.getByTestId("sala")).toBeVisible();
  await expect(page.getByTestId("marca-agua")).toHaveText(email);
  expect(await page.content()).not.toMatch(/\.(m3u8|mp4)\b/);

  // otro directo y lo grabado siguen cerrados
  await page.goto("/mi-espacio/en-vivo/semana-2");
  await expect(page.getByTestId("sin-acceso")).toBeVisible();
  await page.goto("/mi-espacio/masterclass");
  await expect(page.getByTestId("sin-acceso")).toBeVisible();
});

test("la sala se ve en una sola pantalla a la vez", async ({ page, context }) => {
  await crearCuenta(page, unico("pantalla"));
  await page.goto("/checkout/directo-semana-2");
  await page.getByRole("button", { name: "Pagar (simulado)" }).click();
  await page.waitForURL("**/mi-espacio/en-vivo?compra=ok");

  await page.goto("/mi-espacio/en-vivo/semana-2");
  await expect(page.getByTestId("sala")).not.toHaveAttribute("data-turno", "");

  const otra = await context.newPage();
  await otra.goto("/mi-espacio/en-vivo/semana-2");
  await expect(otra.getByTestId("sala")).not.toHaveAttribute("data-turno", "");

  await expect(page.getByTestId("sala-pausada")).toBeVisible({ timeout: 15_000 });
  await expect(otra.getByTestId("sala-pausada")).toHaveCount(0);

  // volver a verla en la primera pausa la segunda
  await page.getByRole("button", { name: "Ver acá" }).click();
  await expect(page.getByTestId("sala-pausada")).toHaveCount(0);
  await expect(otra.getByTestId("sala-pausada")).toBeVisible({ timeout: 15_000 });
});

test("sin reservar, la sala no se abre ni por la API", async ({ page }) => {
  await crearCuenta(page, unico("sin"));
  await page.goto("/mi-espacio/en-vivo/semana-1");
  await expect(page.getByTestId("sin-acceso")).toBeVisible();
  const r = await page.request.post("/api/sala", { data: { directo: "semana-1" } });
  expect(r.status()).toBe(403);
});
