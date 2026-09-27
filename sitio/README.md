# Sitio de Julián Bermúdez · prototipo navegable

Prototipo del sitio **julianbermudez.com**. Se puede recorrer entero: el cuadro de bienvenida, la parte pública, el ingreso con cuenta, el espacio de cada persona, la masterclass en vivo con su sala protegida, la compra (de prueba, no cobra nada) y la app instalable.

La estética es la de los libros: tinta crema sobre negro, los grabados del ojo del Cap. 2 de cada libro, grano de impresión y movimiento lento (el ojo del encabezado mira y parpadea, el nombre se escribe con tinta, los epígrafes aparecen palabra por palabra). Con "reducir movimiento" activado en el dispositivo, nada se mueve.

Todo lo que falta escribir aparece marcado entre paréntesis y terminado en «a definir»: **«(Texto a definir)»**, **«(Texto acerca de Julián, a definir)»** o **«(Texto acerca del libro, a definir)»**. No hay frases, enseñanzas ni testimonios inventados. Las únicas frases suyas son textuales de los libros (ver «Frases» más abajo). Las fotos de Julián ya están, en blanco y negro; los videos son espacios vacíos, listos para el material real.

---

## 1. Cómo verlo en tu computadora

Hace falta tener instalado **Node.js** (versión 20 o más nueva, se baja de nodejs.org).

1. Abrí una terminal en la carpeta `sitio`.
2. La primera vez, instalá lo necesario:
   ```
   npm install
   ```
3. Encendé el sitio:
   ```
   npm run dev
   ```
4. Abrí en el navegador: **http://localhost:3000**

Para apagarlo, en la terminal apretá `Ctrl + C`.

## 2. Cuentas de prueba

Están también a la vista en la página **Ingresar**, con un botón para entrar directo.

| Cuenta | Mail | Clave | Qué ve |
|---|---|---|---|
| Sin compras | sincompras@demo.com | demo1234 | Su espacio vacío, con el camino para comprar |
| Con la masterclass | comprador@demo.com | demo1234 | Masterclass, audios por tema y encuentro de preguntas |
| Cuenta de Julián (agenda), **solo en tu computadora** | julian@demo.com | demo1234 | El panel **Mi espacio → Agenda** de la Masterclass 1 a 1 |

La cuenta demo de Julián ve el nombre, el mail y la nota de todas las personas que reservaron, así que **está apagada salvo que la enciendas a propósito**: creá en la carpeta `sitio` un archivo `.env.local` con la línea `JB_ADMIN_DEMO=1` y volvé a arrancar con `npm run dev` (ese archivo no se sube al repositorio; las pruebas automáticas ya la encienden solas). Sin esa variable no aparece en Ingresar y, aunque alguien entre con ella, no ve la agenda. En el sitio publicado, Julián entra con su cuenta privada (ver la sección 6).

También podés crear una cuenta nueva y "comprar" con el botón **Pagar (simulado)**.

Quién ve qué:

- **Sin cuenta:** todo lo público. Si entra a `/mi-espacio`, lo manda a Ingresar con un aviso.
- **Cuenta sin compras:** su espacio vacío, con el camino para comprar.
- **Compró la masterclass:** masterclass, audios por tema y encuentro de preguntas.
- **Compró una entrada privada:** solo esa conferencia, con su link para entrar.
- **Reservó un directo en vivo:** solo ese directo, en su sala.
- **Reservó una Masterclass 1 a 1:** ese encuentro, con su link de videollamada y el botón para agregarlo al calendario.
- **Cuenta de Julián:** todo lo de una cuenta más el panel de la agenda. Lo decide el servidor: la cuenta privada de `ADMIN_EMAIL` o, solo con `JB_ADMIN_DEMO=1`, la demo marcada `admin` en `data/usuarios.json`.

## 3. Cambiar precios, fechas y textos

Todo está en **un solo archivo**: `content/config.ts`. Se abre con cualquier editor de texto.

