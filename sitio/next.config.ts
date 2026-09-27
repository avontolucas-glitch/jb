import type { NextConfig } from "next";

const produccion = process.env.NODE_ENV === "production";

/**
 * Encabezados de seguridad para todas las rutas. La política de contenidos (CSP) va
 * en middleware.ts, porque lleva un nonce distinto en cada pedido.
 */
const seguridad = [
  // HTTPS siempre (solo en producción: en localhost rompería el desarrollo)
  ...(produccion ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] : []),
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Los datos de prueba (cuentas demo, compras, códigos de los libros) se leen
  // del disco: hay que avisarle a Next que los suba con el sitio (Vercel).
  outputFileTracingIncludes: { "/**": ["./data/*.json"] },
  // Tope del cuerpo de las server actions (los formularios del sitio son chicos):
  // un envío gigante se corta antes de llegar a la acción.
  experimental: { serverActions: { bodySizeLimit: "100kb" } },
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
      { source: "/:path*", headers: seguridad },
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
