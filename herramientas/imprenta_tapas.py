"""
Las tapas para la imprenta, a partir de las de diseño/portadas (que no se tocan):
la tapa y la contratapa «(con fotos y quién es)» de cada libro, sin «ELVERBO» (abajo en la
tapa y en la contratapa) y sin «julianbermudez.com» (el dominio todavía no está andando:
si Julián lo confirma antes de imprimir, se vuelve a poner con SITIO = True).

Lo borrado se tapa con el mismo papel: las texturas de las tapas son deterministas
(covers.py: semilla 100 + n; contratapas_quien.py: 300 + n), así que se vuelve a generar la
textura y se pega solo el pedazo donde estaba el texto, sin costura.

Escribe en imprenta/:
  <Libro> - tapa.pdf, <Libro> - contratapa.pdf     cada una con 0,125" de sangrado
  <Libro> - tapa, lomo y contratapa (lomo X mm).pdf el pliego único que piden las imprentas,
      con el lomo estimado para papel obra de 80 g (0,1 mm por hoja, 2 páginas por hoja) más
      0,5 mm de la tapa: cuando la imprenta diga su papel, se rehace con LOMO_MM.
En todos, la caja de corte (TrimBox) y la de sangrado (BleedBox).
Uso:  python3 herramientas/imprenta_tapas.py   (o con lomos: receta=4.3 pensamiento=3.1 …)
"""
import io, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
PORTADAS = os.path.join(RAIZ, 'diseño', 'portadas')
IMPRENTA = os.path.join(RAIZ, 'imprenta')
FD = '/usr/share/texmf/fonts/opentype/public/tex-gyre/'
def F(sz, it=False): return ImageFont.truetype(FD + ('texgyrepagella-italic.otf' if it else 'texgyrepagella-regular.otf'), sz)
DPI = 300; BL = int(0.125 * DPI); W = int(5.5 * DPI) + 2 * BL; H = int(8.5 * DPI) + 2 * BL
SITIO = False

# (clave, archivo, papel, tinta, claro, interior para contar páginas)
LIBROS = [
    ('receta', 'La Receta de La Manifestación', (9, 9, 9), '#ECE5D4', False, 'Receta de La Manifestación'),
    ('pensamiento', 'El Pensamiento es Tu Fe', (246, 242, 233), '#1E1B18', True, 'El Pensamiento es Tu Fe'),
    ('biografia', 'La Biografía', (15, 36, 62), '#ECE5D4', False, 'La Biografía'),
]


