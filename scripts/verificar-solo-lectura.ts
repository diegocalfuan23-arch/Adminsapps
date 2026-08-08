/**
 * Comprueba que el panel NO puede escribir en las bases de los productos.
 * Uso: bun --env-file=.env.local scripts/verificar-solo-lectura.ts
 */
import { sql } from "drizzle-orm";
import { dbFacilagua, dbMecanicoapp } from "@/lib/db";

async function probarEscritura(nombre: string, base: () => ReturnType<typeof dbFacilagua>) {
  // Tabla temporal: si la escritura estuviera permitida, esto no dañaría nada.
  try {
    await base().execute(sql`create temporary table _prueba_panel (x int)`);
    console.log(`  PELIGRO  ${nombre}: la escritura está PERMITIDA`);
  } catch (e) {
    // Drizzle envuelve el error de Postgres, así que hay que recorrer la
    // cadena de `cause` para llegar al código real (25006 = read-only).
    let actual: unknown = e;
    let codigo: string | undefined;
    let mensaje = (e as Error).message;
    while (actual) {
      const c = (actual as { code?: string }).code;
      if (c) codigo = c;
      const m = (actual as { message?: string }).message;
      if (m && /read-only/i.test(m)) mensaje = m;
      actual = (actual as { cause?: unknown }).cause;
    }

    console.log(
      codigo === "25006"
        ? `  OK       ${nombre}: escritura bloqueada por Postgres (25006)`
        : `  REVISAR  ${nombre}: código ${codigo ?? "?"} → ${mensaje.split("\n")[0]}`
    );
  }
}

async function probarLectura(nombre: string, base: () => ReturnType<typeof dbFacilagua>) {
  try {
    await base().execute(sql`select 1`);
    console.log(`  OK       ${nombre}: lectura funciona`);
  } catch (e) {
    console.log(`  FALLA    ${nombre}: ${(e as Error).message.split("\n")[0]}`);
  }
}

console.log("\nLectura:\n");
await probarLectura("FacilAgua", dbFacilagua);
await probarLectura("mecanicoapp", dbMecanicoapp);

console.log("\nEscritura (debe estar bloqueada):\n");
await probarEscritura("FacilAgua", dbFacilagua);
await probarEscritura("mecanicoapp", dbMecanicoapp);
console.log("");

process.exit(0);
