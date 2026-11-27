import { comitesAsistente, instruccionesGenerales, MAXIMO_INSTRUCCIONES } from "@/lib/asistente";
import { hace } from "@/lib/tiempo";
import { AsistenteGenerales } from "@/components/consola/asistente-generales";
import { TARJETA } from "@/components/consola/piezas";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const CHIP = "rounded-md px-2 py-0.5 text-[12px] font-semibold";

export default async function AsistentePage() {
  let datos: [Awaited<ReturnType<typeof instruccionesGenerales>>, Awaited<ReturnType<typeof comitesAsistente>>];
  try {
    datos = await Promise.all([instruccionesGenerales(), comitesAsistente()]);
  } catch (e) {
    console.error("Asistente:", e);
    const causa = (e as { cause?: { message?: string } }).cause?.message ?? (e as Error).message;
    return <p className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">No se pudo leer la base de Facilapr: {causa}</p>;
  }
  const [generales, comites] = datos;
  const conInstrucciones = comites.filter((c) => c.instrucciones).length;

  return (
    <>
      <h1 className="text-[28px] font-semibold tracking-[-0.025em] sm:text-[32px]">Asistente</h1>

      <div className="mt-6 grid items-start gap-4 xl:grid-cols-12">
        <section className={cn(TARJETA, "p-6 sm:p-7 xl:col-span-5")}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-[17px] font-semibold tracking-tight">Instrucciones generales</h2>
            {generales?.fecha && <span className="text-[12.5px] text-[#75718F]">{hace(generales.fecha)}</span>}
          </div>
          <p className="text-[13px] text-[#75718F]">Para todos los comités</p>
          {generales === null ? (
            <p className="mt-4 rounded-xl bg-[#F7F6FB] px-4 py-3 text-[13.5px] text-[#5E5A78]">Falta ejecutar el SQL en la base de Facilapr.</p>
          ) : (
            <AsistenteGenerales inicial={generales.texto} maximo={MAXIMO_INSTRUCCIONES} />
          )}
        </section>

        <section className={cn(TARJETA, "p-6 sm:p-7 xl:col-span-7")}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-[17px] font-semibold tracking-tight">De cada comité</h2>
            <span className="rounded-full bg-[#EAE6FF] px-2.5 py-1 text-[12px] font-semibold text-[#3A0CE3]">
              {conInstrucciones} de {comites.length} con instrucciones
            </span>
          </div>
          {comites.length === 0 ? (
            <p className="py-10 text-center text-[13.5px] text-[#75718F]">Todavía no hay comités.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {comites.map((c) => (
                <li key={c.id} className="rounded-2xl bg-[#F7F6FB] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold">{c.nombre}</p>
                      <p className="text-[12.5px] text-[#75718F]">
                        {c.slug ? `${c.slug}.facilapr.cl` : "Sin dirección"}
                        {c.respuestas > 0 && ` · ${c.respuestas} ${c.respuestas === 1 ? "respuesta" : "respuestas"} este mes`}
                      </p>
                    </div>
                    {!c.conIa ? (
                      <span className={cn(CHIP, "bg-white text-[#75718F]")}>Su plan no incluye IA</span>
                    ) : c.encendida ? (
                      <span className={cn(CHIP, "bg-[#EEEAFF] text-[#3A0CE3]")}>IA del chat encendida</span>
                    ) : (
                      <span className={cn(CHIP, "bg-white text-[#75718F]")}>IA del chat apagada</span>
                    )}
                  </div>
                  {c.instrucciones ? (
                    <p className="mt-3 rounded-xl bg-white p-3 text-[13.5px] leading-relaxed break-words whitespace-pre-wrap">{c.instrucciones}</p>
                  ) : (
                    <p className="mt-2 text-[12.5px] text-[#75718F]">Sin instrucciones</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
