"""
Cuchillo de chef (plus de cocina para el sitio; no va en los libros).
Mismo motor de grabado que los emblemas de la trilogía: hoja ancha con filo curvo,
virola y mango con tres remaches, en diagonal (punta arriba a la derecha).
Uso:  python3 cuchillo.py
"""
import math, os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from engine import Ink, carve, to_rgba
from designs import TT
from emblemas_nuevos import suave, rot

AQUI = os.path.dirname(os.path.abspath(__file__))
CREMA = '#EFE9DC'
ANG = math.radians(-38)          # diagonal: la punta sube hacia la derecha
CENTRO = (22, 28)               # corrimiento para que la estampa quede centrada


def cuchillo(ink, T, s, ang=ANG, base=CENTRO):
    """En coordenadas locales la hoja apunta a +x, el lomo arriba (y<0) y el filo abajo.
    Lo que lo hace cuchillo de chef y no puñal: el lomo sigue recto la línea del mango
    y la hoja baja muy por debajo de él (el talón), con el filo que sube en panza a la punta."""
    def P(x, y):
        x, y = rot((x, y - 24), ang)          # gira alrededor del centro del dibujo
        return T(x + base[0], y + base[1])

    # hoja: lomo recto que cae apenas a la punta; filo recto desde el talón y panza que sube
    lomo = [(-36, -50), (60, -50), (170, -48), (240, -40), (296, -24)]
    filo = ink.bez((304, -20), (262, 44), (176, 96), (60, 100)) + [(-26, 100), (-36, 92)]
    ink.poly([P(x, y) for x, y in suave(lomo, n=8, cerrado=False) + filo], 1.5)

    # virola: el collar entre hoja y mango, apenas más alto que el mango y con la guarda que baja al talón
    ink.poly([P(-44, -54), P(-44, 46), P(-54, 40), P(-66, 26), P(-80, 24), P(-80, -52)], 1.2)

    # mango: alineado con el lomo, se redondea en la culata, que cae apenas
    mango = [(-84, -46), (-190, -48), (-262, -42), (-290, -26), (-296, 2), (-284, 26),
             (-250, 30), (-190, 20), (-84, 18)]
    ink.poly([P(x, y) for x, y in suave(mango, n=5, cerrado=False)], 1.4)

    # cortes de gubia
    bisel = [(-22, 70), (80, 70), (170, 58), (236, 28), (280, -12)]     # línea del afilado: da luz
    ink.stroke([P(x, y) for x, y in suave(bisel, n=8, cerrado=False)], 10 * s, 3 * s, layer='white', amp=0.35)
    ink.stroke([P(-16, -34), P(120, -35), P(210, -30)], 6 * s, 2 * s, layer='white', amp=0.3)  # brillo del lomo
    ink.stroke([P(-40, -44), P(-40, 40)], 5 * s, 5 * s, layer='white', amp=0.3, taper=False)   # juntas de la virola
    ink.stroke([P(-82, -42), P(-82, 16)], 5 * s, 5 * s, layer='white', amp=0.3, taper=False)
    for x in (-130, -188, -246):                                           # remaches
        ink.circle(*P(x, -14), 13 * s, layer='white', amp=0.6)


def E_CUCHILLO(ink, s):
    T = TT(s)
    cuchillo(ink, T, s)


def exportar(fn, nombre_png, nombre_webp, seed):
    ink = Ink(seed)
    ink.framed = False
    fn(ink, 1.45)
    m = carve(ink, px=1800, seed=seed)
    to_rgba(m, '#111111').save(os.path.join(AQUI, nombre_png))
    to_rgba(m, CREMA, size=200).save(os.path.join(AQUI, nombre_webp), 'WEBP', quality=85, method=6)
    print(nombre_png, nombre_webp)


if __name__ == '__main__':
    exportar(E_CUCHILLO, 'cuchillo.png', 'cuchillo.webp', 51)
