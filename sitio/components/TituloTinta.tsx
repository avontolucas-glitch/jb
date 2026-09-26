/** El título aparece letra por letra, como tinta que se asienta. */
export default function TituloTinta({ texto, desde = 0, paso = 0.055, className = "" }: { texto: string; desde?: number; paso?: number; className?: string }) {
  let i = 0;
  return (
    <h1 className={`tinta ${className}`} aria-label={texto}>
      {texto.split(" ").map((palabra, w) => (
        <span key={w} className="inline-block whitespace-nowrap" aria-hidden="true">
          {palabra.split("").map((letra) => (
            <span key={i} className="letra" style={{ animationDelay: `${(desde + i++ * paso).toFixed(3)}s` }}>
              {letra}
            </span>
          ))}
          {w < texto.split(" ").length - 1 && <span className="letra">&nbsp;</span>}
        </span>
      ))}
    </h1>
  );
}
