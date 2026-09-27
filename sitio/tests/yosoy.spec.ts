import { test, expect } from "./ayuda";

test("Yo Da: el ojo abre la guía y muestra los próximos horarios libres en tu hora", async ({ page }) => {
  await page.goto("/");
  // se hace presente unos segundos después de entrar, con su saludo
  await expect(page.getByTestId("yosoy-nube")).toContainText("crearte una cuenta debés");
  await expect(page.getByTestId("yosoy-nube").getByRole("link", { name: "Crear cuenta" })).toHaveAttribute("href", "/crear-cuenta");
  await page.getByTestId("yosoy-boton").click();
  const yo = page.getByTestId("yosoy");
  await expect(yo).toBeVisible();
  await expect(yo).toContainText("Yo Da soy, el ojo que guía este lugar");
  await expect(yo.locator(".yosoy-msj.yo").first().getByRole("link", { name: "Crear cuenta" })).toBeVisible();
  // sin cuenta, el 1 a 1 está bloqueado: Yo Da pide crearla
  await yo.getByRole("button", { name: "Agendar un 1 a 1" }).click();
  const pedido = yo.locator(".yosoy-msj.yo").last();
  await expect(pedido).toContainText("Para agendar un 1 a 1, crear una cuenta debés");
  await expect(pedido.getByRole("link", { name: "Crear cuenta" })).toHaveAttribute("href", "/crear-cuenta");
  // con la cuenta, se desbloquea
  await page.keyboard.press("Escape");
  await page.goto("/ingresar");
  await page.getByRole("button", { name: "Entrar como comprador@demo.com" }).click();
  await page.waitForURL("**/mi-espacio");
  await page.getByTestId("yosoy-boton").click();
  await yo.getByRole("button", { name: "Agendar un 1 a 1" }).click();
  const horarios = yo.getByTestId("yosoy-horarios");
  await expect(horarios).toBeVisible();
  await expect(horarios.locator("a").first()).toHaveAttribute("href", /\/checkout\/sesion-/);
  await expect(horarios.locator("time").first()).toContainText("hora de Argentina");
  await expect(yo.getByRole("link", { name: "Ver todo el calendario" })).toHaveAttribute("href", "/masterclass/1-a-1");
});

test("Yo Da: con sesión, saluda por el nombre y ayuda con los problemas de la cuenta", async ({ page }) => {
  await page.goto("/ingresar");
  await page.getByRole("button", { name: "Entrar como comprador@demo.com" }).click();
  await page.waitForURL("**/mi-espacio");
  await page.getByTestId("yosoy-boton").click();
  const yo = page.getByTestId("yosoy");
  await expect(yo.locator(".yosoy-msj.yo").first()).toContainText("De vuelta estás");
  const campo = yo.getByLabel("Escribile a Yo Da");
  await campo.fill("no me llegó el link de la videollamada");
  await campo.press("Enter");
  await expect(yo.getByRole("link", { name: "Mis encuentros" })).toHaveAttribute("href", "/mi-espacio/sesiones");
});

test("Yo Da: entiende lo que se escribe y, si no, ofrece opciones y una persona", async ({ page }) => {
  await page.goto("/libros");
  await page.getByTestId("yosoy-boton").click();
  const yo = page.getByTestId("yosoy");
  const campo = yo.getByLabel("Escribile a Yo Da");

  await campo.fill("¿cómo hago para pedir un reembolso?");
  await campo.press("Enter");
  await expect(yo.getByRole("link", { name: "Botón de arrepentimiento" })).toHaveAttribute("href", "/arrepentimiento");

  await campo.fill("quiero instalar la aplicación en el celu");
  await campo.press("Enter");
  await expect(yo.getByRole("button", { name: "Instalar la app" })).toBeVisible();

  await campo.fill("cuánto sale el directo semanal");
  await campo.press("Enter");
  await expect(yo.locator(".yosoy-msj.yo").last()).toContainText("desde USD 1");

  await campo.fill("xyzzy");
  await campo.press("Enter");
  // no entendió (con su forma de decirlo): ofrece las puertas
  await expect(yo.locator(".yosoy-msj.yo:not(.yosoy-pensando)").last().locator(".yosoy-chips")).toBeVisible();

  // un problema con una compra, sin sesión: primero la cuenta
  await campo.fill("pagué y no veo mi compra");
  await campo.press("Enter");
  await expect(yo.locator(".yosoy-msj.yo").last()).toContainText("saber quién sos necesito");
  await expect(yo.getByRole("link", { name: "Crear cuenta" }).last()).toHaveAttribute("href", "/crear-cuenta");

  // se cierra con Escape y el sitio sigue usable
  await page.keyboard.press("Escape");
  await expect(yo).toBeHidden();
});

