import { BloqueProducto } from "@/components/kpi";
import { metricasFacilagua } from "@/lib/metricas";

export const dynamic = "force-dynamic";

export default async function FacilaguaPage() {
  const datos = await metricasFacilagua();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">FacilAgua</h1>
        <p className="mt-1 text-sm text-black/55 dark:text-white/55">
          Comités de Agua Potable Rural.
        </p>
      </div>

      <BloqueProducto datos={datos} />
    </div>
  );
}
