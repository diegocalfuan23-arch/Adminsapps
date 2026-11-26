"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Droplet,
  ExternalLink,
  Gauge,
  Globe,
  Inbox,
  LayoutGrid,
  Link2,
  Menu,
  Search,
  Settings,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import type { Avisos } from "@/lib/consola";
import { cn } from "@/lib/utils";

type Item = { href: string; texto: string; icono: LucideIcon; exacto?: boolean; aviso?: keyof Avisos };
type Grupo = { titulo: string; items: Item[] };

/** El menú dentro de Facilapr. */
const FACILAPR: Grupo[] = [
  {
    titulo: "Operación",
    items: [
      { href: "/facilapr", texto: "Resumen", icono: LayoutGrid, exacto: true },
      { href: "/facilapr/comites", texto: "Comités", icono: Building2, aviso: "comites" },
      { href: "/facilapr/lecturas", texto: "Lecturas", icono: Gauge, aviso: "lecturas" },
    ],
  },
  {
    titulo: "Plataforma",
    items: [
      { href: "/facilapr/direcciones", texto: "Enlaces", icono: Link2 },
      { href: "/consultas", texto: "Consultas", icono: Inbox, aviso: "consultas" },
    ],
  },
];

/** El menú del panel completo: una entrada por producto. */
const PANEL: Grupo[] = [
  {
    titulo: "Productos",
    items: [
      { href: "/", texto: "Resumen", icono: LayoutGrid, exacto: true },
      { href: "/facilapr", texto: "Facilapr", icono: Droplet },
      { href: "/mecanicoapp", texto: "mecanicoapp", icono: Wrench },
      { href: "/configuracion", texto: "Configuración", icono: Settings },
    ],
  },
];

/** Las páginas que pertenecen a Facilapr (Consultas es de facilapr.cl). */
const enFacilapr = (ruta: string) => ["/facilapr", "/facilagua", "/consultas"].some((p) => ruta.startsWith(p));
const estaEn = (ruta: string, i: Item) => (i.exacto ? ruta === i.href : ruta.startsWith(i.href));

const iniciales = (nombre: string) =>
  nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

function Insignia({ dentro }: { dentro: boolean }) {
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#3A0CE3] text-white shadow-[0_4px_12px_rgba(58,12,227,0.3)]">
      {dentro ? <Droplet className="size-[18px]" fill="currentColor" aria-hidden /> : <LayoutGrid className="size-[18px]" aria-hidden />}
    </span>
  );
}