- **Precios:** en `precios`: masterclass grabada USD 20 y conferencia privada USD 3 (los dos "a definir"); el libro digital y la Masterclass 1 a 1 todavía sin monto (`monto: 0`, se muestran como precio a definir). Los directos en vivo son a voluntad (ver `enVivo`). Cuando estén confirmados, cambiá `aDefinir: true` por `aDefinir: false` y desaparece la aclaración.
- **Fechas y lugares:** en `conferencias` y en `encuentro`.
- **Textos que faltan:** aparecen como «(Texto a definir)» (o «(Texto acerca de Julián, a definir)», «(Texto acerca del libro, a definir)»). Reemplazalos por el texto entre comillas en `content/config.ts`.
- **Legales:** en `content/legales.ts` (privacidad y reembolsos ya tienen un borrador; revisalos con un abogado y completá los datos «a definir»).
- **Redes:** en `redes` (Instagram, YouTube y Spotify). Para sumar otra, agregá su link.
- **Frases de los epígrafes:** en `content/frases.ts`. Son textuales de los libros, verificadas palabra por palabra, y rotan: cada vez que se entra a una página aparece otra (con el nombre del libro), y «Otra frase» trae la siguiente. En la primera visita cada página muestra la suya. Para sumar una, copiala exacta del manuscrito.
- **Yo Da, la guía del sitio:** sus respuestas están en `content/yosoy.ts` (ver la sección 12).
- **Música de fondo:** los temas salen de la playlist de Julián en Spotify (`content/musica.ts`). Para actualizarla: `python3 herramientas/musica_playlist.py`.
- **Fotos:** los originales van en `diseño/fotos/` y `python3 herramientas/fotos_web.py` hace las versiones web. Cada foto se ubica con el componente `Foto` (retrato de chef y doble exposición en «Quién es», con el trofeo de El Gran Premio de la Cocina y la de emplatando; en movimiento, en Masterclass; la mirada, antes del cierre del inicio).
- **Quién es Julián:** en `inicio.quienEs` y `inicio.trayectoria` (datos de fuentes públicas, a confirmar con él).
- **Masterclass 1 a 1:** en `sesiones` (nombre, horarios fijos de cada semana, duración, link de la videollamada) y su precio en `precios.sesionPrivada`. Los horarios sueltos y los bloqueos los carga Julián desde su panel (ver la sección 6).
- **Masterclass (Julián en vivo):** en `enVivo`: los directos (fecha y tema), el mínimo (`minimo: 1`), los montos sugeridos (`sugeridos`) y el máximo por pago.
- **Cuadro de bienvenida:** en `umbral`: el aviso de espacio exclusivo, la bienvenida y el texto del botón. Aparece una vez por visita.
- **Nombre:** en `sitio.nombre` y `sitio.nombreCorto` ("Julián Bermúdez", con tilde, como en los libros).

Con `npm run dev` encendido, al guardar el archivo el navegador se actualiza solo.

Los colores y las tipografías están en `app/globals.css` (al principio, en "Tokens").

## 4. La app instalable

El sitio se instala como app en cualquier sistema, sin tiendas, con **un solo botón: «Instalar la app»** (arriba en el menú, en el menú del celular, en el aviso de las primeras visitas, en /app y en Yo Da). El botón detecta el sistema y el navegador y hace lo que corresponde:

- **Chrome, Edge o Android:** abre directo la ventana de instalación del navegador.
- **iPhone y iPad:** abre una guía animada que señala dónde está **Compartir** y lleva a **Agregar a pantalla de inicio**.
- **Mac con Safari:** la guía apunta a **Archivo → Agregar al Dock**.
- **Desde Instagram, Facebook o TikTok** (su navegador interno no instala): en Android abre el sitio en Chrome; en iPhone, en Safari. Al llegar, la guía se abre sola para terminar.
- **Firefox de computadora** (no instala apps web): ofrece copiar el link para abrirlo en Chrome, Edge o Safari.
- **Ya instalada:** el botón desaparece.

El aviso de las primeras visitas aparece una vez; si la persona lo cierra, no vuelve por 30 días. La página **/app** tiene además los pasos de cada sistema.

Sin internet, la app abre las páginas públicas ya visitadas y, si no, muestra "Sin conexión". **El espacio privado nunca queda guardado en el dispositivo.**

