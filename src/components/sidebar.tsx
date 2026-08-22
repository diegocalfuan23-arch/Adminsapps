"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Droplet,
  Inbox,
  LayoutDashboard,
  Settings,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ENLACES = [
  { href: "/", etiqueta: "Resumen", icono: LayoutDashboard },
  { href: "/consultas", etiqueta: "Consultas", icono: Inbox },
  { href: "/facilagua", etiqueta: "FacilAgua", icono: Droplet },
  { href: "/mecanicoapp", etiqueta: "mecanicoapp", icono: Wrench },
  { href: "/configuracion", etiqueta: "Configuración", icono: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Secciones"
      className="flex shrink-0 gap-1 overflow-x-auto border-b border-black/[0.08] p-3 md:w-56 md:flex-col md:overflow-visible md:border-r md:border-b-0 dark:border-white/[0.12]"
    >
      <div className="mb-2 hidden px-3 pt-2 md:block">
        <span className="font-mono text-[0.7rem] font-semibold tracking-[0.09em] text-black/40 uppercase dark:text-white/40">
          Panel
        </span>
      </div>

      {ENLACES.map(({ href, etiqueta, icono: Icono }) => {
        const activo =
          href === "/" ? pathname === "/" : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            aria-current={activo ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
              activo
                ? "bg-black/[0.06] font-medium dark:bg-white/[0.10]"
                : "text-black/60 hover:bg-black/[0.03] dark:text-white/60 dark:hover:bg-white/[0.05]"
            )}
          >
            <Icono className="size-4 shrink-0" />
            {etiqueta}
          </Link>
        );
      })}
    </nav>
  );
}
