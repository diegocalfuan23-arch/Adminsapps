import type { ConsultaFacilagua } from "@/lib/metricas";

const FECHA = new Intl.DateTimeFormat("es-CL", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const ESTILO_ESTADO: Record<
  ConsultaFacilagua["estado"],
  { texto: string; clase: string }
> = {
  NUEVA: {
    texto: "Nueva",
    clase:
      "bg-emerald-500/12 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  },
  RESPONDIDA: {
    texto: "Respondida",
    clase: "bg-black/[0.06] text-black/55 dark:bg-white/[0.08] dark:text-white/55",
  },
  DESCARTADA: {
    texto: "Descartada",
    clase: "bg-black/[0.06] text-black/40 dark:bg-white/[0.08] dark:text-white/40",
  },
};

/**
 * Solo lectura, a propósito: este panel garantiza que nunca escribe en las
 * bases de los productos. Para marcar una consulta como respondida hay que
 * cambiarlo directo en la base de FacilAgua (Drizzle Studio o un update
 * puntual), no desde acá.
 */
export function ListaConsultas({
  consultas,
}: {
  consultas: ConsultaFacilagua[];
}) {
  if (consultas.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-black/[0.12] p-6 text-center text-sm text-black/40 dark:border-white/[0.15] dark:text-white/40">
        Todavía no hay consultas.
      </p>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-black/[0.06] rounded-xl border border-black/[0.08] dark:divide-white/[0.08] dark:border-white/[0.12]">
      {consultas.map((c) => {
        const estado = ESTILO_ESTADO[c.estado];
        return (
          <li key={c.id} className="flex flex-col gap-1.5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-baseline gap-2">
                <span className="font-medium">{c.nombre}</span>
                <span className="text-[0.85rem] text-black/50 dark:text-white/50">
                  · {c.apr}
                </span>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-[0.75rem] font-medium ${estado.clase}`}
              >
                {estado.texto}
              </span>
            </div>

            <div className="font-mono text-[0.85rem] text-black/70 dark:text-white/70">
              {c.contacto}
            </div>

            {c.mensaje && (
              <p className="text-[0.88rem] text-black/60 dark:text-white/60">
                {c.mensaje}
              </p>
            )}

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.78rem] text-black/40 dark:text-white/40">
              <span>{FECHA.format(c.createdAt)}</span>
              <span>·</span>
              <span>origen: {c.origen ?? "directo"}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
