import { readdirSync, readFileSync, statSync } from "fs";
import os from "os";
import path from "path";
import type { Page } from "@playwright/test";
import { test, expect, crearCuenta, cerrarSesion, cupoPropio, unico } from "./ayuda";

/**
 * La infraestructura de seguridad del sitio: encabezados y CSP con nonce, límites,
 * la verificación «Confirmá que sos una persona», las trampas para bots, la sesión y
 * el panel de Julián. Cada prueba tiene su propio cupo (encabezado «x-jb-prueba»,
 * tests/ayuda.ts), así que los umbrales son los reales de lib/limite.ts y lib/auth.ts.
 */

const CLAVE = "clave-segura-1";
const NO_COINCIDEN = "El mail o la clave no coinciden.";

/** Junta las violaciones de la CSP de todas las páginas que se abren en el contexto. */
async function vigilarCsp(page: Page): Promise<string[]> {
  const violaciones: string[] = [];
  page.on("console", (m) => {
    const t = m.text();
    if (/Refused to|Content Security Policy/i.test(t)) violaciones.push(`${page.url()} · ${t}`);
  });
  await page.context().exposeBinding("__jbCsp", (_o, txt: string) => violaciones.push(txt));
  await page.context().addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (e) => {
      (window as unknown as { __jbCsp: (t: string) => void }).__jbCsp(`${location.pathname} · ${e.violatedDirective} · ${e.blockedURI}`);
    });
  });
  return violaciones;
}

/** Manda el formulario de ingreso y espera la respuesta de la acción. */
async function intentarIngreso(page: Page, email: string, clave: string, entra = false) {
  const form = page.locator("form").first();
  await form.getByLabel("Mail").fill(email);
  await form.getByLabel("Clave").fill(clave);
  const respuesta = page.waitForResponse((r) => r.request().method() === "POST" && new URL(r.url()).pathname === "/ingresar");
  const boton = page.getByRole("button", { name: "Ingresar", exact: true });
  await boton.click();
  await respuesta;
  if (entra) return page.waitForURL("**/mi-espacio");
  // el estado nuevo ya se dibujó (y la casilla, si estaba, volvió a empezar)
  await expect(boton).toBeEnabled();
}

/** Toca la casilla y espera a que termine (prueba de trabajo en el navegador). */
async function verificarPersona(page: Page) {
  await expect(page.getByTestId("desafio")).toHaveAttribute("data-fase", /inicial|error/);
  await expect(page.getByTestId("desafio-token")).toHaveCount(0);
  await page.getByTestId("desafio-casilla").click();
  await expect(page.getByTestId("desafio-token")).toBeAttached({ timeout: 20_000 });
  await expect(page.getByTestId("desafio")).toHaveAttribute("data-fase", "listo");
}

/** La carpeta de datos del servidor de pruebas (playwright.config.ts la crea nueva en cada corrida). */
function carpetaDatos(): string | null {
  const base = os.tmpdir();
  const dirs = readdirSync(base)
    .filter((d) => d.startsWith("jb-pruebas-"))
    .map((d) => path.join(base, d))
    .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
  return dirs[0] ?? null;
}

