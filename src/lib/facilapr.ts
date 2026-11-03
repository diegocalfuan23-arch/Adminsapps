/**
 * El panel NUNCA escribe en la base de Facilapr (la conexión es de solo lectura,
 * garantizada por Postgres): cuando hay que cambiar algo, se lo pide a Facilapr
 * por su API interna, que es quien conoce sus reglas. El secreto compartido viaja
 * solo de servidor a servidor, nunca al navegador.
 */
export type RespuestaFacilapr<T> =
  | { ok: true; datos: T }
  | { ok: false; error: string; campo?: string };

export function llamarFacilapr<T>(
  ruta: string,
  cuerpo: unknown
): Promise<RespuestaFacilapr<T>> {
  return pedirAFacilapr<T>(ruta, {
    headers: { "content-type": "application/json" },
    body: JSON.stringify(cuerpo),
  });
}

/** Igual que llamarFacilapr, pero para enviar un archivo (multipart). */
export function subirAFacilapr<T>(
  ruta: string,
  formulario: FormData
): Promise<RespuestaFacilapr<T>> {
  return pedirAFacilapr<T>(ruta, { body: formulario });
}

async function pedirAFacilapr<T>(
  ruta: string,
  { headers, body }: { headers?: Record<string, string>; body: BodyInit }
): Promise<RespuestaFacilapr<T>> {
  const url = process.env.FACILAPR_URL;
  const secreto = process.env.FACILAPR_API_SECRET;
  if (!url || !secreto) {
    return {
      ok: false,
      error:
        "Falta configurar FACILAPR_URL y FACILAPR_API_SECRET en el panel (ver .env.example).",
    };
  }

  let respuesta: Response;
  try {
    respuesta = await fetch(new URL(ruta, url), {
      method: "POST",
      headers: { ...headers, "x-api-secret": secreto },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(25_000),
    });
  } catch {
    return {
      ok: false,
      error:
        "No pude conectar con Facilapr. Revisa FACILAPR_URL y que el sitio esté en línea.",
    };
  }

  const json = (await respuesta.json().catch(() => null)) as
    | (Record<string, unknown> & { ok?: boolean; error?: string; campo?: string })
    | null;

  if (respuesta.status === 401) {
    return {
      ok: false,
      error:
        "Facilapr rechazó el secreto: revisa que FACILAPR_API_SECRET coincida con SUPERADMIN_API_SECRET.",
    };
  }
  if (!respuesta.ok || !json?.ok) {
    return {
      ok: false,
      error: json?.error ?? `Facilapr respondió ${respuesta.status}.`,
      campo: json?.campo,
    };
  }

  return { ok: true, datos: json as T };
}
