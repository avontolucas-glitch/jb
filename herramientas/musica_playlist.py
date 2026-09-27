"""
Actualiza la lista de temas de la música de fondo del sitio con los de la
playlist de Julián en Spotify («The Way It Is»). Lee la página pública del
reproductor de Spotify y escribe en sitio/content/musica.ts los ids y, para que
Yo Da pueda comentar lo que suena, el título y el artista de cada tema.
Uso:  python3 herramientas/musica_playlist.py
"""
import json, os, re, urllib.request

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESTINO = os.path.join(RAIZ, 'sitio', 'content', 'musica.ts')
PLAYLIST = '6kKcFrfXA72AnV8tfMIRUE'

def limpiar_titulo(t):
    """«Money For Nothing - Remastered 1996» → «Money For Nothing»; «Talking In Your Sleep (2023 Remaster)» → «Talking In Your Sleep»."""
    t = re.sub(r'\s*\((?:\d{4}\s*)?(?:Digital\s*)?Remaster(?:ed)?(?:\s*\d{4})?\)', '', t)
    t = re.sub(r'\s+-\s+(?:.*Remaster.*|.*Radio (?:Edit|Version).*|.*Single (?:Version|Mix).*|From ".*|MTV Unplugged|Remix)$', '', t)
    return t.strip()


pedido = urllib.request.Request(f'https://open.spotify.com/embed/playlist/{PLAYLIST}', headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(pedido, timeout=30).read().decode('utf-8', 'replace')
ids, fichas = [], {}
datos = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', html, re.S)
if datos:
    lista = json.loads(datos.group(1))['props']['pageProps']['state']['data']['entity'].get('trackList', [])
    for t in lista:
        m = re.fullmatch(r'spotify:track:([A-Za-z0-9]{22})', t.get('uri', ''))
        if not m or m.group(1) in fichas:
            continue
        ids.append(m.group(1))
        fichas[m.group(1)] = (limpiar_titulo(t.get('title', '')), re.sub(r'\s+', ' ', t.get('subtitle', '').replace('\xa0', ' ')).strip())
if not ids:   # si cambió la página: al menos los ids
    for m in re.finditer(r'"uri":"spotify:track:([A-Za-z0-9]{22})"', html):
        if m.group(1) not in ids:
            ids.append(m.group(1))
if not ids:
    raise SystemExit('No se encontraron temas: la página de Spotify cambió o no respondió.')

s = open(DESTINO, encoding='utf-8').read()
cuerpo = '\n'.join('  ' + ', '.join(f'"{x}"' for x in ids[i:i + 4]) + ',' for i in range(0, len(ids), 4))
s = re.sub(r'export const temas: string\[\] = \[\n.*?\n\];', 'export const temas: string[] = [\n' + cuerpo + '\n];', s, flags=re.S)
if fichas:
    js = lambda x: json.dumps(x, ensure_ascii=False)
    cuerpo_f = '\n'.join(f'  "{i}": [{js(fichas[i][0])}, {js(fichas[i][1])}],' for i in ids if i in fichas)
    bloque = 'export const fichas: Record<string, [titulo: string, artista: string]> = {\n' + cuerpo_f + '\n};'
    if 'export const fichas' in s:
        s = re.sub(r'export const fichas: Record<string, \[titulo: string, artista: string\]> = \{\n.*?\n\};', lambda _: bloque, s, flags=re.S)
    else:
        s = s.rstrip() + '\n\n/** Título y artista de cada tema (para que Yo Da comente lo que suena). */\n' + bloque + '\n'
open(DESTINO, 'w', encoding='utf-8').write(s)
print(len(ids), 'temas,', len(fichas), 'con título y artista')