test("encabezados de seguridad y CSP con nonce en las páginas", async ({ page }) => {
  const r = await page.request.get("/");
  expect(r.status()).toBe(200);
  const h = r.headers();
  const csp = h["content-security-policy"] ?? "";
  const nonce = /'nonce-([A-Za-z0-9+/=]+)'/.exec(csp)?.[1];
  expect(nonce, "la CSP lleva un nonce").toBeTruthy();
  expect(csp).toContain("'strict-dynamic'");
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).toContain("object-src 'none'");
  expect(csp).toContain("worker-src 'self' blob:");
  expect(h["x-frame-options"]).toBe("DENY");
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(h["permissions-policy"]).toContain("camera=()");
  expect(h["x-powered-by"]).toBeUndefined();
  // los scripts de Next y el del <head> llevan el mismo nonce del encabezado
  const html = await r.text();
  expect(html).toContain(`nonce="${nonce}"`);
  const scripts = [...html.matchAll(/<script\b[^>]*>/g)].map((m) => m[0]);
  expect(scripts.length).toBeGreaterThan(0);
  for (const s of scripts) expect(s, "todo <script> lleva nonce").toContain(`nonce="${nonce}"`);

  // un nonce distinto en cada pedido
  const otra = (await page.request.get("/")).headers()["content-security-policy"] ?? "";
  expect(otra).not.toContain(`'nonce-${nonce}'`);

  // lo privado y los formularios de cuenta, fuera de los buscadores
  expect((await page.request.get("/ingresar")).headers()["x-robots-tag"]).toContain("noindex");
  const api = await page.request.get("/api/yo");
  expect(api.headers()["x-robots-tag"]).toContain("noindex");
  expect(api.headers()["content-security-policy"]).toContain("default-src 'none'");

  const robots = await (await page.request.get("/robots.txt")).text();
  for (const ruta of ["/mi-espacio", "/checkout", "/api", "/ingresar"]) expect(robots).toContain(`Disallow: ${ruta}`);
  const sec = await page.request.get("/.well-known/security.txt");
  expect(sec.status()).toBe(200);
  expect(await sec.text()).toContain("Expires:");
});

test("con la CSP, las páginas principales no registran violaciones y el umbral, Yo Da y las fotos andan", async ({ browser }, info) => {
  // un navegador que entra por el umbral, como una persona (sin el atajo del fixture)
  const ctx = await browser.newContext(cupoPropio(info, "umbral"));
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem("jb-aviso-app-cerrado", String(Date.now()));
    } catch {}
  });
  const page = await ctx.newPage();
  const violaciones = await vigilarCsp(page);
  try {
    // con sesión (el 1 a 1 se desbloquea con la cuenta), así Yo Da trae los horarios.
    // Se ingresa en otra pestaña que ya pasó el umbral (la marca vive en sessionStorage,
    // que es de cada pestaña): la cookie queda para todo el navegador y esta pestaña
    // todavía ve la bienvenida.
    const login = await ctx.newPage();
    await login.addInitScript(() => {
      try {
        sessionStorage.setItem("jb-umbral", "1");
      } catch {}
    });
    await login.goto("/ingresar");
    await login.getByRole("button", { name: "Entrar como comprador@demo.com" }).click();
    await login.waitForURL("**/mi-espacio");
    await login.close();
    await page.goto("/");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByTestId("umbral")).toBeHidden();

    // las fotos se descubren y cargan
    const foto = page.getByTestId("foto-julian-chef");
    await foto.scrollIntoViewIfNeeded();
    await expect(foto).toHaveClass(/visto/);
    await expect.poll(() => foto.locator("img").evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth)).toBeGreaterThan(0);

    // Yo Da abre y trae los horarios (fetch a /api/horarios con la CSP puesta)
    await page.getByTestId("yosoy-boton").click();
    const yo = page.getByTestId("yosoy");
    await expect(yo).toBeVisible();
    await yo.getByRole("button", { name: "Agendar un 1 a 1" }).click();
    await expect(yo.getByTestId("yosoy-horarios")).toBeVisible();

    for (const ruta of ["/libros", "/masterclass", "/masterclass/1-a-1", "/conferencias", "/app", "/ingresar"]) {
      const r = await page.goto(ruta);
      expect(r?.status(), ruta).toBe(200);
      await page.waitForLoadState("load");
      await page.mouse.wheel(0, 2000);
      await page.waitForTimeout(700);
    }
    expect(violaciones, "violaciones de la CSP").toEqual([]);
  } finally {
    await ctx.close();
  }
});

