/**
 * Lo que Yo Da dice de la música que suena (la playlist de Julián, «The Way It Is»).
 * Algunos temas tienen su guiño propio (por título, tal como figura en
 * content/musica.ts → `fichas`); el resto, un comentario general al azar.
 * Guiños místicos de Yo Da (asumir el deseo cumplido, vivir en el final, el
 * estado, la imaginación), con gracia: son de Yo Da, no palabras de Julián.
 */
import type { TemaSonando } from "@/lib/musica";

type Contexto = { hora: number; diaSemana: number; enAmerica: boolean };

const guinos: Record<string, (c: Contexto) => string> = {
  "Somebody's Watching Me": () => "«Somebody's Watching Me»… Hmm. Alguien te mira, sí: yo. Y vos, desde adentro. El que observa, nunca duerme.",
  "The Way It Is": () => "«The Way It Is»: así es, dice. Así es… porque así lo asumiste. Cambiá la asunción, y el «así es» cambia.",
  "Enjoy the Silence": () => "«Enjoy the Silence». En el silencio, el deseo cumplido mejor se siente. Irónico, decirlo con música. Hmm.",
  "Dream On": () => "Aerosmith: «Dream On». Soñá, sí… pero desde el final, como si ya hubiera pasado. Así se sueña en serio.",
  "Génesis": () => "«Génesis», de Soda Stereo. En el principio, todo empieza igual: imaginado. Después, sucede.",
  "Rezo por Vos": () => "Charly: «Rezo por vos». La oración que funciona, la que ya se siente respondida es. Hmm.",
  "Vuelta por el Universo": () => "Cerati y Melero. Una vuelta por el universo damos… sin salir de la imaginación, que es donde todo empieza.",
  "Vivo": () => "Cerati: «Vivo». Hmm. Yo soy, luego vivo. Ese orden, el bueno es.",
  "El Día Que Apagaron La Luz": () => "Sui Generis. El día que apagaron la luz… el ojo de adentro siguió viendo. Esa luz, no se corta.",
  "Estallando Desde el Océano": () => "Sumo. Estallando desde el océano… Lo grande, desde lo hondo sube. Paciencia de pescador, hace falta.",
  "Money For Nothing": () => "«Money for Nothing». Sentite rico primero; la plata, después se entera. Hmm, hmm.",
  "Wuthering Heights": () => "Kate Bush, en la colina, llamando. Quien de verdad asume, gritar no necesita. Pero qué lindo grita.",
  "Talking In Your Sleep": () => "«Talking in Your Sleep». Lo último que te decís antes de dormir, cuidalo: con eso, el día siguiente se arma.",
  "I Am That I Am": () => "Peter Tosh: «I Am That I Am». Yo soy el que soy… El nombre más poderoso, ese. El mío, casi: «Yo Soy» me llamaba al principio.",
  "Eyes on Fire": () => "«Eyes on Fire». Ojos en llamas… los míos, dorados nomás. Con que veas el final, alcanza.",
  "Angelic Voices": () => "«Angelic Voices». Colegas, casi. Alas también tengo, y ninguna queja.",
  "Everything Counts": () => "«Everything Counts». Todo cuenta, sí: cada pensamiento que repetís, un ladrillo pone.",
  "I Ran (So Far Away)": () => "«I Ran (So Far Away)». Lejos correr, no sirve: el estado, con vos viaja. Cambialo, y el paisaje cambia solo.",
  "Connected": () => "«Connected». Conectados estamos: lo de afuera, el espejo de lo de adentro es. Hmm.",
  "Other Side Of The World": (c) =>
    c.enAmerica ? "«Other Side of the World». Del otro lado del mundo, alguien ya vive lo que pedís. Imaginalo cerca." : "«Other Side of the World». Del otro lado del mundo estás, parece. Hasta ahí, el ojo llega; y lo que imaginás, también.",
  "Tudo Vai Dar Certo": () => "«Tudo vai dar certo»: todo va a salir bien, en portugués. Un decreto, eso es. Firmalo.",
  "Velha Infância": () => "Tribalistas. «Velha infância»… El chico de antes, sin dudar creía. Eso, recuperar hay que.",
  "Bamboléo": () => "Gipsy Kings. Bamboléo… Las alas, solas se mueven. El cuerpo, antes que la mente, ya lo sabe.",
  "Bonito": () => "Jarabe de Palo: «Bonito». Todo bonito, dice. Así se empieza: nombrándolo.",
  "Your Song": () => "«Your Song», de Moulin Rouge. Cantarle a lo que querés como si ya fuera tuyo: esa, la canción es.",
  "Beautiful": () => "Christina Aguilera: «Beautiful». Lo que te decís frente al espejo, el mundo te lo repite. Elegí bien.",
  "A Real Hero": () => "«A Real Hero». Héroe no es el que pelea: el que ya se siente del otro lado. Hmm.",
  "Wait a Minute!": () => "«Wait a Minute!». ¿Un minuto? Para quien asume, apuro no hay: ya está hecho.",
  "Meet Me Halfway": () => "«Meet Me Halfway». ¿A mitad de camino? No: en el final encontrémonos. Desde ahí, se camina mejor.",
  "Blue Monday '88": (c) =>
    c.diaSemana === 1 ? "«Blue Monday». Y lunes es… Tranquilo: el lunes, del color que vos asumas será." : "«Blue Monday». Lunes no es. Y aunque lo fuera: el día, del color que le pongas.",
  "Calling America": (c) =>
    c.enAmerica ? "«Calling America». Te llaman. Atendé: a veces la señal así llega, con una canción." : "«Calling America». El llamado, océanos cruza. Las buenas noticias, también.",
  "Elysium": () => "Lisa Gerrard: «Elysium». Épico se puso. El paraíso, un estado es, no un lugar. Entrá.",
  "Solsbury Hill": () => "Peter Gabriel. Al subir la colina, un águila le habló. A vos, quizás, una canción. Escuchá.",
  "Deeper and Deeper": () => "Madonna: «Deeper and Deeper». Más hondo, más hondo… Ahí, donde se siente real, se planta.",
  "Mammagamma": () => "Alan Parsons. Instrumental. Sin palabras, el deseo también se dice: sintiéndolo.",
  "The Heat Is On": () => "«The Heat Is On». Calor hace, de repente… El deseo, cuando se siente, calienta. Buena señal.",
  "Dark Necessities": () => "Red Hot Chili Peppers. Necesidades oscuras, dicen. Luz, aquí ponemos: toda sombra, un deseo sin revisar es.",
  "Lucky Man": () => "«Lucky Man». La suerte, un estado es. Suertudo sentite, y mirá qué pasa.",
  "Sweet Disposition": () => "The Temper Trap. Dulce disposición: con esa, las puertas solas se abren.",
  "Riptide": () => "Vance Joy y un ukelele. Si la corriente te lleva, que sea hacia el final feliz. Hmm.",
  "Fallin'": () => "Alicia Keys: «Fallin'». Cayendo… En el sueño, se cae mejor: ahí, la semilla se planta.",
  "Glue": () => "Bicep: «Glue». Lo que con fuerza sentís, se pega. Pegá lo lindo.",
  "Give Up The Funk (Tear The Roof Off The Sucker)": () => "Parliament. El funk, soltar no se puede. La asunción, tampoco: persistí.",
  "Black Velvet": () => "«Black Velvet». Terciopelo negro, como el fondo de esta página. Sobre lo oscuro, lo que imaginás más brilla.",
  "A Little Respect": () => "Erasure: «A Little Respect». Con respeto, a tu imaginación tratá: tu mejor herramienta es.",
  "Bigmouth Strikes Again": () => "The Smiths. Bocón otra vez… Cuidado lo que de vos decís: el mundo, obediente es.",
  "Point of View": () => "«Point of View». El punto de vista, todo lo cambia. Mirá desde el final, y el camino aparece.",
  "Cuidado, Peligro, Eclipse": () => "Agar Agar. Cuidado, peligro, eclipse… Aunque el sol se tape, ahí sigue. Como tu deseo.",
  "Free tibet": () => "Hilight Tribe. Trance, con instrumentos de verdad. En trance, mejor se asume: la mente, quieta; el sentir, adelante.",
  "Shankara": () => "Hilight Tribe otra vez. En trance, mejor se asume: la mente, quieta; el sentir, adelante.",
};

