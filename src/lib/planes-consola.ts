import { sql } from "drizzle-orm";
import { dbFacilagua } from "@/lib/db";
import { llamarFacilapr } from "@/lib/facilapr";
import { diaEnChile, mesCorto, nombreMes } from "@/lib/tiempo";

/** Lo que muestra «Planes»: lo que ofrece cada plan (lo dice Facilapr) y quién está en cada uno (de su base, solo lectura). */

export type ClavePlan = "PRUEBA" | "BASICO" | "ESTANDAR" | "PREMIUM";

export type Pago = "al-dia" | "atrasado" | "prueba" | "sin-pagos";

export type ComitePlan = { id: string; nombre: string; socios: number; pago: Pago };

export type PlanVista = {
  clave: ClavePlan;
  nombre: string;
  precio: string;
  /** Null: sin tope. */
  limiteSocios: number | null;
  comites: ComitePlan[];
  socios: number;
  /** Pesos al mes, sin IVA, de lo que está pagado y vigente. */
  ingreso: number;
};

export type Caracteristica = { categoria: string; nombre: string; en: Record<ClavePlan, boolean> };

export type DatosPlanes = {
  planes: PlanVista[];
  caracteristicas: Caracteristica[];
  ingreso: number;
  ingresoAnterior: number;
  mesAnterior: string;
  pagando: number;
  total: number;
  enPrueba: number;
  atrasados: string[];
  pruebas: { nombre: string; vence: string }[];
};

type Catalogo = {
  planes: { clave: Exclude<ClavePlan, "PRUEBA">; nombre: string; uf: number | null; desde: number | null; limiteSocios: number | null }[];
  caracteristicas: Caracteristica[];
};

async function leer<T>(consulta: string): Promise<T[]> {
  const r = await dbFacilagua().execute(sql.raw(consulta));
  return r.rows as T[];
}

const uf = new Intl.NumberFormat("es-CL", { maximumFractionDigits: 2 });

type Pagado = { aprId: string; periodo: string; neto: number; desde: string; hasta: string };

/**
 * Lo que aportaba por mes un comité en un momento dado: la orden pagada que cubría esa fecha, llevada a un mes. El año
 * se paga como once meses.
 */
function aporte(pagos: Pagado[], cuando: number) {
  const vigente = pagos.find((p) => Date.parse(p.desde) <= cuando && cuando < Date.parse(p.hasta));
  if (!vigente) return 0;
  return Math.round(vigente.periodo === "ANUAL" ? vigente.neto / 12 : vigente.neto);
}

export async function datosPlanes(): Promise<{ ok: true; datos: DatosPlanes } | { ok: false; error: string }> {
  const [catalogo, comites, pagos] = await Promise.all([
    llamarFacilapr<Catalogo>("/api/interno/planes", {}),
    leer<{ id: string; nombre: string; plan: Exclude<ClavePlan, "PRUEBA">; socios: number; prueba: string | null }>(
      `select a.id, trim(a.nombre) as nombre, a.plan::text as plan,
         (select count(*)::int from "Socio" s where s."aprId" = a.id and s.activo) as socios,
         (a."pruebaHasta" at time zone 'UTC') as prueba
       from "Apr" a order by socios desc, a.nombre`
    ),
    leer<Pagado>(
      `select "aprId", periodo, "montoNeto" as neto, ("vigenteDesde" at time zone 'UTC') as desde, ("vigenteHasta" at time zone 'UTC') as hasta
       from "PagoPlan" where estado = 'PAGADO' and "vigenteDesde" is not null and "vigenteHasta" is not null`
    ),
  ]);
  if (!catalogo.ok) return { ok: false, error: catalogo.error };

  const ahora = Date.now();
  const hoy = diaEnChile();
  // El último instante del mes anterior.
  const finAnterior = Date.parse(`${hoy.slice(0, 7)}-01T03:00:00Z`) - 1;
  const mesAnterior = diaEnChile(new Date(finAnterior)).slice(0, 7);

  const filas = comites.map((c) => {
    const suyos = pagos.filter((p) => p.aprId === c.id);
    const enPrueba = c.prueba !== null && Date.parse(c.prueba) > ahora;
    const alDia = suyos.some((p) => Date.parse(p.hasta) > ahora);
    const pago: Pago = enPrueba ? "prueba" : alDia ? "al-dia" : suyos.length > 0 ? "atrasado" : "sin-pagos";
    return {
      ...c,
      pago,
      grupo: (enPrueba ? "PRUEBA" : c.plan) as ClavePlan,
      ingreso: enPrueba ? 0 : aporte(suyos, ahora),
      anterior: aporte(suyos, finAnterior),
    };
  });

  const definiciones: { clave: ClavePlan; nombre: string; precio: string; limiteSocios: number | null }[] = [
    { clave: "PRUEBA", nombre: "Prueba", precio: "Gratis", limiteSocios: null },
    ...catalogo.datos.planes.map((p) => ({
      clave: p.clave,
      nombre: p.nombre,
      precio: p.uf !== null ? `${uf.format(p.uf)} UF` : `Desde ${uf.format(p.desde ?? 0)} UF`,
      limiteSocios: p.limiteSocios,
    })),
  ];

  const planes: PlanVista[] = definiciones.map((d) => {
    const suyos = filas.filter((f) => f.grupo === d.clave);
    return {
      ...d,
      comites: suyos.map((f) => ({ id: f.id, nombre: f.nombre, socios: f.socios, pago: f.pago })),
      socios: suyos.reduce((s, f) => s + f.socios, 0),
      ingreso: suyos.reduce((s, f) => s + f.ingreso, 0),
    };
  });

  const corta = (iso: string) => {
    const dia = diaEnChile(new Date(iso));
    return `${Number(dia.slice(8, 10))} ${mesCorto(dia).toLowerCase()}`;
  };

  return {
    ok: true,
    datos: {
      planes,
      caracteristicas: catalogo.datos.caracteristicas,
      ingreso: filas.reduce((s, f) => s + f.ingreso, 0),
      ingresoAnterior: filas.reduce((s, f) => s + f.anterior, 0),
      mesAnterior: nombreMes(mesAnterior),
      pagando: filas.filter((f) => f.ingreso > 0).length,
      total: filas.length,
      enPrueba: filas.filter((f) => f.pago === "prueba").length,
      atrasados: filas.filter((f) => f.pago === "atrasado").map((f) => f.nombre),
      pruebas: filas
        .filter((f) => f.pago === "prueba")
        .sort((a, b) => Date.parse(a.prueba!) - Date.parse(b.prueba!))
        .map((f) => ({ nombre: f.nombre, vence: corta(f.prueba!) })),
    },
  };
}
