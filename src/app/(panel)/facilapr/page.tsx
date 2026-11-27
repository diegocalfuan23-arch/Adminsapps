import Link from "next/link";
import { headers } from "next/headers";
import { ArrowDownRight, ArrowUpRight, Check, Gauge, Hourglass, Inbox, Sparkles, Users, type LucideIcon } from "lucide-react";
import { auth } from "@/lib/auth";
import { comitesConsola, comitesQueBuscan, consultasNuevas, novedades, pruebaPorVencer, seriesConsola, type ComiteConsola } from "@/lib/consola";
import { diaEnChile, diasDesde, diasHasta, diasParaFinDeMes, hace, mesCorto, nombreMes, ultimosMeses } from "@/lib/tiempo";
import { Buscador } from "@/components/consola/buscador";
import { Campana } from "@/components/consola/campana";
import { Anillo, Area, ESTADO, ESTADOS, TARJETA } from "@/components/consola/piezas";
import { TablaComites } from "@/components/consola/tabla-comites";
import { CrearComite } from "@/components/crear-comite";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const numero = new Intl.NumberFormat("es-CL");
const decimal = new Intl.NumberFormat("es-CL", { maximumFractionDigits: 1 });
const plural = (n: number, uno: string, varios: string) => `${numero.format(n)} ${n === 1 ? uno : varios}`;
const buscarComite = (nombre: string) => `/facilapr/comites?q=${encodeURIComponent(nombre)}`;

type Pendiente = { id: string; icono: LucideIcon; titulo: string; detalle: string; accion: string; href: string };

/** El enlace de WhatsApp a un teléfono chileno, o null si no se puede armar. */
function whatsapp(telefono: string | null, mensaje: string) {
  const digitos = (telefono ?? "").replace(/\D/g, "");
  const completo = digitos.length === 9 ? `56${digitos}` : digitos.length === 11 && digitos.startsWith("56") ? digitos : null;
  return completo ? `https://wa.me/${completo}?text=${encodeURIComponent(mensaje)}` : null;
}

/** El comité con más socios que no ha cargado lecturas este mes. */
function sugerencia(comites: ComiteConsola[], mes: string, faltan: number) {
  const c = comites.filter((x) => x.socios > 0 && x.estado === "sin-lecturas").sort((a, b) => b.socios - a.socios)[0];
  if (!c) return null;
  const dias = c.ultimaLectura ? diasDesde(c.ultimaLectura) : null;
  const resto = faltan === 0 ? `Hoy termina ${mes}` : `Quedan ${plural(faltan, "día", "días")} de ${mes}`;
  const carga = dias === null ? "Nunca ha cargado lecturas." : dias === 0 ? "Cargó lecturas hoy." : `Su última carga fue hace ${plural(dias, "día", "días")}.`;
  return {
    titulo: `${c.nombre} no ha cargado lecturas en ${mes}.`,
    detalle: `${resto} y tiene ${plural(c.socios, "socio", "socios")}. ${carga}`,
    whatsapp: whatsapp(c.telefono, `Hola, soy Diego, de Facilapr. Vi que en ${mes} su comité todavía no ha cargado lecturas. ¿Necesitan ayuda?`),
    ficha: buscarComite(c.nombre),
  };
}

