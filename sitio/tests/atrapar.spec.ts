import { test, expect } from "./ayuda";
import type { Page } from "@playwright/test";

/** Le escribe a Yo Da y espera su respuesta. */
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

/** Dónde está el que vuela (su centro). */
const dondeVuela = (page: Page) =>
  page.evaluate(() => {
    const b = document.querySelector("[data-testid=atrapar-yo]")?.getBoundingClientRect();
    return b ? { x: b.x + b.width / 2, y: b.y + b.height / 2 } : null;
  });

/** Un toque sobre Yo Da mientras vuela (se mueve demasiado rápido para un clic «estable»). */
const tocarlo = (page: Page) =>
  page.evaluate(() => document.querySelector("[data-testid=atrapar-yo]")!.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true })));

async function empezar(page: Page) {
  await page.goto("/masterclass");
  const yo = await escribir(page, "quiero atraparte");
  await expect(yo.locator(".yosoy-msj.yo").last()).toContainText("snitch dorada");
  await yo.getByTestId("yosoy-atrapar").last().click();
  await expect(page.getByTestId("atrapar-yo")).toBeVisible();
}

test("Atrapame: Yo Da sale volando rapidísimo, solo (el del rincón se oculta); si lo tocás, ganás", async ({ page }) => {
  await empezar(page);
  // uno solo: el del rincón se oculta mientras vuela el otro
  await expect(page.locator(".yosoy-boton .ojo-pixel")).toHaveCSS("visibility", "hidden");
  await page.waitForTimeout(900);
  const a = await dondeVuela(page);
  await page.waitForTimeout(350);
  const b = await dondeVuela(page);
  expect(a && b && Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(20);
  // tocar fuera de Yo Da no navega a ningún lado
  const url = page.url();
  await page.mouse.click(20, 300);
  expect(page.url()).toBe(url);
  await expect(page.getByTestId("atrapar")).toHaveAttribute("data-nivel", "1");
  await tocarlo(page);
  await expect(page.getByTestId("atrapar")).toContainText("¡Atrapado!");
  await expect(page.getByTestId("atrapar")).toHaveCount(0, { timeout: 5000 });
  const nube = page.getByTestId("yosoy-nube");
  await expect(nube).toContainText("Ganaste");
  await expect(nube).toContainText("segundos");
  await expect(page.locator(".yosoy-boton .ojo-pixel")).toHaveCSS("visibility", "visible");
  // al terminar: «Otra partida» o «Dejar de jugar»
  await expect(nube.getByTestId("yosoy-nube-dejar")).toHaveText("Dejar de jugar");
  // otra partida: un nivel más (más rápido)
  await expect(nube.getByTestId("yosoy-nube-atrapar")).toHaveText("Otra partida");
  await nube.getByTestId("yosoy-nube-atrapar").click();
  await expect(page.getByTestId("atrapar")).toHaveAttribute("data-nivel", "2");
  await page.getByTestId("atrapar-salir").click();
  await expect(page.getByTestId("atrapar")).toHaveCount(0, { timeout: 5000 });
  await expect(page.getByTestId("yosoy-nube")).toContainText("revancha");
});

test("Atrapame: si no lo atrapa en 15 segundos, Yo Da se burla con la snitch dorada", async ({ page }) => {
  test.setTimeout(60_000);
  await empezar(page);
  await expect(page.getByTestId("atrapar")).toHaveCount(0, { timeout: 25_000 });
  await expect(page.getByTestId("yosoy-nube")).toContainText(/Harry Potter|snitch dorada|Hogwarts|Gryffindor/);
});

test("Atrapame sin movimiento (si la persona lo pidió): aparece en lugares al azar y se puede atrapar", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await empezar(page);
  await page.waitForTimeout(700);
  const a = await dondeVuela(page);
  await page.waitForTimeout(1300);
  const b = await dondeVuela(page);
  expect(a && b && (a.x !== b.x || a.y !== b.y)).toBeTruthy();
  await tocarlo(page);
  await expect(page.getByTestId("atrapar")).toHaveCount(0, { timeout: 5000 });
  await expect(page.getByTestId("yosoy-nube")).toContainText("Ganaste");
});

