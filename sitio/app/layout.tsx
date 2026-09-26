import type { Metadata, Viewport } from "next";
import { Crimson_Pro } from "next/font/google";
import "./globals.css";
import Encabezado from "@/components/Encabezado";
import Pie from "@/components/Pie";
import InstalarApp from "@/components/InstalarApp";
import RegistrarSW from "@/components/RegistrarSW";
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

export const viewport: Viewport = { themeColor: "#0b0b0b", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={crimson.variable}>
      <body className="min-h-screen flex flex-col">
        <a href="#contenido" className="salto">Saltar al contenido</a>
        <Encabezado />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <Pie />
        <InstalarApp />
        <RegistrarSW />
      </body>
    </html>
  );
}
