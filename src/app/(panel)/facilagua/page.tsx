import { BloqueProducto } from "@/components/kpi";
import { ListaCuentas } from "@/components/cuentas";
import { metricasFacilagua, cuentasFacilagua } from "@/lib/metricas";

export const dynamic = "force-dynamic";

export default async function FacilaguaPage() {
  const [datos, cuentas] = await Promise.all([
    metricasFacilagua(),
    cuentasFacilagua(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">FacilAgua</h1>
        <p className="mt-1 text-sm text-black/55 dark:text-white/55">
          Comités de Agua Potable Rural.
        </p>
      </div>

      <BloqueProducto datos={datos} />

      <section>
        <h2 className="font-mono text-[0.72rem] font-semibold tracking-[0.09em] text-black/50 uppercase dark:text-white/50">
          Comités registrados
        </h2>
        <div className="mt-3">
          <ListaCuentas
            cuentas={cuentas}
            vacio="Todavía no hay comités registrados."
          />
        </div>
      </section>
    </div>
  );
}
