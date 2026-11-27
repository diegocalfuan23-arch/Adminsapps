"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Bot, Building2, Droplet, Gauge, Inbox, LayoutGrid, Link2, LogOut, Menu, Settings, Wrench, X, type LucideIcon } from "lucide-react";
import { Campana } from "@/components/consola/campana";
import { signOut } from "@/lib/auth-client";
import type { Avisos } from "@/lib/consola";
import { cn } from "@/lib/utils";

type Item = { href: string; texto: string; icono: LucideIcon; exacto?: boolean; aviso?: keyof Avisos };

/** El menú dentro de Facilapr. */
const FACILAPR: Item[] = [
  { href: "/facilapr", texto: "Resumen", icono: LayoutGrid, exacto: true },
  { href: "/facilapr/comites", texto: "Comités", icono: Building2, aviso: "comites" },
  { href: "/facilapr/lecturas", texto: "Lecturas", icono: Gauge, aviso: "lecturas" },
  { href: "/facilapr/asistente", texto: "Asistente", icono: Bot, aviso: "asistente" },
  { href: "/facilapr/direcciones", texto: "Enlaces", icono: Link2 },
  { href: "/consultas", texto: "Consultas", icono: Inbox, aviso: "consultas" },
];

/** El menú del panel completo: una entrada por producto. */
const PANEL: Item[] = [
  { href: "/", texto: "Resumen", icono: LayoutGrid, exacto: true },
  { href: "/facilapr", texto: "Facilapr", icono: Droplet },
  { href: "/mecanicoapp", texto: "mecanicoapp", icono: Wrench },
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

const SECUNDARIO = "flex h-10 w-full items-center gap-3 rounded-xl px-3.5 text-[13.5px] font-medium text-white/60 transition hover:bg-white/[0.06] hover:text-white";

type Datos = { avisos: Avisos; usuario: string };

function Lateral({ ruta, avisos, usuario, onIr }: Datos & { ruta: string; onIr?: () => void }) {
  const router = useRouter();
  const dentro = enFacilapr(ruta);

  async function salir() {
    await signOut();
    router.push("/entrar");
    router.refresh();
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#110C2E] text-white">
      <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-[#3A0CE3]/40 blur-[90px]" />
      <div className="relative px-6 pt-7">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-[#6B4BFF] to-[#3A0CE3] shadow-[0_8px_20px_rgba(58,12,227,0.45)]">
            {dentro ? <Droplet className="size-5" fill="currentColor" aria-hidden /> : <LayoutGrid className="size-5" aria-hidden />}
          </span>
          <div className="leading-tight">
            <p className="text-[16px] font-semibold tracking-tight">{dentro ? "FacilAPR" : "Panel"}</p>
            <p className="text-[12px] text-white/50">{dentro ? "Administración" : "Mis productos"}</p>
          </div>
        </div>
      </div>

      <nav aria-label="Secciones" className="relative mt-10 flex-1 space-y-1 overflow-y-auto px-4">
        {(dentro ? FACILAPR : PANEL).map((i) => {
          const activo = estaEn(ruta, i);
          const n = i.aviso ? avisos[i.aviso] : 0;
          return (
            <Link
              key={i.href}
              href={i.href}
              onClick={onIr}
              aria-current={activo ? "page" : undefined}
              className={cn(
                "flex h-11 items-center gap-3 rounded-2xl px-3.5 text-[14px] font-medium transition",
                activo ? "bg-white text-[#110C2E] shadow-[0_6px_18px_rgba(0,0,0,0.25)]" : "text-white/65 hover:bg-white/[0.06] hover:text-white"
              )}
            >
              <i.icono className={cn("size-[18px]", activo && "text-[#3A0CE3]")} aria-hidden />
              <span className="flex-1">{i.texto}</span>
              {n > 0 && (
                <span className={cn("grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums", activo ? "bg-[#3A0CE3] text-white" : "bg-white/10 text-white/80")}>{n}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="relative space-y-1 px-4 pb-3">
        {dentro && (
          <Link href="/" onClick={onIr} className={SECUNDARIO}>
            <ArrowLeft className="size-4" aria-hidden />
            Volver al panel
          </Link>
        )}
        <Link href="/configuracion" onClick={onIr} className={cn(SECUNDARIO, ruta.startsWith("/configuracion") && "bg-white/10 text-white")}>
          <Settings className="size-4" aria-hidden />
          Ajustes
        </Link>
      </div>

      <div className="relative mx-4 mb-5 flex items-center gap-3 rounded-2xl bg-white/[0.06] p-3 ring-1 ring-white/10">
        <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#C9BEFF] to-[#8B74FF] text-[12px] font-bold text-[#110C2E]">
          {iniciales(usuario)}
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-[13.5px] font-semibold">{usuario}</p>
          <p className="truncate text-[12px] text-white/50">Super administrador</p>
        </div>
        <button type="button" onClick={salir} aria-label="Cerrar sesión" className="grid size-8 shrink-0 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white">
          <LogOut className="size-4" />
        </button>
      </div>
    </div>
  );
}

/** El marco del panel: menú oscuro fijo a la izquierda; en el teléfono, barra arriba y cajón. */
export function Marco({ children, ...datos }: Datos & { children: React.ReactNode }) {
  const ruta = usePathname();
  const [abierto, setAbierto] = useState(false);
  const dentro = enFacilapr(ruta);

  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, []);

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] lg:block">
        <Lateral ruta={ruta} {...datos} />
      </aside>

      <div className="sticky top-0 z-20 flex h-14 items-center gap-3 bg-[#110C2E] px-4 text-white lg:hidden">
        <button type="button" onClick={() => setAbierto(true)} aria-label="Abrir menú" className="grid size-9 place-items-center rounded-xl bg-white/10">
          <Menu className="size-[18px]" />
        </button>
        <span aria-hidden className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-[#6B4BFF] to-[#3A0CE3]">
          {dentro ? <Droplet className="size-3.5" fill="currentColor" /> : <LayoutGrid className="size-3.5" />}
        </span>
        <p className="text-[15px] font-semibold">{dentro ? "FacilAPR" : "Panel"}</p>
        {dentro && <Campana hay={Object.values(datos.avisos).some((n) => n > 0)} oscura className="ml-auto grid" />}
      </div>

      {abierto && (
        <div role="dialog" aria-modal="true" aria-label="Menú" className="fixed inset-0 z-40 lg:hidden">
          <button type="button" aria-label="Cerrar menú" onClick={() => setAbierto(false)} className="absolute inset-0 bg-[#110C2E]/40 backdrop-blur-[2px]" />
          <div className="absolute inset-y-0 left-0 w-[284px] shadow-2xl">
            <Lateral ruta={ruta} {...datos} onIr={() => setAbierto(false)} />
            <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar" className="absolute top-8 right-3 grid size-8 place-items-center rounded-lg text-white/70 hover:bg-white/10">
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      <main className="lg:pl-[264px]">
        <div className="mx-auto max-w-[1264px] px-4 pt-5 pb-16 sm:px-6 lg:px-8 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}
