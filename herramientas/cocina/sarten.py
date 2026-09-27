"""
La sartén de hierro (universo de chef de Julián; plus del sitio, NO va en los libros).
Tallada con el mismo motor de grabado que los emblemas de la trilogía, sin marco.
Tres cuartos: la boca en elipse, el borde grueso, la pared de adentro que toma la luz,
el mango largo de hierro con su canaleta y el agujero para colgarla.
Sin vapor: a tamaño de fondo (22–52 px) quedaba como un pelo suelto.
Uso:  python3 sarten.py   (escribe sarten.png en alta, tinta #111111, y sarten.webp 200 px crema)
"""
import math, os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from engine import Ink, carve, to_rgba
from designs import TT

AQUI = os.path.dirname(os.path.abspath(__file__))
CREMA = '#EFE9DC'


def arco(T, cx, cy, rx, ry, a0, a1, n=48):
    """puntos de una elipse (coordenadas locales) entre los ángulos a0 y a1 (pantalla: y hacia abajo)."""
    return [T(cx + rx * math.cos(a0 + (a1 - a0) * i / n), cy + ry * math.sin(a0 + (a1 - a0) * i / n)) for i in range(n + 1)]


def E_SARTEN(ink, s):
    T = TT(s)
    cx, cy = -84, 48           # centro de la boca (sin vapor, el conjunto queda centrado en alto)
    rx, ry = 162, 74           # boca (tres cuartos: elipse achatada)
    pared = 46                 # alto de la pared que se ve de frente
    rx2, ry2 = rx * 0.9, ry * 0.9

    # mango: sale del borde a la derecha y sube en diagonal; se ensancha hacia la punta
    ang = -0.70
    a_base = -0.30                                   # punto del borde donde nace
    bx, by = cx + rx * math.cos(a_base), cy + ry * math.sin(a_base)
    L = 228
    ux, uy = math.cos(ang), math.sin(ang)
    nx, ny = -uy, ux
    ex, ey = bx + ux * L, by + uy * L
    w0, w1 = 27, 38                                  # medio ancho en la base y en la punta (1,4× el de antes: a la par del mango del cuchillo)
    mango = [T(bx - ux * 30 + nx * w0 * 1.25, by - uy * 30 + ny * w0 * 1.25),
             T(bx + nx * w0, by + ny * w0),
             T(ex + nx * w1, ey + ny * w1)]
    mango += [T(ex + w1 * math.cos(math.atan2(ny, nx) - math.pi * i / 16), ey + w1 * math.sin(math.atan2(ny, nx) - math.pi * i / 16)) for i in range(1, 16)]
    mango += [T(ex - nx * w1, ey - ny * w1),
              T(bx - nx * w0, by - ny * w0),
              T(bx - ux * 30 - nx * w0 * 1.25, by - uy * 30 - ny * w0 * 1.25)]
    ink.poly(mango, 1.4)

    # cuerpo: mitad de atrás de la boca + mitad de adelante del fondo (la pared que se ve)
    cuerpo = arco(T, cx, cy, rx, ry, math.pi, 2 * math.pi) + arco(T, cx, cy + pared, rx2, ry2, 0, math.pi)
    ink.poly(cuerpo, 1.6)

    # asa chica del lado opuesto (la de ayuda de las sartenes de hierro)
    ink.poly(arco(T, cx - rx + 4, cy - 2, 48, 30, math.pi * 0.5, math.pi * 1.5, 20), 1.0)

    # adentro: la pared de atrás toma la luz (medialuna clara), el fondo queda en tinta
    # el borde de la boca queda en 16 de tinta arriba (26 a los lados) para que la medialuna se separe chica
    ink.poly(arco(T, cx, cy, rx - 26, ry - 16, 0, 2 * math.pi, 72), 1.2, 'white')
    ink.poly(arco(T, cx + 4, cy + 20, rx - 44, ry - 34, 0, 2 * math.pi, 72), 1.0, 'black2')
    # brillo del fondo: un corte de gubia que acompaña la curva
    ink.stroke(arco(T, cx + 4, cy + 20, rx - 80, ry - 56, math.pi * 1.12, math.pi * 1.52, 16), 9 * s, 4 * s, layer='white', amp=0.4)

    # la pared de adelante: una veta de luz a lo largo
    ink.stroke(arco(T, cx, cy + pared * 0.55, rx * 0.95, ry * 0.95, math.pi * 0.28, math.pi * 0.72, 24), 8 * s, 3 * s, layer='white', amp=0.4)

    # mango: canaleta a lo largo y agujero para colgar
    ink.stroke([T(bx + ux * 30, by + uy * 30), T(bx + ux * (L - 56), by + uy * (L - 56))], 12 * s, 7.5 * s, layer='white', amp=0.4)
    ink.circle(*T(ex - ux * 4, ey - uy * 4), 15 * s, layer='white')


def exportar(fn, png, webp, seed):
    ink = Ink(seed)
    ink.framed = False
    fn(ink, 1.45)
    m = carve(ink, px=1800, seed=seed)
    to_rgba(m, '#111111').save(os.path.join(AQUI, png))
    to_rgba(m, CREMA, size=200).save(os.path.join(AQUI, webp), 'WEBP', quality=85, method=6)
    print(png, webp)


if __name__ == '__main__':
    exportar(E_SARTEN, 'sarten.png', 'sarten.webp', 41)
