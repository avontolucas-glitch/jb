import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Ojo from "@/components/Ojo";
import Precio from "@/components/Precio";
import Formulario from "@/components/Formulario";
import MontoVoluntad from "@/components/MontoVoluntad";
import { usuarioActual } from "@/lib/auth";
import { accesos } from "@/lib/access";
import { producto } from "@/lib/payments";
import { accionPagar } from "@/lib/acciones";

export const metadata: Metadata = { title: "Comprar", robots: { index: false } };
export const dynamic = "force-dynamic";

function destino(id: string) {
  if (id === "masterclass") return { href: "/mi-espacio/masterclass", texto: "la masterclass" };
  if (id.startsWith("directo:")) return { href: `/mi-espacio/en-vivo/${id.split(":")[1]}`, texto: "la sala" };
  if (id.startsWith("libro:")) return { href: `/mi-espacio/biblioteca/${id.split(":")[1]}`, texto: "tu biblioteca" };
  return { href: "/mi-espacio/conferencias", texto: "mis conferencias" };
}

export default async function Checkout({ params }: { params: Promise<{ producto: string }> }) {
  const { producto: id } = await params;
  const p = producto(id);
  if (!p) notFound();
  const u = await usuarioActual();
  if (!u) redirect(`/ingresar?aviso=checkout&volver=/checkout/${id}`);
  const a = await accesos(u.id);
  const yaLoTiene = a.compras.some((c) => c.producto === p.id);
  const ir = destino(p.id);

  return (
    <section className="px-5 py-16 sm:py-24">
      <div className="mx-auto max-w-md aparece">
        <Ojo size={30} className="mb-6 parpadea" />
        <h1 className="titulo text-4xl">Tu compra</h1>
        <dl className="mt-8 border-t borde">
          <div className="border-b borde py-4 flex justify-between gap-4">
            <dt className="texto-2">Producto</dt>
            <dd className="text-right">{p.titulo}</dd>
          </div>
          <div className="border-b borde py-4 flex justify-between gap-4">
            <dt className="texto-2">Precio</dt>
            <dd>
              {p.aVoluntad ? (
                <span>
                  A voluntad, desde {p.moneda} {p.aVoluntad.minimo}
                </span>
              ) : (
                <Precio monto={p.monto} moneda={p.moneda} aDefinir={p.aDefinir} />
              )}
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
            <Link href={ir.href} className="boton boton-lleno mt-4">
              Ir a {ir.texto}
            </Link>
          </div>
        ) : (
          <div className="mt-8">
            {/* PRODUCCIÓN: este formulario pasa a crear el pago en Mercado Pago
                (pesos) o a llevar al link de pago de Hotmart. Ver lib/payments.ts */}
            <Formulario accion={accionPagar} boton="Pagar (simulado)" enviando="Procesando…">
              <input type="hidden" name="producto" value={id} />
              {p.aVoluntad && <MontoVoluntad moneda={p.moneda} {...p.aVoluntad} />}
              <p className="border border-dashed borde p-4 texto-2 text-sm">
                Pago de prueba: no se cobra nada. En la versión final acá se paga con el medio de pago elegido.
              </p>
            </Formulario>
          </div>
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
