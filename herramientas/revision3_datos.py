"""
Revisión 3 de la trilogía (sept. 2026): las correcciones que se aplican y las
dudas para la Hoja de Revisión (3ª pasada). Salen de una revisión completa de los
tres libros (ocho correctores por tramos, un revisor de coherencia y un segundo
corrector escéptico para cada hallazgo), revisada después a mano.
¶ = índice del párrafo (o tabla) en el cuerpo del .docx «(edición integral con
sitio, sin colofón, apertura limpia)».
"""

CORRECCIONES = [
 {
  "libro": "receta",
  "parrafo": 65,
  "original": "«Y luego Jesús, conociendo en sí mismo el poder que había salido de él, dijo: ¿Quién me ha tocado?»",
  "corregido": "«Luego Jesús, conociendo en sí mismo el poder que había salido de él, volviéndose a la multitud, dijo: ¿Quién ha tocado mis vestidos?»",
  "tipo": "cita",
  "motivo": "Está textual en ¶65. Marcos 5:30 en RVR1960 dice exactamente «Luego Jesús, conociendo en sí mismo el poder que había salido de él, volviéndose a la multitud, dijo: ¿Quién ha tocado mis vestidos?». El epígrafe mezcla este versículo con la pregunta de Lucas 8:45. Es un epígrafe confirmado, sin la marca de «propuesto», así que tiene que ir textual. Poner el versículo completo es la corrección más limpia. Si alguna frase del sitio o alguna contratapa usa este epígrafe, hay que corregirla también."
 },
 {
  "libro": "receta",
  "parrafo": 19,
  "original": "Copyright ©2026",
  "corregido": "Copyright © 2026",
  "tipo": "tipeo",
  "motivo": "Es una errata tipográfica. La forma normal lleva espacio y la misma página lo escribe así en ¶30 («© ELVERBO, 2026»). Va igual en ¶19 de Pensamiento y de Biografía."
 },
 {
  "libro": "receta",
  "parrafo": 86,
  "original": "Cómo lo puedo poner: entrás en una religión",
  "corregido": "¿Cómo lo puedo poner? Entrás en una religión",
  "tipo": "puntuacion",
  "motivo": "Está textual en ¶86. Es una interrogativa directa: «Cómo» lleva tilde y le faltan los signos. Es solo ordenar la puntuación, no se toca ninguna palabra."
 },
 {
  "libro": "receta",
  "parrafo": 54,
  "original": "dentro de uno mismo, esas mentes se utilizan",
  "corregido": "dentro de uno mismo. Esas mentes se utilizan",
  "tipo": "puntuacion",
  "motivo": "Está textual en ¶54. Son dos oraciones independientes unidas por coma, sin nexo. El editor anterior ya había querido separarlas con punto y coma (edits_rec.py), pero el filtro de voz lo volvió a coma. El punto separa las oraciones sin sumar signos ajenos al habla y sin tocar palabras."
 },
 {
  "libro": "receta",
  "parrafo": 89,
  "original": "ahí estás en un punto 75, en un punto 90",
  "corregido": "ahí estás en un punto setenta y cinco, en un punto noventa",
  "tipo": "otro",
  "motivo": "La escala del «punto» (el punto cero) va en letras en el resto de la trilogía: «noventa y nueve» y «cien» en Receta ¶95, y «punto setenta» y «punto noventa y ocho, noventa y nueve» en Pensamiento Cap. 6. Solo ¶89 la pone en cifras. Pasarla a letras unifica el criterio sin tocar palabras."
 },
 {
  "libro": "receta",
  "parrafo": 102,
  "original": "«Y seréis como Dios, conociendo el bien y el mal.»",
  "corregido": "«Y seréis como Dios, sabiendo el bien y el mal.»",
  "tipo": "cita",
  "motivo": "En la RVR1960, Génesis 3:5 dice «y seréis como Dios, sabiendo el bien y el mal». «Conociendo» no es de esa versión, y el CLAUDE.md pide los epígrafes en RVR1960. El epígrafe lo pone el editor, no es habla de Julián, y el título «Conocedores del bien y el mal» no se toca. La Hoja (punto 45) pregunta si se mantiene el versículo, no cómo está redactado. Si Julián lo sostiene, tiene que ir textual."
 },
 {
  "libro": "receta",
  "parrafo": 150,
  "original": "Fijate que el ejercicio no se posterga —porque si encima se posterga, se confiesa que no se tiene; esto es impresionante—.",
  "corregido": "Fijate que el ejercicio no se posterga, porque si encima se posterga, se confiesa que no se tiene. Esto es impresionante.",
  "tipo": "puntuacion",
  "motivo": "El pasaje junta una raya de inciso con un punto y coma adentro, y el CLAUDE.md dice que los dos son signos que el habla de Julián no tiene. Además, las rayas deforman la estructura: «Esto es impresionante.» es su remate de siempre y va como frase suelta (así aparece en ¶152), no como inciso. La corrección conserva todas sus palabras y el orden."
 },
 {
  "libro": "receta",
  "parrafo": 177,
  "original": "es realmente posible que la conciencia exterioriza los estados de conciencia",
  "corregido": "es realmente posible que la conciencia exteriorice los estados de conciencia",
  "tipo": "concordancia",
  "motivo": "Está textual en el ¶177. «Es posible que» pide subjuntivo sí o sí, y la única corrección razonable es cambiar una letra. No toca ni el ritmo ni el vocabulario de Julián."
 },
 {
  "libro": "receta",
  "parrafo": 210,
  "original": "al final, de «soy millonario», vas a estar pensando",
  "corregido": "al final de «soy millonario», vas a estar pensando",
  "tipo": "puntuacion",
  "motivo": "Está textual en el ¶210. La coma parte el complemento «al final de…». Sacarla es solo ordenar la puntuación y no cambia ninguna palabra."
 },
 {
  "libro": "receta",
  "parrafo": 201,
  "original": "Cuando te metas en tengo hambre, eso va a ser tu mundo.",
  "corregido": "Cuando te metas en «tengo hambre», eso va a ser tu mundo.",
  "tipo": "puntuacion",
  "motivo": "Está textual en el ¶201. Es un pensamiento citado en primera persona y el libro pone esos pensamientos entre comillas (por ejemplo «soy millonario» y «yo soy atento» en el mismo capítulo). Es ordenar la puntuación y no suma nada ajeno a su habla."
 },
 {
  "libro": "receta",
  "parrafo": 166,
  "original": "Esto en las escrituras se pone",
  "corregido": "Esto en las Escrituras se pone",
  "tipo": "ortografia",
  "motivo": "Está textual en el ¶166. Cuando se refiere a la Biblia, la ortografía de la RAE pide mayúscula («las Escrituras»). Hay que unificar con las otras dos apariciones, Receta ¶129 y Pensamiento ¶167, que van en «nuevos»."
 },
 {
  "libro": "receta",
  "parrafo": 168,
  "original": "conocen el fondo del mar. ",
  "corregido": "conocen el fondo del mar.",
  "tipo": "tipeo",
  "motivo": "Comprobé que el ¶168 termina con un espacio de más. Es un tipeo sin ninguna consecuencia sobre el texto."
 },
 {
  "libro": "receta",
  "parrafo": 209,
  "original": "cuánto estoy llenando. ",
  "corregido": "cuánto estoy llenando.",
  "tipo": "tipeo",
  "motivo": "Comprobé que el ¶209 termina con un espacio de más. Es un tipeo sin ninguna consecuencia sobre el texto."
 },
 {
  "libro": "receta",
  "parrafo": 129,
  "original": "versículos de las escrituras dicen",
  "corregido": "versículos de las Escrituras dicen",
  "tipo": "ortografia",
  "motivo": "Se refiere a la Biblia, así que va con mayúscula según la RAE. Queda igual que la corrección del ¶166 (hallazgo 4)."
 },
 {
  "libro": "pensamiento",
  "parrafo": 167,
  "original": "lo que en las escrituras se llama",
  "corregido": "lo que en las Escrituras se llama",
  "tipo": "ortografia",
  "motivo": "Se refiere a la Biblia, así que va con mayúscula según la RAE. Queda igual que la corrección de Receta ¶166 (hallazgo 4)."
 },
 {
  "libro": "pensamiento",
  "parrafo": 96,
  "original": "le pasa muy desapercibida uno mismo",
  "corregido": "le pasa muy desapercibido uno mismo",
  "tipo": "concordancia",
  "motivo": "Está textual en ¶96. El sujeto es «uno mismo» y la oración siguiente lo confirma («Uno mismo se autopasa desapercibido»). Es un error de concordancia, no cambia el sentido ni el ritmo y no es un rasgo de su voz."
 },
 {
  "libro": "pensamiento",
  "parrafo": 69,
  "original": "O sea, digo lápiz y se me viene la imagen del lápiz.",
  "corregido": "O sea, digo «lápiz» y se me viene la imagen del lápiz.",
  "tipo": "puntuacion",
  "motivo": "Está textual en ¶69. Es un uso metalingüístico (se habla de decir la palabra), y en ¶67 y ¶68 ese mismo uso ya lleva comillas. Ordenar la puntuación está permitido y no agrega signos ajenos a su habla."
 },
 {
  "libro": "pensamiento",
  "parrafo": 70,
  "original": "fijate que no se llama lápiz, en ese momento",
  "corregido": "fijate que no se llama «lápiz», en ese momento",
  "tipo": "puntuacion",
  "motivo": "Es un uso metalingüístico (el nombre del objeto), y en la misma oración el término paralelo ya va entre comillas («un elemento que tenga la tinta portátil»). Sigue el mismo criterio que ¶67, ¶68 y ¶69."
 },
 {
  "libro": "pensamiento",
  "parrafo": 202,
  "original": "Pero, ¿qué pasa?",
  "corregido": "Pero ¿qué pasa?",
  "tipo": "puntuacion",
  "motivo": "La norma dice que no va coma entre «pero» y la pregunta que le sigue, y Receta ya lo escribe así («Pero ¿qué es lo que está pasando de 2 a 4?»). Es la única vez que aparece con coma en los tres libros. Ordenar la puntuación está permitido y no cambia la voz."
 },
 {
  "libro": "pensamiento",
  "parrafo": 201,
  "original": "porque eso es la fe. ",
  "corregido": "porque eso es la fe.",
  "tipo": "tipeo",
  "motivo": "Lo verifiqué: el párrafo termina con un espacio de más. Es un error de tipeo, no toca el texto."
 },
 {
  "libro": "biografia",
  "parrafo": 79,
  "original": "antes de haber entrado al casting —o sea, cuatro meses antes de haber ganado el premio de la cocina—, yo me sentí",
  "corregido": "antes de haber entrado al casting, o sea, cuatro meses antes de haber ganado el premio de la cocina, yo me sentí",
  "tipo": "puntuacion",
  "motivo": "El CLAUDE.md prohíbe sumar rayas de inciso que el habla de Julián no tiene, y con comas el sentido no cambia. Las rayas de las notas editoriales (¶70 y ¶86) y del copyright (¶23) no son de Julián y quedan. Conviene revisar con el mismo criterio las otras rayas de Julián en los Cap. 2 y 3 de Biografía (por ejemplo, «—digo, porque yo no paraba de pensar en eso…—» y «—cuando yo tenía seis años…—»)."
 },
 {
  "libro": "biografia",
  "parrafo": 19,
  "original": "Copyright ©2026 por",
  "corregido": "Copyright © 2026 por",
  "tipo": "tipeo",
  "motivo": "Es un tipeo de la página de créditos, no la voz de Julián. En la misma página, ¶30 («Diseño de portada © ELVERBO, 2026») lleva espacio. Se aplica igual en Receta ¶19 y en Pensamiento ¶19, que tienen el mismo «©2026»."
 },
 {
  "libro": "biografia",
  "parrafo": 101,
  "original": "En todos los sentidos. ",
  "corregido": "En todos los sentidos.",
  "tipo": "tipeo",
  "motivo": "Hay un espacio de más al final del ¶101 (verificado). Es un error mecánico y no toca la voz."
 },
 {
  "libro": "biografia",
  "parrafo": 141,
  "original": "y no podía cumplir esa promesa. ",
  "corregido": "y no podía cumplir esa promesa.",
  "tipo": "tipeo",
  "motivo": "Hay un espacio de más al final del ¶141 (verificado). Es un error mecánico y no toca la voz."
 },
 {
  "libro": "receta",
  "parrafo": 19,
  "original": "Copyright ©2026 por",
  "corregido": "Copyright © 2026 por",
  "tipo": "tipeo",
  "motivo": "Es un error tipográfico objetivo, y además la misma página no es pareja: ¶30 pone «Diseño de portada © ELVERBO, 2026», con espacio. La corrección es única."
 },
 {
  "libro": "pensamiento",
  "parrafo": 19,
  "original": "Copyright ©2026 por",
  "corregido": "Copyright © 2026 por",
  "tipo": "tipeo",
  "motivo": "Es igual que en Receta: falta el espacio después de «©». En ¶30 de la misma página sí está."
 }
]

