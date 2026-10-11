"use client";

import { useState, useTransition } from "react";
import { cambiarPlanComite } from "@/app/(panel)/facilapr/acciones";

const PLANES = [
  { valor: "BASICO", texto: "Pequeño" },
  { valor: "ESTANDAR", texto: "Estándar" },
  { valor: "PREMIUM", texto: "Grande" },
];

/** El plan de un comité de Facilapr. El cambio lo hace Facilapr, por su API interna. */
export function SelectorPlanComite({
  aprId,
  planActual,
}: {
  aprId: string;
  planActual: string;
}) {
  const [plan, setPlan] = useState(planActual);
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function cambiar(nuevo: string) {
    const anterior = plan;
    setPlan(nuevo);
    setError(null);
    iniciar(async () => {
      const r = await cambiarPlanComite(aprId, nuevo);
      if (!r.ok) {
        setPlan(anterior);
        setError(r.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        value={plan}
        disabled={pendiente}
        onChange={(e) => cambiar(e.target.value)}
        aria-label="Plan del comité"
        className="rounded-lg border border-black/[0.12] bg-transparent px-2 py-1 text-[0.8rem] disabled:opacity-50 dark:border-white/[0.16]"
      >
        {PLANES.map((p) => (
          <option key={p.valor} value={p.valor}>
            {p.texto}
          </option>
        ))}
      </select>
      {error && (
        <span className="max-w-[24ch] text-[0.7rem] text-red-600 dark:text-red-400">
          {error}
        </span>
      )}
    </div>
  );
}