test("ingresar: desde el 3.er fallo pide verificación y, resuelta, con la clave correcta entra", async ({ page }) => {
  const email = unico("verifica");
  await crearCuenta(page, email);
  await cerrarSesion(page);
  await page.goto("/ingresar");

  for (let i = 1; i <= 2; i++) {
    await intentarIngreso(page, email, `equivocada-${i}`);
    await expect(page.getByTestId("mensaje-error")).toHaveText(NO_COINCIDEN);
    await expect(page.getByTestId("desafio")).toHaveCount(0);
  }
  // el 3.er fallo ya deja la casilla a la vista para el próximo intento
  await intentarIngreso(page, email, "equivocada-3");
  await expect(page.getByTestId("desafio")).toBeVisible();

  // sin resolverla, ni la clave correcta pasa
  await intentarIngreso(page, email, CLAVE);
  await expect(page.getByTestId("mensaje-error")).toHaveText("Confirmá que sos una persona para seguir.");
  await expect(page).toHaveURL(/\/ingresar/);

  await verificarPersona(page);
  await intentarIngreso(page, email, CLAVE, true);
});

test("ingresar: con 10 fallos queda bloqueado un rato, aunque después la clave sea la correcta", async ({ page }) => {
  test.setTimeout(120_000);
  const email = unico("bloqueo");
  await crearCuenta(page, email);
  await cerrarSesion(page);
  await page.goto("/ingresar");

  for (let i = 1; i <= 10; i++) {
    if (i > 3) await verificarPersona(page);
    await intentarIngreso(page, email, `equivocada-${i}`);
    if (i < 10) await expect(page.getByTestId("mensaje-error")).toHaveText(NO_COINCIDEN);
  }
  await expect(page.getByTestId("mensaje-error")).toContainText("Hubo muchos intentos seguidos");
  await expect(page.getByTestId("desafio")).toHaveCount(0);

  await intentarIngreso(page, email, CLAVE);
  await expect(page.getByTestId("mensaje-error")).toContainText("Hubo muchos intentos seguidos");
  await expect(page).toHaveURL(/\/ingresar/);
});

test("canjear: después de varios códigos equivocados pide verificación", async ({ page }) => {
  await crearCuenta(page, unico("canje"));
  await page.goto("/canjear");
  const campo = page.getByLabel("Código del libro");
  const boton = page.getByRole("button", { name: "Desbloquear el libro" });
  const canjear = async (codigo: string) => {
    await campo.fill(codigo);
    const r = page.waitForResponse((x) => x.request().method() === "POST" && new URL(x.url()).pathname === "/canjear");
    await boton.click();
    await r;
    await expect(boton).toBeEnabled();
  };
  for (let i = 1; i <= 2; i++) {
    await canjear(`REC-AAAA-BBBB-CC${i}Z`);
    await expect(page.getByTestId("mensaje-error")).toBeVisible();
    await expect(page.getByTestId("desafio")).toHaveCount(0);
  }
  await canjear("REC-AAAA-BBBB-CC3Z");
  await expect(page.getByTestId("desafio")).toBeVisible();

  // sin la verificación no se prueba ningún código más
  await canjear("REC-AAAA-BBBB-CC4Z");
  await expect(page.getByTestId("mensaje-error")).toHaveText("Para seguir, confirmá que sos una persona.");

  // resuelta, el código se revisa (y sigue siendo equivocado)
  await verificarPersona(page);
  await canjear("REC-AAAA-BBBB-CC5Z");
  await expect(page.getByTestId("mensaje-error")).not.toHaveText("Para seguir, confirmá que sos una persona.");
  await expect(page.getByTestId("desafio")).toBeVisible();
});

test("trampa: un envío con el campo oculto completo parece salir bien pero no guarda nada", async ({ page }) => {
  const bot = unico("bot");
  const persona = unico("persona");
  const sumarse = async (contacto: string, trampa: boolean) => {
    await page.goto("/lista");
    await page.getByLabel("Tu mail").fill(contacto);
    if (trampa) await page.locator('input[name="sitio_web"]').evaluate((i: HTMLInputElement) => (i.value = "https://spam.example"));
    await page.getByRole("button", { name: "Sumarme" }).click();
    await expect(page.getByTestId("mensaje-ok")).toContainText("Listo");
  };
  await sumarse(bot, true);
  await sumarse(persona, false);

  const dir = carpetaDatos();
  expect(dir, "carpeta de datos de las pruebas").toBeTruthy();
  const lista = JSON.parse(readFileSync(path.join(dir!, "lista.json"), "utf8")) as { contacto: string }[];
  const contactos = lista.map((l) => l.contacto);
  expect(contactos).toContain(persona.toLowerCase());
  expect(contactos).not.toContain(bot.toLowerCase());
});

