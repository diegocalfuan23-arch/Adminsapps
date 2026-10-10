"use client";

import { useState, useTransition } from "react";
import { Check, Pencil, X } from "lucide-react";
import { cambiarSlugComite } from "@/app/(panel)/facilapr/acciones";
import { CopiarTexto } from "@/components/copiar-texto";

/**
 * El slug de un comité, editable en el mismo lugar. Cambiarlo rompe los
 * enlaces anteriores del comité, así que se avisa antes de guardar.
 */
export function EditarSlug({
  aprId,
  slug,
}: {
  aprId: string;
  slug: string | null;
}) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(slug ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciar] = useTransition();

  function guardar() {
    setError(null);
    iniciar(async () => {
      const r = await cambiarSlugComite(aprId, valor);
      if (r.ok) setEditando(false);
      else setError(r.error);
    });
  }

  function cancelar() {
    setEditando(false);
    setValor(slug ?? "");
    setError(null);
  }

  if (!editando) {
    return (
      <span className="inline-flex items-center gap-1">
        {slug ? (
          <>
            <code className="font-mono text-[0.82rem]">{slug}</code>
            <CopiarTexto texto={slug} etiqueta="Copiar el slug" />
          </>
        ) : (
          <span className="text-amber-700 dark:text-amber-400">Sin slug</span>
        )}
        <button
          type="button"
          onClick={() => setEditando(true)}
          aria-label="Editar el slug"
          title="Editar el slug"
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-black/45 hover:bg-black/[0.05] dark:text-white/45 dark:hover:bg-white/[0.08]"
        >
          <Pencil className="size-3.5" />
        </button>
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="inline-flex items-center gap-1">
        <input
          value={valor}
          onChange={(e) => setValor(e.target.value.toLowerCase())}
          onKeyDown={(e) => {
            if (e.key === "Enter") guardar();
            if (e.key === "Escape") cancelar();
          }}
          autoFocus
          maxLength={40}
          aria-label="Slug del comité"
          className="w-40 rounded-md border border-black/[0.15] bg-transparent px-2 py-1 font-mono text-[0.82rem] outline-none focus:border-black/40 dark:border-white/[0.2] dark:focus:border-white/50"
        />
        <button
          type="button"
          onClick={guardar}
          disabled={pendiente || valor.trim() === ""}
          aria-label="Guardar"
          className="inline-flex size-7 items-center justify-center rounded-md text-emerald-700 hover:bg-emerald-500/10 disabled:opacity-40 dark:text-emerald-400"
        >
          <Check className="size-4" />
        </button>
        <button
          type="button"
          onClick={cancelar}
          disabled={pendiente}
          aria-label="Cancelar"
          className="inline-flex size-7 items-center justify-center rounded-md text-black/50 hover:bg-black/[0.05] dark:text-white/50 dark:hover:bg-white/[0.08]"
        >
          <X className="size-4" />
        </button>
      </span>
      {slug && slug !== valor.trim() && !error && (
        <span className="text-[0.72rem] text-amber-700 dark:text-amber-400">
          Los enlaces con «{slug}» dejarán de funcionar.
        </span>
      )}
      {error && (
        <span className="max-w-[28ch] text-[0.72rem] text-red-600 dark:text-red-400">
          {error}
        </span>
      )}
    </div>
  );
}
