"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import type { EstadoComite } from "@/lib/consola";
import { ESTADO, TARJETA } from "@/components/consola/piezas";
import { cn } from "@/lib/utils";

export type FilaComite = {
  id: string;
  nombre: string;
  comuna: string | null;
  slug: string | null;
  /** El enlace a su portal de socios, si tiene slug. */
  portal: string | null;
  estado: EstadoComite;
  socios: number;
  leidos: number;
};

type Pestana = "accion" | "al-dia" | "todos";
const PESTANAS: [Pestana, string, string][] = [
  ["accion", "Requieren acción", "Por revisar"],
  ["al-dia", "Al día", "Al día"],
  ["todos", "Todos", "Todos"],
];
const POR_PAGINA = 5;

const iniciales = (nombre: string) =>
  nombre
    .replace(/^(comit[ée]\s+(de\s+)?(agua\s+potable\s+)?(rural\s+)?|apr\s+|ssr\s+)/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
const porcentaje = (c: FilaComite) => (c.socios > 0 ? Math.min(100, Math.round((c.leidos / c.socios) * 100)) : 0);

export function TablaComites({ comites, mes }: { comites: FilaComite[]; mes: string }) {
  const filtrar = (p: Pestana) => comites.filter((c) => p === "todos" || (p === "al-dia") === (c.estado === "al-dia"));
  const [pestana, setPestana] = useState<Pestana>(() => (filtrar("accion").length > 0 ? "accion" : "todos"));
  const [pagina, setPagina] = useState(0);
  const lista = filtrar(pestana);
  const ultima = Math.max(0, Math.ceil(lista.length / POR_PAGINA) - 1);
  const actual = Math.min(pagina, ultima);
  const visibles = lista.slice(actual * POR_PAGINA, (actual + 1) * POR_PAGINA);

  return (
    <section className={cn(TARJETA, "overflow-hidden")}>
      <header className="flex flex-wrap items-center justify-between gap-3 px-6 pt-6 sm:px-7">
        <div>
          <h2 className="text-[17px] font-semibold tracking-tight">Comités</h2>
          <p className="text-[13px] text-[#75718F]">Avance de lecturas · {mes}</p>
        </div>
        <div className="flex w-full gap-1 rounded-xl bg-[#F3F2F8] p-1 sm:w-auto">
          {PESTANAS.map(([k, texto, corto]) => (
            <button
              key={k}
              type="button"
              aria-pressed={pestana === k}
              onClick={() => {
                setPestana(k);
                setPagina(0);
              }}
              className={cn(
                "inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-[12.5px] font-semibold whitespace-nowrap transition sm:flex-none",
                pestana === k ? "bg-white text-[#16132B] shadow-sm" : "text-[#6E6A86] hover:text-[#16132B]"
              )}
            >
              <span className="hidden sm:inline">{texto}</span>
              <span className="sm:hidden">{corto}</span>
              <span className={cn("tabular-nums", pestana === k ? "text-[#3A0CE3]" : "text-[#8D89A6]")}>{filtrar(k).length}</span>
            </button>
          ))}
        </div>
      </header>

      <table className="mt-5 w-full table-fixed text-[13.5px]">
        <thead className="hidden md:table-header-group">
          <tr className="border-y border-[#F0EEF8] bg-[#FAF9FE] text-left text-[11px] tracking-[0.07em] text-[#75718F] uppercase">
            <th className="py-2.5 pl-7 font-semibold">Comité</th>
            <th className="hidden w-[150px] font-semibold xl:table-cell">Comuna</th>
            <th className="w-[80px] text-right font-semibold">Socios</th>
            <th className="w-[200px] pr-6 pl-8 font-semibold">Lecturas</th>
            <th className="w-[136px] font-semibold">Estado</th>
            <th className="w-[120px] pr-7">
              <span className="sr-only">Acción</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F0EEF8] border-t border-[#F0EEF8] md:border-t-0">
          {visibles.map((c) => (
            <tr key={c.id} className="transition hover:bg-[#FAF9FE]">
              <td className="py-3 pl-5 sm:pl-7">
                <div className="flex min-w-0 items-center gap-3">
                  <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#F3F1FB] text-[11px] font-bold text-[#4B3FA0]">
                    {iniciales(c.nombre)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{c.nombre}</p>
                    <p className="truncate text-[12px] text-[#75718F]">
                      <span className="md:hidden">{[`${c.leidos}/${c.socios} lecturas`, c.comuna].filter(Boolean).join(" · ")}</span>
                      <span className="hidden md:inline">{c.slug ? `${c.slug}.facilapr.cl` : "Sin dirección"}</span>
                    </p>
                  </div>
                </div>
              </td>
              <td className="hidden truncate pr-3 text-[#5E5A78] xl:table-cell">{c.comuna ?? "—"}</td>
              <td className="hidden text-right text-[#5E5A78] tabular-nums md:table-cell">{c.socios}</td>
              <td className="hidden pr-6 pl-8 md:table-cell">
                <div className="flex items-center gap-2.5">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F0EEF8]">
                    <div className={cn("h-full rounded-full", ESTADO[c.estado].punto)} style={{ width: `${porcentaje(c)}%` }} />
                  </div>
                  <span className="w-10 text-right text-[12.5px] text-[#6B6880] tabular-nums">{porcentaje(c)}%</span>
                </div>
              </td>
              <td className="hidden md:table-cell">
                <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[12px] font-semibold", ESTADO[c.estado].chip)}>
                  <span aria-hidden className={cn("size-1.5 rounded-full", ESTADO[c.estado].punto)} />
                  {ESTADO[c.estado].texto}
                </span>
              </td>
              <td className="w-[120px] pr-5 text-right sm:pr-7">
                {c.estado === "por-aprobar" ? (
                  <Link href="/facilapr/lecturas" className="inline-flex h-8 items-center rounded-lg bg-[#3A0CE3] px-3.5 text-[12.5px] font-semibold text-white hover:bg-[#3209C9]">
                    Revisar
                  </Link>
                ) : (
                  <>
                    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[11.5px] font-semibold md:hidden", ESTADO[c.estado].chip)}>{ESTADO[c.estado].texto}</span>
                    {c.portal && (
                      <a
                        href={c.portal}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Abrir el portal de ${c.nombre}`}
                        className="hidden h-8 items-center gap-1 rounded-lg px-2.5 text-[12.5px] font-semibold text-[#6E6A86] transition hover:bg-[#F0ECFF] hover:text-[#3A0CE3] md:inline-flex"
                      >
                        Abrir
                        <ExternalLink className="size-3.5" aria-hidden />
                      </a>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {lista.length === 0 && <p className="px-6 py-10 text-center text-[13.5px] text-[#75718F]">{comites.length === 0 ? "Todavía no hay comités." : "Ningún comité aquí."}</p>}

      <footer className="flex items-center justify-between gap-3 border-t border-[#F0EEF8] px-5 py-3 text-[12.5px] text-[#75718F] sm:px-7">
        <span className="tabular-nums">{lista.length ? `${actual * POR_PAGINA + 1}–${actual * POR_PAGINA + visibles.length} de ${lista.length}` : "Sin comités"}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={actual === 0}
            onClick={() => setPagina(actual - 1)}
            aria-label="Anterior"
            className="grid size-8 place-items-center rounded-lg ring-1 ring-[#E9E7F5] transition hover:bg-[#F3F2F8] disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            disabled={actual >= ultima}
            onClick={() => setPagina(actual + 1)}
            aria-label="Siguiente"
            className="grid size-8 place-items-center rounded-lg ring-1 ring-[#E9E7F5] transition hover:bg-[#F3F2F8] disabled:opacity-40"
          >
            <ChevronRight className="size-4" />
          </button>
          <Link href="/facilapr/comites" className="ml-2 inline-flex h-8 items-center gap-1 rounded-lg px-2.5 font-semibold text-[#3A0CE3] hover:bg-[#F0ECFF]">
            Ver todos
            <ChevronRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </footer>
    </section>
  );
}
