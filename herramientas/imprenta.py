"""
La edición para imprenta de la trilogía, a partir de la revisión 4 (que no se toca).

Julián va a mandar los libros a una imprenta y los veía «muy programados». Lucas pidió
sacar todo lo que «huela a programado o pendiente». A la imprenta no se le manda el Word:
se le manda un PDF de imprenta por libro. Este script arma, para cada libro:

  manuscritos/<Libro> (edición para imprenta).docx   el Word limpio, con sangrado
  imprenta/<Libro> - interior.pdf                    el PDF para la imprenta
  vista previa/<Libro> (vista previa para imprenta).pdf   el mismo PDF, cortado al tamaño final

Lo que se saca (texto de Julián, ni una palabra):
  - las marcas «[versículo propuesto — a confirmar]» de los epígrafes (el versículo queda)
    y cualquier otra marca de trabajo entre corchetes;
  - de la portada y la página de derechos, ELVERBO / ELVERBO EDITORIAL y el «Diseño de
    portada © ELVERBO»; el «Copyright © 2026 por Julián Bermúdez y ELVERBO EDITORIAL» queda
    «Copyright © 2026 Julián Bermúdez»;
  - los ISBN de relleno («[a definir]»): si Julián saca el ISBN, se agrega;
  - la página final «Tu libro, también digital» (el QR y el código para canjear: era un
    concepto de referencia, Lucas: «sácalo»).

Lo que se agrega para la imprenta:
  - sangrado de 0,125" (3 mm) por lado: la página pasa de 5,5×8,5" a 5,75×8,75", los
    márgenes y encabezados se corren lo mismo (la caja de texto no cambia) y los fondos de
    página completa se rehacen para cubrir el sangrado;
  - los fondos a 320 dpi: la textura de cada libro (la misma semilla, ampliada) y los
    grabados tallados de nuevo a esa resolución (el mismo dibujo; si alguno no coincide con
    el de la revisión 4, se usa el original ampliado);
  - páginas en blanco al final hasta un múltiplo de 4 (sin encabezado ni folio);
  - en el PDF, la caja de corte (TrimBox) y la de sangrado (BleedBox), fuentes incrustadas,
    imágenes sin reducir, y el título y el autor en las propiedades.

Uso:  python3 herramientas/imprenta.py
"""
import copy, io, json, os, re, shutil, subprocess, sys, tempfile, zipfile
import numpy as np
from lxml import etree
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
sys.path.insert(0, AQUI)
import respiro
from engine import carve, to_rgba
from designs import build

MS = os.path.join(RAIZ, 'manuscritos')
IMPRENTA = os.path.join(RAIZ, 'imprenta')
VISTA = os.path.join(RAIZ, 'vista previa')
BASE = 'edición integral con sitio, revisión 4'
SALIDA = 'edición para imprenta'
LIBROS = {'receta': 'Receta de La Manifestación', 'pensamiento': 'El Pensamiento es Tu Fe', 'biografia': 'La Biografía'}
TITULO = {'receta': 'La Receta de la Manifestación', 'pensamiento': 'El Pensamiento es Tu Fe', 'biografia': 'La Biografía'}

W = respiro.W
q = respiro.q
texto = respiro.texto
WP = '{http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing}'
A = '{http://schemas.openxmlformats.org/drawingml/2006/main}'
PIC = '{http://schemas.openxmlformats.org/drawingml/2006/picture}'
RR = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}'

SANGRADO_IN = 0.125
SANGRADO_TW = 180              # 0,125" en twips
EMU = 914400                   # EMU por pulgada
DPI = 320                      # 5,5" = 1760 px y 0,125" = 40 px: todo entero
B = int(SANGRADO_IN * DPI)     # 40
TW, TH = int(5.5 * DPI), int(8.5 * DPI)     # la página terminada
FW, FH = TW + 2 * B, TH + 2 * B             # con el sangrado
VIEJO = 200                    # la resolución de los fondos de la revisión 4

CREMA = respiro.CREMA
PAPEL = respiro.PAPEL          # libro → (color del papel, tinta, claro)
LETRA = respiro.CLAVE          # libro → R / P / B


