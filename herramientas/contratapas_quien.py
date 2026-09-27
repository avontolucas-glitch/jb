"""
Contratapas con una foto de Julián y quién es: la foto arriba, como una lámina
con filete, en los dos tonos del libro (duotono); debajo, «Quién es» con un
texto breve (solo datos confirmados: ver la Hoja de Revisión, 3ª pasada), la
frase de transición, el nombre, el emblema de la transición en chico y el sitio.
Queda libre el lugar del código de barras (abajo a la derecha).

No toca las contratapas anteriores: escribe versiones «(con fotos y quién es)»
al lado (contratapa en PNG y tapa + contratapa en PDF, 5.5×8.5" con 0.125" de
sangrado). Receta = doble exposición · Pensamiento = la mirada · Biografía = chef.
Uso:  python3 herramientas/contratapas_quien.py
"""
import os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps, ImageEnhance

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from engine import carve, to_rgba
from designs import build

RAIZ = os.path.dirname(AQUI)
OUT = os.path.join(RAIZ, 'diseño', 'portadas')
FOTOS = os.path.join(RAIZ, 'diseño', 'fotos')
FD = '/usr/share/texmf/fonts/opentype/public/tex-gyre/'
def F(sz, it=False): return ImageFont.truetype(FD + ('texgyrepagella-italic.otf' if it else 'texgyrepagella-regular.otf'), sz)
DPI = 300; BL = int(0.125 * DPI); W = int(5.5 * DPI) + 2 * BL; H = int(8.5 * DPI) + 2 * BL

# (clave, archivo, fondo, tinta, emblema de la transición, frase, foto, recorte horizontal 0-1)
LIBROS = [
    ('receta', 'La Receta de La Manifestación', (9, 9, 9), '#ECE5D4', 'RT',
     'No podés pescar una ballena con las herramientas para pescar un dorado.', 'Julián - doble exposición (original).jpg', 0.5),
    ('pensamiento', 'El Pensamiento es Tu Fe', (246, 242, 233), '#1E1B18', 'P6',
     'Logré atravesar el tiempo con éxito.', 'Julián - retrato 1 (original).jpg', 0.7),
    ('biografia', 'La Biografía', (15, 36, 62), '#ECE5D4', 'B2',
     'Detrás del que está llorando hay alguien que está muy tranquilo observando cómo vos estás llorando.', 'Julián - retrato de chef (original).jpg', 0.5),
]
FOTO_W, FOTO_H = 480, 600   # 1,6" × 2", proporción 4:5
QUIEN = ('Julián Bermúdez es chef y conferencista. Llegó a la cocina buscando un oficio que no le pidiera '
         'títulos y, en 2021, ganó El Gran Premio de la Cocina. Hoy da conferencias y masterclass sobre la '
         'manifestación, en la línea de Neville Goddard. Esta trilogía reúne su obra oral: el cómo, el porqué '
         'y el quién de una misma verdad.')


