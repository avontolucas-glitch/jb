/**
 * Lo que Yo Da dice de la música que suena (la playlist de Julián, «The Way It Is»).
 * Algunos temas tienen su guiño propio (por título, tal como figura en
 * content/musica.ts → `fichas`); el resto, un comentario general al azar.
 * Guiños místicos de Yo Da (asumir el deseo cumplido, vivir en el final, el
 * estado, la imaginación), con gracia: son de Yo Da, no palabras de Julián.
 */
import type { TemaSonando } from "@/lib/musica";

type Contexto = { hora: number; diaSemana: number; enAmerica: boolean };

/**
 * Dos comentarios por tema (por título, tal como figura en content/musica.ts → `fichas`),
 * escritos para cada uno de los 100 temas y revisados por un jurado (datos ciertos, voz de
 * Yo Da, gracia): se alternan para que no se repita.
 */
export const comentariosPorTema: Record<string, string[]> = {
  "Buk-In-Hamm Palace": [
    "Peter Tosh, rumbo al palacio. Hmm. Al palacio no se entra golpeando la puerta: se entra sintiéndose de la casa. Así, solas se abren.",
    "Reggae de un Wailer original. Rey en tu imaginación primero sé; la corona, después llega. Tarde no, a su hora.",
  ],
  "Velha Infância": [
    "Tribalistas: «Velha infância», vieja infancia. El chico de antes, sin dudar creía que el mundo le respondía. Esa fe, recuperar hay que.",
    "Tres voces, un solo tema: Marisa Monte, Arnaldo Antunes, Carlinhos Brown. Así la mente: cuando pensar, sentir y decir coinciden, suena.",
  ],
  Precious: [
    "«Precious»: lo precioso y frágil, cuidado especial necesita, canta Depeche Mode. Tu deseo recién plantado, igual: no lo desentierres para ver si creció.",
    "Lo precioso, adentro se forma primero. Como la perla: la ostra no avisa, trabaja en silencio. Hmm. Después, brilla.",
  ],
  Génesis: [
    "«Génesis», de Soda Stereo. En el principio, todo empieza igual: imaginado. Después, sucede. El orden, ese es.",
    "El «Génesis» de Vox Dei, en la voz de Soda. Una historia vieja, contada desde otro estado, nueva suena. Tu historia, también reescribir podés.",
  ],
  "The Heat Is On": [
    "«The Heat Is On»: el calor se prendió. Cuando el deseo cumplido en el pecho se siente, así se nota: tibio primero, fuego después. Buena señal.",
    "De «Un detective suelto en Hollywood», este. Detective de tu día sé: pistas del deseo cumplido buscá. Hmm. Quien busca señales, las encuentra.",
  ],
  "The Way It Is": [
    "«The Way It Is»: así es, dice. Así es… porque así lo asumiste. Cambiá la asunción, y el «así es» cambia.",
    "Hornsby canta que hay cosas que nunca cambiarán… y enseguida: «don't you believe them», no les creas. Hmm. Esa parte, la buena es. Por algo a la lista le da nombre.",
  ],
  "Turn Around": [
    "«Turn Around»: date vuelta. No para mirar atrás: para mirar desde el final. Desde ahí, el camino al revés se entiende, y corto es.",
    "Enigma pide media vuelta. Al pensamiento también dásela: de «ojalá» a «gracias», una palabra cambia y el estado entero gira. Hmm.",
  ],
  "Johnny Come Home": [
    "«Johnny Come Home». Volvé a casa, Johnny. La casa, un estado es: el del deseo cumplido. Ahí volvé cada noche, antes de dormir.",
    "Fine Young Cannibals: caníbales jóvenes y finos. Hmm, nombre raro. Tranquilo: lo único que aquí se come es la duda. Buen provecho.",
  ],
  "7 Seconds (feat. Neneh Cherry)": [
    "«7 Seconds». Siete segundos, nomás. Lo que dura una escena del deseo cumplido; repetida cada noche, alcanza y sobra.",
    "En wolof, francés e inglés cantan. Hmm. La imaginación, en un solo idioma habla: el sentimiento. Ese, el mundo entero lo entiende.",
  ],
  "Shot in the Back of the Head": [
    "Moby, casi sin palabras. La idea que llega de atrás, por la nuca, sin aviso: así caen a veces las mejores corazonadas. Hmm. Atendelas.",
    "El video, David Lynch lo hizo: soñador de oficio. Él sabía que la escena, en el sueño se arma primero; la vigilia, después la filma.",
  ],
  "Deeper and Deeper": [
    "Madonna: «Deeper and Deeper». Más hondo, más hondo… Ahí, donde se siente real, se planta. En la superficie, nada echa raíz.",
    "Superficial, la asunción no sirve. Se repite hasta que natural se siente, como un paso de baile: una vez más, otra más, más hondo. Madonna, de acuerdo estaría.",
  ],
  "Something About You": [
    "«Something About You». Algo tenés, sí: una imaginación que funciona. Sin manual viene; usarla, igual podés desde hoy. Hmm.",
    "Level 42 y el bajo de Mark King, a los golpes de pulgar. Así la asunción: firme marcás el ritmo adentro, y lo de afuera, solo te sigue.",
  ],
  "A Trick of the Light": [
    "«A Trick of the Light». ¿Un truco de la luz, el mundo? Hmm. Lo que ves en la pantalla, del proyector sale. Cambiá la película de adentro.",
    "Villagers: aldeanos. Chico el pueblo, grande la imaginación. Desde cualquier rincón, el ojo de adentro viaja adonde quiera.",
  ],
  "Tudo Vai Dar Certo": [
    "«Tudo vai dar certo»: todo va a salir bien, en portugués. Un decreto, eso es. Firmalo, y sellalo con un sentimiento.",
    "Natiruts, reggae de Brasilia. Con ese ritmo, hasta la paciencia baila. Hmm. Lo que asumiste, a su tiempo llega, sin apuro y sin nervios.",
  ],
  "Money For Nothing": [
    "«Money for Nothing». Sentite rico primero; la plata, después se entera. Hmm, hmm. Así de tranquilo, el orden funciona.",
    "Sting canta en la intro: «I want my MTV». Así se pide, fijate: sin rogar, con la certeza de quien ya tiene el control remoto en la mano.",
  ],
  "Other Side Of The World": [
    "«Other Side of the World». Del otro lado del mundo, alguien ya vive lo que pedís. Imaginalo cerca: en la mente, distancias no hay.",
    "KT Tunstall, escocesa. Lejos Escocia queda… tan lejos como tu deseo: a un pensamiento de distancia. Hmm. Cerca, entonces.",
  ],
  "5 23": [
    "«5 23»: así se llama porque eso dura, cinco minutos veintitrés. Hmm. Tiempo justo para vivir una escena del final, completa y con detalles.",
    "Ambient puro: sin letra, sin apuro. Así la mente antes de dormir quiero: quieta, lista para que el deseo cumplido la habite toda la noche.",
  ],
  Elysium: [
    "Lisa Gerrard: «Elysium». Épico se puso. El paraíso, un estado es, no un lugar. Entrá, que la puerta abierta está.",
    "De «Gladiador», este. Con la mano, el trigo de su casa tocaba el héroe. Hmm. Así se toca el deseo: en la imaginación, con tacto, antes de llegar.",
  ],
  "Angelic Voices": [
    "«Angelic Voices». Colegas, casi. Alas también tengo, y ninguna queja. Coro de ángeles, a tu deseo acompañando.",
    "B-Tribe: guitarra española y coros al cielo. Tierra y aire juntos: el deseo sentido en el cuerpo, y el ojo mirando desde arriba. Hmm.",
  ],
  "The Oh Of Pleasure / Ray Lynch": [
    "«The Oh of Pleasure»: el «oh» del placer. Ese «oh» que se escapa cuando algo llega… ensayalo antes. Hmm. El cuerpo aprende el final primero.",
    "Ray Lynch, «Deep Breakfast» su disco se llama: desayuno profundo. Así el día arrancar conviene: con el deseo cumplido, antes que el café.",
  ],
  "Enjoy the Silence": [
    "«Enjoy the Silence». En el silencio, el deseo cumplido mejor se siente. Irónico, decirlo con música. Hmm.",
    "«Words are very unnecessary», canta Dave Gahan: las palabras, innecesarias son. El pedido, el sentimiento lo hace; la boca, descansar puede.",
  ],
  "Sweet Disposition": [
    "The Temper Trap: dulce disposición. Con esa, las puertas solas se abren. Pelear con la cerradura, no hace falta.",
    "The Temper Trap, desde Australia. Falsete arriba, bien arriba. Así el ánimo: un tono más alto sube cuando se asume que ya está. Hmm.",
  ],
  "Eyes on Fire": [
    "«Eyes on Fire». Ojos en llamas… los míos, dorados nomás. Con que veas el final, alcanza; incendiar nada hace falta.",
    "Blue Foundation, de Dinamarca; en «Crepúsculo» sonó. Hmm. El crepúsculo, buena hora es: entre vigilia y sueño, el deseo mejor se planta.",
  ],
  Bamboléo: [
    "Gipsy Kings. Bamboléo… Las alas, solas se me mueven. El cuerpo, antes que la mente, ya lo sabe: se siente, después se entiende.",
    "Rumba gitana, nacida en Francia. Lo que imaginás, dejalo balancearse: sin forzar, como quien ya está bailando en la fiesta del final. Hmm.",
  ],
  Bonito: [
    "Jarabe de Palo: «Bonito». Todo bonito, dice. Así se empieza: nombrándolo. Lo que nombrás con cariño, se queda.",
    "La voz de Pau Donés, ronca y sonriente. Hmm. Mirar bonito, un entrenamiento es: lo que mirás con buenos ojos, más aparece en tu camino.",
  ],
  "I Like It Like That": [
    "«I Like It Like That»: así me gusta. Hmm. Decilo antes de verlo, con este ritmo; el «así», después obedece.",
    "Bugalú neoyorquino, para elegir con los pies. Del menú de estados, así se pide: sin dudar, como quien ya sabe cómo le gusta. Hmm.",
  ],
  "You Make Me Feel (Mighty Real)": [
    "«You Make Me Feel (Mighty Real)»: me hacés sentir real, poderosamente real. Eso buscás en la escena imaginada: que real se sienta. Lo demás, detalle es.",
    "Jimmy Somerville, y un himno disco de Sylvester. Hmm. Quien con eso a la pista sale, permiso no pide: ya brilla. Así se entra a un estado.",
  ],
  Dreamers: [
    "«Dreamers». Soñadores, sí… de los que despiertan con la cosa en la mano. Hmm. Ese sueño, el bueno es.",
    "Savoir Adore: «Dreamers». Un soñador que no duda, un realista adelantado es. Nada más, nada menos.",
  ],
  "Wuthering Heights": [
    "Kate Bush, en el páramo, a Heathcliff llamando. Quien de verdad asume, gritar no necesita. Pero qué lindo grita.",
    "«Let me in your window», canta Cathy desde afuera. Hmm. Así golpea un deseo: abrile, dejalo vivir adentro, y afuera, después, casa encuentra.",
  ],
  "Pale Shelter": [
    "«Pale Shelter»: un refugio pálido. El de afuera, pálido puede ser; el de adentro, a todo color lo pintás vos. Hmm.",
    "Del primer disco de Tears for Fears, «The Hurting». De la herida también se sale: la escena donde ya sanaste imaginá; el cuerpo, detrás va.",
  ],
  "Eminence Front": [
    "«Eminence Front»: una fachada, dice The Who. La asunción, disfraz no es: por dentro se siente primero, y la fachada sola se acomoda.",
    "Esta, Townshend la canta, no Daltrey. Hasta en The Who, cambiar de voz se puede. Tu voz interna, también: otra ponele, una que ya llegó.",
  ],
  "While My Guitar Gently Weeps": [
    "George Harrison abrió un libro al azar, «gently weeps» leyó, y de ahí nació esta. Hmm. Atento andá: la señal, por la página menos pensada llega.",
    "Jeff Healey tocaba con la guitarra acostada en las rodillas, a su manera. Hmm. Manual único no hay: tu forma de imaginar, la que funciona, esa es.",
  ],
  "Talking In Your Sleep": [
    "«Talking in Your Sleep». Lo último que te decís antes de dormir, cuidalo: con eso, el día siguiente se arma.",
    "The Romantics: hablando en sueños, los secretos se dicen. Que el tuyo sea el final contado en pasado: «qué bien que salió». Hasta dormido, repetilo.",
  ],
  "Lucky Man": [
    "«Lucky Man». La suerte, un estado es. Suertudo sentite, y mirá qué pasa.",
    "«Happiness… it's just a change in me», canta Richard Ashcroft. La felicidad, un cambio adentro es. Hmm. Cambiala, y el mundo la copia.",
  ],
  "Dream On": [
    "«Dream On»: en inglés, a veces «ni lo soñés» quiere decir. Hmm. Aquí, al revés: soñalo, y seguí soñándolo, hasta que despierto también lo veas.",
    "«Dream until your dreams come true», canta Tyler: hasta que se cumplan. Un retoque, yo le haría: soñá como si ya se hubieran cumplido.",
  ],
  Pleasure: [
    "Justice: «Pleasure». El placer, ¿al llegar? No: al imaginar ya empieza. Hmm. Si la escena gusto no te da, retocala hasta que sí.",
    "Dos franceses, una cruz de luz por emblema. Un símbolo tuyo buscate: el apretón de manos del final, sentido en la palma. Hmm.",
  ],
  "Your Song": [
    "«Your Song», de Moulin Rouge. Cantarle a lo que querés como si ya fuera tuyo: esa, la canción es.",
    "«My gift is my song», canta: mi regalo, mi canción. Hmm. El tuyo, la escena del final es: regalátela cada noche, envuelta en sentimiento.",
  ],
  Beautiful: [
    "Christina Aguilera: «Beautiful». Lo que te decís frente al espejo, el mundo te lo repite. Elegí bien.",
    "«Words can't bring me down», canta Christina. Las palabras de afuera, no te bajan. Las de adentro, esas te llevan: arriba, si las elegís.",
  ],
  "Sowing The Seeds Of Love": [
    "«Sowing the Seeds of Love»: sembrando semillas de amor. Semilla sembrada con cariño, con ganas crece. Hmm. Así tu escena plantá: con amor, no con miedo a que no salga.",
    "Tears for Fears, con aire de Beatles. Admirar, un comienzo es; ensayar en la imaginación ser lo que admirás, el paso siguiente. Hmm.",
  ],
  "Solsbury Hill": [
    "«Solsbury Hill», en siete por cuatro camina, y bailable igual es. Hmm. Lo raro, con práctica, propio se vuelve: así el estado nuevo, también.",
    "Genesis dejaba Gabriel, y esta canción fue su despedida. Hmm. De un estado viejo, así irse: sin portazo, con un tema alegre y sin mirar atrás.",
  ],
  "I Am That I Am": [
    "Peter Tosh: «I Am That I Am». Yo soy el que soy… El nombre más poderoso, ese. El mío, casi: «Yo Soy» me llamaba al principio.",
    "Reggae y Éxodo, en una sola frase. Lo que ponés después de «yo soy», en eso te volvés. Con cuidado elegí lo que sigue, hmm.",
  ],
  "Rezo por Vos": [
    "Charly: «Rezo por vos». La oración que funciona, la que ya se siente respondida es. Hmm.",
    "Charly y Spinetta, a cuatro manos la escribieron. Rezar por otro, también asumir es: verlo ya bien, ya sano, ya feliz. Hmm.",
  ],
  "Gravity Of Love": [
    "Enigma: «Gravity of Love». La gravedad del amor… Lo que sentís fuerte, hacia vos cae solo. Empujar, no hace falta.",
    "«O Fortuna», de Carmina Burana, asoma en este tema. La rueda de la fortuna, hmm, desde adentro se gira. Girala a tu favor.",
  ],
  "Modern Crusaders": [
    "«Modern Crusaders»: cruzados modernos, sin espada ni caballo. La única cruzada que vale, la del estado de adentro es.",
    "Enigma otra vez, entre cantos y misterio. Misterio, el deseo no es: se imagina, se siente, se suelta. Hmm. Tres pasos, sin enigma.",
  ],
  "Everything Counts": [
    "«Everything Counts». Todo cuenta, sí: cada pensamiento que repetís, un ladrillo pone.",
    "Depeche Mode, sintes de los ochenta. Hmm. La cuenta que importa, la de adentro es: cuántas veces hoy en el final te sentiste.",
  ],
  "I Ran (So Far Away)": [
    "«I Ran (So Far Away)». Lejos correr, no sirve: el estado, con vos viaja. Cambialo, y el paisaje cambia solo.",
    "A Flock of Seagulls: una bandada de gaviotas. Ellas, del viento no huyen: lo usan. Hmm. Lo que te empujaba, a favor ponelo.",
  ],
  Mammagamma: [
    "Del disco «Eye in the Sky», este: ojo en el cielo. Hmm. Colega, ese. Desde arriba, tu final ya lo veo; vos también, miralo.",
    "«Mammagamma»: a conjuro suena. Repetilo tres veces, y… nada. Hmm. La magia, en la palabra no está: en quién sos cuando la decís.",
  ],
  "Brown Bag": [
    "«Brown Bag»: bolsa de papel madera. Lo que llevás adentro, nadie ve; pero con eso, el día entero te alimentás. Llevá lo bueno.",
    "Boogaloo Joe Jones, guitarra de soul jazz, sin una nota de más. Hmm. Así la escena del final: corta, clara, con lo justo. Lo demás, sobra.",
  ],
  "Point of View": [
    "«Point of View». El punto de vista, todo lo cambia. Mirá desde el final, y el camino aparece.",
    "DB Boulevard, house italiano. Mover el punto de vista, como mover los pies es: un paso al costado, y otra pista entera ves.",
  ],
  "Estallando Desde el Océano": [
    "Sumo. Estallando desde el océano… Lo grande, desde lo hondo sube. Paciencia de pescador, hace falta.",
    "Luca Prodan, italiano, y el rock argentino lo adoptó para siempre. Hmm. Así la idea nueva: rara al principio; después, tan tuya que ni te acordás cuándo llegó.",
  ],
  "The Look": [
    "«The Look»: la mirada. Hmm. Mirá al mundo como quien ya lo tiene todo… y fijate cómo te devuelve el guiño.",
    "Metronomy: a metrónomo suena. Tic, tac, cuenta el tiempo. La imaginación, reloj no usa: en ella, lo tuyo ahora mismo pasa.",
  ],
  "Safe and Sound": [
    "«Safe and Sound»: sano y salvo. Así se llega al final, cuando desde el final se sale. Hmm.",
    "Justice: justicia, su nombre. La ley más justa, esta: lo que asumís, te llega. Sin abogados y sin trámites.",
  ],
  "Got To Keep On": [
    "«Got To Keep On»: seguir hay que. ¿Seguir qué? El sentir del final, también con los ojos abiertos. Al despertar, en la almohada no lo dejes.",
    "The Chemical Brothers: químicos, dicen. Hmm. El experimento más fino, adentro se hace: un estado nuevo probá, y mirá cómo el mundo reacciona.",
  ],
  "Cuidado, Peligro, Eclipse": [
    "Agar Agar: «Cuidado, Peligro, Eclipse». Aunque la luna lo tape, el sol ahí sigue. Tu deseo también, cuando de la vista se va.",
    "¡Cuidado, peligro! Hmm. Tranquilo: el mayor riesgo aquí, que lo imaginado se cumpla. Así que lindo imaginalo.",
  ],
  Fascination: [
    "«Fascination». Lo que te fascina, tu atención se lleva; y adonde va la atención, la vida detrás va. Que te fascine el final.",
    "Fascinación, dice. Un ojo dorado con alas soy, y aun así… me mirás a mí. Hmm. A tu final mirá mejor: más fascinante es.",
  ],
  "Free tibet": [
    "Hilight Tribe: trance natural, con didgeridoo y tambores de verdad. Sin enchufe, también se viaja: la imaginación, batería no necesita.",
    "Libre, dice el título. Hmm. La primera cárcel, el «no puedo» es; la llave, una frase: «ya lo tengo». Y afuera estás.",
  ],
  "Piece of Pie": [
    "«Piece of Pie»: una porción de tarta. Pedirla no hace falta: asumí que ya está en tu plato. Y con cuchara grande.",
    "Stone Temple Pilots. Un templo de piedra… Hmm. El templo de verdad, sin piedras es: la imaginación. Ahí se entra sin zapatos y sin dudas.",
  ],
  "Vuelta por el Universo": [
    "Cerati y Melero. Una vuelta por el universo damos… sin salir de la imaginación, que es donde todo empieza.",
    "Universo: un solo verso, dicen algunos. Hmm. El tuyo, elegilo bien: «ya está hecho». Ese verso, la vuelta entera sostiene.",
  ],
  "Stubborn Love": [
    "«Stubborn Love»: amor terco. Así se sostiene un deseo: terco, tranquilo, sin mirar el reloj.",
    "«Keep your head up», cantan: la cabeza en alto. Hmm. Así camina quien ya lo tiene: el mentón arriba, sin pedir permiso. Y la nuca, lo agradece.",
  ],
  "Dark Necessities": [
    "Red Hot Chili Peppers: «Dark Necessities». En lo oscuro, las fotos se revelan. Tu deseo, también: de noche, antes de dormir.",
    "«Part of my design», cantan de lo oscuro. Tu diseño, vos lo decidís: una escena nueva imaginá, y el plano entero cambia.",
  ],
  Macho: [
    "«Macho». Hmm. Macho no soy: un ojo con alas, nomás. Pero firme en mi estado. Esa, la fuerza que importa.",
    "Desde Finlandia, Jaakko Eino Kalevi. Tres nombres tiene; uno solo, el que asume: el «yo soy» de adentro.",
  ],
  "Puppet Theatre": [
    "«Puppet Theatre»: teatro de títeres. Los hilos, ¿quién los mueve? Tu imaginación. Títere no sos: titiritero, sí.",
    "Claptone, con máscara dorada toca. Colegas de dorado, somos. Hmm. Detrás de la máscara, el que imagina está.",
  ],
  "Make It Wit Chu": [
    "«Make It Wit Chu»: hacerlo con vos. De la mano, vos y tu imaginación crean. Socios son, no rivales.",
    "Queens of the Stone Age: reinas de la Edad de Piedra. Hmm. Desde las cavernas, igual funciona: primero se imaginó el fuego; después, se prendió.",
  ],
  Riptide: [
    "Vance Joy y un ukelele. Si la corriente te lleva, que sea hacia el final feliz.",
    "«Scared of dentists and the dark», canta. Dientes no tengo; oscuridad, un rato. Lo que imaginás, la ilumina. Hmm.",
  ],
  "Fallin'": [
    "Alicia Keys: «Fallin'». Cayendo… En el sueño, se cae mejor: ahí, la semilla se planta.",
    "«In and out of love», canta: entrar y salir. Hmm. En tu deseo, entrá y quedate. Salir, no hace falta.",
  ],
  "Black Horse And The Cherry Tree": [
    "KT Tunstall y su pedal: capa sobre capa, un tema en vivo armado. Así un estado: una capa de imagen, otra de sentir, otra de gracias… y suena entero.",
    "Un caballo negro y un cerezo. «You're not the one for me», se repite. Hmm. Lo que no es tuyo, soltalo; lo tuyo, ya llega.",
  ],
  "King Rat": [
    "«King Rat». Hasta la rata, rey se siente. La corona, primero adentro se pone. Después, el reino.",
    "Modest Mouse: ratón modesto. Chiquito el ratón, grande el sueño. Hmm. El tamaño, al imaginar, no importa.",
  ],
  "Nothing In My Way": [
    "«Nothing In My Way»: nada en mi camino. Desde el final mirado, obstáculos no hay: solo escalones.",
    "Keane, con el piano adelante. Hmm. Y si algo en el camino aparece, una nota falsa es, nomás: la melodía, la del final sigue.",
  ],
  Connected: [
    "«Connected». Conectados estamos: lo de afuera, el espejo de lo de adentro es. Hmm.",
    "Stereo MC's. Conectado a tu deseo, sin cable ni wifi. Señal completa hay, siempre; solo la duda el router apaga. Prendelo.",
  ],
  "Diamonds Never Die": [
    "«Diamonds Never Die». Bajo presión, el diamante se forma. Tu deseo, bajo la duda, más firme sale.",
    "Moriarty: como el de Sherlock, se llaman. Hmm. Pero aquí misterio no hay: lo que asumís, brilla y dura. Como un diamante.",
  ],
  "Give Up The Funk (Tear The Roof Off The Sucker)": [
    "Parliament: un parlamento entero, por el funk votando. Hmm. En tu parlamento de adentro, el deseo cumplido presentá: por unanimidad, que salga.",
    "«Tear the roof off»: arrancá el techo. El techo, un límite imaginado era. Sin él, el cielo entra.",
  ],
  Viviendo: [
    "Nach: «Viviendo». En gerundio, así se asume: no «voy a vivirlo», viviéndolo ya.",
    "Rimas, el rap. Tu conversación interna, que rime con tu deseo quiero. Lo que te decís por dentro, la letra es.",
  ],
  "Ordinary Man": [
    "«Ordinary Man»: hombre común. Lo extraordinario, así empieza: alguien común que asume distinto.",
    "Chinese Man, franceses son. Nombres que engañan, la vida tiene. Lo que parece, no importa; lo que asumís, eso es.",
  ],
  Notorious: [
    "«Notorious»: notorio. Lo que asumís en silencio, con el tiempo notorio se vuelve. Paciencia.",
    "Duran Duran, ochentas puros. Hmm. Antes que el mundo te note, notate vos: famoso primero en tu propia cabeza sé.",
  ],
  Shankara: [
    "Hilight Tribe, segunda vuelta. Cuando con el tambor la mente se aquieta, el sentir pasa adelante. Esa, la hora de asumir es.",
    "«Shankara»: a mantra suena. Hmm. El tuyo, en castellano decilo: «gracias, ya está». Corto es, y a la hora de dormir, perfecto.",
  ],
  "Cold Little Heart": [
    "«Cold Little Heart». Corazón frío, dice. Hmm. Frío no queda ningún corazón que el deseo cumplido siente: se entibia solo, desde adentro.",
    "Kiwanuka se toma una intro larguísima antes de cantar. Hmm. Sin apuro, así se asume: primero el sentir, largo y hondo; la voz de afuera, a su tiempo entra.",
  ],
  "Forget Me Nots": [
    "«Forget Me Nots»: nomeolvides, la flor. Hmm. Al deseo cumplido, recordarlo no hace falta: habitarlo. Lo que se habita, olvidado no queda.",
    "Patrice Rushen. Este groove, en «Men in Black» volvió, años después. Lo bueno que sembrás, siempre regresa. Con anteojos oscuros, a veces.",
  ],
  "This Is the Day": [
    "The The: «This Is the Day». Hoy es el día, sí. No mañana: en presente, el deseo se asume. Mañana, un lugar que nunca llega es.",
    "«When things fall into place», canta Matt Johnson: cuando las cosas encajan. Hmm. Encajan solas, las de afuera, cuando la pieza de adentro primero pusiste.",
  ],
  Arrival: [
    "Steve Roach: «Arrival». Llegada. Hmm. ¿Qué se siente al llegar? Un suspiro largo, de alivio. Ese suspiro, soltalo ahora: así se asume.",
    "Steve Roach, músico del desierto de Arizona. En el desierto, lo que parece vacío, lleno de vida está. Así el silencio antes de asumir: nada falta ahí. Hmm.",
  ],
  "Судно (Борис Рыжий)": [
    "«Súdno»: barco, en ruso; y la letra, un poema de Borís Ryzhi. Hmm. Subí al tuyo: el que ya atracó en el puerto del final.",
    "Molchat Doma: «las casas callan», su nombre dice. Cuando la casa de adentro calla, lo que imaginás más fuerte se oye. Hmm.",
  ],
  Glue: [
    "Bicep: «Glue», pegamento. Lo que con fuerza sentís, a tu vida se pega. Hmm. Pegá lo lindo, entonces.",
    "A recuerdo suena «Glue», aunque la primera vez la oigas. Hmm. Así la escena del final quiero: tan real, que como memoria se sienta, no como deseo.",
  ],
  "Some Velvet Morning (feat. Kate Moss)": [
    "«Some Velvet Morning». Una mañana suave, suave… Así despierta quien se durmió en el final: con el ánimo ya acomodado, sin saber bien por qué.",
    "Kate Moss, de las pasarelas al micrófono por un tema. Hmm. Un estado nuevo se prueba así: poniéndoselo, como ropa, hasta que a medida queda.",
  ],
  "На Дне": [
    "«На Дне»: en el fondo, en ruso. Hmm. Tocar fondo, buena noticia puede ser: desde ahí, con un buen impulso imaginado, hacia arriba se patea.",
    "Molchat Doma otra vez, desde Minsk. Post-punk frío para un ojo tibio. Hmm. Afuera, invierno puede hacer; adentro, el clima lo elegís vos.",
  ],
  "Bete Balanço": [
    "Barão Vermelho, con Cazuza al frente, para la película «Bete Balanço». En la tuya, protagonista sos: la última escena ensayá, que la cámara ya rueda.",
    "«Pode seguir a tua estrela», canta. Seguí tu estrella, sí… o mejor: en ella sentite ya. Desde ahí, la vista más linda es. Hmm.",
  ],
  "Não Adianta": [
    "Trio Mocotó: «Não Adianta», no hay caso, no sirve. Hmm. Preocuparse no sirve, verdad es. Asumir, en cambio, sí adianta. Y mucho.",
    "Trio Mocotó, el que a Jorge Ben le hacía el ritmo. Detrás de toda gran voz, un buen pulso hay. Detrás de todo gran logro, un estado firme también.",
  ],
  "Calling America": [
    "«Calling America». El llamado, llega: a veces por teléfono, a veces en una canción. Atendé. La línea de adentro, ocupada nunca está.",
    "Electric Light Orchestra: orquesta de luz eléctrica. Hmm. Tu luz, prendela adentro; la orquesta de afuera, sola se afina.",
  ],
  "Wait a Minute!": [
    "«Wait a Minute!». ¿Un minuto esperar? Un minuto alcanza para asumir: los ojos cerrás, lo ves hecho, y un «gracias» sentís. Listo.",
    "WILLOW la grabó de adolescente; años después, medio mundo la cantaba. Hmm. Lo asumido no se pierde: a su hora, llega. Paciencia, joven padawan.",
  ],
  "Meet Me Halfway": [
    "«Meet Me Halfway». ¿A mitad de camino? No: en el final encontrémonos. Desde ahí, se camina mejor.",
    "Black Eyed Peas: porotos de ojo negro, en rigor. Hmm. El poroto en el algodón, el de la escuela: ni lo mirás, y brota. Asumir, igual de simple es.",
  ],
  "Blue Monday '88": [
    "«Blue Monday». Lunes triste, dice. Hmm. El día, del color que le pongas: pintalo del que tendría si tu deseo ya cumplido estuviera.",
    "New Order: la versión del 88 de un tema del 83. Lo que asumiste, también vuelve remezclado, mejorado. Reconocelo cuando llegue.",
  ],
  "Advice For The Young At Heart": [
    "«Advice for the Young at Heart». Consejo para jóvenes de corazón: la edad, un estado es también. Asumila, y el espejo se entera.",
    "Tears for Fears: lágrimas por miedos, el trato. Hmm. Cambialo: sentimientos por hechos. Mejor negocio, ese.",
  ],
  "Somebody's Watching Me": [
    "«Somebody's Watching Me»… Hmm. Alguien te mira, sí: yo. Y vos, desde adentro. El que observa, nunca duerme.",
    "Rockwell, y en el estribillo, Michael Jackson. Una voz grande, escondida detrás. Como la tuya de adentro: la que de verdad canta, no se ve.",
  ],
  "Bigmouth Strikes Again": [
    "The Smiths. Bocón otra vez… Cuidado lo que de vos decís: el mundo, obediente es.",
    "The Smiths: el apellido más común del inglés. Hmm. Común el nombre; lo que en silencio asumís, en cambio, solo tuyo es.",
  ],
  "Walk The Night": [
    "«Walk the Night». Caminar de noche, sin ver el camino. Así se asume: firme el pie, aunque la luz todavía no llegue.",
    "Skatt Bros, disco de noche larga. Hmm. Amiga del que asume, la noche es: mientras dormís, lo imaginado hace horas extras. Sin cobrarte nada.",
  ],
  "A Real Hero": [
    "«A Real Hero». Héroe no es el que pelea: el que ya se siente del otro lado. Hmm.",
    "De la película «Drive», este. El volante, vos; el destino, ya marcado en la imaginación. Manejá tranquilo: llegar, seguro es.",
  ],
  "El Día Que Apagaron La Luz": [
    "Sui Generis. El día que apagaron la luz… el ojo de adentro siguió viendo. Esa luz, no se corta.",
    "Charly y Nito, muy jóvenes, en los setenta. Y todavía suena. Hmm. Lo que se imagina con el alma entera, viejo no se pone: medio siglo, y fresco.",
  ],
  "Black Velvet": [
    "«Black Velvet». Terciopelo negro, como el fondo de esta página. Sobre lo oscuro, lo que imaginás más brilla.",
    "Alannah Myles le canta a Elvis, años después de que se fuera. Hmm. Lo que se ama, la imaginación lo trae al presente. Tu deseo, igual: aquí y ahora cantalo.",
  ],
  "A Little Respect": [
    "Erasure: «A Little Respect». Con respeto, a tu imaginación tratá: tu mejor herramienta es.",
    "Erasure: borrado, su nombre. Hmm. Buena goma, esa. El viejo cuento de la escasez, borralo; en la hoja limpia, «ya está» escribí.",
  ],
  "Break It Down Again": [
    "«Break It Down Again». Desarmalo de nuevo… El viejo estado, sí: pieza por pieza. Y con las mismas piezas, el nuevo armá.",
    "«Again»: otra vez. Hmm. Lo que no salió, se vuelve a imaginar, sin culpa ni apuro. El ensayo, gratis es. E infinito, además.",
  ],
  Vivo: [
    "Cerati: «Vivo». Hmm. Yo soy, luego vivo. Ese orden, el bueno es: primero el ser; lo demás, después se acomoda.",
    "«Vivo», en criollo, también el que se avivó es. Avivate, hmm: lo que querés, ya adentro lo tenés. Hacerse el distraído, la única pérdida es.",
  ],
  "Poison Lips": [
    "Vitalic: vital, suena el nombre. Hmm. Y vital es lo que sentís al asumir: ese pulso, la señal de que el deseo ya respira.",
    "«Poison Lips». Labios de veneno… El único veneno, la duda repetida es. Antídoto: decirlo como ya cumplido, y sonreír.",
  ],
};

