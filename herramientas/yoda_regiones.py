"""
Escribe sitio/content/yoda-regiones.ts (cómo se habla en cada país, para Yo Da)
a partir de las fichas por país en JSON ({"regiones": [...]}), escritas y
revisadas por zona. Controla que estén completas, deja las listas de detección
en minúsculas, sin tildes ni signos y sin repetidos, y avisa lo raro.
Uso:  python3 herramientas/yoda_regiones.py fichas.json
"""
import json, os, re, sys, unicodedata

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESTINO = os.path.join(RAIZ, 'sitio', 'content', 'yoda-regiones.ts')
LISTAS = ['pistas', 'saludos', 'comoEstas', 'gracias', 'chau', 'si', 'no', 'risas', 'genial', 'enojo', 'vocativos', 'trampas']
RESPUESTAS = ['saludo', 'comoEstas', 'gracias', 'chau', 'noEntendi', 'enojo', 'risa', 'genial', 'dale', 'no']
CANONICOS = ['plata', 'precio', 'pagar', 'celular', 'computadora', 'no funciona', 'entrada', 'turno', 'clave', 'descargar', 'aburrido', 'cansado', 'chiste', 'trabajo']
# palabras que en algunos países significan otra cosa: como sinónimo confundirían a Yo Da
# («cancelar» = pagar en Colombia o Perú, pero en el sitio es arrepentirse de una compra)
AMBIGUAS = {'cancelar', 'coger', 'pasar', 'bajar', 'sacar', 'tomar', 'dar', 'poner', 'llevar', 'correr', 'andar', 'parar', 'contra', 'pass', 'no va', 'va', 'pena', 'guagua'}
ORDEN = ['ar', 'uy', 'py', 'bo', 'cl', 'pe', 'ec', 'co', 've', 'mx', 'gt', 'sv', 'hn', 'ni', 'cr', 'pa', 'cu', 'do', 'pr', 'us', 'es', 'gq', 'br', 'en']


def normal(x):
    """Como limpiar() de content/yoda-habla.ts, sin las abreviaturas: minúsculas, sin tildes ni signos."""
    x = unicodedata.normalize('NFD', x.lower())
    x = ''.join(c for c in x if unicodedata.category(c) != 'Mn')
    x = re.sub(r"['’`´]", '', x)
    x = re.sub(r'[^\w\s]', ' ', x)
    return re.sub(r'\s+', ' ', x).strip()


def lista(xs):
    vistos, out = set(), []
    for x in xs or []:
        n = normal(x) if isinstance(x, str) else ''
        if n and n not in vistos:
            vistos.add(n)
            out.append(n)
    return out


def main(ruta):
    datos = json.load(open(ruta, encoding='utf-8'))
    fichas, avisos = {}, []
    for r in datos['regiones']:
        rid = r['id'].strip().lower()
        if rid in fichas:   # si una zona repitió un país, se juntan las listas
            base = fichas[rid]
            for k in LISTAS:
                base[k] = lista(base[k] + r.get(k, []))
            continue
        f = {'id': rid, 'nombre': r['nombre'].strip(), 'tratamiento': r.get('tratamiento', 'tu')}
        for k in LISTAS:
            f[k] = lista(r.get(k, []))
        sin = r.get('sinonimos') or {}
        f['sinonimos'] = {}
        for c in CANONICOS:
            xs = [x for x in lista(sin.get(c, [])) if x not in AMBIGUAS and x != c]
            quitadas = [x for x in lista(sin.get(c, [])) if x in AMBIGUAS]
            if quitadas:
                avisos.append(f'{rid}: sinónimos ambiguos de «{c}» que no se usan: {", ".join(quitadas)}')
            if xs:
                f['sinonimos'][c] = xs
        f['trampas'] = [t.strip() for t in r.get('trampas', []) if isinstance(t, str) and t.strip()]
        f['respuestas'] = {}
        for k in RESPUESTAS:
            rs = [x.strip() for x in (r.get('respuestas') or {}).get(k, []) if isinstance(x, str) and x.strip()]
            for x in rs:
                if len(x) > 200:
                    avisos.append(f'{rid}.{k}: respuesta larga ({len(x)}): {x[:60]}…')
            if not rs:
                avisos.append(f'{rid}: sin respuestas «{k}»')
            f['respuestas'][k] = rs
        if not f['pistas']:
            avisos.append(f'{rid}: sin pistas')
        fichas[rid] = f
    orden = sorted(fichas.values(), key=lambda f: ORDEN.index(f['id']) if f['id'] in ORDEN else 99)
    assert 'ar' in fichas, 'falta la ficha de Argentina (la voz de base de Yo Da)'
    cab = open(DESTINO, encoding='utf-8').read().split('export const REGIONES')[0]
    cuerpo = ',\n'.join('  ' + json.dumps(f, ensure_ascii=False) for f in orden)
    open(DESTINO, 'w', encoding='utf-8').write(cab + 'export const REGIONES: Ficha[] = [\n' + cuerpo + ',\n];\n')
    print(len(orden), 'países:', ', '.join(f"{f['id']} ({len(f['pistas'])} pistas, {sum(len(f[k]) for k in LISTAS)} expresiones)" for f in orden))
    for a in avisos:
        print('  aviso:', a)


if __name__ == '__main__':
    main(sys.argv[1])
