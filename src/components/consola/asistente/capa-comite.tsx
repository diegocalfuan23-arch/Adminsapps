"use client";

import { Bot, Building2, ChevronDown, Lock, RotateCcw } from "lucide-react";
import { Cabecera, ETIQUETA } from "@/components/consola/asistente/piezas";
import { MAXIMO_INSTRUCCIONES_COMITE, type ComiteAsistente } from "@/lib/asistente-comun";

/** Lo que un comité agrega sobre la base general. */
export function CapaComite({
  comite,
  instrucciones,
  general,
  onCambiar,
  onProbar,
}: {
  comite: ComiteAsistente;
  instrucciones: string;
  general: string;
  onCambiar: (texto: string) => void;
  onProbar: () => void;
}) {
  const datos: [string, string | null][] = [
    ["Horario", comite.horario],
    ["Teléfono", comite.telefono],
    ["Vencimiento", `${comite.diasVencimiento} días desde la emisión`],
    ["Cortes", `Con más de ${comite.diasGracia} días de atraso`],
  ];

  return (
    <div>
      <Cabecera icono={Building2} titulo={comite.nombre} detalle={instrucciones.trim() ? "Con instrucciones propias" : "Solo usa la base general"}>
        <button type="button" onClick={onProbar} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#F3F2F8] px-3 text-[12.5px] font-semibold hover:bg-[#EAE6FF]">
          <Bot className="size-4" />
          Probar
        </button>
      </Cabecera>

      <div className="space-y-6 px-6 py-6 sm:px-8">
        <details className="group rounded-2xl bg-[#F8F7FC] ring-1 ring-[#EEEBF6]">
          <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-[13px] font-semibold text-[#5E5A78]">
            <Lock className="size-3.5" />
            Hereda la base general
            <ChevronDown className="ml-auto size-4 transition group-open:rotate-180" />
          </summary>
          <p className="border-t border-[#EEEBF6] px-4 py-3 text-[12.5px] leading-relaxed break-words whitespace-pre-line text-[#8D89A6]">
            {general.trim() || "Sin instrucciones generales."}
          </p>
        </details>

        <div>
          <div className="flex items-baseline justify-between gap-3">
            <span className={ETIQUETA}>Lo que agrega el comité</span>
            <span className="ml-auto text-[11.5px] text-[#A3A0B8] tabular-nums">
              {instrucciones.length}/{MAXIMO_INSTRUCCIONES_COMITE.toLocaleString("es-CL")}
            </span>
            {instrucciones && (
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
              rows={5}
              aria-label={`Instrucciones de ${comite.nombre}`}
              placeholder="Este comité aún no agrega nada. Escribe aquí lo propio del comité."
              className="w-full resize-y rounded-2xl bg-transparent px-4 py-3 text-[13.5px] leading-[1.7] outline-none placeholder:text-[#B4B0C8]"
            />
          </div>
        </div>

        <div>
          <span className={ETIQUETA}>Datos del comité</span>
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
          <p className="mt-2 text-[12px] text-[#A3A0B8]">Vienen de la configuración del comité y se actualizan solos.</p>
        </div>
      </div>
    </div>
  );
}
