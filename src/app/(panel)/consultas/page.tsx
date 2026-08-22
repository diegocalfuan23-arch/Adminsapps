import { ListaConsultas } from "@/components/consultas";
import { consultasFacilagua } from "@/lib/metricas";

export const dynamic = "force-dynamic";

export default async function ConsultasPage() {
  const consultas = await consultasFacilagua();
  const nuevas = consultas.filter((c) => c.estado === "NUEVA").length;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Consultas</h1>
        <p className="mt-1 text-sm text-black/55 dark:text-white/55">
          Formulario de contacto de facilagua.com
          {nuevas > 0 && ` — ${nuevas} sin responder`}.
        </p>
      </div>

      <ListaConsultas consultas={consultas} />
    </div>
  );
}
