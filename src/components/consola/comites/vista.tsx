"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { CrearComite } from "@/components/crear-comite";
import { corto, GRUPO, GRUPOS, grupoDe, iniciales, nombrePlan, type Grupo } from "@/components/consola/comites/comun";
import { Detalle } from "@/components/consola/comites/detalle";
import { TARJETA } from "@/components/consola/piezas";
import type { ComiteDetalle } from "@/lib/comites-consola";
import { cn } from "@/lib/utils";

const normal = (t: string) => t.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export function ComitesVista({ comites, inicial, urlLogin }: { comites: ComiteDetalle[]; inicial: string; urlLogin: string | null }) {
  const [q, setQ] = useState(inicial);
  const [filtro, setFiltro] = useState<Grupo | null>(null);
  const [elegidoId, setElegidoId] = useState<string | null>(null);
  /** En pantallas chicas el detalle se abre encima de la lista. */
  const [abierto, setAbierto] = useState(false);

  const buscado = normal(q.trim());
  const lista = comites.filter(
    (c) => (!filtro || grupoDe(c) === filtro) && normal([c.nombre, c.correo, c.responsable, c.comuna].filter(Boolean).join(" ")).includes(buscado)
  );
  const elegido = comites.find((c) => c.id === elegidoId) ?? lista[0] ?? comites[0];
  const cuantos = (g: Grupo) => comites.filter((c) => grupoDe(c) === g).length;

  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    window.addEventListener("keydown", alTeclear);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", alTeclear);
      document.body.style.overflow = "";
    };
  }, [abierto]);

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-[28px] font-semibold tracking-[-0.025em] sm:text-[32px]">Comités</h1>
        <CrearComite urlLogin={urlLogin} conTexto />
      </header>

      {/* Cómo está la cartera: cada grupo filtra la lista. */}
      <section aria-label="Actividad de los comités" className="mt-6 rounded-[22px] border border-[#E7E4F3] bg-white p-4 sm:p-5">
        <div className="flex h-2.5 gap-1 overflow-hidden rounded-full bg-[#F0EEF8]">
          {GRUPOS.filter((g) => cuantos(g) > 0).map((g) => (
            <div key={g} className={cn(GRUPO[g].punto, "transition-opacity", filtro && filtro !== g && "opacity-25")} style={{ width: `${(cuantos(g) / comites.length) * 100}%` }} />
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-1 sm:grid-cols-4">
          {GRUPOS.map((g) => (
            <button
              key={g}
              type="button"
              aria-pressed={filtro === g}
              onClick={() => {
                setFiltro(filtro === g ? null : g);
                setElegidoId(null);
              }}
              className={cn("flex items-center gap-2 rounded-xl px-3 py-2 text-left transition", filtro === g ? "bg-[#F3F2F8]" : "hover:bg-[#FAF9FE]")}
            >
              <span aria-hidden className={cn("size-2.5 shrink-0 rounded-full", GRUPO[g].punto)} />
              <span className="min-w-0 flex-1 truncate text-[13px] text-[#5E5A78]">{GRUPO[g].nombre}</span>
              <span className="text-[16px] font-semibold tabular-nums">{cuantos(g)}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Lista y detalle. La única barra de desplazamiento es la de la página: la lista se mueve sin mostrar la suya. */}
      <div className={cn(TARJETA, "mt-4 grid overflow-hidden xl:min-h-[max(560px,calc(100vh-300px))] xl:grid-cols-[360px_minmax(0,1fr)]")}>
        <div className="relative xl:border-r xl:border-[#F0EEF8]">
          <div className="flex flex-col xl:absolute xl:inset-0">
            <div className="border-b border-[#F0EEF8] p-3">
              <label className="relative block">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#A3A0B8]" aria-hidden />
                <input
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setElegidoId(null);
                  }}
                  placeholder="Buscar comité o responsable"
                  aria-label="Buscar comité o responsable"
                  className="h-10 w-full rounded-xl bg-[#F6F5FB] pr-3 pl-9 text-[13.5px] outline-none placeholder:text-[#B4B0C8] focus:bg-white focus:ring-2 focus:ring-[#3A0CE3]/20"
                />
              </label>
              {filtro && (
                <button type="button" onClick={() => setFiltro(null)} className="mt-2 inline-flex items-center gap-1 rounded-lg bg-[#F3F2F8] px-2 py-1 text-[12px] font-semibold text-[#5E5A78]">
                  <span aria-hidden className={cn("size-2 rounded-full", GRUPO[filtro].punto)} />
                  {GRUPO[filtro].nombre}
                  <X className="size-3" aria-label="Quitar filtro" />
                </button>
              )}
            </div>
            <ul className="min-h-0 flex-1 p-2 xl:overflow-y-auto xl:[scrollbar-width:none]">
              {lista.map((c) => {
                const g = GRUPO[grupoDe(c)];
                const activo = c.id === elegido?.id;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      aria-current={activo}
                      onClick={() => {
                        setElegidoId(c.id);
                        setAbierto(true);
                      }}
                      className={cn("flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition", activo ? "xl:bg-[#F1EEFF]" : "hover:bg-[#FAF9FE]")}
                    >
                      <span aria-hidden className="relative grid size-10 shrink-0 place-items-center rounded-xl bg-[#F3F1FB] text-[11.5px] font-bold text-[#4B3FA0]">
                        {iniciales(c.nombre)}
                        <span className={cn("absolute -right-0.5 -bottom-0.5 size-3 rounded-full ring-2 ring-white", g.punto)} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-semibold">{c.nombre}</span>
                        <span className="block truncate text-[12px] text-[#8D89A6]">{[c.comuna, `${c.socios} ${c.socios === 1 ? "socio" : "socios"}`].filter(Boolean).join(" · ")}</span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className={cn("block text-[12px] font-medium", g.texto)}>{corto(c.actividad)}</span>
                        <span className="block text-[11px] text-[#A3A0B8]">{nombrePlan(c)}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
              {lista.length === 0 && <li className="px-4 py-10 text-center text-[13px] text-[#8D89A6]">Sin resultados</li>}
            </ul>
          </div>
        </div>
        <div className="hidden min-w-0 xl:block">{elegido && <Detalle key={elegido.id} comite={elegido} />}</div>
      </div>

      {abierto && elegido && (
        <div role="dialog" aria-modal="true" aria-label={elegido.nombre} className="fixed inset-0 z-50 bg-white xl:hidden">
          <Detalle key={elegido.id} comite={elegido} onCerrar={() => setAbierto(false)} />
        </div>
      )}
    </>
  );
}
