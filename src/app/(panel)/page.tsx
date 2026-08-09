import { BloqueProducto } from "@/components/kpi";
import { metricasFacilagua, metricasMecanicoapp } from "@/lib/metricas";

// Los números cambian todo el tiempo: nunca servir una versión cacheada.
export const dynamic = "force-dynamic";

export default async function ResumenPage() {
  // En paralelo: son bases distintas, no tiene sentido esperar una tras otra.
  const [facilagua, mecanicoapp] = await Promise.all([
    metricasFacilagua(),
    metricasMecanicoapp(),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Resumen</h1>
        <p className="mt-1 text-sm text-black/55 dark:text-white/55">
          Datos en vivo de ambos productos.
        </p>
      </div>

      <BloqueProducto datos={facilagua} />
      <BloqueProducto datos={mecanicoapp} />
    </div>
  );
}
