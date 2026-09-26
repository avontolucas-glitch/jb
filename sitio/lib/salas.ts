/**
 * Una sola pantalla a la vez: al abrir la sala se entrega un turno nuevo;
 * la pantalla que tenía el turno anterior se pausa sola.
 */
import { leer, escribir } from "./db";

type Turno = { usuario: string; directo: string; turno: string; desde: string };

export async function abrirSala(uid: string, directo: string) {
  const turnos = (await leer<Turno[]>("salas")).filter((t) => !(t.usuario === uid && t.directo === directo));
  const turno = crypto.randomUUID();
  turnos.push({ usuario: uid, directo, turno, desde: new Date().toISOString() });
  await escribir("salas", turnos);
  return turno;
}

export async function turnoVigente(uid: string, directo: string, turno: string) {
  const turnos = await leer<Turno[]>("salas");
  return turnos.some((t) => t.usuario === uid && t.directo === directo && t.turno === turno);
}
