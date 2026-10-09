"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

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
