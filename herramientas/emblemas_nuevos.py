"""
Emblemas nuevos tallados con el mismo motor de grabado de la trilogía:
  - el clavo (flotan tres en el sitio: símbolo de Jesús) y los tres clavos juntos;
  (el surf del futuro capítulo sale del dibujo de Lucas: herramientas/surf_desde_imagen.py).
Salen en alta resolución a diseño/grabados/ y en chico, tinta crema, al sitio.
Uso:  python3 herramientas/emblemas_nuevos.py
"""
import math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from engine import Ink, carve, to_rgba
from designs import TT, rays, spiral_pts

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GRAB = os.path.join(RAIZ, 'diseño', 'grabados')
SITIO = os.path.join(RAIZ, 'sitio', 'public', 'emblemas')
CREMA = '#EFE9DC'


def suave(pts, n=6, cerrado=True):
    """Catmull-Rom: pasa por todos los puntos con curvas suaves (contornos orgánicos)."""
    out = []
    m = len(pts)
    rango = range(m) if cerrado else range(m - 1)
    for i in rango:
        p0, p1, p2, p3 = pts[(i - 1) % m], pts[i], pts[(i + 1) % m], pts[(i + 2) % m]
        for k in range(n):
            t = k / n; t2 = t * t; t3 = t2 * t
            out.append(tuple(0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3) for j in (0, 1)))
    return out


def rot(p, a, c=(0, 0)):
    x, y = p[0] - c[0], p[1] - c[1]
    return (c[0] + x * math.cos(a) - y * math.sin(a), c[1] + x * math.sin(a) + y * math.cos(a))


def clavo(ink, T, s, base=(0, 0), ang=0.0, largo=1.0):
    """Clavo forjado: cabeza martillada, caña cuadrada que se afina; en coordenadas locales apunta hacia abajo."""
    L = largo
    def P(x, y):
        return T(*[a + b for a, b in zip(rot((x, y * L if y > 0 else y), ang), base)])
    ink.poly([P(-50, -22), P(48, -26), P(42, 16), P(-44, 18)], 1.6)          # cabeza
    ink.poly([P(-19, 14), P(19, 14), P(12, 330), P(1, 430), P(-11, 330)], 1.4)  # caña
    ink.stroke([P(5, 34), P(4, 200), P(2, 330)], 6 * s, 2 * s, layer='white', amp=0.4)   # corte de gubia (brillo)
    for x in (-30, -8, 16):                                                    # golpes del martillo
        ink.stroke([P(x, -12), P(x + 12, -2)], 5 * s, 2 * s, layer='white', amp=0.3)


def E_CLAVO(ink, s):
    T = TT(s)
    clavo(ink, T, s, base=(0, -200), largo=0.95)


def E_TRES_CLAVOS(ink, s):
    T = TT(s)
    cx, cy = T(0, -30)
    rays(ink, cx, cy, 250 * s, 330 * s, 26, 8 * s, phase=0.12)
    for ang, dx in ((-0.42, -150), (0.0, 0), (0.42, 150)):
        clavo(ink, T, s, base=(dx, -230 + abs(dx) * 0.25), ang=-ang, largo=0.9)  # las cabezas juntas, las puntas abiertas


def exportar(fn, nombre_grabado, nombre_sitio, seed, fino=False):
    ink = Ink(seed)
    ink.framed = False
    fn(ink, 1.45)
    # el surf lleva figura humana: estampa más fina para no comerse manos y tobillos
    m = carve(ink, px=1800, seed=seed, grain=0.42, bite=0.3) if fino else carve(ink, px=1800, seed=seed)
    to_rgba(m, '#111111').save(os.path.join(GRAB, nombre_grabado))
    to_rgba(m, CREMA, size=200).save(os.path.join(SITIO, nombre_sitio), 'WEBP', quality=85, method=6)
    print(nombre_grabado, nombre_sitio)


if __name__ == '__main__':
    exportar(E_CLAVO, 'Símbolo - El clavo.png', 'clavo.webp', 33)
    exportar(E_TRES_CLAVOS, 'Símbolo - Los tres clavos.png', 'tres-clavos.webp', 34)
