# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# Qué es esta app

Panel privado de super admin para monitorear los SaaS de Diego. No es un
producto para clientes: es una herramienta interna de un solo usuario.

Lee de las bases de datos de los otros productos (cada uno con su propia
base Neon, separada) y tiene una base propia para lo que necesite guardar
el panel mismo.

Productos monitoreados:

- **FacilAgua** (`tuapr/clickagua`) — SaaS para comités de Agua Potable
  Rural chilenos. Next 16 + Better Auth + Drizzle + Neon.
- **mecanicoapp** (`saas/mecanicoapp`) — SaaS para talleres mecánicos.
  Mismo stack.

Nunca escribas en las bases de los productos desde aquí: este panel es de
solo lectura sobre ellas.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
