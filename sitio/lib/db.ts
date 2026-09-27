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

/**
 * Una cola por archivo: lo que lee, cambia y escribe un mismo archivo pasa de a
 * uno, así dos pedidos casi simultáneos no se pisan. Vive en globalThis porque
 * Next puede cargar este módulo más de una vez en el mismo servidor.
 * PRODUCCIÓN: esto lo resuelve la base de datos (transacciones, restricciones únicas).
 */
const g = globalThis as { __jbColas?: Map<string, Promise<unknown>> };
const colas = (g.__jbColas ??= new Map());

function enCola<R>(nombre: string, fn: () => Promise<R>): Promise<R> {
  const esta = (colas.get(nombre) ?? Promise.resolve()).then(fn);
  colas.set(nombre, esta.catch(() => {})); // si algo falla, la cola sigue
  return esta;
}

/** Escribe en un archivo aparte y lo renombra: nadie lee nunca un JSON a medio escribir. */
async function escribirYa<T>(nombre: string, datos: T): Promise<void> {
  const dir = await carpeta();
  const final = path.join(dir, `${nombre}.json`);
  const temporal = `${final}.${process.pid}.${crypto.randomUUID()}.tmp`;
  await fs.writeFile(temporal, JSON.stringify(datos, null, 2));
  await fs.rename(temporal, final);
}

export function escribir<T>(nombre: string, datos: T): Promise<void> {
  return enCola(nombre, () => escribirYa(nombre, datos));
}

/**
 * Lee, cambia y escribe un archivo sin que otro pedido se meta en el medio.
 * `fn` devuelve los datos nuevos (o `undefined` para no escribir nada) y un resultado.
 */
export function modificar<T, R>(nombre: string, fn: (datos: T) => { datos?: T; resultado: R } | Promise<{ datos?: T; resultado: R }>): Promise<R> {
  return enCola(nombre, async () => {
    const { datos, resultado } = await fn(await leer<T>(nombre));
    if (datos !== undefined) await escribirYa(nombre, datos);
    return resultado;
  });
}
