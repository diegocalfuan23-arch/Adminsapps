import type { ComiteDetalle } from "@/lib/comites-consola";

export type Grupo = "activos" | "poco" | "dormidos" | "nunca";

/** Activo si la usó esta semana, poco activo si fue este mes, dormido si hace más. */
export const grupoDe = (c: ComiteDetalle): Grupo => (c.actividad === null ? "nunca" : c.actividad <= 7 ? "activos" : c.actividad <= 30 ? "poco" : "dormidos");

export const GRUPOS: Grupo[] = ["activos", "poco", "dormidos", "nunca"];

export const GRUPO: Record<Grupo, { nombre: string; punto: string; texto: string }> = {
  activos: { nombre: "Activos", punto: "bg-emerald-500", texto: "text-emerald-700" },
  poco: { nombre: "Poco activos", punto: "bg-amber-400", texto: "text-amber-700" },
  dormidos: { nombre: "Dormidos", punto: "bg-rose-400", texto: "text-rose-700" },
  nunca: { nombre: "Nunca usaron", punto: "bg-[#D4D0E4]", texto: "text-[#8D89A6]" },
};

export type NombrePlan = "Prueba" | "Pequeño" | "Estándar" | "Grande";

export const nombrePlan = (c: ComiteDetalle): NombrePlan =>
  c.enPrueba ? "Prueba" : c.plan === "BASICO" ? "Pequeño" : c.plan === "ESTANDAR" ? "Estándar" : "Grande";

export const PLAN_CHIP: Record<NombrePlan, string> = {
  Prueba: "bg-[#F5F4FA] text-[#6E6A86]",
  Pequeño: "bg-[#F3F0FF] text-[#6A52F0]",
  Estándar: "bg-[#EEEAFF] text-[#3A0CE3]",
  Grande: "bg-[#16132B] text-white",
};

export const haceDias = (d: number | null) => (d === null ? "Nunca" : d === 0 ? "Hoy" : d === 1 ? "Ayer" : `Hace ${d} días`);

export const corto = (d: number | null) => (d === null ? "—" : d === 0 ? "Hoy" : `${d} d`);

/** Las iniciales de lo que distingue al comité: «Comité de Agua Potable Quema» es Q. */
export function iniciales(nombre: string) {
  const palabras = nombre.split(/\s+/).filter((p) => !/^(comit[eé]|apr|ssr|de|del|la|agua|potable|rural)$/i.test(p));
  return (palabras.length ? palabras : nombre.split(/\s+/))
    .slice(0, 2)
    .map((p) => p[0] ?? "")
    .join("")
    .toUpperCase();
}
