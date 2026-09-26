"""
Integra el sitio a los libros: agrega al final de cada libro (después del
colofón) la página «Tu libro, también digital», con el QR a
julianbermudez.com/canjear y el recuadro donde la imprenta estampa el código
único de cada ejemplar (datos variables).

No toca las ediciones vigentes: escribe versiones nuevas al lado.
Uso:  python3 herramientas/integrar_sitio.py
"""
import io, os, re, shutil, zipfile, tempfile
from lxml import etree
import segno
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MS = os.path.join(RAIZ, 'manuscritos')
URL = 'https://julianbermudez.com/canjear'
W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
NS = {'w': W}

# libro: (archivo, tinta principal, tinta suave, fondo del recuadro del QR)
LIBROS = {
    'receta': ('Receta de La Manifestación', 'ECE5D4', 'B3AB9B', '#ECE5D4'),
    'pensamiento': ('El Pensamiento es Tu Fe', '2B2B2B', None, None),
    'biografia': ('La Biografía', 'ECE5D4', None, '#ECE5D4'),
}
QR_PULGADAS = 1.15


def esc(t):
    return t.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def parrafo(texto, tam, color, i=False, track=0, antes=0, despues=0, salto=False, borde=None, ind=700):
    ppr = '<w:pPr>' + ('<w:pageBreakBefore/>' if salto else '') + '<w:keepNext/>'
    if borde:
        b = f'w:val="single" w:sz="4" w:space="8" w:color="{borde}"'
        ppr += f'<w:pBdr><w:top {b}/><w:left {b}/><w:bottom {b}/><w:right {b}/></w:pBdr>'
    ppr += f'<w:spacing w:before="{antes}" w:after="{despues}"/><w:ind w:left="{ind}" w:right="{ind}"/><w:jc w:val="center"/></w:pPr>'
    rpr = ('<w:rPr><w:rFonts w:ascii="Palatino Linotype" w:hAnsi="Palatino Linotype" w:cs="Palatino Linotype"/>'
           + ('<w:i/><w:iCs/>' if i else '')
           + f'<w:color w:val="{color}"/><w:spacing w:val="{track}"/><w:sz w:val="{tam}"/><w:szCs w:val="{tam}"/><w:lang w:val="es-AR"/></w:rPr>')
    return f'<w:p xmlns:w="{W}">{ppr}<w:r>{rpr}<w:t xml:space="preserve">{esc(texto)}</w:t></w:r></w:p>'


def parrafo_imagen(rid, emu, did, despues=160):
    return (f'<w:p xmlns:w="{W}" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" '
            'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
            'xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture" '
            'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            f'<w:pPr><w:keepNext/><w:spacing w:before="0" w:after="{despues}"/><w:jc w:val="center"/></w:pPr><w:r><w:drawing>'
            f'<wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="{emu}" cy="{emu}"/><wp:effectExtent l="0" t="0" r="0" b="0"/>'
            f'<wp:docPr id="{did}" name="QR sitio"/><wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr>'
            '<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic>'
            f'<pic:nvPicPr><pic:cNvPr id="{did}" name="QR sitio"/><pic:cNvPicPr/></pic:nvPicPr>'
            f'<pic:blipFill><a:blip r:embed="{rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>'
            f'<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="{emu}" cy="{emu}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>'
            '</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>')


def qr_png(oscuro, claro):
    """QR a 600 dpi. En los libros oscuros va en un recuadro de tinta crema (se lee mejor)."""
    qr = segno.make(URL, error='m')
    buf = io.BytesIO()
    qr.save(buf, kind='png', scale=20, border=3, dark=oscuro, light=claro)
    return buf.getvalue()


def integrar(clave):
    nombre, principal, suave, recuadro = LIBROS[clave]
    origen = os.path.join(MS, f'{nombre} (edición integral).docx')
    destino = os.path.join(MS, f'{nombre} (edición integral con sitio).docx')
    tmp = tempfile.mkdtemp()
    with zipfile.ZipFile(origen) as z:
        z.extractall(tmp)
    doc_path = os.path.join(tmp, 'word', 'document.xml')
    raiz = etree.parse(doc_path)
    body = raiz.getroot().find(f'{{{W}}}body')
    ultimo = [c for c in body if c.tag == f'{{{W}}}p'][-1]
    # la tinta suave del libro: la del colofón
    col = ultimo.find('.//w:color', NS)
    suave = suave or (col.get(f'{{{W}}}val') if col is not None else principal)

    # QR: en Receta y Biografía, recuadro crema con módulos del color de la página
    fondo_pag = {'receta': '#0B0B0B', 'biografia': '#0F243E', 'pensamiento': '#1E1B18'}[clave]
    png = qr_png(fondo_pag, recuadro) if recuadro else qr_png('#1E1B18', None)
    media = os.path.join(tmp, 'word', 'media')
    os.makedirs(media, exist_ok=True)
    with open(os.path.join(media, 'qr_sitio.png'), 'wb') as f:
        f.write(png)
    rels_path = os.path.join(tmp, 'word', '_rels', 'document.xml.rels')
    rels = etree.parse(rels_path)
    rid = 'rIdJBsitio'
    rel = etree.SubElement(rels.getroot(), '{http://schemas.openxmlformats.org/package/2006/relationships}Relationship')
    rel.set('Id', rid)
    rel.set('Type', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image')
    rel.set('Target', 'media/qr_sitio.png')
    rels.write(rels_path, xml_declaration=True, encoding='UTF-8', standalone=True)

    emu = int(QR_PULGADAS * 914400)
    piezas = [
        parrafo('◆', 14, suave, antes=2200, despues=360, salto=True),
        parrafo('TU LIBRO, TAMBIÉN DIGITAL', 18, suave, track=60, despues=160),
        parrafo('Este ejemplar trae un código único. Con él, el libro queda también en tu cuenta de julianbermudez.com, para leerlo desde cualquier dispositivo.',
                17, suave, i=True, despues=420),
        parrafo_imagen(rid, emu, 9901, despues=140),
        parrafo('julianbermudez.com/canjear', 17, principal, track=20, despues=460),
        parrafo('TU CÓDIGO', 13, suave, track=60, despues=120),
        parrafo('[CÓDIGO ÚNICO DEL EJEMPLAR]', 15, principal, track=30, despues=300, borde=suave, ind=950),
        parrafo('Cada código sirve una sola vez, para una sola cuenta.', 15, suave, i=True),
    ]
    ancla = ultimo
    for x in piezas:
        e = etree.fromstring(x)
        ancla.addnext(e)
        ancla = e
    raiz.write(doc_path, xml_declaration=True, encoding='UTF-8', standalone=True)

    if os.path.exists(destino):
        os.remove(destino)
    with zipfile.ZipFile(origen) as zo, zipfile.ZipFile(destino, 'w', zipfile.ZIP_DEFLATED) as zd:
        nombres = zo.namelist()
        for n in nombres:
            zd.write(os.path.join(tmp, n), n)
        zd.write(os.path.join(media, 'qr_sitio.png'), 'word/media/qr_sitio.png')
    shutil.rmtree(tmp)
    return destino


if __name__ == '__main__':
    for k in LIBROS:
        print(integrar(k))
