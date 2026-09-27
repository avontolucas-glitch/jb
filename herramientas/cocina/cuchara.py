"""
Cuchara de madera larga (plus de cocina para el sitio; no va en los libros).
Mismo motor de grabado que los emblemas de la trilogía: cuenco ovalado con el hueco
tallado (una media luna de luz), cuello que se afina y mango largo con la veta de la
madera abierta a gubia; agujero de colgar en la punta. En diagonal, el cuenco arriba
a la izquierda (el cuchillo va al revés, así no se repiten flotando juntos).
Uso:  python3 cuchara.py
"""
import math, os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from engine import Ink, carve, to_rgba
from designs import TT
from emblemas_nuevos import suave, rot

AQUI = os.path.dirname(os.path.abspath(__file__))
CREMA = '#EFE9DC'
ANG = math.radians(-40)        # gira el eje vertical: el cuenco se va arriba a la izquierda
CENTRO = (0, 0)


def cuchara(ink, T, s, ang=ANG, base=CENTRO):
    """En coordenadas locales la cuchara está parada: cuenco arriba (y<0), mango abajo."""
    def P(x, y):
        x, y = rot((x, y), ang)
        return T(x + base[0], y + base[1])

    def pts(lista, n=6, cerrado=True):
        return [P(x, y) for x, y in suave(lista, n=n, cerrado=cerrado)]

    # silueta de una pieza: cuenco ovalado largo (más ancho arriba), cuello fino y mango
    # de madera que engorda apenas hacia la punta redondeada
    der = [(0, -330), (48, -318), (76, -282), (84, -232), (76, -182), (54, -140),
           (30, -108), (21, -70), (22, 40), (26, 160), (31, 250)]
    punta = [(26, 284), (0, 298), (-26, 284)]
    izq = [(-x, y) for x, y in der[1:][::-1]]
    ink.poly(pts(der + punta + izq, n=5), 1.5)

    # el hueco del cuenco: una media luna de luz de un solo lado (la gubia lo vació)
    ink.stroke(pts([(-26, -304), (-52, -278), (-60, -232), (-52, -186), (-30, -152)], n=6, cerrado=False),
               22 * s, 6 * s, layer='white', amp=0.4)

    # veta de la madera: dos cortes largos, ondulados, que suben por el mango y se abren
    # en el cuenco siguiendo su forma
    ink.stroke(pts([(-6, 232), (-12, 170), (-4, 100), (-12, 30), (-6, -50), (-2, -120),
                    (20, -178), (32, -236), (20, -292)], n=6, cerrado=False),
               11 * s, 3.5 * s, layer='white', amp=0.4)
    ink.stroke(pts([(12, 200), (8, 130), (15, 60), (9, -10), (14, -80), (40, -150), (52, -212)], n=6, cerrado=False),
               6 * s, 2 * s, layer='white', amp=0.3)

    # agujero de colgar
    ink.circle(*P(0, 266), 11 * s, layer='white', amp=0.5)


def E_CUCHARA(ink, s):
    T = TT(s)
    cuchara(ink, T, s)


def exportar(fn, nombre_png, nombre_webp, seed):
    ink = Ink(seed)
    ink.framed = False
    fn(ink, 1.45)
    m = carve(ink, px=1800, seed=seed)
    to_rgba(m, '#111111').save(os.path.join(AQUI, nombre_png))
    to_rgba(m, CREMA, size=200).save(os.path.join(AQUI, nombre_webp), 'WEBP', quality=85, method=6)
    print(nombre_png, nombre_webp)


if __name__ == '__main__':
    exportar(E_CUCHARA, 'cuchara.png', 'cuchara.webp', 57)
