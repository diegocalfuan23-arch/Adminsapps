import { sql } from "drizzle-orm";
import { dbFacilagua, dbMecanicoapp } from "@/lib/db";

/**
 * Consultas contra las bases de los productos.
 *
 * Van en SQL crudo a propósito: replicar aquí los schemas de Drizzle de cada
 * app significaría mantener tres copias sincronizadas a mano. El panel solo
 * lee, así que basta con conocer los nombres de tabla y columna.
 *
 * Toda consulta puede fallar (base caída, tabla renombrada en el producto);
 * por eso cada métrica devuelve `null` en vez de tirar la página abajo.
 */

export type Metrica = {
  etiqueta: string;
  valor: number | null;
  detalle?: string;
};

export type MetricasProducto = {
  producto: string;
  error: string | null;
  metricas: Metrica[];
};

async function contar(
  base: () => ReturnType<typeof dbFacilagua>,
  consulta: string
): Promise<number | null> {
  try {
    const r = await base().execute(sql.raw(consulta));
    const fila = r.rows[0] as { n: string | number } | undefined;
    return fila ? Number(fila.n) : 0;
  } catch {
    return null;
  }
}

export async function metricasFacilagua(): Promise<MetricasProducto> {
  try {
    const [comites, socios, boletas, consultas, pendientes, lecturas] =
      await Promise.all([
        contar(dbFacilagua, `select count(*)::int as n from "Apr"`),
        contar(dbFacilagua, `select count(*)::int as n from "Socio"`),
        contar(dbFacilagua, `select count(*)::int as n from "Boleta"`),
        contar(dbFacilagua, `select count(*)::int as n from "Consulta"`),
        contar(
          dbFacilagua,
          `select count(*)::int as n from "Consulta" where estado = 'NUEVA'`
        ),
        contar(
          dbFacilagua,
          `select count(*)::int as n from "Lectura" where estado = 'PENDIENTE'`
        ),
      ]);

    return {
      producto: "FacilAgua",
      error: null,
      metricas: [
        { etiqueta: "Comités", valor: comites },
        { etiqueta: "Socios", valor: socios },
        { etiqueta: "Boletas", valor: boletas },
        {
          etiqueta: "Consultas",
          valor: consultas,
          detalle:
            pendientes && pendientes > 0 ? `${pendientes} sin responder` : undefined,
        },
        {
          etiqueta: "Lecturas por aprobar",
          valor: lecturas,
        },
      ],
    };
  } catch (e) {
    return {
      producto: "FacilAgua",
      error: (e as Error).message,
      metricas: [],
    };
  }
}

export async function metricasMecanicoapp(): Promise<MetricasProducto> {
  try {
    // En mecanicoapp el taller ES el usuario: no hay tabla de talleres aparte.
    const [talleres, clientes, vehiculos, trabajos, fiados] = await Promise.all([
      contar(dbMecanicoapp, `select count(*)::int as n from "user"`),
      contar(dbMecanicoapp, `select count(*)::int as n from cliente`),
      contar(dbMecanicoapp, `select count(*)::int as n from vehiculo`),
      contar(dbMecanicoapp, `select count(*)::int as n from trabajo`),
      contar(
        dbMecanicoapp,
        `select count(*)::int as n from trabajo where estado_pago in ('fiado','abonado')`
      ),
    ]);

    return {
      producto: "mecanicoapp",
      error: null,
      metricas: [
        { etiqueta: "Talleres", valor: talleres },
        { etiqueta: "Clientes", valor: clientes },
        { etiqueta: "Vehículos", valor: vehiculos },
        {
          etiqueta: "Órdenes de trabajo",
          valor: trabajos,
          detalle: fiados && fiados > 0 ? `${fiados} por cobrar` : undefined,
        },
      ],
    };
  } catch (e) {
    return {
      producto: "mecanicoapp",
      error: (e as Error).message,
      metricas: [],
    };
  }
}

