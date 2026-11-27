"use client";

import { useRef, useState, useTransition } from "react";
import { BookOpen, Check, ChevronDown, Globe, Search, type LucideIcon } from "lucide-react";
import { publicarAsistente, revisarInstrucciones } from "@/app/(panel)/facilapr/acciones";
import { CapaComite, type EstadoInstrucciones } from "@/components/consola/asistente/capa-comite";
import { CapaConocimiento } from "@/components/consola/asistente/capa-conocimiento";
import { CapaGeneral } from "@/components/consola/asistente/capa-general";
import { CAMPO, ETIQUETA } from "@/components/consola/asistente/piezas";
import { Probar } from "@/components/consola/asistente/probar";
import { TARJETA } from "@/components/consola/piezas";
import { AJUSTES_INICIALES, type Ajustes, type ComiteAsistente, type Documento } from "@/lib/asistente-comun";
import { cn } from "@/lib/utils";

const GENERAL = "general";
const CONOCIMIENTO = "conocimiento";

const PUNTO: Record<EstadoInstrucciones, string> = { personalizado: "bg-[#7A5CFF]", revisar: "bg-amber-400", general: "bg-[#D9D4EE]" };
const ETIQUETA_ESTADO: Record<EstadoInstrucciones, string> = { personalizado: "Personalizado", revisar: "Por revisar", general: "Solo general" };

