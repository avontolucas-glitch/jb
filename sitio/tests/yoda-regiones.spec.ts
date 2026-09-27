import { test, expect } from "./ayuda";
import { readFileSync } from "fs";
import path from "path";
import type { Page } from "@playwright/test";

/** Las respuestas de cada país, tal como están en content/yoda-regiones.ts. */
type Ficha = { id: string; respuestas: Record<string, string[]> };
const fichas: Ficha[] = readFileSync(path.join(__dirname, "../content/yoda-regiones.ts"), "utf8")
  .split("\n")
  .filter((l) => l.trim().startsWith('{"id"'))
  .map((l) => JSON.parse(l.trim().replace(/,$/, "")));
const de = (id: string, clave: string) => fichas.find((f) => f.id === id)!.respuestas[clave];

/** Le escribe a Yo Da, espera la respuesta y la devuelve (el texto). */
async function decir(page: Page, texto: string): Promise<string> {
  const yo = page.getByTestId("yosoy");
  if (!(await yo.isVisible())) await page.getByTestId("yosoy-boton").click();
  const msjs = yo.locator(".yosoy-msj.yo:not(.yosoy-pensando)");
  const antes = await msjs.count();
  const campo = yo.getByLabel("Escribile a Yo Da");
  await campo.fill(texto);
  await campo.press("Enter");
  await expect.poll(() => msjs.count()).toBeGreaterThan(antes);
  await page.waitForTimeout(150);
  return (await msjs.last().innerText()).replace(/\s+/g, " ");
}

/** La respuesta es una de las de ese país (o empieza con alguna, si Yo Da agrega algo después). */
const unaDe = (r: string, opciones: string[]) => opciones.some((o) => r.includes(o.replace(/\s+/g, " ")));

test("Yo Da contesta en el registro de cada país (Chile, Colombia, República Dominicana, México)", async ({ page }) => {
  await page.goto("/");
  let r = await decir(page, "wena po, cachai?");
  expect(unaDe(r, de("cl", "saludo")), r).toBe(true);
  await page.goto("/libros");
  r = await decir(page, "quiubo parce");
  expect(unaDe(r, de("co", "saludo")), r).toBe(true);
  // se acuerda de dónde es: el gracias, a la colombiana
  r = await decir(page, "gracias");
  expect(unaDe(r, de("co", "gracias")), r).toBe(true);
});

test("A quien escribe en inglés o en portugués, le contesta en su idioma (a lo Yoda)", async ({ page }) => {
  await page.goto("/");
  let r = await decir(page, "hello! whats up");
  expect(unaDe(r, [...de("en", "saludo"), ...de("en", "comoEstas")]), r).toBe(true);
  await page.goto("/fragmentos");
  r = await decir(page, "oi, tudo bem?");
  expect(unaDe(r, [...de("br", "comoEstas"), ...de("br", "saludo")]), r).toBe(true);
});

test("Un «dale» sigue lo último que Yo Da ofreció; un «no» suelto no lo confunde", async ({ page }) => {
  await page.goto("/");
  await decir(page, "contame de la masterclass en vivo");
  const r = await decir(page, "dale");
  expect(r).toContain("Masterclass grabada");
  const n = await decir(page, "no");
  expect(n).not.toContain("Claro no lo veo");
});

test("Yo Da sabe la hora de quien escribe", async ({ page }) => {
  await page.goto("/");
  const r = await decir(page, "que hora es?");
  expect(r).toMatch(/\b\d{2}:\d{2}\b/);
});