def textura(rgb, seed, claro, blur, fib_div, amp_oscuro, amp_fib, vig, vig_claro, vig_oscuro):
    """El papel de las tapas (covers.py y contratapas_quien.py son la misma receta con
    parámetros apenas distintos)."""
    rng = np.random.default_rng(seed)
    base = np.ones((H, W, 3), np.float32) * np.array(rgb, np.float32)
    n = rng.standard_normal((H, W)).astype(np.float32)
    g = np.asarray(Image.fromarray(((n - n.min()) / np.ptp(n) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(blur))).astype(np.float32) / 255 - 0.5
    fib = rng.standard_normal((H // fib_div[0], W // fib_div[1])).astype(np.float32)
    fib = np.asarray(Image.fromarray(((fib - fib.min()) / np.ptp(fib) * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)).astype(np.float32) / 255 - 0.5
    amp = 7 if claro else amp_oscuro
    base += (g * amp + fib * amp * amp_fib)[..., None]
    yy, xx = np.mgrid[0:H, 0:W]
    d = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
    base *= (1 - np.clip(d - vig, 0, 1) ** 1.6 * (vig_claro if claro else vig_oscuro))[..., None]
    return Image.fromarray(np.clip(base, 0, 255).astype(np.uint8), 'RGB')


def papel_tapa(rgb, k, claro):        # covers.py
    return textura(rgb, 100 + k, claro, 1.1, (8, 3), 10, 0.7, 0.5, 0.12, 0.38)


def papel_contratapa(rgb, k, claro):  # contratapas_quien.py
    return textura(rgb, 300 + k, claro, 1.1, (8, 3), 10, 0.7, 0.5, 0.12, 0.38)


def tapar(img, papel, caja):
    """Pega el pedazo de papel limpio en la caja (x0, y0, x1, y1)."""
    img.paste(papel.crop(caja), caja[:2])


def mismo_papel(img, papel, caja):
    """Comprueba que el papel regenerado es el de la imagen (alrededor de la caja)."""
    x0, y0, x1, y1 = caja
    marco = (max(0, x0 - 60), max(0, y0 - 60), min(W, x1 + 60), min(H, y1 + 60))
    a = np.asarray(img.crop(marco)).astype(int)
    b = np.asarray(papel.crop(marco)).astype(int)
    m = np.ones(a.shape[:2], bool)
    m[y0 - marco[1]:y1 - marco[1], x0 - marco[0]:x1 - marco[0]] = False
    return float(np.abs(a - b)[m].mean())


def caja_texto(texto, fuente, y_base, track, centrado=True, x=None):
    d = ImageDraw.Draw(Image.new('RGB', (10, 10)))
    ancho = sum(d.textlength(c, font=fuente) for c in texto) + track * (len(texto) - 1)
    x0 = (W - ancho) / 2 if centrado else x
    asc, desc = fuente.getmetrics()
    return (int(x0) - 24, int(y_base - asc) - 14, int(x0 + ancho) + 24, int(y_base + desc) + 14)


def limpiar(clave, archivo, papel_rgb, tinta, claro, k):
    tapa = Image.open(os.path.join(PORTADAS, f'{archivo} - tapa.png')).convert('RGB')
    contra = Image.open(os.path.join(PORTADAS, f'{archivo} - contratapa (con fotos y quién es).png')).convert('RGB')
    assert tapa.size == (W, H) and contra.size == (W, H)
    # la tapa: «ELVERBO» abajo, centrado (covers.py: spaced(d, H-BL-190, 'ELVERBO', F(34), ink, 16))
    p = papel_tapa(papel_rgb, k, claro)
    c = caja_texto('ELVERBO', F(34), H - BL - 190, 16)
    err = mismo_papel(tapa, p, c)
    assert err < 3, f'{archivo} tapa: el papel regenerado no coincide ({err:.1f})'
    tapar(tapa, p, c)
    # la contratapa: «ELVERBO» abajo a la izquierda y el sitio
    p = papel_contratapa(papel_rgb, k, claro)
    c = caja_texto('ELVERBO', F(30), H - BL - 190, 0, centrado=False, x=BL + 150)
    err = mismo_papel(contra, p, c)
    assert err < 3, f'{archivo} contratapa: el papel regenerado no coincide ({err:.1f})'
    tapar(contra, p, c)
    if not SITIO:
        y2 = sitio_y(contra, p, tinta)
        c = caja_texto('julianbermudez.com', F(32, True), y2, 3)
        tapar(contra, p, c)
    return tapa, contra


def sitio_y(contra, papel, tinta):
    """El renglón del sitio: el último renglón con tinta antes del lugar del código de barras
    (contratapas_quien.py lo calcula según el largo del texto; acá se lo busca)."""
    a = np.asarray(contra).astype(int)
    b = np.asarray(papel).astype(int)
    tinta_en = np.abs(a - b).sum(axis=2) > 60           # dónde hay algo impreso
    centro = tinta_en[:, W // 2 - 300: W // 2 + 300].sum(axis=1)
    filas = np.where(centro > 3)[0]
    filas = filas[filas < H - BL - 400]
    ultima = filas.max()                                 # el pie de la última línea (el sitio)
    return int(ultima - 2)


def con_cajas(img, ancho_in, alto_in, destino, sangrado_in=0.125):
    import pymupdf
    doc = pymupdf.open()
    pg = doc.new_page(width=ancho_in * 72, height=alto_in * 72)
    b = io.BytesIO()
    img.save(b, 'JPEG', quality=95, subsampling=0, dpi=(DPI, DPI))
    pg.insert_image(pg.rect, stream=b.getvalue())
    m = sangrado_in * 72
    r = pg.mediabox
    pg.set_bleedbox(r)
    pg.set_trimbox(pymupdf.Rect(r.x0 + m, r.y0 + m, r.x1 - m, r.y1 - m))
    doc.set_metadata({'title': os.path.splitext(os.path.basename(destino))[0], 'author': 'Julián Bermúdez', 'creator': '', 'producer': ''})
    doc.save(destino, garbage=3, deflate=True)


def paginas(interior):
    import pymupdf
    return len(pymupdf.open(os.path.join(IMPRENTA, f'{interior} - interior.pdf')))


def lomo_estimado(n):
    return round(n / 2 * 0.1 + 0.5, 1)


if __name__ == '__main__':
    lomos = dict(a.split('=') for a in sys.argv[1:])
    os.makedirs(IMPRENTA, exist_ok=True)
    for k, (clave, archivo, papel_rgb, tinta, claro, interior) in enumerate(LIBROS):
        tapa, contra = limpiar(clave, archivo, papel_rgb, tinta, claro, k)
        nombre = interior if clave != 'receta' else 'Receta de La Manifestación'
        con_cajas(tapa, 5.75, 8.75, os.path.join(IMPRENTA, f'{nombre} - tapa.pdf'))
        con_cajas(contra, 5.75, 8.75, os.path.join(IMPRENTA, f'{nombre} - contratapa.pdf'))
        n = paginas(interior)
        mm = float(lomos.get(clave, lomo_estimado(n)))
        lomo_px = round(mm / 25.4 * DPI)
        # el pliego: contratapa | lomo | tapa (el sangrado solo afuera)
        pliego = Image.new('RGB', (W - BL + lomo_px + W - BL, H))
        pliego.paste(contra.crop((0, 0, W - BL, H)), (0, 0))
        pliego.paste(tapa.crop((BL, 0, W, H)), (W - BL + lomo_px, 0))
        # el lomo, del mismo papel de la tapa (sin texto: con menos de 6 mm no entra): el borde de
        # la tapa espejado, así sigue sin costura y con la misma viñeta que los dos bordes que toca
        franja = tapa.crop((BL, 0, BL + lomo_px, H)).transpose(Image.FLIP_LEFT_RIGHT)
        pliego.paste(franja, (W - BL, 0))
        ancho_in = pliego.size[0] / DPI
        coma = f'{mm:.1f}'.replace('.', ',')
        con_cajas(pliego, ancho_in, H / DPI, os.path.join(IMPRENTA, f'{nombre} - tapa, lomo y contratapa (lomo {coma} mm).pdf'))
        print(f'{nombre}: {n} páginas · lomo {coma} mm · pliego {ancho_in * 25.4:.1f} × {H / DPI * 25.4:.1f} mm (con sangrado)')
