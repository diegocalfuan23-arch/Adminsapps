"use client";

import { useState } from "react";
import { Check, Globe, Lock, Plus, Trash2 } from "lucide-react";
import { Cabecera, CAMPO, ETIQUETA, Interruptor, Plegable } from "@/components/consola/asistente/piezas";
import { MAXIMO_INSTRUCCIONES, MAXIMO_NOMBRE, MAXIMO_REGLA, MAXIMO_REGLAS, REGLAS_FIJAS, TEMAS, TONOS, type Ajustes } from "@/lib/asistente-comun";
import { cn } from "@/lib/utils";

/** La base general: lo que todos los asistentes saben y respetan. */
export function CapaGeneral({ ajustes, onCambiar }: { ajustes: Ajustes; onCambiar: (parte: Partial<Ajustes>) => void }) {
  const [abierto, setAbierto] = useState<"reglas" | "temas" | null>(null);
  const [nueva, setNueva] = useState<string | null>(null);
  const alternar = (v: "reglas" | "temas") => setAbierto(abierto === v ? null : v);
  const activas = REGLAS_FIJAS.length + ajustes.reglas.filter((r) => r.activa).length;

  function agregar() {
    const texto = nueva?.trim();
    if (texto) onCambiar({ reglas: [...ajustes.reglas, { texto, activa: true }] });
    setNueva(null);
  }

  return (
    <div>
      <Cabecera icono={Globe} titulo="Base general" detalle="Lo que todos los asistentes saben y respetan. Los comités no pueden cambiarla." />

      <div className="space-y-5 px-5 py-5 sm:px-8 md:space-y-7 md:py-6">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <label className="block">
            <span className={ETIQUETA}>Nombre</span>
            <input value={ajustes.nombre} maxLength={MAXIMO_NOMBRE} placeholder="Ej.: Gotita" onChange={(e) => onCambiar({ nombre: e.target.value })} className={cn(CAMPO, "mt-2 h-10")} />
          </label>
          <div>
            <span className={ETIQUETA}>Tono</span>
            <div className="mt-2 flex gap-1 rounded-xl bg-[#F3F2F8] p-1">
              {TONOS.map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={ajustes.tono === t}
                  onClick={() => onCambiar({ tono: t })}
                  className={cn("h-8 rounded-lg px-4 text-[12.5px] font-semibold transition", ajustes.tono === t ? "bg-white text-[#16132B] shadow-sm" : "text-[#6E6A86]")}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <span className={ETIQUETA}>Instrucciones</span>
            <span className="text-[11.5px] text-[#A3A0B8] tabular-nums">
              {ajustes.instrucciones.length}/{MAXIMO_INSTRUCCIONES.toLocaleString("es-CL")}
            </span>
          </div>
          <textarea
            value={ajustes.instrucciones}
            maxLength={MAXIMO_INSTRUCCIONES}
            onChange={(e) => onCambiar({ instrucciones: e.target.value })}
            rows={6}
            aria-label="Instrucciones generales"
            className={cn(CAMPO, "mt-2 resize-y py-3 leading-[1.7] max-md:h-36")}
          />
        </div>

        <Plegable titulo="Reglas que nunca rompe" resumen={`${activas} activas`} abierto={abierto === "reglas"} onAbrir={() => alternar("reglas")}>
          <ul className="mt-2 divide-y divide-[#F0EEF8] rounded-2xl ring-1 ring-[#EEEBF6]">
            {REGLAS_FIJAS.map((texto) => (
              <li key={texto} className="flex items-center gap-3 px-4 py-2.5">
                <span className="min-w-0 flex-1 text-[13.5px] sm:truncate">{texto}</span>
                <Lock className="size-3.5 shrink-0 text-[#B4B0C8]" aria-label="Regla fija" />
                <Interruptor on disabled nombre={texto} />
              </li>
            ))}
            {ajustes.reglas.map((r, i) => (
              <li key={`${i}-${r.texto}`} className="flex items-center gap-3 px-4 py-2.5">
                <span className="min-w-0 flex-1 text-[13.5px] break-words">{r.texto}</span>
                <button
                  type="button"
                  aria-label={`Quitar la regla ${r.texto}`}
                  onClick={() => onCambiar({ reglas: ajustes.reglas.filter((_, j) => j !== i) })}
                  className="grid size-7 shrink-0 place-items-center rounded-lg text-[#B4B0C8] hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 className="size-3.5" />
                </button>
                <Interruptor on={r.activa} nombre={r.texto} onChange={() => onCambiar({ reglas: ajustes.reglas.map((x, j) => (j === i ? { ...x, activa: !x.activa } : x)) })} />
              </li>
            ))}
          </ul>
          {nueva !== null ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                agregar();
              }}
              className="mt-2 flex gap-2"
            >
              <input autoFocus value={nueva} maxLength={MAXIMO_REGLA} onChange={(e) => setNueva(e.target.value)} aria-label="Nueva regla" className={cn(CAMPO, "h-9")} />
              <button className="h-9 shrink-0 rounded-xl bg-[#110C2E] px-3.5 text-[12.5px] font-semibold text-white">Agregar</button>
            </form>
          ) : (
            ajustes.reglas.length < MAXIMO_REGLAS && (
              <button type="button" onClick={() => setNueva("")} className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[12.5px] font-semibold text-[#3A0CE3] hover:bg-[#F0ECFF]">
                <Plus className="size-3.5" />
                Agregar regla
              </button>
            )
          )}
        </Plegable>

        <Plegable titulo="Temas que responde" resumen={`${TEMAS.length - ajustes.temasApagados.length} de ${TEMAS.length}`} abierto={abierto === "temas"} onAbrir={() => alternar("temas")}>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {TEMAS.map((t) => {
              const on = !ajustes.temasApagados.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={on}
                  // Se guarda en el orden de la lista, para que volver atrás no cuente como cambio.
                  onClick={() => onCambiar({ temasApagados: TEMAS.filter((x) => (x === t ? on : ajustes.temasApagados.includes(x))) })}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12.5px] font-medium ring-1 transition",
                    on ? "bg-[#16132B] text-white ring-[#16132B]" : "bg-white text-[#8D89A6] ring-[#E7E4F3] hover:text-[#16132B]"
                  )}
                >
                  {on ? <Check className="size-3.5" strokeWidth={2.5} /> : <Plus className="size-3.5" />}
                  {t}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[12px] text-[#A3A0B8]">Lo que no esté activo se deriva a la directiva.</p>
        </Plegable>
      </div>
    </div>
  );
}