> La instalación y el modo sin internet funcionan solo con el sitio publicado en **https** (o en localhost). Para probar el modo sin conexión a mano: abrí el sitio, navegá un poco, apagá el wifi y recargá.

## 5. La masterclass en vivo y su protección

Un directo por semana, a voluntad desde USD 1. Quien reserva entra a su sala en **Mi espacio → En vivo**. En el prototipo la sala ya tiene funcionando:

- **Sin link para compartir:** la sala se abre solo con la cuenta que reservó; el servidor da un permiso firmado que vence en minutos (`lib/streaming.ts`).
- **Una pantalla a la vez:** si se abre en otro dispositivo o pestaña, la primera se pausa sola (`lib/salas.ts`).
- **Marca de agua con el mail** de quien mira, que se mueve por la imagen: si alguien filma la pantalla, se sabe quién fue.
- **Sin descarga, sin botón derecho, sin arrastrar** dentro de la sala.

Lo que falta es la transmisión real: un servicio de video con **DRM** (cifrado Widevine / FairPlay / PlayReady). Ver la sección 10.

## 6. Masterclass 1 a 1 y la agenda de Julián

Las antes llamadas «sesiones privadas» ahora son la **Masterclass 1 a 1**: un encuentro uno a uno con Julián, por videollamada. Está dentro de la sección Masterclass, en **/masterclass/1-a-1** (con las pestañas En vivo · 1 a 1 · Grabada). La vieja dirección `/sesiones` lleva ahí sola.

**Cómo entra Julián.**

- **En el sitio publicado (el link que se le manda):** con una cuenta privada que se define en dos variables de entorno, `ADMIN_EMAIL` (su mail) y `ADMIN_CLAVE` (con la misma política que las cuentas nuevas: 10 caracteres o más, que no sea de las más usadas ni el mail; si no la cumple, la cuenta no entra). No aparece en ninguna página ni en el repositorio: la clave se le pasa a Julián por otro lado. Con `ADMIN_TOTP_SECRET`, además pide el código de 6 dígitos de una app de autenticación (ver `SEGURIDAD.md`). Opcional: `ADMIN_NOMBRE` (por defecto, «Julián»).
- **En tu computadora, para probar:** con `julian@demo.com` / `demo1234`, solo si el sitio arrancó con `JB_ADMIN_DEMO=1`. **Nunca pongas `JB_ADMIN_DEMO` en el sitio publicado:** cualquiera que abra Ingresar entraría como Julián y vería las reservas de todos.

En su espacio, **Agenda** aparece primera en el menú y arriba de todo en el inicio, con cuántas reservas hay por delante. Nadie más la ve, y si otra cuenta escribe la dirección `/mi-espacio/agenda` le dice que la página no existe. Cada cambio se vuelve a verificar en el servidor: no alcanza con tocar el navegador.

**Qué ve en el panel:**

- **Próximas reservas:** fecha y hora, nombre y mail de quien reservó, lo que contó al reservar y **Entrar a la sala**. Cada reserva sigue ahí hasta que termina el encuentro (no cuando empieza), igual que el link de la videollamada en el espacio de quien reservó: si alguien llega unos minutos tarde, tiene con qué entrar.
- **Agregar un horario:** elige fecha y hora (en hora de Argentina) y aparece enseguida, libre, en el calendario público; el calendario del panel va solo a ese día. No deja cargar horarios que ya pasaron, de más de un año adelante, con menos de `sesiones.anticipacionHoras` horas por delante (12 por ahora), ni uno que se pise con otro (a menos de `sesiones.duracionMinutos` minutos). Si algo sale mal, lo cargado no se borra.
- **Bloquear un día u horario:** para lo que ya sabe que no va a poder, aunque falte mucho (unas vacaciones dentro de dos meses). Con fecha y hora bloquea ese horario; con solo la fecha, todos los de ese día. Vale también para los horarios fijos que todavía no están a la vista. Las reservas ya hechas no se tocan.
- **Liberar una reserva:** en cada próxima reserva, **Liberar** (pide confirmación) la cancela con reembolso total por el mismo medio del pago (simulado en el prototipo) y el horario vuelve a quedar libre.
- **Calendario:** cada horario con su estado (libre, reservado o bloqueado). Un horario libre se **bloquea** (deja de verse y no se puede reservar, ni entrando directo al link, ni si alguien ya tenía el pago abierto); uno bloqueado se **desbloquea** (o se vuelve a cargar desde «Agregar un horario»); los horarios sueltos que agregó él también se pueden **quitar** (si coincide con un horario fijo de la semana, queda bloqueado). Las reservas no se tocan desde acá.

