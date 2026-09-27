# PLIEGO · Sistema visual y de experiencia de julianbermudez.com

> Dirección creativa final del rediseño, del 27/09/2026. Este es el sistema que se implementa: lo que no está acá no se agrega, y lo que está acá se hace así. La versión anterior al rediseño es el commit `1c2c801` (tag `referencia-pre-rediseno`); cómo volver a ella está en `sitio/REFERENCIA.md`.

**Cómo usar este documento.** La sección 0 resume las decisiones y la 1 explica por qué se tomaron. De la 2 a la 16 está el sistema completo. La 17 clasifica lo que se conserva, lo que evoluciona y lo que se va, y la 18 lista lo que no se toca. La 19 es el plan por fases, la 20 la lista de control final y la 21 lo que tiene que decidir Lucas. Los anexos traen los tokens listos para copiar y las medidas verificadas.

Marcas en el texto:

- **[prueba]**: toca un contrato de las pruebas de Playwright (`tests/`). Antes de implementarlo, leé la sección 18.
- **[Lucas]**: necesita el OK de Lucas antes de publicarse.
- **[herramientas]**: hay que generar un archivo con los scripts de `herramientas/`. Es el mismo original con otra salida: no se dibuja ni se inventa nada.

---

## 0. Las decisiones, en una pantalla

1. **Base: Pliego**, el sitio como volumen de arte de la obra. De *Cámara oscura* se suman la luz como jerarquía, el corte seco entre superficies y la pupila que se dilata para entrar. De *Archivo del Observador* se suman la ficha, los estados sin color, el borde de control con contraste y la sincronía que se ilumina por número.
2. **Paleta: los tokens actuales, sin tocar un solo valor.** El único dorado es el ojo de Yo Da. No hay color de acento: el acento es la luz. La crema es la luz plena, el gris claro la luz de lectura, el gris la penumbra y la línea la costura.
3. **Tipografía:** Alegreya para la obra y Alegreya SC para las versalitas reales, las dos de Huerta Tipográfica (Buenos Aires). Archivo, de Omnibus-Type (Buenos Aires), para el archivo: datos, rótulos, navegación y botones. El lector de los libros conserva Palatino.
4. **Cada voz tiene su letra.** Julián va en redonda y a plena luz, el editor en itálica, el archivo en sans y Yo Da en itálica con su ojo de píxeles. El libro va en su propia letra.
5. **Grilla** de 4, 8 y 12 columnas, con láminas a sangre que nunca usan `100vw`. Zonas: glosa, obra, ancha y aire.
6. **Afuera, la tapa; adentro, la página.** Cuando un libro aparece como objeto, se ve la composición de su tapa impresa: el corazón del cap. 1 sobre la superficie del libro. Cuando se abre, aparecen el ojo del cap. 2 y los emblemas de cada capítulo.
7. **Fotos en duotono con la tinta del sitio**, como las contratapas de los libros. Van sin marco, sin giro y sin filtros en vivo.
8. **Se quitan** el grano, los flotantes, las estrellas, la orla, el cursor, el halo, el magnetismo, el latido del botón, la pluma, la segunda pasada y todos los desenfoques.
9. **Movimiento:** las cosas aparecen y no rebotan. Se anima solo opacidad, `transform` y máscaras chicas. Al entrar se cruza la pupila del Observador y el ojo de la barra se abre.
10. **Navegación:** la barra está siempre visible. La navegación va completa desde 1280 px y compacta entre 1024 y 1279; por debajo de 1024 se usa el Índice a pantalla completa. Los folios salen de una sola fuente.
11. **Ruta nueva `/biografia`**, en los cuatro capítulos del libro III (0 a 3), sobre la superficie marino del libro.
12. **Fragmentos** pasa a ser una sala de lectura de las frases textuales, con el archivo completo debajo.
13. **Todo por fases**, con un commit por paso y siempre reversible.

---

## 1. Evaluación de las propuestas

### 1.1 Con qué se juzgó

1. **La indicación posterior de Lucas, que manda sobre todo lo demás:** la paleta es fija (negro, blanco y crema; el marino solo para la Biografía; el dorado solo en el ojo de Yo Da), el minimalismo actual es la base y, ante la duda, se quita.
2. **La sección 33 del pedido:** si parece genérica, de startup o de coaching, se descarta; el objetivo es que sea editorial, misteriosa, sofisticada y propia.
3. **La identidad que ya existe:** evolución, no destrucción.
4. **La factibilidad** en Next 15 + Tailwind v4, sin dependencias nuevas y respetando los contratos de las pruebas.
5. **La accesibilidad y el rendimiento** en un Android de gama media.

### 1.2 Las tres propuestas

**Archivo del Observador** (museo, archivo secreto).
- **Lo mejor:** el rigor.
  - La ficha como componente y el borde de control con contraste suficiente.
  - Los estados sin color y la sincronía que se ilumina por fila.
  - «Canjear» como la última página del libro impreso.
  - La barra que nunca se esconde.
- **Lo que no entra:**
  - Convierte todo en catálogo (signaturas F·07, L·01, JB·III, una «regla de sala» fija a la derecha): suma metadatos donde Lucas pidió silencio.
  - En el umbral cambia el grabado del Observador por un ojo de línea y deja el grabado al 14 % detrás, así que pierde la puerta de linóleo.
  - Tiene errores de base (1.4).
- **Sección 33:** editorial, con riesgo de «sistema» frío.

**Pliego** (el sitio como volumen de arte).
- **Lo mejor:** es la continuación natural de lo que ya funciona. El sitio ya está compuesto como un libro, con portadillas, folios, índice con puntos guía y capitular, y Pliego le da reglas precisas:
  - un foco por pantalla;
  - la glosa como margen del libro;
  - el silencio medido;
  - las tres superficies de los libros como corte;
  - Alegreya SC para las versalitas reales;
  - el ojo de la barra que se abre al entrar.

  Además, es la que mejor cuida las pruebas.
- **Lo que se le corrige:**
  - La escala: 200 y 280 px es desmesura, no maestría.
  - Anima `flex` en el tríptico, lo que vuelve a maquetar la página en cada cuadro.
  - Usa un píxel dorado como marca en los mensajes de Yo Da (dorado fuera del ojo).
  - La barra se esconde al bajar, pero el recorrido de Yo Da ilumina elementos de la barra.
  - Pone un interruptor de sonido dentro del panel de música, lo que rompe una prueba.
- **Sección 33:** editorial y propia, sin rastro de startup ni de coaching.

**Cámara oscura** (cine de autor).
- **Lo mejor:**
  - El concepto más potente.
  - La mejor definición de la paleta sin acento: la luz es la jerarquía.
  - El corte seco entre superficies, la pupila que se dilata para entrar y un único plano en negro.
- **Lo que no entra:**
  - Newsreader: la versión de Google Fonts no trae cifras elzevirianas ni versalitas, y pesa 132 KB por estilo.
  - Su gramática de cine (rollos de 100svh, nueve planos en la portada, una barra que se retira) aleja el sitio del libro, que es la identidad.
  - Demora la nube de Yo Da hasta los 20 segundos o la segunda página, y eso rompe dos pruebas.
- **Sección 33:** propia y misteriosa, pero menos fiel a la obra.

### 1.3 La elección

**Gana Pliego.** Es la única que no cambia el lugar: lo termina. El sitio ya es un libro compuesto a mano, y Pliego lleva esa idea al nivel de un libro de arte sin sumar una sola capa. Se le agrega lo mejor de las otras dos sin mezclar estilos: todo lo que se suma habla el idioma del libro.

- **De Cámara oscura:**
  - la luz como jerarquía (3);
  - el corte seco entre superficies (9.3);
  - la pupila que se dilata en el umbral (9.4);
  - un único silencio largo en el inicio (5.4);
  - fotos sin velos ni degradados (8).
- **De Archivo del Observador:**
  - la ficha (6.3);
  - los estados sin color, con señales redundantes (3.4);
  - el borde de control (3.2);
  - la sincronía que se ilumina por número (6.11);
  - «Canjear» como la última página del libro (13.10);
  - la barra siempre visible (7.1);
  - los compromisos de accesibilidad (16).
- **Propio de esta dirección:**
  - las tapas reales de la trilogía como los tres objetos (6.10);
  - las fotos en duotono con la tinta del sitio, como las contratapas (8.1);
  - el reparto de voces tipográficas (4.5);
  - el rombo dibujado (6.7);
  - la navegación compacta de 1024 a 1279 px (7.1).

### 1.4 Datos verificados que corrigen a las tres

Todo esto se comprobó contra el código, los archivos y las fuentes reales. No son suposiciones.

