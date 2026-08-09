import type { Metrica, MetricasProducto } from "@/lib/metricas";

function Tarjeta({ etiqueta, valor, detalle }: Metrica) {
  return (
    <div className="rounded-xl border border-black/[0.08] p-4 dark:border-white/[0.12]">
      <div className="text-[0.8rem] text-black/55 dark:text-white/55">
        {etiqueta}
      </div>
      <div className="mt-1.5 font-mono text-2xl font-semibold tabular-nums">
        {valor === null ? (
          <span className="text-base font-normal text-black/35 dark:text-white/35">
            sin dato
          </span>
        ) : (
          valor.toLocaleString("es-CL")
        )}
      </div>
      {detalle && (
        <div className="mt-1 text-[0.78rem] text-amber-700 dark:text-amber-400">
          {detalle}
        </div>
      )}
    </div>
  );
}

export function BloqueProducto({ datos }: { datos: MetricasProducto }) {
  return (
    <section>
      <h2 className="font-mono text-[0.72rem] font-semibold tracking-[0.09em] text-black/50 uppercase dark:text-white/50">
        {datos.producto}
      </h2>

      {datos.error ? (
        <p className="mt-3 rounded-xl border border-red-500/25 bg-red-500/[0.06] p-4 text-sm text-red-600 dark:text-red-400">
          No se pudo leer la base: {datos.error}
        </p>
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {datos.metricas.map((m) => (
            <Tarjeta key={m.etiqueta} {...m} />
          ))}
        </div>
      )}
    </section>
  );
}