/** Simula que empieza un tema (lo que avisa components/Musica.tsx); `pedido`: la persona tocó «Otro tema». */
async function empiezaTema(page: Page, t: { id: string; titulo: string; artista: string; pedido?: boolean }) {
  await page.evaluate((t) => {
    const tema = { ...t, sonando: true, fragmento: false };
    (window as unknown as { __jbTema: unknown }).__jbTema = tema;
    window.dispatchEvent(new CustomEvent("jb:musica-tema", { detail: tema }));
  }, t);
}

test("Música: cada vez que la persona pide otro tema, Yo Da comenta el nuevo (sin repetirse)", async ({ page }) => {
  await page.goto("/");
  const nube = page.getByTestId("yosoy-nube");
  await expect(nube).toBeVisible();
  await nube.getByRole("button", { name: "Cerrar el saludo de Yo Da" }).click();
  await empiezaTema(page, { id: "a1", titulo: "Tema Uno", artista: "Banda Uno" });
  await expect(nube).toContainText("Tema Uno");
  const vistos = new Set<string>();
  for (const [i, t] of ["Tema Dos", "Tema Tres", "Tema Cuatro"].entries()) {
    await empiezaTema(page, { id: `p${i}`, titulo: t, artista: "Banda Dos", pedido: true });
    await expect(nube).toContainText(t);
    await expect(nube.locator(".yosoy-nube-texto")).not.toHaveText("");
    // el molde de la frase (sin el título ni la banda): distinto cada vez
    await page.waitForTimeout(2500); // que termine de tipear
    vistos.add(((await nube.locator(".yosoy-nube-texto").textContent()) ?? "").replace(t, "").replace("Banda Dos", ""));
  }
  expect(vistos.size).toBe(3);
  // con el chat abierto, el comentario llega al chat
  await page.getByTestId("yosoy-boton").click();
  const yo = page.getByTestId("yosoy");
  await empiezaTema(page, { id: "p9", titulo: "Tema Cinco", artista: "Banda Tres", pedido: true });
  await expect(yo.locator(".yosoy-msj.yo").last()).toContainText("Tema Cinco");
  await expect(yo.locator(".yosoy-msj.yo").last().getByTestId("yosoy-otro-tema")).toBeVisible();
});

test("Atrapame: «Dejar de jugar» cierra el juego con una despedida", async ({ page }) => {
  await empezar(page);
  await tocarlo(page);
  const nube = page.getByTestId("yosoy-nube");
  await expect(nube).toContainText("Ganaste", { timeout: 6000 });
  await nube.getByTestId("yosoy-nube-dejar").click();
  await expect(nube).toContainText("revancha");
  await expect(nube.getByTestId("yosoy-nube-atrapar")).toHaveCount(0);
});

test("Piedra, papel o tijera: más difícil (Yo Da lee tus costumbres) y al final, «Otra partida» o «Dejar de jugar»", async ({ page }) => {
  await page.goto("/");
  const yo = await escribir(page, "jugamos piedra papel o tijera?");
  const msj = yo.locator(".yosoy-msj.yo").last();
  const ppt = msj.getByTestId("yosoy-ppt");
  await ppt.getByRole("button", { name: "A 5" }).click();
  // quien juega siempre lo mismo pierde: Yo Da aprende la costumbre
  for (let i = 0; i < 60 && (await ppt.getByTestId("yosoy-ppt-final").count()) === 0; i++) await ppt.getByRole("button", { name: "Piedra" }).click();
  await expect(ppt.getByTestId("yosoy-ppt-final")).toContainText("A 5 llegué primero");
  await expect(ppt.getByTestId("yosoy-ppt-otra")).toBeVisible();
  await ppt.getByTestId("yosoy-ppt-dejar").click();
  await expect(msj.getByTestId("yosoy-ppt-dejado")).toContainText("revancha");
});
