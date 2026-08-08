import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/auth-schema";

/**
 * Panel de un solo usuario. El registro queda abierto en Better Auth pero
 * sirve una única vez: el hook rechaza cualquier correo que no sea el
 * autorizado, así nadie más puede crear cuenta aunque conozca la URL.
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    camelCase: true,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
  },
  databaseHooks: {
    user: {
      create: {
        // Devolver false aborta la creación: es lo que espera Better Auth
        // (ver node_modules/better-auth/dist/db/with-hooks.mjs), a diferencia
        // de lanzar, que saldría como error 500 en vez de un rechazo limpio.
        before: async (nuevoUsuario) => {
          const autorizado = process.env.CORREO_AUTORIZADO?.trim().toLowerCase();

          // Sin la variable configurada nadie puede registrarse: es preferible
          // no poder entrar a dejar el panel abierto por un descuido.
          if (!autorizado) return false;

          if (nuevoUsuario.email.trim().toLowerCase() !== autorizado) {
            return false;
          }

          return { data: nuevoUsuario };
        },
      },
    },
  },
});
