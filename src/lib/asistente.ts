import { sql } from "drizzle-orm";
import { dbFacilagua } from "@/lib/db";
import { diasDesde } from "@/lib/tiempo";
import type { Ajustes, ComiteAsistente, Documento } from "@/lib/asistente-comun";

/** Lo que muestra «Asistente», leído de la base de Facilapr (solo lectura). */

async function leer<T>(consulta: string): Promise<T[]> {
  const r = await dbFacilagua().execute(sql.raw(consulta));
  return r.rows as T[];
}

/** La base general publicada. Null si todavía no se ha publicado nada. */
export async function ajustesPublicados(): Promise<Ajustes | null> {
  const [fila] = await leer<{ valor: string }>(`select valor from "AjustePlataforma" where clave = 'asistente'`);
  return fila ? (JSON.parse(fila.valor) as Ajustes) : null;
}

const HORA = new Intl.DateTimeFormat("es-CL", { timeZone: "America/Santiago", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

/** «hoy, 18:40», «ayer», «hace 3 días», «hace 2 semanas». */
function cuando(fecha: Date) {
  const dias = diasDesde(fecha);
  if (dias === 0) return `hoy, ${HORA.format(fecha)}`;
  if (dias === 1) return "ayer";
  if (dias < 7) return `hace ${dias} días`;
  if (dias < 30) return dias < 14 ? "hace 1 semana" : `hace ${Math.floor(dias / 7)} semanas`;
  return dias < 60 ? "hace 1 mes" : `hace ${Math.floor(dias / 30)} meses`;
}

export async function comitesAsistente(): Promise<ComiteAsistente[]> {
  const filas = await leer<Omit<ComiteAsistente, "editado"> & { editado: string | null }>(
    `select a.id, trim(a.nombre) as nombre,
       coalesce(trim(replace(a."iaChatInstrucciones", chr(13), '')), '') as aprobadas,
       r.valor::jsonb ->> 'pendiente' as propuesta,
       r.valor::jsonb ->> 'editado' as editado,
       r.valor::jsonb ->> 'autor' as autor,
       nullif(trim(a."horarioAtencion"), '') as horario,
       nullif(trim(a.telefono), '') as telefono,
       a."diasVencimiento" as "diasVencimiento",
       a."diasGraciaCorte" as "diasGracia"
     from "Apr" a
     left join "AjustePlataforma" r on r.clave = 'ia-comite:' || a.id
     order by (r.valor::jsonb ->> 'pendiente') is null, (coalesce(trim(a."iaChatInstrucciones"), '') = ''), a.nombre`
  );
  return filas.map((f) => ({ ...f, editado: f.editado ? cuando(new Date(f.editado)) : null }));
}

export async function documentosAsistente(): Promise<Documento[]> {
  return leer<Documento>(
    `select clave as id, valor::jsonb ->> 'titulo' as titulo, valor::jsonb ->> 'tipo' as tipo, valor::jsonb ->> 'aprId' as "aprId"
     from "AjustePlataforma" where clave like 'doc:%' order by "updatedAt" desc`
  );
}
