"use client";

import { useState, useTransition } from "react";
import { ChevronDown, Globe, Search } from "lucide-react";
import { publicarAsistente } from "@/app/(panel)/facilapr/acciones";
import { CapaComite } from "@/components/consola/asistente/capa-comite";
import { CapaGeneral } from "@/components/consola/asistente/capa-general";
import { CAMPO, ETIQUETA } from "@/components/consola/asistente/piezas";
import { Probar } from "@/components/consola/asistente/probar";
import { TARJETA } from "@/components/consola/piezas";
import type { Ajustes, ComiteAsistente } from "@/lib/asistente-comun";
import { cn } from "@/lib/utils";

const GENERAL = "general";

type Estado = { ajustes: Ajustes; comites: Record<string, string> };

const itemNav = (on: boolean) =>
  cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition", on ? "bg-white shadow-[0_1px_3px_rgba(20,16,50,0.08)] ring-1 ring-[#E7E4F3]" : "hover:bg-white/60");

/** Cuántas cosas cambiaron respecto de lo publicado. */
function contarCambios(a: Estado, b: Estado) {
  const campos = (Object.keys(a.ajustes) as (keyof Ajustes)[]).filter((k) => JSON.stringify(a.ajustes[k]) !== JSON.stringify(b.ajustes[k])).length;
  return campos + Object.keys(a.comites).filter((id) => a.comites[id].trim() !== (b.comites[id] ?? "").trim()).length;
}

export function AsistenteVista({ ajustes, comites, listo }: { ajustes: Ajustes; comites: ComiteAsistente[]; listo: boolean }) {
  const inicial: Estado = { ajustes, comites: Object.fromEntries(comites.map((c) => [c.id, c.instrucciones])) };
  const [publicado, setPublicado] = useState(inicial);
  const [borrador, setBorrador] = useState(inicial);
  const [capa, setCapa] = useState(GENERAL);
  const [prueba, setPrueba] = useState(comites[0]?.id ?? "");
  const [vista, setVista] = useState<"editar" | "probar">("editar");
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciar] = useTransition();

  const cambios = contarCambios(borrador, publicado);
  const elegido = comites.find((c) => c.id === capa);
  const deprueba = comites.find((c) => c.id === prueba) ?? comites[0];
  const lista = comites.filter((c) => c.nombre.toLowerCase().includes(q.trim().toLowerCase()));
  const instrucciones = (id: string) => borrador.comites[id] ?? "";

  function elegir(id: string) {
    setCapa(id);
    if (id !== GENERAL) setPrueba(id);
  }

  function publicar() {
    setError(null);
    const enviado = borrador;
    const cambiados = Object.keys(enviado.comites)
      .filter((id) => enviado.comites[id].trim() !== (publicado.comites[id] ?? "").trim())
      .map((aprId) => ({ aprId, instrucciones: enviado.comites[aprId] }));
    iniciar(async () => {
      const r = await publicarAsistente(enviado.ajustes, cambiados);
      if (r.ok) setPublicado(enviado);
      else setError(r.error);
    });
  }

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-3 sm:items-end sm:gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.025em] sm:text-[32px]">Asistente</h1>
          <p className="text-[14.5px] text-[#8D89A6] max-sm:hidden">Entrena a {borrador.ajustes.nombre.trim() || "tu asistente"}: una base común y lo que agrega cada comité.</p>
        </div>
        <div className="flex items-center gap-3">
          <span role="status" className={cn("inline-flex items-center gap-2 text-[13px] font-medium", cambios ? "text-amber-700" : "text-[#8D89A6]")}>
            <span className={cn("size-2 rounded-full", cambios ? "bg-amber-400" : "bg-emerald-500")} />
            <span className="max-sm:sr-only">{cambios ? `${cambios} cambio${cambios > 1 ? "s" : ""} sin publicar` : "Todo publicado"}</span>
          </span>
          <button
            type="button"
            disabled={!cambios || !listo || pendiente}
            onClick={publicar}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#110C2E] px-5 text-[14px] font-semibold text-white transition hover:bg-[#241D52] disabled:opacity-40"
          >
            {pendiente ? "Publicando…" : "Publicar"}
          </button>
        </div>
      </header>

      {!listo && <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-[13px] text-amber-900">Falta ejecutar el SQL en la base de Facilapr.</p>}
      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {error}
        </p>
      )}

      <div className="mt-5 flex gap-2 md:hidden">
        <div className="relative min-w-0 flex-1">
          <select value={capa} onChange={(e) => elegir(e.target.value)} aria-label="Capa" className="h-11 w-full appearance-none truncate rounded-2xl bg-white pr-9 pl-4 text-[13.5px] font-semibold shadow-[0_1px_2px_rgba(20,16,50,0.05)] ring-1 ring-[#E7E4F3] outline-none">
            <option value={GENERAL}>Base general</option>
            {comites.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-[#8D89A6]" />
        </div>
        <div className="flex shrink-0 gap-1 rounded-2xl bg-white p-1 ring-1 ring-[#E7E4F3]">
          {(["editar", "probar"] as const).map((v) => (
            <button key={v} type="button" aria-pressed={vista === v} onClick={() => setVista(v)} className={cn("h-9 rounded-xl px-3.5 text-[13px] font-semibold transition", vista === v ? "bg-[#110C2E] text-white" : "text-[#6E6A86]")}>
              {v === "editar" ? "Editar" : "Probar"}
            </button>
          ))}
        </div>
      </div>

      <div className={cn(TARJETA, "mt-3 grid grid-cols-1 overflow-hidden md:mt-6 md:grid-cols-[250px_minmax(0,1fr)] xl:h-[calc(100vh-170px)] xl:min-h-[640px] xl:grid-cols-[250px_minmax(0,1fr)_340px] xl:grid-rows-[minmax(0,1fr)]")}>
        {/* Capas */}
        <aside className="hidden min-h-0 flex-col border-r border-[#F0EEF8] bg-[#F8F7FC] md:flex">
          <div className="p-3 pb-2">
            <p className={cn(ETIQUETA, "px-2 pt-1 pb-2")}>Capas del asistente</p>
            <button type="button" onClick={() => elegir(GENERAL)} aria-current={capa === GENERAL} className={itemNav(capa === GENERAL)}>
              <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", capa === GENERAL ? "bg-[#3A0CE3] text-white" : "bg-white text-[#5E5A78] ring-1 ring-[#E7E4F3]")}>
                <Globe className="size-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-semibold">Base general</span>
                <span className="block truncate text-[11.5px] text-[#8D89A6]">Aplica a todos</span>
              </span>
            </button>
          </div>
          <div className="flex min-h-0 flex-1 flex-col px-3">
            <p className={cn(ETIQUETA, "px-2 py-2")}>Comités</p>
            <label className="relative mb-1.5 block">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-[#A3A0B8]" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar" aria-label="Buscar comité" className={cn(CAMPO, "h-9 pl-8 text-[13px]")} />
            </label>
            <div className="relative min-h-0 flex-1 overflow-y-auto pb-2 [scrollbar-width:thin] md:max-xl:max-h-[320px]">
              <div className="relative space-y-0.5">
                <span aria-hidden className="absolute top-1 bottom-3 left-[17px] w-px bg-[#E2DEF2]" />
                {lista.map((c) => {
                  const propio = instrucciones(c.id).trim() !== "";
                  return (
                    <button key={c.id} type="button" onClick={() => elegir(c.id)} aria-current={capa === c.id} className={cn(itemNav(capa === c.id), "relative")}>
                      <span aria-hidden className={cn("ml-3 size-2 shrink-0 rounded-full", propio ? "bg-[#7A5CFF]" : "bg-[#D9D4EE]")} />
                      <span className="min-w-0 flex-1">
                        <span className={cn("block truncate text-[13.5px]", capa === c.id ? "font-semibold text-[#16132B]" : "font-medium text-[#3F3B58]")}>{c.nombre}</span>
                        <span className="block truncate text-[11.5px] text-[#8D89A6]">{propio ? "Personalizado" : "Solo general"}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* Editor */}
        <section className={cn("min-h-0 min-w-0 overflow-y-auto", vista === "probar" && "max-md:hidden")}>
          {elegido ? (
            <CapaComite
              key={elegido.id}
              comite={elegido}
              instrucciones={instrucciones(elegido.id)}
              general={borrador.ajustes.instrucciones}
              onCambiar={(texto) => setBorrador((b) => ({ ...b, comites: { ...b.comites, [elegido.id]: texto } }))}
              onProbar={() => {
                setPrueba(elegido.id);
                setVista("probar");
              }}
            />
          ) : (
            <CapaGeneral ajustes={borrador.ajustes} onCambiar={(parte) => setBorrador((b) => ({ ...b, ajustes: { ...b.ajustes, ...parte } }))} />
          )}
        </section>

        {/* Probar */}
        <aside className={cn("flex min-h-0 min-w-0 flex-col bg-[#FBFAFE] md:col-span-2 md:border-t md:border-[#F0EEF8] xl:col-span-1 xl:border-t-0 xl:border-l", vista === "editar" && "max-md:hidden")}>
          {deprueba ? (
            <Probar key={deprueba.id} comites={comites} comite={deprueba} ajustes={borrador.ajustes} instrucciones={instrucciones(deprueba.id)} onElegir={setPrueba} />
          ) : (
            <p className="m-auto p-8 text-[13px] text-[#8D89A6]">Todavía no hay comités.</p>
          )}
        </aside>
      </div>
    </>
  );
}
