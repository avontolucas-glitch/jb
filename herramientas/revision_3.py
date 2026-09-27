"""
Revisión 3 de la trilogía: aplica las correcciones de texto aprobadas
(herramientas/revision3_datos.py) y los arreglos de maqueta de la revisión
completa, sobre la versión «(edición integral con sitio, sin colofón, apertura
limpia)», y escribe al lado:
  · «<libro> (edición integral con sitio, revisión 3).docx» (sin colofón, con la
    apertura limpia, y en la Receta con la portada negra);
  · «Hoja de Revisión para Julián (3ª pasada).docx»;
  · «Registro de cambios - Revisión 3.docx».

Arreglos de maqueta:
  · Pensamiento: la página de texto que sigue a la divisoria negra ya no repite
    el título del capítulo arriba (la divisoria es su propia sección, sin
    encabezado ni folio, que en gris sobre negro no se leía).
  · Las rayas de inciso quedan pegadas a su palabra (un carácter de unión
    invisible): nunca más una raya sola al principio o al final de una línea.
  · «Capítulo 6», «Cap. 2»: el número no se separa de la palabra.
  · Los títulos largos de apertura de la Receta se cortan en dos líneas parejas.
  · La tabla «La trilogía, capítulo a capítulo»: los rótulos de dos líneas ya no
    se pisan, y las celdas vacías llevan «—» como en el mapa.
  · Los ISBN de relleno pasan a «[a definir]» (no pueden llegar a imprenta).
  · Biografía: fuera el párrafo vacío en medio del Cap. 1.
Uso:  python3 herramientas/revision_3.py
"""
import copy, os, re, sys, zipfile
from lxml import etree

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from revision3_datos import CORRECCIONES, HOJA

RAIZ = os.path.dirname(AQUI)
MS = os.path.join(RAIZ, 'manuscritos')
BASE = 'edición integral con sitio, sin colofón, apertura limpia'
SALIDA = 'edición integral con sitio, revisión 3'
LIBROS = {'receta': 'Receta de La Manifestación', 'pensamiento': 'El Pensamiento es Tu Fe', 'biografia': 'La Biografía'}
NOMBRE = {'receta': 'La Receta de la Manifestación', 'pensamiento': 'El Pensamiento es Tu Fe', 'biografia': 'La Biografía', 'los tres': 'Los tres libros'}
W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
q = lambda t: f'{{{W}}}{t}'
UNION = '⁠'   # word joiner: une sin espacio y no se ve
NBSP = ' '


def texto(e):
    return ''.join(t.text or '' for t in e.iter(q('t')))


def reemplazar(p, original, corregido):
    """Cambia un fragmento del párrafo aunque esté repartido en varios tramos (w:t); el formato queda el del primero."""
    ts = [t for t in p.iter(q('t'))]
    completo = ''.join(t.text or '' for t in ts)
    i = completo.find(original)
    if i < 0:
        return 'ya' if corregido in completo else 'no'
    fin = i + len(original)
    pos = 0
    puesto = False
    for t in ts:
        s = t.text or ''
        a, b = pos, pos + len(s)
        pos = b
        if b <= i or a >= fin:
            continue
        ini_local, fin_local = max(i, a) - a, min(fin, b) - a
        nuevo = s[:ini_local] + ('' if puesto else corregido) + s[fin_local:]
        puesto = True
        t.text = nuevo
        t.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    return 'ok'


def unir_rayas(p):
    """La raya de apertura se pega a la palabra que sigue y la de cierre a la anterior."""
    n = 0
    for t in p.iter(q('t')):
        s = t.text or ''
        if '—' not in s:
            continue
        s2 = re.sub(r'(^|\s)—(?=\S)(?!' + UNION + ')', lambda m: m.group(1) + '—' + UNION, s)                 # apertura
        s2 = re.sub(r'(?<=[^\s' + UNION + '])—(?=[\s,.;:!?»)]|$)', UNION + '—', s2)                           # cierre
        if s2 != s:
            n += 1
            t.text = s2
            t.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    return n


def sect_de(p):
    ppr = p.find(q('pPr'))
    return ppr.find(q('sectPr')) if ppr is not None else None


def poner_sect(p, s):
    ppr = p.find(q('pPr'))
    if ppr is None:
        ppr = etree.Element(q('pPr'))
        p.insert(0, ppr)
    cambio = ppr.find(q('pPrChange'))
    (cambio.addprevious(s) if cambio is not None else ppr.append(s))