# ───────────────────────── los fondos de página completa ─────────────────────────

def _textura(rgb, seed, claro):
    """La textura del libro (la misma de la revisión 4: misma semilla y tamaño), ampliada a
    DPI y extendida al sangrado por reflejo (en el borde la textura sigue, sin costura)."""
    t = respiro.textura(rgb, seed, claro).resize((TW, TH), Image.LANCZOS)
    a = np.asarray(t)
    return Image.fromarray(np.pad(a, ((B, B), (B, B), (0, 0)), mode='reflect'))


def _liso(rgb):
    return Image.new('RGB', (FW, FH), rgb)


def _grabado(img, clave, enmarcado, cx, arriba, lado, tinta, opacidad, semilla, px):
    m = carve(build(clave, enmarcado), px=px, seed=semilla)
    ic = to_rgba(m, tinta, size=int(lado * DPI), opacity=opacidad)
    img = img.convert('RGBA')
    img.alpha_composite(ic, (int(B + cx * DPI - ic.size[0] / 2), int(B + arriba * DPI)))
    return img.convert('RGB')


def receta_del_fondo(libro, tipo, n):
    """Cómo se hizo cada fondo en la revisión 4 (assets.py, respiro.py, apertura_unida.py,
    portada_negra.py y revision_4.py): (fondo, [grabados]). Cada grabado: (clave, enmarcado,
    centro x, arriba, lado — en pulgadas —, tinta, opacidad, semilla, px del tallado)."""
    rgb, tinta, claro = PAPEL[libro]
    L = LETRA[libro]
    if tipo == 'portadilla':
        return (('liso', (0, 0, 0)) if libro == 'receta' else ('textura', rgb, 1, claro)), []
    if tipo == 'indice':
        return ('textura', rgb, 2, claro), []
    if tipo == 'cap':
        if libro == 'pensamiento':  # la apertura unida: la página blanca con el grabado en su tinta
            return ('liso', (255, 255, 255)), [(f'P{n}', True, 2.75, 0.9, 1.45, '#1E1B18', 0.96, 20 + n, 1400)]
        return ('textura', rgb, 10 + n, claro), [(f'{L}{n}', True, 2.75, 0.9, 1.45, tinta, 0.96, 20 + n, 1400)]
    if tipo == 'transicion':
        clave, semilla_t, semilla = {'receta': ('RT', 30, 31), 'pensamiento': ('P6', 31, 32), 'biografia': ('B2', 32, 33)}[libro]
        return ('textura', rgb, semilla_t, claro), [(clave, True, 2.75, 5.35, 1.15, tinta, 0.96, semilla, 1400)]
    if tipo == 'respiro':
        return ('textura', rgb, 60 + n, claro), [(f'{L}{n}', False, 2.75, 6.55, 0.72, tinta, 0.9, 70 + n, 1100)]
    raise ValueError(tipo)


def pintar(fondo, grabados):
    img = _liso(fondo[1]) if fondo[0] == 'liso' else _textura(*fondo[1:])
    for g in grabados:
        img = _grabado(img, *g)
    return img


def comparar(nuevo, viejo, grabados):
    """Diferencia media con el fondo de la revisión 4 (en su resolución y sin el sangrado):
    en toda la página, y en la zona de cada grabado."""
    from PIL import ImageFilter
    chico = nuevo.crop((B, B, B + TW, B + TH)).resize(viejo.size, Image.LANCZOS)
    n = np.asarray(chico).astype(int)
    v = np.asarray(viejo.convert('RGB')).astype(int)
    total = float(np.abs(n - v).mean())
    # el grabado se compara un poco desenfocado: el tallado tiene su propio azar (grano, bordes,
    # el leve giro del taco) y eso no cuenta; un dibujo distinto da 40 o más, el mismo, menos de 10
    n = np.asarray(chico.filter(ImageFilter.GaussianBlur(2))).astype(int)
    v = np.asarray(viejo.convert('RGB').filter(ImageFilter.GaussianBlur(2))).astype(int)
    zonas = []
    for (_, _, cx, arriba, lado, *_r) in grabados:
        x0, y0 = int((cx - lado / 2) * VIEJO), int(arriba * VIEJO)
        x1, y1 = x0 + int(lado * VIEJO), y0 + int(lado * VIEJO)
        zonas.append(float(np.abs(n[y0:y1, x0:x1] - v[y0:y1, x0:x1]).mean()))
    return total, zonas


