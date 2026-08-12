import type { Cuenta } from "@/lib/metricas";

const FECHA = new Intl.DateTimeFormat("es-CL", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

/** Cuántos días pasaron desde la última señal de vida. */
function diasDesde(fecha: Date) {
  return Math.floor((Date.now() - fecha.getTime()) / 86_400_000);
}

function Actividad({ ultima }: { ultima: Date | null }) {
  if (!ultima) {
    return (
      <span className="text-black/35 dark:text-white/35">
        Nunca usó la app
      </span>
    );
  }

  const dias = diasDesde(ultima);
  const texto =
    dias === 0 ? "hoy" : dias === 1 ? "ayer" : `hace ${dias} días`;

  // Más de dos semanas sin tocar nada es una cuenta abandonada, y eso
  // importa más que la fecha exacta.
  const dormida = dias > 14;

  return (
    <span
      className={
        dormida
          ? "text-amber-700 dark:text-amber-400"
          : "text-black/55 dark:text-white/55"
      }
    >
      {texto}
    </span>
  );
}

/**
 * Quién se registró, cuándo, y si sigue usando el producto. Los conteos
 * totales no distinguen entre diez cuentas activas y diez abandonadas.
 */
export function ListaCuentas({
  cuentas,
  vacio,
}: {
  cuentas: Cuenta[];
  vacio: string;
}) {
  if (cuentas.length === 0) {
    return (
      <p className="rounded-xl border border-black/[0.08] p-4 text-sm text-black/45 dark:border-white/[0.12] dark:text-white/45">
        {vacio}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-black/[0.08] dark:border-white/[0.12]">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-black/[0.08] text-left dark:border-white/[0.12]">
            {["Nombre", "Registrado", "Última actividad", "Detalle"].map(
              (c) => (
                <th
                  key={c}
                  className="px-4 py-3 text-[0.72rem] font-semibold tracking-[0.06em] text-black/50 uppercase dark:text-white/50"
                >
                  {c}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {cuentas.map((c) => (
            <tr
              key={c.id}
              className="border-b border-black/[0.06] last:border-0 dark:border-white/[0.08]"
            >
              <td className="px-4 py-3 font-medium whitespace-nowrap">
                {c.nombre}
                {!c.activo && (
                  <span className="ml-2 rounded-full bg-black/[0.06] px-2 py-0.5 text-[0.7rem] font-normal text-black/50 dark:bg-white/[0.08] dark:text-white/50">
                    inactivo
                  </span>
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap tabular-nums text-black/55 dark:text-white/55">
                {FECHA.format(c.registrada)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <Actividad ultima={c.ultimaActividad} />
              </td>
              <td className="px-4 py-3 text-black/55 dark:text-white/55">
                {c.detalle}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
