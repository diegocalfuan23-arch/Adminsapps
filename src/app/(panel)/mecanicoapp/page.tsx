import { BloqueProducto } from "@/components/kpi";
import { ListaCuentas } from "@/components/cuentas";
import { metricasMecanicoapp, cuentasMecanicoapp } from "@/lib/metricas";

export const dynamic = "force-dynamic";

export default async function MecanicoappPage() {
  const [datos, cuentas] = await Promise.all([
    metricasMecanicoapp(),
    cuentasMecanicoapp(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">mecanicoapp</h1>
        <p className="mt-1 text-sm text-black/55 dark:text-white/55">
          Talleres mecánicos.
        </p>
      </div>

      <BloqueProducto datos={datos} />

      <section>
        <h2 className="font-mono text-[0.72rem] font-semibold tracking-[0.09em] text-black/50 uppercase dark:text-white/50">
          Talleres registrados
        </h2>
        <div className="mt-3">
          <ListaCuentas
            cuentas={cuentas}
            vacio="Todavía no hay talleres registrados."
          />
        </div>
      </section>
    </div>
  );
}