/** Algunos temas tienen, además, un guiño según el día o el lugar de quien escucha. */
const segunContexto: Record<string, (c: Contexto) => string> = {
  "Other Side Of The World": (c) =>
    c.enAmerica
      ? "«Other Side of the World». Del otro lado del mundo, alguien ya vive lo que pedís. Imaginalo cerca."
      : "«Other Side of the World». Del otro lado del mundo estás, parece. Hasta ahí, el ojo llega; y lo que imaginás, también.",
  "Blue Monday '88": (c) =>
    c.diaSemana === 1
      ? "«Blue Monday». Y lunes es… Tranquilo: el lunes, del color que vos asumas será."
      : "«Blue Monday». Lunes no es. Y aunque lo fuera: el día, del color que le pongas.",
  "Calling America": (c) =>
    c.enAmerica
      ? "«Calling America». Te llaman. Atendé: a veces la señal así llega, con una canción."
      : "«Calling America». El llamado, océanos cruza. Las buenas noticias, también.",
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
  (t: string, a: string) => `«${t}». Cerrá los ojos un compás: lo que querés, ya tuyo es. ${a} de fondo, además.`,
  (t: string, a: string) => `${a}, «${t}». Bailar podés; asumir, también. Las dos cosas a la vez, mejor salen.`,
  (t: string, a: string) => `«${t}», de ${a}. El estado, como la música: se sube el volumen desde adentro.`,
  (t: string, a: string) => `Suena ${a}. «${t}». Una escena chiquita imaginá: alguien te felicita. Eso, repetilo.`,
  (t: string, a: string) => `«${t}». Hmm. ${a} lo sabía: lo que se siente, se vuelve canción. Y la canción, hecho.`,
  (t: string, a: string) => `${a}: «${t}». Tres minutos de deseo cumplido, este tema dura. Aprovechalos.`,
  (t: string, a: string) => `«${t}», de ${a}. Tararealo como quien ya llegó. Llegar, así empieza.`,
];

