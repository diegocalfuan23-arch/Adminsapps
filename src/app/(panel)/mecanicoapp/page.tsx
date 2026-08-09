import { BloqueProducto } from "@/components/kpi";
import { metricasMecanicoapp } from "@/lib/metricas";

export const dynamic = "force-dynamic";

export default async function MecanicoappPage() {
  const datos = await metricasMecanicoapp();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">mecanicoapp</h1>
        <p className="mt-1 text-sm text-black/55 dark:text-white/55">
          Talleres mecánicos.
        </p>
      </div>

      <BloqueProducto datos={datos} />
    </div>
  );
}
