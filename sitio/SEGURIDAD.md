# Seguridad del sitio de Julián Bermúdez

Qué protege el sitio, cómo lo hace, qué no puede frenar solo y qué hay que activar antes de salir al público. La primera parte es para cualquiera; al final hay un apartado técnico.

Todo funciona **sin configurar nada** (así se puede probar el prototipo), y mejora cuando se cargan las variables de la sección 4.

---

## 1. Lo que ya hace el sitio

### Límites de intentos

Cada cosa que se puede hacer en el sitio tiene un cupo: ingresar, crear una cuenta, canjear el código del libro, sumarse a la lista, pedir el arrepentimiento, mandar una pregunta, reservar, pedirle algo a Yo Da, etc. Se cuenta por red (IP), por cuenta, por mail y, en algunos casos, para todo el sitio junto.

- Primero, nada: una persona normal nunca choca con un límite.
- Si se repite demasiado, aparece la **verificación** («Confirmá que sos una persona»).
- Si sigue, se frena un rato con un aviso sereno: «Hubo muchos intentos seguidos. Probá de nuevo en unos minutos.» Nunca se bloquea un mail entero (así nadie puede dejar afuera a Julián ni a otra persona a propósito).

La tabla completa está en la sección 7.

### La verificación «Confirmá que sos una persona» (tipo CAPTCHA)

Aparece **solo cuando hace falta**, no de entrada:

- **Ingresar:** desde el 3.er intento fallido (mismo mail y misma red) o si la red ya tuvo varios fallos. Con el mail de Julián, desde el 2.º.
- **Crear cuenta:** a partir de la 2.ª cuenta nueva desde la misma red en una hora, o después de varios datos equivocados (un mail que ya tenía cuenta pesa como 3).
- **Canjear el código del libro:** desde el 3.er código equivocado en una hora.
- **Lista de avisos, preguntas, notas, pagos y consultas a Yo Da:** cuando se repiten muchas veces seguidas.
- **Arrepentimiento:** el primer pedido **nunca** pide verificación (lo exige la ley); los siguientes desde la misma red, sí.
- **Todo el sitio:** si hay una ola de fallos (por ejemplo 200 ingresos fallidos en 10 minutos), se pide a todos por un rato, y la verificación se vuelve más difícil mientras dure.
- **Formularios mandados en menos de un segundo y medio** (nadie escribe tan rápido): se pide la verificación.

Hay dos formas, y el sitio elige solo:

1. **Con Cloudflare Turnstile** (recomendado, gratis): la casilla de Cloudflare, que casi siempre se resuelve sola sin imágenes ni semáforos. Hace falta cargar dos claves (sección 4).
2. **Sin Turnstile:** una prueba que resuelve el navegador (un cálculo de uno o dos segundos, como hacen ALTCHA o Friendly Captcha). Frena los bots baratos y encarece el spam masivo, pero no a alguien con muchas computadoras: por eso Turnstile es lo recomendado.

Lo que la persona escribió **no se borra** cuando aparece la verificación, y el botón de enviar espera a que termine.

### Trampas contra bots

Todos los formularios tienen un campo invisible («Sitio web») que una persona no ve ni completa y un bot sí, y una marca del tiempo que pasó entre que se mostró el formulario y se envió. Si un bot cae en la trampa, se le responde como si todo hubiera salido bien, pero no se guarda nada y sus intentos cuentan triple. La única excepción es el **arrepentimiento**: como un gestor de claves podría completar «Sitio web» sin querer, ese pedido se guarda igual, marcado para revisar, así nadie se queda con un código de seguimiento de un pedido que no existe.

### Encabezados y política de contenidos

Cada página sale con los encabezados que usan los sitios serios: HTTPS obligatorio (HSTS), no se puede meter el sitio dentro de otro (contra el «clickjacking»), no se adivinan tipos de archivo, no se piden cámara, micrófono ni ubicación, y una **política de contenidos (CSP)** que solo deja correr los scripts del propio sitio (cada página lleva un «nonce» nuevo) más los de Spotify y Cloudflare. Si alguien lograra meter un script en una página, el navegador no lo ejecutaría.

