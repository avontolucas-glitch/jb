import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "fs";
import os from "os";
import path from "path";

const PUERTO = Number(process.env.PUERTO_PRUEBAS) || 3200; // otro puerto (PUERTO_PRUEBAS) para correr dos copias a la vez
// Datos de prueba en una carpeta temporal nueva: las pruebas no tocan los datos del prototipo.
const DATA_DIR = path.join(os.tmpdir(), `jb-pruebas-${Date.now()}`);
// En algunos entornos el navegador viene preinstalado en otra ruta.
const chromeLocal = "/opt/pw-browsers/chromium";
const lanzar = existsSync(chromeLocal) ? { executablePath: chromeLocal } : {};

export default defineConfig({
  testDir: "./tests",
  workers: 1,
  timeout: 45_000,
  reporter: [["list"]],
  // Por defecto el navegador está en hora de Argentina (la de Julián); zonas.spec.ts prueba otras.
  use: { baseURL: `http://localhost:${PUERTO}`, locale: "es-AR", timezoneId: "America/Argentina/Buenos_Aires" },
  projects: [
    { name: "celular", use: { ...devices["Pixel 7"], launchOptions: lanzar } },
    { name: "computadora", use: { ...devices["Desktop Chrome"], launchOptions: lanzar } },
  ],
  webServer: {
    command: `npm run start -- -p ${PUERTO}`,
    url: `http://localhost:${PUERTO}`,
    reuseExistingServer: false,
    // JB_ADMIN_DEMO: la cuenta demo de Julián (julian@demo.com) vale como la suya solo acá, en las pruebas.
    // JB_PRUEBAS: el encabezado «x-jb-prueba» de cada prueba (tests/ayuda.ts) le da su propio cupo en los
    // límites, y no se mira el tiempo mínimo de los formularios (Playwright completa en milisegundos).
    env: { DATA_DIR, JB_ADMIN_DEMO: "1", JB_PRUEBAS: "1", SESSION_SECRET: "clave-de-pruebas-larga-solo-para-playwright-0123456789" },
    timeout: 60_000,
  },
});
