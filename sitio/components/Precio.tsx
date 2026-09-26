export default function Precio({ monto, moneda, aDefinir }: { monto: number; moneda: string; aDefinir: boolean }) {
  return (
    <span>
      {moneda} {monto}
      {aDefinir && <span className="texto-2 text-sm"> (a definir)</span>}
    </span>
  );
}
