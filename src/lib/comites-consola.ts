import { sql } from "drizzle-orm";
import { dbFacilagua } from "@/lib/db";
import { diaEnChile, diasDesde, mesCorto } from "@/lib/tiempo";

/**
 * Lo que muestra «Comités», leído de la base de Facilapr (solo lectura): quién es cada uno y cuánto usa la aplicación.
 * Un error no se calla: la página lo muestra.
 */

export type ComiteDetalle = {
  id: string;
  nombre: string;
  slug: string | null;
  comuna: string | null;
  responsable: string | null;
  cargo: string | null;
  correo: string | null;
  telefono: string | null;
  plan: "BASICO" | "ESTANDAR" | "PREMIUM";
  enPrueba: boolean;
  socios: number;
  boletas: number;
  /** Porcentaje pagado de lo cobrado en boletas; null si no ha cobrado nada. */
  recaudado: number | null;
  /** «07 oct 2026». */
  registrado: string;
  /** Días desde la última señal de vida y desde que entró quien administra; null si nunca. */
  actividad: number | null;
  ingreso: number | null;
  /** «hoy, 00:45», «25 nov, 18:10». */
  ultima: string | null;
  /** Cinco semanas desde un lunes: 0 sin uso, 1 poco, 2 harto; null es un día que aún no llega. */
  uso: { dia: string; nivel: 0 | 1 | 2 | null }[];
};

/** Desde cuántos registros en un día se considera «harto uso». */
const HARTO_USO = 10;

async function leer<T>(consulta: string): Promise<T[]> {
  const r = await dbFacilagua().execute(sql.raw(consulta));
  return r.rows as T[];
}

/** El día de Chile de una columna `timestamp` guardada en UTC. */
const diaDe = (columna: string) => `to_char((${columna} at time zone 'UTC') at time zone 'America/Santiago', 'YYYY-MM-DD')`;

