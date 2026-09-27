import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Los datos de prueba (cuentas demo, compras, códigos de los libros) se leen
  // del disco: hay que avisarle a Next que los suba con el sitio (Vercel).
  outputFileTracingIncludes: { "/**": ["./data/*.json"] },
  // La masterclass es en vivo: la vieja dirección /en-vivo lleva ahí.
  // Las sesiones privadas ahora son la Masterclass 1 a 1.
  async redirects() {
    return [
      { source: "/en-vivo", destination: "/masterclass", permanent: false },
      { source: "/sesiones", destination: "/masterclass/1-a-1", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
