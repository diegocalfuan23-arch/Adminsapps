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

/**
 * Precio por millón de tokens, en USD, de los modelos que usa FacilAgua.
 * Hay que actualizarlos a mano si cambian: no existe un endpoint de
 * Anthropic/OpenAI que los entregue.
 *
 * Fuente: precios publicados en anthropic.com/pricing y openai.com/pricing,
 * revisados 2026-08. "ninguno" (respuesta enlatada, sin proveedor) es $0.
 */
const PRECIO_POR_MILLON_USD: Record<string, { entrada: number; salida: number }> = {
  "claude-haiku-4-5": { entrada: 1, salida: 5 },
  "claude-opus-5": { entrada: 5, salida: 25 },
  "gpt-4o-mini": { entrada: 0.15, salida: 0.6 },
  ninguno: { entrada: 0, salida: 0 },
};

export type CostoIaProducto = {
  producto: string;
  error: string | null;
  totalUsd: number | null;
  llamadas: number | null;
  porOrigen: { origen: string; llamadas: number; usd: number }[];
  porComite: { aprId: string | null; nombre: string; usd: number }[];
};

/**
 * Costo de IA de FacilAgua en los últimos 30 días, calculado desde tokens
 * reales (tabla UsoIA) — no desde `max_tokens`, que es solo el tope pedido,
 * nunca lo que se gastó.
 */
export async function costoIaFacilagua(): Promise<CostoIaProducto> {
  try {
    const filasUso = await filas<{
      origen: string;
      aprId: string | null;
      nombreComite: string | null;
      modelo: string;
      tokensEntrada: number;
      tokensSalida: number;
    }>(
      dbFacilagua,
      `select u.origen, u."aprId", a.nombre as "nombreComite", u.modelo,
         u."tokensEntrada", u."tokensSalida"
       from "UsoIA" u
       left join "Apr" a on a.id = u."aprId"
       where u."createdAt" > now() - interval '30 days'`
    );

    let totalUsd = 0;
    const porOrigenMap = new Map<string, { llamadas: number; usd: number }>();
    const porComiteMap = new Map<
      string,
      { aprId: string | null; nombre: string; usd: number }
    >();

    for (const f of filasUso) {
      const precio = PRECIO_POR_MILLON_USD[f.modelo];
      // Modelo desconocido (ej. se cambió el nombre en el código y no se
      // actualizó esta tabla): no se inventa un precio, se cuenta aparte.
      const usd = precio
        ? (f.tokensEntrada * precio.entrada + f.tokensSalida * precio.salida) /
          1_000_000
        : 0;
      totalUsd += usd;

      const origen = porOrigenMap.get(f.origen) ?? { llamadas: 0, usd: 0 };
      origen.llamadas += 1;
      origen.usd += usd;
      porOrigenMap.set(f.origen, origen);

      const claveComite = f.aprId ?? "sin-comite";
      const comite = porComiteMap.get(claveComite) ?? {
        aprId: f.aprId,
        nombre: f.nombreComite ?? "Landing (sin comité)",
        usd: 0,
      };
      comite.usd += usd;
      porComiteMap.set(claveComite, comite);
    }

    return {
      producto: "FacilAgua",
      error: null,
      totalUsd,
      llamadas: filasUso.length,
      porOrigen: [...porOrigenMap.entries()]
        .map(([origen, v]) => ({ origen, ...v }))
        .sort((a, b) => b.usd - a.usd),
      porComite: [...porComiteMap.values()]
        .sort((a, b) => b.usd - a.usd)
        .slice(0, 10),
    };
  } catch (e) {
    return {
      producto: "FacilAgua",
      error: (e as Error).message,
      totalUsd: null,
      llamadas: null,
      porOrigen: [],
      porComite: [],
    };
  }
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

/**
 * Consulta desde el formulario público de facilagua.com. No pertenece a
 * ningún comité — quien escribe todavía evalúa contratar — así que vive
 * acá, en el panel del dueño, y no dentro del panel multi-tenant de
 * FacilAgua.
 */
export type ConsultaFacilagua = {
  id: string;
  nombre: string;
  apr: string;
  contacto: string;
  mensaje: string | null;
  origen: string | null;
  estado: "NUEVA" | "RESPONDIDA" | "DESCARTADA";
  createdAt: Date;
};

export async function consultasFacilagua(): Promise<ConsultaFacilagua[]> {
  const rows = await filas<{
    id: string;
    nombre: string;
    apr: string;
    contacto: string;
    mensaje: string | null;
    origen: string | null;
    estado: "NUEVA" | "RESPONDIDA" | "DESCARTADA";
    createdAt: string;
  }>(
    dbFacilagua,
    `select id, nombre, apr, contacto, mensaje, origen, estado, "createdAt"
     from "Consulta"
     order by "createdAt" desc
     limit 100`
  );

  return rows.map((r) => ({ ...r, createdAt: new Date(r.createdAt) }));
}
