import json, shutil, os, re, html
S='/tmp/claude-0/-home-user-jb/d179e3ea-2dc4-5559-b338-b3b83ba56974/scratchpad'
B='/home/user/render/build'
L=json.load(open(f'{B}/work/log.json'))
def esc(t): return html.escape(t,quote=False)
def P(text,style='BodyText',bold_prefix=None,italic=False):
    runs=''
    if bold_prefix: runs+=f'<w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">{esc(bold_prefix)}</w:t></w:r>'
    rp='<w:rPr><w:i/></w:rPr>' if italic else ''
    runs+=f'<w:r>{rp}<w:t xml:space="preserve">{esc(text)}</w:t></w:r>'
    return f'<w:p><w:pPr><w:pStyle w:val="{style}"/></w:pPr>{runs}</w:p>'
def H1(t): return P(t,'Heading1')
def H2(t): return P(t,'Heading2')
def build(name, parts):
    d=f'{B}/doc_{name}'
    if os.path.exists(d): shutil.rmtree(d)
    shutil.copytree(f'{S}/u_hoja',d)
    x=open(f'{d}/word/document.xml',encoding='utf8').read()
    m=re.search(r'<w:sectPr.*?</w:sectPr>|<w:sectPr/>',x,re.S); sect=m.group(0)
    x=re.sub(r'<w:body>.*</w:body>','<w:body>'+''.join(parts)+sect+'</w:body>',x,flags=re.S)
    x=re.sub(r'<w:commentRangeStart[^>]*/>|<w:commentRangeEnd[^>]*/>','',x)
    open(f'{d}/word/document.xml','w',encoding='utf8').write(x)
    open(f'{d}/word/settings.xml','w',encoding='utf8').write('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:zoom w:percent="100"/><w:defaultTabStop w:val="720"/><w:characterSpacingControl w:val="doNotCompress"/><w:compat><w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/></w:compat></w:settings>')
    sy=open(f'{d}/word/styles.xml',encoding='utf8').read()
    def fixstyle(m):
        st=m.group(0)
        if re.search(r'</w:pPr>\s*<w:qFormat\s*/>',st) or re.search(r'</w:rPr>\s*<w:qFormat\s*/>',st):
            st=re.sub(r'\s*<w:qFormat\s*/>','',st)
            st=re.sub(r'(<w:basedOn[^>]*/>|<w:name[^>]*/>)(?![\s\S]*<w:basedOn)',r'\1<w:qFormat/>',st,count=1) if False else st
        return st
    sy=re.sub(r'<w:style\b.*?</w:style>',fixstyle,sy,flags=re.S)
    open(f'{d}/word/styles.xml','w',encoding='utf8').write(sy)
    out=f'{B}/final/{name}.docx'; os.makedirs(f'{B}/final',exist_ok=True)
    if os.path.exists(out): os.remove(out)
    os.system(f'cd "{d}" && zip -qXr "{out}" .')
    return out
