"""
La portada (primera página) de «La Receta de la Manifestación», completamente
negra: sin la textura ni el rombo gris del fondo. Los textos quedan igual.
El fondo de esa página es una imagen a página completa (media/fondo_portadilla.jpg,
el dibujo «FondoPortadilla»): se reemplaza por negro puro del mismo tamaño, así
nada se mueve de lugar. No toca la versión vigente: escribe una nueva al lado.
Uso:  python3 herramientas/portada_negra.py
"""
import io, os, zipfile
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MS = os.path.join(RAIZ, 'manuscritos')
ORIGEN = os.path.join(MS, 'Receta de La Manifestación (edición integral con sitio, sin colofón).docx')
DESTINO = os.path.join(MS, 'Receta de La Manifestación (edición integral con sitio, sin colofón, portada negra).docx')
FONDO = 'word/media/fondo_portadilla.jpg'

with zipfile.ZipFile(ORIGEN) as z:
    doc = z.read('word/document.xml').decode('utf-8')
    rels = z.read('word/_rels/document.xml.rels').decode('utf-8')
    # que la imagen sea solo la de la portada (si otra página la usara, también se pondría negra)
    assert doc.count('name="FondoPortadilla"') == 2 and rels.count('media/fondo_portadilla.jpg') == 1
    viejo = Image.open(io.BytesIO(z.read(FONDO)))
    negro = io.BytesIO()
    Image.new('RGB', viejo.size, (0, 0, 0)).save(negro, 'JPEG', quality=95, dpi=viejo.info.get('dpi', (200, 200)))
    with zipfile.ZipFile(DESTINO, 'w', zipfile.ZIP_DEFLATED) as out:
        for item in z.infolist():
            out.writestr(item, negro.getvalue() if item.filename == FONDO else z.read(item.filename))
print(os.path.basename(DESTINO))
