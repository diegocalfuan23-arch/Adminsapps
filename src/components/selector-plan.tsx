"use client";

import { useState, useTransition } from "react";
import { cambiarPlan } from "@/app/(panel)/mecanicoapp/acciones";

const PLANES = [
  { valor: "prueba", texto: "Prueba" },
  { valor: "taller", texto: "Taller" },
  { valor: "serviteca", texto: "Serviteca" },
  { valor: "empresarial", texto: "Empresarial" },
];

export function SelectorPlan({
  userId,
  planActual,
}: {
  userId: string;
  planActual: string;
}) {
  const [plan, setPlan] = useState(planActual);
  const [pendiente, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function cambiar(nuevo: string) {
    const anterior = plan;
    setPlan(nuevo);
    setError(null);
    startTransition(async () => {
      const res = await cambiarPlan(userId, nuevo);
      if (res?.error) {
        setPlan(anterior);
        setError(res.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        value={plan}
        disabled={pendiente}
        onChange={(e) => cambiar(e.target.value)}
        className="rounded-lg border border-black/[0.12] bg-transparent px-2 py-1 text-[0.8rem] disabled:opacity-50 dark:border-white/[0.16]"
      >
        {PLANES.map((p) => (
          <option key={p.valor} value={p.valor}>
            {p.texto}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-[0.7rem] text-red-600 dark:text-red-400">
          {error}
        </span>
      )}
    </div>
  );
}