- **Alegreya de Google Fonts** (subconjunto latino): trae `lnum`, `tnum`, `pnum` y fracciones, pero **no trae `smcp`**. Sus cifras por defecto son elzevirianas (el glifo `one`; `lnum` lo cambia por `one.lf`). Por eso las versalitas reales solo salen con **Alegreya SC** (29 KB).
- **Newsreader de Google Fonts:** trae solo `liga`, `pnum` y `tnum`, sin `onum` y sin `smcp`. El archivo latino en redonda pesa 132 KB.
- **Archivo con eje de ancho:** 90 KB. **Solo con eje de peso:** 35 KB. El ancho no justifica 55 KB.
- **Faltan glifos:** ninguna de las tres fuentes trae ◆, ● ni ○ en el subconjunto latino. Si se escriben, cada sistema los reemplaza con otra fuente y otro tamaño. Por eso el rombo se dibuja (6.7).
- **La foto de la mirada:** tiene fondo blanco puro (#ffffff) a los costados; no tiene una «banda negra inferior». El recorte vertical (`julian-mirada-vertical.webp`) mide 680 × 801, no 9:16, y es el máximo que da el original de 2000 × 808: a pantalla completa en un celular se pixela.
- **No todas las fotos son oscuras.** Chef y trofeo tienen fondo oscuro. Doble exposición, movimiento y mirada tienen fondos claros. Las tres primeras («hechas a mano») son grises neutros y las otras tres (de `fotos_web.py`) son cálidas: hoy no comparten tono.
- **La nube de Yo Da** se monta a los 0,7 s de entrar, y `yosoy.spec` y `recorrido.spec` la esperan con el tiempo por defecto de Playwright (5 s). No puede pasar a 12, 20 ni 45 s.
- **El interruptor de sonido:** `interaccion.spec` toma el `.last()` de `interruptor-sonido`. Si se suma uno en el panel de música, que va después del pie en el DOM y está oculto, la prueba falla.
- **`text-transform` no rompe las pruebas:** `toHaveText` y `toContainText` leen `textContent`, que no cambia con `text-transform`. Igual, las mayúsculas quedan solo para rótulos y tapas (4.4).
- **Un error vivo en el CSS:** `@keyframes onda` está definido dos veces en `globals.css`, una para el sello del menú y otra para las barras de la música. Gana el segundo, así que la «onda de tinta» del menú anima un alto en vez de expandirse. Hay que renombrarlos.
- **La barra no entra en 1024:** la navegación completa, con seis secciones (sumando Biografía), emblemas, «Instalar la app» y la cuenta, mide unos 1.230 px con Archivo de 14 px. Entra desde 1280 px. La compacta (sin emblemas ni «Instalar la app») mide unos 925 px y entra desde 1024 (Anexo B).
- **El marco de los grabados es parte del linóleo:** todos los grabados son tinta crema sobre transparente (#eee8dc), salvo `pensamiento-ojo`, que viene en tinta negra para el blanco. El recuadro doble que se ve alrededor del Observador pertenece al grabado, así que no hace falta agregarle un marco.

---

## 2. Concepto y principios

### El pliego a oscuras

Un pliego es la hoja grande que, doblada, forma las páginas de un libro. El sitio es un volumen de la obra de Julián: tiene tapa (el umbral), portada, portadillas con su folio, láminas, un índice, glosas al margen y un colofón. Y es un volumen que se lee a oscuras. El negro es a la vez la sala y el papel, y lo que importa recibe luz. Quien entra no navega una web: abre un libro que lo estaba esperando, y lo abre cruzando la pupila del Observador.

### Principios

1. **Una cosa por pantalla.** Cada pantalla es una lámina con un solo protagonista: un título, una frase, un grabado, una foto o un formulario. Si hay dos, uno pasa a la pantalla siguiente.
2. **La luz es la jerarquía.** No hay color de acento. Lo que importa va a plena luz (crema), lo que se lee va en luz de lectura (gris claro), lo secundario en penumbra (gris) y la estructura en sombra (línea).
3. **Cada voz tiene su letra.** Julián habla en redonda y a plena luz. El editor, en itálica. El archivo (datos, rótulos, botones), en sans. Yo Da, en itálica y con su ojo de píxeles. El libro, en su propia letra.
4. **El silencio se mide.** El vacío tiene medida, dirección, un borde que lo abre y otro que lo cierra. Nunca es sobrante ni parece algo que no terminó de cargar.
5. **Afuera, la tapa; adentro, la página.** El libro como objeto se ve con su tapa. El libro abierto se ve con sus páginas.
6. **Nada se inventa; lo que falta se compone.** Todo pendiente tiene su lugar y su escala reales, y dice «a definir» con esas palabras.
7. **El movimiento es tinta y luz.** Las cosas aparecen una vez y se asientan. Nada rebota y nada late para vender. Solo respira el ojo del umbral.
8. **Nunca se sacrifica a la persona.** El contraste, el foco, el teclado, el tamaño táctil, reducir movimiento y un Android de gama media son parte del diseño desde el principio, no una revisión al final.

### Lo que el sitio nunca es (sección 33)

- **Ni SaaS ni startup:**
  - sin tarjetas con sombra y radio ni botones píldora;
  - sin portada con dos llamados, contadores, testimonios ni insignias;
  - sin barras de llamado pegadas abajo ni flechas en los botones.
- **Ni coaching ni espiritualidad de catálogo:**
  - sin degradés, destellos, partículas ni mandalas;
  - sin dorado de adorno;
  - sin urgencia («comprá ya», «últimos lugares»).
- **Ni plantilla:**
  - sin cursor propio ni magnetismo;
  - sin letras que rebotan ni cintas de texto que corren;
  - sin glassmorphism ni `backdrop-filter`;
  - sin parallax fuerte.
- **Ni panel de control:** Mi espacio es una biblioteca con índice, no un tablero de módulos.

### La prueba de lámina

Antes de dar por buena una pantalla, revisala a 360, 768 y 1440 px con estas preguntas:

- ¿Tiene un solo protagonista?
- ¿El vacío ocupa al menos el 40 % de la pantalla y tiene dirección?
- ¿Todo se apoya en una línea de la grilla? Solo se centran el umbral, los folios, el ◆ ◆ ◆ y la Masterclass 1 a 1 entera.
- ¿Hay como máximo tres niveles tipográficos a la vista?
- ¿Cada color cumple su rol de luz?
- ¿Se podría imprimir como lámina de un libro de arte y quedar bien?

Si alguna respuesta es no, se recompone. Si la duda persiste, se quita algo.

---

## 3. Paleta: tokens fijos, roles de luz

No se agrega ni se cambia ningún valor. Se nombran roles como alias de los tokens existentes: un alias no es un color nuevo.

### 3.1 Tokens (los valores de `app/globals.css`, intactos)

| Token | Valor | Rol |
|---|---|---|
| `--negro` | #0a0a0a | **La sala.** Fondo general y superficie de la Receta. Tinta sobre blanco. |
| `--negro-hondo` | #050505 | **La vitrina.** Umbral, Índice (menú), paneles de Yo Da y de la música, pie. Ya no se usa para alternar franjas. |
| `--negro-suave` | #141414 | **El hueco.** Marco de los medios pendientes («(Video, a definir)») y fondo del campo de Yo Da. |
| `--crema` | #efe9dc | **Luz plena.** Palabras de Julián, títulos, estado activo, foco y relleno del botón lleno. |
| `--gris-claro` | #d9d4c9 | **Luz de lectura.** Prosa larga (descripciones, «Quién es», legales), bajadas y voz de Yo Da. |
| `--gris` | #8f897d | **Penumbra.** Rótulos, datos secundarios, notas, «a definir», navegación en reposo y borde de control sobre negro. |
| `--gris-tinta` | #5b574f | **Sombra.** Sobre negro, solo lo decorativo o deshabilitado (marcas de corte). Sobre blanco, texto secundario y borde de control. |
| `--linea` | #262422 | **Costura.** Filetes decorativos sobre negro. Nunca delimita un control. |
| `--blanco` | #f7f5f0 | **La página del Pensamiento.** Superficie `.claro`: volumen II, tapa II y lector del Pensamiento. No se usa como color de texto sobre negro; solo aparece como `--fondo` dentro de un botón invertido sobre blanco. |
| `--linea-clara` | #d8d3c8 | Filetes decorativos sobre blanco. |
| `--marino-profundo` / `--marino` / `--marino-claro` | #0f243e / #1c2b4d / #a9b8d0 | **Solo la Biografía:** los capítulos de `/biografia`, el volumen III, la tapa III y el lector de la Biografía. |
| `#c9a45c` (con `#ffffff` y `#080808`) | fuera de los tokens | **Solo el ojo de Yo Da** (y su moneda). Nunca en la interfaz del sitio. |

### 3.2 Alias por superficie

Cada superficie define los mismos alias, así cualquier componente funciona sobre cualquier fondo. Los nombres nuevos son alias de valores que ya existen.

| Alias | `.oscuro` | `.hondo` | `.claro` | `.marino` |
|---|---|---|---|---|
| `--fondo` | negro | negro-hondo | blanco | marino-profundo |
| `--texto` (luz plena) | crema | crema | negro | crema |
| `--texto-lectura` | gris-claro | gris-claro | negro | gris-claro |
| `--texto-2` (penumbra) | gris | gris | gris-tinta | marino-claro |
| `--linea` (costura) | `--linea` (#262422) | `--linea-hondo` (#221f1c, el valor de hoy) | `--linea-clara` | `--linea-marino` (#2b3f63, el valor de hoy) |
| `--borde-control` | gris | gris | gris-tinta | marino-claro |
| `--foco` | crema | crema | negro | crema |
| `--lleno-hover` | gris-claro | gris-claro | gris-tinta | gris-claro |

### 3.3 Contraste (WCAG 2.2, medido)

| Par | Relación | Uso permitido |
|---|---|---|
| crema / negro | 16,37 | todo |
| crema / negro-hondo | 16,85 | todo |
| crema / negro-suave | 15,23 | todo |
| gris-claro / negro | 13,40 | prosa |
| gris / negro | 5,70 | texto secundario (AA) y borde de control (≥ 3) |
| gris / negro-hondo | 5,86 | ídem en paneles |
| gris / negro-suave | 5,30 | rótulo sobre un medio pendiente |
| gris-tinta / negro | 2,75 | **solo decorativo o deshabilitado** |
| línea / negro | 1,28 | **solo filete decorativo** |
| negro / blanco | 18,17 | todo el volumen II |
| gris-tinta / blanco | 6,60 | texto secundario y borde de control sobre blanco |
| gris / blanco | 3,19 | **prohibido como texto** |
| crema / marino-profundo | 12,93 | todo |
| gris-claro / marino-profundo | 10,59 | prosa en la Biografía |
| marino-claro / marino-profundo | 7,79 | texto secundario y borde de control en la Biografía |
| gris / marino-profundo | 4,50 | **no se usa**: en marino, el secundario es marino-claro |
| dorado / negro-hondo | 8,68 | el ojo de Yo Da |

Reglas que salen de la tabla:

- Todo texto tiene al menos 4,5:1.
- Todo control tiene un límite de al menos 3:1, que es `--borde-control`. Hoy fallan los campos, el calendario, los chips de Yo Da y la subnavegación, porque usan `--linea` (entre 1,24 y 1,49:1).
- `--linea` nunca delimita un control.

### 3.4 Estados, sin color de acento

| Estado | Cómo se ve | Señales (nunca solo el color) |
|---|---|---|
| Reposo | texto en `--texto-2` (navegación) o `--texto` (acciones) | — |
| Pasar el puntero | se enciende: `--texto-2` → `--texto`; el subrayado o el borde pasa a `--texto` (240 ms) | luz + línea |
| Activo / página actual | `--texto`, filete de 1 px bajo la palabra (o a la izquierda en listas verticales), el emblema a opacidad 1 | luz + línea + emblema + `aria-current` |
| Presionado | el sello del emblema (`golpe`) en la navegación; en botones, nada extra | forma |
| Seleccionado (día, monto, canal) | invertido: fondo `--texto`, tinta `--fondo` | inversión + `aria-pressed` o `checked` |
| Foco | contorno de 2 px `--foco`, separado 3 px, en todo lo interactivo; en campos, además, la línea pasa a 2 px | contorno |
| Deshabilitado / no disponible | opacidad .45, `cursor: not-allowed` y la palabra («Ocupado», «sin acceso») | texto |
| Error | texto `--texto`, filete vertical de 2 px `--texto` a la izquierda, prefijo «×», `role="alert"` y `aria-describedby`; sin rojo | forma + texto |
| Éxito | el rombo dibujado delante del mensaje | forma + texto |
| Cargando | el texto del botón cambia («Enviando…») y corre una línea de 1 px bajo el botón | texto + `aria-busy` |
| «A definir» | Alegreya itálica `--texto-2`, en el lugar y la escala del dato real | texto literal |

### 3.5 Colores sueltos que se ordenan (mismo valor, con nombre)

- Las líneas sueltas pasan a tokens con el mismo valor: `.hondo --linea: #221f1c` pasa a `--linea-hondo` y `.marino --linea: #2b3f63` pasa a `--linea-marino`.
- `rgba(239, 233, 220, α)` (diez veces en `globals.css`) pasa a `color-mix(in srgb, var(--crema) α%, transparent)`: es el mismo color, con un solo origen.
- `rgba(8, 8, 8, .92)` de los botones flotantes se va, porque los botones pierden el círculo.
- El manifiesto: `app/manifest.ts` pasa de `#0b0b0b` a `#0a0a0a` (el token).
- La página 429: en `middleware.ts`, `#ece3d0`, `#b9a77f` (un dorado fuera de regla) y `#d8ceb8` pasan a crema, gris y gris claro sobre negro. Se toca solo ese CSS, coordinado con el trabajo de seguridad.
- `MarcoPagina.module.css` (`#efe9dc`) se va con MarcoPagina.
- `#c9a45c`, `#ffffff` y `#080808` de Yo Da quedan como están: son de Yo Da.

---

## 4. Tipografía

### 4.1 Familias

| Voz | Familia | Por qué |
|---|---|---|
| **La obra** | **Alegreya**, de Huerta Tipográfica (Buenos Aires), OFL, variable de 400 a 900, con itálica real | Es una romana humanista y caligráfica, del mismo tronco que el Palatino de Zapf que usan los libros. Se dibujó para literatura: texto largo con ritmo de voz. Sus remates en cuña dialogan con la gubia del linóleo. Trae itálica real: hoy, en Android, el sitio muestra itálicas falsas porque Crimson Pro se carga sin la cursiva. Sus cifras son elzevirianas por defecto. |
| **Las versalitas** | **Alegreya SC**, de la misma fundición, solo el peso 400 | Son versalitas de verdad. La Alegreya de Google Fonts no trae `smcp`, y sin esta familia el navegador fabricaría versalitas falsas: mayúsculas achicadas, de trazo flaco. |
| **El archivo** | **Archivo**, de Omnibus-Type (Buenos Aires), OFL, variable solo en peso | Es una grotesca de origen periodístico, hecha para rótulos, carteles y tablas, con cifras tabulares. Tiene la precisión de una etiqueta de museo sin el aire de SaaS de las neogrotescas de moda. Se carga sin el eje de ancho, que costaría 55 KB más. |
| **El libro** (solo en el lector) | `"Palatino Linotype", Palatino, "Book Antiqua", var(--font-alegreya), serif` | Dentro de un capítulo, la letra del libro impreso. En Android, que no tiene Palatino, se ve Alegreya, su pariente. |

- **Por qué no las habituales:** no se usan Inter, Geist, Manrope ni Space Grotesk (la letra de siempre en SaaS), ni Cormorant, Playfair, Fraunces, Instrument Serif o EB Garamond (las plantillas de lujo y de coaching). Tampoco Newsreader (1.4). No se agrega una tercera familia.
- **Las dos son de Buenos Aires.** Una obra oral, rioplatense y en voseo tiene letras rioplatenses. Además, con una sola fuente web para todos, la composición es idéntica en Mac, Windows y Android (hoy no lo es). Esa es la condición para que cada pantalla sea una lámina.

### 4.2 Carga (`app/layout.tsx`)

```ts
import { Alegreya, Alegreya_SC, Archivo } from "next/font/google";

const alegreya = Alegreya({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-alegreya", display: "swap" });
const alegreyaSC = Alegreya_SC({ subsets: ["latin"], weight: ["400"], variable: "--font-alegreya-sc", display: "swap", preload: false });
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", display: "swap" });
// <html lang="es-AR" className={`${alegreya.variable} ${alegreyaSC.variable} ${archivo.variable}`}>
```

```css
--serif: var(--font-alegreya), "Palatino Linotype", Palatino, Georgia, serif;
--versalitas: var(--font-alegreya-sc), var(--serif);
--sans: var(--font-archivo), "Helvetica Neue", Arial, sans-serif;
--libro: "Palatino Linotype", Palatino, "Book Antiqua", var(--font-alegreya), serif;
```

- **Crimson Pro se quita.**
- **Peso medido** (subconjunto latino, woff2):

  | Archivo | Peso |
  |---|---|
  | Alegreya redonda | 43 KB |
  | Alegreya itálica | 44 KB |
  | Alegreya SC | 29 KB |
  | Archivo | 35 KB |
  | **Total** | **151 KB** |

  Se precargan 122 KB (Alegreya y Archivo); Alegreya SC baja cuando se usa. Todo se sirve desde el propio sitio, compatible con la CSP (`font-src 'self'`).
- **Rasgos:** `font-feature-settings: "kern", "liga"`. En Archivo, para datos, `font-variant-numeric: tabular-nums`.
- **En `@theme inline`:** `--font-serif: var(--serif); --font-sans: var(--sans);`.

### 4.3 Escala

La escala es fluida entre 360 px y 1440 px, con tope arriba. Todas las medidas están en px con raíz de 16 px.

| Rol | Familia · peso | `font-size` | 360 | 768 | 1440+ | Interlínea | Tracking | Uso |
|---|---|---|---|---|---|---|---|---|
| Monumental | Alegreya 400 | `clamp(3.25rem, 1.5rem + 7.778vw, 8.5rem)` | 52 | 84 | 136 | .92 | −.02em | el nombre en la portada |
| Numeral | Alegreya 400 | `clamp(4.5rem, 2.333rem + 9.63vw, 11rem)` | 72 | 111 | 176 | .8 | .02em | I · II · III en /libros; 0–3 en /biografia; I–II en conferencias |
| Display (h1) | Alegreya 400 | `clamp(2.625rem, 1.667rem + 4.259vw, 5.5rem)` | 42 | 59 | 88 | 1 | −.015em | h1 de cada portadilla; títulos de volumen |
| Cita | Alegreya 400, redonda | `clamp(1.625rem, 0.917rem + 3.148vw, 3.75rem)` | 26 | 39 | 60 | 1.18 | −.005em | la frase protagonista |
| Cita larga (más de 140 caracteres) | Alegreya 400, redonda | `clamp(1.5rem, 1rem + 2.222vw, 3rem)` | 24 | 33 | 48 | 1.22 | −.005em | ídem |
| Título (h2) | Alegreya 400 | `clamp(1.75rem, 1.333rem + 1.852vw, 3rem)` | 28 | 36 | 48 | 1.1 | −.01em | secciones |
| Epígrafe | Alegreya 400, redonda | `clamp(1.375rem, 1.125rem + 1.111vw, 2.125rem)` | 22 | 26,5 | 34 | 1.3 | 0 | frases que rotan al cierre de cada página |
| Subtítulo (h3) | Alegreya 500 | `clamp(1.3125rem, 1.167rem + 0.648vw, 1.75rem)` | 21 | 24 | 28 | 1.25 | 0 | bloques de información |
| Tapa | Alegreya 400, MAYÚSCULAS | `clamp(1.125rem, 0.917rem + 0.926vw, 1.75rem)` | 18 | 22 | 28 | 1.25 | .14em | los títulos en las tapas |
| Bajada | Alegreya 400, itálica | `clamp(1.1875rem, 1.083rem + 0.463vw, 1.5rem)` | 19 | 21 | 24 | 1.45 | 0 | bajadas y preguntas de los libros |
| Cuerpo | Alegreya 400 | `clamp(1.125rem, 1.083rem + 0.185vw, 1.25rem)` | 18 | 19 | 20 | 1.6 | 0 | prosa |
| Nota | Alegreya 400, itálica | `1rem` | 16 | 16 | 16 | 1.5 | 0 | ayudas y «a definir» |
| Versalitas | Alegreya SC 400 (texto en minúscula) | `1rem` | 16 | 16 | 16 | 1.3 | .12em | firmas, pies de lámina, «Índice» |
| Folio | Alegreya SC 400 | `1rem` | 16 | 16 | 16 | 1 | .18em | · II · |
| Entrada del Índice | Alegreya 400 | `1.75rem`, y `2rem` desde 640 | 28 | 32 | — | 1.15 | 0 | el menú |
| Rótulo | Archivo 500, MAYÚSCULAS | `0.8125rem` | 13 | 13 | 13 | 1.3 | .14em | FECHA, TEMA, LIBRO I, MÚSICA DE FONDO |
| Dato | Archivo 400, tabulares | `clamp(0.875rem, 0.854rem + 0.093vw, 0.9375rem)` | 14 | 14,4 | 15 | 1.4 | .01em | fechas, horas, precios, contadores |
| Dato grande | Archivo 400, tabulares | `1.75rem` | 28 | 28 | 28 | 1.1 | 0 | horas del 1 a 1 |
| Navegación | Archivo 400 | `0.875rem` | 14 | 14 | 14 | 1 | .01em | barra |
| Botón | Archivo 500 | `0.9375rem` | 15 | 15 | 15 | 1 | .01em | `.boton`, `.boton-lleno` |
| Lector | pila `--libro`, 400 | `clamp(1.1875rem, 1.146rem + 0.185vw, 1.3125rem)` | 19 | 20 | 21 | 1.7 | 0 | cuerpo del capítulo (justificado, con partición de palabras) |

### 4.4 Reglas

- **Mínimos:** la serif nunca baja de 16 px. La sans nunca baja de 13 px, y a 13 px va solo en mayúsculas o en datos tabulares. Se quitan `.epigrafe-otra` (.68rem), `.cal-marca` (.55rem), `.cal-julian` (.72rem) y los 28 usos de `text-xs`.
- **Mayúsculas:** solo por CSS, y solo en rótulos y tapas. El texto del DOM queda en su forma normal.
- **Itálica:** para bajadas, preguntas, notas, «a definir» y la voz de Yo Da. **Nunca para las palabras de Julián**, que van en redonda. Si algún día se muestran los versículos bíblicos, irán en itálica, con la cita en versalitas, como en los libros **[Lucas]**.
- **Versalitas:** siempre con Alegreya SC y el texto en minúscula (`text-transform: lowercase`). Nunca con `font-variant: small-caps` ni `all-small-caps`, que las fabrican. Esto cambia `.firma`, el folio de IndiceLibro, «Índice» y «guía del sitio».
- **Balance:** `text-wrap: balance` en h1–h3, citas y tapas; `pretty` en párrafos.
- **Títulos:** nunca `white-space: nowrap`. Como resguardo, `overflow-wrap: anywhere`.
- **Comillas:** siempre « ». En las citas alineadas a la izquierda, la « cuelga fuera de la caja: `text-indent: -0.4em` en el primer renglón, más `hanging-punctuation: first` donde el navegador lo soporte.
- **Medida:**
  - prosa: hasta 34rem (unos 60 caracteres a 20 px);
  - epígrafe: hasta 20em;
  - cita en la zona ancha: hasta 16em.
- **Tracking:** nunca se anima `letter-spacing`. Sale de `h2.revelar` y de `.boton:hover`.
- **Capitular** (en el lector y en la apertura de capítulo): `initial-letter: 3`, con el `float` actual de 3,6 em como respaldo.

### 4.5 Voces

| Quién habla | Letra | Luz |
|---|---|---|
| Julián (frases, citas) | Alegreya redonda | crema (plena) |
| Los títulos de la obra y del sitio | Alegreya redonda | crema |
| El editor (bajadas, descripciones) | Alegreya itálica / redonda | gris claro |
| Notas, «a definir» | Alegreya itálica | gris |
| Firmas, folios, pies de lámina | Alegreya SC | gris |
| El archivo (rótulos, datos, navegación, botones, formularios) | Archivo | gris, que pasa a crema al activarse |
| Yo Da | Alegreya itálica y su ojo de píxeles | gris claro |
| Quien le escribe a Yo Da | Archivo | crema |
| El libro (lector) | pila `--libro` (Palatino) | la tinta de su superficie |

### 4.6 Números

- **Romanos** (Alegreya en mayúsculas; en folios, Alegreya SC): la estructura de la obra y del sitio. Volúmenes I a III, folios I a XVII, módulos y audios I a VIII, conferencias.
- **Arábigos elzevirianos** (Alegreya, por defecto): los capítulos, que se escriben «Cap. 2» como en los libros, y los años dentro de la prosa.
- **Arábigos tabulares** (Archivo, `tabular-nums`): fechas, horas, precios y contadores («07 / 26», «3 de 8»).

---

## 5. Grilla, espacios y silencio

### 5.1 La grilla

Es una sola grilla para la barra, las portadillas, las secciones, las fotos y el pie. Así se termina el desalineo actual entre `max-w-3xl`, `6xl` y `7xl`, y entre `px-4`, `px-5` y `px-10`.

```css
:root { --cols: 4; --margen: 1.25rem; --medianil: 1rem; --ancho-max: 100rem; --alto-barra: 3.5rem; --ancho-texto: 34rem; }
@media (min-width: 40rem) { :root { --cols: 8; --margen: 2.5rem; --medianil: 1.5rem; } }
@media (min-width: 64rem) { :root { --cols: 12; --margen: clamp(3rem, 5vw, 6rem); --alto-barra: 4rem; } }
@media (min-width: 90rem) { :root { --medianil: 2rem; } }

/* Contenedor con salida a sangre: las pistas de afuera absorben el resto. Nunca 100vw
   (en Windows 100vw incluye la barra de desplazamiento y desborda). */
.pliego {
  display: grid;
  column-gap: var(--medianil);
  grid-template-columns:
    [sangre-inicio] minmax(calc(var(--margen) - var(--medianil)), 1fr)
    [contenido-inicio] repeat(var(--cols), [col] minmax(0, calc((var(--ancho-max) - 2 * var(--margen) - (var(--cols) - 1) * var(--medianil)) / var(--cols))))
    [contenido-fin] minmax(calc(var(--margen) - var(--medianil)), 1fr) [sangre-fin];
}
.pliego > * { grid-column: contenido; }
```

### 5.2 Zonas

| Zona | Compu (12 columnas) | Tablet (8 columnas) | Celular (4 columnas) | Contenido |
|---|---|---|---|---|
| `.glosa` | `col 1 / span 3` | `col 1 / span 2` | `contenido` (va arriba del bloque) | el margen del libro: número de capítulo, rótulos, notas, el numeral sticky |
| `.obra` | `col 4 / span 7` | `col 3 / span 6` | `contenido` | la pieza; la prosa, dentro, a 34rem |
| `.ancha` | `col 4 / span 8` | `col 3 / span 6` | `contenido` | títulos Display y citas |
| `.aire` | `col 11 / span 2` | no existe | no existe | vacío deliberado: nunca se llena |
| a sangre | `sangre-inicio / col 6`, `col 8 / sangre-fin`, `sangre` | ídem, adaptado | `sangre` o al 84 % apoyado en un borde | fotos, grabados, superficies de libro |

Regla **[prueba]**: ningún `.revelar` va dentro de algo que desaparece según la pantalla (`display: none` en un breakpoint, la zona `aire`, un numeral solo de compu). El observador nunca lo ve, no recibe `.visto`, y `revelar.spec` falla en el proyecto «celular».

### 5.3 Espacios

La escala tiene base 4:

| Token | Valor |
|---|---|
| `--e-1` | 4 |
| `--e-2` | 8 |
| `--e-3` | 12 |
| `--e-4` | 16 |
| `--e-5` | 24 |
| `--e-6` | 32 |
| `--e-7` | 48 |
| `--e-8` | 64 |
| `--e-9` | 96 |
| `--e-10` | 128 |
| `--e-11` | 192 |
| `--e-12` | 256 |

### 5.4 Silencios

El ritmo vertical deja de ser el mismo `py-20` en todas partes.

| Token | Valor | 360 → 1440 | Uso |
|---|---|---|---|
| `--pausa` | `clamp(3rem, 2.333rem + 2.963vw, 5rem)` | 48 → 80 | entre bloques de una misma pieza |
| `--silencio` | `clamp(6rem, 4.333rem + 7.407vw, 11rem)` | 96 → 176 | entre piezas |
| `--sala` | `clamp(9rem, 6rem + 13.333vw, 18rem)` | 144 → 288 | cambio de idea o de superficie |
| `--plano-negro` | `min(40svh, 20rem)`; desde 1024, `min(56svh, 34rem)` | — | **una sola vez en todo el sitio**: entre la portada y la frase del inicio, cruzado por el hilo (13.2) |

### 5.5 Reglas de composición

1. **Asimetría anclada.** La pieza se apoya en una línea de la grilla (columna 1, 4 u 8, o el margen), nunca en el centro geométrico. Se centran solo el umbral, los folios, el ◆ ◆ ◆ (sobre la columna del último bloque) y la Masterclass 1 a 1, entera, a propósito.
2. **Aire en las láminas:** el vacío ocupa al menos el 40 % de la pantalla.
3. **Una sola pieza de separación por página:** el Divisor, solo en el inicio, y el ◆ ◆ ◆ al final. Se acaba la pila «Divisor + ◆ ◆ ◆ + epígrafe».
4. **Entre superficies distintas, el corte de color es el divisor.** Sin línea.
5. **Se termina la costura:** las secciones ya no alternan `.hondo` y `.oscuro` con un borde arriba. El cambio de plano lo marca el espacio. `--negro-hondo` queda para paneles, pie y umbral.
6. **Anclas:** `html { scroll-padding-top: calc(var(--alto-barra) + 1.5rem); }` para que las anclas no queden bajo la barra.

---

## 6. Componentes y estados

### 6.1 Botones

| Clase | Aspecto | Uso |
|---|---|---|
| `.boton` | Alto mínimo 44 px; relleno `0 1.25rem`; borde de 1 px `--borde-control`; Archivo 500, 15 px; texto `--texto`; sin radio ni sombra. Al pasar el puntero o con foco, el borde pasa a `--texto` (se enciende) en 240 ms, sin cambiar tracking ni tamaño. | acción |
| `.boton-lleno` | Fondo `--texto`, texto `--fondo`. Al pasar el puntero, el fondo pasa a `--lleno-hover`. | **Uno por pantalla**, y solo para el paso siguiente de algo empezado: pagar, reservar un horario, entrar a la sala, desbloquear, sumarme, leer. En la portada y en las páginas de presentación no hay ninguno. |
| `.boton-texto` | Sin caja; subrayado de 1 px `--texto-2` que se enciende. 44 px de alto táctil. | acciones secundarias: «Avisame cuando haya novedades», «Otra frase», «Ver la conferencia» |
| `.boton-chico` | 36 px visibles; 44 px de área con un `::before` de −4 px. | calendario, agenda, Yo Da, música |

- En celular, solo los botones de envío de los formularios van a todo el ancho. Los demás miden lo que su texto.
- Se conservan las clases `.boton`, `.boton-lleno` y `.boton-chico`, y los `data-sonido` **[prueba]**: el sonido depende de ellos.
- Salen el magnetismo, `.llamado` y la animación de `letter-spacing`.
- Deshabilitado: `opacity: .45` y `cursor: not-allowed`, como hoy.

### 6.2 Enlaces

- `.enlace` lleva un subrayado propio: un fondo de 1 px, a .2 em de la línea de base, en `--texto-2`.
- Al pasar el puntero o con foco, encima se dibuja otro subrayado en `--texto`, de izquierda a derecha (`background-size` de 0 a 100 %, 320 ms, `--tinta`).
- El pie deja `hover:underline` y usa `.enlace`.
- Sin flechas. Los enlaces externos siguen abriendo aparte, como hoy, sin cambiar su texto (ni su nombre accesible).

### 6.3 Rótulo y ficha

- **`.rotulo`:** Archivo 500, 13 px, MAYÚSCULAS, .14em, `--texto-2`.
- **`Ficha`** (`components/Ficha.tsx`, nuevo) es un `<dl>`:
  - Cada fila es un `<div>` con `<dt>` (el rótulo) y `<dd>` (el valor). Entre filas, un filete de 1 px `--linea`.
  - Desde 640 px, rótulo y valor van lado a lado; por debajo, apilados.
  - El valor práctico (fechas, horas, precios, modalidad) va en Dato. El valor de obra (títulos, preguntas) va en Alegreya.
  - Un valor pendiente («Fecha a definir», «Precio a definir», «Duración a definir») se muestra con el rótulo (FECHA) y, en el valor, «a definir» en Nota. Va en el lugar y a la escala del dato real, y las palabras «a definir» quedan literales.
- **[prueba]:** cuando una prueba lee el texto exacto, el `data-testid` va en el `<dd>`. Por ejemplo, `estado-{libro}` tiene que decir exactamente «Próximamente».

### 6.4 Lo que falta: cuatro clases

1. **Estado real** («Próximamente»): un valor firme en la ficha, en `--texto`.
2. **Falta un dato** («Fecha a definir», «Tema a definir», «Duración a definir», «Precio a definir», «USD 20 (a definir)»):
   - Va en su lugar y a la escala del dato real, en itálica `--texto-2`. Si la fecha de una conferencia es grande, el «a definir» también lo es: el hueco es deliberado.
   - En listas (3 directos, 8 módulos, 8 audios) no se repite. La estructura (numerales y títulos) se ve entera, y un solo rótulo de grupo cubre lo que falta: «Fechas y temas a definir», «Temas y duraciones a definir».
3. **Falta un texto** («(Texto a definir)», «(Texto legal, a definir)», «(Texto acerca de Julián, a definir)»): va como **galera de imprenta**. `.marcador-bloque` se rehace así:
   - El marcador literal va arriba, en Nota.
   - Debajo van tres filetes de 1 px `--linea`, separados por el interlineado del cuerpo (1,6 em), en la medida real de la prosa. El último filete mide el 62 % del ancho.
   - Sin borde punteado. Se conservan `data-marcador` y el texto literal, que lee `esMarcador` **[prueba]**.
   - El marcador en línea (`.marcador`) queda en itálica `--texto-2`, sin borde.
4. **Falta un medio** («(Video, a definir)», «(Video del módulo, a definir)»): un marco con la proporción final (16:9) en `--negro-suave`, sin borde, con el marcador literal abajo a la izquierda en Nota. El emblema del capítulo, al 12 % en el centro, va solo si el vínculo existe y está confirmado. Hoy no hay ninguno.

Nunca se escribe «lo escribe Julián», ni «Próximamente» donde en realidad falta un dato.

### 6.5 Formularios

- **Etiqueta:** siempre visible, arriba. Archivo 400, 14 px, `--texto-lectura`. Los obligatorios dicen «(obligatorio)» en texto.
- **Campo:** línea inferior de 1 px `--borde-control` (5,7:1), 48 px de alto, valor en Alegreya en Cuerpo. Con foco, la línea pasa a 2 px `--texto` y se suma el contorno global. El `textarea` lleva un marco de 1 px `--borde-control`.
- **Ayuda:** en Nota, debajo del campo, vinculada con `aria-describedby`.
- **Error del campo:** debajo, en `--texto`, con un filete de 2 px a la izquierda y el prefijo «×» (U+00D7, que no cuenta como emoji). Lleva `aria-invalid="true"` y `aria-describedby`. El resumen del formulario conserva `mensaje-error` y `role="alert"` **[prueba]**.
- **Radios con forma de botón** (CanalContacto, MontoVoluntad): segmentos rectangulares de 1 px `--borde-control`; el elegido va invertido.
- **Zona horaria:** se lee como una frase («Ves los horarios en ___»), con subrayado y sin caja.
- **Trampas y Desafío:** la lógica no cambia. El Desafío se compone como una ficha: «Confirmá que sos una persona», casilla de 24 px con borde `--borde-control` y el rombo dibujado al verificar. Se conservan `desafio`, `desafio-casilla` y `desafio-token` **[prueba]**.
- **En `/ingresar`:** nunca va un `<form>` antes del de ingreso **[prueba]**.

### 6.6 Estados de proceso

- **Cargando:**
  - el botón muestra su texto actual («Enviando…», «Revisando…»);
  - el formulario lleva `aria-busy="true"`;
  - por el borde inferior del botón corre una línea de 1 px (`transform: scaleX`, 1200 ms), en bucle solo mientras dura;
  - con reducir movimiento, la línea queda quieta.
- **Éxito** (`mensaje-ok`): se compone como un recibo, con el rombo, el mensaje y, si hay una hora, `Hora`.
- **Vacío** (`espacio-vacio` y las listas sin nada): el ojo cerrado (32 px, `--texto-2`), una línea en Nota y los caminos como un índice.

### 6.7 Líneas, divisores y el rombo

- **Filete:** 1 px `--linea`. Tiene tres largos:
  - corto (3rem), para abrir un bloque en la glosa;
  - de columna, para listas e índices;
  - a sangre, solo entre dos piezas de la misma superficie.
- **Divisor** (el ojo que se abre): se usa una sola vez en todo el sitio, en el inicio, antes de «Quién es».
- **Ornamento ◆ ◆ ◆:** una vez por página, al final, pegado al último bloque y centrado en su columna, en `--texto`. En los libros va en el color de acento; acá el acento es la luz.
- **El rombo se dibuja** (`components/Rombo.tsx`, nuevo): un SVG de .42 em en `currentColor`. Alegreya y Archivo no traen U+25C6, así que escrito saldría con una fuente distinta en cada sistema. Se usa en el Ornamento, en «Otra frase», en los mensajes de éxito, en el Desafío y en la marca «tu encuentro» del calendario.
- **La pluma y la orla se van:** salen el Trazo (la pluma) y MarcoPagina.
- **MarcasImprenta queda reducida** a cuatro marcas de corte de 10 px alrededor del grabado de las portadillas de tipo sala, en `--gris-tinta`: el grabado montado como una plancha en su pase.

### 6.8 Índice (IndiceLibro)

Se conserva: es la pieza más editorial del sitio. Pasa a ser la letra de todos los índices: el del inicio, el de volúmenes de /libros, el pie, los módulos de la grabada y el recibo del checkout. Cambia en esto:
- el folio pasa a Alegreya SC (hoy es `all-small-caps` fabricado);
- «Índice» también va en Alegreya SC;
- las notas van en Nota;
- los ítems salen de `portadillas` (7.5).

### 6.9 Epígrafe

- **Voz:** redonda (es la voz de Julián), en `--texto`, a la escala Epígrafe. En el inicio va a la escala Cita, con la prop `tamano="cita"`.
- **Alineación:** a la izquierda de su columna (zona ancha), con la « colgada.
- **Firma:** el emblema del capítulo de la frase (18 px, decorativo) y «Julián Bermúdez · {libro}, cap. {n}» en Alegreya SC. El capítulo y el emblema salen de `frases.ts` y `capitulos`; no se escribe nada a mano. La prueba exige que el `figcaption` contenga el título del libro, y lo sigue conteniendo **[prueba]**.
- **«Otra frase»:** `.boton-texto` de 44 px, Archivo 14 px, con el rombo dibujado.
- **Prop nueva `excluir`:** la frase que no debe salir en esa página. El inicio excluye `citas.observador`, que ya está fija al cierre.
- **Contratos:** se conservan `data-testid="epigrafe"`, el `blockquote .sr-only`, el `aria-live` y el barajado en `localStorage` **[prueba]**.

### 6.10 Tapa (nuevo: `components/Tapa.tsx`)

Cuando la trilogía aparece como objeto, se ve siempre igual: la composición de sus tapas impresas (`diseño/portadas/La trilogía - tapas.jpg`), armada en HTML, no como imagen.

- **Superficie:** la del libro. I `.oscuro`, II `.claro`, III `.marino`.
- **Composición**, de arriba abajo y centrada como en la tapa:
  1. el numeral romano, en Folio;
  2. el título, en Tapa;
  3. el rombo dibujado;
  4. el grabado del corazón del cap. 1: `el-sentimiento` (Receta), `libertad-interna` en tinta negra (Pensamiento) **[herramientas]** y `el-reconocimiento` (Biografía);
  5. la pregunta, en Bajada `--texto-2`.
- **Tamaños:** `grande` para el inicio y `chica` para la biblioteca de Mi espacio y la salida de /biografia.
- **Enlace:** la tapa entera es un enlace y su nombre accesible sale del contenido («I La Receta de la Manifestación ¿Cómo funciona?»). El foco es un contorno de 2 px `--foco` hacia adentro (`outline-offset: -8px`), porque en el inicio la tapa llega al borde de la ventana.
- **[Lucas]** Si prefiere no mostrar la composición de las tapas antes de que salgan los libros, la Tapa usa el ojo del cap. 2 con la misma composición.

### 6.11 Sincronía (nuevo: `components/Sincronia.tsx`)

«La trilogía, capítulo a capítulo», como la tabla impresa al final de cada libro.

- **Estructura:** una `<table>` con su `<caption>` visible.
  - Encabezados de columna con `scope="col"`: I · La Receta de la Manifestación, II · El Pensamiento es Tu Fe, III · Biografía, y Motivo.
  - Encabezados de fila con `scope="row"`: el número del capítulo, en Título.
  - Filas del 0 al 6.
- **Celdas:** el emblema (28 px) y el título del capítulo en Cuerpo. Las celdas sin capítulo (las «—» del libro) se componen como vacío: un filete de 16 px centrado y el texto «Sin capítulo» solo para lectores de pantalla. Nunca se rellenan.
- **Interacción** (con puntero fino o con foco): al pasar o enfocar una fila, sus emblemas quedan a opacidad 1 y los demás bajan a .35 (480 ms). Un número, tres facetas. Cada título enlaza a su capítulo en el índice del volumen (`/libros#receta-cap-2`).
- **Datos:**
  - `capitulos`, que ya existe;
  - `motivos`, nuevo en `content/config.ts`, copiado de la tabla de CLAUDE.md: la luz del principio, el corazón, el ojo, el tiempo de la práctica, océano y desierto, la llama, la espiral. **[Lucas]**: mostrar o no esa columna.
  - La numeración sale de los datos, porque el orden de Pensamiento espera la Hoja, punto 51.
- **En celular:** siete fichas, una por número, con sus tres renglones y el motivo.

### 6.12 Sala de lectura (nuevo: `components/SalaDeLectura.tsx`)

Ver 13.4.

### 6.13 Cursor, selección y barra de desplazamiento

- **Cursor:** el nativo, con `pointer` solo en lo interactivo. Sale CursorAnillo.
- **Selección:** `::selection` con fondo `--texto` y texto `--fondo`, en cada superficie.
- **Barra de desplazamiento:** `scrollbar-width: thin; scrollbar-color: var(--gris-tinta) var(--fondo);`.
- **Lo único que sigue al puntero son los ojos:** el grabado del umbral y el de la portada (`mira`), el OjoVivo de la barra y la pupila de Yo Da.

---

## 7. Navegación

### 7.1 La barra

- **Medidas y fondo:** alto `--alto-barra` (56 px; 64 px desde 1024) más `env(safe-area-inset-top)`, sobre `--negro`.
- **Nunca se esconde** **[prueba]**: el recorrido de Yo Da ilumina sus elementos, y a 1280 px las pruebas no solo esperan ver `instalar-nav`: `app.spec` lo toca en /app para abrir la instalación del navegador.
- **Arriba de todo no tiene línea:** se funde con la página. Después de 60 px de scroll (`html.bajo`) aparece el filete inferior de 1 px `--linea`, con la opacidad de un pseudoelemento (240 ms). `html.bajo` se calcula también con reducir movimiento, porque no es movimiento: hoy Atencion no corre en ese modo.
- **Izquierda:** el OjoVivo (26 px) y «Julián Bermúdez» (Alegreya 400; 18 px, o 16 px por debajo de 400 px), que llevan al inicio.
- **Desde 1280, navegación completa:**
  - los enlaces de `enlaces` (Navegación, `--texto-2`), cada uno con su emblema de 16 px (opacidad .55; 1 en el activo y al pasar el puntero) y el sello `golpe` al tocarlo;
  - después, «Instalar la app» (`instalar-nav`, enlace de texto);
  - al final, «Ingresar» o «Mi espacio» (`.boton .boton-chico`);
  - ocupa unos 1.230 px.
- **De 1024 a 1279, navegación compacta:** los mismos enlaces, sin emblemas y sin «Instalar la app» (que queda en el pie y en /app), más la cuenta. Ocupa unos 925 px. Tablets apaisadas y notebooks chicas dejan de ver el menú del celular.
- **Por debajo de 1024:** «Ingresar» o «Mi espacio» (`cuenta-movil`, `.boton-chico`) y «Menú» (texto con subrayado, 44 px de alto) **[prueba]**. A 360 px entra entera: 344 px sin sesión y 359 px con «Mi espacio».
- **Activo** (`aria-current="page"`): crema, un filete de 1 px bajo la palabra y el emblema a opacidad 1.
- **Contratos que se conservan** **[prueba]**:
  - las clases `.nav-enlace` y `.nav-icono`, y el sello `golpe`;
  - `data-sonido="nav"` y `data-nota`;
  - `aria-label="Principal"`;
  - los `data-recorrido`: `libros`, `masterclass`, `conferencias`, `fragmentos`, `lista`, `menu`, `instalar` y `cuenta`.
- **`enlaces`:** Libros · Biografía (desde la fase 5) · Fragmentos · Masterclass · Conferencias · Sumate. El emblema de Biografía es `biografia-1-el-reconocimiento`.

### 7.2 El Índice (el menú, por debajo de 1024)

- **Forma:** pantalla completa sobre `--negro-hondo`, con z 55, y una fila superior idéntica a la barra: el ojo y el nombre a la izquierda, «Cerrar» en el lugar de «Menú». Es `<nav id="menu-movil" aria-label="Principal">` **[prueba]**.
- **Grupos**, con su rótulo **[Lucas: nombres de los grupos]**:
  - **La obra:** II Libros · III Biografía · IV Fragmentos.
  - **Los encuentros:** V Masterclass · VI Masterclass 1 a 1 · VII Masterclass grabada · VIII Conferencias.
  - **El acceso:** IX Sumate · X Canjeá el código de tu libro · XI La app.
- **Renglones:** el folio (Alegreya SC, `--texto-2`), el título (Entrada del Índice) y el emblema a la derecha. Los enlaces principales son `NavEnlace`, con la clase `.nav-enlace` **[prueba]**. El renglón actual va en crema, con un filete de 1 px a la izquierda y `aria-current`.
- **Al pie:** «Instalar la app» (`instalar-menu`) e InterruptorSonido. En tablet, los grupos van en dos columnas.
- **Accesibilidad que hoy falta:**
  - atrapa el foco;
  - Escape lo cierra;
  - al cerrarse, el foco vuelve a «Menú»;
  - el resto queda `inert` y la página no se desplaza detrás.
- **Movimiento:** entra con un fundido de 320 ms y los renglones llegan en cascada (40 ms entre uno y otro, con opacidad y 6 px). Se conserva el cierre 480 ms después de navegar, para que se vea el sello.

### 7.3 Subnavegación de la masterclass

- Deja el `-mt-6` sobre la portadilla, que hoy choca con el folio, y entra en la portadilla como `children`, debajo de la bajada.
- Son tres pestañas de texto en Archivo de 14 px: «En vivo · 1 a 1 · Grabada», con esos textos y en ese orden **[prueba]**.
- La activa va en crema, con un filete inferior de 2 px y `aria-current`; las otras, en `--texto-2`. Cada pestaña tiene 44 px de alto.
- Se conservan `data-testid="subnav-masterclass"` y `aria-label="Masterclass"` **[prueba]**.

### 7.4 El pie: colofón

- **Superficie:** `--negro-hondo`, sobre la grilla.
- **Columna 1:** el Ojo, «Julián Bermúdez» y el dominio.
- **Columna 2:** el índice completo, en dos columnas de folio y título (desde `portadillas`).
- **Columna 3:**
  - los legales: Términos, Privacidad, Reembolsos y el Botón de arrepentimiento, que se ve siempre;
  - Instalar la app;
  - InterruptorSonido;
  - las redes.
- **Última línea:** «Julián Bermúdez · MMXXVI», en Alegreya SC `--texto-2`. El año se unifica en romanos.
- Todo con `.enlace` y 44 px de área táctil.
- **[prueba]** El InterruptorSonido y el enlace «Botón de arrepentimiento» del pie tienen que seguir siendo los últimos de su tipo en la página, porque `interaccion.spec` y `publico.spec` usan `.last()`. No se agrega otro interruptor después del pie, tampoco en el panel de música.

### 7.5 Folios: una sola fuente

`portadillas`, en `content/config.ts`, pasa a tener por página `folio`, `titulo`, `ruta`, `grabado` y `emblema`. De ahí salen la barra, el Índice, el pie, el índice del inicio y las portadillas. Se borran los folios escritos a mano (inicio, checkout, 404 y sin conexión).

| Folio | Página | Folio | Página |
|---|---|---|---|
| I | Portada | X | Canjear |
| II | Los libros | XI | La app |
| III | Biografía | XII | Ingresar |
| IV | Fragmentos | XIII | Crear cuenta |
| V | Masterclass en vivo | XIV | Legales y arrepentimiento |
| VI | Masterclass 1 a 1 | XV | Checkout |
| VII | Masterclass grabada | XVI | Esta página no existe |
| VIII | Conferencias | XVII | Sin conexión |
| IX | Sumate | | |

Primero la obra, después los encuentros, al final el acceso.

### 7.6 Siempre se sabe dónde se está

- **El folio al pie de cada portadilla**, centrado, como los folios de los libros («· II ·»). Es el único lugar donde va: sale la firma «Julián Bermúdez · II» de arriba.
- **El activo** en la barra y en el Índice.
- **`.avance`:** la línea de 1 px de arriba se conserva, con `transform`.
- **La glosa como titulillo.** En las páginas largas (Libros, Biografía, Legales), la glosa lleva pegado arriba el número del volumen, del capítulo o de la parte, con `position: sticky` y sin JavaScript. Es el titulillo de los libros llevado a la pantalla.

### 7.7 Mi espacio

- **Desde 1024:** NavEspacio es vertical y va en la glosa (sticky), con un filete que separa lo de todos de lo de Julián (Agenda, Seguridad, Consultas).
- **Por debajo de 1024:** pestañas horizontales como hoy, con `aria-label="Tu espacio"` y «Agenda» visible a 360 px **[prueba]**.
- **Lo bloqueado se ve:** texto `--texto-2` a .6 y la palabra «sin acceso» a la vista. Hoy solo la leen los lectores de pantalla.

---

## 8. Fotografía y grabados

### 8.1 Duotono con la tinta del sitio [herramientas]

Las contratapas imprimen la foto de Julián en duotono, con los colores de cada libro (`herramientas/contratapas_fotos.py`). El sitio hace lo mismo: cada foto se imprime con la tinta de la superficie donde aparece.

- **Sobre negro:** sombras `--negro` (#0a0a0a) y luces `--crema` (#efe9dc). Desaparece el blanco puro (hoy la mirada tiene fondo #ffffff), y las seis fotos quedan con un solo tono: las neutras y las cálidas se unifican.
- **Sobre marino** (/biografia): sombras `--marino-profundo` (#0f243e) y luces `--crema`, como la contratapa de la Biografía. El fondo de la foto se funde con la página.
- **Grano:** el de imprenta, horneado en el archivo (ruido σ 4, el método de `contratapas_fotos.py`), con el contraste de hoy (`autocontrast` más 1,08–1,12).
- **Salida con otro nombre**, sin pisar las actuales:
  - `public/fotos/{nombre}-tinta-{720|1200|2000}.webp`;
  - `public/fotos/{nombre}-marino-{720|1200}.webp`.

  Los originales quedan en `diseño/fotos/`.
- **En CSS no hay ningún `filter`:** sale el `grayscale(1) contrast(1.04)` y su transición al pasar el puntero.

### 8.2 Formatos: los de las fotos reales

| Formato | Proporción | Fotos |
|---|---|---|
| Retrato | 2:3 | chef, doble exposición |
| Retrato | 4:5 | trofeo, emplatando, movimiento |
| Panorámica | 2,47:1 | mirada |
| Recorte vertical | 0,85:1 | `julian-mirada-vertical` (680 × 801): lo máximo que da el original de 2000 × 808; se usa al 88 % del ancho como mucho, no a pantalla completa |

- No se recortan a otra proporción.
- Llevan siempre `width` y `height`, para que la página no salte al cargar.

### 8.3 Composición

- **Sin marco, sin giro y sin viñeta:** salen el relleno, el `--giro` y la sombra interior de `.foto-marco`. La clase se conserva **[prueba]**.
- Van a sangre o alineadas a una línea de la grilla; nunca centradas porque sí.
- Las fotos claras (doble exposición, movimiento, mirada) se leen como placas de luz sobre la sala; las oscuras (chef, trofeo, emplatando) se funden con el negro. Se alternan.
- En celular va una por pantalla, al 84 % o al 68 % del ancho, apoyada en un borde, alternando lados.

### 8.4 Pies

- Van debajo, alineados a la izquierda de la foto, en Alegreya SC `--texto-2`.
- Son los que ya existen: «El Gran Premio de la Cocina · 2021», «En la cocina», «Retrato», «Julián Bermúdez».
- Nunca se inventa un lugar, una fecha ni un crédito. «Créditos a definir» aparece una sola vez, en la ficha «Hoy» de /biografia **[Lucas]**.

### 8.5 Superposición tipográfica: un solo caso

En la portadilla de /biografia, el h1 «Biografía» cruza sobre el fondo oscuro del retrato de chef.
- Julián está de perfil y mira hacia la derecha: el título va en la dirección de su mirada, por delante de la cara y nunca encima.
- La zona que cruza es el margen derecho de la foto, oscuro y parejo (entre #1e1e1e y #3b3b3b en el archivo actual). La crema sobre esa zona da más de 9:1.

En ningún otro lugar va texto sobre una foto, ni velos, ni degradados.

### 8.6 Revelado

- La cortina se conserva y termina en `clip-path: inset(0)` **[prueba]**. Abre de abajo hacia arriba, como la imagen que aparece en la cubeta de revelado, en 1200 ms con `--tinta`.
- A la vez, la imagen de adentro pasa de `scale(1.04)` a 1 (en puntero grueso, desde 1.02).
- Al pasar el puntero (compu): `scale(1.02)` en 1600 ms, dentro de `overflow: hidden`.

### 8.7 Grabados

- **Derechos:** sin giro (`.lamina`) y sin segunda pasada (`pasada`, `fantasma-tinta`).
- **Se estampan** con la máscara radial actual, que es identidad, una sola vez por vista: 2400 ms en el umbral y en la portada, 1600 ms en las portadillas. En las tapas y en la sincronía aparecen con opacidad.
- **Tamaños:** `srcset` de 400, 700–800 y 1100 px, con `sizes` reales **[herramientas]**: versiones de 400 px de todos, y `observador-crema` también en 700 px. Llevan `loading="lazy"` y `decoding="async"`, salvo el Observador del umbral y de la portada, que va con `fetchpriority="high"` y, en `/`, precargado con `preload` de `react-dom` (la versión de 700 px).
- **La tinta según la superficie:** crema sobre negro y sobre marino; negra sobre blanco. Se exportan en tinta `--negro` los que van sobre blanco (`libertad-interna` y los siete emblemas del Pensamiento), con el mismo motor de `cross_emblems.py`/`assets.py` **[herramientas]**. Sale el `invert`, que da un negro azulado (#111723).
- **Nuevo en la web:** `poner-a-prueba` (Biografía, cap. 3), exportado de `diseño/grabados/Biografía 3 - Poner a prueba.png` **[herramientas]**.

### 8.8 Emblemas

| Dónde | Tamaño |
|---|---|
| barra | 16 px |
| firmas | 18 px |
| índices | 20–24 px |
| sincronía | 28 px |
| lector | 112 px |

- Son siempre decorativos (`alt=""`) cuando el texto de al lado los nombra.
- El surf y los clavos no son capítulos: no se muestran, y se van con Flotantes.

---

## 9. Motion

### 9.1 Principios

1. **Revela, no decora.** Cada animación contesta qué aparece y por qué ahora.
2. **Solo `opacity`, `transform` y `clip-path`/máscaras en elementos chicos.** Nunca `filter`, `blur`, `letter-spacing`, `width`, `height`, `flex`, `top`/`left`, `box-shadow`, `backdrop-filter` ni `mix-blend-mode`.
3. **Una sola vez.** Lo que ya se reveló no vuelve a animarse.
4. **Lento para entrar, rápido para salir.**
5. **Nada infinito**, salvo la respiración del ojo del umbral, los parpadeos del OjoVivo y de Yo Da, y las barras de la música mientras suena. Todo bucle se pausa fuera de pantalla y con la pestaña oculta.

### 9.2 Tokens

```css
--t-toque: 120ms;     /* presión */
--t-luz: 240ms;       /* color, borde, línea de la barra, salidas */
--t-trazo: 320ms;     /* subrayado, Índice */
--t-panel: 480ms;     /* paneles, cambio de página */
--t-revelado: 720ms;  /* bloques */
--t-renglon: 900ms;   /* títulos */
--t-lamina: 1200ms;   /* fotos, línea de carga */
--t-estampa: 1600ms;  /* grabados de portadilla (2400ms en el umbral y la portada) */
--t-respira: 6400ms;  /* el ojo del umbral */

--lento: cubic-bezier(.22, .61, .36, 1);  /* se conserva */
--tinta: cubic-bezier(.16, 1, .3, 1);     /* llega decidida y se asienta */
--sala-curva: cubic-bezier(.65, 0, .35, 1); /* escenas: la pupila, el umbral (no confundir con el silencio --sala) */
--sale: cubic-bezier(.7, 0, .84, 0);      /* salidas */
--respira: cubic-bezier(.37, 0, .63, 1);  /* el bucle del ojo */
```

### 9.3 Patrones

| Patrón | Qué hace | Detalle |
|---|---|---|
| Revelado de bloque (`.revelar` → `.visto`) | opacidad de 0 a 1 y `translateY` de 12 px a 0 | `--t-revelado`, `--tinta`; 60 ms entre hermanos, máximo 4 (240 ms). **Sin blur** en ningún dispositivo. Se conservan `.revelar`, `.visto`, Revelar.tsx y el seguro de 7 s **[prueba]**. |
| Título por máscara (TituloTinta) | cada palabra, o cada renglón cuando hay `lineas`, sube de `translateY(105%)` a 0 dentro de su máscara (`overflow: clip`) | `--t-renglon`, `--tinta`; 60 ms entre palabras y 110 ms entre renglones; 1,2 s como máximo. La máscara deja aire arriba (`padding-block: .12em` con margen negativo) para no cortar las tildes (Á, ú). Salen el blur por letra y el filtro `#tinta-rugosa` de los h1. El h1 conserva su `aria-label` **[prueba]**. |
| La tinta del nombre | `filter: url(#tinta-rugosa)` quieto | Solo en el nombre de la portada, después de que termina su animación (clase `asentado`), con puntero fino y sin `forced-colors`. Es el único lugar donde la letra toca la tinta del linóleo. |
| Frase (Epígrafe, Sala de lectura) | las palabras llegan en opacidad | 40 ms entre palabras, 1,2 s como máximo (si la frase es larga, el intervalo se achica). Se conserva `.palabras .p` **[prueba]**. |
| Estampa del grabado | la máscara radial actual (`@property --revelado`) | Una por vista (8.7). |
| Cortina de foto | 8.6 | termina en `inset(0)` **[prueba]** |
| El hilo | la línea de 1 px bajo la portada crece con el scroll, atraviesa el silencio y llega a la frase | CSS con `animation-timeline: view()`, `scaleY` de .12 a 1. Sin soporte o con reducir movimiento, queda quieta y entera. |
| Parallax mínimo | el grabado de la portada sube más lento (hasta −8 %) y baja al 40 % de opacidad; la mirada se desplaza ±4 % dentro de su marco | Solo en esos dos lugares, con CSS scroll-driven dentro de `@supports (animation-timeline: view())`, con puntero fino y sin reducir movimiento. `animation-timeline` se declara después del atajo `animation`. |
| Cambio de página (`template.tsx`, `.entrada`) | opacidad de 0 a 1 | `--t-panel` (hoy 0,9 s) |
| Corte seco | el paso de negro a blanco o a marino no se funde: corta, como el cine y como la página | se anima el contenido nuevo, no el fondo |
| Paneles (Yo Da, música) | 16–24 px de `translate` más opacidad | entrada `--t-panel` `--tinta`; salida `--t-luz` `--sale` |
| Índice | fundido y renglones en cascada | 320 ms, 40 ms entre renglones, 6 px |
| Tapas (puntero fino) | el grabado de la tapa señalada, `scale(1.03)`; el contenido de las otras dos, opacidad .55 | 720 ms / 480 ms. **No se anima `flex` ni el ancho.** |
| Carga | línea de 1 px con `scaleX` en bucle | solo con `aria-busy` |
| Respiración | el ojo del umbral: `scale` de 1 a 1.012 y vuelta; opacidad de .9 a 1 y vuelta | `--t-respira`, `--respira` |

### 9.4 El umbral: la coreografía

| Momento | Qué pasa |
|---|---|
| 0 ms | `--negro-hondo` y silencio. |
| 300 ms | El Observador se estampa (2400 ms). |
| 1600 ms | Aparece «Te damos la bienvenida» (opacidad y 8 px, 900 ms). |
| 2000 ms | Aparecen la firma, «Tocá el ojo para entrar» y el aviso legal del pie (900 ms). La indicación late como hoy (3,6 s). |
| En reposo | El ojo respira. Con puntero fino, la imagen sigue al puntero ±6 px (`mira`); en el celular hace una sacada lenta cada 4 a 6 s. |
| Al tocar el ojo, 0 ms | Suena el cuenco si el sonido está activado. Se agrega `umbral-saliendo`. Los textos se apagan (240 ms, `--sale`). |
| 0–1100 ms | **La pupila se dilata.** Un disco `--negro-hondo`, centrado en el iris del grabado (50 % 50 %; verificarlo a ojo con el archivo), crece con `transform: scale()` hasta cubrir la pantalla (`--sala-curva`). A la vez, el grabado se acerca: `scale` de 1 a 1.18, con el origen en el iris. Es una sola capa chica que se escala: sin máscaras de pantalla completa y sin blur. |
| 900 ms | Se emite `umbral:abierto` y se saca `en-umbral` (contrato). |
| 1100–1900 ms | La capa del umbral pasa de opacidad 1 a 0 (800 ms). Detrás, la portada ya empezó su propia aparición (13.2). |
| 1300 ms | La barra aparece (480 ms) con el OjoVivo **cerrado**. |
| 1700 ms | **El ojo de la barra se abre por primera vez** (párpado de 600 ms): el ojo que cruzaste te mira desde arriba. |
| 2500 ms | `umbral-visto` (contrato). |
| 5200 ms | Se saca `umbral-saliendo` (como hoy). |

- **Salen:** el ojo escalado ×7,5, el destello radial, el iris con máscara animada a pantalla completa y el `despertar` (blur de 10 px y escala sobre todo `main`).
- **Con reducir movimiento:** se entra directo, como hoy.
- **Con puntero grueso:** es igual, porque todo es `transform` sobre capas chicas.

### 9.5 Lo que no se anima nunca

- Formularios, calendario, checkout, Mi espacio, agenda, sala, lector, legales y precios. Ahí solo hay cambios de color de 120 a 240 ms.
- El texto corrido, párrafo por párrafo: entra con su bloque.
- Los fondos de sección y las superficies (cortes secos).
- `main` entero.

### 9.6 Reducir movimiento

- Se conserva el corte global actual. Todo aparece en su estado final y el umbral entra directo, como hoy.
- No hay respiración, parallax, estampa, cascada, hilo animado, parpadeo ni barras.
- La línea de carga queda quieta.
- `.avance` sigue, porque informa.
- El recorrido de Yo Da no anima nada **[prueba]**.

### 9.7 Android: límites

- **Capas fijas:** como máximo tres en reposo (la barra, `.avance` y el dock de música y Yo Da). Salen Flotantes (19 capas), el grano (pantalla completa, z 60), el halo, el anillo del cursor y la orla.
- **Sin efectos caros:** nada de `mix-blend-mode`, filtros vivos ni `backdrop-filter`. También sale de la guía de instalación: pasa a un fondo `--negro-hondo` sólido.
- **`will-change`:** solo mientras dura la animación.
- **Revelar:** el MutationObserver pasa de `body` a `main`. Hoy el chat de Yo Da lo dispara todo el tiempo.
- **Atencion:** queda solo con la línea de avance y `html.bajo`, en un único escuchador pasivo con `requestAnimationFrame`.
- **Ojos:** el OjoVivo y la pupila de Yo Da usan `requestAnimationFrame`, no hacen `setState` por cada movimiento del puntero, van a 12 cuadros por segundo como máximo en las sacadas y se pausan con la pestaña oculta.
- **Scroll:** el parallax y el hilo van en CSS. Nada escucha el scroll en JavaScript salvo el Mecanismo, que ya lo hace con `requestAnimationFrame` y solo mientras está a la vista.
- **Keyframes duplicados:** se renombran (`onda-tinta` para el sello y `barras-musica` para la música).
- **Otros desenfoques que salen:** el `blur` de la aparición del botón de Yo Da, de `yosoy-llega` y de `guia-paso`.

---

## 10. Texturas

**No se agrega ninguna, y se quita la que hay:** el grano SVG `feTurbulence` fijo en z 60, que cuesta en Android.

- La textura del sitio son los grabados de linóleo, con su veta de rodillo, sus bordes aplastados y su tinta despareja. Es real, viene de los libros y no cuesta nada.
- Las fotos traen su grano horneado (8.1).
- La única materia de la interfaz es el filete de 1 px.

Si alguien propone una textura, la respuesta por defecto es que no.

---

## 11. Sonido y música

### 11.1 Sonidos de la interfaz

- **Se conserva:**
  - el sistema (`cuenco`, `nav`, `campana`, `toque`, y la pentatónica con una nota por sección);
  - el estado inicial «Sonido activado» **[prueba]**;
  - que no suene nada antes del primer gesto.
- **Cambios:**
  - El volumen general baja 30 % (`salida.gain` pasa de 0,9 a 0,63).
  - `toque` suena solo en botones: los enlaces sin `data-sonido` dejan de sonar. `nav`, `cuenco` y `campana` siguen como hoy.
  - Nada suena al pasar el puntero ni al hacer scroll.
- **La voz de Yo Da** ya habla solo cuando se le pide (el tema «voz»), y se conserva así.
- **[Lucas] Elegir el sonido en el umbral.** Abajo a la derecha del umbral, una línea discreta: «Sonido · activado» o «silenciado», con `aria-pressed`, que guarda `jb-sonido` antes de entrar.
  - El foco inicial sigue en «Entrar» y el valor inicial no cambia, así que las pruebas quedan iguales.
  - Apagarlo por defecto implicaría actualizar `interaccion.spec`.

### 11.2 El reproductor

- **Botón** (`musica-boton`), abajo a la izquierda, con `bottom: calc(1rem + env(safe-area-inset-bottom))`:
  - Tres barras verticales de 1 px en crema, sin círculo ni fondo, con un área táctil de 44 × 44.
  - Quietas si no suena nada. Mientras suena, se mueven con `scaleY` escalonado en 1,2 s (hoy animan `height`, que vuelve a maquetar).
  - Conservan el nombre accesible, `aria-expanded`, `aria-controls="musica-panel"` y `data-recorrido="musica"` **[prueba]**.
- **Panel** (`musica-panel`): sobre `--negro-hondo`, con un filete de 1 px. En compu mide 22rem y va abajo a la izquierda; en celular es una hoja inferior. Este es el orden de arriba abajo:
  1. el rótulo «Música de fondo» (hoy es una firma);
  2. «Temas al azar de la playlist de Julián en Spotify.», el texto actual **[prueba]**;
  3. **los controles propios, arriba:**
     - «Escuchar», «Pausa» o «Seguir» (`musica-play`) y «Otro tema», como `.boton-chico`;
     - «Cerrar», como `.boton-texto`;
  4. una línea de tiempo de 1 px, crema sobre `--linea`, alimentada por el `playback_update` que ya se escucha (`role="progressbar"` con `aria-valuenow`);
  5. **el cajón del reproductor:** el iframe oficial de Spotify, entero y sin tocar (sus condiciones lo exigen), debajo de un filete y con el rótulo «Reproductor · Spotify». Es la fuente, no la cara del panel;
  6. los avisos que ya existen (`musica-fragmentos`, `musica-ayuda`, `musica-sesion`, `musica-app`, `musica-app-siempre`), como notas de ficha, y «El volumen, desde tu dispositivo…», el texto actual **[prueba]**.
- **Cerrado**, el panel queda `inert` y montado, así la música sigue al navegar **[prueba]**. Escape lo cierra.
- **Nunca suena sola:** la API de Spotify se carga recién al tocar «Escuchar».
- **No lleva un InterruptorSonido adentro** **[prueba]** (ver 7.4).

### 11.3 Coordinación de apariciones: una voz por vez

| Momento | Qué aparece |
|---|---|
| 0 s | El umbral (o la portada, si ya se entró). |
| 2 s después de entrar | La nube de Yo Da. Hoy aparece a los 0,7 s; las pruebas la esperan con 5 s de margen, así que **no puede pasar de 2,5 s** **[prueba]**. |
| 1,8 s | El aviso de la app se monta como hoy **[prueba]**, pero se hace visible **y tocable** recién a los 6 s. Hoy es invisible y, mientras tanto, tapa toques. |
| Mientras el aviso está abierto | El dock (música, Yo Da y la nube) sube por encima de él, con la variable `--desde-abajo`. |
| 45 s quieto | La invitación a jugar de Yo Da, como hoy, nunca junto con otra nube. |
| Siempre | Nada tapa el nombre en la portada. En celular, la portada deja libre su tercio inferior, que es donde se posan la nube y el dock. |

Todo lo que va fijo abajo respeta `env(safe-area-inset-bottom)`. Para eso, el viewport pasa a `viewportFit: "cover"` en `app/layout.tsx`, y la barra suma `env(safe-area-inset-top)`.

---

## 12. Yo Da

### 12.1 Lo que no cambia

- **El OjoPixel:** la grilla de 32 × 9, el ojo dorado #c9a45c, las alas #ffffff, la pupila #080808, el parpadeo por pasos y `mira`.
- **Lo que dice y hace:**
  - la sintaxis invertida;
  - los textos de `content/yosoy.ts`;
  - los juegos (piedra, papel o tijera; la moneda);
  - los horarios;
  - la consulta a una persona (TicketYoDa).
- **Cómo se comporta:**
  - la voz, el ritmo y las cosquillas;
  - la memoria del nombre;
  - la línea 135 ante una crisis;
  - Escape para cerrar.
- **Los contratos:**
  - todos los `data-testid` `yosoy-*`;
  - «Escribile a Yo Da» y «Enviar»;
  - `.yosoy-msj.yo` y `.yosoy-pensando`;
  - `data-recorrido="yoda"` **[prueba]**.
- **El nombre:** ya está unificado en el código como «Yo Da» (`nombreBot`); la captura con «YoDa» es vieja.

### 12.2 Presencia: estados del ojo, siempre por pasos

- **Botón** (`yosoy-boton`): pierde el círculo y el aura que late. Queda el ojo pixelado con sus alas, de 48 px, con 56 × 56 px de área táctil, abajo a la derecha y con `safe-area`. Es el único dorado del sitio: una pequeña luz en la sala a oscuras, el guardián con su linterna.
- **Aparición:** se materializa con el `clip-path` por pasos que ya tiene, más opacidad. Sale el `filter: blur(6px)`.
- **Estados:**

  | Estado | Cómo se ve |
  |---|---|
  | Atento | parpadea cada 7 a 11 s; con puntero fino, la pupila sigue al puntero (−1, 0 o 1) |
  | Pensando | `.yosoy-pensando`: sus tres puntos pasan a ser tres píxeles cuadrados de 4 px, porque Yo Da es un ser de píxeles |
  | Hablando | aletea al contestar (existe) |
  | Dormido | tras 90 s sin actividad, el ojo se cierra en tres pasos y queda una línea dorada de un píxel; se despierta con cualquier movimiento |

### 12.3 La nube: una nota al margen

- Un rectángulo `--negro-hondo` con filete de 1 px `--linea`, sin cola ni radio, unido al ojo por un filete de 1 px de 24 px.
- El texto va en Alegreya itálica, 17 px, `--texto-lectura`, y aparece con Tipeo (existe; su texto completo está en `sr-only` desde el principio).
- Los botones son `.boton-chico`: «Mostrame el lugar» (`yosoy-nube-recorrido`) y «Crear cuenta» **[prueba]**.
- El cierre («Cerrar el saludo de Yo Da») tiene 44 px de área táctil. Hoy tiene unos 20.
- Aparece a los 2 s (11.3). En celular no tapa el h1.

### 12.4 El panel: el folio derecho

- **En compu:** un panel lateral derecho de 26rem, del alto de la ventana menos la barra, sobre `--negro-hondo`, con un filete izquierdo de 1 px. **En celular:** una hoja inferior de hasta 88svh, con `safe-area`.
- **Cabecera:**
  - la cabeza pixelada, con las cosquillas (`yosoy-cabeza`);
  - «Yo Da» en Alegreya de 21 px y «guía del sitio» en rótulo;
  - el altavoz (`yosoy-altavoz`, `aria-pressed`) y «Cerrar».
- **Mensajes sin globos:** se leen como un diálogo transcripto en un archivo, no como una aplicación de mensajería.
  - Yo Da (`.yosoy-msj.yo`) va a la izquierda, en Alegreya itálica de 17 px, `--texto-lectura`, sin marca: el dorado queda en el ojo.
  - Quien escribe (`.yosoy-msj.vos`) va a la derecha, en Archivo de 15 px crema, sin borde.
- **Sugerencias y chips:** `.boton-chico` con borde `--borde-control` (hoy `--linea`, 1,28:1) y 44 px de área táctil.
- **Juegos:** botones del sistema, con el marcador en Dato. La moneda conserva su dorado, que es de Yo Da.
- **Horarios:** fichas del sistema, con la hora local en Dato y la de Argentina en Nota (`yosoy-horarios`) **[prueba]**.
- **Campo «Escribile a Yo Da»:** línea inferior `--borde-control` y foco visible. Hoy tiene `outline: none`.

### 12.5 El recorrido (en construcción en otro trabajo)

Cuando se integre, `RecorridoYoDa.tsx` adopta los tokens y componentes del sistema:

- el globo pasa a ser una ficha (`--negro-hondo`, filete de 1 px);
- «Recorrido con Yo Da · 1 de 8» va en rótulo;
- el texto de Yo Da va en Alegreya itálica;
- los botones son del sistema;
- los `rgba` pasan a `color-mix`.

La luz y la penumbra se conservan, porque son su mecánica y las pruebas las miden (`recorrido-luz`, `recorrido-globo` y las paradas). Nada de esto se toca antes de que ese trabajo esté commiteado.

### 12.6 Textos a revisar [Lucas]

- «¿En qué ayudarte puedo?» es la versión invertida de lo que el pedido rechaza («Hola, ¿cómo puedo ayudarte?»). Conviene que Lucas lo reemplace por algo de custodio. Ninguna prueba lee esa frase.
- «Lo que das, vuelve.» suena a enseñanza en nombre de Julián.
- Falta un tema de Yo Da para /biografia, con un texto que apruebe Lucas.

---

## 13. Composición de cada página

### 13.1 Umbral

- **Pantalla:** `--negro-hondo` y nada más que esto:
  - **El Observador** (`observador-crema`, 700 o 1100 px) a `min(64vw, 42svh, 440px)`, centrado, con su centro al 44 % del alto (el centro óptico).
  - 48 px más abajo, **«Te damos la bienvenida»** (h2 en Título, crema), el texto actual.
  - **La firma** «Julián Bermúdez» en Alegreya SC `--texto-2`.
  - **«Tocá el ojo para entrar»** en rótulo `--texto-2`, con `aria-hidden` como hoy.
  - **Al pie**, centrado, hasta 44ch, en Archivo de 14 px `--texto-2`: el aviso legal actual («espacio exclusivo», «prohibida toda reproducción o difusión») **[prueba]**, como la placa legal de una película.
  - A la derecha del pie, el sonido (11.1) **[Lucas]**.
- **Salen** las Estrellas, el OjoFantasma, el halo y el filete del aviso.
- **Contrato intacto** **[prueba]**:
  - `role="dialog"`, `aria-modal` y `aria-labelledby` apuntando al h2;
  - el foco inicial en el ojo-botón «Entrar», con `data-sonido="cuenco"`;
  - `inert` detrás y `sessionStorage jb-umbral`;
  - las clases de `html` y el evento `umbral:abierto`;
  - el seguro de 7 s y la entrada directa con reducir movimiento.
- **Coreografía:** 9.4.

### 13.2 Inicio (I): siete movimientos

La secuencia es la del pedido: silencio → aparición → frase → imagen → espacio → información → transición.

**1 · Umbral** (13.1).

**2 · Aparición** (portada, `min-height: calc(100svh - var(--alto-barra))`):
- **Compu:**
  - El Observador en `col 8 / sangre-fin`, de `min(46vw, 720px)`, cortado por el borde derecho (sale un 10 %): el ojo está entrando al cuadro. Lleva `mira`, estampa de 2400 ms y el parallax mínimo.
  - El nombre (TituloTinta con `lineas`: «Julián» y, debajo, «Bermúdez» con una sangría de .5em), en Monumental, en `col 1 / span 7`. Mide 646 px a 1440, en una zona de 746 px.
  - Debajo, la bajada (`inicio.bajada`), en Bajada `--texto-lectura`, en `col 1 / span 5`.
  - Al pie, el folio «· I ·», centrado, y el hilo, que baja desde el folio.
- **Tablet:** el grabado arriba a la derecha (`col 4 / sangre-fin`) y el nombre y la bajada debajo, a la izquierda.
- **Celular:** el grabado arriba, apoyado en el borde derecho, al 82 % del ancho (sale un 8 % por el borde); el nombre (52 px) y la bajada debajo; el tercio inferior queda libre para la nube y el dock.
- **Sin botones:** la curiosidad antes que la venta. «Masterclass en vivo» y «o sumate a la lista» dejan la portada, pero sus destinos siguen a mano: la masterclass, en el índice (movimiento 6); la lista, en el cierre («Avisame cuando haya novedades», el texto actual).
- Salen la marginalia vertical (las preguntas ahora están en las tapas: primero la pregunta, después la respuesta), la gota `.bajar`, las marcas, las estrellas, la pluma y el año de arriba (MMXXVI se va al colofón).
- Con `?sesion=cerrada`, «Cerraste la sesión.» aparece arriba como Nota, con `role="status"` **[prueba]**.
- Aparición:

  | Tiempo | Qué aparece |
  |---|---|
  | 0 ms | la estampa del grabado |
  | 200 ms | el renglón 1 del nombre |
  | 320 ms | el renglón 2 |
  | 900 ms | la bajada |
  | 1400 ms | el folio y el hilo |

**3 · Silencio y frase:**
- El `--plano-negro`, cruzado por el hilo.
- Después, el Epígrafe (todas las frases) en escala Cita, en la zona ancha, alineado a la izquierda, con `excluir={citas.observador}`. Es el primer `data-testid="epigrafe"` de la página **[prueba]**.
- La frase de la primera visita: «Las cosas en el mundo están ahí, pero vos estás adentro tuyo.» (Pensamiento, cap. 1) **[Lucas puede elegir otra de `frases.ts`]**.

**4 · La obra:**
- Un h2 «La trilogía» (el texto actual) solo para lectores de pantalla.
- **Las tres Tapas** (grande) en una banda a sangre: en tres columnas desde 768 px, con alto `min(88svh, 52rem)`; apiladas por debajo. Cortes secos entre las superficies.
- Debajo, en la zona obra, la nota actual: «Tres libros, tres preguntas sobre lo mismo. Impresos, y para leer online acá o en la app.».
- Después de `--sala`, **el Mecanismo**, tal cual, centrado en su columna y de 520 px como máximo, con su leyenda «tres preguntas · una misma verdad». Las tres tapas se alinean en una sola verdad.

**5 · Julián** (`#quien`):
- **El Divisor** (el ojo que se abre), su única aparición.
- **Compu:**
  - la foto de chef (2:3, duotono) en `sangre-inicio / col 6`;
  - en `col 7 / span 5`, el h2 «Quién es» (`id="quien"`) **[prueba]**, `inicio.quienEs` en Cuerpo `--texto-lectura` (`data-testid="quien-es"`) **[prueba]**, la nota actual («Datos de fuentes públicas, a confirmar con Julián.») y el enlace «La biografía» a `/biografia` (hasta la fase 5, a `/libros#biografia`);
  - la trayectoria se muda a /biografia en la fase 5; hasta entonces queda acá como ficha.
- **Láminas en escalera** (compu):
  - el trofeo (4:5) en `col 2 / span 3`;
  - el emplatando (4:5) en `col 6 / span 3`, 96 px más abajo;
  - la doble exposición (2:3) en `col 10 / span 3`, 192 px más abajo;
  - cada una con su pie.
- **Tablet:** el chef en `sangre-inicio / col 5` y el texto en `col 5 / span 4`; las láminas de a dos.
- **Celular:** el chef al 84 %, saliendo por la izquierda; el texto; las láminas, una por pantalla, alternando izquierda al 84 %, derecha al 68 % e izquierda al 76 %.
- Las cinco fotos siguen en `/` con sus `data-testid` **[prueba]**.

**6 · Índice** (la información):
- IndiceLibro «Índice» (el texto actual), generado desde `portadillas`, con notas que salen de datos reales:

  | Folio | Entrada | Nota |
  |---|---|---|
  | II | Los libros | «La Receta de la Manifestación, El Pensamiento es Tu Fe y la Biografía» |
  | III | Biografía | «¿Quién lo descubrió?» |
  | IV | Fragmentos | — |
  | V | Masterclass en vivo | «Julián en vivo, cada semana» |
  | VI | Masterclass 1 a 1 | `Precio` |
  | VII | Masterclass grabada | `Precio` |
  | VIII | Conferencias | «Entrada simbólica · Fecha a definir» |
  | IX | Sumate | — |
  | X | Canjeá el código de tu libro | — |
  | XI | La app | — |

- Reemplaza las secciones de hoy «Masterclass en vivo» (con sus filas «Directo · semana N / Fecha a definir»), «Masterclass 1 a 1» y «Conferencias», que repetían la navegación.

**7 · Cierre** (la transición):
- **La mirada** (duotono) como lámina: en compu, en `col 2 / span 10`, con el parallax mínimo; en celular, el recorte vertical al 88 %, apoyado a la izquierda.
- En `--silencio`, **la frase del Observador** (`citas.observador`), fija: es un bloque estático, sin `data-testid`, en escala Cita, con su firma (emblema `biografia-2` y «Julián Bermúdez · Biografía, cap. 2»). El ojo del grabado se vuelve el ojo real de Julián, y cierra el observador.
- El ◆ ◆ ◆, pegado a la frase.
- «Avisame cuando haya novedades» (`.boton-texto`, a `/lista`), el texto actual.

### 13.3 Los libros (II)

- **Portadilla de tipo obra:**
  - el h1 «Los libros» **[prueba]** y la bajada actual;
  - un índice de tres renglones (I La Receta de la Manifestación · II El Pensamiento es Tu Fe · III Biografía), que lleva a `#receta`, `#pensamiento` y `#biografia`;
  - el folio «· II ·»;
  - el Observador se va de acá, porque ya está en el umbral y en la portada.
- **Cada volumen**, a sangre en su superficie y con corte seco: `#receta` en `.oscuro`, `#pensamiento` en `.claro` y `#biografia` en `.marino`.
  - **Compu, pliego doble:**
    - **Página de imagen:** el grabado del ojo del cap. 2 (`receta-ojo`, `pensamiento-ojo`, `biografia-ojo`) a `min(40vw, 560px)`, estampado y apoyado en el borde exterior. Receta y Biografía van a la izquierda (`sangre-inicio / col 6`); Pensamiento, a la derecha (`col 8 / sangre-fin`).
    - **Página de texto** (`col 7 / span 5`, o `col 2 / span 5` en el Pensamiento):
      1. el rótulo «Libro I» (el texto actual);
      2. el título en h2, a escala Display;
      3. la pregunta, en Bajada;
      4. la ficha, con ESTADO → «Próximamente» (`data-testid="estado-{id}"` en el valor) **[prueba]**;
      5. la descripción, en Cuerpo (contiene «El libro de la práctica» y «la historia de Julián») **[prueba]**;
      6. el Epígrafe del libro (`libro={id}`): tres en la página, en orden **[prueba]**;
      7. el rótulo «Índice, en construcción» (el texto actual);
      8. el índice de capítulos (`data-testid="indice-{id}"`): emblema de 24 px en la tinta de su superficie, número elzeviriano y título. Cada `li` lleva `id="{libro}-cap-{n}"`. El filete de arriba sigue siendo `aria-hidden` y **no se agrega ni un `li` más**: se cuentan 6, 7 y 4 **[prueba]**;
      9. «Leelo online, acá o en la app, desde cualquier dispositivo.» (el texto actual);
      10. «Leer online» o «Leer online (edición digital)» (`leer-{id}`, `.boton-lleno`, el único de su pantalla) **[prueba]**;
      11. «Cargá su código» y «Avisame cuando salga», como `.enlace`.
    - **Glosa:** el Numeral del volumen (I, II, III) con `position: sticky; top: calc(var(--alto-barra) + 2rem)`. Es el lomo: cambia al cambiar de volumen.
  - **Tablet:** la imagen arriba, a sangre de un lado; el texto debajo, en `col 2 / span 6`; el numeral arriba del rótulo, sin sticky.
  - **Celular:** el numeral (72 px), el grabado al 72 % apoyado en un borde y el texto.
  - **Sale:** el Ornamento de cada volumen, el recuadro del estado y el `invert` de los emblemas (8.7).
- **«La trilogía, capítulo a capítulo»** (Sincronía, 6.11): sobre negro, después de `--sala`.
- **Puentes** (14): las notas de puente de los libros, con los emblemas de los dos capítulos y «Receta, cap. 2 — Pensamiento, cap. 2». Sin el eco invisible.
- ◆ ◆ ◆.

### 13.4 Fragmentos (IV): archivo de pensamiento

- **Portadilla de tipo sala:**
  - el h1 «Fragmentos», sin bajada (la actual pasa al bloque de videos);
  - el grabado `atravesar-el-tiempo`, con su pie;
  - el folio «· IV ·».
- **Sala de lectura** (`components/SalaDeLectura.tsx`, cliente), bajo el h2 «De los libros» **[Lucas: texto de interfaz nuevo]**:
  - **La frase:** una por vez, en escala Cita (o Cita larga si pasa de 140 caracteres), crema y redonda, en la zona ancha, alineada a la izquierda y centrada en vertical. La sala mide como mínimo 80svh en compu y 64svh en celular.
  - **La ficha**, en la glosa en compu y arriba en celular:
    - «07 / 26» en Dato (el total es `frases.length`, nunca un número escrito a mano);
    - el emblema del capítulo (32 px);
    - el libro, en versalitas;
    - «Cap. 1 — Libertad Interna», en Nota;
    - «Ir al capítulo», que lleva a `/libros#pensamiento-cap-1`.
  - **Navegación:**
    - «Anterior» y «Siguiente» (`.boton-texto`, 44 px);
    - las teclas ← y → cuando el foco está dentro de la sala (`aria-keyshortcuts`);
    - un ancla para compartir, `#f-{id}`, que se actualiza con `history.replaceState`.
  - **Transición:** la frase que se va se apaga en 240 ms (`--sale`); la que llega aparece palabra por palabra (40 ms, 1,2 s como máximo).
  - **Anuncio:** `aria-live="polite"` dice «Frase 7 de 26» y la frase.
  - **Arranque:**
    - con ancla, esa frase;
    - sin ancla, una al azar, con el mismo barajado de los epígrafes y una clave propia (`jb-frases-sala`). Se elige antes de mostrarse, porque la sala entra con su revelado, así el cambio no se ve.
  - **Sin JavaScript** se ven la primera frase y el archivo completo.
  - **Ningún `.revelar`** dentro de las frases que no están a la vista **[prueba]**.
- **El archivo** (se arma en el servidor):
  - Todas las frases, **completas** (nunca recortadas), agrupadas por libro (h3 con el título) y por capítulo (emblema y «Cap. N — Título»), en Cuerpo y a plena luz.
  - Cada frase lleva su número («07», en Archivo) como enlace a la sala.
  - Los capítulos sin frases no aparecen.
- **«Pedazos de conferencias y charlas»** (h2) y «Los completos están en las redes.» (Nota): es la bajada actual, partida en dos, sin cambiar palabras. Debajo, los cuatro medios pendientes (6.4, clase 4), con su título y su tema actuales. Sin vínculo a capítulos hasta que existan los videos.
- **En las redes:** enlaces de texto, no botones.
- ◆ ◆ ◆.
- **Datos:**
  - un `id` estable por frase en `frases.ts`, sin tocar los textos **[Lucas]**. Mientras no esté, el ancla usa el orden;
  - la función `capituloDe(frase)` lee «Cap. N — Título».

### 13.5 Biografía (III): ruta nueva, el libro III como documental

**Decisión:** se crea `/biografia`. Su columna vertebral son los capítulos 0 a 3 del libro, no los años: el libro no da años de la vida de Julián. El recorrido que pide el pedido (persona → recorrido → experiencias → transformación → obra actual) se cumple así: la portadilla es la persona, los capítulos sobre marino son la vida contada por él, y «Hoy», sobre negro, es la obra actual y el archivo público.

1. **Portadilla** (sobre negro, tipo retrato):
   - el rótulo «Libro III»;
   - el h1 «Biografía» en Display, cruzando por delante de la mirada del retrato de chef (8.5);
   - la bajada «¿Quién lo descubrió?» (de `libros`);
   - el folio «· III ·».

   En compu, la foto (duotono negro) va en `sangre-inicio / col 6` y el título en `col 5 / span 7`, a la altura de los ojos. En celular, la foto va a sangre arriba y el título debajo, sin cruzarse.
2. **La galera de `MARCADOR_JULIAN`**, «(Texto acerca de Julián, a definir)». Ya existe en `config.ts` y hoy no se usa.
3. **Corte a marino:** los capítulos, desde `capitulos.biografia`. Cada uno es una lámina, de al menos 100svh en compu, con esta estructura:
   - en la glosa sticky, el número del capítulo (Numeral, elzeviriano, `--marino-claro`), el emblema y el rótulo «Capítulo 0»;
   - el h2 con el título y el grabado, cuando existe, estampado;
   - las frases aprobadas de ese capítulo (`frases.ts`), cada una sola, en Cita y crema;
   - «El mismo capítulo en los otros libros»: Receta y Pensamiento del mismo número, con emblema y enlace (sale de `capitulos`);
   - las notas de puente (14).

   | Cap. | Grabado | Frases | Foto | Relaciones |
   |---|---|---|---|---|
   | 0 · Primera Imagen | `primera-imagen` | las 2 aprobadas | emplatando (duotono marino), con su pie actual | Receta 0, Pensamiento 0 |
   | 1 · El Reconocimiento | `el-reconocimiento` | ninguna aprobada: «Frase · a definir» (clase 2) **[Lucas: la auditoría deja dos candidatas textuales]** | trofeo (duotono marino), con su pie actual | Receta 1, Pensamiento 1; notas de puente a Receta 1 y Receta 2 |
   | 2 · El Desastre | `biografia-ojo` (el ojo que llora) | las 5 aprobadas, cada una en su plano; la última, la del Observador | ninguna, a propósito: silencio, sin rótulo | Receta 2, Pensamiento 2 (el Observador Eterno, el ojo del umbral) |
   | 3 · Poner a Prueba | `poner-a-prueba` **[herramientas]** | «Frase · a definir» **[Lucas]** | — | Receta 3, Pensamiento 3; nota de puente a Pensamiento 1 |

   **No se muestran:** años de la vida, epígrafes bíblicos (varios son «propuestos»), resúmenes del libro, el surf.
4. **Corte a negro: «Hoy»**, la ficha de archivo:
   - la trayectoria (`inicio.trayectoria`: el año en Dato y el hecho en Cuerpo);
   - la nota actual, «Datos de fuentes públicas, a confirmar con Julián.»;
   - una fila «Fotografías · Créditos a definir» **[Lucas]**.
5. **Salida:**
   - las otras dos Tapas (chicas) con sus preguntas;
   - «Leer online» (checkout del libro o biblioteca, como en /libros);
   - «Avisame cuando salga» (`/lista?interes=biografia`).
6. ◆ ◆ ◆.

**Hay que sumar la ruta a:**
- `enlaces`, `portadillas`, el pie y el índice del inicio;
- `paginas` de `tests/publico.spec.ts` **[prueba][Lucas]**;
- Yo Da, cuando Lucas apruebe el texto.

**Antes de publicarla, Lucas confirma** el año de la Masterclass Reseteo (el canal indica 2024), la fuente de «Ernestina y el otro país» y los datos de El Gran Premio. Hoy esos datos ya están en el inicio, con la nota «a confirmar».

### 13.6 Masterclass en vivo (V): una sala privada

- **Portadilla de tipo sala:**
  - el h1 «Masterclass» y la bajada actual;
  - la subnavegación, adentro;
  - `cargar-el-estado` con sus marcas de corte y su pie;
  - el folio «· V ·».
- **Antes de los directos:** la descripción (`enVivo.descripcion`) como galera, y «Cómo funciona» (h2 actual) con los cuatro pasos actuales, numerados del 1 al 4 en Dato. La foto de movimiento (duotono; su fondo claro la vuelve una placa de luz) va en `col 9 / span 4` en compu y a su tamaño en celular (`foto-julian-movimiento`) **[prueba]**.
- **Próximos directos** (h2 actual):
  - **El primero, como ficha grande** (`data-testid="directo-semana-1"`) **[prueba]**:
    - su título actual («Directo · semana 1») en rótulo;
    - FECHA («a definir», a escala Título) y TEMA («a definir»);
    - «Reservar mi lugar» (`.boton`) o «Entrar a la sala» (`.boton-lleno`) **[prueba]**.
  - **Los siguientes, como renglones** con su título y su acción (`directo-{id}`).
  - Un solo rótulo de grupo: «Fechas y temas a definir».
  - Sin sesión, la nota actual («Para reservar necesitás una cuenta…»).
- **La grabada** (`data-testid="bloque-grabada"`), sobre negro, con un filete y sin franja «hondo» **[prueba]**:
  - «También», el h2 «Masterclass grabada» y la bajada;
  - qué incluye, como ficha;
  - «Ver la masterclass grabada» (`.boton`) **[prueba]**;
  - el precio, o «Ya la tenés: ir a verla».
- **Cierre:** el Epígrafe (`citas.tiempo`) y el ◆ ◆ ◆.
- **Nunca** «comprá», cuentas regresivas, cupos inventados ni latidos.

### 13.7 Masterclass 1 a 1 (VI): la más íntima

Es la única página centrada: una sola columna de 30rem. Frente a frente.

- **Portadilla íntima:**
  - el emblema `pensamiento-3` (40 px), en lugar del grabado grande;
  - el h1 «Masterclass 1 a 1» **[prueba]**;
  - la bajada exacta: «Un encuentro uno a uno con Julián, por videollamada.» **[prueba]**;
  - la subnavegación;
  - el folio «· VI ·».
- **Ficha mínima:**
  - MODALIDAD: «Por videollamada»;
  - DURACIÓN: «a definir» **[Lucas: choca con los 60 minutos que usa el `.ics`]**;
  - PRECIO: `Precio`.
- **«Cómo es»:** tres renglones (los textos actuales). La descripción va como galera.
- **«Agendá tu encuentro»** (el texto actual) y **el calendario como único objeto:**
  - **SelectorZona** como una frase («Ves los horarios en ___») **[prueba]**, con la diferencia con Julián en Nota.
  - **El mes**, en Alegreya itálica de 26 px, entre «‹» y «›» (`.boton-chico`, con los nombres «Mes anterior» y «Mes siguiente») **[prueba]**.
  - **Los días**, en Archivo tabular de 17 px:

    | Estado | Cómo se ve |
    |---|---|
    | Libre | crema, con un punto de 4 px debajo, dibujado en CSS |
    | Lleno | `--texto-2`, tachado con un filete de 1 px |
    | Elegido | invertido (`aria-pressed`) |
    | Tu encuentro | el rombo dibujado |

    La leyenda va en texto, con los tres estados.
  - **Contratos** **[prueba]**:
    - las clases `.cal-dia`, `.libre`, `.lleno` y `.elegido`;
    - los `aria-label`;
    - todos los `data-testid` (`calendario`, `mes`, `dia-*`, `turnos-del-dia`, `horario-*`, `julian-*`, `zona`, `zona-julian`).
  - **Turnos del día:** renglones de 56 px, con la hora local en Dato grande (28 px) y la de Julián al lado, en Nota (`julian-{id}`).
  - **`ya-reservada`:** como Nota, con el rombo.
- **Cierre:** el Epígrafe y el ◆ ◆ ◆. Sin foto: menos es la exclusividad.

### 13.8 Masterclass grabada (VII)

- **Portadilla de tipo sala**, con la acción adentro:
  - «Comprar la masterclass grabada» o «Ir a la masterclass» (`.boton-lleno`) **[prueba]**, con el precio;
  - el grabado `el-sentimiento`;
  - el folio «· VII ·»;
  - la subnavegación.
- **La descripción** (galera) y «Qué incluye» (ficha, con los textos actuales).
- **«Los módulos»** (h2 actual), con su línea actual («Los temas los define Julián…»):
  - un índice de Módulo I a Módulo VIII;
  - un solo rótulo de grupo: «Temas y duraciones a definir».
- **«El encuentro de preguntas»**, como ficha: el próximo, «a definir»; la modalidad; la explicación.
- **Cierre:**
  - el Epígrafe (`citas.pesca`);
  - la acción otra vez;
  - reembolsos, como Nota;
  - el enlace a la en vivo;
  - el ◆ ◆ ◆.

### 13.9 Conferencias (VIII) y detalle: un archivo de eventos

- **Portadilla de tipo sala:** `la-palabra`, la bajada actual y el folio «· VIII ·».
- **«Próximas»** (h2 actual), con la nota actual, que incluye `Precio`.
- **Cada conferencia es un renglón de archivo** a todo el ancho:
  - en la glosa, el numeral (I, II), en Numeral;
  - el título (h3, «Conferencia I»);
  - la fecha a escala Título, aunque sea «Fecha a definir» (en itálica `--texto-2`: el lugar es grande porque la fecha importa);
  - una ficha con LUGAR («En línea») y ENTRADA (`Precio`);
  - la descripción, como galera;
  - «Ver la conferencia» (`.boton-texto`).
- **Archivo 2024** (The Conference 01 a 04): el lugar queda diseñado y oculto hasta el OK de Lucas **[Lucas]**. Van enlaces externos al canal, sin embeds (lo impone la CSP).
- **Detalle `/conferencias/[id]`:**
  - la misma ficha, en grande;
  - «Comprar la entrada» (`.boton-lleno`) **[prueba]**, o «Ya tenés tu entrada», que lleva a Mi espacio;
  - el link privado nunca aparece **[prueba]**;
  - un id inexistente muestra «Esta página no existe» **[prueba]**.
- **Nunca** las palabras «gratis» ni «abierta» **[prueba]**.

### 13.10 Sumate (IX), Canjear (X), La app (XI), Ingresar (XII) y Crear cuenta (XIII)

Todas usan la portadilla de tipo formulario: el grabado de su portadilla en chico (22vmin), el h1, la bajada y el formulario en una columna de 30rem (`col 4 / span 5` en compu).

- **Sumate:**
  - Nombre y CanalContacto (segmento Mail | WhatsApp) **[prueba: «Tu mail», «WhatsApp», «número de WhatsApp», «Sumarme»]**;
  - «Sumarme» es el `.boton-lleno`;
  - el éxito sale como recibo (`mensaje-ok`).
- **Canjear: la última página del libro, en pantalla.**
  - El h1 es «Tu libro, también digital» (el texto actual).
  - El campo «Código del libro» **[prueba]** se dibuja como el recuadro impreso:
    - un rectángulo de 1 px `--borde-control`;
    - el texto centrado, en Archivo 500 de 18 px, en mayúsculas, con tracking .18em;
    - el marcador de posición «[CÓDIGO ÚNICO DEL EJEMPLAR]», el mismo de la página impresa.

    Quien escanea el QR reconoce la página.
  - Debajo van la ayuda actual, «Desbloquear el libro» **[prueba]** y «Cada código sirve una sola vez, para una sola cuenta.» (el texto actual).
  - Sin sesión, la ficha trae «Ingresar» (`.boton-lleno`) y «Crear cuenta».
  - «Códigos de prueba» queda como apéndice de prototipo: rótulo «Prototipo», `--texto-2` y sin `.revelar`.
  - La ruta no se mueve, porque es la del QR impreso **[prueba]**.
- **La app:**
  - «Estás en {sistema}», como ficha (`estado-app`), con el único botón «Instalar la app» (`instalar-boton`) **[prueba]**.
  - Los cuatro sistemas, como un índice numerado del 1 al 4 (`#so-*`, `data-actual`); el actual va con un filete a la izquierda y en crema. Cada sistema conserva su `<h2>`, visible y con el nombre exacto: «iPhone y iPad», «Android, Windows, Linux y Chromebook», «Mac», «Firefox» **[prueba]**.
  - Nada dentro de un `<details>` cerrado **[prueba]**.
  - GuiaInstalar: fondo `--negro-hondo` sólido, sin `backdrop-filter`; los pasos en Alegreya; `.tecla` sin radio.
- **Ingresar:**
  - El formulario de ingreso es el primer `<form>` del DOM **[prueba]**.
  - Los avisos (`?aviso=`) van como Nota con filete.
  - El paso del código (`paso-codigo`) es una ficha propia, con «Volver a empezar».
  - «Cuentas de prueba» queda como apéndice de prototipo, al final: rótulo «Prototipo · Cuentas de prueba» y `.boton-chico` «Entrar como …» **[prueba]**.
- **Crear cuenta:** Nombre, Mail y Clave **[prueba]**; términos y privacidad como `.enlace`.

### 13.11 Checkout (XV): el recibo

- **Portadilla de tipo formulario:** «Tu compra» (el texto actual).
- **El recibo:** una ficha con puntos guía, la letra de IndiceLibro, con Producto, Cuándo (en tu zona, `cuando`), Precio y Cuenta, en Dato.
- **MontoVoluntad:** segmentos 1 · 3 · 5 · 10 · Otro monto **[prueba: «Otro monto», «Tu monto en USD»]**.
- **La nota:** hasta 800 caracteres, en un `textarea` con contador en Dato.
- **El pago:** «Pagar (simulado)» **[prueba]** es el único `.boton-lleno`, con el rótulo «Pago de prueba», discreto.
- **Horarios:** `horario-tomado` y `horario-no-disponible` aparecen como Nota de error, con filete **[prueba]**.

### 13.12 Mi espacio y el lector

- **Layout:**
  - Desde 1024, NavEspacio en la glosa (sticky) y el contenido en `col 4 / span 8`. Por debajo, pestañas.
  - El padding del contenedor y el `-mx-5` del lector se cambian juntos **[prueba: el lector no se descuadra]**.
- **Inicio:**
  - «Hola, {nombre}.», en Display **[prueba]**.
  - Los accesos (`tus-accesos`, `acceso-*`) van como renglones de índice con su estado, sin tarjetas.
  - El espacio vacío (`espacio-vacio`) muestra el ojo cerrado y los cinco caminos como índice.
- **Biblioteca:**
  - Las tres Tapas chicas (`biblioteca-{id}`), con «Leer», o con «Comprar el digital» y «Tengo un código» **[prueba]**.
  - El índice del libro (`indice`) va con los emblemas en la tinta de su superficie.
- **Lector** (`lector`), el momento en que el sitio se vuelve el libro:
  - la superficie del libro, a sangre en su columna;
  - la pila `--libro`, en Lector, justificado y con partición de palabras;
  - el emblema estampado, de 112 px;
  - «CAPÍTULO N» (el texto actual), con tracking .3em;
  - el h1 con el título del capítulo **[prueba]**;
  - la capitular de tres líneas y el ◆ ◆ ◆;
  - la navegación entre capítulos (`capitulo-siguiente`) **[prueba]**;
  - la marca de agua, intacta.
- **Masterclass:**
  - «N de 8 módulos vistos» (`progreso`) **[prueba]**, con una barra de 1 px;
  - los módulos como índice, con el rombo en los vistos;
  - `marcar` y `siguiente` **[prueba]**.
- **Audios:** ocho `<audio controls>` en fichas numeradas del I al VIII **[prueba: 8 `audio`]**.
- **Sala** (SalaProtegida):
  - un marco 16:9 en `--negro-suave`, con «Todavía no empezó» en Nota;
  - la marca de agua, la pantalla única y «Ver acá», intactos **[prueba]**.
- **El resto** (sesiones, reprogramar, conferencias, encuentro, cuenta, agenda, seguridad y consultas):
  - fichas, renglones y formularios del sistema, con densidad funcional y cero animación;
  - las acciones destructivas siguen en dos pasos, como hoy;
  - no cambia ni la lógica ni un solo `data-testid` **[prueba]**.
- **Lo bloqueado** se ve como «sin acceso» (7.7).

### 13.13 Legales y arrepentimiento (XIV)

- **Portadilla de tipo sistema**, sin grabado.
- **El texto** va en `col 4 / span 7`, a 34rem. En compu, el índice de partes va en la glosa (sticky); las partes, numeradas en Archivo; `scroll-margin-top` a la medida de la barra.
- **Pendientes:**
  - «(Texto legal, a definir)» va como galera;
  - el contacto y el responsable van en ficha, con «a definir»;
  - «(mail de contacto, a definir)» sigue literal, porque lo lee `sin-cambios` **[prueba]**.
- **Reembolsos:** el «Botón de arrepentimiento» es un `.boton` visible **[prueba]**.
- **Arrepentimiento:** una ficha de registro **[prueba: «Nombre», «Mail de la compra», «Qué compraste y cuándo», «Pedir la cancelación»]**, con un recibo que da el código `ARR-`.

### 13.14 Esta página no existe (XVI) y Sin conexión (XVII)

- **404:** portadilla de tipo sistema, centrada:
  - el ojo que llora (`biografia-ojo`), solo y grande;
  - el h1 «Esta página no existe» **[prueba]**;
  - la bajada actual;
  - «Volver al inicio» (`.boton-texto`).
- **Sin conexión:** va sin grabado, porque el service worker puede no tenerlo guardado:
  - el folio, el h1 y la bajada;
  - «Reintentar» (`.boton`).

### 13.15 Las portadillas: tipos de Apertura

**Común a todas:**
- el h1 con TituloTinta en Display;
- la bajada, en Bajada `--texto-lectura`;
- `children`;
- el folio «· N ·» al pie, centrado, en versalitas.

**Salen:** la firma «Julián Bermúdez · folio» (la barra ya lo nombra), las estrellas, la pluma, la rotación y la segunda pasada.

| Tipo | Páginas | Composición |
|---|---|---|
| `obra` | Los libros | h1 y bajada en `obra`; debajo, el índice de volúmenes |
| `retrato` | Biografía | la foto a sangre por la izquierda; el h1 cruza delante de la mirada (8.5) |
| `sala` | Masterclass, Grabada, Conferencias, Fragmentos | h1 y bajada a la izquierda (`col 1 / span 6`); el grabado a la derecha (`col 8 / span 4`), con cuatro marcas de corte y su pie; alto `min(88svh, 56rem)` en compu |
| `intima` | Masterclass 1 a 1 | columna única centrada; un emblema de 40 px en lugar del grabado |
| `formulario` | Sumate, Canjear, App, Ingresar, Crear cuenta, Checkout | grabado chico (22vmin) arriba a la derecha; el formulario en 30rem |
| `sistema` | Legales, 404, Sin conexión | sin grabado (en la 404, el ojo que llora, centrado) |

---

## 14. Sistema de relaciones: la trilogía como columna

Se muestran solo las relaciones que existen en los datos o en los libros. Nada se deduce y nada se escribe a mano.

| Relación | De dónde sale | Dónde se ve |
|---|---|---|
| Frase → libro → capítulo → emblema | `frases.ts` (libro, capítulo) + `capitulos` (emblema) | la firma de cada Epígrafe, la Sala de lectura y el archivo de Fragmentos, /biografia |
| Mismo número, tres facetas | la tabla de CLAUDE.md, impresa al final de cada libro | la Sincronía en /libros; «El mismo capítulo en los otros libros» en /biografia |
| Notas de puente (publicadas en los libros): Receta 2 y Pensamiento 2, en ambos sentidos (el Ojo Observador); Biografía 1 → Receta 1 y Receta 2; Biografía 3 → Pensamiento 1 (Shelleyar); Receta 5 → Pensamiento 6 | CLAUDE.md y los manuscritos | /libros (Puentes), /biografia (en su capítulo). Llevan el emblema del capítulo al que remiten, como en papel. **El eco invisible (Biografía 2 con Pensamiento 3) no se muestra.** La doble flecha (U+2194) no se usa en el sitio: la prueba de emojis la cuenta como pictograma. |
| Transiciones: la pesca (Receta), el tiempo (Pensamiento), el Observador (Biografía) | `citas` y las contratapas | los epígrafes de Grabada, Masterclass y el cierre del inicio |
| El ojo como eje: el umbral (Pensamiento 2) → los ojos del cap. 2 de cada volumen → la frase del Observador (Biografía 2) → la mirada | `portadillas`, `frases.ts`, las fotos | se ve en la repetición; no se explica |
| Portadilla → capítulo | `portadillas` (los pies de los grabados) | el pie de cada grabado de portadilla. Es una orientación del sitio, no una afirmación del libro. |
| Fotos → capítulo: trofeo → Biografía 1 (textual en el libro); emplatando → Biografía 0 (ubicación del sitio, sin texto que lo afirme) | CLAUDE.md, la auditoría de contenido | /biografia |
| Tapa y página: el corazón del cap. 1 afuera, el ojo del cap. 2 adentro | las tapas impresas, `capitulos` | Tapa (6.10), /libros |
| Módulos, audios, directos, conferencias y videos → libro | **hoy no hay datos** | El modelo suma campos opcionales `libro?` y `capitulo?`, **vacíos**. Se muestran recién cuando Lucas los cargue. |
| Redes → Biografía 1 (las dos cuentas) | Biografía, cap. 1 | Sumar @chef.julian, solo con el OK de Lucas **[Lucas]**. |

`components/Pertenece.tsx` resuelve la ficha y el enlace de cualquier par `{libro, n}`. Si el dato no existe, no muestra nada.

---

## 15. Responsive: tres experiencias

| Tramo | Columnas | Margen | Experiencia |
|---|---|---|---|
| Celular, 360–639 | 4 | 20 px | Íntimo, vertical y preciso |
| Tablet, 640–1023 | 8 | 40 px | Editorial compacto |
| Compu, 1024–1279 | 12 | `clamp(3rem, 5vw, 6rem)` | Cinematográfico, con la navegación compacta |
| Compu, desde 1280 | 12 | ídem | Cinematográfico, con la navegación completa |
| Cine, desde 1440 | 12 | ídem, con medianil de 32 px | crecen los márgenes, no la lectura |

**Compu: cinematográfica.**
- Asimetría de glosa, obra y aire; láminas a sangre y cortadas por el borde.
- Las tapas en una banda; los pliegos dobles de /libros con el numeral sticky.
- El parallax mínimo en dos lugares y el umbral con la pupila.
- Yo Da como folio derecho, a todo el alto.
- Desde 1440, el vacío lateral es la columna `aire`, con intención. Nada se estira.

**Tablet: editorial compacta.**
- Ocho columnas y una glosa de dos columnas, sin sticky.
- Las tapas en tres columnas desde 768 px y apiladas por debajo.
- En /libros, la imagen arriba y el texto debajo.
- El Índice en dos columnas.
- Sin hover obligatorio: todo se activa con un toque o con el foco.
- La tablet apaisada (1024 px) ya ve la navegación compacta.

**Celular: íntimo, vertical y preciso.**
- Una pieza por pantalla, en serio: la frase sola, la foto sola, la ficha sola.
- Las fotos al 68–84 % del ancho, apoyadas en un borde. La mirada, en su recorte vertical al 88 %.
- La portada deja libre su tercio inferior.
- Todo control tiene al menos 44 px, y hay `safe-area` en la barra, el dock, los paneles y el aviso.
- Sin parallax ni cursor; los grabados se estampan igual.
- Cero desborde horizontal:
  - las láminas a sangre usan la grilla, nunca `100vw`;
  - los títulos llevan `overflow-wrap: anywhere` de resguardo y nunca `nowrap`;
  - la sincronía se vuelve fichas.
- La palabra más larga en Display («arrepentimiento», a 42 px) mide 288 de los 320 px disponibles.

---

## 16. Accesibilidad y rendimiento: compromisos medibles

**Accesibilidad**

- **Contraste:** texto de al menos 4,5:1 (en la práctica, 5,3:1 o más) y límites de control de al menos 3:1 (3.3). `--gris` nunca va como texto sobre blanco, ni `--linea` como borde de un control.
- **Foco:** 2 px `--foco`, separado 3 px, en todo lo interactivo. Se eliminan todos los `outline: none` sin reemplazo, empezando por el campo de Yo Da y `.campo:focus`.
- **Teclado:**
  - el Índice atrapa el foco y se cierra con Escape;
  - Yo Da y la música se cierran con Escape;
  - la Sala de lectura responde a ← y → (solo con el foco adentro, sin secuestrar el scroll);
  - la sincronía, las tapas y la glosa se recorren con Tab;
  - se conserva «Saltar al contenido».
- **Tamaño táctil:** al menos 44 × 44 px en todo lo que se toca: «Menú», la cuenta, «Otra frase», el cierre de la nube, las sugerencias de Yo Da, el pie y los enlaces de la navegación.
- **Semántica:**
  - un solo h1 por página; el h2 del umbral vive dentro de su diálogo, con `aria-labelledby`;
  - `nav` con nombre: «Principal», «Tu espacio», «Masterclass»;
  - `aria-current` en toda navegación;
  - la ficha es un `<dl>` y la sincronía una `<table>` con `<th scope>`;
  - `<time datetime>` en fechas y horas;
  - `<figure>` y `<figcaption>` en las láminas.
- **Lectores de pantalla:**
  - TituloTinta conserva el `aria-label`, con las palabras en `aria-hidden`;
  - el Epígrafe y la Sala de lectura anuncian el cambio con `aria-live`;
  - los «a definir» se leen como texto, no como pseudocontenido;
  - lo bloqueado se ve y se escucha.
- **Formularios:** etiquetas visibles, `aria-describedby`, `aria-invalid`, `aria-busy` y `role="alert"` en el resumen de errores.
- **Movimiento:** `prefers-reduced-motion` completo (9.6), con el seguro `sin-revelar` intacto.
- **Alto contraste** (`forced-colors: active`): sin máscaras de estampa ni filtro de tinta, y con los colores del sistema en bordes y foco.
- **Lectura:** `lang="es-AR"` y zoom al 200 % sin perder nada.

**Rendimiento** (un Android de gama media con 4G)

- **Metas:**

  | Indicador | Tope | Objetivo |
  |---|---|---|
  | LCP | < 2,5 s | 2,0 s |
  | CLS | < 0,05 | — |
  | INP | < 200 ms | — |

  El JavaScript del cliente no crece respecto de `1c2c801`: tiene que bajar, porque salen CursorAnillo, Flotantes, MarcoPagina y la mitad de Atencion.
- **Fuentes:** 151 KB en total, 122 KB precargados, servidos desde el sitio, con respaldo de métricas ajustadas (`adjustFontFallback`).
- **Imágenes:**
  - grabados con `srcset` de 400 a 1100 px y `sizes` reales;
  - el Observador precargado solo en `/`;
  - una sola decodificación por grabado;
  - fotos con `width` y `height`.
- **Capas:** como máximo tres fijas en reposo. Sin filtros vivos, `mix-blend-mode` ni `backdrop-filter`.
- **Service worker:** suma una caché *stale-while-revalidate* para `/grabados`, `/emblemas` y `/fotos` (públicas), con `VERSION` nueva. Nunca guarda `/mi-espacio`. Se hace coordinado con el trabajo de seguridad, que también toca `public/sw.js`.
- **Middleware:** si se suman archivos en `public/` con extensiones nuevas, se agregan al `matcher`. Solo se suman `.webp`, que ya está cubierto.
- **CSP:** intacta. Ningún `<script>` sin nonce. `preload` de `react-dom` emite un `<link>`, no un script.

---

## 17. Conservar, evolucionar o eliminar: la decisión final

Se toma cada ítem de la auditoría del diseño actual y se decide.

**Conservar**

| Ítem | Decisión |
|---|---|
| La paleta y las superficies; el dorado solo en Yo Da | Se conservan tal cual, con roles (3). |
| La serif de libro como voz y los detalles finos (elzevirianas, versalitas, balance, capitular) | Se conserva el principio. La letra evoluciona a Alegreya (una sola para todos); el lector conserva Palatino (4). |
| Los grabados, los emblemas y su relación con cada portadilla | Se conservan (8.7, 13.15). |
| El ojo en todas sus escalas | Se conserva. El Divisor, una sola vez (6.7). |
| El umbral (una vez por sesión, `inert`, el seguro de 7 s, atravesar la pupila) | Se conserva el contrato; evoluciona la coreografía (9.4). |
| Las fotos en blanco y negro con `srcset` y `alt` | Se conservan; evoluciona el tratamiento (8). |
| El Epígrafe que rota, con «Otra frase» | Se conserva; pasa a redonda y suma el capítulo y el emblema (6.9). |
| IndiceLibro | Se conserva y pasa a ser la letra de todos los índices (6.8). |
| El Mecanismo | Se conserva en el inicio, después de las tapas (13.2). |
| El lector, Mi espacio, el Calendario, la sala, el canje, la app y la GuiaInstalar | Se conservan las funciones; evolucionan los estilos (13). |
| Yo Da y la música | Se conservan; evoluciona la presentación (11, 12). |
| Los sonidos con su interruptor | Se conservan, con el volumen −30 % y el toque solo en botones (11.1). |
| Los botones rectangulares de 1 px, los campos de una línea y `.enlace` | Se conserva el lenguaje: pasan a sans, a 44 px y a un borde con contraste (6). |
| La accesibilidad de base | Se conserva y se completa (16). |
| `.avance` | Se conserva (7.6). |

**Evolucionar**

| Ítem | Decisión |
|---|---|
| La tipografía (itálica real, una fuente para todos, escala, mínimos, sin animar el tracking) | Así, en 4. |
| La grilla y el espaciado | Una sola grilla a sangre, con silencios (5). |
| El inicio (de 10 bloques a una narrativa) | Siete movimientos (13.2). |
| La trilogía (inicio y /libros) | Tapas en el inicio; pliegos dobles y sincronía en /libros (13.2, 13.3). |
| La Apertura (menos capas, un solo marco, tamaños, tipos) | Seis tipos (13.15). |
| Fragmentos | Sala de lectura más archivo (13.4). |
| La Biografía | Ruta nueva en cuatro capítulos (13.5). |
| Los estados «a definir» y «Próximamente» | Cuatro clases (6.4). |
| La navegación (desde 1024, índice con folios, 360 px, saber dónde estoy) | Completa desde 1280, compacta de 1024 a 1279, el Índice y los folios (7). |
| La música (panel propio, el iframe sin protagonismo, coordinación, `safe-area`) | 11.2 y 11.3. |
| Yo Da (menos intrusión, tamaño táctil, foco, chips con contraste) | 12. El nombre ya está unificado en el código. |
| El sonido y la voz por defecto | Sigue activado, por la prueba; la elección en el umbral queda para Lucas. La voz ya habla solo si se le pide (11.1). |
| El umbral (llevar el ojo más lejos, un iris barato, el aviso legal) | La pupila que se dilata; el aviso legal abajo, como placa de película (9.4, 13.1). |
| TituloTinta y `.imprenta-tipo` | Títulos por máscara de palabras; la tinta queda solo en el nombre de la portada (9.3). |
| Las láminas inclinadas y el marco | Sin giro y sin marco, a sangre o en la grilla (8.3). |
| El contraste de los controles | `--borde-control` (3.2). |
| Los formularios | Errores asociados; carga y éxito compuestos (6.5, 6.6). |
| SubnavMasterclass | Dentro de la portadilla; el 1 a 1, más íntimo (7.3, 13.7). |
| Las imágenes (`srcset` de los grabados, una sola decodificación) | 8.7. |
| Revelar y Atencion | El observador de cambios, en `main`; Atencion sin halo ni magnetismo (9.7). |
| El pie (`.enlace`, grilla, el año) | Colofón (7.4). |
| Los folios como orientación | Una sola fuente (7.5). |

**Eliminar**

| Ítem | Decisión |
|---|---|
| El halo del puntero | Se elimina. |
| El magnetismo de `.boton-lleno` | Se elimina. |
| `.llamado` (la sombra que late) | Se elimina. |
| Uno de los dos marcos | Se elimina MarcoPagina. MarcasImprenta queda solo alrededor del grabado de las portadillas de tipo sala. |
| Las Estrellas | Se eliminan en todas partes, incluido el umbral: el grabado ya trae las suyas talladas. |
| Los Flotantes (19 emblemas) | Se eliminan; el surf y los clavos no son capítulos. |
| La segunda pasada del grabado | Se elimina. |
| La pila de separadores | Queda uno por página. |
| Las secciones del inicio que duplican la navegación | Se unifican en el Índice con datos (13.2). |
| La gota `.bajar`, el folio y la marginalia en la misma portada | Quedan el folio y el hilo; la marginalia se va. |
| `EspacioFoto.tsx` y `Seccion.tsx` | Se eliminan (verificado: no los importa nadie). |
| **Además:** CursorAnillo, el grano de `body::after`, el `despertar` con blur, el OjoFantasma y el halo del umbral, el aura de Yo Da, el `backdrop-filter` de la guía, la pluma y el filtro de tinta en los h1 internos | Se eliminan, cada uno en su propio commit. |

---

## 18. Qué no se toca

**Funciones.** Todo lo de la sección 4 de la auditoría de arquitectura sigue igual:
- umbral, revelado y su seguro;
- navegación, epígrafes y fotos;
- conferencias y lista;
- legales y el Botón de arrepentimiento;
- cuentas, TOTP y verificación;
- compras, directo a voluntad, sala y pantalla única;
- libros, canje y lector;
- agenda, zonas horarias, reprogramar y cancelar;
- Yo Da con sus juegos, horarios, consultas, crisis, ritmo y recorrido;
- música, sonido, PWA y service worker;
- CSP y límites.

El rediseño cambia presentación y composición: nunca la lógica de `lib/`, `app/api/`, las acciones, el middleware (salvo el CSS de la página 429) ni la seguridad.

**Rutas.**
- Todas las públicas y privadas quedan como están.
- Las redirecciones `/en-vivo` → `/masterclass` y `/sesiones` → `/masterclass/1-a-1` siguen.
- `/canjear` no se mueve (es la del QR impreso).
- Se suma solo `/biografia`.

**`data-testid`.** No se renombra ni se saca ninguno. Estos son los que existen hoy; también los que se arman con variables, como `bloquear-`, `desbloquear-`, `quitar-`, `bloqueo-ok` y `bloqueo-error`:

`umbral`, `cuenta-movil`, `interruptor-sonido`, `instalar-nav`, `instalar-menu`, `instalar-boton`, `aviso-app`, `guia-instalar`, `musica-boton`, `musica-panel`, `musica-play`, `musica-fragmentos`, `musica-ayuda`, `musica-sesion`, `musica-app`, `musica-app-siempre`, `epigrafe`, `foto-{nombre}`, `quien-es`, `estado-{libro}`, `indice-{libro}`, `leer-{libro}`, `subnav-masterclass`, `directo-{id}`, `bloque-grabada`, `ya-reservada`, `texto-legal`, `estado-app`, `mensaje-ok`, `mensaje-error`, `aviso`, `paso-codigo`, `desafio`, `desafio-casilla`, `desafio-token`, `calendario`, `mes`, `dia-{fecha}`, `turnos-del-dia`, `horario-{id}`, `horario-nuevo`, `julian-{id}`, `zona`, `zona-julian`, `hora`, `cuando`, `horario-tomado`, `horario-no-disponible`, `espacio-vacio`, `tus-accesos`, `acceso-agenda`, `acceso-consultas`, `acceso-mis-consultas`, `reservas-por-delante`, `sin-acceso`, `compra-ok`, `progreso`, `marcar`, `siguiente`, `mis-preguntas`, `mi-conferencia-{id}`, `link-acceso`, `mi-directo-{id}`, `sala`, `marca-agua`, `sala-pausada`, `compras`, `salir-de-todos`, `biblioteca-{libro}`, `libro-ok`, `indice`, `lector`, `capitulo-siguiente`, `mi-sesion-{id}`, `link-sesion`, `agregar-calendario`, `google-calendar`, `reprogramar`, `cancelar`, `confirmar-cancelacion`, `confirmar-cancelar`, `no-cancelar`, `sin-cambios`, `reprogramada-ok`, `cancelada-ok`, `reserva-error`, `encuentro-actual`, `confirmar-reprogramacion`, `confirmar-reprogramar`, `reprogramar-no`, `agenda-panel`, `agenda-ics`, `reserva-{id}`, `sala-{id}`, `liberar-{id}`, `confirmar-liberacion`, `confirmar-liberar`, `liberada-ok`, `calendario-agenda`, `aviso-agenda`, `agenda-del-dia`, `agenda-{id}`, `bloquear-{id}`, `desbloquear-{id}`, `quitar-{id}`, `bloqueo-ok`, `bloqueo-error`, `seguridad-panel`, `seguridad-resumen`, `seguridad-eventos`, `ticket-form`, `ticket-ok`, `ticket-error`, `ticket-{id}`, `mi-ticket-{id}`, `estado-ticket`, `ticket-estado`, `ticket-guardar`, `yosoy`, `yosoy-boton`, `yosoy-nube`, `yosoy-nube-recorrido`, `yosoy-cabeza`, `yosoy-altavoz`, `yosoy-sonido`, `yosoy-horarios`, `yosoy-horario-{id}`, `yosoy-horarios-pausa`, `yosoy-ppt`, `yosoy-ppt-resultado`, `yosoy-ppt-final`, `yosoy-ppt-agotado`, `yosoy-moneda`, `yosoy-moneda-resultado`, `yosoy-moneda-cansada`, `yosoy-pausa`, `yosoy-otro-tema`, `yosoy-poner-musica`, `yosoy-recorrido`, `recorrido`, `recorrido-globo`, `recorrido-luz`, `recorrido-texto`, `recorrido-seguir`, `recorrido-saltar`.

**Clases, selectores y estructura que leen las pruebas:**
- `main .revelar` y `.visto`;
- `.nav-enlace`, `.nav-icono` y `golpe`;
- `#menu-movil`, `header nav`;
- `.cal-dia.libre`, `.cal-dia.libre:not(.elegido)`, `.elegido` con `aria-pressed`;
- `.yosoy-msj.yo` y `.yosoy-pensando`;
- `.yosoy-nube-texto` (se toca para abrir el panel) y `.yosoy-chips` (tiene que verse);
- los mensajes de Yo Da van sin `text-transform`: `yoda-regiones.spec` lee su `innerText`, que sí lo aplica;
- `.foto-marco`, cuyo `clip-path` final tiene que ser `inset(0)` o `none`;
- `blockquote .sr-only` y `figcaption` del epígrafe;
- `#quien`, `#receta`, `#biografia`;
- `input[name="sitio_web"]`;
- `locator("audio")` (8);
- las clases de `html` (`js`, `en-umbral`, `umbral-saliendo`, `umbral-visto`, `sin-revelar`, `bajo`, `guia-abierta`);
- el primer `<form>` de `/ingresar`;
- `indice-receta` con 6 `li` sin `aria-hidden`;
- tres epígrafes en `/libros`, en orden;
- al menos uno en `/` y en `/masterclass`, y en `/` el primero es el que rota;
- el `.last()` de `interruptor-sonido` y de «Botón de arrepentimiento», que son los del pie.

**Nombres accesibles y textos exactos:**
- «Entrar», «Menú», «Mes anterior», «Mes siguiente», «Enviar», «Escribile a Yo Da», «Tu espacio», «Otra frase», «Cerrar el aviso de la app», «Cerrar el saludo de Yo Da», «Instalar la app»;
- en Yo Da, el enlace «Abrir en Spotify», que abre aparte (`target="_blank"`);
- todos los textos que lista la auditoría de arquitectura en 7.3;
- «Hola, {nombre}.»;
- «Sonido activado/silenciado»;
- los cuatro `<h2>` de /app: «iPhone y iPad», «Android, Windows, Linux y Chromebook», «Mac», «Firefox»; y el «Cerrar» de la guía de instalación.

**Service worker:** guarda `/libros` y `/sin-conexion`, y nunca nada de `/mi-espacio` (lo verifica `app.spec`). La caché de imágenes que se suma (16) no cambia esas reglas.

**`data-recorrido`:** `libros`, `masterclass`, `conferencias`, `fragmentos`, `lista`, `menu`, `musica`, `instalar`, `cuenta`, `yoda`.

**Estado del cliente:**
- las claves de `sessionStorage` y `localStorage` (`jb-umbral`, `jb-sonido`, `jb-zona`, `jb-aviso-app-cerrado`, `jb-frases-*`, `jb-yoda-*`, `desafio:turnstile-caido`);
- los eventos de `window` (`umbral:abierto`, `jb-sonido`, `jb:zona`, `jb:musica`, `jb:musica-pausa`, `jb:instalable`, `jb:instalada`, `jb:guia-instalar`, `jb:recorrido`);
- los globales `__jbListo`, `__jbInstalar`, `__jbInstalada`, `__jbSpotify`.

**Contenido:**
- **Las palabras de Julián:** `frases.ts` y `citas` no cambian ni una letra; a `frases.ts` solo se le puede sumar el campo `id`, con el OK de Lucas. Los títulos de los capítulos, las descripciones y los textos de `config.ts`, `yosoy.ts` y `legales.ts` no se reescriben: se recomponen.
- **Los marcadores** «(… a definir)» quedan literales, porque los lee `esMarcador`.
- **Nada se inventa:** ninguna fecha, precio, tema, crédito, lugar, año de vida, testimonio ni frase.

**Tokens:** los valores de color de `:root` no cambian.

---

## 19. Plan de implementación

### Reglas de trabajo

- **Empezar después de los otros trabajos.** La seguridad, el recorrido de Yo Da, la música con guiños, las consultas a una persona y `REFERENCIA.md` ya están commiteados (`832f261`). Al escribir este documento sigue en curso el habla de Yo Da por país, con cambios sin commitear en `components/YoSoy.tsx`, `content/yosoy.ts`, `content/yoda-*.ts`, `app/api/yo/route.ts` y las pruebas de Yo Da. El rediseño arranca cuando ese trabajo esté commiteado; si no, los choques en `YoSoy.tsx` y en los textos de Yo Da están asegurados.
- **Rama propia:** el rediseño va en su rama, desde el HEAD de ese momento. Este `DISENO.md` se commitea antes del primer cambio.
- **Commits:** uno por paso, con el mensaje «Rediseño N.M · …». Nunca se reescribe la historia ni se fuerza un push.
- **Después de cada fase:** `npm run build && npm test` (los dos proyectos, celular y computadora), cuando el puerto 3200 esté libre. Además, se revisa a ojo en 360, 412, 768, 1024, 1280, 1440 y 1920 px con la prueba de lámina (2).
- **Regla de reversión** (pedido, sección 36):
  - Si una fase no funciona visual o estratégicamente, **se revierten sus commits con `git revert`**. No se sigue acumulando cambios arriba.
  - Después de `1c2c801` entraron otros trabajos (`832f261`: seguridad, recorrido, música). Por eso, la vuelta fina es revertir solo los commits del rediseño, y eso conserva esos trabajos.
  - La vuelta total, como última red, es el deployment del commit `1c2c801` en Vercel (*Instant Rollback*). Para solo mirar esa versión: `git checkout referencia-pre-rediseno`.

### Fase 0 · Preparación (sin cambios visuales)

- **Qué se hace:**
  - Commitear `DISENO.md` (`REFERENCIA.md` ya entró en `832f261`).
  - Crear la rama.
  - Sacar capturas de referencia de todas las páginas (360, 412, 768, 1024, 1280, 1440, 1920) en el scratchpad, fuera del repositorio.
- **Prueba:** la suite completa en verde (la línea de base).

### Fase 1 · Sistema visual y tokens

1. **Tokens.**
   - Qué se hace: los alias por superficie, la escala tipográfica, los espacios, los silencios, los tokens de movimiento, la grilla `.pliego` con sus zonas, y el orden de los colores sueltos (3.5). Todavía sin cambiar la composición.
   - Archivos: `app/globals.css`, `app/manifest.ts` y el CSS de la página 429 en `middleware.ts`.
2. **Fuentes.**
   - Qué se hace: Alegreya, Alegreya SC y Archivo; se quita Crimson; las versalitas pasan a Alegreya SC; se renombran los `@keyframes` duplicados; se suma `viewportFit: "cover"`.
   - Archivos: `app/layout.tsx`, `app/globals.css`, `components/IndiceLibro.module.css`.
3. **Quitas**, cada una en su commit:
   - Flotantes;
   - el grano;
   - MarcoPagina;
   - CursorAnillo;
   - el halo y el magnetismo (Atencion queda con el avance y `html.bajo`, también con reducir movimiento);
   - `.llamado`;
   - las Estrellas, el OjoFantasma y el halo del umbral;
   - la pluma;
   - la segunda pasada y el giro;
   - `despertar`;
   - la tinta de los h1 internos;
   - el aura de Yo Da;
   - el `backdrop-filter` de la guía;
   - `EspacioFoto.tsx` y `Seccion.tsx`.

   Archivos: `app/layout.tsx`, `app/globals.css`, `components/Atencion.tsx`, `Apertura.tsx`, `Umbral.tsx`, `Grabado.tsx`, `app/page.tsx`.
4. **Componentes base.**
   - Qué se hace: botones, enlaces, rótulo, Ficha, Rombo, las cuatro clases de pendiente (Marcador), Precio, formularios (errores asociados, carga), foco, selección, barra de desplazamiento y `forced-colors`.
   - Archivos: `components/Marcador.tsx`, `Ornamento.tsx`, `Precio.tsx`, `Formulario.tsx`, `CanalContacto.tsx`, `MontoVoluntad.tsx`; nuevos: `Ficha.tsx`, `Rombo.tsx`.
5. **Navegación.**
   - Qué se hace: la barra (siempre visible, compacta y completa), NavEnlace, el Índice, SubnavMasterclass, el pie como colofón, y `portadillas` como la única fuente de folios, títulos y rutas.
   - Archivos: `components/Encabezado.tsx`, `NavEnlace.tsx`, `MenuMovil.tsx`, `SubnavMasterclass.tsx`, `Pie.tsx`, `content/config.ts`, `app/page.tsx` (índice), `app/checkout/[producto]/page.tsx`, `app/not-found.tsx`, `app/sin-conexion/page.tsx`.
6. **Portadillas y láminas.**
   - Qué se hace:
     - Apertura con sus seis tipos y TituloTinta por máscara (por ahora sin la coreografía fina, que llega en la fase 8);
     - Grabado con `srcset`;
     - Foto sin marco y en duotono;
     - la Epígrafe en redonda, con el capítulo y el emblema.
   - Herramientas **[herramientas]**: extender `herramientas/fotos_web.py` (duotono negro/crema y grano) y generar `*-tinta-*.webp`; generar los grabados de 400 px y `observador-crema-700`; exportar en tinta negra `libertad-interna` y los emblemas del Pensamiento.
   - Archivos: `components/Apertura.tsx`, `TituloTinta.tsx`, `Grabado.tsx`, `Foto.tsx`, `Epigrafe.tsx`, `public/fotos/`, `public/grabados/`, `public/emblemas/`.
- **Prueba:** todas las specs. A ojo: todas las páginas en 360 y 1280, que no haya texto de menos de 13 px y que el foco se vea en todo.

### Fase 2 · Inicio

- **Qué se hace:**
  - los siete movimientos: el umbral en su composición quieta, la portada, el silencio y la frase, las Tapas y el Mecanismo, Julián, el Índice con datos y el cierre;
  - la nube de Yo Da a los 2 s.
- **Herramientas:** `libertad-interna` en tinta negra ya exportada (1.6).
- **Archivos:** `app/page.tsx`, `components/Tapa.tsx` (nuevo), `components/Umbral.tsx`, `components/Epigrafe.tsx` (props `tamano` y `excluir`), `components/YoSoy.tsx` (solo la demora de la nube).
- **Prueba:** `publico`, `revelar`, `fotos`, `frases`, `interaccion`, `yosoy` y `recorrido`. A ojo: la primera pantalla a 360, 412, 768, 1280, 1440 y 1920 px, con la nube sin tapar el nombre.

### Fase 3 · Libros

- **Qué se hace:** la portadilla con el índice de volúmenes, los pliegos dobles con el lomo sticky, la Sincronía y los Puentes.
- **Archivos:** `app/libros/page.tsx`, `components/Sincronia.tsx` (nuevo), `content/config.ts` (`motivos`, `puentes`).
- **Prueba:** `publico` (estados, `indice-receta` con 6, el `href` de `leer-pensamiento`), `frases` (tres epígrafes en orden), `revelar` (`/libros`) y el desborde a 360 px.

### Fase 4 · Fragmentos

- **Qué se hace:** la Sala de lectura, el archivo completo, los medios pendientes y las redes.
- **Archivos:** `app/fragmentos/page.tsx`, `components/SalaDeLectura.tsx` (nuevo), `lib/frases.ts` (nuevo: `capituloDe`), `content/frases.ts` (solo el campo `id`, con el OK de Lucas).
- **Prueba:** `publico` (carga, desborde, emojis). Una prueba nueva y opcional, `tests/fragmentos.spec.ts`: la navegación con ← y →, el ancla `#f-{id}` y que no quede ningún `.revelar` escondido.

### Fase 5 · Biografía

- **Precondición:** Lucas confirma los datos (13.5), o se publica con la nota «a confirmar» que ya existe.
- **Qué se hace:** la ruta nueva; sumarla a `enlaces`, `portadillas`, el pie y el índice del inicio; las fotos en duotono marino; la trayectoria se muda desde el inicio; Yo Da, con el texto de Lucas.
- **Herramientas:** `*-marino-*.webp` y `poner-a-prueba.webp`.
- **Archivos:** `app/biografia/page.tsx` (nuevo), `components/Encabezado.tsx` (`enlaces`), `content/config.ts`, `app/page.tsx`, `components/Pie.tsx`, `tests/publico.spec.ts` (sumar `/biografia` a `paginas`) **[Lucas]**.
- **Prueba:** `publico`, `recorrido` (las paradas no cambian) y, si Lucas lo aprueba, `/biografia` agregada a `revelar.spec`.

### Fase 6 · Masterclass, 1 a 1, grabada y conferencias

- **Qué se hace:** 13.6 a 13.9, y el calendario solo en su estilo (las marcas pasan a CSS).
- **Archivos:** `app/masterclass/page.tsx`, `app/masterclass/1-a-1/page.tsx`, `app/masterclass/grabada/page.tsx`, `app/conferencias/page.tsx`, `app/conferencias/[id]/page.tsx`, `components/Calendario.tsx`, `SelectorZona.tsx`, `Hora.tsx`.
- **Prueba:** `publico`, `sesiones`, `zonas`, `envivo`, `accesos`, `revelar` (las tres masterclass y conferencias) y `fotos` (movimiento).

### Fase 6b · Formularios, cuenta, checkout, legales, sistema y Mi espacio

- **Qué se hace:** 13.10 a 13.14.
- **Archivos:**
  - las páginas: `app/lista`, `app/canjear`, `app/app`, `app/ingresar`, `app/crear-cuenta`, `app/checkout/[producto]`, `app/legales/[slug]`, `app/arrepentimiento`, `app/not-found.tsx`, `app/sin-conexion`, `app/mi-espacio/**`;
  - los componentes: `components/NavEspacio.tsx`, `SinAcceso.tsx`, `SalaProtegida.tsx`, `LectorProtegido.tsx`, `BotonInstalar.tsx`, `GuiaInstalar.tsx`, `Desafio.tsx` (solo estilos).
- **Prueba:** `accesos`, `biblioteca`, `envivo`, `agenda`, `reservas`, `seguridad`, `tickets`, `app` y `zonas`.

### Fase 7 · Yo Da y música

- **Qué se hace:** 11 y 12.
- **Archivos:**
  - `components/YoSoy.tsx` (clases y marcado; la lógica solo en lo que se nombra en 12);
  - `components/OjoPixel.tsx` (el estado «dormido»);
  - `components/Musica.tsx` (el orden del panel, las barras, la línea de tiempo; la lógica intacta);
  - `components/InstalarApp.tsx` (visible y tocable a los 6 s; el dock sube);
  - `components/RecorridoYoDa.tsx` (solo tokens y estilos, coordinado con quien lo hace);
  - `lib/sonido.ts` (el volumen);
  - `components/Sonidos.tsx` (el toque solo en botones);
  - `app/globals.css`.
- **Prueba:** `yosoy`, `recorrido`, `tickets`, `seguridad` (las partes de Yo Da), `interaccion` y `app` (el aviso).

### Fase 8 · Motion

- **Qué se hace:**
  - los tokens aplicados en todo;
  - el revelado sin blur;
  - los títulos por máscara con sus tiempos;
  - la estampa y la cortina;
  - el hilo y el parallax (CSS scroll-driven);
  - la coreografía del umbral (9.4) y el OjoVivo que se abre;
  - el cambio de página de 480 ms;
  - la cascada del Índice y la línea de carga;
  - la pausa de los bucles fuera de pantalla;
  - el observador de cambios de Revelar, en `main`.
- **Archivos:** `app/globals.css`, `components/Umbral.tsx`, `OjoVivo.tsx`, `TituloTinta.tsx`, `Revelar.tsx`, `Grabado.tsx`, `app/template.tsx`.
- **Prueba:**
  - `publico` (el umbral), `revelar` (todas), `fotos` (el `clip-path` final) y `recorrido` (reducir movimiento);
  - a mano, con reducir movimiento activado;
  - una traza de rendimiento en un Pixel 7 emulado: nada por debajo de 60 cuadros por segundo.

### Fase 9 · Responsive

- **Qué se hace:** revisar página por página a 360, 390, 412, 768, 1024, 1280, 1440 y 1920 px. Revisar la `safe-area` con la app instalada en un iPhone (sin simular), que todo tenga 44 px, que nada dependa del hover y las particularidades de la tablet (15).
- **Archivos:** sobre todo `app/globals.css` y ajustes de cada página.
- **Prueba:** `publico` (desborde a 360, 412 y 1280), `agenda` (360) y la revisión a mano.

### Fase 10 · QA

- **Qué se hace:**
  - la lista de la sección 20;
  - la suite completa en los dos proyectos;
  - Lighthouse en celular emulado y un análisis con axe;
  - revisar la consola y las violaciones de CSP (`seguridad.spec`);
  - regenerar las capturas del manifiesto (`public/capturas/`);
  - la caché de imágenes en el service worker, con su `VERSION` nueva (16);
  - comparar lado a lado con las capturas de la fase 0.
- **Prueba:** todo verde. Recién después, se publica.

---

## 20. Lista de QA final

Es la sección 35 del pedido, como lista para tildar. No se publica nada con un casillero sin tildar.

- [ ] **1. Todas las páginas:** las públicas, las privadas (con las cuentas demo), los checkouts y los estados de error y de éxito.
- [ ] **2. Compu:** 1024, 1280, 1440 y 1920 px, con la prueba de lámina en cada portadilla y en cada movimiento del inicio.
- [ ] **3. Celular:** 360, 390 y 412 px, con la barra entera, la portada sin la nube encima, el dock sin tapar nada y la `safe-area` en la app instalada.
- [ ] **4. Tablet:** 768 y 1024 px, en vertical y apaisada.
- [ ] **5. Navegación:**
  - la barra en los tres tramos;
  - el Índice con el foco atrapado, Escape y el foco de vuelta;
  - la subnavegación;
  - el pie;
  - Mi espacio;
  - todos los folios salen de `portadillas`;
  - las redirecciones;
  - ningún enlace roto.
- [ ] **6. Rendimiento:**
  - LCP < 2,5 s, CLS < 0,05 e INP < 200 ms en celular emulado;
  - fuentes ≤ 151 KB;
  - como máximo tres capas fijas;
  - ningún filtro vivo;
  - el JavaScript del cliente, menor que en `1c2c801`.
- [ ] **7. Accesibilidad:**
  - axe sin errores;
  - contraste según la tabla 3.3;
  - foco visible en todo;
  - navegable con teclado;
  - 44 px de área táctil;
  - reducir movimiento completo;
  - alto contraste;
  - zoom al 200 %;
  - lectura con VoiceOver y TalkBack del umbral, del inicio y de un formulario.
- [ ] **8. Consola:** sin errores ni advertencias, y sin violaciones de CSP en las páginas principales.
- [ ] **9. Ninguna función desapareció:** la lista de la sección 18 (y la sección 4 de la auditoría), revisada punto por punto, más la suite completa en verde.
- [ ] **10. Nada se inventó:**
  - las frases, iguales a `frases.ts`;
  - los marcadores, literales;
  - ningún año, precio, fecha, crédito, lugar ni testimonio nuevo;
  - los textos de interfaz nuevos, aprobados por Lucas (21).
- [ ] **11. Coherencia estética:**
  - la paleta, sin valores nuevos, y el dorado solo en Yo Da;
  - las tres familias, cada una en su voz;
  - un Ornamento por página;
  - ningún resto de estrellas, grano, cursor ni flotantes.
- [ ] **Y muy especialmente:** comparar lado a lado con las capturas de `1c2c801`. El objetivo no es mostrar cuánto se cambió, sino cuánto se mejoró sin perder la identidad. Si una pantalla perdió identidad, se revierte esa fase.

---

## 21. Lo que decide Lucas

1. **Biografía:**
   - el año de la Masterclass Reseteo (en el canal figura 2024);
   - la fuente de «Ernestina y el otro país» y de los datos de El Gran Premio;
   - las frases de los capítulos 1 y 3 (hay candidatas textuales en la auditoría);
   - si algún día se muestran los epígrafes propuestos;
   - sumar `/biografia` a las pruebas;
   - el texto de Yo Da para la Biografía.
2. **«Transición al Cap. 6»:** si la frase «Logré atravesar el tiempo con éxito.» se rotula así, que es lo fiel al libro. Es un dato de `frases.ts`, sin cambiar la frase.
3. **La duración del 1 a 1:** «a definir» o los 60 minutos que ya usa el `.ics`.
4. **Sonido:** si el umbral ofrece la elección (sin cambiar las pruebas), o si el sonido empieza apagado (eso cambia `interaccion.spec`).
5. **Yo Da:** «¿En qué ayudarte puedo?», «Lo que das, vuelve.» y el tema de la Biografía.
6. **Conferencias 2024:** el archivo de The Conference 01 a 04 (fechas y enlaces).
7. **Redes:** sumar @chef.julian.
8. **El orden de Pensamiento** (Hoja, punto 51). Afecta la numeración, pero no el diseño, porque todo sale de los datos.
9. **Textos de interfaz nuevos:**
   - «De los libros» (Fragmentos);
   - los nombres de los grupos del Índice («La obra», «Los encuentros», «El acceso»);
   - los rótulos de ficha;
   - «Créditos a definir»;
   - los rótulos de grupo de pendientes.
10. **Tapas y sincronía:**
    - mostrar la composición de las tapas antes de que salgan los libros (si no, la Tapa usa el ojo del cap. 2);
    - la columna de motivos de la sincronía;
    - la frase de la primera visita del inicio.
11. **El Mecanismo:** marcar los capítulos desde `capitulos` cuando se confirme el orden de Pensamiento. Hoy marca solo el 0.
12. **Un `id` estable por frase** en `frases.ts`, para los enlaces que se comparten desde Fragmentos. No toca los textos.

---

## Anexo A. Tokens para copiar (`app/globals.css`)

```css
:root {
  /* Colores: los de siempre, sin cambios */
  --negro: #0a0a0a; --negro-hondo: #050505; --negro-suave: #141414;
  --crema: #efe9dc; --blanco: #f7f5f0;
  --gris: #8f897d; --gris-claro: #d9d4c9; --gris-tinta: #5b574f;
  --linea-clara: #d8d3c8; --linea-hondo: #221f1c; --linea-marino: #2b3f63;
  --marino: #1c2b4d; --marino-profundo: #0f243e; --marino-claro: #a9b8d0;

  /* Alias de la superficie por defecto (.oscuro) */
  --fondo: var(--negro); --texto: var(--crema); --texto-lectura: var(--gris-claro); --texto-2: var(--gris);
  --linea: #262422; --borde-control: var(--gris); --foco: var(--crema); --lleno-hover: var(--gris-claro);

  /* Letras */
  --serif: var(--font-alegreya), "Palatino Linotype", Palatino, Georgia, serif;
  --versalitas: var(--font-alegreya-sc), var(--serif);
  --sans: var(--font-archivo), "Helvetica Neue", Arial, sans-serif;
  --libro: "Palatino Linotype", Palatino, "Book Antiqua", var(--font-alegreya), serif;

  /* Escala */
  --f-monumental: clamp(3.25rem, 1.5rem + 7.778vw, 8.5rem);
  --f-numeral: clamp(4.5rem, 2.333rem + 9.63vw, 11rem);
  --f-display: clamp(2.625rem, 1.667rem + 4.259vw, 5.5rem);
  --f-cita: clamp(1.625rem, 0.917rem + 3.148vw, 3.75rem);
  --f-cita-larga: clamp(1.5rem, 1rem + 2.222vw, 3rem);
  --f-titulo: clamp(1.75rem, 1.333rem + 1.852vw, 3rem);
  --f-epigrafe: clamp(1.375rem, 1.125rem + 1.111vw, 2.125rem);
  --f-subtitulo: clamp(1.3125rem, 1.167rem + 0.648vw, 1.75rem);
  --f-tapa: clamp(1.125rem, 0.917rem + 0.926vw, 1.75rem);
  --f-bajada: clamp(1.1875rem, 1.083rem + 0.463vw, 1.5rem);
  --f-cuerpo: clamp(1.125rem, 1.083rem + 0.185vw, 1.25rem);
  --f-lector: clamp(1.1875rem, 1.146rem + 0.185vw, 1.3125rem);
  --f-nota: 1rem; --f-versalitas: 1rem; --f-folio: 1rem;
  --f-rotulo: 0.8125rem; --f-dato: clamp(0.875rem, 0.854rem + 0.093vw, 0.9375rem); --f-dato-grande: 1.75rem;
  --f-nav: 0.875rem; --f-boton: 0.9375rem;

  /* Grilla y medidas */
  --cols: 4; --margen: 1.25rem; --medianil: 1rem; --ancho-max: 100rem; --ancho-texto: 34rem; --alto-barra: 3.5rem;

  /* Espacios y silencios */
  --e-1: .25rem; --e-2: .5rem; --e-3: .75rem; --e-4: 1rem; --e-5: 1.5rem; --e-6: 2rem;
  --e-7: 3rem; --e-8: 4rem; --e-9: 6rem; --e-10: 8rem; --e-11: 12rem; --e-12: 16rem;
  --pausa: clamp(3rem, 2.333rem + 2.963vw, 5rem);
  --silencio: clamp(6rem, 4.333rem + 7.407vw, 11rem);
  --sala: clamp(9rem, 6rem + 13.333vw, 18rem);
  --plano-negro: min(40svh, 20rem);

  /* Movimiento */
  --t-toque: 120ms; --t-luz: 240ms; --t-trazo: 320ms; --t-panel: 480ms; --t-revelado: 720ms;
  --t-renglon: 900ms; --t-lamina: 1200ms; --t-estampa: 1600ms; --t-respira: 6400ms;
  --lento: cubic-bezier(.22, .61, .36, 1); --tinta: cubic-bezier(.16, 1, .3, 1);
  --sala-curva: cubic-bezier(.65, 0, .35, 1); --sale: cubic-bezier(.7, 0, .84, 0); --respira: cubic-bezier(.37, 0, .63, 1);
}
@media (min-width: 40rem) { :root { --cols: 8; --margen: 2.5rem; --medianil: 1.5rem; } }
@media (min-width: 64rem) { :root { --cols: 12; --margen: clamp(3rem, 5vw, 6rem); --alto-barra: 4rem; --plano-negro: min(56svh, 34rem); } }
@media (min-width: 90rem) { :root { --medianil: 2rem; } }

.oscuro { --fondo: var(--negro); --texto: var(--crema); --texto-lectura: var(--gris-claro); --texto-2: var(--gris); --linea: #262422; --borde-control: var(--gris); --foco: var(--crema); --lleno-hover: var(--gris-claro); }
.hondo  { --fondo: var(--negro-hondo); --texto: var(--crema); --texto-lectura: var(--gris-claro); --texto-2: var(--gris); --linea: var(--linea-hondo); --borde-control: var(--gris); --foco: var(--crema); --lleno-hover: var(--gris-claro); }
.claro  { --fondo: var(--blanco); --texto: var(--negro); --texto-lectura: var(--negro); --texto-2: var(--gris-tinta); --linea: var(--linea-clara); --borde-control: var(--gris-tinta); --foco: var(--negro); --lleno-hover: var(--gris-tinta); }
.marino { --fondo: var(--marino-profundo); --texto: var(--crema); --texto-lectura: var(--gris-claro); --texto-2: var(--marino-claro); --linea: var(--linea-marino); --borde-control: var(--marino-claro); --foco: var(--crema); --lleno-hover: var(--gris-claro); }
```

La curva de escenas se llama `--sala-curva`, para no chocar con el silencio `--sala`: `--sala` es siempre un espacio y `--sala-curva`, siempre una curva.

---

## Anexo B. Medidas verificadas

**Fuentes** (archivos que sirve Google Fonts, subconjunto latino, woff2)

| Archivo | Peso |
|---|---|
| Alegreya redonda | 43 KB |
| Alegreya itálica | 44 KB |
| Alegreya SC 400 | 29 KB |
| Archivo, solo peso | 35 KB |
| Archivo con ancho | 90 KB (descartado) |
| Newsreader redonda | 132 KB (descartada) |

**Rasgos**
- Alegreya: `ccmp dnom frac liga lnum locl numr pnum tnum`, sin `onum` (por defecto ya es elzeviriana) y sin `smcp`.
- Newsreader: `liga pnum tnum`.
- Ninguna trae ◆ ● ○.

**Anchos a 1 em** (Alegreya): «Julián» 2,41 · «Bermúdez» 4,25 · «Julián Bermúdez» 6,85 · «Arrepentimiento» 6,87 · «Tu libro, también digital» 9,95.

**Anchos a 1 em** (Archivo): «Libros» 2,92 · «Biografía» 4,18 · «Fragmentos» 5,58 · «Masterclass» 5,62 · «Conferencias» 6,17 · «Sumate» 3,54 · «Instalar la app» 6,39 · «Ingresar» 3,84 · «Mi espacio» 4,94 · «Menú» 2,57.

**La barra**

| Ancho de pantalla | Contenido | Necesita | Resultado |
|---|---|---|---|
| 1280 | completa | ≈ 1.226 px | entra |
| 1024 | completa | ≈ 1.200 px | no entra |
| 1024 | compacta | ≈ 925 px | entra |
| 360 | sin sesión | 344 px | entra |
| 360 | con «Mi espacio» | 359 px | entra |

**El nombre de la portada**
- A 1440 px (136 px de cuerpo): «Bermúdez» mide 578 px, más 68 px de sangría, en una zona de 746 px.
- A 360 px (52 px de cuerpo): 221 px más 26 px, en 320 px.

**Fotos** (px)

| Foto | Medida | Proporción |
|---|---|---|
| chef y doble exposición | 1200 × 1800 | 2:3 |
| trofeo | 1117 × 1408 | 4:5 |
| emplatando y movimiento | 1123 × 1401 | 4:5 |
| mirada | 2000 × 808 | fondo #ffffff |
| mirada vertical | 680 × 801 | 0,85:1 |

**Tonos de fondo**
- Oscuros: chef, de #0e0e0e a #3b3b3b; trofeo, de #0d0d0d a #635f59.
- Claros: doble exposición, de #9e9e9e a #d2d2d2; movimiento, #f1ece2; mirada, #ffffff.

**Grabados**
- 700 × 700 o 800 × 800; `observador-crema` mide 1100 × 1100 (222 KB).
- Tinta crema (#eee8dc a #f1ebdf), salvo `pensamiento-ojo`, que es negro (#090909).

**Umbral de las pruebas**
- La nube de Yo Da se monta a los 0,7 s y la esperan 5 s.
- El aviso de la app se monta a los 1,8 s y hoy se ve a los 6 s.
- La prueba de computadora usa 1280 × 720; la de celular, un Pixel 7 (412 px).