/** Cuando la persona pide otro tema: Yo Da nota el cambio (y lo lleva a su terreno). */
const alPasar = [
  (t: string, a: string) => `Otro tema pediste. Con los pensamientos, lo mismo: el que no sirve, se pasa. Ahora: «${t}», de ${a}.`,
  (t: string, a: string) => `¿No era ese? Hmm. Elegir, el primer paso es. Ahora suena «${t}», de ${a}.`,
  (t: string, a: string) => `Saltaste de tema. Así se salta de estado también: sin pedir permiso. «${t}», ${a}.`,
  (t: string, a: string) => `Cambiaste. Bien. Ni la música ni el pensamiento obligatorios son. Suena ${a}: «${t}».`,
  (t: string, a: string) => `Hmm, exigente. Me gusta. Con tu deseo, igual de exigente sé. «${t}», de ${a}, ahora.`,
  (t: string, a: string) => `Siguiente. Como en la vida: lo que no vibra con vos, al costado. «${t}», de ${a}.`,
  (t: string, a: string) => `Otra vuelta de la ruleta. ${a}, «${t}». El azar, aquí, también a tu favor juega.`,
];

/** Lo último que dijo (qué guiño o qué molde de frase), para no repetirse en la visita. */
const recientes: string[] = [];
function sinRepetir(opciones: { clave: string; texto: string }[]): string {
  const nuevas = opciones.filter((o) => !recientes.includes(o.clave));
  const lista = nuevas.length ? nuevas : opciones;
  const elegido = lista[Math.floor(Math.random() * lista.length)];
  recientes.push(elegido.clave);
  if (recientes.length > 10) recientes.shift();
  return elegido.texto;
}
const moldes = (nombre: string, fs: ((t: string, a: string) => string)[], t: string, a: string) =>
  fs.map((f, i) => ({ clave: `${nombre}:${i}`, texto: f(t, a) }));

