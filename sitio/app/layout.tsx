import type { Metadata, Viewport } from "next";
import { Crimson_Pro } from "next/font/google";
import "./globals.css";
import Encabezado from "@/components/Encabezado";
import Pie from "@/components/Pie";
import InstalarApp from "@/components/InstalarApp";
import RegistrarSW from "@/components/RegistrarSW";
import Revelar from "@/components/Revelar";
import Umbral from "@/components/Umbral";
import Atencion from "@/components/Atencion";
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
              "var h=document.documentElement;h.classList.add('js');try{if(sessionStorage.getItem('jb-umbral'))h.classList.add('umbral-visto')}catch(e){}",
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Umbral />
        <a href="#contenido" className="salto">Saltar al contenido</a>
        <Encabezado />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <Pie />
        <InstalarApp />
        <RegistrarSW />
        <Revelar />
        <Atencion />
      </body>
    </html>
  );
}
