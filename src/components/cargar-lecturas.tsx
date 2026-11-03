"use client";

import { useRef, useState, useTransition } from "react";
import {
  confirmarLecturasComite,
  previsualizarLecturasComite,
  type VistaLecturas,
} from "@/app/(panel)/facilapr/acciones";

const numero = new Intl.NumberFormat("es-CL");

const campo =
  "rounded-lg border border-black/[0.12] bg-transparent px-3 py-2 text-sm disabled:opacity-50 dark:border-white/[0.16]";

/**
 * Sube una planilla de lecturas a un comité, en dos pasos: Facilapr la lee y se
 * muestra qué entendió; recién al confirmar se guarda. Facilapr es quien aplica
 * las reglas (este panel no escribe en su base).
 */
export function CargarLecturas({ comites }: { comites: { id: string; nombre: string }[] }) {
  const formulario = useRef<HTMLFormElement>(null);
  const [aprId, setAprId] = useState("");
  const [vista, setVista] = useState<VistaLecturas | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  const [pendiente, iniciar] = useTransition();

  const validas = vista?.filas.filter((f) => !f.error && f.socioId && f.valor !== null) ?? [];
  const conError = (vista?.filas.length ?? 0) - validas.length;

  function revisar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setExito(null);
    setVista(null);
    const datos = new FormData(e.currentTarget);
    iniciar(async () => {
      const r = await previsualizarLecturasComite(datos);
      if (!r.ok) setError(r.error);
      else setVista(r.vista);
    });
  }

  function confirmar() {
    if (!vista) return;
    setError(null);
    iniciar(async () => {
      const r = await confirmarLecturasComite(
        aprId,
        validas.map((f) => ({ socioId: f.socioId as string, valor: f.valor as number })),
        vista.periodo,
        vista.modo
      );
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setExito(
        vista.modo === "inicial"
          ? `Se cargaron ${r.cargadas} lecturas iniciales.`
          : `Se cargaron ${r.cargadas} lecturas. Quedan por aprobar en el comité.`
      );
      setVista(null);
      formulario.current?.reset();
      setAprId("");
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-black/[0.08] p-4 dark:border-white/[0.12]">
      <form ref={formulario} onSubmit={revisar} className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-[0.8rem] text-black/55 dark:text-white/55">
          Comité
          <select
            name="aprId"
            required
            value={aprId}
            onChange={(e) => {
              setAprId(e.target.value);
              setVista(null);
            }}
            className={campo}
          >
            <option value="">Elige un comité</option>
            {comites.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-[0.8rem] text-black/55 dark:text-white/55">
          Tipo de carga
          <select name="modo" defaultValue="mensual" className={campo}>
            <option value="mensual">Lecturas del mes</option>
            <option value="inicial">Lectura inicial (sin boleta)</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-[0.8rem] text-black/55 dark:text-white/55">
          Período (opcional)
          <input name="periodo" placeholder="2026-10" className={campo} />
        </label>

        <label className="flex flex-col gap-1 text-[0.8rem] text-black/55 dark:text-white/55">
          Archivo CSV o Excel
          <input
            name="archivo"
            type="file"
            required
            accept=".csv,.xlsx"
            className={`${campo} file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium`}
          />
        </label>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={pendiente || !aprId}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {pendiente && !vista ? "Leyendo…" : "Revisar archivo"}
          </button>
        </div>
      </form>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {exito && <p className="text-sm text-emerald-700 dark:text-emerald-400">{exito}</p>}

      {vista && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-black/60 dark:text-white/60">
            Período {vista.periodo} · {validas.length} listas
            {conError > 0 && ` · ${conError} con problemas (no se cargan)`}
          </p>
          {vista.notas.length > 0 && (
            <ul className="list-disc pl-5 text-[0.8rem] text-black/55 dark:text-white/55">
              {vista.notas.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          )}

          <div className="max-h-96 overflow-auto rounded-xl border border-black/[0.08] dark:border-white/[0.12]">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-black/[0.08] text-left font-mono text-[0.7rem] tracking-[0.08em] text-black/45 uppercase dark:border-white/[0.12] dark:text-white/45">
                  <th className="px-3 py-2 font-medium">Planilla</th>
                  <th className="px-3 py-2 font-medium">Arranque</th>
                  <th className="px-3 py-2 text-right font-medium">Lectura</th>
                  {vista.modo === "mensual" && (
                    <>
                      <th className="px-3 py-2 text-right font-medium">Anterior</th>
                      <th className="px-3 py-2 text-right font-medium">m³</th>
                    </>
                  )}
                  <th className="px-3 py-2 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
                {vista.filas.map((f) => (
                  <tr key={f.linea}>
                    <td className="px-3 py-2">{f.referencia}</td>
                    <td className="px-3 py-2">{f.nombre ?? "—"}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums">
                      {f.valor === null ? "—" : numero.format(f.valor)}
                    </td>
                    {vista.modo === "mensual" && (
                      <>
                        <td className="px-3 py-2 text-right font-mono tabular-nums">
                          {f.anterior === null ? "—" : numero.format(f.anterior)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono tabular-nums">
                          {f.consumo === null ? "—" : numero.format(f.consumo)}
                        </td>
                      </>
                    )}
                    <td
                      className={`px-3 py-2 ${
                        f.error ? "text-red-600 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400"
                      }`}
                    >
                      {f.error ?? "Lista"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <button
              type="button"
              onClick={confirmar}
              disabled={pendiente || validas.length === 0}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
            >
              {pendiente ? "Cargando…" : `Cargar ${validas.length} lecturas`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
