import { test, expect, crearCuenta, ingresar, cerrarSesion, unico } from "./ayuda";

test("sin sesión, /mi-espacio lleva a /ingresar con aviso", async ({ page }) => {
  for (const ruta of ["/mi-espacio", "/mi-espacio/masterclass", "/mi-espacio/cuenta"]) {
    await page.goto(ruta);
    await expect(page).toHaveURL(/\/ingresar\?aviso=privado/);
    await expect(page.getByTestId("aviso")).toContainText("Para entrar a tu espacio");
  }
});

test("sin sesión, el checkout pide cuenta", async ({ page }) => {
  await page.goto("/masterclass/grabada");
  await page.getByRole("link", { name: "Comprar la masterclass grabada" }).first().click();
  await expect(page).toHaveURL(/\/ingresar\?aviso=checkout/);
  await expect(page.getByTestId("aviso")).toContainText("Para comprar necesitás una cuenta");
});

test("crear cuenta, cerrar sesión e ingresar", async ({ page }) => {
  const email = unico("nueva");
  await crearCuenta(page, email, "Lucía");
  await expect(page.getByRole("heading", { name: "Hola, Lucía." })).toBeVisible();
  await cerrarSesion(page);
  await page.goto("/mi-espacio");
  await expect(page).toHaveURL(/\/ingresar/);

  await ingresar(page, email, "clave-equivocada");
  await expect(page.getByTestId("mensaje-error")).toContainText("no coinciden");

  await ingresar(page, email, "clave-segura-1");
  await page.waitForURL("**/mi-espacio");
  await expect(page.getByRole("heading", { name: "Hola, Lucía." })).toBeVisible();
});

test("no deja crear dos cuentas con el mismo mail", async ({ page }) => {
  await page.goto("/crear-cuenta");
  await page.getByLabel("Nombre").fill("Otra");
  await page.getByLabel("Mail").fill("sincompras@demo.com");
  await page.getByLabel("Clave").fill("clave-segura-1");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page.getByTestId("mensaje-error")).toContainText("Ya hay una cuenta");
});

test("la cuenta demo sin compras ve el espacio vacío con camino para comprar", async ({ page }) => {
  await page.goto("/ingresar");
  await page.getByRole("button", { name: "Entrar como sincompras@demo.com" }).click();
  await page.waitForURL("**/mi-espacio");
  const vacio = page.getByTestId("espacio-vacio");
  await expect(vacio).toBeVisible();
  await expect(vacio.getByRole("link", { name: "La masterclass, con Julián en vivo" })).toHaveAttribute("href", "/masterclass");
  await expect(vacio.getByRole("link", { name: "La masterclass grabada" })).toHaveAttribute("href", "/masterclass/grabada");
  for (const ruta of ["/mi-espacio/masterclass", "/mi-espacio/audios", "/mi-espacio/encuentro", "/mi-espacio/conferencias"]) {
    await page.goto(ruta);
    await expect(page.getByTestId("sin-acceso")).toBeVisible();
  }
});

test("comprar la masterclass habilita masterclass, audios y encuentro (y no conferencias)", async ({ page }) => {
  await crearCuenta(page, unico("mc"));
  await page.goto("/mi-espacio/audios");
  await expect(page.getByTestId("sin-acceso")).toBeVisible();

  await page.goto("/masterclass/grabada");
  await page.getByRole("link", { name: "Comprar la masterclass grabada" }).first().click();
  await expect(page).toHaveURL(/\/checkout\/masterclass/);
  await page.getByRole("button", { name: "Pagar (simulado)" }).click();
  await page.waitForURL("**/mi-espacio/masterclass?compra=ok");
  await expect(page.getByTestId("compra-ok")).toBeVisible();

  // progreso que marca el usuario y módulo siguiente
  await expect(page.getByTestId("progreso")).toHaveText("0 de 8 módulos vistos");
  await page.getByRole("link", { name: /Empezar con/ }).click();
  await page.getByTestId("marcar").click();
  await expect(page.getByTestId("marcar")).toHaveText("Desmarcar como visto");
  await page.getByTestId("siguiente").click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Módulo II");
  await page.goto("/mi-espacio/masterclass");
  await expect(page.getByTestId("progreso")).toHaveText("1 de 8 módulos vistos");

  await page.goto("/mi-espacio/audios");
  await expect(page.locator("audio")).toHaveCount(8);

  await page.goto("/mi-espacio/encuentro");
  await page.getByLabel("Tu pregunta").fill("¿Cómo sostengo el estado durante el día?");
  await page.getByRole("button", { name: "Enviar pregunta" }).click();
  await expect(page.getByTestId("mensaje-ok")).toBeVisible();
  await page.reload();
  await expect(page.getByTestId("mis-preguntas")).toContainText("¿Cómo sostengo el estado");

  await page.goto("/mi-espacio/conferencias");
  await expect(page.getByTestId("sin-acceso")).toBeVisible();
  await expect(page.getByTestId("link-acceso")).toHaveCount(0);
});

test("comprar una entrada privada habilita solo esa conferencia", async ({ page }) => {
  await crearCuenta(page, unico("conf"));
  await page.goto("/conferencias/privada-1");
  await page.getByRole("link", { name: "Comprar la entrada" }).click();
  await page.getByRole("button", { name: "Pagar (simulado)" }).click();
  await page.waitForURL("**/mi-espacio/conferencias?compra=ok");

  await expect(page.getByTestId("mi-conferencia-privada-1")).toBeVisible();
  await expect(page.getByTestId("mi-conferencia-privada-2")).toHaveCount(0);
  await expect(page.getByTestId("link-acceso")).toHaveCount(1);
  await expect(page.getByTestId("link-acceso")).toHaveAttribute("href", /privada-1/);

  for (const ruta of ["/mi-espacio/masterclass", "/mi-espacio/audios", "/mi-espacio/encuentro"]) {
    await page.goto(ruta);
    await expect(page.getByTestId("sin-acceso")).toBeVisible();
  }
  await page.goto("/conferencias/privada-2");
  await expect(page.getByRole("link", { name: "Comprar la entrada" })).toBeVisible();
});

test("el link de una conferencia privada no aparece en ninguna página pública", async ({ page }) => {
  for (const ruta of ["/conferencias", "/conferencias/privada-1", "/conferencias/privada-2", "/"]) {
    await page.goto(ruta);
    expect(await page.content()).not.toContain("ejemplo.invalid/sala");
  }
});

test("el área de miembros no se desborda a lo ancho en el celular", async ({ page }) => {
  await page.goto("/ingresar");
  await page.getByRole("button", { name: "Entrar como sincompras@demo.com" }).click();
  await page.waitForURL("**/mi-espacio");
  for (const ruta of ["/mi-espacio", "/mi-espacio/biblioteca", "/mi-espacio/cuenta", "/mi-espacio/en-vivo"]) {
    await page.goto(ruta);
    const ancho = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(ancho, `${ruta} desborda`).toBeLessThanOrEqual(1);
  }
});
