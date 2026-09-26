/**
 * Datos de demo en archivos JSON (sin base de datos).
 * Los archivos de data/ son la semilla; los cambios del prototipo se guardan
 * en data/runtime/ (o en la carpeta temporal si el servidor no deja escribir).
 * PRODUCCIÓN: reemplazar por una base de datos real.
 */
import { promises as fs } from "fs";
import os from "os";
import path from "path";

const SEMILLA = path.join(process.cwd(), "data");
let dirRuntime: string | null = null;

async function carpeta(): Promise<string> {
  if (dirRuntime) return dirRuntime;
  const candidatas = [process.env.DATA_DIR, path.join(SEMILLA, "runtime"), path.join(os.tmpdir(), "jb-prototipo")].filter(
    Boolean,
  ) as string[];
  for (const c of candidatas) {
    try {
      await fs.mkdir(c, { recursive: true });
      const prueba = path.join(c, ".escritura");
      await fs.writeFile(prueba, "ok");
      dirRuntime = c;
      return c;
    } catch {
      /* probar la siguiente */
    }
  }
  throw new Error("No hay carpeta con permiso de escritura para los datos del prototipo.");
}

export async function leer<T>(nombre: string): Promise<T> {
  const dir = await carpeta();
  const archivo = path.join(dir, `${nombre}.json`);
  try {
    return JSON.parse(await fs.readFile(archivo, "utf8")) as T;
  } catch {
    const semilla = await fs.readFile(path.join(SEMILLA, `${nombre}.json`), "utf8").catch(() => "[]");
    await fs.writeFile(archivo, semilla);
    return JSON.parse(semilla) as T;
  }
}

/** Lee el archivo semilla de data/ tal como viene en el repositorio (sin los cambios del prototipo). */
export async function leerSemilla<T>(nombre: string, porDefecto: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(path.join(SEMILLA, `${nombre}.json`), "utf8")) as T;
  } catch {
    return porDefecto;
  }
}

export async function escribir<T>(nombre: string, datos: T): Promise<void> {
  const dir = await carpeta();
  await fs.writeFile(path.join(dir, `${nombre}.json`), JSON.stringify(datos, null, 2));
}
