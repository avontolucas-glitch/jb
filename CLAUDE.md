# Trilogía Julián Bermúdez — Editorial ELVERBO

Este repo es el compilado editorial de la obra oral de **Julián Bermúdez**. El nombre se escribe **con tilde en la «a» de Julián y en la «ú» de Bermúdez**, en todo lugar (regla confirmada por Lucas en sept. 2026; reemplaza la regla vieja de «Julian» sin tilde que figura en la skill `trilogia-jb`). Lucas compila cientos de horas de audio hablado en tres libros que son perspectivas distintas de una misma verdad y no deben repetirse innecesariamente.

## La trilogía

| Libro | Pregunta | Contenido | Diseño |
|---|---|---|---|
| **I — La Receta de la Manifestación** | ¿Cómo funciona? | mecanismos, procesos, ejercicios, técnicas | páginas negras, tinta crema |
| **II — El Pensamiento es Tu Fe** | ¿Por qué funciona? | filosofía, conciencia, Verbo, fe, identidad | páginas blancas; divisoria negra antes de cada capítulo |
| **III — Biografía** | ¿Quién lo descubrió? | Julián sin filtros: infancia, padre, fama, dolores | páginas azul marino, tinta crema |

## Manuscritos (`manuscritos/`)

Vigentes (edición integral, sept. 2026):
- `Receta de La Manifestación (edición integral).docx`
- `El Pensamiento es Tu Fe (edición integral).docx`
- `La Biografía (edición integral).docx`
- `Hoja de Revisión para Julián (2ª pasada).docx`: dudas que solo Julián puede confirmar o dictar.
- `Registro de cambios - Edición integral.docx`: cada cambio con su antes, su ahora y el motivo.
- `(edición integral con sitio)`: la misma edición integral más una página final, después del colofón, «Tu libro, también digital»: QR a julianbermudez.com/canjear y el recuadro `[CÓDIGO ÚNICO DEL EJEMPLAR]`, que la imprenta completa con datos variables (un código distinto por ejemplar, de un solo uso). Contratapas y PDF de imprenta `(con sitio)` con la dirección del sitio; vistas previas `(vista previa con sitio)`. Contratapas `(con fotos)`: la misma contratapa con una foto de Julián en duotono (Receta, doble exposición; Pensamiento, la mirada; Biografía, retrato de chef), hecha con `herramientas/contratapas_fotos.py`. Contratapas `(con fotos y quién es)`: la foto más chica y un texto breve de quién es Julián (solo datos confirmados; el año y el nombre del premio, a confirmar en la Hoja de Revisión 3ª pasada), con la frase de transición, el emblema y el sitio; `herramientas/contratapas_quien.py`.

