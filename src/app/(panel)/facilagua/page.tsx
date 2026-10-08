import { BloqueProducto } from "@/components/kpi";
import { ListaCuentas } from "@/components/cuentas";
import { CrearComite } from "@/components/crear-comite";
import { metricasFacilagua, cuentasFacilagua } from "@/lib/metricas";

export const dynamic = "force-dynamic";

export default async function FacilaguaPage() {
  const [datos, cuentas] = await Promise.all([
    metricasFacilagua(),
    cuentasFacilagua(),
  ]);

  const urlLogin = process.env.FACILAPR_URL
    ? new URL("/login", process.env.FACILAPR_URL).toString()
    : null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Facilapr</h1>
          <p className="mt-1 text-sm text-black/55 dark:text-white/55">
            Comités de Agua Potable Rural.
          </p>
        </div>
      </div>

      <CrearComite urlLogin={urlLogin} />

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
