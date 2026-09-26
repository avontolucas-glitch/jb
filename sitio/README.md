# Sitio de Julián Bermúdez · prototipo navegable

Prototipo del sitio **julianbermudez.com**. Se puede recorrer entero: el cuadro de bienvenida, la parte pública, el ingreso con cuenta, el espacio de cada persona, la masterclass en vivo con su sala protegida, la compra (de prueba, no cobra nada) y la app instalable.

La estética es la de los libros: tinta crema sobre negro, los grabados del ojo del Cap. 2 de cada libro, grano de impresión y movimiento lento (el ojo del encabezado mira y parpadea, el nombre se escribe con tinta, los epígrafes aparecen palabra por palabra). Con "reducir movimiento" activado en el dispositivo, nada se mueve.

Todo lo que tiene que decir Julián aparece marcado como **[TEXTO DE JULIÁN]**: no hay frases, enseñanzas ni testimonios inventados. Las fotos y los videos son espacios vacíos, listos para el material real.

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
- **Reservó un directo en vivo:** solo ese directo, en su sala.

## 3. Cambiar precios, fechas y textos

Todo está en **un solo archivo**: `content/config.ts`. Se abre con cualquier editor de texto.

- **Precios:** en `precios` (masterclass USD 20 y conferencia privada USD 3, los dos "a definir"). Cuando estén confirmados, cambiá `aDefinir: true` por `aDefinir: false` y desaparece la aclaración.
- **Fechas y lugares:** en `conferencias` y en `encuentro`.
- **Textos de Julián:** donde dice `MARCADOR`, reemplazalo por el texto entre comillas. Ejemplo: `quienEs: "Acá va lo que escriba Julián",`
- **Redes:** en `redes`, cambiá el `#` por el link real.
- **Masterclass en vivo:** en `enVivo`: los directos (fecha y tema), el mínimo (`minimo: 1`), los montos sugeridos (`sugeridos`) y el máximo por pago.
- **Cuadro de bienvenida:** en `umbral`: el aviso de espacio exclusivo, la bienvenida y el texto del botón. Aparece una vez por visita.
- **Nombre:** en `sitio.nombre` y `sitio.nombreCorto` ("Julián Bermúdez", con tilde, como en los libros).

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

## 5. La masterclass en vivo y su protección

Un directo por semana, a voluntad desde USD 1. Quien reserva entra a su sala en **Mi espacio → En vivo**. En el prototipo la sala ya tiene funcionando:

- **Sin link para compartir:** la sala se abre solo con la cuenta que reservó; el servidor da un permiso firmado que vence en minutos (`lib/streaming.ts`).
- **Una pantalla a la vez:** si se abre en otro dispositivo o pestaña, la primera se pausa sola (`lib/salas.ts`).
- **Marca de agua con el mail** de quien mira, que se mueve por la imagen: si alguien filma la pantalla, se sabe quién fue.
- **Sin descarga, sin botón derecho, sin arrastrar** dentro de la sala.

Lo que falta es la transmisión real: un servicio de video con **DRM** (cifrado Widevine / FairPlay / PlayReady). Ver la sección 9.

## 6. Los libros, también digitales

Idea de Lucas (anotada y ya armada en el prototipo):

- **Quien compra la versión digital** la tiene en **Mi espacio → Biblioteca** y la lee ahí, como la masterclass: capítulo por capítulo, con el grabado de cada uno y los colores de cada libro (Receta en negro, Pensamiento en blanco, Biografía en azul marino).
- **Quien compra el libro impreso** encuentra en la primera página un **código único**. Lo carga en **julianbermudez.com/canjear** (el libro trae un QR que lleva ahí) y el digital queda en su cuenta.
- Cada código sirve **una sola vez y para una sola cuenta**. Códigos de prueba: `REC-7K3M-Q9TD-4HXA`, `PEN-4TQ8-HX2K-9MWB`, `BIO-9VEH-5KMT-2QZR` (se pueden usar una vez cada uno).
- El lector no deja copiar ni seleccionar el texto y lleva el mail de quien lee como marca de agua.

**¿Es factible? Sí.** Es el mismo sistema de accesos que ya usa el sitio. Para producción hace falta:

1. **Códigos distintos en cada ejemplar.** La imprenta los imprime como "datos variables" (cada libro con el suyo) o se pegan como sticker o tarjeta raspable. `lib/codigos.ts` ya genera lotes (`generarLote`) para mandar a la imprenta.
2. **Límite de intentos** al canjear, para que nadie pruebe códigos al azar.
3. **El texto del libro** cargado desde el manuscrito final (hoy dice `[TEXTO DEL LIBRO…]`).
4. Aceptar que, como con cualquier libro digital, una captura de pantalla siempre es posible: la marca de agua con el mail dice de quién era.

