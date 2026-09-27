# Trabajo en curso, en pausa (27/9/2026, pedido de Lucas)

Nada de esto está en el sitio publicado: son respaldos para retomarlo sin perderlo.

- `cuentas-en-curso.patch`: las cuentas reales (base de datos, mails de Yo Da, confirmar y recuperar
  la clave, cumpleaños), la moderación y los avisos de las masterclass. Ya estaban construidas,
  probadas y revisadas; se pausó mientras se hacían los arreglos finales de la revisión, así que
  todavía no pasó la prueba completa. Para retomarlo: `git apply --binary pendiente/cuentas-en-curso.patch`
  y después terminar los arreglos, armar el sitio y correr todas las pruebas antes de subirlo.
- `rediseno-fase1.bundle`: el rediseño «Pliego» (sitio/DISENO.md), fase 1 completa (rama `rediseno`).
  Para recuperarlo: `git fetch pendiente/rediseno-fase1.bundle rediseno:rediseno`.
- `rediseno-fase2-parcial.patch`: lo que se había avanzado de la fase 2 (a medias; de referencia).