def sacar(ppr, tag):
    x = ppr.find(q(tag)) if ppr is not None else None
    if x is not None:
        ppr.remove(x)
        return True
    return False


def divisorias_propias(hijos, tx, rid, cambios):
    """Pensamiento: cada divisoria negra, su propia sección (sin encabezado ni folio); el texto del capítulo empieza en página nueva sin encabezado."""
    caps = [i for i, t in enumerate(tx) if re.fullmatch(r'CAPÍTULO \d', t.strip())]
    for c in caps:
        # la sección del capítulo: la que termina en el primer corte después de la apertura
        fin = next(i for i in range(c, len(hijos)) if hijos[i].tag == q('p') and sect_de(hijos[i]) is not None)
        s = sect_de(hijos[fin])
        cab = {x.get(q('type')): x.get(f'{{{R}}}id') for x in s.findall(q('headerReference'))}
        if 'first' not in cab:
            continue                                  # no es un capítulo (transición)
        texto_ini = next((i for i in range(c + 1, fin) if hijos[i].tag == q('p') and hijos[i].find(f'{q("pPr")}/{q("pageBreakBefore")}') is not None), None)
        if texto_ini is None:
            continue                                  # la apertura y el texto comparten página (Receta, Biografía)
        div = etree.Element(q('sectPr'))
        for tipo in ('default', 'even'):
            etree.SubElement(div, q('headerReference'), {q('type'): tipo, f'{{{R}}}id': rid['headerJBvacio.xml']})
        for tipo in ('default', 'even'):
            etree.SubElement(div, q('footerReference'), {q('type'): tipo, f'{{{R}}}id': rid['footerJBvacio.xml']})
        for t in ('pgSz', 'pgMar'):
            div.append(copy.deepcopy(s.find(q(t))))
        num = s.find(q('pgNumType'))
        if num is not None:                            # el folio 1 empieza en la divisoria del Cap. 0
            s.remove(num)
            div.append(num)
        etree.SubElement(div, q('cols'), {q('space'): '720'})
        poner_sect(hijos[texto_ini - 1], div)
        sacar(hijos[texto_ini].find(q('pPr')), 'pageBreakBefore')
        cambios.append(f'divisoria del {tx[c].strip().lower()}: su propia sección; el texto empieza sin encabezado')


def partir_titulo(p, antes, despues):
    """Un título de apertura en dos líneas parejas: «DOS FORMATOS» / «DE LA MENTE»."""
    r = p.find(q('r'))
    t = r.find(q('t'))
    if (t.text or '').strip() != f'{antes} {despues}':
        return False
    t.text = antes
    br = etree.SubElement(r, q('br'))
    t2 = etree.SubElement(r, q('t'))
    t2.text = despues
    return True


TITULOS = {'DOS FORMATOS DE LA MENTE': ('DOS FORMATOS', 'DE LA MENTE'),
           'EL SENTIMIENTO CREA LA REALIDAD': ('EL SENTIMIENTO', 'CREA LA REALIDAD'),
           'CONOCEDORES DEL BIEN Y EL MAL': ('CONOCEDORES', 'DEL BIEN Y EL MAL')}


