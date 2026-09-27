"""
Parrilla (plus de cocina para el fondo del sitio, no va en los libros).
Una sola pieza: la parrilla de hierro de mano, rejilla rectangular en leve perspectiva y
apenas girada, con 4 ranuras anchas de gubia (5 hierros con el marco; con más, a 26 px se empastaba), y el mango largo en
diagonal con su canaleta y el agujero de colgar (el mismo gesto que la sartén y la cuchara).
Sin carbones, sin chispas, sin rombos (el ◆ es el cierre de los libros).
Fuego: se probó con tres lenguas del mismo dibujo que las llamas de la orla de Receta Cap. 5,
pegadas debajo de la rejilla ('fila'), pero con la punta tapada por la rejilla lo que queda a
la vista es el cuerpo redondo con la punta hacia abajo: a 28 px se leían como ruedas o gotas
(un carrito). Queda como variante de estudio, no se exporta por defecto.
Mismo motor de grabado que los emblemas.
Uso:  python3 parrilla.py        (parrilla.png en alta, tinta #111111; parrilla.webp 200 px crema)
      python3 parrilla.py fila   (variante de estudio con fuego: parrilla-fila.*)
"""
import math, os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from engine import Ink, carve, to_rgba
from designs import TT

AQUI = os.path.dirname(os.path.abspath(__file__))
CREMA = '#EFE9DC'


def lengua(ink, T, s, x, y, h, lean, hueco, capa='black', ancho=1.0):
    """una lengua de fuego: la misma curva que flame() de designs.py (llamas de la orla de Receta Cap. 5),
    inclinada `lean` radianes sobre su base, con el corte de luz de adentro si `hueco`."""
    c, sn = math.cos(lean), math.sin(lean)
    def R(px, py):              # (px, py) relativos a la base, y hacia arriba negativa
        return T(x + px * c - py * sn, y + px * sn + py * c)
    P = ink.bez(R(0, 0), R(-h * 0.55 * ancho, -h * 0.35), R(-h * 0.05, -h * 0.7), R(0, -h)) + \
        ink.bez(R(0, -h), R(h * 0.18 * ancho, -h * 0.62), R(h * 0.5 * ancho, -h * 0.4), R(0, 0))[1:]
    ink.poly(P, 0.9, capa)
    if hueco and capa == 'black':
        Q = ink.bez(R(0, -h * 0.12), R(-h * 0.22, -h * 0.3), R(-h * 0.02, -h * 0.5), R(0, -h * 0.62)) + \
            ink.bez(R(0, -h * 0.62), R(h * 0.1, -h * 0.42), R(h * 0.2, -h * 0.3), R(0, -h * 0.12))[1:]
        ink.poly(Q, 0.6, 'white')


