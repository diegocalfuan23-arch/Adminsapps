"use client";

import { Bot, Building2, ChevronDown, Lock, RotateCcw, Sparkles } from "lucide-react";
import { Cabecera, ETIQUETA } from "@/components/consola/asistente/piezas";
import { MAXIMO_INSTRUCCIONES_COMITE, type ComiteAsistente } from "@/lib/asistente-comun";

export type EstadoInstrucciones = "personalizado" | "revisar" | "general";

/** Lo que un comité agrega sobre la base general. */
export function CapaComite({
  comite,
  estado,
  instrucciones,
  general,
  ocupado,
  onCambiar,
  onProbar,
  onRevisar,
}: {
  comite: ComiteAsistente;
  estado: EstadoInstrucciones;
  instrucciones: string;
  general: string;
  ocupado: boolean;
  onCambiar: (texto: string) => void;
  onProbar: () => void;
  onRevisar: (decision: "aprobar" | "cambios") => void;
}) {
  const datos: [string, string | null][] = [
    ["Horario", comite.horario],
    ["Teléfono", comite.telefono],
    ["Vencimiento", `${comite.diasVencimiento} días`],
    ["Cortes", `${comite.diasGracia} días de atraso`],
  ];
  const detalle =
    estado === "general" ? "Sin instrucciones propias" : comite.editado ? `${comite.autor} · ${comite.editado}` : "Con instrucciones propias";

  return (
    <div>
      <Cabecera icono={Building2} titulo={comite.nombre} detalle={detalle}>
        <button type="button" onClick={onProbar} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#F3F2F8] px-3 text-[12.5px] font-semibold hover:bg-[#EAE6FF]">
          <Bot className="size-4" />
          Probar
        </button>
      </Cabecera>

      {estado === "revisar" && (
        <div className="mx-6 mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 sm:mx-8">
          <Sparkles className="size-4 shrink-0 text-amber-600" aria-hidden />
          <p className="min-w-0 flex-1 text-[13px] text-amber-900">Cambios por revisar</p>
          <div className="flex gap-1.5">
            <button type="button" disabled={ocupado} onClick={() => onRevisar("aprobar")} className="h-8 rounded-lg bg-[#110C2E] px-3 text-[12.5px] font-semibold text-white disabled:opacity-50">
              Aprobar
            </button>
            <button type="button" disabled={ocupado} onClick={() => onRevisar("cambios")} className="h-8 rounded-lg bg-white px-3 text-[12.5px] font-semibold text-[#5E5A78] ring-1 ring-amber-200 disabled:opacity-50">
              Pedir cambios
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6 px-6 py-6 sm:px-8">
        <details className="group rounded-2xl bg-[#F8F7FC] ring-1 ring-[#EEEBF6]">
          <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-[13px] font-semibold text-[#5E5A78]">
            <Lock className="size-3.5" />
            Hereda la base general
            <ChevronDown className="ml-auto size-4 transition group-open:rotate-180" />
          </summary>
          <p className="border-t border-[#EEEBF6] px-4 py-3 text-[12.5px] leading-relaxed break-words whitespace-pre-line text-[#8D89A6]">{general}</p>
        </details>

        <div>
          <div className="flex items-baseline justify-between">
            <span className={ETIQUETA}>Instrucciones del comité</span>
            {estado !== "general" && (
              <button type="button" onClick={() => onCambiar("")} className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#8D89A6] hover:text-[#16132B]">
                <RotateCcw className="size-3" />
                Quitar
              </button>
            )}
          </div>
          <div className="mt-2 rounded-2xl border-l-[3px] border-[#7A5CFF] bg-white ring-1 ring-[#EEEBF6] focus-within:ring-[#7A5CFF]">
            <textarea
              value={instrucciones}
              maxLength={MAXIMO_INSTRUCCIONES_COMITE}
              onChange={(e) => onCambiar(e.target.value)}
              aria-label={`Instrucciones de ${comite.nombre}`}
              placeholder="Sin instrucciones propias."
              className="block field-sizing-content min-h-36 w-full resize-none rounded-2xl bg-transparent px-4 py-3 text-[13.5px] leading-[1.7] outline-none placeholder:text-[#B4B0C8]"
            />
          </div>
        </div>

        <div>
          <span className={ETIQUETA}>Datos</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {datos.map(
              ([k, v]) =>
                v && (
                  <span key={k} className="inline-flex items-center gap-1.5 rounded-lg bg-[#F3F2F8] px-2.5 py-1.5 text-[12.5px]">
                    <span className="text-[#8D89A6]">{k}</span>
                    <span className="font-semibold">{v}</span>
                  </span>
                )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