### Claves y sesiones

- Las claves nunca se guardan: se guarda una huella con PBKDF2-SHA256 de 600.000 vueltas (lo que recomienda OWASP). Las cuentas nuevas piden al menos 10 caracteres, que no sea una de las más usadas ni el mail.
- Los mensajes de error nunca dicen si un mail tiene cuenta al ingresar, y el tiempo de respuesta tampoco lo delata.
- La sesión vive en una cookie que el navegador no deja leer a ningún script, firmada con `SESSION_SECRET`, que dura 7 días y se renueva sola (hasta 30). En **Mi espacio → Cuenta** está «Cerrar sesión en todos los dispositivos».
- Si el servidor está saturado de intentos de ingreso, responde «muchos intentos» sin hacer el cálculo caro.

### La doble verificación de Julián

La cuenta de Julián (la de `ADMIN_EMAIL`) ve las reservas de todos, así que tiene más cuidado:

- La clave de `ADMIN_CLAVE` tiene que cumplir la misma política que las cuentas nuevas (10 caracteres o más, ni común ni el mail). Si no la cumple, la cuenta **no entra** hasta cambiarla, y el panel lo avisa.
- Con `ADMIN_TOTP_SECRET`, después de la clave pide el **código de 6 dígitos** de una app de autenticación (Google Authenticator, Authy, 1Password…). Cada código sirve una sola vez. Con 10 códigos equivocados en una hora, desde cualquier red, el código se cierra por una hora y queda una alerta en el panel.
- Mientras falte `SESSION_SECRET` en el sitio publicado, la cuenta de Julián no entra (con la llave pública de respaldo, cualquiera podría hacerse pasar por él).

### Registro y panel de seguridad

Se lleva un registro de los ingresos, las cuentas creadas, los intentos fallidos, las verificaciones, los bots, los bloqueos y las alertas, **sin guardar IPs ni mails en claro** (solo una huella cifrada). Se guardan los últimos 3000 eventos. Julián lo ve en **Mi espacio → Seguridad** (`/mi-espacio/seguridad`): el resumen de las últimas 24 horas, cómo está configurado el sitio y los últimos eventos.

### Yo Da no se satura

Yo Da contesta en el navegador, sin gastar nada del servidor. Si alguien le escribe demasiado seguido, dice «Hmm. Despacio. Respirar, primero debés.» y el campo queda en pausa unos segundos (lo escrito no se pierde). Recorrer el menú tocando opciones no cuenta como spam. Las consultas a una persona desde Yo Da tienen su propio límite (3 por día por cuenta), y los horarios que muestra salen de una ruta con cupo propio.

---

## 2. Lo que el sitio NO puede frenar solo

- **Ataques de volumen (DDoS):** miles de computadoras pidiendo páginas a la vez. El sitio frena a cada red por separado, pero eso pasa **después** de que el pedido llegó y se pagó. Contra eso está el **Firewall de Vercel** (sección 3), que corta antes.
- **Límites repartidos entre servidores:** sin Upstash, cada servidor de Vercel lleva su propia cuenta, y un ataque repartido entre varios tiene varias veces el cupo. **Para el sitio publicado, Upstash es obligatorio** (sección 4).
- **Alguien con la clave de otra persona:** si una persona usa la misma clave en otros sitios y se filtra, el sitio no lo puede saber. Para Julián está el código de 6 dígitos.
- **Filmar la pantalla:** ningún sitio lo impide; para eso está la marca de agua con el mail en los directos y en los libros.

---

## 3. Qué activar en Vercel, paso a paso

Los nombres de los menús de Vercel cambian cada tanto; si algo no aparece igual, buscá «Firewall» en el proyecto.

### 3.1 Reglas de límite por IP (Firewall)