def E_PARRILLA(ink, s, fuego=None):
    T = TT(s)
    # --- la rejilla: rectángulo visto un poco desde arriba y apenas girado.
    # G(u, v): u de -1 (izquierda) a 1 (derecha), v de -1 (atrás) a 1 (adelante).
    cx, cy = (-102, -40) if fuego else (-102, 20)   # centrado por la caja de la tinta
    ancho_atras, ancho_adelante = 158, 184     # medio ancho (atrás más angosto: perspectiva)
    fondo = 112                                  # media profundidad en pantalla
    giro = -0.10                                 # leve giro: sube hacia la derecha, hacia el mango

    def G(u, v):
        w = ancho_atras + (ancho_adelante - ancho_atras) * (v + 1) / 2
        x, y = u * w, v * fondo
        c, sn = math.cos(giro), math.sin(giro)
        return (cx + x * c - y * sn, cy + x * sn + y * c)

    if fuego == 'fila':
        # tres lenguas en hilera debajo, con la punta metida bajo la rejilla; cada una con un
        # filo de gubia alrededor para que no se empasten entre sí
        for (u, h, lean) in ((-0.50, 150, -0.16), (0.50, 142, 0.18), (0.0, 196, 0.02)):
            px, py = G(u, 1)
            lengua(ink, T, s, px, py + h * 0.66, h * 1.12, lean, False, 'white', 1.18)
            lengua(ink, T, s, px, py + h * 0.66, h, lean, True)

    # el marco de hierro (esquinas apenas redondeadas)
    marco = []
    for (u0, v0, u1, v1) in ((-1, -1, 1, -1), (1, -1, 1, 1), (1, 1, -1, 1), (-1, 1, -1, -1)):
        for i in range(12):
            t = i / 12
            marco.append(T(*G(u0 + (u1 - u0) * t, v0 + (v1 - v0) * t)))
    ink.poly(marco, 1.6)

    # mango: sale del lado derecho y sube en diagonal; se ensancha hacia la punta
    bx, by = G(1, 0.05)
    ang = -0.62
    L = 214
    ux, uy = math.cos(ang), math.sin(ang)
    nx, ny = -uy, ux
    ex, ey = bx + ux * L, by + uy * L
    w0, w1 = 24, 34
    a_n = math.atan2(ny, nx)
    mango = [T(bx - ux * 34 + nx * w0 * 1.3, by - uy * 34 + ny * w0 * 1.3),
             T(bx + nx * w0, by + ny * w0),
             T(ex + nx * w1, ey + ny * w1)]
    mango += [T(ex + w1 * math.cos(a_n - math.pi * i / 16), ey + w1 * math.sin(a_n - math.pi * i / 16)) for i in range(1, 16)]
    mango += [T(ex - nx * w1, ey - ny * w1),
              T(bx - nx * w0, by - ny * w0),
              T(bx - ux * 34 - nx * w0 * 1.3, by - uy * 34 - ny * w0 * 1.3)]
    ink.poly(mango, 1.4)

    # 4 ranuras anchas de gubia (con 5 la rejilla se empastaba a 26 px): ranuras de gubia de izquierda a derecha, que dejan los hierros en tinta
    n = 4
    for k in range(n):
        v = -1 + (k + 0.5) / n * 2
        v *= 0.84
        a, b = G(-0.84, v), G(0.84, v)
        ink.stroke([T(*a), T(*b)], 25 * s, 27 * s, layer="white", amp=0.5, taper=False)

    # mango: canaleta a lo largo y agujero para colgar
    ink.stroke([T(bx + ux * 26, by + uy * 26), T(bx + ux * (L - 54), by + uy * (L - 54))], 11 * s, 7 * s, layer='white', amp=0.4)
    ink.circle(*T(ex - ux * 4, ey - uy * 4), 14 * s, layer='white')


def exportar(fn, base, seed, **kw):
    ink = Ink(seed)
    ink.framed = False
    fn(ink, 1.45, **kw)
    m = carve(ink, px=1800, seed=seed)
    to_rgba(m, '#111111').save(os.path.join(AQUI, base + '.png'))
    to_rgba(m, CREMA, size=200).save(os.path.join(AQUI, base + '.webp'), 'WEBP', quality=85, method=6)
    print(base)


def prueba(base):
    """lámina de control sobre #080808: el ícono nuevo, la sartén y dos emblemas del sitio, a 200, 52 y 28 px."""
    from PIL import Image
    sitio = '/home/user/jb/sitio/public/emblemas/'
    fila = [os.path.join(AQUI, base + '.webp'), os.path.join(AQUI, 'sarten.webp'),
            sitio + 'clavo.webp', sitio + 'receta-4-la-pesca.webp']
    W = (200 + 52 + 28 + 60) * len(fila) + 40
    lam = Image.new('RGB', (W, 240), '#080808')
    x = 20
    for f in fila:
        im = Image.open(f).convert('RGBA')
        for tam in (200, 52, 28):
            t = im.resize((tam, tam), Image.LANCZOS)
            lam.paste(t, (x, 20 + (200 - tam) // 2), t)
            x += tam + 20
        x += 20
    lam.save(os.path.join(AQUI, base + '-prueba.png'))
    # ampliación ×4 (vecino más cercano) de los chicos del ícono nuevo, para mirarlos de verdad
    z = Image.new('RGB', (52 + 28 + 30, 60), '#080808')
    im = Image.open(fila[0]).convert('RGBA')
    xx = 5
    for tam in (52, 28):
        t = im.resize((tam, tam), Image.LANCZOS)
        z.paste(t, (xx, 4 + (52 - tam) // 2), t)
        xx += tam + 20
    z.resize((z.width * 4, z.height * 4), Image.NEAREST).save(os.path.join(AQUI, base + '-chicos-zoom.png'))


if __name__ == '__main__':
    import sys as _s
    if len(_s.argv) > 1:          # variantes de estudio: python3 parrilla.py fila
        exportar(E_PARRILLA, 'parrilla-' + _s.argv[1], 41, fuego=_s.argv[1])
        prueba('parrilla-' + _s.argv[1])
    else:
        exportar(E_PARRILLA, 'parrilla', 41)
        prueba('parrilla')