**Reprogramar y cancelar (quien reservó).** En **Mi espacio → Masterclass 1 a 1**, cada encuentro tiene **Reprogramar** (elige otro horario libre, en un solo paso) y **Cancelar** (reembolso total por el mismo medio del pago), siempre con más de 48 horas de aviso (`HORAS_CAMBIO` en `lib/sesiones.ts`, la política de reembolsos). Un encuentro cancelado deja de aparecer como próximo y queda en el historial de compras de la cuenta, marcado como cancelado.

**Anticipación.** El público ve y reserva solo los horarios que empiezan dentro de más de `sesiones.anticipacionHoras` horas: así Julián se entera a tiempo de cada reserva.

**Dos pagos a la vez.** Si dos personas pagan el mismo horario casi al mismo tiempo, el servidor registra solo la primera; la otra ve «Ese horario se acaba de reservar». En producción esto lo asegura la base de datos (una restricción única por horario).

**De dónde salen los horarios.** De dos lugares que se suman:

1. Los fijos de cada semana, en `content/config.ts` → `sesiones.dias` (día de la semana y hora), repetidos las próximas `sesiones.semanas` semanas.
2. Lo que carga Julián, guardado en `data/agenda.json`: `extras` (horarios que se suman) y `bloqueados` (que se quitan). Cada horario se anota como `AAAA-MM-DDTHH-MM`, en hora de Argentina.

**Calendario del teléfono.** En **Mi espacio → Masterclass 1 a 1**, cada reserva tiene dos botones:

- **Agregar a mi calendario:** abre un archivo `.ics` (iPhone, Mac, Outlook y la mayoría de las computadoras lo agregan como evento), con el link de la sala y un aviso 30 minutos antes. Se sirve para abrir, no para guardar como archivo, así el iPhone muestra «Agregar al calendario»; conviene confirmarlo en un iPhone real.
- **Google Calendar:** abre Google Calendar en la web con el evento listo. Es el camino para Android, cuya app de Google Calendar no abre archivos `.ics`.

Solo los puede usar quien reservó; si la sesión se venció, lleva a Ingresar. Julián tiene en su panel **Bajar las reservas a mi calendario**, con todas las reservas que vienen y el nombre, el mail y la nota de cada una. Es una foto de ese momento: si entra una reserva nueva, lo baja de nuevo (el link de suscripción que se actualiza solo está en la sección 10). La duración del evento es `sesiones.duracionMinutos` (60 por ahora; el texto visible sigue diciendo «Duración a definir»).

## 7. Los libros, también digitales

Idea de Lucas (anotada y ya armada en el prototipo):

- **Quien compra la versión digital** la tiene en **Mi espacio → Biblioteca** y la lee ahí, como la masterclass: capítulo por capítulo, con el grabado de cada uno y los colores de cada libro (Receta en negro, Pensamiento en blanco, Biografía en azul marino).
- **Quien compra el libro impreso** encuentra en la última página un **código único**. Lo carga en **julianbermudez.com/canjear** (el libro trae un QR que lleva ahí) y el digital queda en su cuenta.
- Cada código sirve **una sola vez y para una sola cuenta**. Códigos de prueba: `REC-7K3M-Q9TD-4HXA`, `PEN-4TQ8-HX2K-9MWB`, `BIO-9VEH-5KMT-2QZR` (se pueden usar una vez cada uno).
- El lector no deja copiar ni seleccionar el texto y lleva el mail de quien lee como marca de agua.

**¿Es factible? Sí.** Es el mismo sistema de accesos que ya usa el sitio. Para producción hace falta:

