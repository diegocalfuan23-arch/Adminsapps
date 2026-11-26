import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, ChevronRight, type LucideIcon } from "lucide-react";
import type { EstadoComite } from "@/lib/consola";
import { cn } from "@/lib/utils";

export const TARJETA = "rounded-2xl border border-zinc-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]";

export const ESTADO: Record<EstadoComite, { texto: string; chip: string; punto: string }> = {
  "al-dia": { texto: "Al día", chip: "bg-emerald-50 text-emerald-700 ring-emerald-600/15", punto: "bg-emerald-500" },
  cargando: { texto: "Cargando lecturas", chip: "bg-sky-50 text-sky-700 ring-sky-600/15", punto: "bg-sky-500" },
  "por-aprobar": { texto: "Por aprobar", chip: "bg-amber-50 text-amber-800 ring-amber-600/20", punto: "bg-amber-500" },
  "sin-lecturas": { texto: "Sin lecturas", chip: "bg-zinc-100 text-zinc-600 ring-zinc-500/15", punto: "bg-zinc-400" },
};

/** La línea pequeña con la evolución de los últimos meses. */
function Linea({ datos, id, ancho = 96, alto = 32 }: { datos: number[]; id: string; ancho?: number; alto?: number }) {
  const min = Math.min(...datos);
  const max = Math.max(...datos);
  const puntos = datos.map((v, i) => [(i / (datos.length - 1)) * ancho, alto - 3 - ((v - min) / (max - min || 1)) * (alto - 6)]);
  const linea = puntos.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const fin = puntos[puntos.length - 1];
  return (
    <svg width={ancho} height={alto} viewBox={`0 0 ${ancho} ${alto}`} aria-hidden className="shrink-0 overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#3A0CE3" stopOpacity=".16" />
          <stop offset="1" stopColor="#3A0CE3" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${linea} L${ancho},${alto} L0,${alto} Z`} fill={`url(#${id})`} />
      <path d={linea} fill="none" stroke="#3A0CE3" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={fin[0]} cy={fin[1]} r="2.75" fill="#3A0CE3" stroke="#fff" strokeWidth="1.5" />
    </svg>
  );
}

export function Cifra({
  titulo,
  valor,
  serie,
  cambio,
  pie,
}: {
  titulo: string;
  valor: string;
  serie: number[];
  /** Diferencia contra lo anterior; sin ella solo va el texto del pie. */
  cambio?: { texto: string; baja?: boolean } | null;
  pie: string;
}) {
  const Flecha = cambio?.baja ? ArrowDownRight : ArrowUpRight;
  return (
    <div className={cn(TARJETA, "p-5")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-zinc-500">{titulo}</p>
          <p className="mt-1.5 text-[30px] leading-none font-semibold tracking-tight text-zinc-900 tabular-nums">{valor}</p>
        </div>
        <Linea datos={serie} id={`linea-${titulo.replace(/\W+/g, "-")}`} />
      </div>
      <p className="mt-4 flex items-center gap-1.5 text-[12.5px] text-zinc-500">
        {cambio && (
          <span className={cn("inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold", cambio.baja ? "bg-zinc-100 text-zinc-600" : "bg-emerald-50 text-emerald-700")}>
            <Flecha className="size-3" aria-hidden />
            {cambio.texto}
          </span>
        )}
        {pie}
      </p>
    </div>
  );
}

export function Pendiente({ href, icono: Icono, n, titulo, detalle, tono, accion }: { href: string; icono: LucideIcon; n: number; titulo: string; detalle: string; tono: string; accion: string }) {
  return (
    <Link href={href} className="group flex w-full items-center gap-3.5 rounded-xl px-3 py-3 transition hover:bg-zinc-50">
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", tono)}>
        <Icono className="size-[18px]" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span className="text-[22px] leading-none font-semibold text-zinc-900 tabular-nums">{n}</span>
          <span className="truncate text-[14px] font-medium text-zinc-800">{titulo}</span>
        </span>
        <span className="mt-1 block truncate text-[12.5px] text-zinc-500">{detalle}</span>
      </span>
      <span className="hidden shrink-0 text-[12.5px] font-semibold text-[#3A0CE3] sm:block">{accion}</span>
      <ChevronRight className="size-4 shrink-0 text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-zinc-500" aria-hidden />
    </Link>
  );
}