1. Entrá al proyecto en vercel.com → pestaña **Firewall** → **Configure** (o **Rules**) → **+ New Rule**.
2. **Regla «Todo el sitio»:**
   - Nombre: `Límite general`.
   - Condición: **Request Path** · **starts with** · `/`.
   - Acción: **Rate Limit**, con **300 pedidos cada 60 segundos por IP** y, al pasarse, **Deny** (responde 429) o **Challenge**.
3. **Regla «Ingresar»:**
   - Nombre: `Límite de ingreso`.
   - Condición: **Request Path** · **equals** · `/ingresar` **y** **Method** · **equals** · `POST`.
   - Acción: **Rate Limit**, con **20 pedidos cada 60 segundos por IP** → **Deny**.
   - Si el plan permite más reglas, repetila para `/crear-cuenta`, `/canjear` y `/api/desafio`.
4. **Save** y **Publish** (las reglas se aplican enseguida, sin volver a publicar el sitio).

Según el plan de Vercel cambia cuántas reglas de límite se pueden tener; con una sola, usá la de «Todo el sitio».

### 3.2 Durante un ataque: Attack Challenge Mode

Si el sitio se pone lento y el panel de Vercel muestra un pico de tráfico raro: **Firewall → Attack Challenge Mode → Enable**. Mientras está activo, cada visitante pasa por una verificación de Vercel antes de ver el sitio (las personas pasan solas en un segundo; los bots, no). Apagalo cuando pase el ataque: si no, también frena a los buscadores.

### 3.3 Protección de bots

En **Firewall → Bot Management** (o **Managed Rules**), activá **Bot Protection** en modo **Challenge** (o **Log** primero, para ver qué frenaría). Opcional: el bloqueo de bots de IA que copian contenido.

### 3.4 Variables de entorno

En **Settings → Environment Variables**, para **Production** (y Preview, si se usa):

| Variable | Qué es | Obligatoria |
|---|---|---|
| `SESSION_SECRET` | La llave de las sesiones y de las huellas. 32 caracteres o más al azar. Para generarla: `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"` | **Sí.** Sin ella, el sitio usa una llave pública y la cuenta de Julián no entra |
| `ADMIN_EMAIL` | El mail de Julián | Sí, para su agenda |
| `ADMIN_CLAVE` | La clave de Julián: 10 caracteres o más, ni común ni el mail. Se le pasa aparte, nunca por el sitio | Sí, para su agenda |
| `ADMIN_TOTP_SECRET` | El secreto del código de 6 dígitos (sección 5) | Muy recomendada |
| `TURNSTILE_SITE_KEY` y `TURNSTILE_SECRET_KEY` | Las claves de Cloudflare Turnstile (abajo cómo sacarlas) | Recomendadas |
| `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` | Los límites compartidos entre todos los servidores (abajo cómo sacarlas) | **Sí**, para el sitio publicado |

**Nunca** cargues en Vercel `JB_ADMIN_DEMO` ni `JB_PRUEBAS`: son solo para la computadora y las pruebas automáticas (el sitio las ignora en producción, pero no tienen que estar).

**Cloudflare Turnstile (gratis, no hace falta mover el dominio a Cloudflare):**

1. Creá una cuenta en dash.cloudflare.com.
2. Menú **Turnstile** → **Add widget**.
3. Nombre: `julianbermudez.com`. **Hostnames:** `julianbermudez.com` y el dominio de Vercel (`algo.vercel.app`).
4. **Widget mode:** *Managed*. **Create**.
5. Copiá la **Site Key** en `TURNSTILE_SITE_KEY` y la **Secret Key** en `TURNSTILE_SECRET_KEY`.

**Upstash (gratis para empezar):**

1. En Vercel: **Storage** → **Marketplace** → **Upstash** → **Redis** → crear la base, en la región más cercana a la del proyecto. Vercel carga solas las variables (si las nombra `KV_REST_API_URL` y `KV_REST_API_TOKEN`, copiá sus valores en `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`).
2. O en upstash.com → **Create Database** → pestaña **REST API** → copiar `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`.

