/**
 * El título aparece letra por letra, como tinta que se asienta.
 * Con `lineas`, cada palabra va en su renglón (con la sangría que se indique).
 */
export default function TituloTinta({
  texto,
  lineas,
  desde = 0,
  paso = 0.055,
  className = "",
}: {
  texto: string;
  lineas?: { texto: string; sangria?: string }[];
  desde?: number;
  paso?: number;
  className?: string;
}) {
  let i = 0;
  const renglones = lineas ?? [{ texto }];
  const letras = (t: string) =>
    t.split("").map((letra) => (
      <span key={i} className="letra" style={{ animationDelay: `${(desde + i++ * paso).toFixed(3)}s` }}>
        {letra === " " ? " " : letra}
      </span>
    ));
  return (
    <h1 className={`tinta ${className}`} aria-label={texto}>
      {renglones.map((r, n) => (
        <span key={n} className={lineas ? "block" : "inline"} style={r.sangria ? { paddingLeft: r.sangria } : undefined} aria-hidden="true">
          {r.texto.split(" ").map((palabra, w, todas) => (
            <span key={w} className="inline-block whitespace-nowrap">
              {letras(palabra)}
              {w < todas.length - 1 && letras(" ")}
            </span>
          ))}
        </span>
      ))}
    </h1>
  );
}
