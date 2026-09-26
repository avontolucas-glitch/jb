/**
 * Login simulado con forma real.
 * - Usuarios en data/usuarios.json con clave cifrada (PBKDF2), nunca en texto plano.
 * - La sesión vive en una cookie httpOnly firmada (lib/session.ts).
 *
 * PRODUCCIÓN: este archivo es el único que hay que cambiar para usar un
 * proveedor real (por ejemplo Auth.js, Clerk o Supabase Auth). Mantener las
 * mismas funciones: usuarioActual, ingresar, crearCuenta, cerrarSesion.
 */
import { cookies } from "next/headers";
import { leer, escribir } from "./db";
import { COOKIE_SESION, DURACION_SEGUNDOS, firmar, verificar } from "./session";

export type Usuario = {
  id: string;
  nombre: string;
  email: string;
  sal: string;
  hash: string;
  creado: string;
  demo?: boolean;
};

const enc = new TextEncoder();

export async function hashClave(clave: string, sal: string): Promise<string> {
  const base = await crypto.subtle.importKey("raw", enc.encode(clave), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: enc.encode(sal), iterations: 120_000 },
    base,
    256,
  );
  return Buffer.from(bits).toString("hex");
}

function normalizar(email: string) {
  return email.trim().toLowerCase();
}

export async function buscarPorEmail(email: string) {
  const usuarios = await leer<Usuario[]>("usuarios");
  return usuarios.find((u) => u.email === normalizar(email)) ?? null;
}

async function abrirSesion(uid: string) {
  const token = await firmar({ uid, exp: Date.now() + DURACION_SEGUNDOS * 1000 });
  (await cookies()).set(COOKIE_SESION, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACION_SEGUNDOS,
  });
}

export async function ingresar(email: string, clave: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const u = await buscarPorEmail(email);
  if (!u || (await hashClave(clave, u.sal)) !== u.hash) {
    return { ok: false, error: "El mail o la clave no coinciden." };
  }
  await abrirSesion(u.id);
  return { ok: true };
}

export async function crearCuenta(
  nombre: string,
  email: string,
  clave: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  nombre = nombre.trim();
  email = normalizar(email);
  if (nombre.length < 2) return { ok: false, error: "Escribí tu nombre." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Revisá el mail." };
  if (clave.length < 8) return { ok: false, error: "La clave tiene que tener al menos 8 caracteres." };
  const usuarios = await leer<Usuario[]>("usuarios");
  if (usuarios.some((u) => u.email === email)) return { ok: false, error: "Ya hay una cuenta con ese mail." };
  const sal = crypto.randomUUID();
  const nuevo: Usuario = {
    id: crypto.randomUUID(),
    nombre,
    email,
    sal,
    hash: await hashClave(clave, sal),
    creado: new Date().toISOString(),
  };
  usuarios.push(nuevo);
  await escribir("usuarios", usuarios);
  await abrirSesion(nuevo.id);
  return { ok: true };
}

export async function cerrarSesion() {
  (await cookies()).delete(COOKIE_SESION);
}

export async function usuarioActual(): Promise<Usuario | null> {
  const s = await verificar((await cookies()).get(COOKIE_SESION)?.value);
  if (!s) return null;
  const usuarios = await leer<Usuario[]>("usuarios");
  return usuarios.find((u) => u.id === s.uid) ?? null;
}
