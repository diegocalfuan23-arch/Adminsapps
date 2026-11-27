import { ComitesVista } from "@/components/consola/comites/vista";
import { comitesDetalle } from "@/lib/comites-consola";

export const dynamic = "force-dynamic";

export default async function ComitesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  let comites: Awaited<ReturnType<typeof comitesDetalle>>;
  try {
    comites = await comitesDetalle();
  } catch (e) {
    console.error("Comités:", e);
    const causa = (e as { cause?: { message?: string } }).cause?.message ?? (e as Error).message;
    return <p className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">No se pudo leer la base de Facilapr: {causa}</p>;
  }

  const urlLogin = process.env.FACILAPR_URL ? new URL("/login", process.env.FACILAPR_URL).toString() : null;

  return <ComitesVista key={q} comites={comites} inicial={q} urlLogin={urlLogin} />;
}
