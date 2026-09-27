# Versión de referencia (antes de la transformación visual)

La versión del sitio publicada en https://julianbermudez.vercel.app el 27/09/2026, antes de la
transformación visual, es el commit **`1c2c801`** de la rama `claude/gracious-bell-s59jtz`
(«Yo Da: piedra, papel o tijera a 5 o a 10»). Es la referencia: nada del rediseño la borra.

Cómo volver a ella si el rediseño no convence:

- **En Vercel (lo más rápido, sin tocar código):** Deployments → el deployment del commit
  `1c2c801` → «Promote to Production» (o *Instant Rollback*). Queda publicado al instante.
- **En el código:** el rediseño se hace en commits separados, por fases, después de esta
  referencia. Para deshacerlo se revierten esos commits (`git revert`), sin reescribir la historia.
  Para ver la versión de referencia en la computadora: `git checkout 1c2c801`.

Todo lo que el rediseño cambie queda descrito en `sitio/DISENO.md` (el sistema visual) y en los
mensajes de cada commit.
