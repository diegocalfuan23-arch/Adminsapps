"use client";

import { useState } from "react";
import { ArrowLeft, ArrowUpRight, ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import { SelectorPlanComite } from "@/components/selector-plan-comite";
import { corto, GRUPO, grupoDe, haceDias, iniciales, nombrePlan, PLAN_CHIP } from "@/components/consola/comites/comun";
import type { ComiteDetalle } from "@/lib/comites-consola";
import { cn } from "@/lib/utils";

const ETIQUETA = "text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8D89A6]";
const NIVEL = ["bg-[#F0EEF8]", "bg-[#B9ACFF]", "bg-[#3A0CE3]"];

export function Detalle({ comite: c, onCerrar }: { comite: ComiteDetalle; onCerrar?: () => void }) {
  const [cambiando, setCambiando] = useState(false);
  const g = GRUPO[grupoDe(c)];
  const plan = nombrePlan(c);
  const portal = c.slug ? `https://${c.slug}.facilapr.cl` : null;
  const diasConUso = c.uso.filter((d) => d.nivel).length;

  const cifras = [
    ["Socios", c.socios.toLocaleString("es-CL")],
    ["Boletas", c.boletas.toLocaleString("es-CL")],
    ["Recaudado", c.recaudado === null ? "—" : `${c.recaudado} %`],
    ["Último ingreso", corto(c.ingreso)],
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start gap-4 border-b border-[#F0EEF8] px-6 py-5 sm:px-7">
        {onCerrar && (
          <button type="button" onClick={onCerrar} aria-label="Volver" className="-ml-2 grid size-9 shrink-0 place-items-center rounded-xl text-[#5E5A78] hover:bg-[#F3F2F8]">
            <ArrowLeft className="size-4" />
          </button>
        )}
        <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#EEEAFF] to-[#DCD5FF] text-[14px] font-bold text-[#3A0CE3]">
          {iniciales(c.nombre)}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[19px] font-semibold tracking-tight">{c.nombre}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-[#8D89A6]">
            <span className={cn("rounded-md px-2 py-0.5 font-semibold", PLAN_CHIP[plan])}>{plan}</span>
            <span className={cn("inline-flex items-center gap-1.5 font-medium", g.texto)}>
              <span aria-hidden className={cn("size-2 rounded-full", g.punto)} />
              {haceDias(c.actividad)}
            </span>
            <span>Desde {c.registrado}</span>
          </div>
        </div>
        {portal && (
          <a href={portal} target="_blank" rel="noopener noreferrer" className="hidden h-10 shrink-0 items-center gap-1.5 rounded-xl bg-[#3A0CE3] px-4 text-[13px] font-semibold text-white hover:bg-[#3209C9] sm:inline-flex">
            Abrir panel
            <ArrowUpRight className="size-4" aria-hidden />
          </a>
        )}
      </div>

      <div className="min-h-0 flex-1 max-xl:overflow-y-auto max-xl:[scrollbar-width:none]">
        <div className="grid grid-cols-2 border-b border-[#F0EEF8] sm:grid-cols-4">
          {cifras.map(([titulo, valor], i) => (
            <div key={titulo} className={cn("px-6 py-4 sm:px-7", i % 2 === 1 && "border-l border-[#F0EEF8]", i >= 2 && "border-t border-[#F0EEF8] sm:border-t-0 sm:border-l")}>
              <p className="text-[12px] text-[#8D89A6]">{titulo}</p>
              <p className="mt-0.5 text-[22px] font-semibold tracking-tight tabular-nums">{valor}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-px bg-[#F0EEF8] md:grid-cols-2">
          <div className="bg-white px-6 py-5 sm:px-7">
            <p className={ETIQUETA}>Uso · últimas 5 semanas</p>
            <div className="mt-3 flex items-end gap-5">
              <div role="img" aria-label={`${diasConUso} días con uso en las últimas 5 semanas`} className="grid w-fit grid-cols-7 gap-1.5">
                {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
                  <span key={i} className="text-center text-[10px] font-medium text-[#A3A0B8]">
                    {d}
                  </span>
                ))}
                {c.uso.map((d) => (
                  <span key={d.dia} title={d.nivel === null ? undefined : d.dia} className={cn("size-[22px] rounded-md", d.nivel === null ? "" : NIVEL[d.nivel])} />
                ))}
              </div>
              <div className="pb-1">
                <p className="text-[28px] leading-none font-semibold tracking-tight tabular-nums">{diasConUso}</p>
                <p className="mt-1 text-[12px] text-[#8D89A6]">días con uso</p>
                <div aria-hidden className="mt-3 flex items-center gap-1 text-[10.5px] text-[#A3A0B8]">
                  {NIVEL.map((color) => (
                    <span key={color} className={cn("size-2.5 rounded-sm", color)} />
                  ))}
                  <span className="ml-1">más uso</span>
                </div>
              </div>
            </div>
            <p className="mt-4 text-[12.5px] text-[#6E6A86]">
              Última actividad: <span className="font-medium text-[#16132B]">{c.ultima ?? "nunca usó la app"}</span>
            </p>
          </div>

          <div className="divide-y divide-[#F0EEF8] bg-white">
            <div className="px-6 py-5 sm:px-7">
              <p className={ETIQUETA}>Responsable</p>
              <p className="mt-2 text-[14.5px] font-semibold">
                {c.responsable ?? "Sin responsable"}
                {c.cargo && <span className="font-normal text-[#8D89A6]"> · {c.cargo}</span>}
              </p>
              <div className="mt-2 space-y-1.5 text-[13px] text-[#5E5A78]">
                {c.correo && (
                  <p className="flex items-center gap-2">
                    <Mail className="size-3.5 shrink-0 text-[#A3A0B8]" aria-hidden />
                    <a href={`mailto:${c.correo}`} className="truncate hover:underline">
                      {c.correo}
                    </a>
                  </p>
                )}
                {c.telefono && (
                  <p className="flex items-center gap-2">
                    <Phone className="size-3.5 shrink-0 text-[#A3A0B8]" aria-hidden />
                    {c.telefono}
                  </p>
                )}
              </div>
            </div>
            <div className="px-6 py-5 sm:px-7">
              <p className={ETIQUETA}>Cuenta</p>
              <div className="mt-2 space-y-1.5 text-[13px] text-[#5E5A78]">
                <p className="flex items-center gap-2">
                  <ExternalLink className="size-3.5 shrink-0 text-[#A3A0B8]" aria-hidden />
                  <span className="truncate">{c.slug ? `${c.slug}.facilapr.cl` : "Sin dirección"}</span>
                </p>
                {c.comuna && (
                  <p className="flex items-center gap-2">
                    <MapPin className="size-3.5 shrink-0 text-[#A3A0B8]" aria-hidden />
                    {c.comuna}
                  </p>
                )}
              </div>
              <div className="mt-3">
                {cambiando ? (
                  <SelectorPlanComite aprId={c.id} planActual={c.plan} />
                ) : (
                  <button type="button" onClick={() => setCambiando(true)} className="text-[12.5px] font-semibold text-[#3A0CE3] hover:underline">
                    Cambiar plan
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {(c.correo || portal) && (
        <div className="flex gap-2 border-t border-[#F0EEF8] p-4 sm:hidden">
          {c.correo && (
            <a href={`mailto:${c.correo}`} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#F3F2F8] text-[13.5px] font-semibold">
              <Mail className="size-4" aria-hidden />
              Escribir
            </a>
          )}
          {portal && (
            <a href={portal} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#3A0CE3] text-[13.5px] font-semibold text-white">
              Abrir panel
              <ArrowUpRight className="size-4" aria-hidden />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
