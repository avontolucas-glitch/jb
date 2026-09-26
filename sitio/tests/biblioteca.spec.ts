import { test, expect, crearCuenta, unico } from "./ayuda";

// Cada código sirve una vez: cada corrida (celular y computadora) usa uno distinto.
const casos = {
  celular: { codigo: "rec m2pw 8znc 5rve", exacto: "REC-M2PW-8ZNC-5RVE", libro: "receta", caps: 6, primero: "Dos Formatos de la Mente", segundo: "El Sentimiento Crea la Realidad", cerrado: "pensamiento" },
  computadora: { codigo: "bio 3wan 7pdx 6hgk", exacto: "BIO-3WAN-7PDX-6HGK", libro: "biografia", caps: 4, primero: "Primera Imagen", segundo: "El Reconocimiento", cerrado: "receta" },
};

test("el código del libro impreso desbloquea solo ese libro, y una sola vez", async ({ page, browser }, info) => {
  const k = casos[info.project.name as keyof typeof casos];
  await crearCuenta(page, unico("lector"));
  await page.goto("/canjear");
  await page.getByLabel("Código del libro").fill("nada-que-ver");
  await page.getByRole("button", { name: "Desbloquear el libro" }).click();
  await expect(page.getByTestId("mensaje-error")).toBeVisible();

  // minúsculas y sin guiones también sirve
  await page.getByLabel("Código del libro").fill(k.codigo);
  await page.getByRole("button", { name: "Desbloquear el libro" }).click();
  await page.waitForURL(`**/mi-espacio/biblioteca/${k.libro}?canje=ok`);
  await expect(page.getByTestId("libro-ok")).toBeVisible();
  await expect(page.getByTestId("indice").locator("li")).toHaveCount(k.caps);

  // leer: marca de agua, capítulos en orden
  await page.getByRole("link", { name: new RegExp(k.primero) }).click();
  await expect(page.getByTestId("lector")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(k.primero);
  await page.getByTestId("capitulo-siguiente").click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(k.segundo);

  // los otros libros siguen cerrados
  await page.goto(`/mi-espacio/biblioteca/${k.cerrado}/0`);
  await expect(page.getByTestId("sin-acceso")).toBeVisible();

  // el mismo código no sirve para otra cuenta
  const otro = await browser.newContext();
  await otro.addInitScript(() => sessionStorage.setItem("jb-umbral", "1"));
  const p2 = await otro.newPage();
  await crearCuenta(p2, unico("otro"));
  await p2.goto("/canjear");
  await p2.getByLabel("Código del libro").fill(k.exacto);
  await p2.getByRole("button", { name: "Desbloquear el libro" }).click();
  await expect(p2.getByTestId("mensaje-error")).toContainText("ya fue usado");
  await otro.close();
});

test("comprar el libro digital lo deja para leer en la biblioteca", async ({ page }) => {
  await crearCuenta(page, unico("digital"));
  await page.goto("/mi-espacio/biblioteca");
  await page.getByTestId("biblioteca-biografia").getByRole("link", { name: "Comprar el digital" }).click();
  await page.getByRole("button", { name: "Pagar (simulado)" }).click();
  await page.waitForURL("**/mi-espacio/biblioteca/biografia?compra=ok");
  await expect(page.getByTestId("indice").locator("li")).toHaveCount(4);
  await page.goto("/mi-espacio/cuenta");
  await expect(page.getByTestId("compras")).toContainText("Biografía · edición digital");
});

test("sin cuenta, canjear pide ingresar", async ({ page }) => {
  await page.goto("/canjear");
  await expect(page.getByRole("link", { name: "Ingresar" }).last()).toBeVisible();
  await expect(page.getByLabel("Código del libro")).toHaveCount(0);
});