def procesar(k, nombre, registro):
    origen = os.path.join(MS, f'{nombre} ({BASE}).docx')
    destino = os.path.join(MS, f'{nombre} ({SALIDA}).docx')
    with zipfile.ZipFile(origen) as z:
        infos = z.infolist()
        partes = {i.filename: z.read(i.filename) for i in infos}
    rid = {t: i for i, t in re.findall(r'Id="([^"]+)"[^>]*Target="([^"]+)"', partes['word/_rels/document.xml.rels'].decode())}
    raiz = etree.fromstring(partes['word/document.xml'])
    body = raiz.find(q('body'))
    hijos = [e for e in body if e.tag in (q('p'), q('tbl'))]
    tx = [texto(e) for e in hijos]
    cambios = []

    # 1) las correcciones de texto (por ¶ de la versión base)
    for c in [c for c in CORRECCIONES if c['libro'] == k]:
        p = hijos[c['parrafo']]
        r = reemplazar(p, c['original'], c['corregido'])
        assert r != 'no', f'{k} ¶{c["parrafo"]}: no encontré «{c["original"][:50]}»'
        if r == 'ok':
            registro.append((k, c['parrafo'], tx[c['parrafo']], c['original'], c['corregido'], c['motivo']))

    # 2) ISBN de relleno
    for p in hijos:
        for t in p.iter(q('t')):
            if t.text and re.search(r'ISBN-1[03]: 3{10,13}', t.text):
                t.text = re.sub(r'3{10,13}', '[a definir]', t.text)
                cambios.append('ISBN de relleno → [a definir]')

    # 3) rayas pegadas a su palabra; «Capítulo 6» sin corte
    n_rayas = sum(unir_rayas(p) for p in hijos)
    for p in hijos:
        for t in p.iter(q('t')):
            if t.text and re.search(r'\b(Capítulo|Cap\.) \d', t.text):
                t.text = re.sub(r'\b(Capítulo|Cap\.) (\d)', lambda m: m.group(1) + NBSP + m.group(2), t.text)
    cambios.append(f'rayas unidas a su palabra en {n_rayas} tramos')

    # 4) títulos de apertura largos, en dos líneas parejas (Receta)
    for i, t in enumerate(tx):
        if re.fullmatch(r'CAPÍTULO \d', t.strip()) and i + 1 < len(hijos):
            titulo = tx[i + 1].strip()
            if titulo in TITULOS and partir_titulo(hijos[i + 1], *TITULOS[titulo]):
                cambios.append(f'título «{titulo}» en dos líneas')

    # 5) la tabla final: rótulos que no se pisan y celdas vacías con «—»
    for tbl in [e for e in hijos if e.tag == q('tbl')]:
        if 'CAPÍTULO' not in texto(tbl) and 'LA PALABRA' not in texto(tbl):
            continue
        for p in tbl.iter(q('p')):
            sp = p.find(f'{q("pPr")}/{q("spacing")}')
            if sp is not None and sp.get(q('line')) == '220':
                sp.set(q('line'), '264')
            for t in p.iter(q('t')):
                if (t.text or '').strip() == '·':
                    t.text = '—'
        cambios.append('tabla de la trilogía: interlineado de los rótulos y celdas vacías')

    # 6) Pensamiento: la divisoria, su propia sección
    if k == 'pensamiento':
        divisorias_propias(hijos, tx, rid, cambios)

    # 7) Biografía: el párrafo vacío en medio del Cap. 1 (¶77)
    if k == 'biografia':
        p = hijos[77]
        assert not tx[77].strip() and tx[76].strip() and tx[78].strip() and sect_de(p) is None and p.find(f'.//{q("drawing")}') is None
        body.remove(p)
        cambios.append('párrafo vacío en medio del Cap. 1 (¶77), fuera')

    partes['word/document.xml'] = etree.tostring(raiz, xml_declaration=True, encoding='UTF-8', standalone=True)
    with zipfile.ZipFile(destino, 'w', zipfile.ZIP_DEFLATED) as out:
        for i in infos:
            out.writestr(i, partes[i.filename])
    return destino, cambios


# ───────── la Hoja (3ª pasada) y el Registro: con los estilos de la Hoja de la 2ª pasada

def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def par(texto_, estilo='BodyText', negrita=None, italica=False):
    runs = f'<w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">{esc(negrita)}</w:t></w:r>' if negrita else ''
    runs += f'<w:r>{"<w:rPr><w:i/></w:rPr>" if italica else ""}<w:t xml:space="preserve">{esc(texto_)}</w:t></w:r>'
    return f'<w:p><w:pPr><w:pStyle w:val="{estilo}"/></w:pPr>{runs}</w:p>'


def documento(nombre, parrafos):
    plantilla = os.path.join(MS, 'Hoja de Revisión para Julián (2ª pasada).docx')
    destino = os.path.join(MS, nombre)
    with zipfile.ZipFile(plantilla) as z:
        infos = z.infolist()
        partes = {i.filename: z.read(i.filename) for i in infos}
    x = partes['word/document.xml'].decode('utf-8')
    sect = re.search(r'<w:sectPr.*?</w:sectPr>|<w:sectPr/>', x, re.S).group(0)
    x = re.sub(r'<w:body>.*</w:body>', lambda _: '<w:body>' + ''.join(parrafos) + sect + '</w:body>', x, flags=re.S)
    partes['word/document.xml'] = x.encode('utf-8')
    with zipfile.ZipFile(destino, 'w', zipfile.ZIP_DEFLATED) as out:
        for i in infos:
            out.writestr(i, partes[i.filename])
    return destino


def ubicacion(libro, parrafo, tx_por_libro):
    if not parrafo:
        return NOMBRE[libro]
    cap = 'páginas iniciales'
    for i in range(parrafo, -1, -1):
        m = re.fullmatch(r'CAPÍTULO (\d)', tx_por_libro[libro][i].strip())
        if m:
            cap = f'Cap. {m.group(1)}'
            break
    return f'{NOMBRE[libro]}, {cap}'


