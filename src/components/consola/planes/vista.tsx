"use client";

import { useState } from "react";
import { AlertTriangle, Check, ChevronDown, Gift, Minus } from "lucide-react";
import { TARJETA } from "@/components/consola/piezas";
import type { ClavePlan, DatosPlanes, Pago } from "@/lib/planes-consola";
import { cn } from "@/lib/utils";

const COLOR: Record<ClavePlan, string> = { PRUEBA: "#D9D4EE", BASICO: "#B9ACFF", ESTANDAR: "#7A5CFF", PREMIUM: "#3A0CE3" };

const PAGO: Record<Pago, { texto: string; chip: string }> = {
  "al-dia": { texto: "Al día", chip: "bg-[#EEEAFF] text-[#3A0CE3]" },
  atrasado: { texto: "Atrasado", chip: "bg-rose-50 text-rose-700" },
  prueba: { texto: "En prueba", chip: "bg-[#F5F4FA] text-[#6E6A86]" },
  "sin-pagos": { texto: "Sin pagos", chip: "bg-[#F5F4FA] text-[#6E6A86]" },
};

const clp = (n: number) => `${n < 0 ? "-" : ""}$${Math.abs(Math.round(n)).toLocaleString("es-CL")}`;
const comitesTexto = (n: number) => `${n} ${n === 1 ? "comité" : "comités"}`;

function Celda({ on }: { on: boolean }) {
  return on ? (
    <span className="mx-auto grid size-6 place-items-center rounded-full bg-[#EEEAFF] text-[#3A0CE3]">
      <Check className="size-3.5" strokeWidth={3} aria-label="Incluido" />
    </span>
  ) : (
    <Minus className="mx-auto size-4 text-[#D4D0E4]" aria-label="No incluido" />
  );
}

