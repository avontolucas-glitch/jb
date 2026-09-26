/** Estrellas de los grabados que titilan despacio alrededor del ojo. Posiciones fijas (sin azar en el servidor). */
const puntos = [
  [8, 18, 0], [16, 64, 2.1], [24, 32, 4.3], [12, 86, 1.2], [88, 14, 3.1], [80, 42, 0.6], [92, 70, 5.2], [74, 88, 2.7],
  [34, 8, 6.1], [66, 6, 1.8], [38, 90, 3.9], [4, 44, 5.6], [96, 30, 4.7], [40, 78, 0.9], [60, 60, 6.6], [28, 52, 7.3],
];
export default function Estrellas() {
  return (
    <div className="estrellas" aria-hidden="true">
      {puntos.map(([x, y, d], i) => (
        <span key={i} style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${d}s`, width: i % 3 === 0 ? 11 : 7, height: i % 3 === 0 ? 11 : 7 }} />
      ))}
    </div>
  );
}
