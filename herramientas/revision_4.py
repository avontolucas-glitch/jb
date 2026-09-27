"""
Revisión 4 de la trilogía: lo esencial de la conferencia en vivo de Julián (audio de
94 minutos, fines de 2022) incorporado a los capítulos que ya existen, más dos
correcciones pedidas por Lucas.

Parte de la revisión 3 («edición integral con sitio, revisión 3») y escribe, al lado,
sin tocarla:
  - «… (edición integral con sitio, revisión 4).docx» ×3
  - «Hoja de Revisión para Julián (4ª pasada).docx»: las dudas de la 3ª que siguen
    abiertas y las nuevas (lo del audio que solo Julián puede confirmar).
  - «Registro de cambios - Revisión 4.docx»: cada párrafo agregado (de qué minuto del
    audio sale, dónde va y por qué) y cada corrección, con su antes y su ahora.

Los fragmentos del audio están en revision4_audio.json (limpios en Modo 1 y ubicados
por ¶ de la revisión 3, con las primeras palabras del párrafo de anclaje para
comprobar que el lugar es el que se eligió); las correcciones y la Hoja nueva, en
revision4_datos.py.
"""
import copy, json, os, re, sys, zipfile
from lxml import etree

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import revision_3 as r3
import respiro
from revision3_datos import HOJA as HOJA3
from revision4_datos import CORRECCIONES, HOJA_NUEVA, RESUELTAS

MS = r3.MS
BASE = 'edición integral con sitio, revisión 3'
SALIDA = 'edición integral con sitio, revisión 4'
LIBROS, NOMBRE, q, texto, par, documento = r3.LIBROS, r3.NOMBRE, r3.q, r3.texto, r3.par, r3.documento
FRAGMENTOS = json.load(open(os.path.join(AQUI, 'revision4_audio.json'), encoding='utf-8'))
RESPIRO = json.load(open(os.path.join(AQUI, 'revision4_respiro.json'), encoding='utf-8'))
# para probar sin tocar manuscritos/: R4_PRUEBA=<carpeta> escribe ahí solo los tres libros
PRUEBA = os.environ.get('R4_PRUEBA')


def normal(s):
    return re.sub(r'\s+', ' ', s.replace(r3.UNION, '').replace(r3.NBSP, ' ')).strip()


def es_cierre(e):
    return texto(e).strip() == '◆ ◆ ◆'


def nuevo_parrafo(modelo, texto_):
    """Un párrafo de cuerpo con el formato del párrafo de anclaje (sin «mantener con el siguiente»)."""
    p = etree.Element(q('p'))
    ppr = copy.deepcopy(modelo.find(q('pPr')))
    r3.sacar(ppr, 'keepNext')
    p.append(ppr)
    run0 = next(iter(modelo.iter(q('r'))))
    r = etree.SubElement(p, q('r'))
    rpr = copy.deepcopy(run0.find(q('rPr')))
    for tag in ('i', 'iCs', 'b', 'bCs'):
        r3.sacar(rpr, tag)
    r.append(rpr)
    t = etree.SubElement(r, q('t'))
    t.text = re.sub(r'\b(Capítulo|Cap\.) (\d)', lambda m: m.group(1) + r3.NBSP + m.group(2), texto_)
    t.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    r3.unir_rayas(p)
    return p


