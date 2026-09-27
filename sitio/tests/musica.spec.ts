import { test, expect } from "./ayuda";
import type { Page } from "@playwright/test";

/**
 * Un reproductor de Spotify de mentira (components/Musica.tsx usa window.__jbSpotify si ya
 * está). `modo`: «anda» avanza al tocar play; «trabado» no avanza nunca (lo que pasaba en el
 * celular después de iniciar sesión); «fragmentos» suena como un fragmento de 30 segundos.
 */
async function spotifyFalso(page: Page, modo: "anda" | "trabado" | "fragmentos") {
  await page.addInitScript((modo) => {
    type Datos = { isPaused: boolean; position: number; duration: number };
    const w = window as unknown as Record<string, unknown>;
    const llamadas: string[] = [];
    w.__llamadas = llamadas;
    w.open = () => null;
    w.__jbSpotify = {
      createController(_el: HTMLElement, _o: unknown, cb: (c: unknown) => void) {
        llamadas.push("crear");
        const oyentes: Record<string, ((e: { data: Datos }) => void)[]> = {};
        const avisar = (data: Datos) => (oyentes.playback_update ?? []).forEach((f) => f({ data }));
        const dur = modo === "fragmentos" ? 30_000 : 200_000;
        let pos = 0;
        let reloj: number | undefined;
        const c = {
          addListener: (ev: string, f: (e: { data: Datos }) => void) => (oyentes[ev] ??= []).push(f),
          loadUri: () => llamadas.push("cargar"),
          play: () => {
            llamadas.push("play");
            if (modo === "trabado") return;
            window.clearInterval(reloj);
            reloj = window.setInterval(() => avisar({ isPaused: false, position: (pos += 500), duration: dur }), 500);
          },
          pause: () => {
            llamadas.push("pause");
            window.clearInterval(reloj);
            avisar({ isPaused: true, position: pos, duration: dur });
          },
          togglePlay: () => llamadas.push("alternar"),
          destroy: () => {
            llamadas.push("destruir");
            window.clearInterval(reloj);
          },
        };
        cb(c);
        window.setTimeout(() => (oyentes.ready ?? []).forEach((f) => f({ data: { isPaused: true, position: 0, duration: 0 } })), 50);
      },
    };
  }, modo);
}

const llamadas = (page: Page) => page.evaluate(() => (window as unknown as { __llamadas: string[] }).__llamadas);

async function abrirPanel(page: Page) {
  await page.goto("/");
  await page.getByTestId("musica-boton").click();
  await expect(page.getByTestId("musica-panel")).toBeVisible();
}

test("Música: «Escuchar» reproduce y «Pausa» pausa, sin alternar a ciegas", async ({ page }) => {
  await spotifyFalso(page, "anda");
  await abrirPanel(page);
  const boton = page.getByTestId("musica-play");
  await boton.click();
  await expect(boton).toHaveText("Pausa");
  await boton.click();
  await expect(boton).toHaveText("Seguir");
  await boton.click();
  await expect(boton).toHaveText("Pausa");
  expect(await llamadas(page)).toEqual(["crear", "play", "pause", "play"]);
  // anda: no aparece el aviso de «¿No arranca?»
  await page.waitForTimeout(7500);
  await expect(page.getByTestId("musica-trabado")).toHaveCount(0);
});

test("Música: si no arranca, avisa qué hacer (tocar el ▶ de adentro, o la app)", async ({ page }) => {
  await spotifyFalso(page, "trabado");
  await abrirPanel(page);
  await page.getByTestId("musica-play").click();
  const aviso = page.getByTestId("musica-trabado");
  await expect(aviso).toBeVisible({ timeout: 10_000 });
  await expect(aviso).toContainText("¿No arranca?");
  await expect(aviso.getByRole("link", { name: "Escuchar en tu app" })).toBeVisible();
  // «Probar de nuevo» lo rearma y lo hace sonar (hubo un toque)
  await aviso.getByRole("button", { name: "Probar de nuevo" }).click();
  await expect.poll(() => llamadas(page)).toEqual(["crear", "play", "destruir", "crear", "play"]);
});

test("Música: al volver de iniciar sesión se rearma, pero no suena solo (el celular lo trababa)", async ({ page }) => {
  await spotifyFalso(page, "fragmentos");
  await abrirPanel(page);
  await page.getByTestId("musica-play").click();
  await expect(page.getByTestId("musica-fragmentos")).toBeVisible();
  await page.getByTestId("musica-sesion").click();
  // vuelve a la página
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.getByTestId("musica-sesion-lista")).toBeVisible();
  await expect.poll(() => llamadas(page)).toEqual(["crear", "play", "destruir", "crear"]);
  const boton = page.getByTestId("musica-play");
  await expect(boton).toHaveText("Escuchar");
  await page.waitForTimeout(500);
  expect((await llamadas(page)).filter((l) => l === "play")).toHaveLength(1);
  // el toque de la persona sí lo hace sonar
  await boton.click();
  await expect(boton).toHaveText("Pausa");
  await expect(page.getByTestId("musica-sesion-lista")).toHaveCount(0);
});