/**
 * El detalle de cada cuenta: quién es, cuándo se registró y si sigue
 * activa. Los conteos totales no dicen si alguien está usando el
 * producto o solo se registró y lo abandonó.
 */
export type Cuenta = {
  id: string;
  nombre: string;
  registrada: Date;
  /** Última señal de vida: lo más reciente que hizo en el producto. */
  ultimaActividad: Date | null;
  activo: boolean;
  detalle: string;
};

async function filas<T>(
  base: () => ReturnType<typeof dbFacilagua>,
  consulta: string
): Promise<T[]> {
  try {
    const r = await base().execute(sql.raw(consulta));
    return r.rows as T[];
  } catch {
    return [];
  }
}

/** Los comités de FacilAgua, del más activo al más dormido. */
export async function cuentasFacilagua(): Promise<Cuenta[]> {
  const rows = await filas<{
    id: string;
    nombre: string;
    comuna: string | null;
    registrada: string;
    activo: boolean;
    socios: number;
    boletas: number;
    ultima: string | null;
  }>(
    dbFacilagua,
    `select a.id, a.nombre, a.comuna, a."createdAt" as registrada, a.activo,
       (select count(*)::int from "Socio" s where s."aprId" = a.id) as socios,
       (select count(*)::int from "Boleta" b
          join "Socio" s on s.id = b."socioId" where s."aprId" = a.id) as boletas,
       greatest(
         (select max(b."createdAt") from "Boleta" b
            join "Socio" s on s.id = b."socioId" where s."aprId" = a.id),
         (select max(l."createdAt") from "Lectura" l
            join "Socio" s on s.id = l."socioId" where s."aprId" = a.id),
         (select max(s."createdAt") from "Socio" s where s."aprId" = a.id)
       ) as ultima
     from "Apr" a
     order by ultima desc nulls last, a."createdAt" desc`
  );

  return rows.map((r) => ({
    id: r.id,
    nombre: r.nombre,
    registrada: new Date(r.registrada),
    ultimaActividad: r.ultima ? new Date(r.ultima) : null,
    activo: r.activo,
    detalle: [
      r.comuna,
      `${r.socios} ${r.socios === 1 ? "socio" : "socios"}`,
      `${r.boletas} ${r.boletas === 1 ? "boleta" : "boletas"}`,
    ]
      .filter(Boolean)
      .join(" · "),
  }));
}

/** Los talleres de mecanicoapp. El taller ES el usuario. */
export async function cuentasMecanicoapp(): Promise<Cuenta[]> {
  const rows = await filas<{
    id: string;
    nombre: string;
    email: string;
    registrada: string;
    vehiculos: number;
    trabajos: number;
    ultima: string | null;
  }>(
    dbMecanicoapp,
    `select u.id, coalesce(u.taller, u.name) as nombre, u.email,
       u.created_at as registrada,
       (select count(*)::int from vehiculo v where v.taller_id = u.id) as vehiculos,
       (select count(*)::int from trabajo t where t.taller_id = u.id) as trabajos,
       greatest(
         (select max(t.updated_at) from trabajo t where t.taller_id = u.id),
         (select max(v.created_at) from vehiculo v where v.taller_id = u.id)
       ) as ultima
     from "user" u
     order by ultima desc nulls last, u.created_at desc`
  );

  return rows.map((r) => ({
    id: r.id,
    nombre: r.nombre,
    registrada: new Date(r.registrada),
    ultimaActividad: r.ultima ? new Date(r.ultima) : null,
    // mecanicoapp no tiene cuentas desactivadas todavía
    activo: true,
    detalle: [
      r.email,
      `${r.vehiculos} ${r.vehiculos === 1 ? "vehículo" : "vehículos"}`,
      `${r.trabajos} ${r.trabajos === 1 ? "orden" : "órdenes"}`,
    ].join(" · "),
  }));
}
