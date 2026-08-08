import type { Config } from "drizzle-kit";

/**
 * Solo la base propia del panel. Las bases de los productos no se migran
 * desde aquí: este panel las lee, no las modifica.
 */
export default {
  schema: ["./src/lib/db/schema.ts", "./src/lib/db/auth-schema.ts"],
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