/**
 * Lo que Yo Da comenta de un tema que empieza. `especial`: tiene guiño propio (se dice aunque haya hablado hace poco).
 * Si la persona pidió el tema («Otro tema»), nota el cambio; nunca repite lo que dijo hace poco.
 */
export function comentarTema(t: TemaSonando, ahora = new Date()): { texto: string; especial: boolean } {
  let enAmerica = true;
  try {
    enAmerica = Intl.DateTimeFormat().resolvedOptions().timeZone.startsWith("America/");
  } catch {}
  const c: Contexto = { hora: ahora.getHours(), diaSemana: ahora.getDay(), enAmerica };
  if (t.fragmento)
    return { texto: `«${t.titulo}»… treinta segundos, nomás. Poco es, para asumir nada. Enteros los querés: en la música, el camino te dejé.`, especial: true };
  const artista = t.artista.split(",")[0].trim();
  const propios = [...(comentariosPorTema[t.titulo] ?? []), ...(segunContexto[t.titulo] ? [segunContexto[t.titulo](c)] : [])];
  if (propios.length) return { texto: sinRepetir(propios.map((texto, i) => ({ clave: `tema:${t.titulo}:${i}`, texto }))), especial: true };
  if (porArtista[artista] && !recientes.includes(`artista:${artista}`))
    return { texto: sinRepetir([{ clave: `artista:${artista}`, texto: porArtista[artista] }]), especial: true };
  if (t.pedido) return { texto: sinRepetir(moldes("pasar", alPasar, t.titulo, artista)), especial: false };
  if (c.hora < 6 && !recientes.includes("madrugada"))
    return {
      texto: sinRepetir([{ clave: "madrugada", texto: `A esta hora, ${artista}. Antes de dormir, el deseo cumplido sentí: esa, la hora buena es.` }]),
      especial: false,
    };
  return { texto: sinRepetir(moldes("general", generales, t.titulo, artista)), especial: false };
}

/** «¿Qué suena?» */
export function queSuena(t: TemaSonando | null): string {
  if (!t) return "Nada suena todavía. Si querés, la música prendé: temas al azar de la playlist de Julián son.";
  const base = `«${t.titulo}», de ${t.artista}.`;
  if (!t.sonando) return `En pausa quedó ${base} Seguir, cuando quieras.`;
  const { texto } = comentarTema(t);
  return texto.includes(t.titulo) ? texto : `${base} ${texto}`;
}
