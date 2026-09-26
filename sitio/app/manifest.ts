import type { MetadataRoute } from "next";
import { sitio } from "@/content/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
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
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
