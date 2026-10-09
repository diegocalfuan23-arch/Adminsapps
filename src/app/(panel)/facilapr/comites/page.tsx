import { ListaComites } from "@/components/lista-comites";
import { cuentasFacilagua } from "@/lib/metricas";

export const dynamic = "force-dynamic";

export default async function ComitesPage() {
  const cuentas = await cuentasFacilagua();

  const urlLogin = process.env.FACILAPR_URL
    ? new URL("/login", process.env.FACILAPR_URL).toString()
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Comités</h1>
        <p className="mt-1 text-sm text-black/55 dark:text-white/55">
          Los comités de Facilapr, del más activo al más dormido.
        </p>
      </div>

      <ListaComites cuentas={cuentas} urlLogin={urlLogin} />
    </div>
  );
}
