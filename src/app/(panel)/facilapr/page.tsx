import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BloqueProducto } from "@/components/kpi";
import { metricasFacilagua } from "@/lib/metricas";

export const dynamic = "force-dynamic";

const ATAJOS = [
  { href: "/facilapr/comites", titulo: "Comités", texto: "Ver los comités y crear una cuenta nueva." },
  { href: "/facilapr/lecturas", titulo: "Lecturas", texto: "Qué comités están cargando lecturas y cuáles esperan aprobación." },
  { href: "/consultas", titulo: "Consultas", texto: "Los contactos del formulario de facilapr.cl, para responder." },
];

export default async function FacilaprPage() {
  const datos = await metricasFacilagua();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Facilapr</h1>
        <p className="mt-1 text-sm text-black/55 dark:text-white/55">
          Comités de Agua Potable Rural.
        </p>
      </div>

      <BloqueProducto datos={datos} />

      <section>
        <h2 className="font-mono text-[0.72rem] font-semibold tracking-[0.09em] text-black/50 uppercase dark:text-white/50">
          Ir a
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {ATAJOS.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="group rounded-xl border border-black/[0.08] p-4 transition-colors hover:bg-black/[0.03] dark:border-white/[0.12] dark:hover:bg-white/[0.05]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{a.titulo}</span>
                <ArrowRight className="size-4 text-black/35 transition-transform group-hover:translate-x-0.5 dark:text-white/35" />
              </div>
              <p className="mt-1 text-[0.82rem] text-black/55 dark:text-white/55">{a.texto}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