def ampliado(viejo):
    """Plan B: el fondo original, ampliado a DPI y extendido al sangrado por reflejo."""
    a = np.asarray(viejo.convert('RGB').resize((TW, TH), Image.LANCZOS))
    return Image.fromarray(np.pad(a, ((B, B), (B, B), (0, 0)), mode='reflect'))


def jpg(img):
    b = io.BytesIO()
    img.save(b, 'JPEG', quality=94, optimize=True, progressive=False, dpi=(DPI, DPI), subsampling=0)
    return b.getvalue()


# ───────────────────────── el texto: lo que se saca ─────────────────────────

def _corridas(p):
    return [r for r in p.iter(q('r')) if r.find(q('t')) is not None]


def _poner_texto(p, s):
    """Deja el párrafo con un solo texto, en el formato de su primera corrida."""
    rs = _corridas(p)
    rs[0].find(q('t')).text = s
    rs[0].find(q('t')).set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    for t in rs[0].findall(q('t'))[1:]:
        rs[0].remove(t)
    for r in rs[1:]:
        r.getparent().remove(r)


def _sacar(p):
    """Saca un párrafo; si cerraba una sección, el salto pasa al párrafo de antes."""
    s = p.find(f'{q("pPr")}/{q("sectPr")}')
    if s is not None:
        prev = p.getprevious()
        ppr = prev.find(q('pPr'))
        if ppr is None:
            ppr = etree.SubElement(prev, q('pPr'))
            prev.insert(0, ppr)
        assert ppr.find(q('sectPr')) is None
        ppr.append(s)
    p.getparent().remove(p)


def limpiar(raiz, libro, log):
    body = raiz.find(q('body'))
    hijos = lambda: [e for e in body if e.tag in (q('p'), q('tbl'))]

    # 1) la portada: ELVERBO abajo (el párrafo se queda vacío: cierra la sección de la portada)
    h = hijos()
    i = next(i for i, e in enumerate(h[:30]) if texto(e).strip() == 'ELVERBO')
    for r in _corridas(h[i]):
        r.getparent().remove(r)
    log.append('portada: sin «ELVERBO»')

    # 2) la página de derechos
    for e in hijos()[:45]:
        s = texto(e)
        t = s.strip().replace('\xa0', ' ').strip()
        if t.startswith('Copyright ©') and 'ELVERBO' in t:
            _poner_texto(e, 'Copyright © 2026 Julián Bermúdez')
            log.append(f'derechos: «{t}» → «Copyright © 2026 Julián Bermúdez»')
        elif t.startswith('ISBN') or t in ('ELVERBO EDITORIAL',) or (t.startswith('Diseño de portada') and 'ELVERBO' in t):
            sig = e.getnext()
            _sacar(e)
            log.append(f'derechos: sin «{t}»')
            # un ISBN deja su renglón vacío de abajo: se va con él (queda un solo espacio)
            if t.startswith('ISBN-10') and sig is not None and not texto(sig).strip(' \xa0') and sig.find(f'{q("pPr")}/{q("sectPr")}') is None:
                _sacar(sig)

    # 3) las marcas de los epígrafes: el párrafo entero; su aire de abajo pasa a la cita
    for e in hijos():
        t = texto(e).strip()
        if t == '[versículo propuesto — a confirmar]':
            prev = e.getprevious()
            sp, spp = e.find(f'{q("pPr")}/{q("spacing")}'), prev.find(f'{q("pPr")}/{q("spacing")}')
            if sp is not None and spp is not None and sp.get(q('after')):
                spp.set(q('after'), sp.get(q('after')))
            _sacar(e)
            log.append(f'epígrafe «{texto(prev).strip()}»: sin «[versículo propuesto — a confirmar]»')

    # 4) la página «Tu libro, también digital» (QR y código): desde su ◆ hasta el final
    h = hijos()
    i = next(i for i, e in enumerate(h) if texto(e).strip() == 'TU LIBRO, TAMBIÉN DIGITAL')
    assert texto(h[i - 1]).strip() == '◆' and h[i - 1].find(f'{q("pPr")}/{q("pageBreakBefore")}') is not None
    for e in h[i - 1:]:
        assert e.find(f'{q("pPr")}/{q("sectPr")}') is None
        body.remove(e)
    log.append('sin la página «Tu libro, también digital» (QR y código para canjear)')

    # 5) que no quede ninguna marca de trabajo entre corchetes
    restos = [(i, texto(e)) for i, e in enumerate(hijos()) if re.search(r'\[[^\]]*\]', texto(e))]
    assert not restos, restos