/** Una entrada de la columna de capas: con ícono, o con el punto de estado de un comité. */
function Entrada({ activa, onClick, icono: Icono, titulo, detalle, punto }: { activa: boolean; onClick: () => void; icono?: LucideIcon; titulo: string; detalle: string; punto?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={activa}
      className={cn("flex w-full shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left transition", activa ? "bg-white shadow-[0_1px_3px_rgba(20,16,50,0.08)] ring-1 ring-[#E7E4F3]" : "hover:bg-white/60")}
    >
      {Icono ? (
        <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", activa ? "bg-[#3A0CE3] text-white" : "bg-white text-[#5E5A78] ring-1 ring-[#E7E4F3]")}>
          <Icono className="size-4" aria-hidden />
        </span>
      ) : (
        <span aria-hidden className={cn("ml-3 size-2 shrink-0 rounded-full", punto)} />
      )}
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate text-[13.5px]", activa ? "font-semibold text-[#16132B]" : "font-medium text-[#3F3B58]")}>{titulo}</span>
        <span className="block truncate text-[11.5px] text-[#8D89A6]">{detalle}</span>
      </span>
    </button>
  );
}

export function AsistenteVista({ publicados, comites, documentos }: { publicados: Ajustes | null; comites: ComiteAsistente[]; documentos: Documento[] }) {
  const [ajustes, setAjustes] = useState(publicados ?? AJUSTES_INICIALES);
  /** Solo lo que se ha tocado de cada comité y aún no se publica. */
  const [escrito, setEscrito] = useState<Record<string, string>>({});
  const [capa, setCapa] = useState(GENERAL);
  const [prueba, setPrueba] = useState({ id: comites[0]?.id ?? "", vez: 0 });
  const [vista, setVista] = useState<"editar" | "probar">("editar");
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [pendiente, iniciar] = useTransition();
  const reloj = useRef<ReturnType<typeof setTimeout>>(undefined);

  function aviso(texto: string) {
    clearTimeout(reloj.current);
    setToast(texto);
    reloj.current = setTimeout(() => setToast(""), 2200);
  }

  const guardado = (c: ComiteAsistente) => c.propuesta ?? c.aprobadas;
  const instrucciones = (c: ComiteAsistente) => escrito[c.id] ?? guardado(c);
  const estado = (c: ComiteAsistente): EstadoInstrucciones => (c.propuesta !== null ? "revisar" : instrucciones(c).trim() ? "personalizado" : "general");

  const cambiados = comites.filter((c) => instrucciones(c).trim() !== guardado(c).trim());
  const camposCambiados = publicados
    ? (Object.keys(ajustes) as (keyof Ajustes)[]).filter((k) => JSON.stringify(ajustes[k]) !== JSON.stringify(publicados[k])).length
    : 1;
  const cambios = camposCambiados + cambiados.length;
  const porRevisar = comites.filter((c) => c.propuesta !== null).length;

  const elegido = comites.find((c) => c.id === capa);
  const dePrueba = comites.find((c) => c.id === prueba.id) ?? comites[0];
  const lista = comites.filter((c) => c.nombre.toLowerCase().includes(q.trim().toLowerCase()));

  function elegir(id: string) {
    setCapa(id);
    if (id !== GENERAL && id !== CONOCIMIENTO && id !== prueba.id) setPrueba({ id, vez: 0 });
  }

  /** Lo escrito deja de ser un cambio, salvo que se haya seguido escribiendo mientras se guardaba. */
  const soltar = (enviados: Record<string, string>) =>
    setEscrito((e) => Object.fromEntries(Object.entries(e).filter(([id, texto]) => enviados[id] !== texto)));

  function publicar() {
    setError(null);
    const limpios: Ajustes = { ...ajustes, nombre: ajustes.nombre.trim(), instrucciones: ajustes.instrucciones.trim() };
    const enviados = Object.fromEntries(cambiados.map((c) => [c.id, instrucciones(c)]));
    iniciar(async () => {
      const r = await publicarAsistente(
        limpios,
        Object.entries(enviados).map(([aprId, texto]) => ({ aprId, instrucciones: texto }))
      );
      if (!r.ok) return setError(r.error);
      setAjustes((a) => (a === ajustes ? limpios : a));
      soltar(enviados);
      aviso("Asistente publicado en todos los comités");
    });
  }

  function revisar(c: ComiteAsistente, decision: "aprobar" | "cambios") {
    if (c.propuesta === null) return;
    const propuesta = c.propuesta;
    const texto = instrucciones(c);
    setError(null);
    iniciar(async () => {
      const r = await revisarInstrucciones({ aprId: c.id, decision, propuesta, texto: texto.trim() !== propuesta.trim() ? texto : undefined });
      if (!r.ok) return setError(r.error);
      soltar({ [c.id]: texto });
      aviso(decision === "aprobar" ? "Instrucciones aprobadas" : "Se pidió corrección a la directiva");
    });
  }

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-3 sm:items-end sm:gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.025em] sm:text-[32px]">Asistente</h1>
          <p className="text-[14.5px] text-[#8D89A6] max-sm:hidden">Entrena a {ajustes.nombre.trim() || "tu asistente"}: una base común y lo que agrega cada comité.</p>
        </div>
        <div className="flex items-center gap-3">
          <span role="status" className={cn("inline-flex items-center gap-2 text-[13px] font-medium", cambios ? "text-amber-700" : "text-[#8D89A6]")}>
            <span className={cn("size-2 rounded-full", cambios ? "bg-amber-400" : "bg-emerald-500")} />
            <span className="max-sm:sr-only">{cambios ? `${cambios} cambio${cambios > 1 ? "s" : ""} sin publicar` : "Todo publicado"}</span>
          </span>
          <button
            type="button"
            disabled={!cambios || pendiente}
            onClick={publicar}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#110C2E] px-5 text-[14px] font-semibold text-white transition hover:bg-[#241D52] disabled:opacity-40"
          >
            Publicar
          </button>
        </div>
      </header>

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
                {c.propuesta !== null ? " · por revisar" : ""}
              </option>
            ))}
            <option value={CONOCIMIENTO}>Conocimiento</option>
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
            <Entrada activa={capa === GENERAL} onClick={() => elegir(GENERAL)} icono={Globe} titulo="Base general" detalle="Aplica a todos" />
          </div>
          <div className="flex min-h-0 flex-1 flex-col px-3">
            <div className="flex items-center justify-between px-2 pt-2 pb-2">
              <p className={ETIQUETA}>Comités</p>
              {porRevisar > 0 && <span className="text-[11.5px] font-semibold text-amber-700">{porRevisar} por revisar</span>}
            </div>
            <label className="relative mb-1.5 block">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-[#A3A0B8]" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar" aria-label="Buscar comité" className={cn(CAMPO, "h-9 pl-8 text-[13px]")} />
            </label>
            <div className="relative min-h-0 flex-1 overflow-y-auto pb-2 [scrollbar-width:thin] md:max-xl:max-h-[320px]">
              <div className="relative">
                <span aria-hidden className="absolute top-1 bottom-1 left-[17px] w-px bg-[#E2DEF2]" />
                <div className="relative space-y-0.5">
                  {lista.map((c) => (
                    <Entrada key={c.id} activa={capa === c.id} onClick={() => elegir(c.id)} titulo={c.nombre} detalle={ETIQUETA_ESTADO[estado(c)]} punto={PUNTO[estado(c)]} />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-[#EEEBF6] p-3">
            <Entrada
              activa={capa === CONOCIMIENTO}
              onClick={() => elegir(CONOCIMIENTO)}
              icono={BookOpen}
              titulo="Conocimiento"
              detalle={`${documentos.length} ${documentos.length === 1 ? "documento" : "documentos"}`}
            />
          </div>
        </aside>

        {/* Editor */}
        <section className={cn("min-h-0 min-w-0 overflow-y-auto", vista === "probar" && "max-md:hidden")}>
          {capa === CONOCIMIENTO ? (
            <CapaConocimiento documentos={documentos} comites={comites} aviso={aviso} />
          ) : elegido ? (
            <CapaComite
              key={elegido.id}
              comite={elegido}
              estado={estado(elegido)}
              instrucciones={instrucciones(elegido)}
              general={ajustes.instrucciones}
              ocupado={pendiente}
              onCambiar={(texto) => setEscrito((e) => ({ ...e, [elegido.id]: texto }))}
              onProbar={() => {
                setPrueba((p) => ({ id: elegido.id, vez: p.vez + 1 }));
                setVista("probar");
              }}
              onRevisar={(decision) => revisar(elegido, decision)}
            />
          ) : (
            <CapaGeneral ajustes={ajustes} onCambiar={(parte) => setAjustes((a) => ({ ...a, ...parte }))} />
          )}
        </section>

        {/* Probar */}
        <aside className={cn("flex min-h-0 min-w-0 flex-col bg-[#FBFAFE] md:col-span-2 md:border-t md:border-[#F0EEF8] xl:col-span-1 xl:border-t-0 xl:border-l", vista === "editar" && "max-md:hidden")}>
          {dePrueba ? (
            <Probar
              key={`${dePrueba.id}-${prueba.vez}`}
              comites={comites}
              comite={dePrueba}
              ajustes={ajustes}
              instrucciones={instrucciones(dePrueba)}
              onElegir={(id) => setPrueba({ id, vez: 0 })}
            />
          ) : (
            <p className="m-auto p-8 text-[13px] text-[#8D89A6]">Todavía no hay comités.</p>
          )}
        </aside>
      </div>

      {toast && (
        <div role="status" className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-2xl bg-[#110C2E] px-4 py-3 text-[13.5px] font-medium text-white shadow-2xl">
          <span className="grid size-5 place-items-center rounded-full bg-[#8F7BFF] text-[#110C2E]">
            <Check className="size-3" strokeWidth={3} />
          </span>
          {toast}
        </div>
      )}
    </>
  );
}
