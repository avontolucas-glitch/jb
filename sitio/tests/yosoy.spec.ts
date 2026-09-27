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
  await expect(yo.locator(".yosoy-msj.yo").last()).toContainText("una persona te responderá");

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
  await expect(panel).toContainText("El volumen, desde tu dispositivo");
  await expect(panel.getByRole("button", { name: "Escuchar" })).toBeVisible();
});
