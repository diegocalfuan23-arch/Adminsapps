import { headers } from "next/headers";
import { CalendarClock, FileText, Gauge, Hourglass, Inbox, SearchCheck, UserPlus } from "lucide-react";
import { auth } from "@/lib/auth";
import {
  actividadReciente,
  comitesConsola,
  comitesQueBuscan,
  consultasNuevas,
  pruebaPorVencer,
  seriesConsola,
  type Evento,
} from "@/lib/consola";
import { diaEnChile, diasParaFinDeMes, fechaLarga, hace, mesCorto, nombreMes, saludo, ultimosMeses } from "@/lib/tiempo";
import { AccionesCabecera } from "@/components/consola/acciones-cabecera";
import { Cifra, ESTADO, Pendiente, TARJETA } from "@/components/consola/piezas";
import { TablaComites } from "@/components/consola/tabla-comites";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const numero = new Intl.NumberFormat("es-CL");

/** «A, B y C», o «A, B y 3 más». */
function enumerar(nombres: string[]) {
  if (nombres.length === 0) return "Nada por ahora";
  if (nombres.length === 1) return nombres[0];
  if (nombres.length > 3) return `${nombres.slice(0, 2).join(", ")} y ${nombres.length - 2} más`;
  return `${nombres.slice(0, -1).join(", ")} y ${nombres[nombres.length - 1]}`;
}

function textoEvento(e: Evento) {
  if (e.tipo === "alta") return { icono: UserPlus, texto: `${e.quien} creó su cuenta` };
  if (e.tipo === "consulta") return { icono: Inbox, texto: `Nueva consulta de ${e.quien} (${e.detalle})` };
  if (e.tipo === "boletas") return { icono: FileText, texto: `${e.quien} emitió ${e.n} ${e.n === 1 ? "boleta" : "boletas"} de ${nombreMes(e.detalle)}` };
  if (e.tipo === "lecturas") return { icono: Gauge, texto: `${e.quien} registró ${e.n} ${e.n === 1 ? "lectura" : "lecturas"} de ${nombreMes(e.detalle)}` };
  return { icono: SearchCheck, texto: `Un socio buscó «${e.quien}», de ${e.detalle}` };
}

async function cargar() {
  const [comites, series, consultas, buscados, actividad] = await Promise.all([comitesConsola(), seriesConsola(), consultasNuevas(), comitesQueBuscan(), actividadReciente()]);
  return { comites, series, consultas, buscados, actividad };
}

