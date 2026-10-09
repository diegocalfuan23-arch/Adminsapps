import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";

/**
 * Todas las páginas del panel cuelgan de aquí, así que la sesión se valida
 * una sola vez. `src/proxy.ts` ya bloquea por cookie antes de llegar, pero
 * esta es la verificación real: consulta la sesión contra la base.
 */
export default async function PanelLayout({
  children,
}: LayoutProps<"/">) {
  const sesion = await auth.api.getSession({ headers: await headers() });
  if (!sesion) redirect("/entrar");

  return (
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      <Sidebar />
      <main className="min-w-0 flex-1 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,#e4e4e7,#f4f4f5_70%)] px-6 py-8 md:px-10 dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,#27272a,#09090b_70%)]">
        {children}
      </main>
    </div>
  );
}
