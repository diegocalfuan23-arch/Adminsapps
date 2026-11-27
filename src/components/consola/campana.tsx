"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import type { Novedad } from "@/lib/consola";
import { cn } from "@/lib/utils";

/** La campana: al abrirla muestra lo último que pasó en la plataforma. */
export function Campana({ novedades, oscura, className }: { novedades: Novedad[]; oscura?: boolean; className?: string }) {
  const [abierta, setAbierta] = useState(false);
  const caja = useRef<HTMLDivElement>(null);
  const hayNuevas = novedades.some((n) => n.nueva);

  useEffect(() => {
    if (!abierta) return;
    const afuera = (e: PointerEvent) => {
      if (!caja.current?.contains(e.target as Node)) setAbierta(false);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierta(false);
    };
    window.addEventListener("pointerdown", afuera);
    window.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("pointerdown", afuera);
      window.removeEventListener("keydown", escape);
    };
  }, [abierta]);

  return (
    <div ref={caja} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setAbierta((a) => !a)}
        aria-label="Actividad reciente"
        aria-expanded={abierta}
        className={cn(
          "relative grid place-items-center",
          oscura ? "size-9 rounded-xl bg-white/10 text-white" : "size-12 rounded-2xl bg-white text-[#16132B] shadow-[0_1px_2px_rgba(20,16,50,0.05)]"
        )}
      >
        <Bell className={oscura ? "size-4" : "size-[18px]"} aria-hidden />
        {hayNuevas && <span aria-hidden className={cn("absolute size-2 rounded-full", oscura ? "top-2 right-2 bg-[#8F7BFF]" : "top-3.5 right-3.5 bg-[#3A0CE3] ring-2 ring-white")} />}
      </button>
      {abierta && (
        <div className="absolute top-full right-0 z-30 mt-2 w-[min(320px,calc(100vw-32px))] rounded-2xl bg-white p-2 text-left text-[#16132B] shadow-[0_20px_50px_-12px_rgba(20,16,50,0.25)] ring-1 ring-[#E9E7F5]">
          {novedades.length === 0 ? (
            <p className="px-3 py-6 text-center text-[13px] text-[#75718F]">Sin actividad en los últimos 30 días.</p>
          ) : (
            <ul className="max-h-[360px] overflow-y-auto">
              {novedades.map((n, i) => (
                <li key={i} className="flex gap-3 rounded-xl px-3 py-2.5">
                  <span aria-hidden className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.nueva ? "bg-[#3A0CE3]" : "bg-[#E4E0F5]")} />
                  <span className="min-w-0">
                    <span className="block text-[13px] leading-snug">{n.texto}</span>
                    <span className="block text-[12px] text-[#75718F]">{n.cuando}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
