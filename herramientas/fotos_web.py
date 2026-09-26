"""
Versiones web de las fotos de Julián: blanco y negro (como el sitio: tinta
crema sobre negro), con contraste de grabado, en WebP a 1200 y 720 px de ancho.
Los originales quedan intactos en diseño/fotos/.
(Las primeras tres —mirada, chef y doble exposición— ya están hechas a mano en
sitio/public/fotos/; acá van las que se suman.)
Uso:  python3 herramientas/fotos_web.py
"""
import os
from PIL import Image, ImageOps, ImageEnhance, ImageFilter, ImageChops

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIG = os.path.join(RAIZ, 'diseño', 'fotos')
WEB = os.path.join(RAIZ, 'sitio', 'public', 'fotos')

# original: (nombre web, cuánto se oscurecen los bordes para que el foco quede en Julián)
FOTOS = {
    'Julián - con el trofeo de El Gran Premio de la Cocina (original).png': ('julian-trofeo', 0.55),
    'Julián - emplatando (original).png': ('julian-emplatando', 0.35),
    'Julián - en movimiento (original).png': ('julian-movimiento', 0.0),
}


def byn(im):
    """Blanco y negro con negros hondos y luces sin quemar, apenas cálido (tinta crema)."""
    g = ImageOps.grayscale(im.convert('RGB'))
    g = ImageOps.autocontrast(g, cutoff=(1.2, 0.4))
    g = ImageEnhance.Contrast(g).enhance(1.12)
    return ImageOps.colorize(g, black='#070707', white='#f1ece1', mid='#8a857b')


def viñeta(im, fuerza):
    """Bordes que se hunden en el negro, como la luz de un taller."""
    if not fuerza:
        return im
    w, h = im.size
    m = Image.new('L', (w, h), 0)
    centro = Image.new('L', (int(w * 0.62), int(h * 0.8)), 255)
    m.paste(centro, ((w - centro.width) // 2, int(h * 0.08)))
    m = m.filter(ImageFilter.GaussianBlur(min(w, h) * 0.18))
    m = m.point(lambda v: int(255 - (255 - v) * fuerza))
    return ImageChops.multiply(im, Image.merge('RGB', (m, m, m)))


if __name__ == '__main__':
    for nombre, (slug, fuerza) in FOTOS.items():
        im = viñeta(byn(Image.open(os.path.join(ORIG, nombre))), fuerza)
        for ancho in (1200, 720):
            w = min(ancho, im.width)
            v = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
            destino = os.path.join(WEB, f'{slug}-{ancho}.webp')
            v.save(destino, 'WEBP', quality=80, method=6)
            print(destino, v.size, os.path.getsize(destino) // 1024, 'KB')