export function PlanesVista({ datos }: { datos: DatosPlanes }) {
  const { planes, caracteristicas, ingreso } = datos;
  const [movil, setMovil] = useState<ClavePlan>("ESTANDAR");
  const [abiertos, setAbiertos] = useState<ClavePlan[]>([]);
  const elegido = planes.find((p) => p.clave === movil) ?? planes[0];
  const categorias = [...new Set(caracteristicas.map((c) => c.categoria))];
  const diferencia = ingreso - datos.ingresoAnterior;

  const cifras = [
    ["Ingreso mensual", clp(ingreso), `${diferencia >= 0 ? "+" : ""}${clp(diferencia)} vs. ${datos.mesAnterior}`],
    ["Comités pagando", `${datos.pagando} de ${datos.total}`, `${datos.enPrueba} en prueba`],
    ["Promedio por comité", datos.pagando ? clp(ingreso / datos.pagando) : "—", "al mes"],
    ["Proyección anual", clp(ingreso * 12), "con los planes actuales"],
  ];

  return (
    <>
      <header>
        <h1 className="text-[28px] font-semibold tracking-[-0.025em] sm:text-[32px]">Planes</h1>
        <p className="text-[14.5px] text-[#8D89A6]">Qué incluye cada plan, cuántos comités lo usan y cuánto aporta.</p>
      </header>

      <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-[22px] border border-[#E7E4F3] bg-white sm:grid-cols-4">
        {cifras.map(([titulo, valor, detalle], i) => (
          <div key={titulo} className={cn("min-w-0 px-5 py-4 sm:px-6", i % 2 === 1 && "border-l border-[#F0EEF8]", i >= 2 && "border-t border-[#F0EEF8] sm:border-t-0 sm:border-l")}>
            <p className="truncate text-[12.5px] text-[#8D89A6]">{titulo}</p>
            <p className={cn("mt-1 truncate text-[20px] font-semibold tracking-[-0.01em] tabular-nums sm:text-[22px]", i === 0 && "text-[#3A0CE3]")}>{valor}</p>
            <p className="truncate text-[12px] text-[#A3A0B8]">{detalle}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Distribución por plan */}
        <section className={cn(TARJETA, "flex flex-col overflow-hidden xl:sticky xl:top-6 xl:order-2")}>
          <header className="px-6 pt-6 pb-4">
            <h2 className="text-[17px] font-semibold tracking-tight">Distribución por plan</h2>
            <p className="text-[13px] text-[#8D89A6]">Comités e ingreso de cada plan</p>
          </header>
          <div className="mx-6 flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-[#F0EEF8]">
            {planes
              .filter((p) => p.ingreso > 0)
              .map((p) => (
                <div key={p.clave} style={{ width: `${(p.ingreso / ingreso) * 100}%`, background: COLOR[p.clave] }} />
              ))}
          </div>
          <ul className="mt-4 border-t border-[#F0EEF8]">
            {planes.map((p) => {
              const abierto = abiertos.includes(p.clave);
              const n = p.comites.length;
              return (
                <li key={p.clave} className="border-b border-[#F0EEF8]">
                  <button
                    type="button"
                    disabled={!n}
                    aria-expanded={abierto}
                    onClick={() => setAbiertos((a) => (abierto ? a.filter((x) => x !== p.clave) : [...a, p.clave]))}
                    className="flex w-full items-center gap-3 px-6 py-3 text-left transition enabled:hover:bg-[#FAF9FE]"
                  >
                    <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: COLOR[p.clave] }} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-semibold">{p.nombre}</span>
                      <span className="block truncate text-[12px] text-[#8D89A6]">
                        {comitesTexto(n)} · {p.socios.toLocaleString("es-CL")} socios
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="block text-[14px] font-semibold tabular-nums">{p.ingreso ? clp(p.ingreso) : "—"}</span>
                      <span className="block text-[11.5px] text-[#A3A0B8] tabular-nums">{ingreso ? Math.round((p.ingreso / ingreso) * 100) : 0} %</span>
                    </span>
                    <ChevronDown className={cn("size-4 shrink-0 text-[#A3A0B8] transition", !abierto && "-rotate-90", !n && "invisible")} />
                  </button>
                  {abierto && (
                    <ul className="bg-[#FBFAFE] pb-2">
                      {p.comites.map((c) => (
                        <li key={c.id} className="flex items-center gap-2 py-1.5 pr-6 pl-[46px] text-[12.5px]">
                          <span className="min-w-0 flex-1 truncate">{c.nombre}</span>
                          <span className={cn("shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-semibold", PAGO[c.pago].chip)}>{PAGO[c.pago].texto}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="flex items-center justify-between bg-[#FAF9FE] px-6 py-3.5 text-[14px] font-semibold">
            <span>Total · {comitesTexto(datos.total)}</span>
            <span className="text-[#3A0CE3] tabular-nums">{clp(ingreso)}</span>
          </div>
          {(datos.atrasados.length > 0 || datos.pruebas.length > 0) && (
            <div className="space-y-2 border-t border-[#F0EEF8] p-4">
              {datos.atrasados.map((nombre) => (
                <p key={nombre} className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-[12.5px] font-semibold text-rose-700">
                  <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
                  <span className="min-w-0">{nombre} con pago atrasado</span>
                </p>
              ))}
              {datos.pruebas.map((p) => (
                <p key={p.nombre} className="flex items-center gap-2 rounded-xl bg-[#F3F2F8] px-3 py-2 text-[12.5px] font-semibold text-[#5E5A78]">
                  <Gift className="size-3.5 shrink-0" aria-hidden />
                  <span className="min-w-0">
                    Prueba de {p.nombre} vence el {p.vence}
                  </span>
                </p>
              ))}
            </div>
          )}
        </section>

        {/* Qué incluye cada plan */}
        <section className={cn(TARJETA, "min-w-0 overflow-hidden xl:order-1")}>
          <header className="px-6 pt-6 pb-4 sm:px-7">
            <h2 className="text-[17px] font-semibold tracking-tight">Qué incluye cada plan</h2>
            <p className="text-[13px] text-[#8D89A6]">Comparación de precio, límites y módulos.</p>
          </header>

          {/* Escritorio: matriz */}
          <div className="hidden md:block">
            <table className="w-full table-fixed text-[13.5px]">
              <colgroup>
                <col className="w-[32%]" />
                {planes.map((p) => (
                  <col key={p.clave} />
                ))}
              </colgroup>
              <thead>
                <tr className="border-y border-[#F0EEF8] align-bottom">
                  <th className="py-3 pl-7 text-left text-[11px] font-semibold tracking-[0.07em] text-[#8D89A6] uppercase">Característica</th>
                  {planes.map((p) => (
                    <th key={p.clave} className="px-2 py-3 text-center font-normal">
                      <p className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#6E6A86]">
                        <span aria-hidden className="size-2 rounded-full" style={{ background: COLOR[p.clave] }} />
                        {p.nombre}
                      </p>
                      <p className="mt-0.5 text-[16px] font-semibold text-[#16132B] tabular-nums">{p.precio}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#F0EEF8]">
                  <td className="py-2.5 pl-7 text-[#5E5A78]">Socios máximos</td>
                  {planes.map((p) => (
                    <td key={p.clave} className="px-2 text-center font-semibold tabular-nums">
                      {p.limiteSocios ?? "Ilimitados"}
                    </td>
                  ))}
                </tr>
                {categorias.map((categoria) => [
                  <tr key={categoria} className="border-y border-[#F0EEF8] bg-[#FAF9FE]">
                    <td colSpan={planes.length + 1} className="px-7 py-2 text-[11px] font-semibold tracking-[0.08em] text-[#8D89A6] uppercase">
                      {categoria}
                    </td>
                  </tr>,
                  ...caracteristicas
                    .filter((c) => c.categoria === categoria)
                    .map((c) => (
                      <tr key={c.nombre} className="border-b border-[#F5F3FA] hover:bg-[#FBFAFE]">
                        <td className="py-1.5 pl-7">{c.nombre}</td>
                        {planes.map((p) => (
                          <td key={p.clave} className="px-2 text-center">
                            <Celda on={c.en[p.clave]} />
                          </td>
                        ))}
                      </tr>
                    )),
                ])}
                <tr className="border-t border-[#E9E7F5] bg-[#FAF9FE]">
                  <td className="py-3.5 pl-7 font-semibold">Comités en el plan</td>
                  {planes.map((p) => (
                    <td key={p.clave} className="px-2 text-center text-[15px] font-semibold tabular-nums">
                      {p.comites.length}
                    </td>
                  ))}
                </tr>
                <tr className="bg-[#FAF9FE]">
                  <td className="pb-4 pl-7 font-semibold">Ingreso mensual</td>
                  {planes.map((p) => (
                    <td key={p.clave} className="px-2 pb-4 text-center font-semibold text-[#3A0CE3] tabular-nums">
                      {p.ingreso ? clp(p.ingreso) : "—"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Teléfono: un plan a la vez */}
          <div className="border-t border-[#F0EEF8] md:hidden">
            <div className="flex flex-wrap gap-1 px-5 py-3">
              {planes.map((p) => (
                <button
                  key={p.clave}
                  type="button"
                  aria-pressed={elegido.clave === p.clave}
                  onClick={() => setMovil(p.clave)}
                  className={cn("h-8 rounded-lg px-3 text-[12.5px] font-semibold", elegido.clave === p.clave ? "bg-[#110C2E] text-white" : "bg-[#F3F2F8] text-[#5E5A78]")}
                >
                  {p.nombre}
                </button>
              ))}
            </div>
            <div className="flex items-end justify-between border-y border-[#F0EEF8] bg-[#FAF9FE] px-5 py-4">
              <div>
                <p className="text-[12px] text-[#8D89A6]">Precio</p>
                <p className="text-[22px] font-semibold tabular-nums">{elegido.precio}</p>
              </div>
              <div className="text-right">
                <p className="text-[12px] text-[#8D89A6]">Socios máximos</p>
                <p className="text-[15px] font-semibold">{elegido.limiteSocios ?? "Ilimitados"}</p>
              </div>
            </div>
            {categorias.map((categoria) => (
              <div key={categoria}>
                <p className="px-5 pt-4 pb-1 text-[11px] font-semibold tracking-[0.08em] text-[#8D89A6] uppercase">{categoria}</p>
                <ul>
                  {caracteristicas
                    .filter((c) => c.categoria === categoria)
                    .map((c) => (
                      <li key={c.nombre} className="flex items-center justify-between gap-3 px-5 py-2.5 text-[13.5px]">
                        <span className={cn(!c.en[elegido.clave] && "text-[#A3A0B8]")}>{c.nombre}</span>
                        <span className="shrink-0">
                          <Celda on={c.en[elegido.clave]} />
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
            <div className="mt-4 flex justify-between border-t border-[#F0EEF8] bg-[#FAF9FE] px-5 py-3.5 text-[13.5px] font-semibold">
              <span>{comitesTexto(elegido.comites.length)}</span>
              <span className="text-[#3A0CE3] tabular-nums">{clp(elegido.ingreso)} / mes</span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