BOOKN={'receta':'I — LA RECETA DE LA MANIFESTACIÓN','pensamiento':'II — EL PENSAMIENTO ES TU FE','biografia':'III — LA BIOGRAFÍA'}
MOT={'ASR':'error de transcripción corregido hacia lo que dijo','tic':'muletilla de grabación dirigida al oyente','repetición':'repetición o arranque falso del habla','puntuación':'puntuación y comillas de diálogo','voseo':'voseo unificado','gramática':'gramática mínima','sentido':'corrección hacia lo que quiso decir — confirmar con Julián','andamiaje':'comentario sobre la grabación, no del libro'}
# ------------------------------------------------ REGISTRO
R=[H1('Registro de cambios — Edición integral de la trilogía'),
 P('Esta pasada ordena, corrige y sincroniza los tres libros sin agregar ni una idea que no sea de Julián. Todo lo que cambió está acá, con el texto de antes, el de ahora y el motivo. Los manuscritos anteriores quedaron intactos al lado de las versiones nuevas.','FirstParagraph'),
 P('Criterio de texto: se corrigieron errores evidentes de transcripción hacia lo que Julián quiso decir, se sacaron muletillas de grabación («¿no?», «¿viste?», «¿entendés?», «¿eh?»), arranques falsos y palabras repetidas por la transcripción, se unificó el voseo y la puntuación, y se dividieron los bloques gigantes en puntos de respiración naturales. Las repeticiones que forman parte de su voz («todo, todo, todo», «no quiero más, no quiero más») se conservaron. Donde el sentido no es seguro, no se adivinó: quedó en la Hoja de Revisión para Julián (2ª pasada).'),
 P('Voz humana: se evitó sumar signos que el habla de Julián no tenía (rayas de inciso y punto y coma); donde el original no los usaba, se volvió a la coma. La cantidad de palabras quedó prácticamente igual a la original (solo bajó lo que eran muletillas y repeticiones de la transcripción).'),
 H2('Sincronía capítulo a capítulo'),
 P('Cada número de capítulo habla de lo mismo desde las tres facetas de Julián: el cómo (Receta), el por qué (Pensamiento) y el quién (Biografía). Para lograrlo se reordenaron los capítulos de Pensamiento, sin tocar su contenido.'),
 P('Receta: Dos Formatos de la Mente · Pensamiento: La Palabra · Biografía: Primera Imagen. Motivo común: la luz del principio (los tres abren con «En el principio»).','BodyText','Cap. 0 — '),
 P('Receta: El Sentimiento Crea la Realidad · Pensamiento: Libertad Interna · Biografía: El Reconocimiento. Motivo común: el corazón (el sentimiento como motor).','BodyText','Cap. 1 — '),
 P('Receta: Conocedores del Bien y el Mal · Pensamiento: El Observador Eterno · Biografía: El Desastre. Motivo común: el ojo. El mismo bloque del Ojo Observador está en Receta y Pensamiento, y en Biografía aparece como «detrás del que está llorando hay alguien que está muy tranquilo observando».','BodyText','Cap. 2 — '),
 P('Receta: Ahora Mismo · Pensamiento: Conversaciones Sinceras · Biografía: Poner a Prueba. Motivo común: el tiempo de la práctica (fases lunares). Contar el pasado como pasado, no postergar, y las noches en que Julián puso a prueba todo.','BodyText','Cap. 3 — '),
 P('Receta: La Pesca · Pensamiento: La Inteligencia Natural. Motivo común: océano y desierto («el camino de la inteligencia», «un poco de ingenio»; «la tienta en el desierto»).','BodyText','Cap. 4 — '),
 P('Receta: Cargar el Estado · Pensamiento: Arquetipos. Motivo común: la llama (la lámpara con aceite; el mago, el truco y Cristo sin amuletos, solo con su palabra).','BodyText','Cap. 5 — '),
 P('Pensamiento: Atravesar el Tiempo, el cierre de la trilogía: la espiral. Termina en «mientras iban, fueron sanados», el mismo versículo que Julián cita en Receta, Cap. 3, y que abre el capítulo.','BodyText','Cap. 6 — '),
 H2('Movimientos de estructura'),
]
for b,k,o,n,w in L:
    if k in ('estructura','sincronía'):
        R+= [P(o,'BodyText','Antes: '), P(n,'BodyText','Ahora: ')] + ([P(w,'BodyText','Por qué: ',True)] if w else [])
R+=[H2('Diseño'),
 P('Formato de imprenta 5.5 × 8.5 pulgadas (trade), márgenes espejados con medianil para encuadernar, partición de palabras activada, cuerpo en Palatino de 11 puntos con interlineado 1,2 y un respiro de 7,5 puntos entre párrafos.'),
 P('Aperturas de capítulo unificadas en los tres libros: grabado del capítulo arriba, «CAPÍTULO N» en versalitas espaciadas, título, epígrafe entre comillas latinas con la cita en versalitas y, si corresponde, la marca [versículo propuesto — a confirmar].'),
 P('Pensamiento: cada capítulo abre con una página divisoria en negro total con texto claro; el cuerpo arranca en la página siguiente, en blanco.'),
 P('Ornamento ◆ ◆ ◆ al cierre de cada capítulo, en el color de acento de cada libro, siempre pegado al último párrafo para que nunca quede solo en una página.'),
 P('Íconos nuevos en estilo grabado (xilografía), inspirados en la estampa de Neville: tinta con cortes de gubia, bordes irregulares y marco con orla. Cada capítulo tiene su emblema en el encabezado y en el índice, y su grabado completo en la apertura. Los tres libros comparten orla y motivo en el mismo número de capítulo. El Cap. 1 de Receta, donde Julián nombra a Neville Goddard, lleva el corazón con el ojo y la raíz, en homenaje a esa estampa.'),
 P('Letra capital de tres líneas al comienzo de cada capítulo; titulillos que alternan el nombre del libro (páginas pares) y el del capítulo con su emblema (páginas impares); folios con ornamento «· 12 ·»; página de copyright en Palatino, en el tono de cada libro.'),
 P('Nueva página «La trilogía» antes del índice: los tres libros con su faceta (el cómo, el porqué, el quién), destacando el libro que se tiene en la mano.'),
 P('Portadas: tapa y contratapa de cada libro en diseño/portadas (5.5 × 8.5 pulgadas con 0,125 de sangrado, 300 dpi). Las tres tapas llevan los corazones del Cap. 1 en diálogo; las contratapas, la frase de Julián que abre la transición de cada libro, con su grabado, y un espacio libre para el código de barras.'),
 P('Portadillas: el nombre ahora dice JULIÁN BERMÚDEZ; se equilibraron los títulos en dos líneas y el sello ELVERBO pasó al pie. El copyright entra en una sola página.'),
 P('Biografía, Cap. 1: se propone como epígrafe Salmos 8:5, «Le has hecho poco menor que los ángeles, y lo coronaste de gloria y de honra.», porque resuena con «coronados de gloria vivamos» y «yo soy coronado», palabras del propio Julián en ese capítulo. Queda marcado como propuesta hasta que lo confirmes.'),
]
for b in ['receta','pensamiento','biografia']:
    R.append(H2(BOOKN[b]))
    items=[x for x in L if x[0]==b and x[1]=='texto']
    for _,k,o,n,w in items:
        cat=w.split(' ')[0]; extra=w[len(cat):].strip(' ()')
        R+=[P(o,'BodyText','Antes: '),P(n,'BodyText','Ahora: '),P(MOT.get(cat,cat)+((' — '+extra) if extra else ''),'BodyText','Motivo: ',True)]
    sp=[x for x in L if x[0]==b and x[1]=='párrafo']
    if sp: R.append(P(f'{len(sp)} bloques largos se dividieron en puntos de respiración naturales, sin tocar palabras.','BodyText','Párrafos: '))
    gl=[x for x in L if x[0]==b and x[1]=='global']
    if gl: R.append(P('; '.join(f'{x[2]}: {x[3]}' for x in gl)+'.','BodyText','Ajustes automáticos: '))
