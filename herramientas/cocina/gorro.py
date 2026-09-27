"""
Gorro de chef (toque blanche) — plus de cocina para el sitio; no va en los libros.
Mismo motor de grabado que los emblemas de la trilogía: copa alta que se abre apenas
hacia arriba, con los pliegues tallados a gubia en cuña; arriba el copete inflado en lóbulos,
con la media luna de sombra a la derecha; abajo la banda curva (cilindro visto de arriba),
separada por un corte grueso. Revisión del director de arte: escala 0,82 y tinta ~17 %.
Uso:  python3 gorro.py
"""
import math, os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from engine import Ink, carve, to_rgba
from designs import TT
from emblemas_nuevos import suave

AQUI = os.path.dirname(os.path.abspath(__file__))
CREMA = '#EFE9DC'
SEMILLA = 57


def gorro(ink, T, s, dy=0):
    def P(x, y):
        return T(x, y + dy)

    def curva(y0, w, caida):
        """borde de un cilindro visto desde arriba: media elipse que baja en el medio."""
        return lambda x: y0 + caida * math.sqrt(max(0.0, 1 - (x / w) ** 2))

    # --- banda: el aro de abajo, un poco más ancho que la copa, curvado como cilindro
    WB, CAIDA = 116, 34
    arriba, abajo = curva(158, WB, CAIDA), curva(220, WB, CAIDA)
    xs = [WB * math.sin(math.pi / 2 * (i / 20 * 2 - 1)) for i in range(21)]
    ink.poly([P(x, arriba(x)) for x in xs] + [P(x, abajo(x)) for x in xs[::-1]], 1.4)

    # --- copa: alta, se abre hacia arriba como tela que se infla (96 abajo, 142 arriba);
    #     el pie sigue la curva de la banda
    Y0, Y1 = 158, -112
    def ancho(y):  # medio ancho de la copa a la altura y
        t = (Y0 - y) / (Y0 - Y1)
        return 96 + 46 * t ** 1.6
    ys = [Y0 - (Y0 - Y1) * i / 24 for i in range(25)]
    pie = [P(96 * (1 - 2 * i / 16), arriba(96 * (1 - 2 * i / 16))) for i in range(1, 16)]
    ink.poly([P(-ancho(y), y) for y in ys] + [P(ancho(y), y) for y in ys[::-1]] + pie, 1.5)

    # --- copete: la tela inflada arriba, en tres lóbulos marcados, que vuela sobre la copa
    copete = [(-140, -96), (-186, -126), (-202, -178), (-184, -228), (-136, -254),
              (-96, -262), (-72, -292), (-34, -312), (0, -320), (34, -312),
              (72, -292), (96, -262), (136, -254), (184, -228), (202, -178),
              (186, -126), (140, -96), (60, -84), (-60, -84)]
    ink.poly([P(x, y) for x, y in suave(copete, n=6)], 1.6)

    # --- cortes de gubia
    # sombra del copete sobre la copa (el vuelo de la tela)
    ink.stroke([P(x, -88 + 16 * (1 - (x / 142) ** 2)) for x in range(-136, 137, 10)],
               18 * s, 11 * s, layer='white', amp=0.35)
    # separación de la banda: sigue la curva del aro, gruesa
    ink.stroke([P(x, arriba(x) - 2) for x in xs[1:-1]],
               26 * s, 26 * s, layer='white', amp=0.3, taper=False)
    # pliegues de la copa: cuatro cuñas que nacen anchas bajo el copete y se cierran hacia abajo
    #     (la tela plegada que se abre hacia arriba), sin llegar a la banda
    for f in (-0.62, -0.21, 0.21, 0.62):
        y0 = -66 + 8 * abs(f)
        y1 = (96 if abs(f) < 0.5 else 70)
        hw = 16 if abs(f) < 0.5 else 14         # medio ancho de la boca (1,6x el pliegue viejo)
        n = 8
        eje = [(f * ancho(y0 + (y1 - y0) * k / n) * (1 - 0.1 * k / n), y0 + (y1 - y0) * k / n) for k in range(n + 1)]
        izq = [(x - hw * (1 - k / n) ** 1.25 - 1.5, y) for k, (x, y) in enumerate(eje)]
        der = [(x + hw * (1 - k / n) ** 1.25 + 1.5, y) for k, (x, y) in enumerate(eje)]
        boca = [(eje[0][0] - hw * 0.5, y0 - 5), (eje[0][0] + hw * 0.5, y0 - 5)]
        ink.poly([P(*p) for p in izq[::-1] + boca + der], 0.5, layer='white')
    # sombra del copete: media luna en el lateral derecho (lado de sombra, como el fruto)
    externa = [(114, -234), (146, -222), (164, -200), (168, -172), (160, -144), (142, -124), (118, -116)]
    interna = [(130, -132), (142, -150), (146, -172), (140, -196), (126, -216)]
    ink.poly([P(x, y) for x, y in suave(externa + interna, n=5)], 0.6, layer='white')
    # pliegue del valle izquierdo del copete (el derecho lo absorbe la sombra)
    ink.stroke(ink.bez(P(-88, -250), P(-118, -180), P(-96, -122)),
               15 * s, 6 * s, layer='white', amp=0.35)
    # pliegue del valle derecho, corto
    ink.stroke(ink.bez(P(88, -262), P(96, -240), P(98, -216)), 10 * s, 4 * s, layer='white', amp=0.3)
    # brillo del lóbulo central
    ink.stroke(ink.bez(P(-26, -270), P(-40, -220), P(-30, -168)), 8 * s, 3 * s, layer='white', amp=0.3)


def E_GORRO(ink, s):
    s = s * 0.82          # el gorro pesaba el doble que el resto de la serie: escala 0,82 (1,45 -> 1,19)
    T = TT(s)
    gorro(ink, T, s, dy=24)


def exportar(fn, nombre_png, nombre_webp, seed):
    ink = Ink(seed)
    ink.framed = False
    fn(ink, 1.45)
    m = carve(ink, px=1800, seed=seed)
    to_rgba(m, '#111111').save(os.path.join(AQUI, nombre_png))
    to_rgba(m, CREMA, size=200).save(os.path.join(AQUI, nombre_webp), 'WEBP', quality=85, method=6)
    print(nombre_png, nombre_webp)


if __name__ == '__main__':
    exportar(E_GORRO, 'gorro.png', 'gorro.webp', SEMILLA)
