# Sitio de Julian Bermúdez · prototipo navegable

Prototipo del sitio **julianbermudez.com**. Se puede recorrer entero: la parte pública, el ingreso con cuenta, el espacio de cada persona, la compra (de prueba, no cobra nada) y la app instalable.

Todo lo que tiene que decir Julian aparece marcado como **[TEXTO DE JULIAN]**: no hay frases, enseñanzas ni testimonios inventados. Las fotos y los videos son espacios vacíos, listos para el material real.

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

También podés crear una cuenta nueva y "comprar" con el botón **Pagar (simulado)**.

Quién ve qué:

- **Sin cuenta:** todo lo público. Si entra a `/mi-espacio`, lo manda a Ingresar con un aviso.
- **Cuenta sin compras:** su espacio vacío, con el camino para comprar.
- **Compró la masterclass:** masterclass, audios por tema y encuentro de preguntas.
- **Compró una entrada privada:** solo esa conferencia, con su link para entrar.

## 3. Cambiar precios, fechas y textos

Todo está en **un solo archivo**: `content/config.ts`. Se abre con cualquier editor de texto.

- **Precios:** en `precios` (masterclass USD 20 y conferencia privada USD 3, los dos "a definir"). Cuando estén confirmados, cambiá `aDefinir: true` por `aDefinir: false` y desaparece la aclaración.
- **Fechas y lugares:** en `conferencias` y en `encuentro`.
- **Textos de Julian:** donde dice `MARCADOR`, reemplazalo por el texto entre comillas. Ejemplo: `quienEs: "Acá va lo que escriba Julian",`
- **Redes:** en `redes`, cambiá el `#` por el link real.
- **Nombre:** en `sitio.nombre` y `sitio.nombreCorto`. Hoy dice "Julian" sin tilde, como pedía la consigna del sitio; en los libros va "Julián". Si se decide con tilde, se cambia ahí y se actualiza en todo el sitio.

Con `npm run dev` encendido, al guardar el archivo el navegador se actualiza solo.

Los colores y las tipografías están en `app/globals.css` (al principio, en "Tokens").

## 4. La app instalable

El sitio se puede instalar como app en cualquier sistema, sin tiendas:

- **Android, Windows, Linux y Chromebook (Chrome o Edge):** aparece el botón **Instalar la app**.
- **iPhone y iPad (Safari):** el aviso explica Compartir y después **Agregar a pantalla de inicio**.
- **Mac:** Safari, menú Archivo y **Agregar al Dock**; o el botón de instalar en Chrome o Edge.
- **Firefox de computadora:** avisa que se abra en otro navegador (Firefox no instala apps web).

El aviso aparece una vez; si la persona lo cierra, no vuelve por 30 días. Siempre está la página **/app** (enlazada en el pie y en Mi cuenta) con los pasos para cada sistema.

Sin internet, la app abre las páginas públicas ya visitadas y, si no, muestra "Sin conexión". **El espacio privado nunca queda guardado en el dispositivo.**

> La instalación y el modo sin internet funcionan solo con el sitio publicado en **https** (o en localhost). Para probar el modo sin conexión a mano: abrí el sitio, navegá un poco, apagá el wifi y recargá.

## 5. Pruebas automáticas

```
npm run build
npm test
```

Recorren solos, en tamaño celular y computadora: el aviso al entrar sin sesión, crear cuenta, ingresar y cerrar sesión, la cuenta sin compras, la compra de la masterclass (con progreso y preguntas), la compra de una entrada privada (y que no habilite nada más), los formularios públicos, que ninguna página se desborde en el celular, y la app instalable. Usan datos de prueba aparte: no tocan los del prototipo.

## 6. Subirlo para tener un link y mostrarlo

La forma más simple es **Vercel** (tiene plan gratis):

1. Entrá a vercel.com con tu cuenta de GitHub.
2. **Add New → Project** y elegí el repositorio `jb`.
3. En **Root Directory** poné `sitio`. Lo demás se deja como viene.
4. En **Environment Variables** agregá `SESSION_SECRET` con una frase larga cualquiera (es la llave de las sesiones).
5. **Deploy**. En un par de minutos te da un link del estilo `algo.vercel.app` para mandarle a Julian.

Cada vez que se sube un cambio al repositorio, el link se actualiza solo.

Importante para la demo: en Vercel las cuentas y compras nuevas se guardan en un espacio temporal y pueden borrarse cada tanto. Las dos cuentas de prueba siempre están. Para que no se borre nada, se puede usar un servidor propio (Render, Railway o un VPS) con disco: ahí se corre `npm install`, `npm run build` y `npm start`, y se define `DATA_DIR` con una carpeta que se conserve.

## 7. Qué falta para que funcione de verdad

Este prototipo **no está listo para producción**. Falta:

1. **Login real:** reemplazar `lib/auth.ts` por un servicio de cuentas (con recuperación de clave, verificación de mail y protección contra abusos).
2. **Pagos reales:** conectar **Mercado Pago** (cobro en pesos) y/o **Hotmart** en `lib/payments.ts`. El acceso se habilita solo cuando el medio de pago confirma el pago (webhook), nunca al volver del checkout.
3. **Videos y audios protegidos:** subirlos a un servicio que no permita descargarlos ni compartir el link (por ejemplo Vimeo privado, Mux o Bunny Stream).
4. **Mails:** confirmación de compra, recordatorio de conferencias, inscripción a la lista y aviso del encuentro.
5. **Panel de contenido:** para cargar fechas, textos, videos y audios sin tocar código.
6. **Base de datos:** reemplazar los archivos de `data/` por una base de datos real.
7. **Dominio y hosting:** apuntar julianbermudez.com al servidor, con https.
8. **Textos legales:** términos, privacidad y reembolsos, redactados por un profesional.
9. **Contenido de Julian:** todos los [TEXTO DE JULIAN], fotos reales y videos.

## Mapa de carpetas

| Carpeta | Qué hay |
|---|---|
| `content/config.ts` | Precios, fechas y textos |
| `app/` | Las páginas del sitio |
| `app/mi-espacio/` | El área de cada persona |
| `components/` | Piezas que se repiten (el ojo, encabezado, formularios, aviso de la app) |
| `lib/auth.ts` | Login (simulado) |
| `lib/payments.ts` | Compra (simulada), con notas de Mercado Pago y Hotmart |
| `lib/access.ts` | Quién puede ver qué |
| `data/` | Cuentas y compras de prueba |
| `public/sw.js` | Lo que hace que la app funcione sin internet |
| `tests/` | Pruebas automáticas |