reg=build('Registro de cambios - Edición integral',R)
# ------------------------------------------------ HOJA 2ª PASADA
def item(n,where,cita,problema,prop=None):
    out=[P(f'{n}. {where} — «{cita}»','BodyText')]
    out.append(P(problema,'BodyText','Duda: '))
    if prop: out.append(P(prop,'BodyText','Propuesta: '))
    return out
H=[H1('Hoja de Revisión para Julián — 2ª pasada'),
 P('Cómo funciona esta hoja: en la edición integral se corrigieron muchas palabras mal transcriptas hacia lo que quisiste decir. Las que quedaron acá son las que solo vos podés confirmar o dictar. Marcá en cada una: ✅ está bien así · ✏️ va la propuesta · 🗣️ dictás vos la frase exacta. Lo que marques se aplica en la próxima pasada.','FirstParagraph'),
 H2('A. Corregidas en esta pasada hacia lo que quisiste decir (confirmá)')]
n=1
A=[('Biografía, Cap. 2','Y bueno, yo era una de esas personas que le ponía mucho drama.','Decía «que le hacía quitar mucho drama», que da vuelta el sentido de lo que venías contando (que exagerabas los problemas).','¿La palabra exacta es «le ponía», «le metía» u otra?'),
('Biografía, Cap. 2','Estaba tan mal que llegué a pesar 148 kilos.','Decía «Es una ciudad tan mal», que era ruido de la transcripción.','Dictá la frase exacta si era otra.'),
('Biografía, Cap. 2','Yo era el centro de conversación de todos los allegados de mi familia','Decía «afados».','¿«Allegados» o «lados»?'),
('Biografía, Cap. 3','Imaginaba mentalmente mis miedos; por eso mis imágenes mentales eran así: si me ofrecían irme a la costa…','Decía «Imagín mental mis miedos, por eso mis imágenes mentales eran metiéndome».',None),
('Biografía, Cap. 3','Prometiéndome que iba a bajar de peso… y no podía cumplir esa promesa.','Había un arranque doble («Permitiéndome que me iba a tomar…»); se unificó en una sola frase con tus palabras.',None),
('Biografía, Cap. 1','¿Y una persona que es famosa? ¿No dice de sí misma: «yo gano dinero por ir»?','Hoja 1ª pasada, punto 13: se leyó como pregunta retórica (la persona famosa SÍ lo dice).',None),
('Biografía, Cap. 1','A mí me gusta ser previsible en las dos.','Decía «A mí me gustan las dos ser previsible» (Hoja 1ª pasada, punto 14).',None),
('Pensamiento, Cap. 1','solamente que creas que no va a suceder porque el libre albedrío de ese otro lo va a impedir','Decía «el libro de Dr. Dre y ese otro»: se leyó como «el libre albedrío».',None),
('Pensamiento, Cap. 3','seguir hablando de las cosas mías negativas, y de las cosas negativas del mundo','Decía «de las cosas ni negativas, sino de las cosas negativas del mundo». Vos mismo lo resumís después: «los ejemplos propios negativos… o los del mundo».',None),
('Pensamiento, Cap. 0','lo que hicieron Biro y Meyne','Decía «Biro y May»: Ladislao Biro y Juan Jorge Meyne, los inventores de la birome.',None),
('Receta, Cap. 4','con una tanza chiquita de mojarrita, de pejerrey, de un bagre','Decía «de moscaerita de pez».',None),
('Receta, Cap. 4','a ese pez le gusta la lombriz canadiense, o al otro pez le gusta el bofe','Decía «el boce».',None),
('Receta, Cap. 1','la cantidad de veces que uno va agachando la cabeza frente a un montón de informaciones','Decía «echando la cabeza».',None),
('Receta, Cap. 1','la lectura de la borra del café','Decía «la bola de café».',None),
('Receta, Cap. 3','Pero tu mente te va a decir: «pero no, no le hicimos el trabajo».','Decía «tu mente no te va a decir», que contradice lo que sigue («Pero vos le vas a decir…»).',None),
('Receta, Cap. 3','Entonces, ya el hecho de hacerlo ahora…','Decía «ya el derecho a hacerlo ahora».',None),
('Receta, Cap. 3','«me siento verdaderamente amada»','Decía «me siento verdadera amante amada».',None),]
for w,c,p,pr in A: H+=item(n,w,c,p,pr); n+=1
H.append(H2('B. Pendientes que solo vos podés dictar'))
Bq=[('Biografía, Cap. 1','Entonces yo no sabía que no importaba si creía o no','¿Quisiste decir que ya sabías que no importaba creerlo («yo sabía que no importaba»)? Justo antes contás que el conocimiento era más fuerte que tu propia duda.'),
('Biografía, Cap. 1','Han pasado muchas cosas enigmáticas, locas y el mundo impresionante que me dejaron extremadamente posicionado.','La frase quedó cortada en la transcripción.'),
('Biografía, Cap. 1','No seguidores nuevos.','No queda claro qué quisiste decir entre «no le daba bola a Facebook» y el ejercicio.'),
('Biografía, Cap. 2','una cara de odio, de asco absolutamente fuerte, que no la puedo ni modificar','¿«Que no la puedo ni olvidar»?'),
('Biografía, Cap. 3','que estos culotes nunca, jamás, podían venir','¿«Que estos kilos nunca, jamás, podían volver»?'),
('Biografía y Pensamiento (Shelleyar)','estás topita, estás muy flaco, te felicito','«Topita» puede estar mal transcripto.'),
('Biografía y Pensamiento (Shelleyar)','me pegó lo que estaba diciendo, lo que estaba escuchando y decía que salgo','El final de la frase se perdió en la transcripción.'),
('Pensamiento, Cap. 0','una imagen de algo que reluzca la escritura','¿«Que produzca» o «reproduzca la escritura»?'),
('Pensamiento, Cap. 1','cuando me encontré con él, el conectivo fue hecho','¿«El cometido fue hecho»?'),
('Pensamiento, Cap. 1','El verbo está en el lugar de querer, su prestado.','«Su prestado» puede ser un error de transcripción.'),
('Pensamiento, Cap. 3','se materializó mi conversación de actuar el pasado','¿«De contar el pasado»?'),
('Pensamiento, Cap. 3','como Jucker Rocky','¿«Como Joker, Rocky»? ¿Otro personaje?'),
('Pensamiento, Cap. 3','Ahí donde la planta, te dice: «eso te daré».','¿Citás Josué 1:3 («todo lugar que pisare la planta de vuestro pie»)? Si es así, podría ir completo, o incluso ser el epígrafe del capítulo.'),
('Pensamiento, Cap. 4','la calculadora del celular te sacude la vía','¿«Te soluciona la vida»?'),
('Pensamiento, Cap. 4','están bajados en línea por inteligencia artificial','¿«Están hechos por inteligencia artificial»?'),
('Pensamiento, Cap. 6','una especie de hitismo mental','«Hitismo» no es una palabra conocida; dictá la correcta.'),
('Pensamiento, Cap. 6','si la pudiésemos hasta perder','Frase dudosa.'),
('Pensamiento, Cap. 6','que todos los ojos paran','¿«Que todos los ojos lo miran»?'),
('Receta, Cap. 1','hasta poder desgrabar esas charlas','¿«Desgranar»?'),
('Receta, Cap. 2','estoy haciendo estresado y tengo un montón de mercadería por todas las…','El ejemplo de conversación quedó cortado.'),
('Receta, Cap. 3','de 4 a 6 tengo que ponerme mi guitarra para conseguir mi deseo','¿Era «guitarra» u otra palabra (¿«a meditar»?)?'),
('Receta, Cap. 4','la agradable fragancia de Genicó','¿«De Génesis» («olor grato», Génesis 8:21) u otra cita?'),
('Receta, Cap. 4','El ciclo bíblico que habla de una yegua','¿«El pasaje bíblico»?'),
('Receta, Cap. 4','Como dice la ley de Darcy','Confirmá el nombre de la ley.'),
('Receta, Cap. 5','te olvidaste de tus cuentas, te olvidaste de tu tacto','¿«De tu cuerpo»?'),
('Receta, Cap. 5','Centrándote, la conciencia es lo único que, para mí, es el poder de concentración.','«Centrándote» puede ser «concentrándote».'),
('Receta, Cap. 5','una de las cosas que entendí, que me dejó bastante hilo','¿«Bastante tranquilo»?'),]
for w,c,p in Bq: H+=item(n,w,c,p); n+=1
H.append(H2('C. De la 1ª pasada, siguen esperando tu palabra'))
C_=[('Receta, Cap. 2 — epígrafe','Y seréis como Dios, conociendo el bien y el mal. (Génesis 3:5)','En la Biblia la dice la serpiente. ¿La sostenés sabiendo eso o preferís otro versículo?'),
('Receta, Cap. 2 y Pensamiento, Cap. 2','lo convencés, o realmente lográs por medio de esas imágenes confundirlo','Puede leerse como «engañar a Dios». ¿Es exactamente lo que querés decir?'),
('Receta, Cap. 1','tu fe, tu poder verdaderamente está completamente prostituido','Palabra fuerte, impresa puede leerse como juicio al lector. ¿La sostenés?'),
('Receta, Cap. 0','Cuantas más cosas vas consiguiendo porque vas al mundo interior, menos vas al mundo interior después','¿Es una advertencia? Si lo es, una palabra tuya la haría inconfundible.'),
('Pensamiento, Cap. 1','el acto psicológico, en realidad es casi sexual','¿Lo dejamos con tu aclaración después, o la adelantamos?'),
('Pensamiento, Cap. 0','lo que ya está creado por el uno por ciento','¿«El uno por ciento» son los que crean e inventan, o la élite económica?'),]
for w,c,p in C_: H+=item(n,w,c,p); n+=1
H.append(H2('D. Decisiones de estructura y epígrafes para confirmar'))
D=[('Pensamiento','Nuevo orden de capítulos','0 La Palabra · 1 Libertad Interna · 2 El Observador Eterno · 3 Conversaciones Sinceras · 4 La Inteligencia Natural · 5 Arquetipos · 6 Atravesar el Tiempo, para que cada capítulo dialogue con el mismo número de Receta y Biografía.'),
('Biografía, Cap. 1','Epígrafe propuesto: Salmos 8:5','«Le has hecho poco menor que los ángeles, y lo coronaste de gloria y de honra.» Resuena con «coronados de gloria vivamos» y «yo soy coronado».'),
('Varios','Epígrafes marcados como propuestos','Génesis 1:2 (Biografía, Cap. 2), Malaquías 3:10 (Biografía, Cap. 3), Daniel 7:9 (Pensamiento, Cap. 2), Juan 8:32 (Pensamiento, Cap. 3), Mateo 4:4 (Pensamiento, Cap. 4), Juan 14:6 (Pensamiento, Cap. 5), 2 Corintios 6:2, Mateo 4:19 y Mateo 25:4 (Receta, Cap. 3, 4 y 5).'),
('Pensamiento, Cap. 2','Apertura del Observador','El capítulo abría con «No se puede forzar porque…» sin decir qué. Se antepuso tu propia frase de Receta, Cap. 2: «No se puede forzar este saber que soy consciente de tener mucho dinero…».'),
('Pensamiento','Pasajes movidos','El déjà vu, el tarot y «los brujos, los adivinos, los magos» pasaron a Arquetipos; «¿Existe alguna diferencia entre imaginar y recordar?» cierra El Observador Eterno. Así, Atravesar el Tiempo termina en «mientras iban, fueron sanados».'),]
for w,c,p in D: H+=item(n,w,c,p); n+=1
H.append(P('Preparada por el equipo editorial · ELVERBO · Nada de esta hoja cambia los manuscritos hasta que Julián confirme cada punto.','FirstParagraph',italic=True))
hoja=build('Hoja de Revisión para Julián (2ª pasada)',H)
print(reg); print(hoja)