def procesar(k, nombre, registro, agregados, respiros):
    origen = os.path.join(MS, f'{nombre} ({BASE}).docx')
    destino = os.path.join(PRUEBA or MS, f'{nombre} ({SALIDA}).docx')
    with zipfile.ZipFile(origen) as z:
        infos = z.infolist()
        partes = {i.filename: z.read(i.filename) for i in infos}
    raiz = etree.fromstring(partes['word/document.xml'])
    body = raiz.find(q('body'))
    hijos = [e for e in body if e.tag in (q('p'), q('tbl'))]
    tx = [texto(e) for e in hijos]

    # 1) correcciones (por ¶ de la revisión 3)
    for c in [c for c in CORRECCIONES if c['libro'] == k]:
        r = r3.reemplazar(hijos[c['parrafo']], c['original'], c['corregido'])
        assert r != 'no', f'{k} ¶{c["parrafo"]}: no encontré «{c["original"]}»'
        if r == 'ok':
            registro.append((k, c['parrafo'], c['original'], c['corregido'], c['motivo']))

    # 2) lo del audio: de atrás para adelante, así los ¶ de la revisión 3 siguen valiendo
    frs = [f for f in FRAGMENTOS if f['libro'] == k]
    for n in sorted({f['despues_de'] for f in frs}, reverse=True):
        ancla = hijos[n]
        grupo = [f for f in frs if f['despues_de'] == n]
        for f in grupo:
            assert normal(tx[n]).startswith(normal(f['ancla'])), f'{k} ¶{n}: el ancla no coincide: «{f["ancla"]}» / «{tx[n][:80]}»'
        ppr = ancla.find(q('pPr'))
        assert ppr is not None and ppr.find(q('sectPr')) is None and ancla.find('.//' + q('framePr')) is None, f'{k} ¶{n}: no es un párrafo de cuerpo'
        cuerpo = lambda e: e.tag == q('p') and e.find(f'{q("pPr")}/{q("jc")}') is not None and e.find(f'{q("pPr")}/{q("jc")}').get(q('val')) == 'both'
        # después de una nota de puente (va centrada, más chica): el formato lo da el párrafo de cuerpo de antes
        modelo = ancla
        if not cuerpo(ancla):
            assert tx[n].strip().startswith('Este mismo'), f'{k} ¶{n}: no es un párrafo de cuerpo (justificado) ni una nota de puente'
            modelo = next(hijos[i] for i in range(n - 1, 0, -1) if cuerpo(hijos[i]))
        nuevos = [nuevo_parrafo(modelo, t) for f in grupo for t in f['parrafos']]
        # el cierre ◆ ◆ ◆ va pegado al último párrafo: si se agrega al final del capítulo, lo sigue pegado
        if n + 1 < len(hijos) and es_cierre(hijos[n + 1]) and r3.sacar(ppr, 'keepNext'):
            npr = nuevos[-1].find(q('pPr'))
            npr.insert(0, etree.Element(q('keepNext')))
        punto = ancla
        for p in nuevos:
            punto.addnext(p)
            punto = p
        for f in grupo:
            agregados.append((k, n, f))

    # 3) las páginas de respiro (lo que Julián escribió en THE CHANNEL), al final de sus capítulos
    for n, palabras in respiro.agregar(k, raiz, partes, RESPIRO):
        respiros.append((k, n, next(p for p in RESPIRO if p['libro'] == k and p['capitulo'] == n)))

    partes['word/document.xml'] = etree.tostring(raiz, xml_declaration=True, encoding='UTF-8', standalone=True)
    ct = partes['[Content_Types].xml'].decode('utf-8')
    if 'Extension="jpg"' not in ct:
        partes['[Content_Types].xml'] = ct.replace('<Default ', '<Default Extension="jpg" ContentType="image/jpeg"/><Default ', 1).encode('utf-8')
    nombres = [i.filename for i in infos]
    with zipfile.ZipFile(destino, 'w', zipfile.ZIP_DEFLATED) as out:
        for i in infos:
            out.writestr(i, partes[i.filename])
        for f, datos in partes.items():
            if f not in nombres:
                out.writestr(f, datos)
    return destino, tx