export default async function ConsolaPage() {
  const sesion = await auth.api.getSession({ headers: await headers() });
  const base = process.env.FACILAPR_URL ?? "https://facilapr.cl";
  const direccion = (ruta: string) => new URL(ruta, base).toString();

  let datos: Awaited<ReturnType<typeof cargar>>;
  try {
    datos = await cargar();
  } catch (e) {
    console.error("Consola:", e);
    const causa = (e as { cause?: { message?: string } }).cause?.message ?? (e as Error).message;
    return <p className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">No se pudo leer la base de Facilapr: {causa}</p>;
  }
  const { comites, series, consultas, buscados, actividad } = datos;

  const hoy = diaEnChile();
  const mes = hoy.slice(0, 7);
  const faltan = diasParaFinDeMes(hoy);
  const mesAnterior = nombreMes(ultimosMeses(2, hoy)[0]);

  const porAprobar = comites.filter((c) => c.pendientes > 0);
  const pruebas = comites.filter((c) => pruebaPorVencer(c.pruebaHasta));
  const incompletos = comites.filter((c) => c.socios > 0 && c.estado !== "al-dia");
  const pendientes = porAprobar.length + pruebas.length + consultas.length;

  const totalSocios = comites.reduce((s, c) => s + c.socios, 0);
  const totalLeidos = comites.reduce((s, c) => s + c.leidos, 0);
  const avance = totalSocios > 0 ? Math.round((totalLeidos / totalSocios) * 100) : 0;
  const comitesPorMes = series.meses.map((m) => comites.filter((c) => c.alta <= m).length);
  const nuevos = comites.filter((c) => c.alta === mes).length;
  const sociosNuevos = series.socios[5] - series.socios[4];
  const boletasMes = series.boletas[5];
  const boletasAntes = series.boletas[4];
  const variacion = boletasAntes > 0 ? ((boletasMes - boletasAntes) / boletasAntes) * 100 : null;
  const maximoBoletas = Math.max(1, ...series.boletas);

  const nombrePila = (sesion?.user.name ?? "").trim().split(/\s+/)[0];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium text-zinc-500">{fechaLarga()}</p>
          <h1 className="mt-1 text-[26px] font-semibold tracking-tight text-zinc-900 sm:text-[30px]">
            {saludo()}
            {nombrePila ? `, ${nombrePila}` : ""}
          </h1>
          <p className="mt-1 text-[14.5px] text-zinc-500">
            {pendientes === 0 ? "Sin pendientes" : <>Tienes <b className="font-semibold text-zinc-800">{pendientes} {pendientes === 1 ? "pendiente" : "pendientes"}</b></>} · {comites.length}{" "}
            {comites.length === 1 ? "comité" : "comités"}
          </p>
        </div>
        <AccionesCabecera registro={direccion("/registro")} urlLogin={process.env.FACILAPR_URL ? direccion("/login") : null} />
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Cifra titulo="Comités" valor={numero.format(comites.length)} serie={comitesPorMes} cambio={nuevos > 0 ? { texto: `+${nuevos}` } : null} pie={nuevos > 0 ? "este mes" : "sin altas este mes"} />
        <Cifra titulo="Socios activos" valor={numero.format(totalSocios)} serie={series.socios} cambio={sociosNuevos > 0 ? { texto: `+${numero.format(sociosNuevos)}` } : null} pie={sociosNuevos > 0 ? "este mes" : "sin altas este mes"} />
        <Cifra
          titulo={`Boletas de ${nombreMes(mes)}`}
          valor={numero.format(boletasMes)}
          serie={series.boletas}
          cambio={variacion === null || Math.round(variacion) === 0 ? null : { texto: `${variacion > 0 ? "+" : ""}${Math.round(variacion)} %`, baja: variacion < 0 }}
          pie={variacion === null ? "sin boletas el mes anterior" : `vs. ${mesAnterior}`}
        />
        <Cifra titulo="Lecturas del mes" valor={`${avance} %`} serie={series.lecturas} pie={faltan === 0 ? "último día del mes" : `${faltan} ${faltan === 1 ? "día" : "días"} para fin de mes`} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_1fr]">
        <section className={cn(TARJETA, "flex min-w-0 flex-col")}>
          <header className="flex items-center justify-between px-5 pt-5 pb-2">
            <h2 className="text-[15px] font-semibold text-zinc-900">Requiere tu atención</h2>
            <span className={cn("rounded-full px-2.5 py-1 text-[12px] font-semibold ring-1", pendientes > 0 ? "bg-amber-50 text-amber-800 ring-amber-600/15" : "bg-emerald-50 text-emerald-700 ring-emerald-600/15")}>
              {pendientes > 0 ? `${pendientes} ${pendientes === 1 ? "pendiente" : "pendientes"}` : "Al día"}
            </span>
          </header>
          <div className="px-2 pb-2">
            <Pendiente href="/facilapr/lecturas" icono={Gauge} n={porAprobar.length} titulo="Comités con lecturas por aprobar" detalle={enumerar(porAprobar.map((c) => c.nombre))} tono="bg-amber-50 text-amber-700" accion="Ver" />
            <Pendiente href="/facilapr/comites" icono={Hourglass} n={pruebas.length} titulo="Pruebas por vencer" detalle={enumerar(pruebas.map((c) => c.nombre))} tono="bg-[#F1EEFF] text-[#3A0CE3]" accion="Revisar" />
            <Pendiente href="/consultas" icono={Inbox} n={consultas.length} titulo="Consultas sin responder" detalle={enumerar(consultas.map((c) => c.nombre))} tono="bg-sky-50 text-sky-700" accion="Responder" />
          </div>
          <div className="grid gap-px border-t border-zinc-100 bg-zinc-100 sm:grid-cols-2">
            {[
              {
                titulo: `Comités que buscan · ${buscados.comites}`,
                filas: buscados.recientes.map((b) => ({ a: b.nombre, b: `${b.comuna} · ${b.veces} ${b.veces === 1 ? "búsqueda" : "búsquedas"}`, f: hace(b.fecha) })),
                vacio: "Nadie ha buscado un comité.",
              },
              { titulo: "Consultas", filas: consultas.slice(0, 3).map((c) => ({ a: c.nombre, b: c.mensaje?.trim() || c.apr, f: hace(c.fecha) })), vacio: "Todo respondido." },
            ].map((g) => (
              <div key={g.titulo} className="min-w-0 bg-white px-5 py-4">
                <p className="text-[11px] font-semibold tracking-[0.08em] text-zinc-400 uppercase">{g.titulo}</p>
                {g.filas.length === 0 ? (
                  <p className="mt-2 text-[12.5px] text-zinc-500">{g.vacio}</p>
                ) : (
                  <ul className="mt-2 space-y-3">
                    {g.filas.map((x, i) => (
                      <li key={`${x.a}-${i}`} className="min-w-0">
                        <p className="flex justify-between gap-2 text-[13.5px] font-medium text-zinc-900">
                          <span className="truncate">{x.a}</span>
                          <span className="shrink-0 text-[12px] font-normal text-zinc-400">{x.f}</span>
                        </p>
                        <p className="truncate text-[12.5px] text-zinc-500">{x.b}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
          <div className="mt-auto flex items-center gap-3 rounded-b-2xl border-t border-zinc-100 bg-gradient-to-r from-[#F5F2FF] to-white px-5 py-3.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white text-[#3A0CE3] ring-1 ring-[#3A0CE3]/15">
              <CalendarClock className="size-4" aria-hidden />
            </span>
            <p className="min-w-0 flex-1 text-[13px] text-zinc-600">
              <b className="font-semibold text-zinc-900">{faltan === 0 ? `Hoy termina ${nombreMes(mes)}.` : `Quedan ${faltan} ${faltan === 1 ? "día" : "días"} de ${nombreMes(mes)}.`}</b>{" "}
              {incompletos.length === 0 ? "Las lecturas están completas." : `${incompletos.length} ${incompletos.length === 1 ? "comité aún no completa" : "comités aún no completan"} sus lecturas.`}
            </p>
          </div>
        </section>

        <section className={cn(TARJETA, "flex min-w-0 flex-col")}>
          <header className="flex items-center justify-between gap-3 px-5 pt-5 pb-1">
            <div>
              <h2 className="text-[15px] font-semibold text-zinc-900">Lecturas de {nombreMes(mes)}</h2>
              <p className="text-[13px] text-zinc-500">
                {numero.format(totalLeidos)} de {numero.format(totalSocios)} medidores leídos
              </p>
            </div>
            <span className="text-[22px] font-semibold text-zinc-900 tabular-nums">{avance}%</span>
          </header>
          <div className="px-5">
            <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-zinc-100">
              {(["al-dia", "por-aprobar", "cargando"] as const).map((e) => (
                <div key={e} className={ESTADO[e].punto} style={{ width: `${(comites.filter((c) => c.estado === e).length / Math.max(1, comites.length)) * 100}%` }} />
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-zinc-600">
              {(["al-dia", "por-aprobar", "cargando", "sin-lecturas"] as const).map((e) => (
                <span key={e} className="inline-flex items-center gap-1.5">
                  <span aria-hidden className={cn("size-2 rounded-full", ESTADO[e].punto)} />
                  {ESTADO[e].texto} <b className="font-semibold text-zinc-900">{comites.filter((c) => c.estado === e).length}</b>
                </span>
              ))}
            </div>
          </div>
          {incompletos.length === 0 ? (
            <p className="mt-4 border-t border-zinc-100 px-5 py-10 text-center text-[13.5px] text-zinc-500">Todos los comités están al día.</p>
          ) : (
            <ul className="mt-4 max-h-[420px] flex-1 divide-y divide-zinc-100 overflow-y-auto border-t border-zinc-100">
              {incompletos.map((c) => (
                <li key={c.id} className="flex items-center gap-3 px-5 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-medium text-zinc-900">{c.nombre}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
                        <div className={cn("h-full rounded-full", ESTADO[c.estado].punto)} style={{ width: `${Math.min(100, (c.leidos / c.socios) * 100)}%` }} />
                      </div>
                      <span className="w-16 text-right text-[12px] text-zinc-500 tabular-nums">
                        {c.leidos}/{c.socios}
                      </span>
                    </div>
                  </div>
                  <div className="flex w-[124px] shrink-0 justify-end">
                    <span className={cn("rounded-md px-2 py-0.5 text-[11.5px] font-semibold ring-1", ESTADO[c.estado].chip)}>{c.pendientes > 0 ? `${c.pendientes} por aprobar` : ESTADO[c.estado].texto}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-5 grid gap-5">
        <TablaComites
          comites={comites.map((c) => ({
            id: c.id,
            nombre: c.nombre,
            comuna: c.comuna,
            slug: c.slug,
            portal: c.slug ? direccion(`/${c.slug}/cuenta/entrar`) : null,
            estado: c.estado,
            socios: c.socios,
            leidos: c.leidos,
            boletas: c.boletas,
            actividad: hace(c.ultima),
          }))}
        />

        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <section className={cn(TARJETA, "p-5")}>
            <h2 className="text-[15px] font-semibold text-zinc-900">Actividad reciente</h2>
            {actividad.length === 0 ? (
              <p className="mt-4 text-[13px] text-zinc-500">Sin actividad en los últimos 30 días.</p>
            ) : (
              <ol className="relative mt-4 space-y-4 before:absolute before:top-2 before:bottom-2 before:left-[15px] before:w-px before:bg-zinc-200">
                {actividad.map((e, i) => {
                  const { icono: Icono, texto } = textoEvento(e);
                  return (
                    <li key={i} className="relative flex gap-3">
                      <span className="relative grid size-8 shrink-0 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-500">
                        <Icono className="size-3.5" aria-hidden />
                      </span>
                      <div className="min-w-0 pt-0.5">
                        <p className="text-[13px] leading-snug text-zinc-800">{texto}</p>
                        <p className="mt-0.5 text-[12px] text-zinc-400">{hace(e.fecha)}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          <section className={cn(TARJETA, "flex flex-col p-5")}>
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-zinc-900">Boletas por mes</h2>
              <span className="text-[12px] text-zinc-500">últimos 6</span>
            </div>
            <div className="mt-auto flex h-60 items-end gap-2 pt-4">
              {series.boletas.map((v, i) => (
                <div key={series.meses[i]} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="text-[10.5px] text-zinc-500 tabular-nums">{numero.format(v)}</span>
                  <div className={cn("w-full rounded-md", i === series.boletas.length - 1 ? "bg-[#3A0CE3]" : "bg-[#DCD5FF]")} style={{ height: `${Math.max(v > 0 ? 4 : 1, (v / maximoBoletas) * 170)}px` }} />
                  <span className="text-[11px] text-zinc-500">{mesCorto(series.meses[i])}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
