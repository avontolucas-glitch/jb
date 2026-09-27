/**
 * FRASES DE JULIÁN que rotan en los epígrafes del sitio: las más inspiradoras e
 * ingeniosas de los tres libros, sin las negativas (pedido de Lucas; elegidas por
 * un curador por libro y un jurado). Todas son TEXTUALES de los manuscritos
 * («edición integral con sitio, revisión 3»), verificadas palabra por palabra. No se reescriben: si se cambia el libro, se
 * vuelven a verificar. Para sumar una, copiala exacta del manuscrito.
 *
 * Además, lo que Julián escribió en su canal de Instagram («The Channel»), que
 * pasó Lucas (fuente «canal», firmadas «THE CHANNEL»; en `capitulo`, la fecha del mensaje, solo de referencia). Esas van como
 * las escribió él (con su «tú» de lo escrito): solo se corrigieron tildes, signos
 * de apertura (¿ ¡) y algún error de tipeo del teclado del celular («casa» por
 * «cada»). No aparecen en la página de los libros.
 */
export type Frase = { texto: string; libro: "receta" | "pensamiento" | "biografia" | "canal"; capitulo: string };

export const tituloLibro = {
  receta: "La Receta de la Manifestación",
  pensamiento: "El Pensamiento es Tu Fe",
  biografia: "Biografía",
  canal: "THE CHANNEL",
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
  // desde su canal de Instagram («The Channel»), escritas por Julián
  { libro: "canal", capitulo: "16 de agosto de 2024", texto: "Cuando veas este mensaje, aprovecha el tiempo presente y aplica ahora lo aprendido." },
  { libro: "canal", capitulo: "16 de agosto de 2024", texto: "La lengua es la única llave que con sus combinaciones de palabras y tonos es capaz de abrir cualquier puerta. Debes poner en tu lengua lo que quieres que la lengua ponga en tu mundo." },
  { libro: "canal", capitulo: "18 de agosto de 2024", texto: "Eso que llaman Alma es el oído universal, solo tu Alma escucha tus conversaciones, eso debería parecerte algo importante para cuidar." },
  { libro: "canal", capitulo: "14 de agosto de 2024", texto: "Es importante que mantengas la motivación como aquel día que te enteraste acerca de la ley. Con un mundo de posibilidades por delante y un sentimiento completamente renovado y esperanzador." },
  { libro: "canal", capitulo: "14 de agosto de 2024", texto: "La paradoja de la ley de la asunción es que funciona si asumes que la imaginación crea la realidad." },
  { libro: "canal", capitulo: "14 de agosto de 2024", texto: "La mayoría cree que el dinero se genera “haciendo” y en realidad el dinero se genera “siendo”." },
  { libro: "canal", capitulo: "14 de agosto de 2024", texto: "Saber quién sos genera más energía emocional y con el tiempo encuentras las ganancias correspondientes en tu mundo dependiendo de quién sentís que sos." },
  { libro: "canal", capitulo: "14 de marzo de 2025", texto: "Créeme, la abundancia encontrará la manera de entrar a tu día a día, como el agua, encontrará el camino hacia vos. Los caminos serán súper lógicos. Cambia ahora tu conversación mental e imagina que las personas que conoces te felicitan." },
  { libro: "canal", capitulo: "31 de marzo de 2025", texto: "Cuando las personas hacen de un tema una moda, naturalmente después de un tiempo pierden el encanto. Pero el principio fisicoquímico con el que se hace un huevo frito es y será por siempre. Lo mismo con la ley de la conciencia: puedes creer que es viejo, que es antiguo, que los tiempos cambiaron, pero nadie puede quitar la piedra angular." },
  { libro: "canal", capitulo: "31 de marzo de 2025", texto: "La conciencia crea la realidad desde el origen del tiempo y cuando el tiempo deje de existir, también seguirá creando." },
  { libro: "canal", capitulo: "4 de abril de 2025", texto: "La vida puede insistir en los mismos escenarios, pero tu actitud siempre tiene el poder de cambiar el guion." },
  { libro: "canal", capitulo: "10 de abril de 2025", texto: "Juan es tu entendimiento. Dile a Juan que ahora puedes hacer lo que antes no podías." },
  { libro: "canal", capitulo: "canal exclusivo", texto: "En el espacio exterior los objetos pesan todos lo mismo. Si en el vacío (sin aire) lanzas una bola de bowling y una pluma, los dos caen a la misma velocidad y tocan el piso al mismo tiempo. La realidad no discrimina los objetos." },
  { libro: "canal", capitulo: "canal exclusivo", texto: "70 veces 7, perdonar, orar, pedir por otros, el verdadero amor no vence ni se cansa." },
  { libro: "canal", capitulo: "canal exclusivo", texto: "El mundo material así como lo llamas, o vida, o realidad es tu subconsciente exterior, de hecho no hay interior o exterior en verdad, todo es uno." },
  { libro: "canal", capitulo: "canal exclusivo", texto: "Quítale el concepto de “mis sueños” y entiende que los sueños son una realidad vista por uno que luego es vista por todos." },
  { libro: "canal", capitulo: "canal exclusivo", texto: "Te recomiendo que empieces ahora a festejar que se te está dando todo mejor de lo que querías, suponías. Agradece de antemano que la vida premia a los campeones." },
  { libro: "canal", capitulo: "canal exclusivo", texto: "Todo lo que digo es para que simplemente entiendan que la vida puede cambiar en los próximos 10 minutos y que la única forma que tenemos de contribuir con eso es ayudando con nuestros sentimientos." },
  { libro: "canal", capitulo: "canal exclusivo", texto: "A mí me gustan las sorpresas y tengo en mí las emociones correspondientes a una vida llena de sorpresas, una cada 10 minutos." },
  { libro: "canal", capitulo: "canal exclusivo", texto: "La vida nos dio a todos y cada uno de nosotros las herramientas y la capacidad de crear herramientas para solucionarnos a nosotros mismos." },
  { libro: "canal", capitulo: "canal exclusivo", texto: "Lo mejor para mí es darte cuenta qué es lo que querés, bendecir a quien te inspiró que lo tiene y reconocer que de él no quieres nada más que ese ejemplo." },
  { libro: "canal", capitulo: "The Channel", texto: "Al fin de cuentas, el ego es verdaderamente nuestro amigo, él cree en nosotros mismos inclusive cuando nosotros dudamos." },
  { libro: "canal", capitulo: "The Channel", texto: "Los que dicen que el Ego es malo son como los que dicen que el dinero es malo. Solo no lo tienen, por eso dicen que es malo." },
  { libro: "canal", capitulo: "The Channel", texto: "Para ser lo que querés ser, sin fallar, tenés que ser consciente de ser eso. Cuando sos consciente de ser eso es cuando al mismo tiempo se exterioriza." },
  { libro: "canal", capitulo: "13 de mayo", texto: "¿Qué es una asunción? Asumir que algo sucedió. Asumir es un recuerdo. Asumir es dar algo por hecho, pasado." },
  { libro: "canal", capitulo: "4 de mayo", texto: "¡Sin miedo al éxito!" },
  { libro: "canal", capitulo: "9 de mayo", texto: "No te dejes llevar por las noticias, sigue tu vida con normalidad en tu éxito, porque las noticias tratan de hacer lo que vienen a hacer en este mundo, que es sembrar el miedo. Pero no pueden sembrar donde ya fue sembrada la paz, el amor y el triunfo. Sé un buen jardinero de tu mente." },
  { libro: "canal", capitulo: "9 de marzo", texto: "Imagina ahora mismo, estés donde estés, que te encontraste un sobre de papel madera, adentro tiene dinero fresco." },
  { libro: "canal", capitulo: "The Channel", texto: "Ten más pensamientos de abundancia que de carencia y habrás compensado la balanza." },
  { libro: "canal", capitulo: "18 de febrero", texto: "Con ayer no basta, tenés que hacerlo hoy también." },
];
