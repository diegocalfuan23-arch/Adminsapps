import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sin esto Next busca la raíz hacia arriba, encuentra los lockfiles de las
  // carpetas hermanas y avisa que no sabe cuál usar.
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