Después de cargar variables, **volvé a publicar** (Deployments → los tres puntos → Redeploy).

**No pongas Cloudflare como proxy delante de Vercel** (la nube naranja en el DNS): todos los pedidos llegarían con la IP de Cloudflare y todo el mundo compartiría el mismo cupo. Turnstile no lo necesita.

---

## 4. El código de 6 dígitos de Julián

1. En la carpeta `sitio`, con Node instalado:
   ```
   node scripts/totp-nuevo.mjs julian@sumail.com
   ```
2. El script muestra un **secreto** (letras y números) y el código de ahora.
3. Cargá el secreto en Vercel como `ADMIN_TOTP_SECRET` y volvé a publicar.
4. En el teléfono de Julián, en su app de autenticación: **Agregar cuenta** → **Ingresar una clave de configuración** → pegar el secreto (tipo: *basado en el tiempo*).
5. Compará el código de la app con el que mostró el script: tienen que coincidir.

El secreto no se guarda en ningún lado: pasáselo a Julián por un canal privado y borralo del chat. Si se pierde el teléfono, se genera otro y se vuelve a cargar.

---

## 5. Lista de chequeo antes de salir al público

- [ ] `SESSION_SECRET` cargada (32 caracteres o más, al azar).
- [ ] `ADMIN_EMAIL` y `ADMIN_CLAVE` cargadas; la clave cumple la política.
- [ ] `ADMIN_TOTP_SECRET` cargado y probado con el teléfono de Julián.
- [ ] Turnstile: `TURNSTILE_SITE_KEY` y `TURNSTILE_SECRET_KEY`, con el dominio real en Hostnames.
- [ ] Upstash: `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`.
- [ ] No están `JB_ADMIN_DEMO` ni `JB_PRUEBAS` en Vercel.
- [ ] Firewall de Vercel: la regla «Todo el sitio» (y la de ingreso, si se puede) publicadas; Bot Protection activo.
- [ ] Cloudflare **no** está como proxy delante de Vercel.
- [ ] En **Mi espacio → Seguridad**, todo dice «Con llave propia», «Activo», «Cloudflare Turnstile» y «Compartidos entre servidores (Upstash)».
- [ ] `public/.well-known/security.txt`: poner `Contact: mailto:` con el mail real y renovar `Expires` (como máximo, un año; anotarlo en el calendario).
- [ ] Probar el ingreso de Julián de punta a punta (clave y código) desde el celular.
- [ ] Las cuentas demo: decidir si quedan en el sitio publicado (su clave está a la vista) o se sacan de `data/usuarios.json`.

---

## 6. Apartado técnico

**Dónde está cada cosa**

| Archivo | Qué hace |
|---|---|
| `middleware.ts` | Límite global por IP («paginas» y «api», siempre en la memoria de la instancia), CSP con nonce, redirección de lo privado, `noindex` |
| `next.config.ts` | HSTS, nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy, COOP/CORP; tope de 100 KB por formulario |
| `lib/limite.ts` | La tabla `LIMITES`, ventana deslizante de dos cubetas, bloqueos, alertas globales y «un solo uso»; memoria o Upstash REST |
| `lib/proteger.ts` | Junta trampas + límites + verificación + registro para cada acción |
| `lib/desafio.ts`, `components/Desafio.tsx`, `app/api/desafio` | Turnstile o prueba de trabajo (SHA-256 con N bits en cero, firmada con HMAC, un solo uso) |
| `lib/trampas.ts` | Campo trampa y tiempo mínimo |
| `lib/auth.ts` | PBKDF2 (600.000), política de claves, semáforo de 4 PBKDF2 a la vez, fuerza bruta por mail+red, TOTP de Julián |
| `lib/totp.ts`, `scripts/totp-nuevo.mjs` | TOTP (RFC 6238) sin dependencias |
| `lib/session.ts`, `lib/cliente.ts` | Cookie firmada `__Host-`, huellas HMAC de IP y mail, IP confiable en Vercel |
| `lib/registro-seguridad.ts`, `app/mi-espacio/seguridad` | Registro (3000 eventos) y panel |
| `components/YoSoy.tsx`, `content/yosoy.ts` | El ritmo de Yo Da (`ritmo`) |

