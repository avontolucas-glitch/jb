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
import { leer, leerSemilla, escribir } from "./db";
import { COOKIE_SESION, DURACION_SEGUNDOS, firmar, verificar } from "./session";

export type Usuario = {
  id: string;
  nombre: string;
  email: string;
  sal: string;
  hash: string;
  creado: string;
  demo?: boolean;
  /** Cuenta de Julián: administra la agenda de la Masterclass 1 a 1. */
  admin?: boolean;
};

/**
 * ¿Se puede entrar como Julián con la cuenta demo (julian@demo.com, con la clave a la vista)?
 * Solo si se enciende a propósito con JB_ADMIN_DEMO=1 (las pruebas, una demo local).
 * En un sitio publicado queda apagado: ahí la cuenta de Julián es la de ADMIN_EMAIL y ADMIN_CLAVE.
 */
export const adminDemoActivo = () => process.env.JB_ADMIN_DEMO === "1";

/**
 * Solo una cuenta marcada como admin por el servidor (nunca algo que mande el navegador):
 * la de ADMIN_EMAIL, o la demo de data/usuarios.json si JB_ADMIN_DEMO=1.
 */
export const esAdmin = (u: Usuario | null | undefined): boolean => u?.admin === true && (!u.demo || adminDemoActivo());

const ID_ADMIN = "admin-julian";
let cuentaAdmin: { clave: string; usuario: Promise<Usuario> } | null = null;

/**
 * La cuenta de Julián para el sitio publicado: mail y clave en variables de
 * entorno (ADMIN_EMAIL y ADMIN_CLAVE, al menos 8 caracteres), nunca a la vista
 * en el sitio ni en el repositorio.
 */
function cuentaAdminPrivada(): Promise<Usuario> | null {
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const clave = process.env.ADMIN_CLAVE ?? "";
  if (!email || clave.length < 8) return null;
  const firma = `${email}\n${clave}`;
  if (cuentaAdmin?.clave !== firma) {
    const sal = `admin-${email}`;
    cuentaAdmin = {
      clave: firma,
      usuario: hashClave(clave, sal).then((hash) => ({
        id: ID_ADMIN,
        nombre: (process.env.ADMIN_NOMBRE ?? "").trim() || "Julián",
        email,
        sal,
        hash,
        creado: "2026-09-01T00:00:00.000Z",
        admin: true,
      })),
    };
  }
  return cuentaAdmin.usuario;
}

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

/**
 * Las cuentas guardadas más las cuentas demo de la semilla que falten (así una
 * cuenta demo nueva, como la de Julián, aparece aunque ya haya datos guardados).
 */
export async function usuarios(): Promise<Usuario[]> {
  const guardados = await leer<Usuario[]>("usuarios");
  const demos = (await leerSemilla<Usuario[]>("usuarios", [])).filter((d) => d.demo && !guardados.some((g) => g.id === d.id));
  const admin = await cuentaAdminPrivada();
  // la cuenta privada de Julián va primero: su mail no lo puede usar otra cuenta
  return admin ? [admin, ...guardados.filter((g) => g.email !== admin.email && g.id !== ID_ADMIN), ...demos] : [...guardados, ...demos];
}

export async function buscarPorEmail(email: string) {
  return (await usuarios()).find((u) => u.email === normalizar(email)) ?? null;
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
  // sin caracteres de control (el nombre llega al calendario de Julián) y con un largo razonable
  nombre = nombre
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80)
    .trim();
  email = normalizar(email);
  if (nombre.length < 2) return { ok: false, error: "Escribí tu nombre." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Revisá el mail." };
  if (clave.length < 8) return { ok: false, error: "La clave tiene que tener al menos 8 caracteres." };
  if ((await usuarios()).some((u) => u.email === email)) return { ok: false, error: "Ya hay una cuenta con ese mail." };
  const guardados = await leer<Usuario[]>("usuarios");
  const sal = crypto.randomUUID();
  const nuevo: Usuario = {
    id: crypto.randomUUID(),
    nombre,
    email,
    sal,
    hash: await hashClave(clave, sal),
    creado: new Date().toISOString(),
  };
  guardados.push(nuevo);
  await escribir("usuarios", guardados);
  await abrirSesion(nuevo.id);
  return { ok: true };
}

export async function cerrarSesion() {
  (await cookies()).delete(COOKIE_SESION);
}

export async function usuarioActual(): Promise<Usuario | null> {
  const s = await verificar((await cookies()).get(COOKIE_SESION)?.value);
  if (!s) return null;
  return (await usuarios()).find((u) => u.id === s.uid) ?? null;
}
