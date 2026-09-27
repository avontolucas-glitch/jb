"""
Saca el colofón del final de los libros («Este libro se terminó de componer…
Buenos Aires, Argentina», con su rombo). Lo demás queda igual: la tabla «La
trilogía, capítulo a capítulo» y la página «Tu libro, también digital».

No toca las ediciones vigentes: parte de la «(edición integral con sitio)» y
escribe «(edición integral con sitio, sin colofón)» al lado.
Uso:  python3 herramientas/sin_colofon.py
"""
import os, shutil, tempfile, zipfile
from lxml import etree

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MS = os.path.join(RAIZ, 'manuscritos')
W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
LIBROS = ['Receta de La Manifestación', 'El Pensamiento es Tu Fe', 'La Biografía']


def texto(e):
    return ''.join(e.itertext()).strip()


def sacar(nombre):
    origen = os.path.join(MS, f'{nombre} (edición integral con sitio).docx')
    destino = os.path.join(MS, f'{nombre} (edición integral con sitio, sin colofón).docx')
    tmp = tempfile.mkdtemp()
    with zipfile.ZipFile(origen) as z:
        z.extractall(tmp)
        nombres = z.namelist()
    ruta = os.path.join(tmp, 'word', 'document.xml')
    arbol = etree.parse(ruta)
    body = arbol.getroot().find(f'{{{W}}}body')
    hijos = list(body)
    inicio = next(i for i, e in enumerate(hijos) if texto(e).startswith('Este libro se terminó de componer'))
    fin = next(i for i in range(inicio, len(hijos)) if texto(hijos[i]) == 'Buenos Aires, Argentina')
    # el rombo que abre la página del colofón (con su salto de página) también se va
    if texto(hijos[inicio - 1]) == '◆':
        inicio -= 1
    quitados = [texto(e)[:60] for e in hijos[inicio:fin + 1]]
    for e in hijos[inicio:fin + 1]:
        body.remove(e)
    # la página siguiente («Tu libro, también digital») tiene que seguir empezando en página nueva
    sig = hijos[fin + 1]
    assert sig.find(f'.//{{{W}}}pageBreakBefore') is not None, 'la página del sitio perdió su salto de página'
    arbol.write(ruta, xml_declaration=True, encoding='UTF-8', standalone=True)
    with zipfile.ZipFile(destino, 'w', zipfile.ZIP_DEFLATED) as z:
        for n in nombres:
            z.write(os.path.join(tmp, n), n)
    shutil.rmtree(tmp)
    return destino, quitados


if __name__ == '__main__':
    for n in LIBROS:
        d, q = sacar(n)
        print(os.path.basename(d))
        for t in q:
            print('   quitado:', t)
