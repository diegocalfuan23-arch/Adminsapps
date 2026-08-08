import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as appSchema from "./schema";
import * as authSchema from "./auth-schema";

const schema = { ...appSchema, ...authSchema };

/**
 * Pools cacheados en globalThis: en desarrollo Next recarga los módulos en
 * cada cambio, y sin esto se abriría una conexión nueva por recarga hasta
 * agotar el límite de Neon.
 */
const global = globalThis as unknown as {
  poolPanel?: Pool;
  poolFacilagua?: Pool;
  poolMecanicoapp?: Pool;
};

function crearPool(url: string | undefined, nombre: string): Pool {
  if (!url) {
    throw new Error(
      `Falta la variable de entorno para la base de ${nombre}. Revisa .env.example.`
    );
  }
  return new Pool({ connectionString: url });
}

/**
 * Base propia del panel: usuarios y notas. Aquí sí se escribe.
 *
 * Se conecta de forma perezosa (getter) y no al importar el módulo: si la
 * URL falta, el error aparece al usar la base, no al compilar. Sin esto el
 * build falla entero mientras la base del panel no esté creada.
 */
function panel() {
  const pool =
    global.poolPanel ?? crearPool(process.env.DATABASE_URL, "el panel");
  if (process.env.NODE_ENV !== "production") global.poolPanel = pool;
  return drizzle(pool, { schema });
}

export const db = new Proxy({} as ReturnType<typeof panel>, {
  get: (_, prop) => Reflect.get(panel(), prop),
});

/**
 * Bases de los productos: solo lectura, y garantizado por Postgres.
 *
 * Las URLs usan el mismo usuario que cada app, que sí puede escribir. Para
 * que un error aquí no pueda tocar datos de producción, cada conexión nueva
 * se marca como read-only apenas se abre: cualquier INSERT/UPDATE/DELETE
 * falla en el servidor, no queda dependiendo de que el código se porte bien.
 *
 * Se crean de forma perezosa para que el panel arranque aunque falte la URL
 * de un producto (por ejemplo, si todavía no configuraste mecanicoapp).
 */
function crearPoolSoloLectura(url: string | undefined, nombre: string): Pool {
  const pool = crearPool(url, nombre);
  pool.on("connect", (cliente) => {
    cliente.query("set default_transaction_read_only = on");
  });
  return pool;
}

export function dbFacilagua() {
  const pool =
    global.poolFacilagua ??
    crearPoolSoloLectura(process.env.DATABASE_URL_FACILAGUA, "FacilAgua");
  if (process.env.NODE_ENV !== "production") global.poolFacilagua = pool;
  return drizzle(pool);
}

export function dbMecanicoapp() {
  const pool =
    global.poolMecanicoapp ??
    crearPoolSoloLectura(process.env.DATABASE_URL_MECANICOAPP, "mecanicoapp");
  if (process.env.NODE_ENV !== "production") global.poolMecanicoapp = pool;
  return drizzle(pool);
}