1. **Códigos distintos en cada ejemplar.** La imprenta los imprime como "datos variables" (cada libro con el suyo) o se pegan como sticker o tarjeta raspable. `lib/codigos.ts` ya genera lotes (`generarLote`) para mandar a la imprenta.
2. ~~**Límite de intentos** al canjear~~: **hecho** (`lib/codigos.ts` y `LIMITES.canjear`: desde el 3.er código equivocado pide la verificación y con 20 en un día se cierra el canje de esa cuenta).
3. **El texto del libro** cargado desde el manuscrito final (hoy dice `[TEXTO DEL LIBRO…]`).
4. Aceptar que, como con cualquier libro digital, una captura de pantalla siempre es posible: la marca de agua con el mail dice de quién era.

### Zonas horarias

Julián carga y ve su agenda en **hora de Argentina**. Cada visitante ve los horarios **en su propia hora** (la de su dispositivo, o la que elija en «Ves los horarios en»), con la hora de Julián al lado de cada horario, y el calendario agrupa cada horario en el día que le toca en su zona (un martes a las 18 de Argentina es miércoles a la mañana en Japón). Lo mismo en la confirmación de compra y en Mi espacio. El horario de verano de cada país se calcula solo, y el archivo de calendario (`.ics`) va en UTC, así que cada calendario lo muestra en la hora de quien lo abre. Todo está en `lib/zona.ts`.

## 8. Pruebas automáticas

```
npm run build
npm test
```

Recorren solos, en tamaño celular y computadora: el cuadro de bienvenida, el aviso al entrar sin sesión, crear cuenta, ingresar y cerrar sesión, la cuenta sin compras, la compra de la masterclass (con progreso y preguntas), la compra de una entrada privada (y que no habilite nada más), la reserva de un directo a voluntad (con el mínimo), la marca de agua, la sala en una sola pantalla, el canje del código del libro (una sola vez), la compra y lectura del libro digital, la Masterclass 1 a 1 (reserva, horario ocupado para los demás, la dirección vieja `/sesiones`) y la agenda de Julián (agregar, quitar y bloquear horarios, también con anticipación; que un bloqueo frene un pago ya abierto; ver las reservas con su nota y su sala; que otra cuenta no entre al panel; que el `.ics` y el link de Google Calendar de una reserva sean solo de quien la hizo, y que el panel entre en un celular de 360 px), los formularios públicos, la seguridad (encabezados y CSP con nonce, la verificación después de varios intentos, el bloqueo, las trampas para bots, que lo escrito no se borre, que `volver` no saque del sitio, el panel de seguridad, la música con la CSP), que ninguna página se desborde en el celular, la app instalable (el botón único en cada sistema, también desde Instagram), las frases que rotan, las zonas horarias (España, Japón, México y Nueva York), Yo Da y la música de fondo. Usan datos de prueba aparte: no tocan los del prototipo.

## 9. Subirlo para tener un link y mostrarlo

La forma más simple es **Vercel** (tiene plan gratis):

1. Entrá a vercel.com con tu cuenta de GitHub.
2. **Add New → Project** y elegí el repositorio `jb`.
3. En **Root Directory** poné `sitio`. Lo demás se deja como viene.
4. En **Environment Variables** agregá:
   - `SESSION_SECRET` (**obligatoria**): 32 caracteres o más al azar (es la llave de las sesiones y de las huellas de seguridad). Para generarla: `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`. Sin ella el sitio anda con una llave pública de prueba y la cuenta de Julián no entra.
   - `ADMIN_EMAIL` y `ADMIN_CLAVE`: el mail y la clave de la cuenta de Julián (10 caracteres o más, ni común ni el mail). Es la única forma de entrar a su agenda en el link publicado; la clave se le pasa a él aparte, nunca en el sitio.
   - Opcionales, pero recomendadas (qué mejora cada una, en `SEGURIDAD.md`): `ADMIN_TOTP_SECRET` (el código de 6 dígitos de Julián), `TURNSTILE_SITE_KEY` y `TURNSTILE_SECRET_KEY` (la verificación de Cloudflare en lugar de la prueba en el navegador), `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` (límites compartidos entre servidores; para el sitio publicado, obligatorias en la práctica), `JB_DESAFIO_BITS` (dificultad de la prueba en el navegador, 16 por defecto) y `JB_LIMITES_FACTOR` (multiplica los topes de intentos).
   - **No** agregues `JB_ADMIN_DEMO` ni `JB_PRUEBAS`: son solo para tu computadora y las pruebas (el sitio las ignora en producción, pero no tienen que estar).
