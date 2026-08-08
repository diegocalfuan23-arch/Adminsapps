import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

/**
 * Qué producto originó un dato. Se guarda como texto y no como referencia
 * porque los productos viven en bases distintas: aquí solo se etiqueta.
 */
export const productoEnum = pgEnum("Producto", ["FACILAGUA", "MECANICOAPP"]);

/**
 * Notas propias del panel sobre un cliente de cualquiera de los productos.
 * El cliente vive en la base del producto; aquí solo se guarda su id y el
 * producto al que pertenece, más lo que yo anote sobre él.
 */
export const notas = pgTable(
  "Nota",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    producto: productoEnum("producto").notNull(),
    /** Id del cliente en la base del producto correspondiente. */
    clienteId: text("clienteId").notNull(),
    /** Copia del nombre al momento de escribir: evita ir a buscarlo solo
        para listar las notas, y deja rastro si el cliente se borra. */
    clienteNombre: text("clienteNombre").notNull(),
    texto: text("texto").notNull(),
    createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { precision: 3 }).notNull().defaultNow(),
  },
  (table) => [
    index("Nota_producto_cliente_idx").on(table.producto, table.clienteId),
    index("Nota_createdAt_idx").on(table.createdAt),
  ]
);
