import Link from "next/link";
import { notFound } from "next/navigation";
import { miembro } from "@/lib/miembro";
import SinAcceso from "@/components/SinAcceso";
import SalaProtegida from "@/components/SalaProtegida";
import { enVivo } from "@/content/config";

export default async function Sala({ params }: { params: Promise<{ id: string }> }) {
  const { u, a } = await miembro();
  const { id } = await params;
  const d = enVivo.directos.find((x) => x.id === id);
  if (!d) notFound();
  if (!a.directos.includes(d.id))
    return <SinAcceso que="Para entrar a este directo, reservá tu lugar. Pagás lo que quieras, desde USD 1." href={`/checkout/directo-${d.id}`} boton="Reservar mi lugar" />;
  return (
    <>
      <Link href="/mi-espacio/en-vivo" className="enlace texto-2 text-sm">
        Mis directos
      </Link>
      <h1 className="titulo text-4xl mt-6 mb-8">{d.titulo}</h1>
      <SalaProtegida directo={d.id} email={u.email} fecha={d.fecha} />
    </>
  );
}