5. **Deploy**. En un par de minutos te da un link del estilo `algo.vercel.app` para mandarle a Julián.

Cada vez que se sube un cambio al repositorio, el link se actualiza solo.

Importante para la demo: en Vercel las cuentas y compras nuevas se guardan en un espacio temporal y pueden borrarse cada tanto. Las cuentas de prueba siempre están, y la de Julián (la de `ADMIN_EMAIL`) también, aunque ya haya datos guardados de antes. Para que no se borre nada, se puede usar un servidor propio (Render, Railway o un VPS) con disco: ahí se corre `npm install`, `npm run build` y `npm start`, y se define `DATA_DIR` con una carpeta que se conserve.

## 10. Qué falta para que funcione de verdad

Este prototipo **no está listo para producción**. Falta:

1. **Login real:** reemplazar `lib/auth.ts` por un servicio de cuentas (con recuperación de clave, verificación de mail y protección contra abusos).
2. **Pagos reales** en `lib/payments.ts`. El acceso se habilita solo cuando el medio de pago confirma el pago (webhook), nunca al volver del checkout. Para tickets chicos e internacionales conviene un medio sin costo fijo por pago (Mercado Pago o dLocal Go para Latinoamérica) y PayPal para el resto; los costos fijos de USD 0,30 a 1 se comen buena parte de un pago de USD 1.
3. **Video protegido:** los directos, con un servicio que tenga DRM en vivo (por ejemplo Mux) más la marca de agua y la pantalla única que ya tiene el sitio; la masterclass grabada y los audios, en un servicio con reproducción firmada y DRM. Ninguna protección impide filmar la pantalla con otra cámara: para eso está la marca de agua.
4. **Mails:** confirmación de compra, recordatorio de conferencias, inscripción a la lista y aviso del encuentro. Para la Masterclass 1 a 1, el mail de confirmación puede llevar el `.ics` adjunto y avisarle a Julián de cada reserva nueva.
5. **Agenda de la Masterclass 1 a 1:** la cuenta de Julián con un login real (y, si se quiere, conectar su Google Calendar para bloquear solo lo que ya tiene ocupado); un link de suscripción firmado para que su calendario se actualice solo (hoy baja el `.ics` a mano); reembolsos reales al cancelar (hoy son simulados); salas de videollamada reales con un link distinto por encuentro.
6. **Panel de contenido:** para cargar fechas, textos, videos y audios sin tocar código.
7. **Base de datos:** reemplazar los archivos de `data/` por una base de datos real.
8. **Dominio y hosting:** apuntar julianbermudez.com al servidor, con https.
9. **Textos legales:** términos, privacidad y reembolsos, redactados por un profesional.
10. **Contenido de Julián:** todos los «(Texto a definir)», fotos reales y videos.

## 11. Seguridad

Todo lo de seguridad (qué protege el sitio, qué no puede frenar solo, qué activar en Vercel y la lista de chequeo antes de publicar) está en **[`SEGURIDAD.md`](SEGURIDAD.md)**. Lo principal:

- **Límites de intentos** en cada formulario y ruta (`lib/limite.ts`) y, después de varios intentos, la **verificación «Confirmá que sos una persona»**: Cloudflare Turnstile si están sus claves, o una prueba que resuelve el navegador si no. Más trampas invisibles para bots.
- **Política de contenidos (CSP) con nonce** en cada página (`middleware.ts`). Por el nonce, **todas las páginas son dinámicas** (se arman en cada pedido).
- **Sin Upstash, los límites viven en la memoria de cada servidor** (aproximados en Vercel): para el sitio publicado, cargar Upstash.
- **No poner Cloudflare como proxy delante de Vercel** (todos compartirían el mismo cupo). Contra los ataques de volumen, el Firewall de Vercel.
- **Panel de seguridad** para Julián en **Mi espacio → Seguridad** (`/mi-espacio/seguridad`).
- `public/.well-known/security.txt`: antes de publicar, completar `Contact: mailto:` con el mail real y renovar `Expires` cada año.

