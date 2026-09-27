/**
 * FRASES DE JULIÁN que rotan en los epígrafes del sitio: las más inspiradoras e
 * ingeniosas de los tres libros, sin las negativas (pedido de Lucas; elegidas por
 * un curador por libro y un jurado). Todas son TEXTUALES de los manuscritos
 * («edición integral con sitio, revisión 3»), verificadas palabra por palabra. No se reescriben: si se cambia el libro, se
 * vuelven a verificar. Para sumar una, copiala exacta del manuscrito.
 */
export type Frase = { texto: string; libro: "receta" | "pensamiento" | "biografia"; capitulo: string };

export const tituloLibro = {
  receta: "La Receta de la Manifestación",
  pensamiento: "El Pensamiento es Tu Fe",
  biografia: "Biografía",
};

export const frases: Frase[] = [
  // las tres frases de transición (antes del último capítulo de cada libro): las firmas de la trilogía, también en las contratapas
  { libro: "receta", capitulo: "Transición — antes de Cargar el Estado", texto: "No podés pescar una ballena con las herramientas para pescar un dorado." },
  { libro: "pensamiento", capitulo: "Transición — antes de Atravesar el Tiempo", texto: "Logré atravesar el tiempo con éxito." },
  { libro: "biografia", capitulo: "Transición — antes de Poner a Prueba", texto: "Detrás del que está llorando hay alguien que está muy tranquilo observando cómo vos estás llorando." },
  { libro: "receta", capitulo: "Cap. 0 — Dos Formatos de la Mente", texto: "Todas las cosas son posibles dentro del mundo de la creencia, dentro del mundo de la mente. Es un mundo infinito, donde hay infinitas moradas." },
  { libro: "receta", capitulo: "Cap. 1 — El Sentimiento Crea la Realidad", texto: "El objetivo en sí de todo esto no es visualizar para conseguir, sino es lograr ser consciente de ser algo." },
  { libro: "receta", capitulo: "Cap. 1 — El Sentimiento Crea la Realidad", texto: "En el momento en el que vos seas consciente, vas a ver naturalmente la semilla brotar." },
  { libro: "receta", capitulo: "Cap. 1 — El Sentimiento Crea la Realidad", texto: "Porque acá no se evalúa si lo visualizaste en 4K o si lo visualizaste en 720 píxeles. Acá se evalúa cuánto tiempo uno permanece en el estado de conciencia." },
  { libro: "receta", capitulo: "Cap. 2 — Conocedores del Bien y el Mal", texto: "«Yo soy» es una palabra, pero también «yo soy» es una sensación, es un saber, es un existir. Es un existir en, es un ser consciente de." },
  { libro: "receta", capitulo: "Cap. 2 — Conocedores del Bien y el Mal", texto: "Termina siendo una falta de respeto hacia la creación total pensar que a Dios o a la energía le cuesta manifestar las cosas. A la energía no le cuesta manifestar nada." },
  { libro: "receta", capitulo: "Cap. 2 — Conocedores del Bien y el Mal", texto: "Vos podés ir detectando qué estás diciendo a medida que lo vas diciendo y construyendo el estado de conciencia hasta que en un momento el huevo se rompe de adentro para afuera y sale el estado." },
  { libro: "receta", capitulo: "Cap. 3 — Ahora Mismo", texto: "La actividad es pensar desde el objetivo cumplido. Pero cualquier pensamiento es pensar desde, porque cualquier pensamiento piensa desde." },
  { libro: "receta", capitulo: "Cap. 3 — Ahora Mismo", texto: "Mirá cómo, si lo empezás a sentir como que ya hiciste el trabajo, de hecho ya lo estás haciendo." },
  { libro: "receta", capitulo: "Cap. 4 — La Pesca", texto: "Necesitás la herramienta a la altura, la mente y la emoción a la altura de la ballena, nada más. No podés pescar una ballena con las herramientas para pescar un dorado." },
  { libro: "receta", capitulo: "Cap. 5 — Cargar el Estado", texto: "O sea, el vacío realmente no existe, es la transformación de los elementos que esperan en el medio." },
  { libro: "receta", capitulo: "Cap. 5 — Cargar el Estado", texto: "No vas en contramano, andás encima por el camino que va. Y el camino que va es realmente creer con todo lo que puedas creer." },
  { libro: "pensamiento", capitulo: "Cap. 0 — La Palabra", texto: "Esas conversaciones son tu ingenio y la felicidad de esas conversaciones viene más por el ingenio de lo que se te ocurrió decir que por lo que decís en verdad." },
  { libro: "pensamiento", capitulo: "Cap. 0 — La Palabra", texto: "Obviamente, la imagen, para que sea carne, tiene que estar sentida." },
  { libro: "pensamiento", capitulo: "Cap. 1 — Libertad Interna", texto: "Lo que vos decís que podés y lo que decís que no podés, consecutivamente, frecuentemente, en el correr de los días, se convierte en un estado de conciencia." },
  { libro: "pensamiento", capitulo: "Cap. 1 — Libertad Interna", texto: "Las cosas en el mundo están ahí, pero vos estás adentro tuyo." },
  { libro: "pensamiento", capitulo: "Cap. 1 — Libertad Interna", texto: "Yo creo que estamos en este juego verdaderamente porque este juego fue hecho para uno. Y cada uno que está por ahí leyendo esto o escuchando esto, el juego es todo para vos." },
  { libro: "pensamiento", capitulo: "Cap. 3 — Conversaciones Sinceras", texto: "Lo que sí podés hacer es empezar a contar que lo superaste." },
  { libro: "pensamiento", capitulo: "Cap. 3 — Conversaciones Sinceras", texto: "Yo hoy lo que estoy contando como presente es pasado, y en el pasado, presente, he contado el presente como pasado. Por eso hoy lo cuento como pasado en mi presente." },
  { libro: "pensamiento", capitulo: "Cap. 4 — La Inteligencia Natural", texto: "Las respuestas tardan dos segundos o tardan dos días, no importa: llega la respuesta siempre." },
  { libro: "pensamiento", capitulo: "Cap. 5 — Arquetipos", texto: "Entonces, hoy te recomiendo que rediseñes verdaderamente tu avatar, porque, si no, sería como que andes con las mismas zapatillas hoy, a los cuarenta años, que tenías cuando tenías dieciséis." },
  { libro: "pensamiento", capitulo: "Cap. 6 — Atravesar el Tiempo", texto: "Entonces, se pierde el tiempo cuando pienso en el tiempo, se aprovecha el tiempo cuando utilizo el tiempo." },
  { libro: "pensamiento", capitulo: "Cap. 6 — Atravesar el Tiempo", texto: "Aparte, antes de la materialización externa y de la satisfacción por ver lo que vos querés ver, primero tenés la satisfacción interna, que es un regalo divino: poder autogenerarte esas sensaciones." },
  { libro: "biografia", capitulo: "Cap. 0 — Primera Imagen", texto: "Yo creo que el éxito que tengo realmente es por el hecho simplemente de que, a lo largo de estos 20 años de gastronomía, nunca dejé de verme de maneras gigantes, o de maneras en las que siempre triunfo." },
  { libro: "biografia", capitulo: "Cap. 0 — Primera Imagen", texto: "Tal vez a veces el estado de ánimo no estaba mejor que otros días o estaba peor, pero siempre trataba de tener la imagen del mejor resultado posible sobre lo que sea y de sentir imágenes de suerte." },
  { libro: "biografia", capitulo: "Cap. 1 — El Reconocimiento", texto: "Yo creo que la mente humana verdaderamente está todo el día mediante Instagram, mediante YouTube, mediante un librito, mediante ir a algún lugar, un evento, lo que sea, buscando una palabra, buscando una palabra." },
  { libro: "biografia", capitulo: "Cap. 1 — El Reconocimiento", texto: "Es impresionante, pero es real: sos vos mismo que, cuando se te ocurre la palabra o la encontraste y te identificás con esa palabra, basta para sanarte." },
  { libro: "biografia", capitulo: "Cap. 2 — El Desastre", texto: "Realmente la conversación mental crea la realidad y hablar tres o cuatro veces ya del mismo problema no tiene ningún tipo de sentido positivo." },
  { libro: "biografia", capitulo: "Cap. 2 — El Desastre", texto: "Podés llorar todo lo que quieras, pero detrás del que está llorando hay alguien que está muy tranquilo observando cómo vos estás llorando. Y yo siempre fui esa conciencia." },
  { libro: "biografia", capitulo: "Cap. 3 — Poner a Prueba", texto: "Entonces el día que bajé de peso físicamente y empecé a sentirme mejor conmigo mismo, muchas imágenes mentales se abrieron en mi mente de un buen futuro porque empecé a creer que eso ya podía ser posible de verdad." },
];
