"""Datos de la revisión 4: correcciones pedidas por Lucas y las dudas nuevas para la Hoja (4ª pasada)."""

# por ¶ de la revisión 3
CORRECCIONES = [
    {
        'libro': 'receta', 'parrafo': 105,
        'original': 'sobre cualquier cosa que nosotros inventemos tener',
        'corregido': 'sobre cualquier cosa que nosotros imaginemos tener',
        'motivo': 'Lucas: Julián usó «inventemos» como abreviación de «imaginemos» (quiso decir imaginemos). Estaba en la Hoja de la 3ª pasada; queda resuelta.',
    },
    {
        'libro': 'biografia', 'parrafo': 104,
        'original': 'Puedo llorar todo lo que quieras',
        'corregido': 'Podés llorar todo lo que quieras',
        'motivo': 'La frase mezclaba el yo con el vos («Puedo llorar todo lo que quieras… observando cómo vos estás llorando»): error de reconocimiento de voz. Lo notó Lucas; va también a la Hoja para que Julián lo confirme.',
    },
]

# las dudas de la 3ª pasada que ya se resolvieron (por su «original»)
RESUELTAS = {'sobre cualquier cosa que nosotros inventemos tener'}

# las nuevas (el audio agrega las suyas en revision4_audio_hoja.json)
HOJA_NUEVA = [
    {
        'libro': 'biografia', 'parrafo': 104,
        'original': 'Podés llorar todo lo que quieras, pero detrás del que está llorando hay alguien que está muy tranquilo observando cómo vos estás llorando.',
        'propuesta': 'Podés llorar todo lo que quieras, pero detrás del que está llorando hay alguien que está muy tranquilo observando cómo vos estás llorando.',
        'pregunta': 'Decía «Puedo llorar todo lo que quieras», que mezcla el yo con el vos; se corrigió a «Podés llorar». ¿Es lo que dijiste, o era «Puedo llorar todo lo que quiera, pero detrás del que está llorando hay alguien… observando cómo yo estoy llorando»?',
        'editorial': False,
    },
]

try:  # las dudas que dejó la limpieza del audio
    import json, os
    _f = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'revision4_audio_hoja.json')
    if os.path.exists(_f):
        HOJA_NUEVA += json.load(open(_f, encoding='utf-8'))
except Exception as e:  # noqa
    raise
