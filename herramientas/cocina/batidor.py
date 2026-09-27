"""
El batidor de globo (universo de chef de Julián; plus del sitio, NO va en los libros).
Tallado con el mismo motor de grabado que los emblemas de la trilogía, sin marco.
Mango macizo con su virola y el agujero para colgarlo; de la virola se abren las varillas
en globo (más ancho arriba, como un batidor de verdad) y se juntan en la punta.
Cuatro varillas (dos de afuera, más gruesas, y dos de adentro) con huecos negros claros entre ellas,
en lágrima con cintura hacia la virola para que se lea como batidor y no como raqueta.
Uso:  python3 batidor.py   (escribe batidor.png en alta, tinta #111111, y batidor.webp 200 px crema)
"""
import math, os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from engine import Ink, carve, to_rgba
from designs import TT

AQUI = os.path.dirname(os.path.abspath(__file__))
CREMA = '#EFE9DC'


def rot(p, a):
    x, y = p
    return (x * math.cos(a) - y * math.sin(a), x * math.sin(a) + y * math.cos(a))


def E_BATIDOR(ink, s, ang=0.38, k=0.745):
    T0 = TT(s)
    oy = -14                                    # corrimiento para que el conjunto quede centrado
    def T(x, y):
        x, y = rot((x, y + oy), ang)
        return T0(x * k - 30, y * k)
    s = s * k                                   # los anchos de trazo acompañan la escala

    y_vir, y_top = 118, -318                    # virola (donde nacen las varillas) y punta del globo
    W = 150                                     # medio ancho máximo del globo

    # varillas: de la virola a la punta, en lágrima: cintura angosta sobre la virola,
    # panza ancha arriba y la punta redondeada donde se cruzan
    def varilla(f, n=48):
        pts = []
        for i in range(n + 1):
            t = i / n
            g = math.sin(math.pi * t ** 2.2) ** 0.6
            x = f * (12 + (W - 12) * g)
            y = y_vir + (y_top - y_vir) * t
            pts.append(T(x, y))
        return pts
    for f, w in ((-1.0, 30), (1.0, 30), (-0.42, 24), (0.42, 24)):
        ink.stroke(varilla(f), w * s, w * s, amp=0.7)
    ink.circle(*T(0, y_top + 8), 16 * s)                                     # donde se cruzan arriba

    # virola: el anillo de metal que ata las varillas al mango
    ink.poly([T(-38, y_vir - 36), T(38, y_vir - 36), T(43, y_vir + 26), T(-43, y_vir + 26)], 1.2)
    # mango: se ensancha hacia abajo y termina redondeado (1,3 veces más grueso que antes)
    y_fin, r_fin = 330, 49
    mango = [T(-35, y_vir + 20), T(35, y_vir + 20), T(r_fin, y_fin)]
    mango += [T(r_fin * math.cos(math.pi * i / 16), y_fin + r_fin * math.sin(math.pi * i / 16)) for i in range(1, 16)]
    mango += [T(-r_fin, y_fin)]
    ink.poly(mango, 1.4)

    # cortes de gubia: la juntura de la virola, el brillo del mango, el agujero para colgar
    ink.stroke([T(-38, y_vir + 26), T(38, y_vir + 26)], 8 * s, 8 * s, layer='white', amp=0.3, taper=False)
    ink.stroke([T(-17, y_vir + 50), T(-22, y_fin - 30)], 13 * s, 7 * s, layer='white', amp=0.4)
    ink.circle(*T(8, y_fin + 8), 14 * s, layer='white')


def exportar(fn, png, webp, seed):
    ink = Ink(seed)
    ink.framed = False
    fn(ink, 1.45)
    m = carve(ink, px=1800, seed=seed)
    to_rgba(m, '#111111').save(os.path.join(AQUI, png))
    to_rgba(m, CREMA, size=200).save(os.path.join(AQUI, webp), 'WEBP', quality=85, method=6)
    print(png, webp)


def lamina():
    """prueba: el webp sobre #080808 a 200, 52 y 28 px, al lado del clavo y la pesca del sitio."""
    from PIL import Image
    E = '/home/user/jb/sitio/public/emblemas/'
    items = [os.path.join(AQUI, 'batidor.webp'), E + 'clavo.webp', E + 'receta-4-la-pesca.webp']
    sizes = [200, 52, 28]
    Wd = sum(sizes) + 40 * (len(sizes) + 1)
    bg = Image.new('RGB', (Wd, 240 * len(items) + 20), '#080808')
    for r, f in enumerate(items):
        im = Image.open(f).convert('RGBA')
        x = 40
        for sz in sizes:
            t = im.resize((sz, sz), Image.LANCZOS)
            bg.paste(t, (x, 20 + r * 240 + (200 - sz) // 2), t)
            x += sz + 40
    bg.save(os.path.join(AQUI, 'batidor-prueba.png'))


if __name__ == '__main__':
    exportar(E_BATIDOR, 'batidor.png', 'batidor.webp', 47)
    lamina()
