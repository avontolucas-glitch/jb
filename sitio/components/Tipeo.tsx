"use client";
import { useEffect, useState } from "react";

/** La frase aparece de a una letra, como si Yo Da la estuviera diciendo. */
export default function Tipeo({ texto }: { texto: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(texto.length);
      return;
    }
    setN(0);
    const t = window.setInterval(() => setN((i) => (i >= texto.length ? (window.clearInterval(t), i) : i + 1)), 38);
    return () => window.clearInterval(t);
  }, [texto]);
  return (
    <>
      <span className="sr-only">{texto}</span>
      <span aria-hidden="true">{texto.slice(0, n)}</span>
    </>
  );
}
