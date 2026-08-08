import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sin esto Next busca la raíz hacia arriba, encuentra los lockfiles de las
  // carpetas hermanas y avisa que no sabe cuál usar.
  turbopack: {
    root: import.meta.dirname,
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Panel privado: que ningún buscador lo indexe, ni siquiera si la
          // URL se filtra en un enlace.
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          // Nadie debería poder embeber este panel en un iframe ajeno.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "no-referrer" },
          // No hay nada aquí que necesite cámara, micrófono ni ubicación.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
