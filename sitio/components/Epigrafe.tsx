import { sitio } from "@/content/config";

export default function Epigrafe({ cita, className = "" }: { cita: string; className?: string }) {
  return (
    <figure className={`prosa mx-auto text-center ${className}`}>
      <blockquote className="italic text-lg leading-relaxed">«{cita}»</blockquote>
      <figcaption className="firma mt-3 text-sm texto-2">{sitio.nombre}</figcaption>
    </figure>
  );
}
