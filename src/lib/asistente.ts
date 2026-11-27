import { sql } from "drizzle-orm";
import { dbFacilagua } from "@/lib/db";
import { diaEnChile } from "@/lib/tiempo";

/** Lo que muestra «Asistente», leído de la base de Facilapr (solo lectura). */

/** El mismo tope que aplica Facilapr al guardarlas. */
export const MAXIMO_INSTRUCCIONES = 2000;

async function leer<T>(consulta: string): Promise<T[]> {
  const r = await dbFacilagua().execute(sql.raw(consulta));
  return r.rows as T[];
}

export type Generales = { texto: string; fecha: Date | null };

/** Null si Facilapr todavía no tiene la tabla donde se guardan. */
export async function instruccionesGenerales(): Promise<Generales | null> {
  const [tabla] = await leer<{ existe: boolean }>(`select to_regclass('public."AjustePlataforma"') is not null as existe`);
  if (!tabla?.existe) return null;
  const [fila] = await leer<{ valor: string; fecha: string }>(
    `select valor, ("updatedAt" at time zone 'UTC') as fecha from "AjustePlataforma" where clave = 'iaInstrucciones'`
  );
  return { texto: fila?.valor ?? "", fecha: fila ? new Date(fila.fecha) : null };
}

export type ComiteAsistente = {
  id: string;
  nombre: string;
  slug: string | null;
  /** La IA de los socios viene desde el plan Estándar. */
  conIa: boolean;
  encendida: boolean;
  instrucciones: string | null;
  /** Respuestas que dio este mes, en el chat y en el portal. */
  respuestas: number;
};

export async function comitesAsistente(): Promise<ComiteAsistente[]> {
  const desde = `${diaEnChile().slice(0, 7)}-01`;
  return leer<ComiteAsistente>(
    `select a.id, trim(a.nombre) as nombre, a.slug,
       a.plan::text <> 'BASICO' as "conIa",
       a."iaChatModo" = 'SIEMPRE' as encendida,
       nullif(trim(a."iaChatInstrucciones"), '') as instrucciones,
       (select count(*)::int from "UsoIA" u where u."aprId" = a.id and u.origen in ('chat-ia', 'asistente-socio')
          and u.proveedor::text <> 'enlatada' and (u."createdAt" at time zone 'UTC') at time zone 'America/Santiago' >= '${desde}') as respuestas
     from "Apr" a
     order by (nullif(trim(a."iaChatInstrucciones"), '') is null), "conIa" desc, a.nombre`
  );
}
