/**
 * FRASES DE JULIÁN que rotan en los epígrafes del sitio.
 * Todas son TEXTUALES de los manuscritos (edición integral), verificadas palabra
 * por palabra contra el texto. No se reescriben: si se cambia el libro, se
 * vuelven a verificar. Para sumar una, copiala exacta del manuscrito.
 */
export type Frase = { texto: string; libro: "receta" | "pensamiento" | "biografia"; capitulo: string };

export const tituloLibro = {
  receta: "La Receta de la Manifestación",
  pensamiento: "El Pensamiento es Tu Fe",
  biografia: "Biografía",
};

export const frases: Frase[] = [
  { libro: "receta", capitulo: "Cap. 0 — Dos Formatos de la Mente", texto: "Todas las cosas son posibles dentro del mundo de la creencia, dentro del mundo de la mente. Es un mundo infinito, donde hay infinitas moradas." },
  { libro: "receta", capitulo: "Cap. 1 — El Sentimiento Crea la Realidad", texto: "El sentimiento que está clavado en el pecho en este momento corresponde a todo lo que nos sucede, y realmente nos sucede." },
  { libro: "receta", capitulo: "Cap. 1 — El Sentimiento Crea la Realidad", texto: "En el momento en el que vos seas consciente, vas a ver naturalmente la semilla brotar." },
  { libro: "receta", capitulo: "Cap. 2 — Conocedores del Bien y el Mal", texto: "«Yo soy» es una palabra, pero también «yo soy» es una sensación, es un saber, es un existir." },
  { libro: "receta", capitulo: "Cap. 2 — Conocedores del Bien y el Mal", texto: "Si yo quiero tener un talento, primero me tengo que hacer consciente de tener ese talento." },
  { libro: "receta", capitulo: "Cap. 2 — Conocedores del Bien y el Mal", texto: "Vos podés ir detectando qué estás diciendo a medida que lo vas diciendo y construyendo el estado de conciencia hasta que en un momento el huevo se rompe de adentro para afuera y sale el estado." },
  { libro: "receta", capitulo: "Cap. 3 — Ahora Mismo", texto: "La actividad es pensar desde el objetivo cumplido. Pero cualquier pensamiento es pensar desde, porque cualquier pensamiento piensa desde." },
  { libro: "receta", capitulo: "Cap. 3 — Ahora Mismo", texto: "Si hablamos de sugestión, decir «me tengo que sugestionar» ya es una sugestión, y no es sugestionarte con lo que vos querés sugestionarte. La mente sugestiona con todo." },
  { libro: "receta", capitulo: "Cap. 4 — La Pesca", texto: "No podés pescar una ballena con las herramientas para pescar un dorado." },
  { libro: "receta", capitulo: "Cap. 4 — La Pesca", texto: "Para posicionarme arriba de la ola tengo que entrar a la ola con la misma frecuencia de la ola." },
  { libro: "receta", capitulo: "Cap. 5 — Cargar el Estado", texto: "Pero mientras vas, no pienses en el tiempo, en cuándo va a llegar o cuánto va a tardar, porque de hecho estás haciendo el camino contrario dentro del mismo camino." },
  { libro: "pensamiento", capitulo: "Cap. 0 — La Palabra", texto: "Obviamente, la imagen, para que sea carne, tiene que estar sentida." },
  { libro: "pensamiento", capitulo: "Cap. 1 — Libertad Interna", texto: "Las cosas en el mundo están ahí, pero vos estás adentro tuyo." },
  { libro: "pensamiento", capitulo: "Cap. 1 — Libertad Interna", texto: "Lo que vos decís que podés y lo que decís que no podés, consecutivamente, frecuentemente, en el correr de los días, se convierte en un estado de conciencia." },
  { libro: "pensamiento", capitulo: "Cap. 1 — Libertad Interna", texto: "Yo creo que estamos en este juego verdaderamente porque este juego fue hecho para uno. Y cada uno que está por ahí leyendo esto o escuchando esto, el juego es todo para vos." },
  { libro: "pensamiento", capitulo: "Cap. 4 — La Inteligencia Natural", texto: "Las respuestas tardan dos segundos o tardan dos días, no importa: llega la respuesta siempre." },
  { libro: "pensamiento", capitulo: "Cap. 6 — Atravesar el Tiempo", texto: "El tiempo es justamente un aspecto de la mente, que es como el recuerdo." },
  { libro: "pensamiento", capitulo: "Cap. 6 — Atravesar el Tiempo", texto: "Entonces, se pierde el tiempo cuando pienso en el tiempo, se aprovecha el tiempo cuando utilizo el tiempo." },
  { libro: "pensamiento", capitulo: "Cap. 6 — Atravesar el Tiempo", texto: "Logré atravesar el tiempo con éxito." },
  { libro: "biografia", capitulo: "Cap. 0 — Primera Imagen", texto: "Tal vez a veces el estado de ánimo no estaba mejor que otros días o estaba peor, pero siempre trataba de tener la imagen del mejor resultado posible sobre lo que sea y de sentir imágenes de suerte." },
  { libro: "biografia", capitulo: "Cap. 0 — Primera Imagen", texto: "Yo creo que el éxito que tengo realmente es por el hecho simplemente de que, a lo largo de estos 20 años de gastronomía, nunca dejé de verme de maneras gigantes, o de maneras en las que siempre triunfo." },
  { libro: "biografia", capitulo: "Cap. 2 — El Desastre", texto: "Mi infancia fue el momento más difícil de mi vida porque yo no era consciente de que realmente mis pensamientos creaban mi realidad." },
  { libro: "biografia", capitulo: "Cap. 2 — El Desastre", texto: "Realmente la conversación mental crea la realidad y hablar tres o cuatro veces ya del mismo problema no tiene ningún tipo de sentido positivo." },
  { libro: "biografia", capitulo: "Cap. 2 — El Desastre", texto: "De alguna forma empecé a tener la memoria de todos mis momentos de dolor, y me di cuenta de que creo que hay cosas que duelen, pero en el fondo nunca nada me dolió como tal." },
  { libro: "biografia", capitulo: "Cap. 2 — El Desastre", texto: "Detrás del que está llorando hay alguien que está muy tranquilo observando cómo vos estás llorando." },
  { libro: "biografia", capitulo: "Cap. 2 — El Desastre", texto: "Yo no sabía cómo conseguir mis deseos y mi vida estaba muy torcida y mal." },
];
