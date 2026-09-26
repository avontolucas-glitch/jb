import type { MetadataRoute } from "next";
import { sitio } from "@/content/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: sitio.nombre,
    short_name: sitio.nombre,
    description: sitio.descripcion,
    lang: "es-AR",
    start_url: "/?origen=app",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b0b0b",
    theme_color: "#0b0b0b",
    categories: ["education", "books", "lifestyle"],
    screenshots: [
      { src: "/capturas/inicio-celular.webp", sizes: "780x1688", type: "image/webp", form_factor: "narrow", label: "Inicio en el celular" },
      { src: "/capturas/inicio-computadora.webp", sizes: "1440x900", type: "image/webp", form_factor: "wide", label: "Inicio en la computadora" },
    ],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
