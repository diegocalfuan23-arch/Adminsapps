import { cache } from "react";
import { sql } from "drizzle-orm";
import { dbFacilagua } from "@/lib/db";
import { diaEnChile, hace, nombreMes, ultimosMeses } from "@/lib/tiempo";

/**
 * Lo que muestra la consola de Facilapr, leído de su base (solo lectura).
 *
 * A diferencia de las métricas sueltas, aquí un error no se calla: la página lo muestra. Una consulta que falla en
 * silencio se ve igual que «no hay datos», y así una columna borrada puede pasar meses sin que nadie se entere.
 */

async function leer<T>(consulta: string): Promise<T[]> {
  const r = await dbFacilagua().execute(sql.raw(consulta));
  return r.rows as T[];
}

/** La fecha de una columna `timestamp` (guardada en UTC) llevada al mes de Chile. */
const mesDe = (columna: string) => `to_char((${columna} at time zone 'UTC') at time zone 'America/Santiago', 'YYYY-MM')`;
const diaDe = (columna: string) => `to_char((${columna} at time zone 'UTC') at time zone 'America/Santiago', 'YYYY-MM-DD')`;

export type EstadoComite = "al-dia" | "cargando" | "por-aprobar" | "sin-lecturas";

export type ComiteConsola = {
  id: string;
  nombre: string;
  slug: string | null;
  comuna: string | null;
  /** Mes «AAAA-MM» en que creó su cuenta. */
  alta: string;
  pruebaHasta: Date | null;
  socios: number;
  boletas: number;
  /**
   * Socios activos con una lectura de este mes o cargada este mes (sin las rechazadas). Hay comités que facturan
   * meses atrasados: si solo se mirara el periodo, uno que acaba de cargar todo figuraría «sin lecturas».
   */
  leidos: number;
  pendientes: number;
  /** Cuándo cargó lecturas por última vez. */
  ultimaLectura: Date | null;
  /** El teléfono del comité, si lo completó en Configuración. */
  telefono: string | null;
  estado: EstadoComite;
};

function estadoDe(c: { socios: number; leidos: number; pendientes: number }): EstadoComite {
  if (c.pendientes > 0) return "por-aprobar";
  if (c.leidos === 0) return "sin-lecturas";
  return c.leidos < c.socios ? "cargando" : "al-dia";
}

export async function comitesConsola(): Promise<ComiteConsola[]> {
  const mes = diaEnChile().slice(0, 7);
  const delComite = (tabla: string, alias: string) => `from "${tabla}" ${alias} join "Socio" s on s.id = ${alias}."socioId" where s."aprId" = a.id`;
  const filas = await leer<Omit<ComiteConsola, "estado" | "pruebaHasta" | "ultimaLectura"> & { prueba_hasta: string | null; ultima_lectura: string | null }>(
    `select a.id, trim(a.nombre) as nombre, a.slug, a.comuna, a.telefono,
       ${mesDe(`a."createdAt"`)} as alta,
       (a."pruebaHasta" at time zone 'UTC') as prueba_hasta,
       (select count(*)::int from "Socio" s where s."aprId" = a.id and s.activo) as socios,
       (select count(*)::int ${delComite("Boleta", "b")} and b.estado::text <> 'ANULADA') as boletas,
       (select count(distinct l."socioId")::int ${delComite("Lectura", "l")} and s.activo and l.estado::text <> 'RECHAZADA'
          and (l.periodo = '${mes}' or ${mesDe(`l."createdAt"`)} = '${mes}')) as leidos,
       (select count(*)::int ${delComite("Lectura", "l")} and l.estado::text = 'PENDIENTE') as pendientes,
       ((select max(l."createdAt") ${delComite("Lectura", "l")}) at time zone 'UTC') as ultima_lectura
     from "Apr" a
     order by socios desc, a.nombre`
  );
  return filas.map(({ prueba_hasta, ultima_lectura, ...c }) => ({
    ...c,
    pruebaHasta: prueba_hasta ? new Date(prueba_hasta) : null,
    ultimaLectura: ultima_lectura ? new Date(ultima_lectura) : null,
    estado: estadoDe(c),
  }));
}

export type Series = { meses: string[]; socios: number[]; boletas: number[] };

export async function seriesConsola(): Promise<Series> {
  const meses = ultimosMeses(6);
  const desde = meses[0];
  const [altas, boletas] = await Promise.all([
    leer<{ mes: string; n: number }>(`select ${mesDe(`"createdAt"`)} as mes, count(*)::int as n from "Socio" group by 1`),
    leer<{ mes: string; n: number }>(`select periodo as mes, count(*)::int as n from "Boleta" where estado::text <> 'ANULADA' and periodo >= '${desde}' group by 1`),
  ]);
  const de = (filas: { mes: string; n: number }[], mes: string) => filas.find((f) => f.mes === mes)?.n ?? 0;
  return {
    meses,
    // Socios que había al cerrar cada mes (los borrados no se cuentan).
    socios: meses.map((m) => altas.filter((a) => a.mes <= m).reduce((s, a) => s + a.n, 0)),
    boletas: meses.map((m) => de(boletas, m)),
  };
}

export type ConsultaNueva = { id: string; nombre: string; apr: string; mensaje: string | null; fecha: Date };

export async function consultasNuevas(): Promise<ConsultaNueva[]> {
  const filas = await leer<Omit<ConsultaNueva, "fecha"> & { fecha: string }>(
    `select id, nombre, apr, mensaje, ("createdAt" at time zone 'UTC') as fecha from "Consulta" where estado::text = 'NUEVA' order by "createdAt" desc limit 100`
  );
  return filas.map((f) => ({ ...f, fecha: new Date(f.fecha) }));
}

