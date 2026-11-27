import { ajustesPublicados, comitesAsistente } from "@/lib/asistente";
import { AJUSTES_INICIALES } from "@/lib/asistente-comun";
import { AsistenteVista } from "@/components/consola/asistente/vista";

export const dynamic = "force-dynamic";

export default async function AsistentePage() {
  let datos: [Awaited<ReturnType<typeof ajustesPublicados>>, Awaited<ReturnType<typeof comitesAsistente>>];
  try {
    datos = await Promise.all([ajustesPublicados(), comitesAsistente()]);
  } catch (e) {
    console.error("Asistente:", e);
    const causa = (e as { cause?: { message?: string } }).cause?.message ?? (e as Error).message;
    return <p className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">No se pudo leer la base de Facilapr: {causa}</p>;
  }
  const [ajustes, comites] = datos;

  return <AsistenteVista ajustes={ajustes ?? AJUSTES_INICIALES} comites={comites} listo={ajustes !== null} />;
}