/** Artistas que se repiten en la lista: un guiño por eso. */
const porArtista: Record<string, string> = {
  "Tears For Fears": "Tears for Fears otra vez. Cuatro temas suyos en esta lista hay. Lo que se repite, se imprime: así funciona.",
  "Depeche Mode": "Depeche Mode. Tres temas suyos en la lista. Hmm. Persistencia, eso se llama.",
  Enigma: "Enigma. Misterioso, como este lugar. Lo invisible, también suena.",
  "Molchat Doma": "En ruso, esto. Entender no hace falta: sentir, sí. Como todo lo importante.",
};

const generales = [
  (t: string, a: string) => `Suena «${t}», de ${a}. Mientras suena, el final feliz imaginá. Gratis es.`,
  (t: string, a: string) => `«${t}». ${a}. Las alas, al ritmo se me mueven. El sentimiento primero; lo demás, después llega.`,
  (t: string, a: string) => `Ahora: ${a}, «${t}». Si un deseo tenés, su banda sonora este tema puede ser.`,
  (t: string, a: string) => `«${t}», de ${a}. Sentilo como si ya hubiera pasado: en eso, la música ayuda.`,
  (_: string, a: string) => `Hmm. ${a}. Buen tema, este, para vivir en el final.`,
];

/** Lo que Yo Da comenta de un tema que empieza. `especial`: tiene guiño propio (se dice aunque haya hablado hace poco). */
export function comentarTema(t: TemaSonando, ahora = new Date()): { texto: string; especial: boolean } {
  let enAmerica = true;
  try {
    enAmerica = Intl.DateTimeFormat().resolvedOptions().timeZone.startsWith("America/");
  } catch {}
  const c: Contexto = { hora: ahora.getHours(), diaSemana: ahora.getDay(), enAmerica };
  if (t.fragmento) return { texto: `«${t.titulo}»… treinta segundos, nomás. Poco es, para asumir nada. Spotify no te reconoce en este navegador: en la música, cómo arreglarlo te dejé.`, especial: true };
  const g = guinos[t.titulo];
  if (g) return { texto: g(c), especial: true };
  const artista = t.artista.split(",")[0].trim();
  if (porArtista[artista]) return { texto: porArtista[artista], especial: true };
  if (c.hora < 6) return { texto: `A esta hora, ${artista}. Antes de dormir, el deseo cumplido sentí: esa, la hora buena es.`, especial: false };
  const f = generales[Math.floor(Math.random() * generales.length)];
  return { texto: f(t.titulo, artista), especial: false };
}

/** «¿Qué suena?» */
export function queSuena(t: TemaSonando | null): string {
  if (!t) return "Nada suena todavía. Si querés, la música prendé: temas al azar de la playlist de Julián son.";
  const base = `«${t.titulo}», de ${t.artista}.`;
  if (!t.sonando) return `En pausa quedó ${base} Seguir, cuando quieras.`;
  const { texto } = comentarTema(t);
  return texto.includes(t.titulo) ? texto : `${base} ${texto}`;
}
