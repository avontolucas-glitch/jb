"""
Encabezados más simples, para no darle al lector tantos estímulos:
  · en la apertura de cada capítulo, sin encabezado (antes repetía el título
    que está justo abajo);
  · en las páginas de texto, ya no se alternan el título del libro (pares) y el
    del capítulo (impares): queda solo el emblema chico del capítulo, en la
    esquina de afuera. El folio de abajo sigue igual, también en la apertura.

De paso arregla los cortes de sección de los capítulos: eran «continuos» (la
sección empezaba a mitad de la página anterior), y en la Receta y la Biografía
el penúltimo capítulo había quedado dentro de la sección de la transición, sin
encabezado ni folio. Ahora cada capítulo es su propia sección, empieza en
página nueva, y la transición es una sección aparte, sin encabezado ni folio.

Lo mismo en los tres libros. No toca las versiones vigentes: escribe
«(edición integral con sitio, sin colofón, encabezados simples)» al lado
(la Receta parte de la versión con la portada negra).
Uso:  python3 herramientas/encabezados_simples.py
"""
import copy, os, re, zipfile
from lxml import etree

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MS = os.path.join(RAIZ, 'manuscritos')
LIBROS = {
    'Receta de La Manifestación': ('edición integral con sitio, sin colofón, portada negra', 'No podés pescar una ballena'),
    'El Pensamiento es Tu Fe': ('edición integral con sitio, sin colofón', 'Logré atravesar el tiempo con éxito'),
    'La Biografía': ('edición integral con sitio, sin colofón', 'Detrás del que está llorando'),
}
SALIDA = 'edición integral con sitio, sin colofón, encabezados simples'
W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
q = lambda t: f'{{{W}}}{t}'


def texto(e):
    return ''.join(t.text or '' for t in e.iter(q('t'))).strip()


def sin_titulo(xml):
    """Deja en el encabezado solo el emblema: saca los tramos de texto (el título y los espacios)."""
    tramos = re.findall(r'<w:r>(?:(?!</w:r>).)*</w:r>', xml, re.S)
    quitados = [t for t in tramos if '<w:drawing' not in t]
    for t in quitados:
        xml = xml.replace(t, '', 1)
    assert '<w:drawing' in xml and '<w:t' not in xml
    return xml, ''.join(re.findall(r'<w:t[^>]*>([^<]*)</w:t>', ''.join(quitados))).strip()


def sect(plantilla, cabeza, par, pie, primera=None, inicio_folios=False):
    """Un corte de sección en página nueva, con los encabezados y pies dados."""
    s = etree.Element(q('sectPr'))
    for tipo, rid in [('default', cabeza), ('even', par)] + ([('first', primera)] if primera else []):
        etree.SubElement(s, q('headerReference'), {q('type'): tipo, f'{{{R}}}id': rid})
    for tipo in ['default', 'even'] + (['first'] if primera else []):
        etree.SubElement(s, q('footerReference'), {q('type'): tipo, f'{{{R}}}id': pie})
    for t in ('pgSz', 'pgMar'):
        s.append(copy.deepcopy(plantilla.find(q(t))))
    if inicio_folios:
        etree.SubElement(s, q('pgNumType'), {q('start'): '1'})
    etree.SubElement(s, q('cols'), {q('space'): '720'})
    if primera:
        etree.SubElement(s, q('titlePg'))
    return s


def poner_sect(p, s):
    ppr = p.find(q('pPr'))
    if ppr is None:
        ppr = etree.Element(q('pPr'))
        p.insert(0, ppr)
    cambio = ppr.find(q('pPrChange'))
    if cambio is not None:
        cambio.addprevious(s)
    else:
        ppr.append(s)


def sacar_salto(p):
    ppr = p.find(q('pPr'))
    salto = ppr.find(q('pageBreakBefore')) if ppr is not None else None
    assert salto is not None, f'se esperaba un salto de página en «{texto(p)[:40]}»'
    ppr.remove(salto)


