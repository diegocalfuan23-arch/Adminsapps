"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { llamarFacilapr } from "@/lib/facilapr";

export type DatosComite = {
  nombre: string;
  rut: string;
  comuna: string;
  responsable: string;
  cargo: string;
  email: string;
  plan: "BASICO" | "ESTANDAR" | "PREMIUM";
};

export type ResultadoCrearComite =
  | {
      ok: true;
      comite: { nombre: string; rut: string; comuna: string; plan: string };
      usuario: { nombre: string; email: string; cargo: string };
      clave: string;
    }
  | { error: string; campo?: string };

/**
 * Crea un comité y su administrador en Facilapr.
 *
 * El panel NUNCA escribe en la base de Facilapr (la conexión es de solo lectura,
 * garantizada por Postgres): le pide a Facilapr que lo haga por su endpoint
 * interno, que es quien conoce sus reglas de cuentas. El secreto compartido
 * viaja solo de servidor a servidor, nunca al navegador.
 */
export async function crearComite(
  datos: DatosComite
): Promise<ResultadoCrearComite> {
  const sesion = await auth.api.getSession({ headers: await headers() });
  if (!sesion) return { error: "Sin sesión." };

  const url = process.env.FACILAPR_URL;
  const secreto = process.env.FACILAPR_API_SECRET;
  if (!url || !secreto) {
    return {
      error:
        "Falta configurar FACILAPR_URL y FACILAPR_API_SECRET en el panel (ver .env.example).",
    };
  }

  let respuesta: Response;
  try {
    respuesta = await fetch(new URL("/api/interno/crear-comite", url), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-secret": secreto,
      },
      body: JSON.stringify(datos),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    return {
      error:
        "No pude conectar con Facilapr. Revisa FACILAPR_URL y que el sitio esté en línea.",
    };
  }

  const json = (await respuesta.json().catch(() => null)) as
    | (ResultadoCrearComite & { ok?: boolean })
    | null;

  if (!respuesta.ok || !json || !("ok" in json) || !json.ok) {
    const error =
      json && "error" in json && json.error
        ? json.error
        : `Facilapr respondió ${respuesta.status}.`;
    return {
      error:
        respuesta.status === 401
          ? "Facilapr rechazó el secreto: revisa que FACILAPR_API_SECRET coincida con SUPERADMIN_API_SECRET."
          : error,
      campo: json && "campo" in json ? json.campo : undefined,
    };
  }

  revalidatePath("/facilapr");
  revalidatePath("/facilapr/comites");
  return json;
}

/**
 * Cambia la dirección (slug) de un comité. Como todo lo demás, la escritura la
 * hace Facilapr por su API interna, con sus mismas reglas (formato, palabras
 * reservadas y que no la use otro comité).
 */
export async function cambiarSlugComite(
  aprId: string,
  slug: string
): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  const sesion = await auth.api.getSession({ headers: await headers() });
  if (!sesion) return { ok: false, error: "Sin sesión." };

  const r = await llamarFacilapr<{ slug: string }>("/api/interno/slug", {
    aprId,
    slug,
  });
  if (!r.ok) return { ok: false, error: r.error };

  revalidatePath("/facilapr/direcciones");
  revalidatePath("/facilapr/comites");
  return { ok: true, slug: r.datos.slug };
}

/**
 * Cambia el plan de un comité. Como todo lo demás, la escritura la hace
 * Facilapr por su API interna: el panel no escribe en su base.
 */
export async function cambiarPlanComite(
  aprId: string,
  plan: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const sesion = await auth.api.getSession({ headers: await headers() });
  if (!sesion) return { ok: false, error: "Sin sesión." };

  if (!["BASICO", "ESTANDAR", "PREMIUM"].includes(plan)) {
    return { ok: false, error: "Plan no válido." };
  }

  const r = await llamarFacilapr<{ plan: string }>("/api/interno/plan", { aprId, plan });
  if (!r.ok) return { ok: false, error: r.error };

  revalidatePath("/facilapr/comites");
  revalidatePath("/facilapr/direcciones");
  return { ok: true };
}
