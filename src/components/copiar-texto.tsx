"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** Botón chico que copia un texto al portapapeles y avisa con un check. */
export function CopiarTexto({ texto, etiqueta }: { texto: string; etiqueta: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      // Sin permiso para el portapapeles: el texto sigue visible para copiarlo a mano.
    }
  }

  return (
    <button
      type="button"
      onClick={copiar}
      aria-label={etiqueta}
      title={etiqueta}
      className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-black/45 hover:bg-black/[0.05] dark:text-white/45 dark:hover:bg-white/[0.08]"
    >
      {copiado ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
    </button>
  );
}