def sin_aptos(partes):
    """La letra de base del documento era Aptos (la de Word): en algún renglón vacío la
    imprenta vería una fuente que no es la del libro. Pasa a Palatino Linotype."""
    st = partes['word/styles.xml'].decode('utf-8')
    st2 = re.sub(r'(<w:rPrDefault><w:rPr>)<w:rFonts [^>]*/>', r'\1<w:rFonts w:ascii="Palatino Linotype" w:eastAsia="Palatino Linotype" w:hAnsi="Palatino Linotype" w:cs="Palatino Linotype"/>', st, count=1)
    st2 = st2.replace('w:ascii="Aptos"', 'w:ascii="Palatino Linotype"').replace('w:hAnsi="Aptos"', 'w:hAnsi="Palatino Linotype"').replace('w:eastAsia="Aptos"', 'w:eastAsia="Palatino Linotype"').replace('w:cs="Aptos"', 'w:cs="Palatino Linotype"')
    partes['word/styles.xml'] = st2.encode('utf-8')


# ───────────────────────── el sangrado ─────────────────────────

def sangrado(raiz):
    """La página crece 0,125" por lado; márgenes, encabezado y pie se corren lo mismo, así la
    caja de texto queda exactamente donde estaba respecto del corte."""
    n = 0
    for s in raiz.iter(q('sectPr')):
        sz, mg = s.find(q('pgSz')), s.find(q('pgMar'))
        assert sz.get(q('w')) == '7920' and sz.get(q('h')) == '12240', etree.tostring(sz)
        sz.set(q('w'), str(7920 + 2 * SANGRADO_TW))
        sz.set(q('h'), str(12240 + 2 * SANGRADO_TW))
        for k in ('top', 'bottom', 'left', 'right', 'header', 'footer'):
            mg.set(q(k), str(int(mg.get(q(k))) + SANGRADO_TW))
        n += 1
    return n


