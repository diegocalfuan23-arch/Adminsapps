import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Marco } from "@/components/consola/marco";
import { avisosMenu } from "@/lib/consola";

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

  const avisos = await avisosMenu();

  return (
    <Marco avisos={avisos} usuario={sesion.user.name || "Administrador"}>
      {children}
    </Marco>
  );
}
