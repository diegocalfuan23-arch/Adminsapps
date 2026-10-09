import { ListaCuentas } from "@/components/cuentas";
import { CrearComite } from "@/components/crear-comite";
import { cuentasFacilagua } from "@/lib/metricas";

export const dynamic = "force-dynamic";

export default async function ComitesPage() {
  const cuentas = await cuentasFacilagua();

  const urlLogin = process.env.FACILAPR_URL
    ? new URL("/login", process.env.FACILAPR_URL).toString()
    : null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Comités</h1>
        <p className="mt-1 text-sm text-black/55 dark:text-white/55">
          Los comités de Facilapr, del más activo al más dormido.
        </p>
      </div>

      <CrearComite urlLogin={urlLogin} />

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
