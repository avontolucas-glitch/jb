import type { Metadata } from "next";
import Apertura from "@/components/Apertura";
import BotonInstalar from "@/components/BotonInstalar";
import { IconoCompartir } from "@/components/InstalarApp";
import type { Plataforma } from "@/lib/plataforma";
import { portadillas } from "@/content/config";

export const metadata: Metadata = { title: "Instalar la app" };

const nombres: Record<Plataforma, string> = {
  instalada: "la app instalada",
  ios: "iPhone o iPad",
  "safari-mac": "Safari en Mac",
  chromium: "Chrome, Edge o Android",
  firefox: "Firefox",
  otra: "otro navegador",
};

const sistemas: { id: Plataforma; titulo: string; pasos: React.ReactNode[] }[] = [
  {
    id: "ios",
    titulo: "iPhone y iPad",
    pasos: [
      "Abrí el sitio en Safari.",
      <>
        Tocá <IconoCompartir /> <strong>Compartir</strong>, abajo en el iPhone o arriba en el iPad.
      </>,
      <>
        Elegí <strong>Agregar a pantalla de inicio</strong> y confirmá con <strong>Agregar</strong>.
      </>,
    ],
  },
  {
    id: "chromium",
    titulo: "Android, Windows, Linux y Chromebook",
    pasos: [
      "Abrí el sitio en Chrome o Edge.",
      <>
        Tocá <strong>Instalar la app</strong> en esta página, o en el menú del navegador (los tres puntos) elegí{" "}
        <strong>Instalar app</strong> o <strong>Agregar a la pantalla principal</strong>.
      </>,
      "La app queda con el ojo como ícono, junto a las demás.",
    ],
  },
  {
    id: "safari-mac",
    titulo: "Mac",
    pasos: [
      <>
        En Safari: menú <strong>Archivo</strong> y después <strong>Agregar al Dock</strong>.
      </>,
      <>
        En Chrome o Edge: el ícono de instalar en la barra de direcciones, o menú y <strong>Instalar</strong>.
      </>,
    ],
  },
  {
    id: "firefox",
    titulo: "Firefox",
    pasos: ["Firefox para computadora no instala apps web. Abrí el sitio en Chrome, Edge o Safari y seguí los pasos de tu sistema.", "En Android, Firefox sí la instala: menú y después Instalar."],
  },
];

export default function App() {
  return (
    <>
      <Apertura
        {...portadillas.app}
        titulo="Instalar la app"
        bajada="El sitio se puede instalar como una app en el teléfono, la tablet o la computadora. No ocupa casi lugar y se abre directo, sin pasar por el navegador."
      />
      <section className="hondo border-t borde px-5 py-14">
        <div className="mx-auto max-w-2xl revelar">
          <BotonInstalar nombres={nombres} />
        </div>
      </section>
      <section className="px-5 py-14">
        <div className="mx-auto max-w-2xl space-y-12 revelar">
          {sistemas.map((s) => (
            <article key={s.id} id={`so-${s.id}`} className="border-l borde pl-5 data-[actual=si]:border-l-2 data-[actual=si]:border-current">
              <h2 className="titulo text-2xl mb-4">{s.titulo}</h2>
              <ol className="list-decimal pl-5 space-y-2">
                {s.pasos.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ol>
            </article>
          ))}
          <p className="texto-2 text-sm">
            La app muestra lo mismo que el sitio. Tu espacio privado siempre se carga en el momento y nunca queda
            guardado en el dispositivo.
          </p>
        </div>
      </section>
    </>
  );
}