## 12. Detalles del sitio

- **Yo Da, la guía:** el ojo pixelado (con dos orejas anchas en punta: el guiño de «yo-da») que se hace presente abajo a la derecha unos segundos después de entrar, con un saludo breve la primera vez. Habla con las palabras dadas vuelta y un tono místico, pero da datos concretos: la agenda (los próximos horarios libres en la hora de cada persona), la masterclass, los libros, las conferencias, la app, la cuenta y los reembolsos, con opciones para tocar o escribiendo. Con sesión, saluda por el nombre; para los problemas de una compra, un encuentro o el acceso, primero pide ingresar o crear la cuenta. No habla por Julián ni enseña en su nombre. Si no entiende, deriva a una persona. Sus textos están en `content/yosoy.ts`; más adelante se le puede conectar una IA (por ejemplo Claude) con las mismas reglas. El nombre va separado, «Yo Da» (yo doy); igual conviene que el abogado lo mire, porque «Yoda» es marca de Lucasfilm (se cambia en `nombreBot`).
- **Música de fondo:** el botón de abajo a la izquierda. Temas al azar de la playlist de Julián («The Way It Is»), con el reproductor oficial de Spotify: suena solo si la persona lo pide y sigue al cambiar de página. El volumen se maneja desde el dispositivo (Spotify no deja cambiarlo desde afuera) y, sin sesión abierta en Spotify, suenan 30 segundos de cada tema.
- **Sonidos:** cada clic suena suave (cuenco, campana o toque, sintetizados en el navegador: `lib/sonido.ts`). Se silencian con el interruptor del pie o del menú del celular.
- **Emblemas:** los de cada capítulo flotan por la página (`components/Flotantes.tsx`, con los tres clavos y el surf) y acompañan cada sección del menú.
- **Botón de arrepentimiento:** al pie de todas las páginas (`/arrepentimiento`), como pide la ley.
- **Masterclass grabada:** dentro de Masterclass (`/masterclass/grabada`), con sus módulos y audios.
- **Consultas:** si Yo Da no resuelve algo, ofrece dejar una consulta a una persona (con cuenta); cada quien ve las suyas en **Mi espacio → Consultas**.

## Mapa de carpetas

| Carpeta | Qué hay |
|---|---|
| `content/config.ts` | Precios, fechas y textos |
| `content/frases.ts`, `content/yosoy.ts`, `content/musica.ts` | Frases de los libros, respuestas de Yo Da y temas de la música |
| `app/` | Las páginas del sitio |
| `app/mi-espacio/` | El área de cada persona |
| `components/` | Piezas que se repiten (el ojo, el cuadro de bienvenida, la sala, formularios, aviso de la app) |
| `public/grabados/` | Los grabados del ojo de los libros, en la tinta de cada uno |
| `lib/auth.ts` | Login (simulado), política de claves y código de 6 dígitos de Julián |
| `lib/limite.ts`, `lib/proteger.ts`, `lib/desafio.ts`, `lib/trampas.ts`, `lib/registro-seguridad.ts`, `middleware.ts` | Seguridad: límites, verificación, trampas para bots, registro y CSP (ver `SEGURIDAD.md`) |
| `lib/payments.ts` | Compra (simulada) y precio a voluntad, con notas de Mercado Pago y Hotmart |
| `lib/streaming.ts`, `lib/salas.ts` | Permiso firmado y pantalla única de los directos |
| `lib/access.ts` | Quién puede ver qué |
| `lib/sesiones.ts`, `lib/agenda.ts`, `lib/ics.ts` | Horarios y reservas de la Masterclass 1 a 1, el panel de Julián y los archivos de calendario |
| `lib/codigos.ts` | Códigos únicos de los libros impresos |
| `lib/zona.ts` | Zonas horarias (la de Julián y la de cada visitante) |
| `lib/instalar.ts`, `lib/plataforma.ts` | El botón único de instalar la app |
| `public/fotos/` | Fotos de Julián (versiones web) |
| `data/` | Cuentas, compras y agenda de prueba (`agenda.json`) |
| `public/sw.js` | Lo que hace que la app funcione sin internet |
| `tests/` | Pruebas automáticas |
