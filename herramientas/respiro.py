"""
Páginas de respiro: lo que Julián escribió en sus canales de Instagram (THE CHANNEL),
en una página propia al final de un capítulo (después del cierre ◆ ◆ ◆ y antes de la
apertura del siguiente), con el mismo armado que la página de transición de cada libro:
la textura del libro de fondo, el texto centrado en itálica y, abajo, el emblema del
capítulo, chico y sin marco (la transición lleva el suyo enmarcado), y la firma
«JULIÁN BERMÚDEZ». En el libro no se aclara de dónde salen (Lucas: «THE CHANNEL», solo
en el sitio). Sin encabezado ni folio, como la transición.
Qué va en cada libro y capítulo: revision4_respiro.json (curaduría por libro,
arbitraje y verificación letra por letra contra fuentes/canal-de-julian.md).
Lo usa revision_4.py.
"""
import copy, io, math, os, re, sys
import numpy as np
from PIL import Image, ImageFilter
from lxml import etree

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from engine import carve, to_rgba
from designs import build

W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
q = lambda t: f'{{{W}}}{t}'
FIRMA = 'JULIÁN BERMÚDEZ'

# el mismo papel que assets.py (la textura de cada libro)
DPI = 200
PW, PH = int(5.5 * DPI), int(8.5 * DPI)
CREMA = '#ECE5D4'
PAPEL = {'receta': ((9, 9, 9), CREMA, False), 'pensamiento': ((251, 249, 244), '#1E1B18', True), 'biografia': ((15, 36, 62), CREMA, False)}
CLAVE = {'receta': 'R', 'pensamiento': 'P', 'biografia': 'B'}


