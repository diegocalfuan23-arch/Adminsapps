import { datosPlanes } from "@/lib/planes-consola";
import { PlanesVista } from "@/components/consola/planes/vista";

export const dynamic = "force-dynamic";

export default async function PlanesPage() {
  let r: Awaited<ReturnType<typeof datosPlanes>>;
  try {
    r = await datosPlanes();
  } catch (e) {
    console.error("Planes:", e);
    r = { ok: false, error: (e as { cause?: { message?: string } }).cause?.message ?? (e as Error).message };
  }
  if (!r.ok) {
    return <p className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">No se pudieron leer los planes: {r.error}</p>;
  }
  return <PlanesVista datos={r.datos} />;
}