const HORA = new Intl.DateTimeFormat("es-CL", { timeZone: "America/Santiago", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

const corta = (dia: string) => `${Number(dia.slice(8, 10))} ${mesCorto(dia).toLowerCase()}`;

type Fila = Omit<ComiteDetalle, "enPrueba" | "recaudado" | "registrado" | "actividad" | "ingreso" | "ultima" | "uso"> & {
  prueba: string | null;
  alta: string;
  cobrado: number;
  pagado: number;
  ultimo_ingreso: string | null;
  ultima_senal: string | null;
};

/** Las cinco semanas que terminan en la actual, de lunes a domingo, como «AAAA-MM-DD». */
function cincoSemanas(hoy: string) {
  const base = Date.parse(`${hoy}T12:00:00Z`);
  // getUTCDay: 0 es domingo; aquí la semana parte el lunes.
  const desdeLunes = (new Date(base).getUTCDay() + 6) % 7;
  return Array.from({ length: 35 }, (_, i) => new Date(base + (i - desdeLunes - 28) * 86_400_000).toISOString().slice(0, 10));
}

export async function comitesDetalle(): Promise<ComiteDetalle[]> {
  const hoy = diaEnChile();
  const dias = cincoSemanas(hoy);

  const delComite = (tabla: string) => `from "${tabla}" x join "Socio" s on s.id = x."socioId" where s."aprId" = a.id`;
  const delPanel = `from session se join "user" p on p.id = se."userId" where p."aprId" = a.id and p.rol::text <> 'SOCIO'`;
  const reciente = (columna: string) => `${columna} > (now() at time zone 'UTC') - interval '40 days'`;

  const [filas, usos] = await Promise.all([
    leer<Fila>(
      `select a.id, trim(a.nombre) as nombre, a.slug, a.comuna, a.plan::text as plan,
         (a."pruebaHasta" at time zone 'UTC') as prueba,
         (a."createdAt" at time zone 'UTC') as alta,
         u.name as responsable, u.cargo, u.email as correo,
         coalesce(nullif(trim(a.telefono), ''), u.telefono) as telefono,
         (select count(*)::int from "Socio" s where s."aprId" = a.id and s.activo) as socios,
         b.boletas, b.cobrado, b.pagado,
         ((select max(se."updatedAt") ${delPanel} and p.rol::text = 'ADMIN') at time zone 'UTC') as ultimo_ingreso,
         (greatest(
           (select max(x."createdAt") ${delComite("Boleta")}),
           (select max(x."createdAt") ${delComite("Lectura")}),
           (select max(s."createdAt") from "Socio" s where s."aprId" = a.id),
           (select max(se."updatedAt") ${delPanel})
         ) at time zone 'UTC') as ultima_senal
       from "Apr" a
       left join lateral (
         select name, cargo, email, telefono from "user" where "aprId" = a.id and rol::text = 'ADMIN' order by "createdAt" limit 1
       ) u on true
       cross join lateral (
         select count(*)::int as boletas,
           coalesce(sum(x."montoTotal"), 0)::float as cobrado,
           coalesce(sum(least(x."montoPagado", x."montoTotal")), 0)::float as pagado
         ${delComite("Boleta")} and x.estado::text <> 'ANULADA'
       ) b`
    ),
    // Lo que se hizo cada día: lo creado en el panel y las veces que alguien del comité entró.
    leer<{ aprId: string; dia: string; n: number }>(
      `select "aprId", dia, count(*)::int as n from (
         select s."aprId", ${diaDe(`x."createdAt"`)} as dia from "Boleta" x join "Socio" s on s.id = x."socioId" where ${reciente(`x."createdAt"`)}
         union all
         select s."aprId", ${diaDe(`x."createdAt"`)} from "Lectura" x join "Socio" s on s.id = x."socioId" where ${reciente(`x."createdAt"`)}
         union all
         select s."aprId", ${diaDe(`s."createdAt"`)} from "Socio" s where ${reciente(`s."createdAt"`)}
         union all
         select s."aprId", ${diaDe(`x."createdAt"`)} from "Pago" x join "Socio" s on s.id = x."socioId" where ${reciente(`x."createdAt"`)}
         union all
         select p."aprId", ${diaDe(`se."createdAt"`)} from session se join "user" p on p.id = se."userId"
           where p.rol::text <> 'SOCIO' and ${reciente(`se."createdAt"`)}
         union all
         select p."aprId", ${diaDe(`se."updatedAt"`)} from session se join "user" p on p.id = se."userId"
           where p.rol::text <> 'SOCIO' and ${reciente(`se."updatedAt"`)}
       ) t
       where "aprId" is not null
       group by 1, 2`
    ),
  ]);

  const porDia = new Map(usos.map((u) => [`${u.aprId}|${u.dia}`, u.n]));
  const hace = (iso: string | null) => (iso ? diasDesde(new Date(iso)) : null);

  const comites = filas.map(({ prueba, alta, cobrado, pagado, ultimo_ingreso, ultima_senal, ...f }) => {
    const dia = diaEnChile(new Date(alta));
    const senal = ultima_senal ? new Date(ultima_senal) : null;
    const diaSenal = senal ? diaEnChile(senal) : null;
    return {
      ...f,
      enPrueba: prueba !== null && Date.parse(prueba) > Date.now(),
      recaudado: cobrado > 0 ? Math.round((pagado / cobrado) * 100) : null,
      registrado: `${dia.slice(8, 10)} ${mesCorto(dia).toLowerCase()} ${dia.slice(0, 4)}`,
      actividad: hace(ultima_senal),
      ingreso: hace(ultimo_ingreso),
      ultima: senal && diaSenal ? `${diaSenal === hoy ? "hoy" : corta(diaSenal)}, ${HORA.format(senal)}` : null,
      uso: dias.map((d) => {
        const n = porDia.get(`${f.id}|${d}`) ?? 0;
        const nivel: 0 | 1 | 2 | null = d > hoy ? null : n >= HARTO_USO ? 2 : n > 0 ? 1 : 0;
        return { dia: corta(d), nivel };
      }),
      senal: senal?.getTime() ?? 0,
    };
  });

  // Del que usó la aplicación más recién al más dormido.
  comites.sort((a, b) => b.senal - a.senal);
  return comites;
}
