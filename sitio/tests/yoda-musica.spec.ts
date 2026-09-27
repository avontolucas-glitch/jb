import { test, expect } from "./ayuda";
import type { Page } from "@playwright/test";
import { comentariosPorTema } from "../content/yoda-musica";

/** Simula que empieza a sonar un tema (lo que avisa components/Musica.tsx). */
async function empiezaTema(page: Page, t: { id: string; titulo: string; artista: string; fragmento?: boolean }) {
  await page.evaluate((t) => {
    const tema = { ...t, sonando: true, fragmento: !!t.fragmento };
    (window as unknown as { __jbTema: unknown }).__jbTema = tema;
    window.dispatchEvent(new CustomEvent("jb:musica-tema", { detail: tema }));
  }, t);
}

async function cerrarSaludo(page: Page) {
  const nube = page.getByTestId("yosoy-nube");
  await expect(nube).toBeVisible();
  await nube.getByRole("button", { name: "Cerrar el saludo de Yo Da" }).click();
  await expect(nube).toHaveCount(0);
}

/** Le escribe a Yo Da y espera su respuesta; devuelve el panel (las respuestas se buscan por su texto). */
async function escribir(page: Page, texto: string) {
  const yo = page.getByTestId("yosoy");
  if (!(await yo.isVisible())) await page.getByTestId("yosoy-boton").click();
  const antes = await yo.locator(".yosoy-msj.yo:not(.yosoy-pensando)").count();
  const campo = yo.getByLabel("Escribile a Yo Da");
  await campo.fill(texto);
  await campo.press("Enter");
  await expect.poll(() => yo.locator(".yosoy-msj.yo:not(.yosoy-pensando)").count()).toBeGreaterThan(antes);
  return yo;
}

test("Yo Da comenta el tema que empieza, y tocándolo dice qué suena", async ({ page }) => {
  await page.goto("/");
  await cerrarSaludo(page);
  await empiezaTema(page, { id: "5YSI1311X8t31PBjkBG4CZ", titulo: "Somebody's Watching Me", artista: "Rockwell" });
  const nube = page.getByTestId("yosoy-nube");
  // uno de sus dos comentarios propios (se alternan)
  await expect(nube).toContainText(new RegExp(comentariosPorTema["Somebody's Watching Me"].map((c) => c.slice(0, 24).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")));
  // un comentario de música no invita a crear la cuenta
  await expect(nube.getByRole("link", { name: "Crear cuenta" })).toHaveCount(0);
  await nube.locator(".yosoy-nube-texto").click();
  const yo = page.getByTestId("yosoy");
  const ultimo = yo.locator(".yosoy-msj.yo").last();
  await expect(ultimo).toContainText("Somebody's Watching Me");
  await expect(ultimo.getByTestId("yosoy-otro-tema")).toBeVisible();
  await expect(ultimo.getByRole("link", { name: "Abrir en Spotify" })).toHaveAttribute("href", "https://open.spotify.com/track/5YSI1311X8t31PBjkBG4CZ");
  await expect(ultimo.getByRole("link", { name: "Abrir en Spotify" })).toHaveAttribute("target", "_blank");
});

test("Si suenan fragmentos de 30 segundos, Yo Da avisa y dice dónde está la solución", async ({ page }) => {
  await page.goto("/");
  await cerrarSaludo(page);
  await empiezaTema(page, { id: "1EaoyUXLaWFFA1bbE1KMI4", titulo: "Buk-In-Hamm Palace", artista: "Peter Tosh", fragmento: true });
  await expect(page.getByTestId("yosoy-nube")).toContainText("treinta segundos");
});

test("«¿Qué suena?» sin música: ofrece ponerla; «otro tema» pasa de tema", async ({ page }) => {
  await page.goto("/");
  const yo = await escribir(page, "que tema es este?");
  const m = yo.locator(".yosoy-msj.yo").last();
  await expect(m).toContainText("Nada suena todavía");
  await m.getByTestId("yosoy-poner-musica").click();
  await expect(page.getByTestId("musica-panel")).toBeVisible();

  await page.evaluate(() => {
    (window as unknown as { __pasados: number }).__pasados = 0;
    window.addEventListener("jb:musica-siguiente", () => (window as unknown as { __pasados: number }).__pasados++);
  });
  await escribir(page, "pasá el tema, no me gusta este tema");
  await expect(yo.locator(".yosoy-msj.yo").last()).toContainText("Otro tema, al azar");
  expect(await page.evaluate(() => (window as unknown as { __pasados: number }).__pasados)).toBe(1);
});

test("Ante el enojo, calma y las puertas a mano", async ({ page }) => {
  await page.goto("/");
  const yo = await escribir(page, "sos un inutil");
  const m = yo.locator(".yosoy-msj.yo").last();
  await expect(m).not.toContainText("Claro no lo veo");
  await expect(m.locator(".yosoy-chips")).toBeVisible();
});

test("Problemas concretos: la solución primero, aunque escriban con abreviaturas", async ({ page }) => {
  await page.goto("/");
  const yo = await escribir(page, "me olvidé la contraseña!!");
  await expect(yo).toContainText("a todos se nos pierde");
  // un pago: como ya son dos cosas serias, la solución y, además, una persona (que pide ingresar para saber a quién responder)
  await escribir(page, "me cobraron dos veces");
  await expect(yo).toContainText("Con la plata, cuidado máximo");
  await expect(yo).toContainText("Para dejarle tu consulta a una persona");
  // abreviaturas y letras estiradas (y el 1 a 1, sin cuenta, pide crearla)
  await escribir(page, "q onda, kiero agendar un turno xfaaa");
  await expect(yo.locator(".yosoy-msj.yo").last()).toContainText("Para agendar un 1 a 1, crear una cuenta debés");
});

test("Con sesión, un pago con problemas va directo a Mi espacio", async ({ page }) => {
  await page.goto("/ingresar");
  await page.getByRole("button", { name: "Entrar como comprador@demo.com" }).click();
  await page.waitForURL("**/mi-espacio");
  const yo = await escribir(page, "pagué y no me aparece la compra");
  await expect(yo).toContainText("Con la plata, cuidado máximo");
  await expect(yo.getByRole("link", { name: "Mi espacio" }).last()).toBeVisible();
  await escribir(page, "no me carga el video de la masterclass");
  await expect(yo).toContainText("la página recargá");
});
