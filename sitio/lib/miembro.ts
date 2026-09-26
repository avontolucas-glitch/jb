import { redirect } from "next/navigation";
import { usuarioActual } from "./auth";
import { accesos } from "./access";

/** Usuario y accesos para las páginas de /mi-espacio (el middleware ya filtró la cookie). */
export async function miembro() {
  const u = await usuarioActual();
  if (!u) redirect("/ingresar?aviso=sesion");
  return { u, a: await accesos(u.id) };
}
