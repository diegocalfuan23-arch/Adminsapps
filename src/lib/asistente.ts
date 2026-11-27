import { sql } from "drizzle-orm";
import { dbFacilagua } from "@/lib/db";
import { AJUSTES_INICIALES, type Ajustes, type ComiteAsistente } from "@/lib/asistente-comun";

/** Lo que muestra «Asistente», leído de la base de Facilapr (solo lectura). */

async function leer<T>(consulta: string): Promise<T[]> {
  const r = await dbFacilagua().execute(sql.raw(consulta));
  return r.rows as T[];
}

/** La base general publicada. Null si Facilapr todavía no tiene la tabla donde se guarda. */
export async function ajustesPublicados(): Promise<Ajustes | null> {
  const [tabla] = await leer<{ existe: boolean }>(`select to_regclass('public."AjustePlataforma"') is not null as existe`);
  if (!tabla?.existe) return null;
  const [fila] = await leer<{ valor: string }>(`select valor from "AjustePlataforma" where clave = 'asistente'`);
  return fila ? { ...AJUSTES_INICIALES, ...(JSON.parse(fila.valor) as Partial<Ajustes>) } : AJUSTES_INICIALES;
}

export async function comitesAsistente(): Promise<ComiteAsistente[]> {
  return leer<ComiteAsistente>(
    `select a.id, trim(a.nombre) as nombre,
       coalesce(trim(a."iaChatInstrucciones"), '') as instrucciones,
       nullif(trim(a."horarioAtencion"), '') as horario,
       nullif(trim(a.telefono), '') as telefono,
       a."diasVencimiento" as "diasVencimiento",
       a."diasGraciaCorte" as "diasGracia"
     from "Apr" a
     order by (coalesce(trim(a."iaChatInstrucciones"), '') = ''), a.nombre`
  );
}
