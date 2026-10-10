import { ExternalLink } from "lucide-react";
import { CopiarTexto } from "@/components/copiar-texto";
import { EditarSlug } from "@/components/editar-slug";
import { direccionesFacilapr } from "@/lib/metricas";

export const dynamic = "force-dynamic";

const PLAN: Record<string, string> = {
  BASICO: "Básico",
  ESTANDAR: "Estándar",
  PREMIUM: "Premium",
};

export default async function DireccionesPage() {
  const comites = await direccionesFacilapr();
  const base = process.env.FACILAPR_URL ?? "https://facilapr.cl";

  const conSlug = comites.filter((c) => c.slug).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Enlaces</h1>
        <p className="mt-1 text-sm text-black/55 dark:text-white/55">
          El slug de cada comité (su nombre dentro de Facilapr, editable) y el enlace de su portal de socios.{" "}
          {conSlug} de {comites.length} tienen slug.
        </p>
      </div>

      {comites.length === 0 ? (
        <p className="rounded-xl border border-dashed border-black/[0.12] p-6 text-center text-sm text-black/40 dark:border-white/[0.15] dark:text-white/40">
          Todavía no hay comités.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-black/[0.08] dark:border-white/[0.12]">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-black/[0.08] text-left font-mono text-[0.7rem] tracking-[0.08em] text-black/45 uppercase dark:border-white/[0.12] dark:text-white/45">
                <th className="px-4 py-3 font-medium">Comité</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Portal de socios</th>
                <th className="px-4 py-3 font-medium">Sitio</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 text-right font-medium">Cuentas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
              {comites.map((c) => {
                const portal = c.slug
                  ? new URL(`/${c.slug}/cuenta/entrar`, base).toString()
                  : null;
                return (
                  <tr key={c.id}>
                    <td className="px-4 py-3 font-medium">{c.nombre.trim()}</td>
                    <td className="px-4 py-3">
                      <EditarSlug aprId={c.id} slug={c.slug} />
                    </td>
                    <td className="px-4 py-3">
                      {portal ? (
                        <span className="inline-flex items-center gap-1">
                          <a
                            href={portal}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-[0.78rem] text-black/70 hover:underline dark:text-white/70"
                          >
                            {portal.replace(/^https?:\/\//, "")}
                            <ExternalLink className="size-3" />
                          </a>
                          <CopiarTexto texto={portal} etiqueta="Copiar el enlace del portal" />
                        </span>
                      ) : (
                        <span className="text-black/30 dark:text-white/30">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-black/60 dark:text-white/60">
                      {c.dominioPropio
                        ? `Dominio propio · ${c.dominioPropio}`
                        : c.sitioPublicado
                          ? "Publicado"
                          : "Borrador"}
                    </td>
                    <td className="px-4 py-3 text-black/60 dark:text-white/60">
                      {PLAN[c.plan] ?? c.plan}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">
                      {c.conCuenta}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