HOJA = [
 {
  "libro": "los tres",
  "parrafo": None,
  "original": "ISBN-13: 3333333333333",
  "propuesta": "ISBN-13: [a definir]",
  "pregunta": "(Para Lucas) Los tres libros tienen ISBN de relleno («3333333333333» / «3333333333»), repetidos e inválidos. En esta revisión quedaron como «[a definir]» para que no se impriman. ¿Ya están pedidos los ISBN reales de cada título? ¿Dejamos también el ISBN-10 o solo el ISBN-13?",
  "editorial": True
 },
 {
  "libro": "receta",
  "parrafo": 97,
  "original": "y abrirte, simplemente desabrirte.",
  "propuesta": "y abrirte, simplemente desabrirte [posible error de reconocimiento de voz — a confirmar].",
  "pregunta": "Receta, Cap. 1: «uno debe olvidar todo lo que fue absorbiendo… y abrirte, simplemente desabrirte». «Desabrirte» puede estar mal transcripto. ¿Qué palabra dijiste: «desaprender», «vaciarte», otra?",
  "editorial": False
 },
 {
  "libro": "receta",
  "parrafo": 105,
  "original": "sobre cualquier cosa que nosotros inventemos tener",
  "propuesta": "sobre cualquier cosa que nosotros intentemos tener",
  "pregunta": "Receta, Cap. 2, primera frase: «ser conocedores del bien y del mal sobre cualquier cosa que nosotros inventemos tener». ¿Dijiste «intentemos tener», «queramos tener» o es «inventemos» a propósito?",
  "editorial": False
 },
 {
  "libro": "receta",
  "parrafo": 129,
  "original": "creer al Señor con todo tu corazón",
  "propuesta": "querer al Señor con todo tu corazón",
  "pregunta": "Receta, Cap. 2: «muchos versículos dicen: creer al Señor con todo tu corazón, con todo tu amor…». ¿Dijiste «creer» o «querer» (amar) al Señor?",
  "editorial": False
 },
 {
  "libro": "receta",
  "parrafo": 129,
  "original": "Pum, voto de amor tremendo ya eso.",
  "propuesta": "Pum, motivo de amor tremendo ya eso.",
  "pregunta": "Receta, Cap. 2: «Eso ya es una misericordia impresionante. Pum, voto de amor tremendo ya eso.» Después seguís con «Número dos». ¿Qué dijiste en lugar de «voto»? ¿«Motivo de amor», «punto uno» u otra cosa?",
  "editorial": False
 },
 {
  "libro": "receta",
  "parrafo": 146,
  "original": "Mientras una persona sabe que tiene, está haciendo el mismo trabajo a la inversa.",
  "propuesta": "Mientras una persona sabe que tiene que hacerlo, está haciendo el mismo trabajo a la inversa.",
  "pregunta": "Receta, Cap. 3: «¿qué es lo que está pasando de 2 a 4? Mientras una persona sabe que tiene, está haciendo el mismo trabajo a la inversa». ¿Cómo sigue «sabe que tiene…»? ¿«Que tiene que hacerlo de 4 a 6», «que no tiene pareja» u otra cosa?",
  "editorial": False
 },
 {
  "libro": "receta",
  "parrafo": 141,
  "original": "y como su mundo está tal cual",
  "propuesta": "y cómo su mundo está tal cual",
  "pregunta": "Receta, Cap. 3: «sigue hablando de exactamente lo que tiene que hacer y como su mundo está tal cual». ¿Querés decir que sigue hablando de cómo su mundo está igual, o que, por hablar así, su mundo sigue igual?",
  "editorial": False
 },
 {
  "libro": "receta",
  "parrafo": 206,
  "original": "Vos pensás que todo se va llenando en la vida",
  "propuesta": "Vos pensá que todo se va llenando en la vida",
  "pregunta": "Está textual en el ¶206. Julián defiende esa idea y la contrapone a lo que dice el otro («vos decís, sí, se va vaciando. No…»). Con «pensás» el párrafo se contradice solo. «Vos pensá que…» es la fórmula rioplatense de siempre, y la -s final aspirada explica que el reconocimiento de voz se equivocara. Es la única lectura coherente.",
  "editorial": False
 },
 {
  "libro": "receta",
  "parrafo": 212,
  "original": "a una velocidad de trescientos o cuatrocientos kilómetros por hora",
  "propuesta": "a una velocidad de trescientos o cuatrocientos kilómetros por hora",
  "pregunta": "Receta, Cap. 5: «la palabra, que es sonido, y que a una velocidad de trescientos o cuatrocientos kilómetros por hora». El sonido va a unos 340 metros por segundo (unos 1.200 km/h). ¿Quisiste decir «metros por segundo»? ¿Lo dejamos como lo dijiste o lo sacamos? ¿Falta un verbo en «y que a una velocidad» (¿«que va a una velocidad»?)?",
  "editorial": False
 },
 {
  "libro": "receta",
  "parrafo": 212,
  "original": "poder empacharlas al momento de ir hablando",
  "propuesta": "poder empacharlas al momento de ir hablando",
  "pregunta": "Está textual en el ¶212. «Empacharlas» se puede leer como un uso figurado (llenarlas, saturarlas, que va con la imagen del tanque de este capítulo) o como un error por «despacharlas». No es una sola corrección obvia, así que va a la Hoja.",
  "editorial": False
 },
 {
  "libro": "receta",
  "parrafo": 216,
  "original": "que tampoco era ahora único",
  "propuesta": "que tampoco era ahora único",
  "pregunta": "Receta, Cap. 5: «vos también podés ser Messi en ese sentido, que tampoco era ahora único». ¿Qué dijiste en lugar de «ahora»? ¿«Tampoco era tan único»? ¿«Tampoco era algo único»?",
  "editorial": False
 },
 {
  "libro": "receta",
  "parrafo": 207,
  "original": "te vas a ver peor, en base a determinado.",
  "propuesta": "te vas a ver peor, en base a determinado.",
  "pregunta": "Receta, Cap. 5: «si vos comés más de lo que subís y bajás escaleras, te vas a ver peor, en base a determinado.» La frase quedó cortada. ¿Cómo sigue («en base a determinado…» qué)? ¿O la cortamos en «te vas a ver peor»?",
  "editorial": False
 },
 {
  "libro": "pensamiento",
  "parrafo": 84,
  "original": "Distintivamente todos tenemos este saber de la máquina",
  "propuesta": "Instintivamente todos tenemos este saber de la máquina",
  "pregunta": "Pensamiento, Cap. 1: «Distintivamente todos tenemos este saber de la máquina». ¿Quisiste decir «Instintivamente» (lo traemos de nacimiento) o era otra palabra?",
  "editorial": False
 },
 {
  "libro": "pensamiento",
  "parrafo": 71,
  "original": "Tal vez una pluma ave, con un cartucho",
  "propuesta": "Tal vez una pluma de ave, con un cartucho [posible error de reconocimiento de voz — a confirmar]",
  "pregunta": "Pensamiento, Cap. 0: «Tal vez una pluma ave, con un cartucho, con una lanza». ¿Dijiste «una pluma de ave», «una pluma, a ver, con un cartucho» u otra cosa?",
  "editorial": False
 },
 {
  "libro": "pensamiento",
  "parrafo": 95,
  "original": "Nada puede interceder que vos hables",
  "propuesta": "Nada puede impedir que vos hables [posible error de reconocimiento de voz — a confirmar]",
  "pregunta": "Pensamiento, Cap. 1: «Nada puede interceder que vos hables de la forma en la que vos creas…». ¿Quisiste decir «impedir», «interferir en» u otra palabra?",
  "editorial": False
 },
 {
  "libro": "pensamiento",
  "parrafo": 91,
  "original": "es impedir que algo se coincida",
  "propuesta": "es impedir que algo coincida [posible error de reconocimiento de voz — a confirmar]",
  "pregunta": "Pensamiento, Cap. 1: «la distracción en sí es impedir que algo se coincida». ¿Qué palabra dijiste ahí: «coincida», «se concrete», «se cumpla», «se concentre» u otra?",
  "editorial": False
 },
 {
  "libro": "pensamiento",
  "parrafo": 90,
  "original": "de que decís que te afecta lo que decís que no te afecta",
  "propuesta": "de que decís que te afecta lo que decís que no te afecta [posible error de reconocimiento de voz — a confirmar]",
  "pregunta": "Pensamiento, Cap. 1: «Te das cuenta de que es el estado de conciencia en sí, de que decís que te afecta lo que decís que no te afecta». ¿Querías decir que lo que decís que no te afecta igual te afecta, o que el estado de conciencia es «lo que decís que te afecta y lo que decís que no te afecta», en paralelo con «lo que decís que podés y lo que decís que no podés»?",
  "editorial": False
 },
 {
  "libro": "pensamiento",
  "parrafo": 100,
  "original": "entra verdaderamente la palabra «inconsciente» para hablar del subconsciente",
  "propuesta": "entra verdaderamente la palabra «inconsciente» para hablar del subconsciente [posible error de reconocimiento de voz — a confirmar]",
  "pregunta": "Pensamiento, Cap. 1: «Acá es cuando entra verdaderamente la palabra «inconsciente» para hablar del subconsciente», y enseguida: «No me estoy refiriendo con el inconsciente al subconsciente». ¿Qué dijiste en la primera frase: «no para hablar del subconsciente», «en lugar del subconsciente» u otra cosa?",
  "editorial": False
 },
 {
  "libro": "pensamiento",
  "parrafo": 144,
  "original": "porque retrocederían años en mi realidad",
  "propuesta": "porque retrocedería años en mi realidad",
  "pregunta": "El original está textual en ¶144. El plural «retrocederían» no tiene sujeto posible en la frase (las «teorías conspirativas» quedaron dos oraciones atrás y no son las que retroceden «en mi realidad»). El sujeto es Julián, que no se va a poner a discutir: «(yo) retrocedería años en mi realidad». Al oído «retrocedería» y «retrocederían» son casi iguales, así que es un error de reconocimiento de voz, y no hay otra corrección razonable.",
  "editorial": False
 },
 {
  "libro": "pensamiento",
  "parrafo": 150,
  "original": "esa parte de sí misma que realmente coincide todo lo que quiere",
  "propuesta": "esa parte de sí misma que realmente concede todo lo que quiere",
  "pregunta": "Pensamiento, Cap. 4: «esa parte de sí misma que realmente coincide todo lo que quiere». ¿Qué dijiste: «concede todo lo que quiere», «coincide con todo lo que quiere», «consigue todo lo que quiere» u otra cosa?",
  "editorial": False
 },
 {
  "libro": "pensamiento",
  "parrafo": 159,
  "original": "o la personalidad de brujo, de brujito.",
  "propuesta": "No la personalidad de brujo, de brujito.",
  "pregunta": "Pensamiento, Cap. 5 (apertura de Arquetipos): «No la personalidad de brujo, de brujito.». ¿Arrancaste así, con «No», o dijiste «Lo de la personalidad…», «Con la personalidad…» u otra cosa? ¿Falta algo antes?",
  "editorial": False
 },
 {
  "libro": "pensamiento",
  "parrafo": 183,
  "original": "«Y aconteció que mientras iban, fueron sanados.»",
  "propuesta": "«Y aconteció que mientras iban, fueron limpiados.»",
  "pregunta": "En la Reina-Valera 1960, Lucas 17:14 dice «fueron limpiados», no «sanados». ¿Ponemos el epígrafe textual de la Biblia («fueron limpiados») y dejamos «sanados» en tu frase del cierre y de Receta, o preferís que el epígrafe también diga «sanados» como vos lo decís? En ese caso no lo presentaríamos como cita textual de la RVR1960.",
  "editorial": True
 },
 {
  "libro": "pensamiento",
  "parrafo": 187,
  "original": "solamente tenés que ponerte cómo sería la sensación de la gravedad",
  "propuesta": "solamente tenés que preguntarte cómo sería la sensación de la gravedad",
  "pregunta": "Pensamiento, Cap. 6: «solamente tenés que ponerte cómo sería la sensación de la gravedad». ¿Dijiste «preguntarte», «proponerte», «ponerte a pensar» u otra cosa?",
  "editorial": False
 },
 {
  "libro": "pensamiento",
  "parrafo": 194,
  "original": "transitá el camino del tiempo pensando que tenés, y que atravesaste",
  "propuesta": "transitá el camino del tiempo pensando que ya lo tenés, y que atravesaste",
  "pregunta": "Pensamiento, Cap. 6: «transitá el camino del tiempo pensando que tenés, y que atravesaste el tiempo exitosamente». ¿Es «pensando que ya lo tenés» o falta otra palabra?",
  "editorial": False
 },
 {
  "libro": "biografia",
  "parrafo": 87,
  "original": "Entonces decían eso: que el que tiene algo",
  "propuesta": "Entonces decía eso: que el que tiene algo",
  "pregunta": "En «Entonces decían eso: que el que tiene algo lo puede tener en distintas formas», ¿hablás de lo que decías vos («decía», como antes: «el que tiene algo lo puede tener y en abundancia») o de algo que decían otros, algún maestro o una enseñanza?",
  "editorial": False
 },
 {
  "libro": "biografia",
  "parrafo": 75,
  "original": "La persona a la que le pagan por ser presencia",
  "propuesta": "La persona a la que le pagan por hacer presencia",
  "pregunta": "En «La persona a la que le pagan por ser presencia», ¿dijiste «por hacer presencia», «por su presencia» o lo querés dejar como «ser presencia»?",
  "editorial": False
 },
 {
  "libro": "biografia",
  "parrafo": 146,
  "original": "quiero convertirme en Mago, pero reconocido",
  "propuesta": "quiero convertirme en mago, pero reconocido",
  "pregunta": "Biografía, Cap. 3: «quiero convertirme en Mago, pero reconocido». ¿Dijiste «mago», en el sentido de hacer magia? ¿O era otra palabra, por ejemplo algo de la cocina o el nombre de un programa? Si es «mago», va en minúscula.",
  "editorial": False
 },
 {
  "libro": "biografia",
  "parrafo": 119,
  "original": "«que te vaya bien en la vida...»",
  "propuesta": "[posible error de reconocimiento de voz — a confirmar] «que te vaya bien en la vida...»",
  "pregunta": "Biografía, Cap. 2: «buscaba que alguien me diga: «que te vaya bien en la vida...», «pará, Julián, vos tenés que hacer esto…»». ¿Es eso lo que dijiste, o era otra frase (por ejemplo, «¿qué te pasa en la vida?»)? Si era otra, dictala.",
  "editorial": False
 },
 {
  "libro": "los tres",
  "parrafo": None,
  "original": "Impreso en Buenos Aires, Argentina",
  "propuesta": "Primera edición: [mes] de 2026 · Hecho el depósito que marca la ley 11.723 · Impreso en [imprenta], Buenos Aires, Argentina, en [mes] de 2026",
  "pregunta": "(Para Lucas) Al sacar el colofón, la página de derechos quedó sin fecha ni imprenta. ¿Sumamos «Primera edición: [mes] de 2026», «Hecho el depósito que marca la ley 11.723» y el nombre de la imprenta?",
  "editorial": True
 },
 {
  "libro": "los tres",
  "parrafo": None,
  "original": "en Receta, Capítulo 2.",
  "propuesta": "en La Receta de la Manifestación, Capítulo 2.",
  "pregunta": "(Para Lucas) Las notas de puente nombran «El Pensamiento es Tu Fe» completo, pero ponen solo «Receta» para La Receta de la Manifestación. ¿Unificamos con el título completo en todas, o con la forma corta en todas?",
  "editorial": True
 }
]