def fondos(raiz, partes, libro, log):
    """Los fondos de página completa: a la medida con sangrado y a DPI."""
    rels = partes['word/_rels/document.xml.rels'].decode('utf-8')
    body = raiz.find(q('body'))
    hijos = [e for e in body if e.tag in (q('p'), q('tbl'))]
    tx = [texto(e) for e in hijos]
    tabla = []
    for i, e in enumerate(hijos):
        for an in e.iter(WP + 'anchor'):
            nombre = an.find(WP + 'docPr').get('name') or ''
            if not nombre.startswith('Fondo'):
                continue
            ex = an.find(WP + 'extent')
            assert (ex.get('cx'), ex.get('cy')) == ('5029200', '7772400'), (nombre, ex.attrib)
            for p in (an.find(WP + 'positionH'), an.find(WP + 'positionV')):
                assert p.get('relativeFrom') == 'page' and p.find(WP + 'posOffset').text == '0', nombre
            if nombre == 'FondoPortadilla':
                tipo, n = 'portadilla', 0
            elif nombre == 'FondoTOC':
                tipo, n = 'indice', 0
            elif nombre == 'FondoTransicion':
                tipo, n = 'transicion', 0
            elif nombre.startswith('FondoRespiro'):
                tipo, n = 'respiro', int(nombre[len('FondoRespiro'):])
            elif nombre.startswith('FondoCap'):
                # vale el lugar, no el nombre (los números de los nombres son de un orden viejo)
                m = re.fullmatch(r'CAPÍTULO (\d)', tx[i + 1].strip())
                assert m, (nombre, tx[i + 1])
                tipo, n = 'cap', int(m.group(1))
            else:
                raise ValueError(nombre)
            rid = an.find('.//' + A + 'blip').get(RR + 'embed')
            media = 'word/' + re.search(rf'Id="{rid}"[^>]*Target="([^"]+)"', rels).group(1)
            viejo = Image.open(io.BytesIO(partes[media]))
            fondo, grabados = receta_del_fondo(libro, tipo, n)
            nuevo = pintar(fondo, grabados)
            total, zonas = comparar(nuevo, viejo, grabados)
            # misma textura (la diferencia es la del JPG) y el mismo dibujo (el tallado tiene azar propio)
            ok = total < 2.5 and all(z < 20 for z in zonas)
            if not ok:
                nuevo = ampliado(viejo)
            partes[media] = jpg(nuevo)
            # el dibujo cubre la página con el sangrado
            cx, cy = str(int((5.5 + 2 * SANGRADO_IN) * EMU)), str(int((8.5 + 2 * SANGRADO_IN) * EMU))
            ex.set('cx', cx)
            ex.set('cy', cy)
            for x in an.iter(A + 'ext'):
                if x.getparent().tag == A + 'xfrm':
                    x.set('cx', cx)
                    x.set('cy', cy)
            tabla.append((nombre, tipo, n, media, round(total, 2), [round(z, 1) for z in zonas], 'rehecho' if ok else 'original ampliado'))
    log.extend(f'fondo {t[0]} ({t[1]} {t[2]}, {t[3]}): {t[6]} · diferencia {t[4]} · grabado {t[5]}' for t in tabla)
    return tabla


# ───────────────────────── páginas en blanco hasta múltiplo de 4 ─────────────────────────

def en_blanco(raiz, cuantas):
    """Agrega `cuantas` páginas en blanco al final, en una sección sin encabezado ni folio
    (los del cierre de una página de respiro o de la transición, que no llevan nada)."""
    if not cuantas:
        return
    body = raiz.find(q('body'))
    final = body.find(q('sectPr'))
    # las propiedades de una sección sin encabezado ni folio: las de una página de respiro
    vacia = next(x for p in body.iter(q('p')) if texto(p).strip() == respiro.FIRMA
                 for x in [p.find(f'{q("pPr")}/{q("sectPr")}')] if x is not None)
    assert vacia is not None
    # la sección de la tabla final se cierra en su último párrafo, con las propiedades de antes
    ultimo = [e for e in body if e.tag in (q('p'), q('tbl'))][-1]
    if ultimo.tag == q('tbl'):
        ultimo = etree.SubElement(body, q('p'))
        final.addprevious(ultimo)
    ppr = ultimo.find(q('pPr'))
    if ppr is None:
        ppr = etree.Element(q('pPr'))
        ultimo.insert(0, ppr)
    ppr.append(copy.deepcopy(final))
    # la sección nueva, vacía: una página por párrafo
    for k in range(cuantas):
        p = etree.Element(q('p'))
        pp = etree.SubElement(p, q('pPr'))
        if k:
            etree.SubElement(pp, q('pageBreakBefore'))
        final.addprevious(p)
    nueva = copy.deepcopy(vacia)
    for x in nueva.findall(q('pgNumType')):
        nueva.remove(x)
    body.replace(final, nueva)


# ───────────────────────── el PDF ─────────────────────────

FILTRO = json.dumps({
    'ReduceImageResolution': {'type': 'boolean', 'value': 'false'},
    'UseLosslessCompression': {'type': 'boolean', 'value': 'false'},
    'Quality': {'type': 'long', 'value': '95'},
    'EmbedStandardFonts': {'type': 'boolean', 'value': 'true'},
    'ExportBookmarks': {'type': 'boolean', 'value': 'false'},
    'ExportNotes': {'type': 'boolean', 'value': 'false'},
    'UseTaggedPDF': {'type': 'boolean', 'value': 'false'},
})


