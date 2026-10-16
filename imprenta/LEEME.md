# Los libros para la imprenta

Esta carpeta es lo que se le manda a la imprenta. Para cada libro hay:

| Archivo | Qué es |
|---|---|
| `<Libro> - interior.pdf` | El interior completo, con sangrado. |
| `<Libro> - tapa, lomo y contratapa (lomo X mm).pdf` | La tapa en un solo pliego: contratapa, lomo y tapa. |
| `<Libro> - tapa.pdf` y `<Libro> - contratapa.pdf` | La tapa y la contratapa por separado, por si la imprenta las arma ella o el libro va abrochado. |

Para mirarlos tal como quedan después del corte, están las vistas previas en `vista previa/<Libro> (vista previa para imprenta).pdf`.

## Especificaciones (para pasarle a la imprenta)

- **Formato final:** 5,5 × 8,5" (139,7 × 215,9 mm).
- **Sangrado:** 0,125" (3,2 mm) por lado. Cada página del PDF mide 5,75 × 8,75" y trae marcada la caja de corte (TrimBox) y la de sangrado (BleedBox).
- **Páginas del interior:**
  - La Receta de la Manifestación: 76.
  - El Pensamiento es Tu Fe: 52 (las últimas 3, en blanco).
  - La Biografía: 36 (las últimas 2, en blanco).

  Las tres son múltiplo de 4. Las páginas en blanco no llevan folio.
- **Interior a color:** la Receta tiene todas las páginas negras y la Biografía, azul marino. El Pensamiento es blanco, con algunas páginas de fondo crema.
- **Fuentes:** van incrustadas en el PDF. La letra es TeX Gyre Pagella, equivalente a Palatino.
- **Imágenes:**
  - fondos y grabados del interior a 320 dpi;
  - tapas a 300 dpi.
- **Color:** el PDF va en RGB. Pedile a la imprenta que lo convierta con su perfil, o que te diga qué perfil CMYK usa y se rehace en CMYK.

## Lo que hay que hablar con la imprenta

1. **Prueba de color antes de tirar todo.** Las páginas enteras en negro o azul son lo más delicado: hay que ver cómo salen en su máquina y en su papel (densidad del negro, que no se transfiera tinta de una página a la otra).
2. **El papel define el lomo.** El pliego de tapa trae un lomo estimado para papel obra de 80 g: Receta 4,3 mm, Pensamiento 3,1 mm, Biografía 2,3 mm. Cuando la imprenta diga qué papel usa, el pliego se rehace con el lomo exacto:

   ```
   python3 herramientas/imprenta_tapas.py receta=4.3 pensamiento=3.1 biografia=2.3
   ```

   Con menos de 6 mm de lomo no entra texto: el lomo va liso, del color del libro.
3. **Encuadernación.** Con estas pocas páginas, los tres pueden ir **abrochados (con grapa)**. Si van en rústica (pegados), la Biografía queda con un lomo muy finito. Para abrochados se usan la tapa y la contratapa por separado, o el pliego con lomo 0.
4. **ISBN.** Por ahora no tienen (se sacó el «[a definir]»). Si Julián lo tramita (Cámara Argentina del Libro), se agrega en la página de derechos y el código de barras va en la contratapa, abajo a la derecha, donde ya queda el lugar libre.

## Qué se sacó para esta versión (y nada del texto de Julián)

- **Marcas «a confirmar» de los epígrafes:** los «[versículo propuesto — a confirmar]». Los versículos quedan.
- **Portada:** «ELVERBO».
- **Página de derechos:**
  - «ELVERBO EDITORIAL» y «Diseño de portada © ELVERBO»;
  - el copyright queda «Copyright © 2026 Julián Bermúdez»;
  - los ISBN de relleno.
- **Página final «Tu libro, también digital»:** el QR y el código para canjear.
- **Tapas:** «ELVERBO» y «julianbermudez.com». La dirección se vuelve a poner en un minuto cuando el dominio esté andando: `SITIO = True` en `herramientas/imprenta_tapas.py`.

## Cómo se rehacen

```
python3 herramientas/imprenta.py          # los tres interiores (o: receta / pensamiento / biografia)
python3 herramientas/imprenta_tapas.py    # las tapas
```

Parten de la revisión 4 (`manuscritos/<Libro> (edición integral con sitio, revisión 4).docx`), que no se toca. El Word de esta versión queda en `manuscritos/<Libro> (edición para imprenta).docx`. Ese Word ya trae el sangrado: la página mide 5,75 × 8,75". Lo que va a la imprenta es el PDF.
