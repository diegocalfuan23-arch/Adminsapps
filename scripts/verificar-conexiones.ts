/**
 * Comprueba que el panel alcanza las tres bases: la propia y las de ambos
 * productos. Uso: bun --env-file=.env.local scripts/verificar-conexiones.ts
 */
import { sql } from "drizzle-orm";
import { db, dbFacilagua, dbMecanicoapp } from "@/lib/db";

async function probar(nombre: string, ejecutar: () => Promise<unknown>) {
  try {
    await ejecutar();
    console.log(`  OK    ${nombre}`);
  } catch (e) {
    console.log(`  FALLA ${nombre}: ${(e as Error).message.split("\n")[0]}`);
  }
}

console.log("\nConexiones:\n");

await probar("base del panel", () =>
  db.execute(sql`select 1`)
);
await probar("FacilAgua (solo lectura)", () =>
  dbFacilagua().execute(sql`select 1`)
);
await probar("mecanicoapp (solo lectura)", () =>
  dbMecanicoapp().execute(sql`select 1`)
);

const tablas = await db.execute<{ table_name: string }>(
  sql`select table_name from information_schema.tables
      where table_schema = 'public' order by table_name`
);

console.log("\nTablas del panel:\n");
for (const t of tablas.rows) console.log(`  ${t.table_name}`);
console.log("");

process.exit(0);
