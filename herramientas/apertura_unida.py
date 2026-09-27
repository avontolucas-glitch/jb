"""
Pensamiento: la apertura de cada capítulo, en la misma página que el comienzo del texto,
como en la Receta y la Biografía (Lucas: «si no se pierde sincronicidad entre la trilogía»).

Antes, cada capítulo abría con una divisoria negra propia (su sección, sin encabezado ni
folio: el grabado en crema sobre negro, «CAPÍTULO N», el título y el epígrafe) y el texto
empezaba en la página siguiente. Ahora:
  - se saca el salto de sección de la divisoria (el del último párrafo del epígrafe), así la
    apertura y el texto son una sola sección; el «empieza en 1» del Cap. 0 pasa a la sección
    del capítulo;
  - el fondo de la apertura pasa a ser la página blanca del libro con el grabado del
    capítulo en su tinta (el mismo lugar y tamaño que en los otros dos libros);
  - «CAPÍTULO N» y la cita, en el gris del libro; el título y el epígrafe, en su tinta.
La primera página de cada capítulo sigue sin encabezado (la sección ya lo tenía así).
Lo usa revision_4.py.
"""
import io, os, re, sys
from lxml import etree
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from engine import carve, to_rgba
from designs import build
import respiro

q = respiro.q
DPI = respiro.DPI
PW, PH = respiro.PW, respiro.PH
TINTA = '#1E1B18'  # la tinta de Pensamiento (assets.py)
TILE, TOP = int(1.45 * DPI), int(0.9 * DPI)  # como en assets.py: el grabado de la apertura
GRIS, NEGRO = '6E6A63', '2B2B2B'  # los de la página «La trilogía» y la portada
CLARO = {'BDB5A3': GRIS, 'F2EEE4': NEGRO}  # lo que en la divisoria negra iba claro
WP = '{http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing}'
A = '{http://schemas.openxmlformats.org/drawingml/2006/main}'
RR = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}'


def fondo(cap):
    """La página blanca con el grabado del capítulo, enmarcado, en la tinta del libro."""
    img = Image.new('RGBA', (PW, PH), (255, 255, 255, 255))
    m = carve(build(f'P{cap}', True), px=1400, seed=20 + cap)
    ic = to_rgba(m, TINTA, size=TILE, opacity=0.96)
    img.alpha_composite(ic, (int(PW / 2 - TILE / 2), TOP))
    b = io.BytesIO()
    img.convert('RGB').save(b, 'JPEG', quality=90, optimize=True, progressive=True)
    return b.getvalue()


def unir(raiz, partes):
    body = raiz.find(q('body'))
    hijos = [e for e in body if e.tag in (q('p'), q('tbl'))]
    tx = [respiro.texto(e) for e in hijos]
    rels = partes['word/_rels/document.xml.rels'].decode('utf-8')
    hechos = []
    for i, s in enumerate(tx):
        m = re.fullmatch(r'CAPÍTULO (\d)', s.strip())
        if not m:
            continue
        n = int(m.group(1))
        # el fondo de la apertura: el párrafo de antes, con un dibujo «FondoCap…» (el número del
        # nombre quedó de un orden viejo de los capítulos: vale el lugar, no el nombre)
        dib = [d for d in hijos[i - 1].iter(WP + 'docPr') if (d.get('name') or '').startswith('FondoCap')]
        assert dib, f'Cap. {n}: no encontré el fondo de la apertura'
        rid = next(hijos[i - 1].iter(A + 'blip')).get(RR + 'embed')
        assert sum(1 for b in raiz.iter(A + 'blip') if b.get(RR + 'embed') == rid) == 1, f'Cap. {n}: el fondo se usa en otra página'
        destino = re.search(rf'Id="{rid}"[^>]*Target="([^"]+)"', rels) or re.search(rf'Target="([^"]+)"[^>]*Id="{rid}"', rels)
        media = 'word/' + destino.group(1)
        assert media in partes, media
        partes[media] = fondo(n)
        # el salto de sección de la divisoria: el primero después de «CAPÍTULO N», antes de la letra capital
        j = next(k for k in range(i, len(hijos)) if hijos[k].find(f'{q("pPr")}/{q("sectPr")}') is not None)
        assert hijos[j + 1].find(f'{q("pPr")}/{q("framePr")}') is not None, f'Cap. {n}: después de la divisoria no viene la letra capital'
        ppr = hijos[j].find(q('pPr'))
        sect = ppr.find(q('sectPr'))
        inicio = sect.find(q('pgNumType'))
        ppr.remove(sect)
        # la sección del capítulo: la del cierre ◆ ◆ ◆
        c = next(k for k in range(j + 1, len(hijos)) if tx[k].strip() == '◆ ◆ ◆')
        sect_cap = hijos[c].find(f'{q("pPr")}/{q("sectPr")}')
        assert sect_cap is not None and sect_cap.find(q('titlePg')) is not None, f'Cap. {n}: el cierre no cierra una sección con primera página propia'
        if inicio is not None and sect_cap.find(q('pgNumType')) is None:
            # va antes de <w:cols> (el orden del esquema)
            cols = sect_cap.find(q('cols'))
            (cols.addprevious if cols is not None else sect_cap.append)(inicio)
        # los textos de la apertura: de claro sobre negro a la tinta del libro
        for k in range(i, j + 1):
            for col in hijos[k].iter(q('color')):
                v = col.get(q('val')).upper()
                if v in CLARO:
                    col.set(q('val'), CLARO[v])
        hechos.append(n)
    return hechos
