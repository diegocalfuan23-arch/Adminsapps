"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { CrearComite } from "@/components/crear-comite";

/** Los dos atajos del resumen: copiar el enlace de registro y crear un comité. */
export function AccionesCabecera({ registro, urlLogin }: { registro: string; urlLogin: string | null }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(registro);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2200);
    } catch {
      window.prompt("Copia el enlace de registro", registro);
    }
  }

  return (
    // Al abrir el formulario, ocupa todo el ancho bajo el título.
    <div className="flex w-full flex-wrap gap-2 sm:w-auto has-[form]:w-full has-[dl]:w-full">
      <button
        type="button"
        onClick={copiar}
        className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-[13.5px] font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 sm:flex-none"
      >
        {copiado ? <Check className="size-4 text-emerald-600" aria-hidden /> : <Link2 className="size-4" aria-hidden />}
        {copiado ? "Enlace copiado" : "Copiar enlace"}
      </button>
      <CrearComite urlLogin={urlLogin} />
    </div>
  );
}