- `(edición integral con sitio, sin colofón)`: la edición con sitio sin el colofón final («Este libro se terminó de componer…»), por pedido de Lucas; vistas previas `(vista previa con sitio, sin colofón)`.
- `(edición integral con sitio, revisión 4)`: **la versión a usar.** Es la revisión 3 más lo esencial de la conferencia en vivo de Julián (audio de 94 min): 29 fragmentos (14 en la Receta, 10 en Pensamiento, 5 en la Biografía; ~11.300 palabras) sumados a capítulos existentes, limpios en Modo 1, sin repetidos ni preguntas del público, cada uno con su minuto del audio en `Registro de cambios - Revisión 4.docx`. Además, 11 **páginas de respiro** con lo que Julián escribió en THE CHANNEL, al final de capítulos (Receta 0–3, Pensamiento 0–4, Biografía 0–1): el armado de la transición, el emblema chico del capítulo y la firma «JULIÁN BERMÚDEZ · THE CHANNEL» (`herramientas/respiro.py`, `revision4_respiro.json`). Correcciones: «imaginemos» (Receta) y «Podés llorar» (Biografía). La Hoja `(4ª pasada)` junta las dudas abiertas de la 3ª y las del audio (para Julián y para Lucas; entre las de Lucas, aprobar el nuevo final de la Biografía, que ahora termina con la casa, el pelo y el perdón). Datos y script: `herramientas/revision4_datos.py`, `revision4_audio.json`, `revision4_audio_hoja.json`, `revision_4.py`. Vistas previas `(vista previa con sitio, revisión 4)`.
- `(edición integral con sitio, revisión 3)`: la base de la revisión 4. Es la «apertura limpia» (de abajo) con la revisión completa de los tres libros: 25 correcciones evidentes (tipeo, tildes, puntuación, concordancia, «Escrituras», epígrafes textuales de la RVR1960: Marcos 5:30 completo y Génesis 3:5 «sabiendo»), cada una en `Registro de cambios - Revisión 3.docx`; las dudas, en `Hoja de Revisión para Julián (3ª pasada).docx` (26 para Julián, 4 para Lucas: ISBN, pie de imprenta, cómo nombrar la Receta en las notas, Lucas 17:14). Maqueta: en Pensamiento la divisoria es su propia sección y la primera página de texto va sin encabezado; rayas pegadas a su palabra; los títulos largos de la Receta en dos líneas; la tabla final sin rótulos pisados y con «—» en las celdas vacías; los ISBN de relleno como «[a definir]». Datos y script: `herramientas/revision3_datos.py` y `herramientas/revision_3.py`. Vistas previas `(vista previa con sitio, revisión 3)`.
- `(edición integral con sitio, sin colofón, apertura limpia)`: la base de la revisión 3 (Lucas: «en la introducción del capítulo, arriba no tiene que estar de nuevo conversaciones sinceras»; los títulos alternados del texto, «por el momento déjalo así»). La apertura de cada capítulo sin encabezado; en el texto siguen el título del libro (pares) y el del capítulo (impares), con su emblema. Tiene los mismos arreglos de secciones y la portada negra de la Receta que la de abajo. Vistas previas `(vista previa con sitio, sin colofón, apertura limpia)`.
- `(edición integral con sitio, sin colofón, encabezados simples)`: alternativa, por si Lucas decide simplificar más. Lo mismo, con encabezados más simples para no dar tantos estímulos (pedido de Lucas): la apertura de cada capítulo sin encabezado, y en las páginas de texto solo el emblema chico en la esquina de afuera (sin los títulos alternados del libro y del capítulo). Cada capítulo es su propia sección en página nueva y la transición, otra sin encabezado ni folio (antes La Pesca en la Receta y El Desastre en la Biografía habían quedado sin encabezado ni folio); los folios empiezan en 1 en el capítulo 0. En la Receta, además, la portada es negra pura (sin la textura ni el rombo del fondo), que también está sola en `(edición integral con sitio, sin colofón, portada negra)`. Vistas previas `(vista previa con sitio, sin colofón, encabezados simples)`. Scripts: `herramientas/portada_negra.py` y `herramientas/encabezados_simples.py` (hace las dos variantes).

Versiones anteriores, que se conservan intactas: `(nueva versión)`, `(sincronizado)`, `(sincronizada)` y `Hoja de Revisión para Julian.docx` (1ª pasada).

