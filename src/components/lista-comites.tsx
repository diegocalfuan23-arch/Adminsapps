"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Cuenta } from "@/lib/metricas";
import { ListaCuentas } from "@/components/cuentas";
import { CrearComite } from "@/components/crear-comite";

/** Buscador a la izquierda, botón de alta a la derecha y la tabla filtrada debajo. */
export function ListaComites({
  cuentas,
  urlLogin,
}: {
  cuentas: Cuenta[];
  urlLogin: string | null;
}) {
  const [busqueda, setBusqueda] = useState("");

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return cuentas;
    return cuentas.filter((c) =>
      [c.nombre, c.correo ?? "", c.detalle].some((t) =>
        t.toLowerCase().includes(q),
      ),
    );
  }, [cuentas, busqueda]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-black/40 dark:text-white/40" />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar comité o correo"
            aria-label="Buscar comité"
            className="w-full rounded-lg border border-black/[0.12] bg-white py-2 pr-3 pl-9 text-sm outline-none focus:border-black/40 dark:border-white/[0.16] dark:bg-white/[0.04] dark:focus:border-white/50"
          />
        </div>
        <CrearComite urlLogin={urlLogin} />
      </div>

      <div className="bg-white dark:bg-[#111] rounded-xl">
        <ListaCuentas
          cuentas={filtradas}
          vacio={
            busqueda.trim()
              ? "Ningún comité coincide con la búsqueda."
              : "Todavía no hay comités registrados."
          }
        />
      </div>
    </div>
  );
}
