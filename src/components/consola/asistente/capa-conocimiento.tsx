"use client";

import { useState, useTransition } from "react";
import { BookOpen, FileText, Link2, Trash2, Upload, type LucideIcon } from "lucide-react";
import { borrarDocumento, subirDocumento } from "@/app/(panel)/facilapr/acciones";
import { Cabecera, CAMPO } from "@/components/consola/asistente/piezas";
import { MAXIMO_ARCHIVO, type ComiteAsistente, type Documento } from "@/lib/asistente-comun";
import { cn } from "@/lib/utils";

const ICONO: Record<Documento["tipo"], LucideIcon> = { PDF: FileText, Texto: BookOpen, Enlace: Link2 };

/** Los documentos que el asistente consulta para responder. Subir y quitar se aplica al tiro. */
export function CapaConocimiento({ documentos, comites, aviso }: { documentos: Documento[]; comites: ComiteAsistente[]; aviso: (t: string) => void }) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciar] = useTransition();
  const alcance = (id: string | null) => (id ? (comites.find((c) => c.id === id)?.nombre ?? "Comité eliminado") : "Todos los comités");

  function subir(datos: FormData) {
    setError(null);
    const archivo = datos.get("archivo");
    if (archivo instanceof File && archivo.size > MAXIMO_ARCHIVO) {
      setError("El archivo pasa los 3 MB.");
      return;
    }
    iniciar(async () => {
      const r = await subirDocumento(datos);
      if (r.ok) {
        setSubiendo(false);
        aviso("Documento subido");
      } else setError(r.error);
    });
  }

  function quitar(id: string) {
    setError(null);
    iniciar(async () => {
      const r = await borrarDocumento(id);
      if (r.ok) aviso("Documento quitado");
      else setError(r.error);
    });
  }

  return (
    <div>
      <Cabecera icono={BookOpen} titulo="Conocimiento">
        <button
          type="button"
          onClick={() => {
            setSubiendo(!subiendo);
            setError(null);
          }}
          aria-expanded={subiendo}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#110C2E] px-3.5 text-[12.5px] font-semibold text-white"
        >
          <Upload className="size-4" />
          Subir
        </button>
      </Cabecera>

      {subiendo && (
        // onSubmit y no `action`: así, si falla, no se borra lo elegido.
        <form
          onSubmit={(e) => {
            e.preventDefault();
            subir(new FormData(e.currentTarget));
          }}
          className="grid gap-2 border-b border-[#F0EEF8] bg-[#F8F7FC] px-6 py-4 sm:px-8"
        >
          <input
            type="file"
            name="archivo"
            accept=".pdf,.txt,.md"
            aria-label="Archivo PDF o de texto"
            className="w-full text-[13px] file:mr-3 file:h-9 file:rounded-xl file:border-0 file:bg-white file:px-3.5 file:text-[12.5px] file:font-semibold file:ring-1 file:ring-[#E2DEF2]"
          />
          <input type="url" name="enlace" placeholder="o pega un enlace https://" aria-label="Enlace" className={cn(CAMPO, "h-10")} />
          <div className="flex flex-wrap gap-2">
            <select name="aprId" aria-label="Para quién" className={cn(CAMPO, "h-10 min-w-0 flex-1")}>
              <option value="">Todos los comités</option>
              {comites.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
            <button disabled={pendiente} className="h-10 rounded-xl bg-[#3A0CE3] px-5 text-[13px] font-semibold text-white disabled:opacity-50">
              {pendiente ? "Subiendo…" : "Subir"}
            </button>
          </div>
        </form>
      )}

      {error && (
        <p role="alert" className="mx-6 mt-4 rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-700 sm:mx-8">
          {error}
        </p>
      )}

      {documentos.length === 0 ? (
        <p className="px-6 py-10 text-center text-[13px] text-[#A3A0B8]">Sin documentos</p>
      ) : (
        <ul className="divide-y divide-[#F0EEF8]">
          {documentos.map((d) => {
            const Icono = ICONO[d.tipo] ?? FileText;
            return (
              <li key={d.id} className="flex items-center gap-3 px-6 py-3.5 sm:px-8">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#F3F2F8] text-[#5E5A78]">
                  <Icono className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-semibold">{d.titulo}</p>
                  <p className="truncate text-[12px] text-[#8D89A6]">
                    {d.tipo} · {alcance(d.aprId)}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={pendiente}
                  aria-label={`Quitar ${d.titulo}`}
                  onClick={() => quitar(d.id)}
                  className="grid size-8 shrink-0 place-items-center rounded-lg text-[#B4B0C8] hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
