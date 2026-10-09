"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { llamarFacilapr } from "@/lib/facilapr";

export type AccionConsulta =
  | { accion: "responder"; consultaId: string; asunto: string; mensaje: string }
  | { accion: "marcar" | "descartar" | "reabrir"; consultaId: string; nota?: string };

export type ResultadoConsulta = { ok: true } | { error: string };

/**
 * Responde o gestiona una consulta del formulario de contacto. El correo y el
 * cambio de estado los hace Facilapr (ver /api/interno/consultas): este panel
 * solo le pide la acción.
 */
export async function gestionarConsulta(
  datos: AccionConsulta
): Promise<ResultadoConsulta> {
  const sesion = await auth.api.getSession({ headers: await headers() });
  if (!sesion) return { error: "Sin sesión." };

  const r = await llamarFacilapr("/api/interno/consultas", datos);
  if (!r.ok) return { error: r.error };

  revalidatePath("/consultas");
  revalidatePath("/facilagua");
  return { ok: true };
}
