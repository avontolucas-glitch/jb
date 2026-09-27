import { test, expect } from "./ayuda";
import { frases, tituloLibro } from "../content/frases";

const textoDe = async (el: import("@playwright/test").Locator) => ((await el.locator("blockquote .sr-only").textContent()) ?? "").replace(/^«|»$/g, "");

test("cada vez que se entra a una página, el epígrafe trae otra frase textual de los libros", async ({ page }) => {
  const vistas: string[] = [];
  for (let i = 0; i < 4; i++) {
    await page.goto("/");
    const ep = page.getByTestId("epigrafe").first();
    await ep.scrollIntoViewIfNeeded();
    const t = await textoDe(ep);
    const f = frases.find((x) => x.texto === t);
    expect(f, `«${t}» no está en las frases verificadas`).toBeTruthy();
    await expect(ep.locator("figcaption")).toContainText(tituloLibro[f!.libro]);
    vistas.push(t);
  }
  expect(new Set(vistas).size).toBe(4);
});

test("«Otra frase» disuelve la frase y trae la siguiente", async ({ page }) => {
  await page.goto("/masterclass");
  const ep = page.getByTestId("epigrafe").first();
  await ep.scrollIntoViewIfNeeded();
  const antes = await textoDe(ep);
  await ep.getByRole("button", { name: "Otra frase" }).click();
  await expect.poll(() => textoDe(ep)).not.toBe(antes);
  expect(frases.some((x) => x.texto === (antes))).toBeTruthy();
});

test("en Libros, cada libro rota solo con sus propias frases", async ({ page }) => {
  await page.goto("/libros");
  const eps = page.getByTestId("epigrafe");
  await expect(eps).toHaveCount(3);
  const libros = ["receta", "pensamiento", "biografia"] as const;
  for (let i = 0; i < 3; i++) {
    const t = await textoDe(eps.nth(i));
    expect(frases.find((x) => x.texto === t)?.libro).toBe(libros[i]);
  }
});
