"""
Actualiza la lista de temas de la música de fondo del sitio con los de la
playlist de Julián en Spotify («The Way It Is»). Lee la página pública del
reproductor de Spotify y escribe los ids en sitio/content/musica.ts.
Uso:  python3 herramientas/musica_playlist.py
"""
import os, re, urllib.request

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESTINO = os.path.join(RAIZ, 'sitio', 'content', 'musica.ts')
PLAYLIST = '6kKcFrfXA72AnV8tfMIRUE'

pedido = urllib.request.Request(f'https://open.spotify.com/embed/playlist/{PLAYLIST}', headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(pedido, timeout=30).read().decode('utf-8', 'replace')
ids = []
for m in re.finditer(r'"uri":"spotify:track:([A-Za-z0-9]{22})"', html):
    if m.group(1) not in ids:
        ids.append(m.group(1))
if not ids:
    raise SystemExit('No se encontraron temas: la página de Spotify cambió o no respondió.')

s = open(DESTINO, encoding='utf-8').read()
cuerpo = '\n'.join('  ' + ', '.join(f'"{x}"' for x in ids[i:i + 4]) + ',' for i in range(0, len(ids), 4))
s = re.sub(r'export const temas: string\[\] = \[\n.*?\n\];', 'export const temas: string[] = [\n' + cuerpo + '\n];', s, flags=re.S)
open(DESTINO, 'w', encoding='utf-8').write(s)
print(len(ids), 'temas')
