"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  Droplet,
  Droplets,
  Inbox,
  LayoutDashboard,
  Link2,
  Settings,
  Users,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Enlace = {
  href: string;
  etiqueta: string;
  icono: typeof Droplet;
  /** true: solo está activo en esa ruta exacta (no en sus subrutas). */
  exacto?: boolean;
};

/** El menú principal: una entrada por producto. */
const ENLACES: Enlace[] = [
  { href: "/", etiqueta: "Resumen", icono: LayoutDashboard, exacto: true },
  { href: "/facilapr", etiqueta: "Facilapr", icono: Droplet },
  { href: "/mecanicoapp", etiqueta: "mecanicoapp", icono: Wrench },
  { href: "/configuracion", etiqueta: "Configuración", icono: Settings },
];

/** Lo que muestra el menú cuando estás DENTRO de Facilapr. */
const ENLACES_FACILAPR: Enlace[] = [
  { href: "/facilapr", etiqueta: "Resumen", icono: LayoutDashboard, exacto: true },
  { href: "/facilapr/comites", etiqueta: "Comités", icono: Users },
  { href: "/facilapr/lecturas", etiqueta: "Lecturas", icono: Droplets },
  { href: "/facilapr/direcciones", etiqueta: "Enlaces", icono: Link2 },
  { href: "/consultas", etiqueta: "Consultas", icono: Inbox },
];

/** Las páginas que pertenecen a la sección Facilapr (Consultas es de facilapr.cl). */
function enFacilapr(pathname: string) {
  return (
    pathname.startsWith("/facilapr") ||
    pathname.startsWith("/facilagua") ||
    pathname.startsWith("/consultas")
  );
}

function ItemMenu({ enlace, pathname, sangrado = false }: { enlace: Enlace; pathname: string; sangrado?: boolean }) {
  const { href, etiqueta, icono: Icono, exacto } = enlace;
  const activo = exacto ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={activo ? "page" : undefined}
      className={cn(
        "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
        sangrado && "md:ml-3",
        activo
          ? "bg-black/[0.06] font-medium dark:bg-white/[0.10]"
          : "text-black/60 hover:bg-black/[0.03] dark:text-white/60 dark:hover:bg-white/[0.05]"
      )}
    >
      <Icono className="size-4 shrink-0" />
      {etiqueta}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const dentro = enFacilapr(pathname);

  return (
    <nav
      aria-label="Secciones"
      className="flex shrink-0 gap-1 overflow-x-auto border-b border-black/[0.08] p-3 md:w-56 md:flex-col md:overflow-visible md:border-r md:border-b-0 dark:border-white/[0.12]"
    >
      {dentro ? (
        <>
          {/* Dentro de un producto, su nombre sube arriba y debajo van sus apartados. */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[0.75rem] text-black/45 transition-colors hover:text-black/80 md:mt-2 dark:text-white/45 dark:hover:text-white/80"
          >
            <ArrowLeft className="size-3.5" />
            Panel
          </Link>

          <div className="flex shrink-0 items-center gap-2.5 px-3 py-1.5 md:pb-2">
            <Droplet className="size-4 shrink-0" />
            <span className="text-base font-semibold tracking-tight">Facilapr</span>
          </div>

          {ENLACES_FACILAPR.map((e) => (
            <ItemMenu key={e.href} enlace={e} pathname={pathname} sangrado />
          ))}
        </>
      ) : (
        <>
          <div className="mb-2 hidden px-3 pt-2 md:block">
            <span className="font-mono text-[0.7rem] font-semibold tracking-[0.09em] text-black/40 uppercase dark:text-white/40">
              Panel
            </span>
          </div>

          {ENLACES.map((e) => (
            <ItemMenu key={e.href} enlace={e} pathname={pathname} />
          ))}
        </>
      )}
    </nav>
  );
}
