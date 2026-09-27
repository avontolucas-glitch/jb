"""
Íconos de cocina (el universo chef de Julián) para que floten en el sitio, con los
emblemas: cuchillo de chef, sartén, batidor, cuchara de madera, parrilla y gorro de
chef. Son un plus del sitio: NO van en los libros. Tallados con el mismo motor de
grabado (herramientas/cocina/<ícono>.py: el dibujo y su semilla).
Salen en alta a diseño/grabados/ («Cocina - <nombre>.png») y en chico, tinta crema,
a sitio/public/emblemas/cocina-<ícono>.webp.
Uso:  python3 herramientas/emblemas_cocina.py
"""
import os, runpy, shutil

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
GRAB = os.path.join(RAIZ, 'diseño', 'grabados')
SITIO = os.path.join(RAIZ, 'sitio', 'public', 'emblemas')
ICONOS = {'cuchillo': 'Cuchillo de chef', 'sarten': 'Sartén', 'batidor': 'Batidor', 'cuchara': 'Cuchara de madera', 'parrilla': 'Parrilla', 'gorro': 'Gorro de chef'}

if __name__ == '__main__':
    carpeta = os.path.join(AQUI, 'cocina')
    for k, nombre in ICONOS.items():
        runpy.run_path(os.path.join(carpeta, f'{k}.py'), run_name='__main__')   # escribe <k>.png y <k>.webp al lado
        shutil.move(os.path.join(carpeta, f'{k}.png'), os.path.join(GRAB, f'Cocina - {nombre}.png'))
        shutil.move(os.path.join(carpeta, f'{k}.webp'), os.path.join(SITIO, f'cocina-{k}.webp'))