Además: `diseño/portadas/` tiene tapa y contratapa de cada libro (5.5×8.5 con 0.125" de sangrado, 300 dpi; las tapas llevan los tres corazones del Cap. 1, las contratapas la frase de transición de Julián con espacio para el código de barras); `vista previa/` tiene los PDF de los libros (la vista previa usa TeX Gyre Pagella en lugar de Palatino), `diseño/grabados/` los grabados sueltos en alta resolución y `herramientas/` los scripts de construcción.

## Sincronía capítulo a capítulo

Cada número de capítulo habla de lo mismo desde las tres facetas. Los tres libros comparten la **orla** del grabado y el **motivo**; lo que cambia es el centro.

| Cap. | Receta (cómo) | Pensamiento (por qué) | Biografía (quién) | Motivo / orla |
|---|---|---|---|---|
| 0 | Dos Formatos de la Mente (día y noche) | La Palabra (pluma) | Primera Imagen (semilla que germina) | la luz del principio / rayos |
| 1 | El Sentimiento Crea la Realidad (corazón con ojo y raíz, homenaje a la xilografía de Neville) | Libertad Interna (corazón con cerradura) | El Reconocimiento (corazón coronado) | el corazón / vid florida |
| 2 | Conocedores del Bien y el Mal (ojo de luz y sombra) | El Observador Eterno (ojo radiante) | El Desastre (ojo que llora) | el ojo / estrellas |
| 3 | Ahora Mismo (reloj de arena) | Conversaciones Sinceras (fruto) | Poner a Prueba (luna de las noches) | el tiempo de la práctica / fases lunares |
| 4 | La Pesca (pez) | La Inteligencia Natural (desierto) | — | océano y desierto / olas |
| 5 | Cargar el Estado (lámpara de aceite) | Arquetipos (cruz) | — | la llama / llamas |
| 6 | — | Atravesar el Tiempo (espiral) | — | espiral |

Transiciones (antes del último capítulo): en Receta, la caña de pescar; en Pensamiento, la espiral; en Biografía, el ojo que llora.

**Puentes que no se rompen sin consultar a Lucas:** el bloque del Ojo Observador, idéntico en Receta Cap. 2 y Pensamiento Cap. 2; la anécdota de Shelleyar, idéntica en Pensamiento Cap. 1 y Biografía Cap. 3; la plata de la mamá y el bullying (Biografía Cap. 2 ↔ Pensamiento Cap. 3, eco invisible); «una palabra tuya basta para sanarme» (Biografía Cap. 1) ↔ «yo buscaba esa palabra para sanarme» (Biografía Cap. 2); «mientras iban, fueron sanados» (Receta Cap. 3 ↔ epígrafe y cierre de Pensamiento Cap. 6). Las notas al margen apuntan a Receta Cap. 1 y 2 y a Pensamiento Cap. 1, 2 y 6; si se renumera algo, hay que revisarlas.

## Rol del editor (invisible)

Nunca autor, nunca coautor. No se agregan enseñanzas, conceptos, ejemplos, analogías ni transiciones propias; no se completa una idea que Julián dejó abierta. Si algo no fue dicho por él, no existe para el libro. Ante la duda entre fidelidad y creatividad, siempre fidelidad.

**Voz de Julián (innegociable):** no reescribir, no mejorar, no embellecer. Se preserva ritmo, repeticiones con sentido, autocorrecciones, voseo argentino y su forma de construir ideas. Se permite: corregir palabras mal transcriptas hacia lo que quiso decir (si es dudoso, va a la Hoja de Revisión), sacar muletillas de grabación dirigidas al oyente y arranques falsos, y ordenar la puntuación. No se suman signos que su habla no tiene (rayas de inciso y punto y coma innecesarios): así el texto sigue sonando a él.

## Flujo de trabajo

**Modo 1 — Transcripción (por defecto):** solo corregir errores evidentes de reconocimiento de voz, puntuación, tildes y separación de párrafos. Lo dudoso se marca `[posible error de reconocimiento de voz — a confirmar]`.

**Transcripciones nuevas (limpiar + insertar en un paso):** limpiarla e insertarla en el libro que corresponda (mecanismo → Receta, reflexión → Pensamiento, experiencia personal → Biografía), sacando antes el andamiaje de entrevista. Conviene ampliar un capítulo existente antes que abrir uno nuevo, y un capítulo nuevo se confirma siempre con Lucas. Si un pasaje depende de otro, se duplica completo.

**Modo 2 — Edición:** se activa con "ETAPA DE EDICIÓN" o con un pedido explícito de Lucas de trabajo editorial integral.

## Sistema de diseño (base de imprenta)

- Trim 5.5×8.5" (7920×12240 twips), márgenes espejados: sup. 0.75", inf. 0.7", interior 0.75", exterior 0.55". Partición de palabras activada.
- Cuerpo: Palatino Linotype 11 pt, interlineado 1,2, 7,5 pt entre párrafos, justificado.
- Aperturas: grabado del capítulo en el fondo (arriba), espaciador de altura fija, «CAPÍTULO N» en 9,5 pt con tracking, título en 16,5 pt y epígrafe «…» en itálica con la cita en versalitas. Los epígrafes van en RVR1960; los no confirmados llevan `[versículo propuesto — a confirmar]`.
- Encabezado: el emblema del capítulo arriba a la derecha (0.30"). Portada, copyright e índice van sin ícono; la transición lleva encabezado vacío.
- Letra capital de 3 líneas en cada apertura. Encabezados: la apertura de capítulo va sin encabezado; en el texto, página par = título del libro con emblema a la izquierda, impar = título del capítulo con emblema a la derecha (en la alternativa «encabezados simples», solo el emblema). Folios «· N ·» centrados. Copyright en Palatino 8 pt en el tono del libro. Página «La trilogía» antes del índice. Al final de cada libro: «La trilogía, capítulo a capítulo» (tabla con los grabados de los tres libros, sección con encabezado vacío); el colofón se sacó en la versión «sin colofón». Las notas de puente llevan arriba el emblema del capítulo al que remiten.
- «En el principio» en versalitas en cada Cap. 0. Cierre de capítulo con ◆ ◆ ◆ en el color de acento, siempre pegado al último párrafo.
- Imprenta: Receta y Biografía tienen fondo de página completo oscuro, así que al exportar para imprimir hay que pedir sangrado (0.125").

## Herramientas (`herramientas/`)

- `engine.py` y `designs.py`: motor de grabado procedural (estampa de linóleo: marcas de desbaste, tinta despareja con vetas de rodillo, bordes aplastados, leve giro del taco) y los dibujos de cada emblema.
- `assets.py`: genera los fondos de página y los emblemas.
- `edits_*.py`: la lista de correcciones por libro.
- `phase_text.py`: aplica texto, estructura y sincronía.
- `phase_design.py`: aplica maqueta, íconos, índice y ornamentos.
- `cross_emblems.py`: emblemas de los tres libros en la tinta de cada uno (mapa y notas de puente).
- `covers.py`: genera las tapas y contratapas.
- `make_docs.py`: genera el registro de cambios y la Hoja de Revisión.
- `integrar_sitio.py` y `contratapas_sitio.py`: agregan el sitio a los libros (página del código y QR) y a las contratapas, como versiones nuevas.
- `emblemas_nuevos.py`: el clavo y los tres clavos, con el mismo motor de grabado. `surf_desde_imagen.py`: el emblema del surf, a partir del dibujo de Lucas (`diseño/referencias/surf.png`; ver `diseño/referencias/LEEME.md`).
- `fotos_web.py`: pasa las fotos de Julián (`diseño/fotos/`) a blanco y negro para el sitio.
- `emblemas_cocina.py` (con `cocina/<ícono>.py`): los íconos de cocina del universo chef de Julián (cuchillo, sartén, batidor, cuchara de madera, parrilla, gorro), tallados con el mismo motor; flotan en el sitio entre los emblemas. Son un plus del sitio: no van en los libros.

## Sitio web (`sitio/`)

Prototipo de julianbermudez.com (Next.js). El nombre va «Julián Bermúdez», con tilde, también en el sitio. Estética de los libros: tinta crema sobre negro, los grabados y emblemas de la trilogía, nada de urgencia ni trucos de venta. Precios, fechas y textos en `sitio/content/config.ts`; lo que falta escribir va como «(Texto … a definir)» (nunca «lo escribe Julián»). Cómo correrlo, probarlo y publicarlo: `sitio/README.md`.

- **Frases de los epígrafes** (`sitio/content/frases.ts`): solo textuales de los manuscritos, verificadas palabra por palabra; rotan cada vez que se entra a una página. Para sumar una, copiarla exacta del libro. También las que Julián escribió en sus canales de Instagram (fuente «canal», firmadas «Julián Bermúdez · THE CHANNEL»; los textos tal cual, con fecha, en `fuentes/canal-de-julian.md`): solo se corrigen tildes, signos de apertura y errores de tipeo evidentes.
- **Fotos de Julián**: originales en `diseño/fotos/`; las versiones web en blanco y negro salen con `herramientas/fotos_web.py` a `sitio/public/fotos/`.
- **Agenda de la Masterclass 1 a 1**: Julián carga horarios en hora de Argentina; cada visitante los ve en su hora, con la de Julián al lado (`sitio/lib/zona.ts`).
- **App instalable**: un solo botón «Instalar la app» que detecta sistema y navegador (`sitio/lib/instalar.ts`).
- **Seguridad** (`sitio/SEGURIDAD.md`): límites de intentos, verificación tipo CAPTCHA tras varios intentos (Turnstile o prueba en el navegador), trampas para bots, CSP, código de 6 dígitos de Julián, panel `/mi-espacio/seguridad`, qué activar en Vercel y la lista de chequeo antes de publicar.
- **Yo Da** (`sitio/content/yosoy.ts`): la guía del sitio, un ojo pixelado que habla a lo Yoda con tono místico; es soporte, nunca la voz de Julián. **Música de fondo**: temas al azar de su playlist de Spotify (`sitio/content/musica.ts`).

Las rutas de trabajo están fijadas a la sesión donde se crearon: para reusarlos hay que ajustarlas.

## Reglas de trabajo

- Los textos de Julián son sagrados: ante cualquier duda, preguntar o marcar, nunca decidir por él.
- No borrar ni sobrescribir manuscritos: las versiones nuevas van al lado de las anteriores.
- Hablar en español rioplatense (voseo) con Lucas.
- Al terminar, resumir en pocas líneas qué se hizo y qué archivos quedaron.

Para trabajo editorial de fondo, consultar también las skills `trilogia-jb` y `jb-expert`, pero la regla del nombre y el mapa de capítulos de este archivo tienen prioridad sobre lo que digan esas skills.