export type Buscados = { comites: number; busquedas: number; recientes: { nombre: string; comuna: string; veces: number; fecha: Date }[] };

/** Los comités que los socios buscaron en facilapr.cl/socios y no estaban. */
export async function comitesQueBuscan(): Promise<Buscados> {
  const [[total], recientes] = await Promise.all([
    leer<{ comites: number; busquedas: number }>(`select count(*)::int as comites, coalesce(sum(veces), 0)::int as busquedas from "ComiteBuscado"`),
    leer<{ nombre: string; comuna: string; veces: number; fecha: string }>(
      `select nombre, comuna, veces, ("updatedAt" at time zone 'UTC') as fecha from "ComiteBuscado" order by "updatedAt" desc limit 3`
    ),
  ]);
  return { comites: total?.comites ?? 0, busquedas: total?.busquedas ?? 0, recientes: recientes.map((r) => ({ ...r, fecha: new Date(r.fecha) })) };
}

type Evento = { tipo: "alta" | "consulta" | "boletas" | "lecturas" | "busqueda"; quien: string; detalle: string; n: number; fecha: Date };

async function actividadReciente(cuantos: number): Promise<Evento[]> {
  const reciente = (columna: string) => `${columna} > now() - interval '30 days'`;
  const filas = await leer<Omit<Evento, "fecha"> & { fecha: string }>(
    `select * from (
       select 'alta' as tipo, trim(a.nombre) as quien, coalesce(a.comuna, '') as detalle, 1 as n, (a."createdAt" at time zone 'UTC') as fecha
         from "Apr" a where ${reciente(`a."createdAt"`)}
       union all
       select 'consulta', c.nombre, c.apr, 1, (c."createdAt" at time zone 'UTC') from "Consulta" c where ${reciente(`c."createdAt"`)}
       union all
       select 'boletas', trim(a.nombre), b.periodo, count(*)::int, (max(b."createdAt") at time zone 'UTC')
         from "Boleta" b join "Socio" s on s.id = b."socioId" join "Apr" a on a.id = s."aprId"
         where ${reciente(`b."createdAt"`)} group by a.id, a.nombre, b.periodo, ${diaDe(`b."createdAt"`)}
       union all
       select 'lecturas', trim(a.nombre), l.periodo, count(*)::int, (max(l."createdAt") at time zone 'UTC')
         from "Lectura" l join "Socio" s on s.id = l."socioId" join "Apr" a on a.id = s."aprId"
         where ${reciente(`l."createdAt"`)} group by a.id, a.nombre, l.periodo, ${diaDe(`l."createdAt"`)}
       union all
       select 'busqueda', nombre, comuna, veces, ("updatedAt" at time zone 'UTC') from "ComiteBuscado" where ${reciente(`"updatedAt"`)}
     ) e order by fecha desc limit ${Math.trunc(cuantos)}`
  );
  return filas.map((f) => ({ ...f, fecha: new Date(f.fecha) }));
}

export type Novedad = { texto: string; cuando: string; nueva: boolean };

function textoEvento(e: Evento) {
  if (e.tipo === "alta") return `${e.quien} creó su cuenta`;
  if (e.tipo === "consulta") return `Nueva consulta de ${e.quien} (${e.detalle})`;
  if (e.tipo === "boletas") return `${e.quien} emitió ${e.n} ${e.n === 1 ? "boleta" : "boletas"} de ${nombreMes(e.detalle)}`;
  if (e.tipo === "lecturas") return `${e.quien} registró ${e.n} ${e.n === 1 ? "lectura" : "lecturas"} de ${nombreMes(e.detalle)}`;
  return `Un socio buscó «${e.quien}», de ${e.detalle}`;
}

/**
 * Lo último que pasó en la plataforma (30 días), para la campana. Lo piden el marco y el resumen: se lee una sola
 * vez por visita. Si falla, la campana queda vacía y el resto de la página sigue.
 */
export const novedades = cache(async (): Promise<Novedad[]> => {
  try {
    const eventos = await actividadReciente(8);
    return eventos.map((e) => ({ texto: textoEvento(e), cuando: hace(e.fecha), nueva: Date.now() - e.fecha.getTime() < 86_400_000 }));
  } catch (e) {
    console.error("Consola: no se pudo leer la actividad:", e);
    return [];
  }
});

/** Días antes del término en que una prueba gratuita pasa a «por vencer». */
export const DIAS_AVISO_PRUEBA = 3;

export const pruebaPorVencer = (hasta: Date | null) =>
  Boolean(hasta && hasta.getTime() > Date.now() && hasta.getTime() - Date.now() <= DIAS_AVISO_PRUEBA * 86_400_000);

export type Avisos = { comites: number; lecturas: number; consultas: number };

/** Los números del menú. Si la base no responde, el menú se muestra sin ellos (la página ya avisa). */
export async function avisosMenu(): Promise<Avisos> {
  try {
    const [fila] = await leer<Avisos>(
      `select
         (select count(*)::int from "Apr" where "pruebaHasta" > now() at time zone 'UTC'
            and "pruebaHasta" <= (now() at time zone 'UTC') + interval '${DIAS_AVISO_PRUEBA} days') as comites,
         (select count(distinct s."aprId")::int from "Lectura" l join "Socio" s on s.id = l."socioId" where l.estado::text = 'PENDIENTE') as lecturas,
         (select count(*)::int from "Consulta" where estado::text = 'NUEVA') as consultas`
    );
    return fila;
  } catch (e) {
    console.error("Consola: no se pudieron leer los avisos:", e);
    return { comites: 0, lecturas: 0, consultas: 0 };
  }
}
