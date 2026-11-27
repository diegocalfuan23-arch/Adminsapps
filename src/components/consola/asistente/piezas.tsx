import { ChevronDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const CAMPO =
  "w-full rounded-xl border border-[#E2DEF2] bg-white px-3.5 text-[13.5px] outline-none transition placeholder:text-[#B4B0C8] focus:border-[#3A0CE3] focus:ring-4 focus:ring-[#3A0CE3]/10";
export const ETIQUETA = "text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8D89A6]";

export function Interruptor({ on, onChange, disabled, nombre }: { on: boolean; onChange?: () => void; disabled?: boolean; nombre: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={nombre}
      disabled={disabled}
      onClick={onChange}
      className={cn("relative h-5 w-9 shrink-0 rounded-full transition disabled:cursor-not-allowed disabled:opacity-60", on ? "bg-[#3A0CE3]" : "bg-[#DCD8EC]")}
    >
      <span className={cn("absolute top-0.5 left-0 size-4 rounded-full bg-white shadow transition", on ? "translate-x-[18px]" : "translate-x-0.5")} />
    </button>
  );
}

/** En el teléfono se pliega; desde tablet está siempre abierto. */
export function Plegable({ titulo, resumen, abierto, onAbrir, children }: { titulo: string; resumen: string; abierto: boolean; onAbrir: () => void; children: React.ReactNode }) {
  return (
    <div className="max-md:rounded-2xl max-md:ring-1 max-md:ring-[#EEEBF6]">
      <button type="button" onClick={onAbrir} aria-expanded={abierto} className="flex w-full items-center gap-2 text-left max-md:px-4 max-md:py-3 md:pointer-events-none">
        <span className={ETIQUETA}>{titulo}</span>
        <span className="ml-auto text-[12px] text-[#8D89A6] md:hidden">{resumen}</span>
        <ChevronDown className={cn("size-4 text-[#A3A0B8] transition md:hidden", abierto && "rotate-180")} />
      </button>
      <div className={cn("max-md:px-3 max-md:pb-3", !abierto && "max-md:hidden")}>{children}</div>
    </div>
  );
}

/** El encabezado de cada capa: ícono, título y lo que haya a la derecha. */
export function Cabecera({ icono: Icono, titulo, detalle, children }: { icono: LucideIcon; titulo: string; detalle: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-[#F0EEF8] px-6 py-5 sm:px-8">
      <span className="grid size-10 place-items-center rounded-xl bg-[#F1EEFF] text-[#3A0CE3]">
        <Icono className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-[17px] font-semibold">{titulo}</h2>
        <p className="text-[12.5px] text-[#8D89A6]">{detalle}</p>
      </div>
      {children}
    </div>
  );
}