if __name__ == '__main__':
    registro, agregados, respiros, tx_por_libro = [], [], [], {}
    for k, n in LIBROS.items():
        d, tx = procesar(k, n, registro, agregados, respiros)
        tx_por_libro[k] = tx
        palabras = sum(len(t.split()) for (kk, _, f) in agregados if kk == k for t in f['parrafos'])
        print(os.path.basename(d), '·', sum(1 for a in agregados if a[0] == k), 'fragmentos,', palabras, 'palabras ·', sum(1 for r in respiros if r[0] == k), 'páginas de respiro')
    if PRUEBA:
        sys.exit(0)

    ubic = lambda k, p: r3.ubicacion(k, p, tx_por_libro)

    # ── la Hoja (4ª pasada): las de la 3ª que siguen abiertas + las nuevas
    abiertas = [h for h in HOJA3 if h['original'] not in RESUELTAS]
    julian = [h for h in abiertas if not h.get('editorial')] + [h for h in HOJA_NUEVA if not h.get('editorial')]
    lucas = [h for h in abiertas if h.get('editorial')] + [h for h in HOJA_NUEVA if h.get('editorial')]
    H = [par('Hoja de Revisión para Julián — 4ª pasada', 'Heading1'),
         par('Esta hoja reúne todo lo que sigue abierto: las dudas de la 3ª pasada que todavía no se respondieron y las nuevas, que salen de la conferencia en vivo que ahora está en los libros (lo que el reconocimiento de voz no dejó claro). Marcá en cada una: ✅ queda así · ✏️ va la propuesta · 🗣️ dictás vos la frase exacta.', 'FirstParagraph'),
         par('A. Para Julián: lo que quisiste decir', 'Heading2')]
    for i, h in enumerate(julian, 1):
        nueva = ' (nueva)' if h in HOJA_NUEVA else ''
        H.append(par(f'{i}. {ubic(h["libro"], h["parrafo"])}{nueva} — «{h["original"]}»', 'BodyText'))
        H.append(par(h['pregunta'], 'BodyText', negrita='   Duda: '))
        if h.get('propuesta') and h['propuesta'] != h['original']:
            H.append(par(f'«{h["propuesta"]}»', 'BodyText', negrita='   Propuesta: '))
    H.append(par('B. Para Lucas: pendientes editoriales', 'Heading2'))
    for i, h in enumerate(lucas, 1):
        pregunta = re.sub(r"^\(Para Lucas[^)]*\) ", "", h["pregunta"])
        H.append(par(f'{i}. {ubic(h["libro"], h["parrafo"])} — {pregunta}', 'BodyText'))
    print(os.path.basename(documento('Hoja de Revisión para Julián (4ª pasada).docx', H)), len(julian), 'para Julián,', len(lucas), 'para Lucas')

    # ── el Registro
    G = [par('Registro de cambios — Revisión 4', 'Heading1'),
         par('Lo esencial de la conferencia en vivo de Julián (audio de 94 minutos, fines de 2022), incorporado a los capítulos que ya existían; no se abrió ningún capítulo nuevo. Se dejó afuera lo que ya estaba en los libros, las preguntas del público y lo que les contestó a cada uno, los saludos y los problemas de la transmisión, y lo que era solo de esa semana. El texto es el de Julián, limpio en Modo 1: sin agregar palabras, ideas ni transiciones. Cada párrafo nuevo con el minuto del audio del que sale. Al final, las correcciones puntuales.', 'FirstParagraph')]
    for k in LIBROS:
        filas = sorted([a for a in agregados if a[0] == k], key=lambda a: a[1])
        if not filas:
            continue
        G.append(par(f'{NOMBRE[k]}: lo que se agregó', 'Heading2'))
        for i, (_, n, f) in enumerate(filas, 1):
            G.append(par(f'{i}. {ubic(k, n)}, después del párrafo que empieza «{normal(tx_por_libro[k][n])[:70]}…» (audio, {f["desde"]} a {f["hasta"]})', 'BodyText'))
            for t in f['parrafos']:
                G.append(par(t, 'BodyText', italica=True))
            G.append(par(f['motivo'], 'BodyText', negrita='   Por qué ahí: '))
    if respiros:
        G.append(par('Páginas de respiro: lo que Julián escribió en THE CHANNEL', 'Heading2'))
        G.append(par('Textos que Julián escribió en sus canales de Instagram (no son de sus audios): por eso no van mezclados en los capítulos, que son su obra hablada, sino en una página propia al final del capítulo con el que conversan, con el armado de la página de transición y la firma «JULIÁN BERMÚDEZ · THE CHANNEL». Van como los escribió (con su «tú» de lo escrito); solo se corrigieron tildes, signos de apertura y errores evidentes del teclado. Los originales, en fuentes/canal-de-julian.md.', 'BodyText'))
        for i, (k, n, p) in enumerate(sorted(respiros, key=lambda r: (list(LIBROS).index(r[0]), r[1])), 1):
            G.append(par(f'{i}. {NOMBRE[k]}, al final del Cap. {n}', 'BodyText'))
            G.append(par(p['texto'].replace('\n', ' '), 'BodyText', italica=True))
            if p.get('correcciones'):
                G.append(par('; '.join(p['correcciones']), 'BodyText', negrita='   Correcciones: '))
            G.append(par(p['motivo'], 'BodyText', negrita='   Por qué ahí: '))
    if registro:
        G.append(par('Correcciones', 'Heading2'))
        for i, (k, p, antes, ahora, motivo) in enumerate(registro, 1):
            G.append(par(f'{i}. {ubic(k, p)}', 'BodyText'))
            G.append(par(f'«{antes}»', 'BodyText', negrita='   Antes: '))
            G.append(par(f'«{ahora}»', 'BodyText', negrita='   Ahora: '))
            G.append(par(motivo, 'BodyText', negrita='   Motivo: '))
    print(os.path.basename(documento('Registro de cambios - Revisión 4.docx', G)), len(agregados), 'fragmentos y', len(registro), 'correcciones')