def textura(rgb, seed, clara):
    """El mismo papel de las tapas (covers.py): grano, fibras y viñeta suave."""
    rng = np.random.default_rng(seed)
    base = np.ones((H, W, 3), np.float32) * np.array(rgb, np.float32)
    n = rng.standard_normal((H, W)).astype(np.float32)
    g = np.asarray(Image.fromarray(((n - n.min()) / np.ptp(n) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.1))).astype(np.float32) / 255 - 0.5
    fib = rng.standard_normal((H // 8, W // 3)).astype(np.float32)
    fib = np.asarray(Image.fromarray(((fib - fib.min()) / np.ptp(fib) * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)).astype(np.float32) / 255 - 0.5
    amp = 7 if clara else 10
    base += (g * amp + fib * amp * 0.7)[..., None]
    yy, xx = np.mgrid[0:H, 0:W]
    d = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
    base *= (1 - np.clip(d - 0.5, 0, 1) ** 1.6 * (0.12 if clara else 0.38))[..., None]
    return Image.fromarray(np.clip(base, 0, 255).astype(np.uint8), 'RGB').convert('RGBA')


def espaciado(d, cy, texto, fuente, color, track):
    ws = [d.textlength(c, font=fuente) for c in texto]
    x = (W - (sum(ws) + track * (len(texto) - 1))) / 2
    for c, w in zip(texto, ws):
        d.text((x, cy), c, font=fuente, fill=color, anchor='ls'); x += w + track


def partir(d, texto, fuente, ancho):
    palabras, lineas, cur = texto.split(), [], ''
    for p in palabras:
        t = (cur + ' ' + p).strip()
        if d.textlength(t, font=fuente) > ancho and cur: lineas.append(cur); cur = p
        else: cur = t
    return lineas + [cur]


def rombo(d, cx, cy, r, color): d.polygon([(cx, cy - r), (cx + r, cy), (cx, cy + r), (cx - r, cy)], fill=color)


def hex_rgb(h): return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


def lamina(archivo, centro_x, fondo, tinta, clara, seed):
    """La foto recortada a 4:5, en duotono con los colores del libro y grano de imprenta."""
    im = Image.open(os.path.join(FOTOS, archivo)).convert('RGB')
    r = FOTO_W / FOTO_H
    if im.width / im.height > r:                       # más ancha: se recorta a los costados
        w = int(im.height * r); x = int((im.width - w) * centro_x)
        im = im.crop((x, 0, x + w, im.height))
    else:                                              # más alta: se recorta abajo (la cara queda arriba)
        h = int(im.width / r); y = int((im.height - h) * 0.25)
        im = im.crop((0, y, im.width, y + h))
    g = ImageOps.grayscale(im.resize((FOTO_W, FOTO_H), Image.LANCZOS))
    g = ImageEnhance.Contrast(ImageOps.autocontrast(g, cutoff=(1, 0.5))).enhance(1.08)
    ruido = np.random.default_rng(seed).normal(0, 6, (FOTO_H, FOTO_W))
    g = Image.fromarray(np.clip(np.asarray(g, np.float32) + ruido, 0, 255).astype(np.uint8))
    tinta_rgb = hex_rgb(tinta)
    if clara:   # libro claro: la foto se imprime con la tinta sobre el papel
        return ImageOps.colorize(g, black=tinta_rgb, white=fondo)
    sombra = tuple(int(c * 0.55) for c in fondo)
    return ImageOps.colorize(g, black=sombra, white=tinta_rgb)


for k, (clave, nombre, fondo, tinta, emblema, frase, foto, cx) in enumerate(LIBROS):
    clara = clave == 'pensamiento'
    bk = textura(fondo, 300 + k, clara)
    d = ImageDraw.Draw(bk)
    # la lámina con la foto, con un filete fino alrededor
    x0, y0 = (W - FOTO_W) // 2, BL + 210
    bk.paste(lamina(foto, cx, fondo, tinta, clara, 40 + k), (x0, y0))
    m = 14
    d.rectangle((x0 - m, y0 - m, x0 + FOTO_W + m, y0 + FOTO_H + m), outline=tinta, width=2)
    # quién es: rótulo espaciado y el texto justificado
    y = y0 + FOTO_H + 120
    espaciado(d, y, 'QUIÉN ES JULIÁN BERMÚDEZ', F(28), tinta, 7)
    y += 70
    fb = F(40)
    ancho = W - 2 * BL - 460
    xl = (W - ancho) / 2
    lineas = partir(d, QUIEN, fb, ancho)
    while len(lineas[-1].split()) < 2 and ancho > 900:   # nunca una palabra sola en la última línea
        ancho -= 12
        xl = (W - ancho) / 2
        lineas = partir(d, QUIEN, fb, ancho)
    for n_, ln in enumerate(lineas):
        palabras = ln.split()
        if n_ == len(lineas) - 1 or len(palabras) == 1:
            d.text((W / 2, y), ln, font=fb, fill=tinta, anchor='ms')
        else:
            libre = ancho - sum(d.textlength(p, font=fb) for p in palabras)
            gap = libre / (len(palabras) - 1)
            xx = xl
            for p in palabras:
                d.text((xx, y), p, font=fb, fill=tinta, anchor='ls')
                xx += d.textlength(p, font=fb) + gap
        y += 58
    # un rombo chico, y la frase de transición
    rombo(d, W / 2, y + 30, 9, tinta)
    fq = F(50, True)
    y += 120
    for ln in partir(d, '«' + frase + '»', fq, W - 2 * BL - 460):
        d.text((W / 2, y), ln, font=fq, fill=tinta, anchor='ms'); y += 72
    d.text((W / 2, y + 18), 'JULIÁN BERMÚDEZ', font=F(28), fill=tinta, anchor='ms')
    em = to_rgba(carve(build(emblema, False), px=900, seed=17 + k), tinta, size=120)
    bk.alpha_composite(em, (int(W / 2 - 60), int(y + 52)))
    y2 = y + 52 + 120 + 70
    espaciado(d, y2, 'julianbermudez.com', F(32, True), tinta, 3)
    d.text((BL + 150, H - BL - 190), 'ELVERBO', font=F(30), fill=tinta, anchor='ls')
    # el código de barras va abajo a la derecha: que nada lo invada
    assert y2 < H - BL - 150 - 330, f'{nombre}: el texto invade el lugar del código de barras ({y2})'
    bk = bk.convert('RGB')
    bk.save(os.path.join(OUT, f'{nombre} - contratapa (con fotos y quién es).png'), dpi=(DPI, DPI))
    tapa = Image.open(os.path.join(OUT, f'{nombre} - tapa.png')).convert('RGB')
    tapa.save(os.path.join(OUT, f'{nombre} - tapa y contratapa (con fotos y quién es).pdf'), save_all=True, append_images=[bk], resolution=DPI)
    print(nombre, 'listo')
