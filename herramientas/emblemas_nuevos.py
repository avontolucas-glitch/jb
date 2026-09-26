"""
Emblemas nuevos tallados con el mismo motor de grabado de la trilogía:
  - el clavo (flotan tres en el sitio: símbolo de Jesús) y los tres clavos juntos;
  - el surf (tabla frente a la ola que se enrosca): para un futuro capítulo.
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


def E_SURF(ink, s):
    """Sobre el dibujo de Lucas: surfista musculoso en una tabla corta, la ola en medialunas, espuma que se enrosca; doble anillo."""
    T = TT(s)
    cx, cy = T(0, 0)
    rnd = ink.r
    R = 330
    # doble anillo gastado
    ink.circle(cx, cy, (R + 12) * s)
    ink.circle(cx, cy, (R - 6) * s, layer='white')
    ink.circle(cx, cy, (R - 16) * s, layer='black2')
    ink.circle(cx, cy, (R - 21) * s, layer='white')
    r_in = R - 26
    for _ in range(26):                                   # el anillo se come en algunos puntos
        a = rnd.uniform(0, 2 * math.pi); rr = R + rnd.uniform(-4, 10)
        ink.circle(*T(rr * math.cos(a), rr * math.sin(a)), rnd.uniform(2, 5) * s, layer='white')
    def dentro(x, y, m=0):
        return math.hypot(x, y) < r_in - m
    # el horizonte a los dos lados, en rayas
    for y in (-40, -22, -6, 10):
        for x0 in range(-290, 300, 34):
            x1 = x0 + rnd.uniform(14, 28)
            if dentro(x0, y, 8) and dentro(x1, y, 8) and not (-200 < x0 < 120):
                ink.stroke([T(x0, y), T(x1, y)], rnd.uniform(3, 6) * s, 2 * s)
    # la ola: masa que barre desde la izquierda, sube bajo la tabla y se va hacia abajo a la derecha
    borde = (ink.bez(T(-300, 150), T(-240, 70), T(-120, 10), T(0, 16))
             + ink.bez(T(0, 16), T(90, 22), T(150, 80), T(200, 150))[1:]
             + ink.bez(T(200, 150), T(230, 196), T(270, 214), T(292, 206))[1:])
    a_der = math.atan2(206, 292); a_izq = math.atan2(150, -300)
    arco = [T(r_in * math.cos(a_der + (a_izq - a_der) * i / 48), r_in * math.sin(a_der + (a_izq - a_der) * i / 48)) for i in range(49)]
    ink.poly(borde + arco, 1.6)
    # el tubo: medialunas blancas anidadas (franjas de la ola)
    ox, oy = 10, 250
    for k, rad in enumerate((70, 100, 132, 166, 200, 236)):
        a0, a1 = math.radians(196 + k * 2), math.radians(292 + k * 3)
        pts = [(ox + rad * math.cos(a0 + (a1 - a0) * i / 40), oy + rad * 1.05 * math.sin(a0 + (a1 - a0) * i / 40)) for i in range(41)]
        pts = [p for p in pts if dentro(*p, 6)]
        if len(pts) > 3:
            ink.stroke([T(*p) for p in pts], (11 - k * 0.6) * s, 3 * s, layer='white', amp=0.4)
    for k in range(4):                                    # franjas de la cola de la ola, hacia la derecha
        pts = ink.bez(T(40 + k * 24, 150 + k * 22), T(120 + k * 20, 180 + k * 18), T(190 + k * 14, 214 + k * 10), T(270 - k * 6, 230 + k * 8))
        ink.stroke([p for p in pts if dentro((p[0] - cx) / s, (p[1] - cy) / s, 8)], (8 - k) * s, 2 * s, layer='white', amp=0.3)
    # la espuma: un penacho que sale del labio y se enrosca hacia arriba, y una cascada de gotas a la derecha
    penacho = ink.bez(T(120, 60), T(170, 10), T(220, -60), T(206, -120))
    ink.stroke(penacho, 22 * s, 4 * s)
    for i in range(3, len(penacho) - 2, 3):               # plumas del penacho
        (x0, y0), (x1, y1) = penacho[i - 1], penacho[i + 1]
        dx, dy = x1 - x0, y1 - y0; l = math.hypot(dx, dy) or 1
        nx, ny = -dy / l, dx / l
        lado = 1 if (i // 3) % 2 else -1
        largo = rnd.uniform(14, 26) * s
        ink.stroke([penacho[i], (penacho[i][0] + nx * largo * lado + dx / l * 8 * s, penacho[i][1] + ny * largo * lado + dy / l * 8 * s)], 6 * s, 1.5 * s)
    for _ in range(70):                                   # gotas que caen por la derecha
        t = rnd.random()
        x = 170 + 120 * t + rnd.uniform(-30, 30); y = -60 + 250 * t + rnd.uniform(-30, 30)
        if dentro(x, y, 12):
            ink.circle(*T(x, y), rnd.uniform(3, 10) * (1.2 - t * 0.5) * s)
    # la tabla: corta, punta arriba a la izquierda, con borde blanco
    p0, p1 = (-190, -104), (70, 74)
    ang = math.atan2(p1[1] - p0[1], p1[0] - p0[0]); L = math.hypot(p1[0] - p0[0], p1[1] - p0[1])
    def B(u, v):
        return T(p0[0] + u * math.cos(ang) - v * math.sin(ang), p0[1] + u * math.sin(ang) + v * math.cos(ang))
    def tabla(e):
        return (ink.bez(B(-e, 0), B(40, -30 - e), B(L * 0.62, -30 - e), B(L + e, -4))
                + ink.bez(B(L + e, -4), B(L + 6 + e, 0), B(L + 6 + e, 4), B(L + e, 8))[1:]
                + ink.bez(B(L + e, 8), B(L * 0.62, 30 + e), B(40, 30 + e), B(-e, 0))[1:])
    ink.poly(tabla(12), 1.0, 'white')
    ink.poly(tabla(0), 1.0, 'black2')
    # el surfista: musculoso, agachado, inclinado hacia la ola, un brazo atrás y el otro hacia adelante
    def miembro(pts, anchos):
        for (p, q), (w0, w1) in zip(zip(pts, pts[1:]), anchos):
            ink.stroke([T(*p), T(*q)], w0 * s, w1 * s, layer='black2', taper=False, amp=0.5)
        for (p, (w0, w1)) in zip(pts[1:-1], anchos[1:]):
            ink.circle(*T(*p), w0 * 0.5 * s, layer='black2', amp=0.6)
    ink.poly([T(-72, -206), T(8, -214), T(26, -196), T(10, -160), T(-12, -128), T(-66, -124), T(-72, -160), T(-80, -188)], 1.0, 'black2')  # torso
    ink.circle(*T(-86, -130), 26 * s, layer='black2')                                                  # glúteo hacia atrás
    ink.stroke([T(-10, -214), T(-4, -232)], 20 * s, 18 * s, layer='black2', taper=False)                # cuello
    perfil = [(0, -20), (12, -17), (18, -6), (22, 1), (17, 6), (15, 12), (8, 18), (-3, 20), (-14, 14), (-17, 0), (-14, -12)]
    ink.poly([T(4 + x, -250 + y) for x, y in perfil], 0.8, 'black2')                                    # cabeza de perfil
    for dx, dy, l in ((-10, -266, 22), (-2, -270, 20), (6, -268, 16)):                                  # el mechón de pelo
        ink.stroke([T(dx, dy), T(dx - l, dy - 10)], 7 * s, 2 * s, layer='black2')
    miembro([(-66, -200), (-120, -176), (-168, -150)], [(24, 18), (17, 11)])                            # brazo de atrás
    for ddx, ddy in ((-16, -8), (-18, 2), (-14, 10), (-6, 14)):                                         # mano abierta
        ink.stroke([T(-168, -150), T(-168 + ddx, -150 + ddy)], 5 * s, 2 * s, layer='black2')
    miembro([(12, -200), (60, -160), (88, -104)], [(24, 18), (17, 11)])                                 # brazo de adelante, hacia la ola
    for ddx, ddy in ((4, 18), (10, 14), (14, 8)):
        ink.stroke([T(88, -104), T(88 + ddx, -104 + ddy)], 5 * s, 2 * s, layer='black2')
    miembro([(-80, -120), (-126, -96), (-118, -54)], [(38, 30), (28, 16)])                              # pierna de atrás (arriba en la tabla)
    miembro([(-30, -126), (22, -70), (-4, 12)], [(36, 28), (27, 16)])                                   # pierna de adelante
    for (x, y) in ((-122, -92), (18, -44)):
        ink.circle(*T(x, y), 14 * s, layer='black2', amp=0.6)                                           # pantorrillas
    for (p0_, p1_, w) in [((-54, -196), (-38, -176), 3), ((-6, -200), (-20, -182), 3), ((-100, -170), (-128, -164), 2.5), ((40, -176), (56, -150), 2.5)]:
        ink.stroke([T(*p0_), T(*p1_)], w * s, 1 * s, layer='white', amp=0.2)                            # cortes que marcan el músculo
    for (x, y, a) in ((-118, -54, 0.6), (-4, 12, 0.6)):                                                  # pies sobre la tabla
        pie = [(-22, -6), (24, -8), (26, 6), (-20, 8)]
        ink.poly([T(x + px * math.cos(a) - py * math.sin(a), y + px * math.sin(a) + py * math.cos(a)) for px, py in pie], 0.5, 'black2')
    for _ in range(60):                                   # motas de tinta, como en una estampa gastada
        x, y = rnd.uniform(-300, 300), rnd.uniform(-300, 300)
        if dentro(x, y, 10):
            ink.circle(*T(x, y), rnd.uniform(1.2, 2.6) * s)


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
    exportar(E_SURF, 'Futuro capítulo - Surf.png', 'surf.webp', 35, fino=True)