**Detalles que conviene saber**

- **Todas las páginas son dinámicas:** el nonce de la CSP cambia en cada pedido, así que Next no puede servir HTML ya armado. Es el precio de la CSP con nonce; con el tráfico previsto no pesa.
- **La CSP lleva `'unsafe-eval'`** también en producción: el reproductor oficial de Spotify está compilado con `eval` y CSP no permite habilitarlo para un solo origen. El nonce y `'strict-dynamic'` siguen frenando los scripts inyectados.
- **Sin Upstash**, los contadores viven en la memoria de cada instancia: los contadores comunes tienen un tope de 10.000 claves (se descartan los más viejos) y los bloqueos, las marcas de un solo uso y las alertas van aparte, con tope de 20.000, y nunca se descartan vigentes (si se llena, el «un solo uso» falla cerrado). Con Upstash, un solo pedido HTTP por consulta, con 400 ms de tope; si falla, memoria por 15 s.
- **El middleware nunca consulta Upstash:** su límite general va en memoria local para no gastar un comando pago por cada página vista (bajo un ataque, eso sería una factura). Para el volumen, el Firewall de Vercel.
- **Turnstile caído:** recién con 5 errores de red o 5xx en un minuto (un 4xx o un 429 no cuentan) se acepta la prueba de trabajo por 10 minutos, con 4 bits más. Una red con 3 tokens rechazados en 10 minutos ya no genera llamadas a Cloudflare.
- **Dificultad de la prueba de trabajo:** `JB_DESAFIO_BITS` (8 a 24; 16 por defecto). Mientras dure la alerta global de ingresos, 20 como mínimo.
- **`JB_LIMITES_FACTOR`** (entero ≥ 1) multiplica todos los `max` de la tabla (útil si mucha gente sale por la misma red en un evento).
- **IP:** en Vercel se usa `x-real-ip` (no se puede falsificar). Fuera de Vercel, el último valor de `x-forwarded-for`, que pone el proxy más cercano: sin un proxy delante, cualquiera lo cambia; por eso por IP casi siempre se pide verificación en lugar de bloquear, y se combina con límites por cuenta, mail y globales. IPv6 se cuenta por su /64.
- **Sin `SESSION_SECRET` en producción:** sesiones y huellas con el respaldo público (o una llave derivada de `UPSTASH_REDIS_REST_TOKEN` o de una `TURNSTILE_SECRET_KEY` real, para las huellas), aviso en la consola y alerta en el registro; la cuenta de Julián no entra.
- **Archivos JSON:** las listas que llena el público (lista, arrepentimientos, preguntas, notas) tienen un tope de 20.000 filas; pasado eso no se guarda y queda una alerta. En producción, una base de datos.
- **Modo pruebas:** solo con `JB_PRUEBAS=1` y fuera de Vercel, el encabezado `x-jb-prueba` separa el cupo de cada prueba automática.

---

## 7. Tabla de límites (`lib/limite.ts`)

«Verificación tras N» = con N ya registrados en la ventana, el siguiente pide verificación. «Máx.» = con ese número, el siguiente no pasa. Los `max` se multiplican por `JB_LIMITES_FACTOR`.

