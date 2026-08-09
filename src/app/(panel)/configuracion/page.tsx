import { Check, X } from "lucide-react";

/**
 * Estado de configuración: qué variables de entorno están puestas y para qué
 * sirve cada una. La sesión ya la validó el layout del panel.
 */

type Requisito = {
  nombre: string;
  variable: string;
  listo: boolean;
  detalle: string;
};

function revisar(): Requisito[] {
  return [
    {
      nombre: "Base del panel",
      variable: "DATABASE_URL",
      listo: Boolean(process.env.DATABASE_URL),
      detalle: "Guarda el usuario del panel y las notas.",
    },
    {
      nombre: "Base de FacilAgua",
      variable: "DATABASE_URL_FACILAGUA",
      listo: Boolean(process.env.DATABASE_URL_FACILAGUA),
      detalle: "Solo lectura: comités, socios, boletas, consultas.",
    },
    {
      nombre: "Base de mecanicoapp",
      variable: "DATABASE_URL_MECANICOAPP",
      listo: Boolean(process.env.DATABASE_URL_MECANICOAPP),
      detalle: "Solo lectura: talleres, órdenes, pagos.",
    },
    {
      nombre: "Secreto de sesión",
      variable: "BETTER_AUTH_SECRET",
      listo: Boolean(process.env.BETTER_AUTH_SECRET),
      detalle: "Firma las sesiones. Cualquier cadena larga y aleatoria.",
    },
    {
      nombre: "Correo autorizado",
      variable: "CORREO_AUTORIZADO",
      listo: Boolean(process.env.CORREO_AUTORIZADO),
      detalle: "Sin esto nadie puede registrarse, ni siquiera tú.",
    },
  ];
}

export default function ConfiguracionPage() {
  const requisitos = revisar();
  const pendientes = requisitos.filter((r) => !r.listo).length;

  return (
    <div className="w-full max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Configuración</h1>
      <p className="mt-1.5 text-sm text-black/60 dark:text-white/60">
        Variables que necesita el panel para funcionar.
      </p>

      <section className="mt-8">
        <h2 className="font-mono text-[0.72rem] font-semibold tracking-[0.09em] text-black/50 uppercase dark:text-white/50">
          Configuración
        </h2>

        <ul className="mt-4 flex flex-col divide-y divide-black/[0.06] rounded-xl border border-black/[0.08] dark:divide-white/[0.08] dark:border-white/[0.12]">
          {requisitos.map((r) => (
            <li key={r.variable} className="flex items-start gap-3 p-4">
              <span
                className={
                  r.listo
                    ? "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
                    : "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-red-500/12 text-red-600 dark:text-red-400"
                }
              >
                {r.listo ? (
                  <Check className="size-3" />
                ) : (
                  <X className="size-3" />
                )}
              </span>

              <div className="min-w-0">
                <div className="text-sm font-medium">{r.nombre}</div>
                <div className="text-xs text-black/55 dark:text-white/55">
                  {r.detalle}
                </div>
                {!r.listo && (
                  <code className="mt-1.5 inline-block rounded bg-black/[0.05] px-1.5 py-0.5 font-mono text-[0.72rem] dark:bg-white/[0.08]">
                    {r.variable}
                  </code>
                )}
              </div>
            </li>
          ))}
        </ul>

        {pendientes > 0 && (
          <p className="mt-4 text-sm text-black/60 dark:text-white/60">
            Faltan {pendientes} variable{pendientes > 1 ? "s" : ""} en{" "}
            <code className="font-mono text-[0.8rem]">.env.local</code>. Copia{" "}
            <code className="font-mono text-[0.8rem]">.env.example</code> y
            complétalas.
          </p>
        )}
      </section>
    </div>
  );
}