test("la música no suena sola: el botón abre el panel y explica el volumen", async ({ page }) => {
  await page.goto("/");
  const panel = page.getByTestId("musica-panel");
  await expect(panel).toBeHidden();
  await page.getByTestId("musica-boton").click();
  await expect(panel).toBeVisible();
  await expect(panel).toContainText("playlist de Julián");
  await expect(panel).toContainText("El volumen, desde tu");
  await expect(panel.getByRole("button", { name: "Escuchar" })).toBeVisible();
});

test("Yo Da saca el sonido del sitio (y lo vuelve a poner)", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("yosoy-boton").click();
  const yo = page.getByTestId("yosoy");
  const campo = yo.getByLabel("Escribile a Yo Da");
  await campo.fill("sacame el sonido por favor");
  await campo.press("Enter");
  const boton = yo.getByTestId("yosoy-sonido");
  await expect(boton).toHaveText(/Silenciar el sitio/);
  await boton.click();
  await expect(boton).toHaveText(/Activar el sonido/);
  expect(await page.evaluate(() => localStorage.getItem("jb-sonido"))).toBe("no");
  // el altavoz de la cabecera de Yo Da muestra lo mismo y lo vuelve a prender
  const altavoz = yo.getByTestId("yosoy-altavoz");
  await expect(altavoz).toHaveAttribute("aria-pressed", "true");
  await altavoz.click();
  expect(await page.evaluate(() => localStorage.getItem("jb-sonido"))).toBe("si");
  await expect(boton).toHaveText(/Silenciar el sitio/);
});

test("Yo Da tiene gracia: juega, cuenta chistes, se acuerda del nombre y entiende errores de tipeo", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("yosoy-boton").click();
  const yo = page.getByTestId("yosoy");
  const campo = yo.getByLabel("Escribile a Yo Da");
  const ultimo = () => yo.locator(".yosoy-msj.yo").last();

  await campo.fill("¿vos sos Yoda?");
  await campo.press("Enter");
  await expect(ultimo()).toContainText(/Yo Da|Espadas|Con otro me confundís/);

  await campo.fill("contame un chiste");
  await campo.press("Enter");
  await expect(ultimo().getByRole("button", { name: "Otro chiste" })).toBeVisible();

  await campo.fill("jugamos piedra papel o tijera?");
  await campo.press("Enter");
  // a 5 puntos: el que llega primero gana
  await ultimo().getByRole("button", { name: "A 5" }).click();
  const ppt = ultimo().getByTestId("yosoy-ppt");
  for (let i = 0; i < 60 && (await ppt.getByTestId("yosoy-ppt-final").count()) === 0; i++) await ppt.getByRole("button", { name: "Piedra" }).click();
  await expect(ppt.getByTestId("yosoy-ppt-final")).toContainText(/Llegaste a 5|A 5 llegué primero/);
  await expect(ppt.getByTestId("yosoy-ppt-resultado")).toContainText(/(vos 5 · Yo Da [0-4]|vos [0-4] · Yo Da 5) · a 5/);
  await expect(ppt.getByRole("button", { name: "Piedra" })).toHaveCount(0);

  await campo.fill("tirá una moneda");
  await campo.press("Enter");
  await ultimo().getByRole("button", { name: "Tirar la moneda" }).click();
  await expect(ultimo().getByTestId("yosoy-moneda-resultado")).toContainText(/Cara|Ceca/);

  // errores de tipeo («agnda» es la agenda: sin cuenta, pide crearla)
  await campo.fill("quiero una agnda");
  await campo.press("Enter");
  await expect(ultimo()).toContainText("Para agendar un 1 a 1, crear una cuenta debés");

  // cosquillas
  await yo.getByTestId("yosoy-cabeza").click();
  await expect(ultimo()).toContainText(/Cosquillas|no se toca|Parpadear|alas/);

  // se acuerda del nombre
  await campo.fill("me llamo Lucía");
  await campo.press("Enter");
  await expect(ultimo()).toContainText("Lucía. Lindo nombre");
  await page.reload();
  await page.getByTestId("yosoy-boton").click();
  await expect(page.getByTestId("yosoy").locator(".yosoy-msj.yo").first()).toContainText("De vuelta estás, Lucía");
});

test("Yo Da deja el chiste si alguien está mal y le da la línea de ayuda", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("yosoy-boton").click();
  const yo = page.getByTestId("yosoy");
  const campo = yo.getByLabel("Escribile a Yo Da");
  await campo.fill("no quiero vivir más");
  await campo.press("Enter");
  await expect(yo.locator(".yosoy-msj.yo").last()).toContainText("135");
});