def a_pdf(docx, carpeta):
    perfil = 'file:///home/user/render/lo_profile'
    subprocess.run(['soffice', f'-env:UserInstallation={perfil}', '--headless', '--convert-to', f'pdf:writer_pdf_Export:{FILTRO}', '--outdir', carpeta, docx],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=1200)
    return os.path.join(carpeta, os.path.splitext(os.path.basename(docx))[0] + '.pdf')


def cajas(pdf, destino, recorte, libro):
    import pymupdf
    d = pymupdf.open(pdf)
    m = SANGRADO_IN * 72
    for p in d:
        r = p.mediabox
        assert abs(r.width - (5.5 + 2 * SANGRADO_IN) * 72) < 0.6 and abs(r.height - (8.5 + 2 * SANGRADO_IN) * 72) < 0.6, r
        p.set_bleedbox(r)
        p.set_trimbox(pymupdf.Rect(r.x0 + m, r.y0 + m, r.x1 - m, r.y1 - m))
    d.set_metadata({'title': TITULO[libro], 'author': 'Julián Bermúdez', 'subject': TITULO[libro], 'creator': '', 'producer': '', 'keywords': ''})
    d.save(destino, garbage=3, deflate=True)
    # la vista previa: el mismo PDF, cortado donde va la cuchilla
    for p in d:
        p.set_cropbox(p.trimbox)
    d.save(recorte, garbage=3, deflate=True)
    n = len(d)
    d.close()
    return n


# ───────────────────────── todo junto ─────────────────────────

def procesar(libro, nombre, tmp):
    log = []
    origen = os.path.join(MS, f'{nombre} ({BASE}).docx')
    destino = os.path.join(MS, f'{nombre} ({SALIDA}).docx')
    with zipfile.ZipFile(origen) as z:
        infos = z.infolist()
        partes = {i.filename: z.read(i.filename) for i in infos}
    raiz = etree.fromstring(partes['word/document.xml'])
    limpiar(raiz, libro, log)
    sin_aptos(partes)
    fondos(raiz, partes, libro, log)
    secciones = sangrado(raiz)

    def guardar(r):
        partes['word/document.xml'] = etree.tostring(r, xml_declaration=True, encoding='UTF-8', standalone=True)
        with zipfile.ZipFile(destino, 'w', zipfile.ZIP_DEFLATED) as out:
            for i in infos:
                out.writestr(i, partes[i.filename])

    # primero sin blancas, para contar las páginas; después, hasta múltiplo de 4
    guardar(raiz)
    pdf = a_pdf(destino, tmp)
    import pymupdf
    paginas = len(pymupdf.open(pdf))
    faltan = (-paginas) % 4
    if faltan:
        r2 = etree.fromstring(partes['word/document.xml'])
        # el sangrado ya está aplicado en el XML guardado: la sección nueva lo copia
        en_blanco(r2, faltan)
        guardar(r2)
        pdf = a_pdf(destino, tmp)
    os.makedirs(IMPRENTA, exist_ok=True)
    final = os.path.join(IMPRENTA, f'{nombre} - interior.pdf')
    vista = os.path.join(VISTA, f'{nombre} (vista previa para imprenta).pdf')
    n = cajas(pdf, final, vista, libro)
    log.append(f'{secciones} secciones con sangrado · {paginas} páginas + {faltan} en blanco = {n}')
    return destino, final, vista, n, log


if __name__ == '__main__':
    solo = sys.argv[1:] or list(LIBROS)
    resumen = {}
    with tempfile.TemporaryDirectory() as tmp:
        for k in solo:
            d, f, v, n, log = procesar(k, LIBROS[k], tmp)
            resumen[k] = {'docx': os.path.relpath(d, RAIZ), 'pdf': os.path.relpath(f, RAIZ), 'vista': os.path.relpath(v, RAIZ), 'paginas': n, 'cambios': log}
            print(f'\n== {LIBROS[k]}: {n} páginas')
            for l in log:
                print('  ·', l)
    with open(os.path.join(IMPRENTA, 'registro.json') if os.path.isdir(IMPRENTA) else os.devnull, 'w', encoding='utf-8') as fh:
        json.dump(resumen, fh, ensure_ascii=False, indent=1)