if __name__ == '__main__':
    registro = []
    tx_por_libro = {}
    for k, n in LIBROS.items():
        with zipfile.ZipFile(os.path.join(MS, f'{n} ({BASE}).docx')) as z:
            b = etree.fromstring(z.read('word/document.xml')).find(q('body'))
            tx_por_libro[k] = [texto(e) for e in b if e.tag in (q('p'), q('tbl'))]
        d, c = procesar(k, n, registro)
        print(os.path.basename(d))
        for x in dict.fromkeys(c):
            print('  ', x)

    julian = [h for h in HOJA if not h.get('editorial')]
    lucas = [h for h in HOJA if h.get('editorial')]
    H = [par('Hoja de Revisión para Julián — 3ª pasada', 'Heading1'),
         par('Cómo funciona esta hoja: en la revisión completa de los tres libros se corrigieron los errores evidentes (están en el Registro de cambios - Revisión 3). Acá quedan las dudas que solo vos podés resolver, porque dependen de lo que quisiste decir. Marcá en cada una: ✅ queda así · ✏️ va la propuesta · 🗣️ dictás vos la frase exacta.', 'FirstParagraph'),
         par('A. Para Julián: lo que quisiste decir', 'Heading2')]
    for i, h in enumerate(julian, 1):
        H.append(par(f'{i}. {ubicacion(h["libro"], h["parrafo"], tx_por_libro)} — «{h["original"]}»', 'BodyText'))
        H.append(par(h['pregunta'], 'BodyText', negrita='   Duda: '))
        if h.get('propuesta') and h['propuesta'] != h['original']:
            H.append(par(f'«{h["propuesta"]}»', 'BodyText', negrita='   Propuesta: '))
    H.append(par('B. Para Lucas: pendientes editoriales', 'Heading2'))
    for i, h in enumerate(lucas, 1):
        H.append(par(f'{i}. {ubicacion(h["libro"], h["parrafo"], tx_por_libro)} — {h["pregunta"].replace("(Para Lucas) ", "").replace("(Para Lucas/editorial) ", "")}', 'BodyText'))
    H.append(par('C. Contratapa: datos a confirmar antes de imprimir', 'Heading2'))
    for s in ['El año del premio (2021) y el nombre exacto del programa, «El Gran Premio de la Cocina»: salen de fuentes públicas; el libro solo dice «el premio de la cocina».',
              'Que la contratapa te presente «en la línea de Neville Goddard».',
              'Que la contratapa cuente que llegaste a la cocina buscando un oficio que no te pidiera títulos (lo contás vos en la Biografía, Cap. 0; en la contratapa queda más a la vista).']:
        H.append(par(s, 'BodyText'))
    print(os.path.basename(documento('Hoja de Revisión para Julián (3ª pasada).docx', H)), len(julian), 'para Julián,', len(lucas), 'para Lucas')

    G = [par('Registro de cambios — Revisión 3', 'Heading1'),
         par('Correcciones de la revisión completa de los tres libros: cada una con su antes, su ahora y el motivo. Solo lo evidente (transcripción, tipeo, tildes, puntuación, concordancia y citas bíblicas en la RVR1960); lo que depende de lo que quiso decir Julián está en la Hoja de Revisión (3ª pasada). Además, arreglos de maqueta sin tocar el texto: la página que sigue a la divisoria en Pensamiento sin el título repetido arriba, las rayas pegadas a su palabra, los títulos largos de la Receta en dos líneas parejas, la tabla final y los ISBN de relleno como «[a definir]».', 'FirstParagraph')]
    for k in LIBROS:
        filas = [r for r in registro if r[0] == k]
        if not filas:
            continue
        G.append(par(NOMBRE[k], 'Heading2'))
        for i, (_, p, _, antes, ahora, motivo) in enumerate(filas, 1):
            G.append(par(f'{i}. {ubicacion(k, p, tx_por_libro)}', 'BodyText'))
            G.append(par(f'«{antes}»', 'BodyText', negrita='   Antes: '))
            G.append(par(f'«{ahora}»', 'BodyText', negrita='   Ahora: '))
            G.append(par(motivo, 'BodyText', negrita='   Motivo: '))
    print(os.path.basename(documento('Registro de cambios - Revisión 3.docx', G)), len(registro), 'cambios')