async function cargar() {
  const [comites, series, consultas, buscados, recientes] = await Promise.all([comitesConsola(), seriesConsola(), consultasNuevas(), comitesQueBuscan(), novedades()]);
  return { comites, series, consultas, buscados, recientes };
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
  const { comites, series, consultas, buscados, recientes } = datos;

  const hoy = diaEnChile();
  const mes = nombreMes(hoy.slice(0, 7));
  const faltan = diasParaFinDeMes(hoy);
  const mesAnterior = nombreMes(ultimosMeses(2, hoy)[0]);

  const totalSocios = comites.reduce((s, c) => s + c.socios, 0);
  const totalLeidos = comites.reduce((s, c) => s + c.leidos, 0);
  const avance = totalSocios > 0 ? Math.round((totalLeidos / totalSocios) * 100) : 0;
  const comitesNuevos = comites.filter((c) => c.alta === hoy.slice(0, 7)).length;
  const ultimo = series.meses.length - 1;
  const sociosNuevos = series.socios[ultimo] - series.socios[ultimo - 1];
  const boletasMes = series.boletas[ultimo];
  const boletasAntes = series.boletas[ultimo - 1];
  const variacion = boletasAntes > 0 ? ((boletasMes - boletasAntes) / boletasAntes) * 100 : null;
  const Flecha = variacion !== null && variacion < 0 ? ArrowDownRight : ArrowUpRight;
  const maximoBoletas = Math.max(1, ...series.boletas);
  const grupos = ESTADOS.map((e) => ({ estado: e, n: comites.filter((c) => c.estado === e).length, color: ESTADO[e].color }));
  const aviso = sugerencia(comites, mes, faltan);

  const pendientes: Pendiente[] = [
    ...comites
      .filter((c) => c.pendientes > 0)
      .map((c) => ({ id: `l-${c.id}`, icono: Gauge, titulo: c.nombre, detalle: `${plural(c.pendientes, "lectura", "lecturas")} por aprobar`, accion: "Ver", href: "/facilapr/lecturas" })),
    ...comites
      .filter((c) => pruebaPorVencer(c.pruebaHasta))
      .map((c) => {
        const dias = diasHasta(c.pruebaHasta!);
        const cuando = dias <= 1 ? "Su prueba termina en menos de un día" : `Su prueba termina en ${dias} días`;
        const detalle = [cuando, c.comuna, plural(c.socios, "socio", "socios")].filter(Boolean).join(" · ");
        return { id: `p-${c.id}`, icono: Hourglass, titulo: c.nombre, detalle, accion: "Revisar", href: buscarComite(c.nombre) };
      }),
    ...consultas.map((c) => ({ id: `q-${c.id}`, icono: Inbox, titulo: c.nombre, detalle: c.mensaje?.trim() || c.apr, accion: "Responder", href: "/consultas" })),
  ];

  const nombrePila = (sesion?.user.name ?? "").trim().split(/\s+/)[0];

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.025em] sm:text-[32px]">Hola{nombrePila ? `, ${nombrePila}` : ""}</h1>
          <p className="text-[14.5px] text-[#75718F]">Así va FacilAPR este mes.</p>
        </div>
        {/* Al abrir el formulario de comité nuevo (o mostrar su clave), la fila ocupa todo el ancho. */}
        <div className="flex w-full flex-wrap items-center gap-2 has-[dl]:w-full has-[select]:w-full sm:w-auto">
          <Buscador />
          <Campana novedades={recientes} className="hidden lg:block" />
          <CrearComite urlLogin={process.env.FACILAPR_URL ? direccion("/login") : null} />
        </div>
      </header>

      <div className="mt-6 grid gap-4 xl:grid-cols-12">
        <section className="relative flex flex-col overflow-hidden rounded-[28px] bg-gradient-to-br from-[#3A0CE3] via-[#4A22EE] to-[#6B4BFF] p-6 text-white shadow-[0_20px_50px_-14px_rgba(58,12,227,0.5)] sm:p-7 xl:col-span-8">
          <div aria-hidden className="pointer-events-none absolute -top-28 -right-20 size-80 rounded-full border-[40px] border-white/[0.06]" />
          <div aria-hidden className="pointer-events-none absolute right-48 -bottom-32 size-64 rounded-full bg-white/[0.05]" />
          <div className="relative grid flex-1 gap-7 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="flex h-full flex-col justify-between">
              <p className="text-[13px] font-medium text-white/75">Boletas de {mes}</p>
              <div className="mt-2 flex flex-wrap items-end gap-3">
                <span className="text-[56px] leading-none font-semibold tracking-[-0.04em] tabular-nums">{numero.format(boletasMes)}</span>
                {variacion !== null && (
                  <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[12.5px] font-semibold">
                    <Flecha className="size-3.5" aria-hidden />
                    {decimal.format(Math.abs(variacion))} % vs. {mesAnterior}
                  </span>
                )}
              </div>
              <div className="mt-7 grid grid-cols-2 divide-x divide-white/15 xl:mt-10">
                {[
                  ["Comités", numero.format(comites.length), comitesNuevos > 0 ? `+${comitesNuevos} en ${mes}` : `sin altas en ${mes}`],
                  ["Lecturas", `${avance} %`, `${numero.format(totalLeidos)} de ${numero.format(totalSocios)} medidores`],
                ].map(([titulo, valor, pie]) => (
                  <div key={titulo} className="px-4 first:pl-0">
                    <p className="text-[12.5px] text-white/75">{titulo}</p>
                    <p className="mt-1 text-[26px] leading-none font-semibold tabular-nums">{valor}</p>
                    <p className="mt-1.5 text-[12px] text-white/70">{pie}</p>
                  </div>
                ))}
              </div>
            </div>
            <ul aria-label="Boletas por mes" className="flex h-36 items-end gap-2.5 xl:h-44">
              {series.boletas.map((v, i) => (
                <li key={series.meses[i]} title={`${plural(v, "boleta", "boletas")} en ${nombreMes(series.meses[i])}`} className="flex h-full flex-1 flex-col items-center gap-2 sm:w-10 sm:flex-none">
                  <div className="flex min-h-0 w-full flex-1 items-end">
                    <div className={cn("w-full rounded-lg", i === ultimo ? "bg-white" : "bg-white/20")} style={{ height: `${Math.max(2, (v / maximoBoletas) * 100)}%` }} />
                  </div>
                  <span className={cn("text-[11.5px]", i === ultimo ? "font-semibold text-white" : "text-white/70")}>{mesCorto(series.meses[i])}</span>
                  <span className="sr-only">{numero.format(v)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="flex flex-col rounded-[28px] bg-[#E9E4FF] p-6 sm:p-7 xl:col-span-4">
          <div className="flex items-center justify-between">
            <span className="grid size-10 place-items-center rounded-2xl bg-white/70 text-[#3A0CE3]">
              <Users className="size-[18px]" aria-hidden />
            </span>
            {sociosNuevos > 0 && (
              <span title={`Socios nuevos en ${mes}`} className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-[12px] font-semibold text-[#3A0CE3]">
                <ArrowUpRight className="size-3.5" aria-hidden />+{numero.format(sociosNuevos)}
              </span>
            )}
          </div>
          <p className="mt-5 text-[13.5px] text-[#4E477A]">Socios en la plataforma</p>
          <p className="mt-1 text-[44px] leading-none font-semibold tracking-[-0.03em] tabular-nums">{numero.format(totalSocios)}</p>
          <div className="mt-auto pt-5">
            <Area datos={series.socios} />
          </div>
          <div aria-hidden className="mt-1 flex justify-between text-[11px] text-[#5F588A]">
            {series.meses.map((m) => (
              <span key={m}>{mesCorto(m)}</span>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-12">
        <section className={cn(TARJETA, "min-w-0 p-6 sm:p-7 xl:col-span-5")}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[17px] font-semibold tracking-tight">Por hacer</h2>
            {pendientes.length > 0 && (
              <span className="rounded-full bg-[#EAE6FF] px-2.5 py-1 text-[12px] font-semibold text-[#3A0CE3]">{plural(pendientes.length, "pendiente", "pendientes")}</span>
            )}
          </div>
          {pendientes.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center text-[13.5px] text-[#75718F]">
              <span className="grid size-10 place-items-center rounded-full bg-[#EAE6FF] text-[#3A0CE3]">
                <Check className="size-5" aria-hidden />
              </span>
              Nada pendiente
            </div>
          ) : (
            <ul className="mt-4 max-h-[320px] space-y-2 overflow-y-auto">
              {pendientes.map((p) => (
                <li key={p.id} className="flex items-center gap-3 rounded-2xl bg-[#F7F6FB] p-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#3A0CE3] shadow-[0_1px_2px_rgba(20,16,50,0.06)]">
                    <p.icono className="size-[18px]" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold">{p.titulo}</p>
                    <p className="truncate text-[12.5px] text-[#75718F]">{p.detalle}</p>
                  </div>
                  <Link href={p.href} className="inline-flex h-9 shrink-0 items-center rounded-xl bg-[#110C2E] px-3.5 text-[12.5px] font-semibold text-white transition hover:bg-[#241D52]">
                    {p.accion}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={cn(TARJETA, "flex min-w-0 flex-col p-6 sm:p-7 xl:col-span-4")}>
          <h2 className="text-[17px] font-semibold tracking-tight">Lecturas de {mes}</h2>
          <p className="text-[13px] text-[#75718F]">{faltan === 0 ? "Último día del mes" : `${plural(faltan, "día", "días")} para fin de mes`}</p>
          <div className="my-auto flex flex-wrap items-center justify-center gap-6 pt-5">
            <div className="relative shrink-0">
              <Anillo grupos={grupos} />
              <div className="absolute inset-0 grid place-content-center text-center">
                <p className="text-[28px] leading-none font-semibold tracking-tight tabular-nums">{avance}%</p>
                <p className="mt-1 text-[11.5px] text-[#75718F]">leídas</p>
              </div>
            </div>
            <ul className="min-w-[128px] flex-1 space-y-2.5 text-[13px]">
              {grupos.map((g) => (
                <li key={g.estado} className="flex items-center gap-2">
                  <span aria-hidden className={cn("size-2.5 shrink-0 rounded-full", ESTADO[g.estado].punto)} />
                  <span className="flex-1 truncate text-[#5E5A78]">{ESTADO[g.estado].texto}</span>
                  <b className="font-semibold tabular-nums">{g.n}</b>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[28px] bg-[#110C2E] p-6 text-white lg:col-span-2 xl:col-span-3">
          <div aria-hidden className="pointer-events-none absolute -right-16 -bottom-20 size-56 rounded-full bg-[#3A0CE3]/50 blur-[60px]" />
          <span className="relative inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[12px] font-semibold">
            <Sparkles className="size-3.5 text-[#B8AAFF]" aria-hidden />
            Sugerencia
          </span>
          <p className="relative mt-5 text-[16px] leading-snug font-semibold">{aviso ? aviso.titulo : `Todos los comités han cargado lecturas en ${mes}.`}</p>
          {aviso && (
            <>
              <p className="relative mt-2 text-[13px] leading-relaxed text-white/70">{aviso.detalle}</p>
              {aviso.whatsapp ? (
                <a href={aviso.whatsapp} target="_blank" rel="noreferrer" className="relative mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-[13px] font-semibold text-[#110C2E]">
                  Avisar al comité
                  <ArrowUpRight className="size-4" aria-hidden />
                </a>
              ) : (
                <Link href={aviso.ficha} className="relative mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-[13px] font-semibold text-[#110C2E]">
                  Ver comité
                  <ArrowUpRight className="size-4" aria-hidden />
                </Link>
              )}
            </>
          )}
        </section>
      </div>

      <div className="mt-4">
        <TablaComites
          mes={mes}
          comites={comites.map((c) => ({
            id: c.id,
            nombre: c.nombre,
            comuna: c.comuna,
            slug: c.slug,
            portal: c.slug ? direccion(`/${c.slug}/cuenta/entrar`) : null,
            estado: c.estado,
            socios: c.socios,
            leidos: c.leidos,
          }))}
        />
      </div>

      {buscados.comites > 0 && (
        <section className={cn(TARJETA, "mt-4 p-6 sm:p-7")}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[17px] font-semibold tracking-tight">Comités que buscan</h2>
            <span className="rounded-full bg-[#EAE6FF] px-2.5 py-1 text-[12px] font-semibold text-[#3A0CE3]">
              {plural(buscados.comites, "comité", "comités")} · {plural(buscados.busquedas, "búsqueda", "búsquedas")}
            </span>
          </div>
          <ul className="mt-4 grid gap-2 md:grid-cols-3">
            {buscados.recientes.map((b) => (
              <li key={`${b.nombre}-${b.comuna}`} className="min-w-0 rounded-2xl bg-[#F7F6FB] p-4">
                <p className="truncate text-[14px] font-semibold">{b.nombre}</p>
                <p className="truncate text-[12.5px] text-[#75718F]">
                  {b.comuna} · {plural(b.veces, "búsqueda", "búsquedas")} · {hace(b.fecha)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
