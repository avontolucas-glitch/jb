/**
 * Los emblemas de los capítulos de la trilogía flotan muy despacio, como polvo
 * en la luz; entre ellos, algunos de cocina (el universo de chef de Julián). Posiciones y tiempos fijos (iguales en el servidor y en el navegador).
 */
const emblemas = [
  ["receta-0-dos-formatos", "Dos formatos de la mente"],
  ["pensamiento-0-la-palabra", "La palabra"],
  ["biografia-0-primera-imagen", "Primera imagen"],
  ["receta-1-el-sentimiento", "El sentimiento crea la realidad"],
  ["pensamiento-1-libertad-interna", "Libertad interna"],
  ["biografia-1-el-reconocimiento", "El reconocimiento"],
  ["receta-2-bien-y-mal", "Conocedores del bien y el mal"],
  ["pensamiento-2-observador-eterno", "El Observador Eterno"],
  ["biografia-2-el-desastre", "El desastre"],
  ["receta-3-ahora-mismo", "Ahora mismo"],
  ["pensamiento-3-conversaciones-sinceras", "Conversaciones sinceras"],
  ["biografia-3-poner-a-prueba", "Poner a prueba"],
  ["receta-4-la-pesca", "La pesca"],
  ["pensamiento-4-inteligencia-natural", "La inteligencia natural"],
  ["receta-5-cargar-el-estado", "Cargar el estado"],
  ["pensamiento-5-arquetipos", "Arquetipos"],
  ["pensamiento-6-atravesar-el-tiempo", "Atravesar el tiempo"],
  ["tres-clavos", "Los tres clavos"],
  ["surf", "El surf (próximo capítulo)"],
  // el universo de chef de Julián (un plus del sitio: no van en los libros)
  ["cocina-cuchillo", "Cuchillo de chef"],
  ["cocina-sarten", "Sartén"],
  ["cocina-batidor", "Batidor"],
  ["cocina-cuchara", "Cuchara de madera"],
  ["cocina-parrilla", "Parrilla"],
  ["cocina-gorro", "Gorro de chef"],
] as const;

// [izquierda %, tamaño px, duración de subida s, retardo s, vaivén s]
const recorridos = [
  [4, 44, 118, -10, 13], [91, 38, 131, -72, 17], [12, 30, 97, -40, 11], [84, 52, 142, -118, 19],
  [2, 36, 109, -88, 15], [95, 30, 124, -30, 12], [18, 26, 136, -125, 16], [78, 40, 102, -58, 14],
  [7, 50, 150, -140, 18], [88, 28, 115, -6, 13], [46, 24, 160, -95, 21], [15, 34, 128, -62, 15],
  [93, 46, 138, -104, 17], [60, 22, 170, -20, 20], [5, 28, 112, -120, 12], [82, 34, 120, -84, 16],
  [30, 22, 165, -150, 22],
  [50, 46, 132, -66, 18],
  [70, 40, 146, -12, 16],
  // la cocina: chicos y espaciados entre los emblemas, para que se note sin pesar
  [24, 30, 154, -34, 15], [66, 26, 141, -112, 18], [38, 28, 162, -80, 14],
  [86, 32, 149, -52, 17], [56, 28, 158, -136, 19], [10, 30, 144, -100, 16],
];

export default function Flotantes() {
  return (
    <div className="flotantes" aria-hidden="true">
      {emblemas.map(([archivo], i) => {
        const [x, t, dur, ret, vai] = recorridos[i];
        return (
          <div key={archivo} className="flota" style={{ left: `${x}%`, width: t, height: t, animationDuration: `${dur}s`, animationDelay: `${ret}s` }}>
            <div className="vaiven" style={{ animationDuration: `${vai}s`, animationDelay: `${-i * 1.7}s` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/emblemas/${archivo}.webp`} alt="" width={200} height={200} loading="lazy" decoding="async" draggable={false} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
