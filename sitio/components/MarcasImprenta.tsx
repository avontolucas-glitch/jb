/** Marcas de corte y registro, como en una prueba de imprenta. */
export default function MarcasImprenta() {
  const esquina = (t: string) => (
    <svg className={`marca-corte ${t}`} width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
      <path d="M0 8.5 H6 M8.5 0 V6" stroke="currentColor" strokeWidth=".8" fill="none" />
    </svg>
  );
  const registro = (t: string) => (
    <svg className={`marca-registro ${t}`} width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <circle cx="9" cy="9" r="4.2" stroke="currentColor" strokeWidth=".7" fill="none" />
      <path d="M9 0 V18 M0 9 H18" stroke="currentColor" strokeWidth=".7" />
    </svg>
  );
  return (
    <div className="marcas" aria-hidden="true">
      {esquina("ai")}
      {esquina("ad")}
      {esquina("bi")}
      {esquina("bd")}
      {registro("ar")}
      {registro("ab")}
    </div>
  );
}