test("/api/horarios: pasado el cupo responde 429 con Retry-After", async ({ page }) => {
  let ultima = await page.request.get("/api/horarios");
  expect(ultima.status()).toBe(200);
  for (let i = 0; i < 40 && ultima.status() !== 429; i++) ultima = await page.request.get("/api/horarios");
  expect(ultima.status()).toBe(429);
  const espera = Number(ultima.headers()["retry-after"]);
  expect(espera).toBeGreaterThan(0);
  expect(espera).toBeLessThanOrEqual(60);
  const d = (await ultima.json()) as { error?: string; reintentoSeg?: number };
  expect(d.error).toBeTruthy();
  expect(ultima.headers()["cache-control"]).toContain("no-store");
});

test("la cookie de sesión es HttpOnly y SameSite", async ({ page, context }) => {
  await crearCuenta(page, unico("galleta"));
  const cookies = await context.cookies();
  const sesion = cookies.find((c) => c.name === "jb_sesion" || c.name === "__Host-jb_sesion");
  expect(sesion, "hay cookie de sesión").toBeTruthy();
  expect(sesion!.httpOnly).toBe(true);
  expect(["Lax", "Strict"]).toContain(sesion!.sameSite);
  expect(sesion!.path).toBe("/");
  // desde JavaScript no se ve
  expect(await page.evaluate(() => document.cookie)).not.toContain("jb_sesion");
});

test("«Cerrar sesión en todos los dispositivos» cierra también la otra sesión abierta", async ({ page, browser }, info) => {
  const email = unico("todos");
  await crearCuenta(page, email);

  // la misma cuenta, abierta en otro navegador
  const otro = await browser.newContext(cupoPropio(info, "otro"));
  try {
    await otro.addInitScript(() => sessionStorage.setItem("jb-umbral", "1"));
    const p2 = await otro.newPage();
    await p2.goto("/ingresar");
    await intentarIngreso(p2, email, CLAVE, true);

    await page.goto("/mi-espacio/cuenta");
    await page.getByTestId("salir-de-todos").click();
    await page.waitForURL("**/?sesion=cerrada");

    await p2.goto("/mi-espacio/cuenta");
    await expect(p2).toHaveURL(/\/ingresar/);
    // y esta también quedó cerrada
    await page.goto("/mi-espacio");
    await expect(page).toHaveURL(/\/ingresar/);
  } finally {
    await otro.close();
  }
});

test("el panel /mi-espacio/seguridad es solo de Julián", async ({ page }) => {
  await crearCuenta(page, unico("curioso"));
  const r = await page.goto("/mi-espacio/seguridad");
  expect(r?.status()).toBe(404);
  await expect(page.getByTestId("seguridad-panel")).toHaveCount(0);
  await cerrarSesion(page);

  await page.goto("/ingresar");
  await page.getByRole("button", { name: "Entrar como julian@demo.com" }).click();
  await page.waitForURL("**/mi-espacio");
  await expect(page.getByRole("link", { name: "Seguridad" }).first()).toBeVisible();
  await page.goto("/mi-espacio/seguridad");
  await expect(page.getByTestId("seguridad-panel")).toBeVisible();
  await expect(page.getByTestId("seguridad-resumen")).toBeVisible();
});

test("Yo Da frena el spam de mensajes con una pausa serena", async ({ page }) => {
  await page.goto("/libros");
  await page.getByTestId("yosoy-boton").click();
  const yo = page.getByTestId("yosoy");
  const campo = yo.getByLabel("Escribile a Yo Da");
  for (let i = 1; i <= 5; i++) {
    await campo.fill(`hola ${i}`);
    await campo.press("Enter");
  }
  await expect(yo).toContainText("Despacio");
  await expect(yo.getByTestId("yosoy-pausa")).toBeVisible();
  await expect(yo.getByRole("button", { name: "Enviar" })).toBeDisabled();
  // lo escrito no se pierde
  await expect(campo).toHaveValue("hola 5");
  // pasada la pausa, se puede seguir
  await expect(yo.getByTestId("yosoy-pausa")).toBeHidden({ timeout: 35_000 });
  await expect(yo.getByRole("button", { name: "Enviar" })).toBeEnabled();
});

