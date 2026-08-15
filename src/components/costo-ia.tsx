import type { CostoIaProducto } from "@/lib/metricas";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

export function CostoIa({ datos }: { datos: CostoIaProducto }) {
  return (
    <section>
      <h2 className="font-mono text-[0.72rem] font-semibold tracking-[0.09em] text-black/50 uppercase dark:text-white/50">
        Costo de IA — {datos.producto} (últimos 30 días)
      </h2>

      {datos.error ? (
        <p className="mt-3 rounded-xl border border-red-500/25 bg-red-500/[0.06] p-4 text-sm text-red-600 dark:text-red-400">
          No se pudo leer el uso de IA: {datos.error}
        </p>
      ) : (
        <div className="mt-3 grid gap-4 lg:grid-cols-[auto_1fr_1fr]">
          <div className="rounded-xl border border-black/[0.08] p-4 dark:border-white/[0.12]">
            <div className="text-[0.8rem] text-black/55 dark:text-white/55">
              Total estimado
            </div>
            <div className="mt-1.5 font-mono text-2xl font-semibold tabular-nums">
              {datos.totalUsd === null ? "—" : usd.format(datos.totalUsd)}
            </div>
            <div className="mt-1 text-[0.78rem] text-black/45 dark:text-white/45">
              {datos.llamadas ?? 0} llamada{datos.llamadas === 1 ? "" : "s"}
            </div>
          </div>

          <div className="rounded-xl border border-black/[0.08] p-4 dark:border-white/[0.12]">
            <div className="text-[0.8rem] text-black/55 dark:text-white/55">
              Por origen
            </div>
            {datos.porOrigen.length === 0 ? (
              <p className="mt-2 text-[0.85rem] text-black/40 dark:text-white/40">
                Sin llamadas registradas.
              </p>
            ) : (
              <ul className="mt-2 flex flex-col gap-1.5">
                {datos.porOrigen.map((o) => (
                  <li
                    key={o.origen}
                    className="flex items-baseline justify-between gap-3 text-[0.85rem]"
                  >
                    <span className="truncate text-black/70 dark:text-white/70">
                      {o.origen}
                    </span>
                    <span className="shrink-0 font-mono tabular-nums">
                      {usd.format(o.usd)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-black/[0.08] p-4 dark:border-white/[0.12]">
            <div className="text-[0.8rem] text-black/55 dark:text-white/55">
              Por comité (top 10)
            </div>
            {datos.porComite.length === 0 ? (
              <p className="mt-2 text-[0.85rem] text-black/40 dark:text-white/40">
                Sin llamadas registradas.
              </p>
            ) : (
              <ul className="mt-2 flex flex-col gap-1.5">
                {datos.porComite.map((c) => (
                  <li
                    key={c.aprId ?? "sin-comite"}
                    className="flex items-baseline justify-between gap-3 text-[0.85rem]"
                  >
                    <span className="truncate text-black/70 dark:text-white/70">
                      {c.nombre}
                    </span>
                    <span className="shrink-0 font-mono tabular-nums">
                      {usd.format(c.usd)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
