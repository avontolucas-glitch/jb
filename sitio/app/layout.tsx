import type { Metadata, Viewport } from "next";
import { Crimson_Pro } from "next/font/google";
import "./globals.css";
import Encabezado from "@/components/Encabezado";
import Pie from "@/components/Pie";
import InstalarApp from "@/components/InstalarApp";
import GuiaInstalar from "@/components/GuiaInstalar";
import Musica from "@/components/Musica";
import YoSoy from "@/components/YoSoy";
import RegistrarSW from "@/components/RegistrarSW";
import Revelar from "@/components/Revelar";
import Umbral from "@/components/Umbral";
import Atencion from "@/components/Atencion";
import CursorAnillo from "@/components/CursorAnillo";
import MarcoPagina from "@/components/MarcoPagina";
import Flotantes from "@/components/Flotantes";
import Sonidos from "@/components/Sonidos";
import { sitio } from "@/content/config";

const crimson = Crimson_Pro({ subsets: ["latin"], variable: "--font-crimson", display: "swap" });

export const metadata: Metadata = {
  title: { default: sitio.nombre, template: `%s · ${sitio.nombre}` },
  description: sitio.descripcion,
  applicationName: sitio.nombre,
  appleWebApp: { capable: true, title: sitio.nombre, statusBarStyle: "black" },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = { themeColor: "#0a0a0a", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={crimson.variable} suppressHydrationWarning>
      <head>
        {/* Activa el revelado suave solo si hay JavaScript (sin él, todo se ve igual). */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "var h=document.documentElement;h.classList.add('js');try{h.classList.add(sessionStorage.getItem('jb-umbral')?'umbral-visto':'en-umbral')}catch(e){h.classList.add('umbral-visto')}" +
              // el pedido de instalación de Chrome/Edge/Android llega temprano: se guarda para el botón «Instalar la app»
              // seguro: si una parte del sitio no carga, a los 7 s se muestra todo igual (sin animaciones)
              ";setTimeout(function(){if(!window.__jbListo){h.classList.add('sin-revelar');h.classList.remove('en-umbral')}},7000)" +
              ";addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__jbInstalar=e;dispatchEvent(new Event('jb:instalable'))});addEventListener('appinstalled',function(){window.__jbInstalar=null;window.__jbInstalada=1;dispatchEvent(new Event('jb:instalada'))})",
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        {/* Tinta de imprenta: bordes levemente comidos, como tipos sobre papel */}
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
          <filter id="tinta-rugosa" x="-5%" y="-10%" width="110%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="11" result="ruido" />
            <feDisplacementMap in="SourceGraphic" in2="ruido" scale="1.8" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
        <Umbral />
        <a href="#contenido" className="salto">Saltar al contenido</a>
        <Encabezado />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <Pie />
        <MarcoPagina />
        <Flotantes />
        <Sonidos />
        <InstalarApp />
        <GuiaInstalar />
        <Musica />
        <YoSoy />
        <RegistrarSW />
        <Revelar />
        <Atencion />
        <CursorAnillo />
      </body>
    </html>
  );
}
