"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, ExternalLink, Search, Users } from "lucide-react";
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
  boletas: number;
  actividad: string;
};

const ORDEN: EstadoComite[] = ["por-aprobar", "cargando", "al-dia", "sin-lecturas"];
const sinTildes = (t: string) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const iniciales = (nombre: string) =>
  nombre
    .replace(/^(comit[ée]\s+(de\s+)?(agua\s+potable\s+)?(rural\s+)?|apr\s+|ssr\s+)/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
const porcentaje = (c: FilaComite) => (c.socios > 0 ? Math.round((c.leidos / c.socios) * 100) : 0);

function Chip({ estado, chico }: { estado: EstadoComite; chico?: boolean }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-0.5 font-semibold ring-1", chico ? "text-[11.5px]" : "text-[12px]", ESTADO[estado].chip)}>
      <span aria-hidden className={cn("size-1.5 rounded-full", ESTADO[estado].punto)} />
      {ESTADO[estado].texto}
    </span>
  );
}

export function TablaComites({ comites }: { comites: FilaComite[] }) {
  const [q, setQ] = useState("");
  const [filtro, setFiltro] = useState<"todos" | EstadoComite>("todos");
  const lista = comites.filter((c) => (filtro === "todos" || c.estado === filtro) && sinTildes(`${c.nombre} ${c.slug ?? ""} ${c.comuna ?? ""}`).includes(sinTildes(q.trim())));
  const pestanas = [["todos", "Todos", comites.length] as const, ...ORDEN.map((e) => [e, ESTADO[e].texto, comites.filter((c) => c.estado === e).length] as const)];

  return (
    <section className={cn(TARJETA, "min-w-0")}>
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 pb-4">
        <h2 className="text-[15px] font-semibold text-zinc-900">Comités</h2>
        <label className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" aria-hidden />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Buscar comité o comuna"
            placeholder="Buscar comité o comuna"
            className="h-9 w-full rounded-lg border border-zinc-200 bg-white pr-3 pl-9 text-[13.5px] outline-none placeholder:text-zinc-400 focus:border-[#3A0CE3] focus:ring-4 focus:ring-[#3A0CE3]/10"
          />
        </label>
      </header>

      <div className="flex gap-1 overflow-x-auto px-5 pb-3 [scrollbar-width:none]">
        {pestanas.map(([k, t, n]) => (
          <button
            key={k}
            type="button"
            aria-pressed={filtro === k}
            onClick={() => setFiltro(k)}
            className={cn("inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium transition", filtro === k ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100")}
          >
            {t}
            <span className={cn("tabular-nums", filtro === k ? "text-white/60" : "text-zinc-400")}>{n}</span>
          </button>
        ))}
      </div>

      <div className="hidden xl:block">
        <table className="w-full text-[13.5px]">
          <thead>
            <tr className="border-y border-zinc-100 bg-zinc-50/70 text-left text-[11.5px] font-semibold tracking-[0.06em] text-zinc-500 uppercase">
              <th className="py-2.5 pl-5 font-semibold">Comité</th>
              <th className="w-[170px] font-semibold">Estado</th>
              <th className="w-[130px] font-semibold">Lecturas</th>
              <th className="w-[80px] text-right font-semibold">Socios</th>
              <th className="w-[90px] text-right font-semibold">Boletas</th>
              <th className="w-[140px] pl-6 font-semibold">Actividad</th>
              <th className="w-12" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {lista.map((c) => (
              <tr key={c.id} className="group hover:bg-zinc-50/60">
                <td className="py-3 pl-5">
                  <div className="flex items-center gap-3">
                    <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-lg border border-zinc-200 bg-white text-[11.5px] font-semibold text-zinc-600">
                      {iniciales(c.nombre)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-zinc-900">{c.nombre}</p>
                      <p className="truncate text-[12.5px] text-zinc-500">{[c.slug ? `${c.slug}.facilapr.cl` : "Sin dirección", c.comuna].filter(Boolean).join(" · ")}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <Chip estado={c.estado} />
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-100">
                      <div className={cn("h-full rounded-full", ESTADO[c.estado].punto)} style={{ width: `${porcentaje(c)}%` }} />
                    </div>
                    <span className="text-[12px] text-zinc-500 tabular-nums">{porcentaje(c)}%</span>
                  </div>
                </td>
                <td className="text-right text-zinc-700 tabular-nums">{c.socios}</td>
                <td className="text-right text-zinc-700 tabular-nums">{c.boletas}</td>
                <td className="pl-6 text-zinc-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-3.5 text-zinc-400" aria-hidden />
                    {c.actividad}
                  </span>
                </td>
                <td className="pr-3 text-right">
                  {c.portal && (
                    <a
                      href={c.portal}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Abrir el portal de ${c.nombre}`}
                      className="inline-grid size-8 place-items-center rounded-lg text-zinc-400 opacity-0 transition group-hover:opacity-100 hover:bg-zinc-100 hover:text-zinc-700 focus-visible:opacity-100"
                    >
                      <ExternalLink className="size-4" />
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-zinc-100 border-t border-zinc-100 xl:hidden">
        {lista.map((c) => (
          <li key={c.id} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium text-zinc-900">{c.nombre}</p>
              <p className="truncate text-[12.5px] text-zinc-500">{c.slug ? `${c.slug}.facilapr.cl` : (c.comuna ?? "Sin dirección")}</p>
              <p className="mt-1 text-[12px] text-zinc-500">
                <Users className="mr-1 inline size-3.5 -translate-y-px" aria-hidden />
                {c.socios} socios · {c.boletas} boletas
              </p>
            </div>
            <Chip estado={c.estado} chico />
          </li>
        ))}
      </ul>
      {lista.length === 0 && <p className="px-5 py-10 text-center text-[13.5px] text-zinc-500">{comites.length === 0 ? "Todavía no hay comités." : "Ningún comité coincide."}</p>}
      <footer className="flex items-center justify-between border-t border-zinc-100 px-5 py-3 text-[12.5px] text-zinc-500">
        <span>
          {lista.length} de {comites.length} comités
        </span>
        <Link href="/facilapr/comites" className="inline-flex items-center gap-1 font-semibold text-[#3A0CE3]">
          Ver todos
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </footer>
    </section>
  );
}
