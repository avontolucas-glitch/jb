import type { MetadataRoute } from "next";
import { sitio } from "@/content/config";

/**
 * robots.txt: lo público se indexa; el área de miembros, el checkout, la API y los
 * formularios de cuenta, no (además llevan X-Robots-Tag: noindex, en middleware.ts).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/mi-espacio", "/checkout", "/api", "/ingresar", "/crear-cuenta"],
      },
    ],
    host: `https://${sitio.dominio}`,
  };
}
