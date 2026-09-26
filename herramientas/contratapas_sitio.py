"""
Agrega julianbermudez.com a las contratapas, debajo de la lista de la trilogía.
No toca las contratapas vigentes: escribe versiones «(con sitio)» al lado.
Uso:  python3 herramientas/contratapas_sitio.py
"""
import os
from PIL import Image, ImageDraw, ImageFont

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(RAIZ, 'diseño', 'portadas')
FD = '/usr/share/texmf/fonts/opentype/public/tex-gyre/'
def F(sz, it=False): return ImageFont.truetype(FD + ('texgyrepagella-italic.otf' if it else 'texgyrepagella-regular.otf'), sz)
DPI = 300; BL = int(0.125 * DPI); W = int(5.5 * DPI) + 2 * BL
# mismos datos que covers.py
LIBROS = [('La Receta de La Manifestación', '#ECE5D4', 'No podés pescar una ballena con las herramientas para pescar un dorado.'),
          ('El Pensamiento es Tu Fe', '#1E1B18', 'Logré atravesar el tiempo con éxito.'),
          ('La Biografía', '#ECE5D4', 'Detrás del que está llorando hay alguien que está muy tranquilo observando cómo vos estás llorando.')]

def wrap(draw, text, font, maxw):
    words = text.split(); lines = []; cur = ''
    for w_ in words:
        t = (cur + ' ' + w_).strip()
        if draw.textlength(t, font=font) > maxw and cur: lines.append(cur); cur = w_
        else: cur = t
    lines.append(cur); return lines

def spaced(draw, cy, text, font, fill, track):
    ws = [draw.textlength(c, font=font) for c in text]; tw = sum(ws) + track * (len(text) - 1); x = (W - tw) / 2
    for c, w in zip(text, ws): draw.text((x, cy), c, font=font, fill=fill, anchor='ls'); x += w + track

for nombre, tinta, cita in LIBROS:
    bk = Image.open(f'{OUT}/{nombre} - contratapa.png').convert('RGB')
    d = ImageDraw.Draw(bk)
    lineas = wrap(d, '«' + cita + '»', F(62, True), W - 2 * BL - 420)
    y = BL + 980 + 92 * len(lineas)           # fin de la cita (como en covers.py)
    y_lista = y + 240 + 3 * 62                 # después de los tres títulos
    spaced(d, y_lista + 70, 'julianbermudez.com', F(34, True), tinta, 3)
    bk.save(f'{OUT}/{nombre} - contratapa (con sitio).png', dpi=(DPI, DPI))
    tapa = Image.open(f'{OUT}/{nombre} - tapa.png').convert('RGB')
    tapa.save(f'{OUT}/{nombre} - tapa y contratapa (con sitio).pdf', save_all=True, append_images=[bk], resolution=DPI)
    print(nombre)
