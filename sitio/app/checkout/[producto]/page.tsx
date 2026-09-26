import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Ojo from "@/components/Ojo";
import Precio from "@/components/Precio";
import { usuarioActual } from "@/lib/auth";
import { accesos } from "@/lib/access";
import { producto } from "@/lib/payments";
import { accionPagar } from "@/lib/acciones";

export const metadata: Metadata = { title: "Comprar", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Checkout({ params }: { params: Promise<{ producto: string }> }) {
  const { producto: id } = await params;
  const p = producto(id);
  if (!p) notFound();
  const u = await usuarioActual();
  if (!u) redirect(`/ingresar?aviso=checkout&volver=/checkout/${id}`);
  const a = await accesos(u.id);
  const yaLoTiene = a.compras.some((c) => c.producto === p.id);
  const destino = p.id === "masterclass" ? "/mi-espacio/masterclass" : "/mi-espacio/conferencias";

  return (
    <section className="px-5 py-16 sm:py-24">
      <div className="mx-auto max-w-md">
        <Ojo size={30} className="mb-6" />
        <h1 className="titulo text-4xl">Tu compra</h1>
        <dl className="mt-8 border-t borde">
          <div className="border-b borde py-4 flex justify-between gap-4">
            <dt className="texto-2">Producto</dt>
            <dd className="text-right">{p.titulo}</dd>
          </div>
          <div className="border-b borde py-4 flex justify-between gap-4">
            <dt className="texto-2">Precio</dt>
            <dd>
              <Precio monto={p.monto} moneda={p.moneda} aDefinir={p.aDefinir} />
            </dd>
          </div>
          <div className="border-b borde py-4 flex justify-between gap-4">
            <dt className="texto-2">Cuenta</dt>
            <dd className="break-all text-right">{u.email}</dd>
          </div>
        </dl>

        {yaLoTiene ? (
          <div className="mt-8">
            <p>Ya lo compraste.</p>
            <Link href={destino} className="boton boton-lleno mt-4">
              Ir a {p.id === "masterclass" ? "la masterclass" : "mis conferencias"}
            </Link>
          </div>
        ) : (
          <form action={accionPagar} className="mt-8">
            {/* PRODUCCIÓN: este botón pasa a crear la preferencia de Mercado Pago
                (pesos) o a llevar al link de pago de Hotmart. Ver lib/payments.ts */}
            <input type="hidden" name="producto" value={id} />
            <p className="border border-dashed borde p-4 texto-2 text-sm mb-6">
              Pago de prueba: no se cobra nada. En la versión final acá se paga con Mercado Pago (en pesos) o con Hotmart.
            </p>
            <button type="submit" className="boton boton-lleno w-full">
              Pagar (simulado)
            </button>
          </form>
        )}
        <p className="texto-2 text-sm mt-8">
          <Link href="/legales/reembolsos" className="enlace">
            Política de reembolsos
          </Link>
        </p>
      </div>
    </section>
  );
}
