import type { Cuenta } from "@/lib/metricas";
import { SelectorPlan } from "@/components/selector-plan";
import { SelectorPlanComite } from "@/components/selector-plan-comite";

const FECHA = new Intl.DateTimeFormat("es-CL", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "America/Santiago",
});

/** La hora en Chile: sirve para saber cuándo se registró alguien, además del día. */
const HORA = new Intl.DateTimeFormat("es-CL", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Santiago",
});

/** Cuántos días faltan para una fecha futura (0 si ya pasó). */
function diasHasta(fecha: Date) {
  return Math.max(0, Math.ceil((fecha.getTime() - Date.now()) / 86_400_000));
}

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

/** Si el comité está en su prueba gratuita, cuántos días le quedan. */
function InsigniaPrueba({ hasta }: { hasta: Date | null }) {
  const dias = hasta ? diasHasta(hasta) : 0;
  if (dias <= 0) return null;
  return (
    <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[0.7rem] font-medium text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
      Prueba · {dias} {dias === 1 ? "día" : "días"}
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

  // La columna "Plan" solo aparece si al menos una cuenta lo trae —
  // hoy solo mecanicoapp lo tiene, FacilAgua no debe mostrar la
  // columna ni el selector.
  const conPlan = cuentas.some(
    (c) => c.plan !== undefined || c.planComite !== undefined
  );
  // La columna "Responsable" también es solo de Facilapr: quién se registró y cómo contactarlo.
  const conResponsable = cuentas.some((c) => c.responsable !== undefined);
  const columnas = [
    "Nombre",
    ...(conResponsable ? ["Responsable"] : []),
    "Correo",
    "Registrado",
    "Última actividad",
    "Detalle",
    ...(conPlan ? ["Plan"] : []),
  ];

  return (
    <div className="overflow-x-auto rounded-xl border border-black/[0.08] dark:border-white/[0.12]">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-black/[0.08] text-left dark:border-white/[0.12]">
            {columnas.map((c) => (
              <th
                key={c}
                className="px-4 py-3 text-[0.72rem] font-semibold tracking-[0.06em] text-black/50 uppercase dark:text-white/50"
              >
                {c}
              </th>
            ))}
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
              {conResponsable && (
                <td className="px-4 py-3 whitespace-nowrap text-black/55 dark:text-white/55">
                  {c.responsable ?? (
                    <span className="text-black/30 dark:text-white/30">—</span>
                  )}
                  {c.telefono && <span className="block text-[0.75rem] tabular-nums">{c.telefono}</span>}
                </td>
              )}
              <td className="px-4 py-3 whitespace-nowrap text-black/55 dark:text-white/55">
                {c.correo ?? (
                  <span className="text-black/30 dark:text-white/30">—</span>
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap tabular-nums text-black/55 dark:text-white/55">
                {FECHA.format(c.registrada)}
                <span className="block text-[0.75rem]">{HORA.format(c.registrada)}</span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <Actividad ultima={c.ultimaActividad} />
              </td>
              <td className="px-4 py-3 text-black/55 dark:text-white/55">
                {c.detalle}
              </td>
              {conPlan && (
                <td className="px-4 py-3 whitespace-nowrap">
                  {c.planComite !== undefined ? (
                    <>
                      <SelectorPlanComite aprId={c.id} planActual={c.planComite} />
                      <InsigniaPrueba hasta={c.pruebaHasta ?? null} />
                    </>
                  ) : (
                    c.plan !== undefined && (
                      <SelectorPlan userId={c.id} planActual={c.plan} />
                    )
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
