"""
Toma el dibujo del surf que hizo Lucas (diseño/referencias/surf.png) y lo
convierte en el emblema del futuro capítulo: la tinta sale de los tonos
oscuros del dibujo (el fondo queda transparente), en negro para diseño y en
crema para el sitio (el que flota).
Uso:  python3 herramientas/surf_desde_imagen.py [ruta de la imagen]
"""
import os, sys
import numpy as np
from PIL import Image, ImageOps

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIGEN = sys.argv[1] if len(sys.argv) > 1 else os.path.join(RAIZ, 'diseño', 'referencias', 'surf.png')
GRAB = os.path.join(RAIZ, 'diseño', 'grabados', 'Futuro capítulo - Surf.png')
SITIO = os.path.join(RAIZ, 'sitio', 'public', 'emblemas', 'surf.webp')


def tinta(img, color, lado):
    g = np.asarray(ImageOps.grayscale(img)).astype(np.float32) / 255.0
    # lo oscuro es tinta; el papel claro, transparente (con una transición suave para no serruchar los bordes)
    alfa = np.clip((0.78 - g) / 0.5, 0, 1)
    rgba = np.zeros((*alfa.shape, 4), np.uint8)
    rgba[..., :3] = [int(color[i:i + 2], 16) for i in (1, 3, 5)]
    rgba[..., 3] = (alfa * 255).astype(np.uint8)
    im = Image.fromarray(rgba, 'RGBA')
    return im.resize((lado, lado), Image.LANCZOS)


if __name__ == '__main__':
    img = Image.open(ORIGEN).convert('RGB')
    w, h = img.size
    c = min(w, h)                       # recorte cuadrado centrado
    img = img.crop(((w - c) // 2, (h - c) // 2, (w + c) // 2, (h + c) // 2))
    tinta(img, '#111111', 1800).save(GRAB)
    tinta(img, '#EFE9DC', 200).save(SITIO, 'WEBP', quality=86, method=6)
    print('listo:', GRAB, SITIO)