def textura(rgb, seed, claro=False):
    rng = np.random.default_rng(seed)
    base = np.ones((PH, PW, 3), np.float32) * np.array(rgb, np.float32)
    n = rng.standard_normal((PH, PW)).astype(np.float32)
    g = np.asarray(Image.fromarray(((n - n.min()) / (np.ptp(n)) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))).astype(np.float32) / 255 - 0.5
    fib = rng.standard_normal((PH // 6, PW // 2)).astype(np.float32)
    fib = np.asarray(Image.fromarray(((fib - fib.min()) / np.ptp(fib) * 255).astype(np.uint8)).resize((PW, PH), Image.BICUBIC)).astype(np.float32) / 255 - 0.5
    amp = 7 if claro else 9
    base += (g * amp + fib * amp * 0.6)[..., None]
    yy, xx = np.mgrid[0:PH, 0:PW]
    d = np.sqrt(((xx - PW / 2) / (PW / 2)) ** 2 + ((yy - PH / 2) / (PH / 2)) ** 2)
    vig = np.clip(d - 0.55, 0, 1) ** 1.6
    base *= (1 - vig * (0.10 if claro else 0.35))[..., None]
    return Image.fromarray(np.clip(base, 0, 255).astype(np.uint8), 'RGB')


def fondo(libro, cap):
    """El fondo de la página: la textura del libro y el emblema del capítulo, chico y sin marco, abajo."""
    rgb, tinta, claro = PAPEL[libro]
    img = textura(rgb, 60 + cap, claro).convert('RGBA')
    m = carve(build(f'{CLAVE[libro]}{cap}', False), px=1100, seed=70 + cap)
    tam = int(0.72 * DPI)
    ic = to_rgba(m, tinta, size=tam, opacity=0.9)
    img.alpha_composite(ic, (int(PW / 2 - ic.size[0] / 2), int(6.55 * DPI)))
    b = io.BytesIO()
    img.convert('RGB').save(b, 'JPEG', quality=86, optimize=True, progressive=True)
    return b.getvalue()


def texto(e):
    return ''.join(t.text or '' for t in e.iter(q('t')))


def _run(rpr, s):
    r = etree.Element(q('r'))
    r.append(copy.deepcopy(rpr))
    t = etree.SubElement(r, q('t'))
    t.text = s
    t.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    return r


def agregar(libro, raiz, partes, paginas):
    """Suma las páginas de respiro de `libro` al documento (raiz: el w:document; partes: el zip en memoria)."""
    mias = [p for p in paginas if p['libro'] == libro]
    if not mias:
        return []
    body = raiz.find(q('body'))
    hijos = [e for e in body if e.tag in (q('p'), q('tbl'))]
    tx = [texto(e) for e in hijos]
    # el molde: la página de transición (el párrafo con el fondo «FondoTransicion»)
    t = next(i for i, e in enumerate(hijos) if any('Transici' in (d.get('name') or '') for d in e.iter('{http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing}docPr')))
    trans = hijos[t]
    espaciador = hijos[t - 1]
    assert not tx[t - 1].strip()
    ppr_t = trans.find(q('pPr'))
    sect = copy.deepcopy(ppr_t.find(q('sectPr')))
    corrida_fondo = next(r for r in trans.iter(q('r')) if r.find(q('drawing')) is not None)
    rpr_texto = next(r for r in trans.iter(q('r')) if r.find(q('t')) is not None).find(q('rPr'))
    # la firma, con el tono de «CAPÍTULO N»
    cap_i = next(i for i, s in enumerate(tx) if re.fullmatch(r'CAPÍTULO \d', s.strip()))
    rpr_firma = copy.deepcopy(next(r for r in hijos[cap_i].iter(q('r')) if r.find(q('t')) is not None).find(q('rPr')))
    for tag, v in (('sz', '14'), ('szCs', '14')):
        el = rpr_firma.find(q(tag))
        if el is not None:
            el.set(q('val'), v)

    rels = partes['word/_rels/document.xml.rels'].decode('utf-8')
    hechas = []
    for p in sorted(mias, key=lambda x: x['capitulo'], reverse=True):
        n = p['capitulo']
        # el cierre ◆ ◆ ◆ del capítulo n (lleva el salto de sección del capítulo)
        hijos = [e for e in body if e.tag in (q('p'), q('tbl'))]
        tx = [texto(e) for e in hijos]
        ini = next(i for i, s in enumerate(tx) if s.strip() == f'CAPÍTULO {n}')
        cierre = next(i for i in range(ini, len(tx)) if tx[i].strip() == '◆ ◆ ◆')
        assert hijos[cierre].find(f'{q("pPr")}/{q("sectPr")}') is not None, f'{libro} Cap. {n}: el cierre no cierra la sección'

        # la imagen de fondo
        media = f'media/respiro_cap{n}.jpg'
        partes[f'word/{media}'] = fondo(libro, n)
        rid = f'rIdResp{n}'
        rels = rels.replace('</Relationships>', f'<Relationship Id="{rid}" Type="{R}/image" Target="{media}"/></Relationships>')
        fondo_run = copy.deepcopy(corrida_fondo)
        for bl in fondo_run.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}blip'):
            bl.set(f'{{{R}}}embed', rid)
        for d in list(fondo_run.iter('{http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing}docPr')) + list(fondo_run.iter('{http://schemas.openxmlformats.org/drawingml/2006/picture}cNvPr')):
            d.set('id', str(9600 + n))
            d.set('name', f'FondoRespiro{n}')
        an = fondo_run.find('.//{http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing}anchor')
        if an is not None:
            an.set('relativeHeight', str(9600 + n))

        parrafos = [s.strip() for s in p['texto'].split('\n') if s.strip()]
        palabras = sum(len(s.split()) for s in parrafos)
        tam = '26' if palabras <= 30 else '24' if palabras <= 60 else '22'
        rpr = copy.deepcopy(rpr_texto)
        for tag in ('sz', 'szCs'):
            el = rpr.find(q(tag))
            if el is not None:
                el.set(q('val'), tam)
        # arriba, un aire que se achica con el largo del texto (el texto nunca pisa el emblema de abajo)
        nuevos = [copy.deepcopy(espaciador) for _ in range(max(1, 7 - math.ceil(palabras / 13)))]
        base_ppr = copy.deepcopy(ppr_t)
        base_ppr.remove(base_ppr.find(q('sectPr')))
        for j, s in enumerate(parrafos):
            par = etree.Element(q('p'))
            pp = copy.deepcopy(base_ppr)
            if j:
                sp = pp.find(q('spacing'))
                if sp is not None:
                    sp.set(q('before'), '160')
            par.append(pp)
            if j == 0:
                par.append(fondo_run)
            par.append(_run(rpr, s))
            nuevos.append(par)
        firma = etree.Element(q('p'))
        fp = copy.deepcopy(base_ppr)
        sp = fp.find(q('spacing'))
        if sp is not None:
            sp.set(q('before'), '300')
        ind = fp.find(q('ind'))
        if ind is not None:
            fp.remove(ind)
        fp.append(copy.deepcopy(sect))
        firma.append(fp)
        firma.append(_run(rpr_firma, FIRMA))
        nuevos.append(firma)
        punto = hijos[cierre]
        for e in nuevos:
            punto.addnext(e)
            punto = e
        hechas.append((n, palabras))
    partes['word/_rels/document.xml.rels'] = rels.encode('utf-8')
    return sorted(hechas)
