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
