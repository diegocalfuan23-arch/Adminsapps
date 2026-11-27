"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

/** Busca un comité: lleva a «Comités» con lo escrito. Ctrl K lo enfoca. */
export function Buscador() {
  const router = useRouter();
  const campo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        campo.current?.focus();
      }
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, []);

  return (
    <form
      role="search"
      className="relative min-w-0 flex-1 sm:w-64 sm:flex-none"
      onSubmit={(e) => {
        e.preventDefault();
        const q = campo.current?.value.trim() ?? "";
        router.push(q ? `/facilapr/comites?q=${encodeURIComponent(q)}` : "/facilapr/comites");
      }}
    >
      <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#8D89A6]" aria-hidden />
      <input
        ref={campo}
        aria-label="Buscar comité"
        placeholder="Buscar"
        className="h-12 w-full rounded-2xl bg-white pr-16 pl-11 text-[13.5px] shadow-[0_1px_2px_rgba(20,16,50,0.05)] outline-none placeholder:text-[#8D89A6] focus:ring-4 focus:ring-[#3A0CE3]/15"
      />
      <kbd className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 rounded-md bg-[#F3F2F8] px-1.5 py-0.5 font-sans text-[11px] text-[#75718F]">Ctrl K</kbd>
    </form>
  );
}