| Función | Por | Qué cuenta | Ventana | Verificación tras | Máx. | Bloqueo |
|---|---|---|---|---|---|---|
| Ingresar | IP | fallos | 15 min | 3 | | |
| | IP | fallos | 1 h | | 30 | 15 min |
| | mail | fallos | 15 min | 5 | | |
| | todo el sitio | fallos | 10 min | 200 (alerta 30 min para todos) | | |
| | IP | intentos | 1 min | | 10 | |
| | mail + red | fallos | 15 min | 3 | 10 | 15 min |
| Ingresar (mail de Julián, además) | mail | fallos | 1 h | 1 | | |
| Código de Julián (TOTP) | paso | códigos equivocados | 5 min | | 5 (vuelve a pedir la clave) | |
| | cuenta entera | códigos equivocados | 1 h | | 10 | 1 h |
| Crear cuenta | IP | cuentas creadas | 1 h | 1 | 3 | |
| | IP | cuentas creadas | 1 día | | 10 | |
| | IP | fallos (mail repetido = 3) | 10 min | 3 | | |
| | todo el sitio | cuentas creadas | 1 h | 30 (alerta 1 h) | 200 | |
| | IP | intentos | 1 min | | 20 | |
| Canjear código | cuenta | fallos | 1 h | 3 | | |
| | cuenta | fallos | 1 día | | 20 | 1 día |
| | IP | fallos | 1 h | 20 | | |
| | IP | intentos | 1 min | | 30 | |
| Arrepentimiento (1.er envío libre) | IP | intentos | 1 h | 1 | 3 | |
| | IP | intentos | 1 día | | 10 | |
| | mail | intentos | 1 día | | 3 | |
| | todo el sitio | intentos | 1 h | 50 (alerta 1 h) | 500 | |
| Arrepentimiento sospechoso | todo el sitio | guardados | 1 h | | 300 | |
| Lista de avisos | IP | intentos | 1 h | 2 | 5 | |
| | IP | intentos | 1 día | | 20 | |
| | contacto | intentos | 1 día | | 3 | |
| | todo el sitio | intentos | 1 h | 100 (alerta 1 h) | 1000 | |
| Preguntas | cuenta | intentos | 10 min | 3 | | |
| | cuenta | intentos | 1 h | | 5 | |
| | cuenta | intentos | 1 día | | 20 | |
| | IP | intentos | 1 h | | 20 | |
| Nota del 1 a 1 | cuenta | intentos | 10 min | 3 | 10 | |
| | IP | intentos | 10 min | | 20 | |
| Pagar y reservar | cuenta | intentos | 10 min | 3 | 10 | |
| | IP | intentos | 10 min | | 20 | |
| Progreso de la masterclass | cuenta | intentos | 1 min | | 60 (se ignora en silencio) | |
| Agenda de Julián | cuenta | intentos | 1 min | | 60 | |
| Consultas a una persona (Yo Da) | cuenta | enviadas | 1 día | | 3 | |
| | IP | enviadas | 1 día | 2 | 10 | |
| | IP | intentos | 1 min | | 10 | |
| `/api/horarios` | IP | pedidos | 1 min | | 30 | |
| `/api/yo` | IP | pedidos | 1 min | | 60 | |
| `/api/sala` (chequeo) | cuenta | pedidos | 1 min | | 30 | |
| | IP | pedidos | 1 min | | 120 | |
| `/api/sala` (abrir) | cuenta | pedidos | 1 min | | 10 | |
| | IP | pedidos | 1 min | | 120 | |
| `.ics` (calendarios) | cuenta | pedidos | 1 min | | 30 | |
| | IP | pedidos | 1 min | | 60 | |
| `/api/desafio` | IP | pedidos | 1 min | | 30 | |
| | IP | pedidos | 1 h | | 300 | |
| Páginas (middleware) | IP | pedidos | 1 min | | 600 | |
| Resto de `/api` (middleware) | IP | pedidos | 1 min | | 120 | |

En las cuentas demo (clave a la vista), lo que va «por cuenta» se cuenta por cuenta + red: así una persona no deja sin cupo a las demás.

Yo Da, en el navegador: una ráfaga de 4 mensajes, uno cada 1,2 s en promedio y, para lo escrito en el campo, 12 por minuto; si se pasa, pausa de 6 a 30 segundos.
