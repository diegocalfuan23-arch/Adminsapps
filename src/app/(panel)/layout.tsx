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
      <main className="min-w-0 flex-1 px-6 py-8 md:px-10">{children}</main>
    </div>
  );
}
