"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { guardarInstrucciones } from "@/app/(panel)/facilapr/acciones";

/** El texto que Diego le da al asistente para todos los comités. */
export function AsistenteGenerales({ inicial, maximo }: { inicial: string; maximo: number }) {
  const [texto, setTexto] = useState(inicial);
  const [guardado, setGuardado] = useState(inicial);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciar] = useTransition();
  const cambiado = texto.trim() !== guardado.trim();

  function guardar() {
    setError(null);
    iniciar(async () => {
      const r = await guardarInstrucciones(texto);
      if (r.ok) setGuardado(texto);
      else setError(r.error);
    });
  }

  return (
    <div className="mt-4">
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        maxLength={maximo}
        rows={9}
        aria-label="Instrucciones generales"
        placeholder="Ej.: Saluda por el nombre y responde corto."
        className="w-full resize-y rounded-2xl bg-[#F7F6FB] p-4 text-[14px] leading-relaxed outline-none placeholder:text-[#8D89A6] focus:ring-4 focus:ring-[#3A0CE3]/15"
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <span className="text-[12.5px] text-[#75718F] tabular-nums">
          {texto.length} / {maximo}
        </span>
        <div className="flex items-center gap-3">
          {!cambiado && guardado.trim() !== "" && (
            <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#3A0CE3]">
              <Check className="size-3.5" aria-hidden />
              Guardado
            </span>
          )}
          <button
            type="button"
            onClick={guardar}
            disabled={!cambiado || pendiente}
            className="h-10 rounded-xl bg-[#110C2E] px-5 text-[13.5px] font-semibold text-white transition hover:bg-[#241D52] disabled:opacity-40"
          >
            {pendiente ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
