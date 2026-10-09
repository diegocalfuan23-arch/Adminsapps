import { lecturasPorComite } from "@/lib/metricas";

export const dynamic = "force-dynamic";

const numero = new Intl.NumberFormat("es-CL");

function hace(fecha: Date | null) {
  if (!fecha) return "—";
  const dias = Math.floor((Date.now() - fecha.getTime()) / 86_400_000);
  if (dias <= 0) return "hoy";
  if (dias === 1) return "ayer";
  return `hace ${dias} días`;
}

export default async function LecturasPage() {
  const comites = await lecturasPorComite();

  const total = comites.reduce((s, c) => s + c.total, 0);
  const pendientes = comites.reduce((s, c) => s + c.pendientes, 0);
  const ultimos30 = comites.reduce((s, c) => s + c.ultimos30, 0);
  const activos = comites.filter((c) => c.ultimos30 > 0).length;

  const tarjetas = [
    { etiqueta: "Lecturas en total", valor: total },
    { etiqueta: "Por aprobar", valor: pendientes, alerta: pendientes > 0 },
    { etiqueta: "Últimos 30 días", valor: ultimos30 },
    { etiqueta: "Comités con lecturas recientes", valor: activos },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Lecturas</h1>
        <p className="mt-1 text-sm text-black/55 dark:text-white/55">
          Qué comités están tomando lecturas, y cuáles esperan que se las aprueben.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tarjetas.map((t) => (
          <div
            key={t.etiqueta}
            className="rounded-xl border border-black/[0.08] p-4 dark:border-white/[0.12]"
          >
            <div className="text-[0.8rem] text-black/55 dark:text-white/55">{t.etiqueta}</div>
            <div
              className={`mt-1.5 font-mono text-2xl font-semibold tabular-nums ${
                t.alerta ? "text-amber-700 dark:text-amber-400" : ""
              }`}
            >
              {numero.format(t.valor)}
            </div>
          </div>
        ))}
      </div>

      <section>
        <h2 className="font-mono text-[0.72rem] font-semibold tracking-[0.09em] text-black/50 uppercase dark:text-white/50">
          Por comité
        </h2>
        {comites.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-black/[0.12] p-6 text-center text-sm text-black/40 dark:border-white/[0.15] dark:text-white/40">
            Todavía no hay comités.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-xl border border-black/[0.08] dark:border-white/[0.12]">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-black/[0.08] text-left font-mono text-[0.7rem] tracking-[0.08em] text-black/45 uppercase dark:border-white/[0.12] dark:text-white/45">
                  <th className="px-4 py-3 font-medium">Comité</th>
                  <th className="px-4 py-3 text-right font-medium">Por aprobar</th>
                  <th className="px-4 py-3 text-right font-medium">Últimos 30 días</th>
                  <th className="px-4 py-3 text-right font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Última lectura</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
                {comites.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 font-medium">{c.nombre}</td>
                    <td
                      className={`px-4 py-3 text-right font-mono tabular-nums ${
                        c.pendientes > 0 ? "font-semibold text-amber-700 dark:text-amber-400" : "text-black/40 dark:text-white/40"
                      }`}
                    >
                      {numero.format(c.pendientes)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">{numero.format(c.ultimos30)}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">{numero.format(c.total)}</td>
                    <td className="px-4 py-3 text-black/60 dark:text-white/60">{hace(c.ultima)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