def procesar(nombre, version, frase_transicion):
    origen = os.path.join(MS, f'{nombre} ({version}).docx')
    destino = os.path.join(MS, f'{nombre} ({SALIDA}).docx')
    with zipfile.ZipFile(origen) as z:
        infos = z.infolist()
        partes = {i.filename: z.read(i.filename) for i in infos}
    rels = partes['word/_rels/document.xml.rels'].decode('utf-8')
    rid = {t: i for i, t in re.findall(r'Id="([^"]+)"[^>]*Target="([^"]+)"', rels)}
    cambios = []

    # 1) encabezados de las páginas de texto: solo el emblema
    for f in sorted(partes):
        if re.fullmatch(r'word/headerJB(par|impar)\d+\.xml', f):
            xml, titulo = sin_titulo(partes[f].decode('utf-8'))
            partes[f] = xml.encode('utf-8')
            cambios.append(f'{os.path.basename(f)}: sin «{titulo}»')

    # 2) los cortes de sección de los capítulos
    raiz = etree.fromstring(partes['word/document.xml'])
    body = raiz.find(q('body'))
    hijos = [e for e in body if e.tag in (q('p'), q('tbl'))]
    tx = [texto(e) for e in hijos]
    caps = [i for i, t in enumerate(tx) if re.fullmatch(r'CAPÍTULO \d', t)]
    inicios = [i - 1 for i in caps]                    # el párrafo del grabado, con su salto de página
    trans = max(i for i, t in enumerate(tx) if frase_transicion in t and hijos[i].find(f'.//{{*}}anchor') is not None)
    trans_ini = max(i for i in range(trans + 1) if hijos[i].find(f'{q("pPr")}/{q("pageBreakBefore")}') is not None)
    trilogia = tx.index('LA TRILOGÍA, CAPÍTULO A CAPÍTULO')
    ultimo = max(k for k, i in enumerate(inicios) if i < trilogia)
    assert inicios[ultimo] > trans > inicios[ultimo - 1] and trans_ini > inicios[ultimo - 1]

    # los cortes viejos, desde el capítulo 0 hasta la tabla de la trilogía, se sacan
    plantilla = None
    for e in hijos[inicios[0]:trilogia]:
        s = e.find(f'{q("pPr")}/{q("sectPr")}')
        if s is not None:
            plantilla = plantilla if plantilla is not None else s
            s.getparent().remove(s)
    assert plantilla is not None
    vacio, pie, pie_vacio = rid['headerJBvacio.xml'], rid['footerJB.xml'], rid['footerJBvacio.xml']
    # cada capítulo, su sección (la apertura, sin encabezado); la transición, la suya
    tramos = []
    for k, ini in enumerate(inicios[: ultimo + 1]):
        fin = (inicios[k + 1] if k < ultimo - 1 else trans_ini if k == ultimo - 1 else trilogia) - 1
        n = int(tx[caps[k]].split()[-1])
        tramos.append((ini, fin, sect(plantilla, rid[f'headerJBimpar{n}.xml'], rid[f'headerJBpar{n}.xml'], pie, primera=vacio, inicio_folios=k == 0), f'capítulo {n}'))
    tramos.insert(ultimo, (trans_ini, inicios[ultimo] - 1, sect(plantilla, vacio, vacio, pie_vacio), 'transición'))
    for ini, fin, s, que in tramos:
        assert hijos[fin].tag == q('p'), f'{que}: la sección tiene que terminar en un párrafo'
        poner_sect(hijos[fin], s)
        sacar_salto(hijos[ini])            # la sección nueva ya empieza en página nueva
        cambios.append(f'{que}: párrafos {ini}–{fin} («{tx[fin][:28]}»)')
    partes['word/document.xml'] = etree.tostring(raiz, xml_declaration=True, encoding='UTF-8', standalone=True)

    with zipfile.ZipFile(destino, 'w', zipfile.ZIP_DEFLATED) as out:
        for i in infos:
            out.writestr(i, partes[i.filename])
    return destino, cambios


if __name__ == '__main__':
    for n, (v, frase) in LIBROS.items():
        d, c = procesar(n, v, frase)
        print(os.path.basename(d))
        for x in c:
            print('  ', x)