## 7. Pruebas automáticas

```
npm run build
npm test
```

Recorren solos, en tamaño celular y computadora: el cuadro de bienvenida, el aviso al entrar sin sesión, crear cuenta, ingresar y cerrar sesión, la cuenta sin compras, la compra de la masterclass (con progreso y preguntas), la compra de una entrada privada (y que no habilite nada más), la reserva de un directo a voluntad (con el mínimo), la marca de agua, la sala en una sola pantalla, el canje del código del libro (una sola vez), la compra y lectura del libro digital, los formularios públicos, que ninguna página se desborde en el celular, y la app instalable. Usan datos de prueba aparte: no tocan los del prototipo.

## 8. Subirlo para tener un link y mostrarlo

La forma más simple es **Vercel** (tiene plan gratis):

1. Entrá a vercel.com con tu cuenta de GitHub.
2. **Add New → Project** y elegí el repositorio `jb`.
3. En **Root Directory** poné `sitio`. Lo demás se deja como viene.
4. En **Environment Variables** agregá `SESSION_SECRET` con una frase larga cualquiera (es la llave de las sesiones).
5. **Deploy**. En un par de minutos te da un link del estilo `algo.vercel.app` para mandarle a Julián.

Cada vez que se sube un cambio al repositorio, el link se actualiza solo.

Importante para la demo: en Vercel las cuentas y compras nuevas se guardan en un espacio temporal y pueden borrarse cada tanto. Las dos cuentas de prueba siempre están. Para que no se borre nada, se puede usar un servidor propio (Render, Railway o un VPS) con disco: ahí se corre `npm install`, `npm run build` y `npm start`, y se define `DATA_DIR` con una carpeta que se conserve.

## 9. Qué falta para que funcione de verdad

Este prototipo **no está listo para producción**. Falta:

1. **Login real:** reemplazar `lib/auth.ts` por un servicio de cuentas (con recuperación de clave, verificación de mail y protección contra abusos).
2. **Pagos reales** en `lib/payments.ts`. El acceso se habilita solo cuando el medio de pago confirma el pago (webhook), nunca al volver del checkout. Para tickets chicos e internacionales conviene un medio sin costo fijo por pago (Mercado Pago o dLocal Go para Latinoamérica) y PayPal para el resto; los costos fijos de USD 0,30 a 1 se comen buena parte de un pago de USD 1.
3. **Video protegido:** los directos, con un servicio que tenga DRM en vivo (por ejemplo Mux) más la marca de agua y la pantalla única que ya tiene el sitio; la masterclass grabada y los audios, en un servicio con reproducción firmada y DRM. Ninguna protección impide filmar la pantalla con otra cámara: para eso está la marca de agua.
4. **Mails:** confirmación de compra, recordatorio de conferencias, inscripción a la lista y aviso del encuentro.
5. **Panel de contenido:** para cargar fechas, textos, videos y audios sin tocar código.
6. **Base de datos:** reemplazar los archivos de `data/` por una base de datos real.
7. **Dominio y hosting:** apuntar julianbermudez.com al servidor, con https.
8. **Textos legales:** términos, privacidad y reembolsos, redactados por un profesional.
9. **Contenido de Julián:** todos los [TEXTO DE JULIAN], fotos reales y videos.

## Mapa de carpetas

| Carpeta | Qué hay |
|---|---|
| `content/config.ts` | Precios, fechas y textos |
| `app/` | Las páginas del sitio |
| `app/mi-espacio/` | El área de cada persona |
| `components/` | Piezas que se repiten (el ojo, el cuadro de bienvenida, la sala, formularios, aviso de la app) |
| `public/grabados/` | Los grabados del ojo de los libros, en la tinta de cada uno |
| `lib/auth.ts` | Login (simulado) |
| `lib/payments.ts` | Compra (simulada) y precio a voluntad, con notas de Mercado Pago y Hotmart |
| `lib/streaming.ts`, `lib/salas.ts` | Permiso firmado y pantalla única de los directos |
| `lib/access.ts` | Quién puede ver qué |
| `lib/codigos.ts` | Códigos únicos de los libros impresos |
| `data/` | Cuentas y compras de prueba |
| `public/sw.js` | Lo que hace que la app funcione sin internet |
| `tests/` | Pruebas automáticas |