test("volver: un destino con un tab escondido («/\\t/evil.com») no saca del sitio", async ({ page }) => {
  await crearCuenta(page, unico("volver"));
  for (const ruta of ["/ingresar", "/crear-cuenta"]) {
    const r = await page.request.get(`${ruta}?volver=%2F%09%2Fevil.com`, { maxRedirects: 0 });
    expect([303, 307, 308]).toContain(r.status());
    expect(r.headers()["location"]).toBe("/mi-espacio");
  }
  await page.goto("/ingresar?volver=%2F%09%2Fevil.com");
  await page.waitForURL("**/mi-espacio");
  expect(new URL(page.url()).hostname).toBe("localhost");
});

test("lo escrito no se borra cuando aparece la verificación", async ({ page }) => {
  const email = unico("sinborrar");
  await crearCuenta(page, email);
  await cerrarSesion(page);
  await page.goto("/ingresar");
  for (let i = 1; i <= 3; i++) await intentarIngreso(page, email, `equivocada-${i}`);
  await expect(page.getByTestId("desafio")).toBeVisible();
  const form = page.locator("form").first();
  await expect(form.getByLabel("Mail")).toHaveValue(email);
  await expect(form.getByLabel("Clave")).toHaveValue("equivocada-3");
});

test("arrepentimiento: aunque el campo oculto llegue lleno, el pedido se guarda (marcado para revisar)", async ({ page }) => {
  const email = unico("arrepentido");
  await page.goto("/arrepentimiento");
  await page.getByLabel("Nombre").fill("Persona con autocompletar");
  await page.getByLabel("Mail de la compra").fill(email);
  await page.getByLabel("Qué compraste y cuándo").fill("Masterclass grabada, ayer");
  await page.locator('input[name="sitio_web"]').evaluate((i: HTMLInputElement) => (i.value = "https://mi-sitio.example"));
  await page.getByRole("button", { name: "Pedir la cancelación" }).click();
  await expect(page.getByTestId("mensaje-ok")).toContainText("ARR-");
  const codigo = /ARR-[A-Z0-9]{6}/.exec((await page.getByTestId("mensaje-ok").textContent()) ?? "")?.[0];
  const dir = carpetaDatos();
  expect(dir, "carpeta de datos de las pruebas").toBeTruthy();
  const lista = JSON.parse(readFileSync(path.join(dir!, "arrepentimientos.json"), "utf8")) as { codigo: string; email: string; sospechoso?: boolean }[];
  const guardado = lista.find((a) => a.codigo === codigo);
  expect(guardado?.email).toBe(email.toLowerCase());
  expect(guardado?.sospechoso).toBe(true);
});

test("música: con la CSP, el reproductor de Spotify carga sin violaciones", async ({ page }) => {
  test.setTimeout(60_000);
  const violaciones = await vigilarCsp(page);
  const errores: string[] = [];
  page.on("pageerror", (e) => errores.push(String(e)));
  let sinRed = false;
  page.on("requestfailed", (r) => {
    if (r.url().startsWith("https://open.spotify.com/embed/iframe-api")) sinRed = true;
  });
  await page.goto("/");
  await page.getByTestId("musica-boton").click();
  await page.getByTestId("musica-play").click();
  const iframe = page.locator('[data-testid="musica-panel"] iframe[src^="https://open.spotify.com/"]');
  await expect.poll(async () => sinRed || (await iframe.count()) > 0, { timeout: 25_000 }).toBe(true);
  test.skip(sinRed && (await iframe.count()) === 0, "El navegador de pruebas no llega a Spotify (sin red)");
  await expect(iframe).toHaveCount(1);
  expect(errores.filter((e) => /EvalError|unsafe-eval|Content Security Policy/i.test(e))).toEqual([]);
  expect(violaciones).toEqual([]);
});