function Menu_({ ruta, avisos, sitio, usuario, onIr }: { ruta: string; avisos: Avisos; sitio: string; usuario: string; onIr?: () => void }) {
  const dentro = enFacilapr(ruta);
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-6">
        {dentro && (
          <Link href="/" onClick={onIr} className="mb-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-zinc-500 hover:text-zinc-800">
            <ArrowLeft className="size-3.5" aria-hidden />
            Panel
          </Link>
        )}
        <div className="flex items-center gap-3">
          <Insignia dentro={dentro} />
          <div className="leading-tight">
            <p className="text-[15px] font-semibold text-zinc-900">{dentro ? "FacilAPR" : "Panel"}</p>
            <p className="text-[11.5px] font-medium text-zinc-500">{dentro ? "Consola de administración" : "Mis productos"}</p>
          </div>
        </div>
      </div>

      <nav aria-label="Secciones" className="mt-6 flex-1 space-y-6 overflow-y-auto px-3">
        {(dentro ? FACILAPR : PANEL).map((g) => (
          <div key={g.titulo} className="space-y-0.5">
            <p className="px-3 pb-2 text-[11px] font-semibold tracking-[0.08em] text-zinc-400 uppercase">{g.titulo}</p>
            {g.items.map((i) => {
              const activo = estaEn(ruta, i);
              const n = i.aviso ? avisos[i.aviso] : 0;
              return (
                <Link
                  key={i.href}
                  href={i.href}
                  onClick={onIr}
                  aria-current={activo ? "page" : undefined}
                  className={cn(
                    "relative flex h-10 items-center gap-3 rounded-lg px-3 text-[14px] transition",
                    activo ? "bg-[#F1EEFF] font-semibold text-[#2A08A8]" : "font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                  )}
                >
                  {activo && <span aria-hidden className="absolute top-2 -left-3 h-6 w-[3px] rounded-r-full bg-[#3A0CE3]" />}
                  <i.icono className={cn("size-[18px]", activo ? "text-[#3A0CE3]" : "text-zinc-400")} aria-hidden />
                  <span className="flex-1">{i.texto}</span>
                  {n > 0 && (
                    <span className={cn("min-w-5 rounded-full px-1.5 py-px text-center text-[11px] font-semibold tabular-nums", activo ? "bg-[#3A0CE3] text-white" : "bg-zinc-100 text-zinc-600")}>
                      {n}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
        {dentro && (
          <a href={sitio} target="_blank" rel="noreferrer" className="flex h-10 items-center gap-3 rounded-lg px-3 text-[14px] font-medium text-zinc-600 hover:bg-zinc-50">
            <Globe className="size-[18px] text-zinc-400" aria-hidden />
            <span className="flex-1">Ver facilapr.cl</span>
            <ExternalLink className="size-3.5 text-zinc-400" aria-hidden />
          </a>
        )}
      </nav>

      <div className="m-3 flex items-center gap-3 rounded-xl border border-zinc-200/80 p-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-zinc-900 text-[12px] font-semibold text-white">{iniciales(usuario)}</span>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[13.5px] font-semibold text-zinc-900">{usuario}</p>
          <p className="truncate text-[12px] text-zinc-500">Super administrador</p>
        </div>
      </div>
    </div>
  );
}

/** El marco del panel: menú fijo a la izquierda (cajón en el teléfono) y la barra de arriba. */
export function Marco({ avisos, sitio, usuario, children }: { avisos: Avisos; sitio: string; usuario: string; children: React.ReactNode }) {
  const ruta = usePathname();
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const buscador = useRef<HTMLInputElement>(null);
  const dentro = enFacilapr(ruta);
  const seccion = [...FACILAPR, ...PANEL].flatMap((g) => g.items).find((i) => estaEn(ruta, i))?.texto ?? "Resumen";

  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        buscador.current?.focus();
      }
      if (e.key === "Escape") setAbierto(false);
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, []);

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] border-r border-zinc-200/80 bg-white lg:block">
        <Menu_ ruta={ruta} avisos={avisos} sitio={sitio} usuario={usuario} />
      </aside>

      <div className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-zinc-200/80 bg-white/90 px-4 backdrop-blur lg:hidden">
        <button type="button" onClick={() => setAbierto(true)} aria-label="Abrir menú" className="grid size-9 place-items-center rounded-lg border border-zinc-200 text-zinc-700">
          <Menu className="size-[18px]" />
        </button>
        <p className="text-[15px] font-semibold">{dentro ? "FacilAPR" : "Panel"}</p>
        <span className="ml-auto grid size-8 place-items-center rounded-full bg-zinc-900 text-[11px] font-semibold text-white">{iniciales(usuario)}</span>
      </div>

      {abierto && (
        <div role="dialog" aria-modal="true" aria-label="Menú" className="fixed inset-0 z-40 lg:hidden">
          <button type="button" aria-label="Cerrar menú" onClick={() => setAbierto(false)} className="absolute inset-0 bg-zinc-900/30 backdrop-blur-[2px]" />
          <div className="absolute inset-y-0 left-0 w-[280px] bg-white shadow-2xl">
            <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar" className="absolute top-5 right-3 grid size-8 place-items-center rounded-lg text-zinc-500 hover:bg-zinc-100">
              <X className="size-4" />
            </button>
            <Menu_ ruta={ruta} avisos={avisos} sitio={sitio} usuario={usuario} onIr={() => setAbierto(false)} />
          </div>
        </div>
      )}

      <main className="lg:pl-[260px]">
        <div className="sticky top-0 z-20 hidden h-16 items-center gap-4 border-b border-zinc-200/70 bg-[#F7F7FA]/85 px-10 backdrop-blur lg:flex">
          <p className="text-[13.5px] text-zinc-500">
            {dentro ? "Consola" : "Panel"} <span className="mx-1.5 text-zinc-300">/</span>
            <span className="font-medium text-zinc-900">{seccion}</span>
          </p>
          {dentro && (
            <form
              role="search"
              className="relative ml-auto w-80"
              onSubmit={(e) => {
                e.preventDefault();
                const q = buscador.current?.value.trim() ?? "";
                router.push(q ? `/facilapr/comites?q=${encodeURIComponent(q)}` : "/facilapr/comites");
              }}
            >
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" aria-hidden />
              <input
                ref={buscador}
                aria-label="Buscar comité"
                placeholder="Buscar comité"
                className="h-9 w-full rounded-lg border border-zinc-200 bg-white pr-16 pl-9 text-[13.5px] shadow-sm outline-none placeholder:text-zinc-400 focus:border-[#3A0CE3] focus:ring-4 focus:ring-[#3A0CE3]/10"
              />
              <kbd className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded border border-zinc-200 bg-zinc-50 px-1.5 text-[11px] font-medium text-zinc-500">Ctrl K</kbd>
            </form>
          )}
        </div>
        <div className="mx-auto max-w-[1280px] px-4 pt-6 pb-16 sm:px-6 lg:px-10 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}
