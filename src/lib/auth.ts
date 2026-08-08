import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/auth-schema";

/**
 * Panel de un solo usuario, con el registro cerrado en dos capas:
 *
 * 1. `disableSignUp` apaga el endpoint de registro por completo. Se controla
 *    con REGISTRO_ABIERTO="si": la enciendes una vez para crear tu cuenta y
 *    la quitas enseguida. Con el registro apagado, el endpoint ni existe.
 * 2. Si el registro está abierto, el hook igual rechaza cualquier correo que
 *    no sea CORREO_AUTORIZADO.
 *
 * Dos capas y no una porque este panel lee las bases de producción de ambos
 * SaaS: una cuenta de más aquí es acceso a todo.
 */
const registroAbierto = process.env.REGISTRO_ABIERTO?.trim() === "si";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    camelCase: true,
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: !registroAbierto,
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
