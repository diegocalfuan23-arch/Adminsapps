"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Bot, Eye, X } from "lucide-react";
import { probarAsistente } from "@/app/(panel)/facilapr/acciones";
import { CAMPO, ETIQUETA } from "@/components/consola/asistente/piezas";
import { REGLA_FIJA, type Ajustes, type ComiteAsistente, type Mensaje } from "@/lib/asistente-comun";
import { cn } from "@/lib/utils";

const SUGERENCIAS = ["¿Cuánto debo?", "¿Cuándo es el corte?", "Horario"];
const ALTO = "min-h-0 flex-1 overflow-y-auto p-4 max-xl:flex-none h-[56vh]";

/**
 * El chat de prueba: responde Facilapr con lo que hay en pantalla, publicado o no, y un socio de ejemplo.
 * Quien lo usa le pone `key` con el comité, así cambiar de comité empieza de cero.
 */
export function Probar({
  comites,
  comite,
  ajustes,
  instrucciones,
  onElegir,
}: {
  comites: ComiteAsistente[];
  comite: ComiteAsistente;
  ajustes: Ajustes;
  instrucciones: string;
  onElegir: (id: string) => void;
}) {
  const [chat, setChat] = useState<Mensaje[]>([]);
  const [msg, setMsg] = useState("");
  const [esperando, setEsperando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verFinal, setVerFinal] = useState(false);
  const caja = useRef<HTMLDivElement>(null);

  useEffect(() => {
    caja.current?.scrollTo({ top: caja.current.scrollHeight });
  }, [chat, esperando, error]);

  async function enviar(texto: string) {
    const t = texto.trim();
    if (!t || esperando) return;
    const nuevo: Mensaje[] = [...chat, { rol: "user", texto: t }];
    setChat(nuevo);
    setMsg("");
    setError(null);
    setVerFinal(false);
    setEsperando(true);
    // Solo lo último, y partiendo por un mensaje del socio.
    const mensajes = nuevo.slice(-15);
    while (mensajes[0].rol !== "user") mensajes.shift();
    const r = await probarAsistente({
      aprId: comite.id,
      ajustes,
      instrucciones,
      mensajes: mensajes.map((m) => ({ rol: m.rol, texto: m.texto.slice(0, 1000) })),
    });
    setEsperando(false);
    if (r.ok) setChat((c) => [...c, { rol: "assistant", texto: r.texto }]);
    else {
      // Sin respuesta, el mensaje vuelve a la caja para reintentar.
      setChat(chat);
      setMsg(t);
      setError(r.error);
    }
  }

  const reglas = [REGLA_FIJA, ...ajustes.reglas.filter((r) => r.activa).map((r) => r.texto)];

  return (
    <>
      <div className="flex items-center gap-3 border-b border-[#F0EEF8] px-4 py-3.5">
        <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[#6B4BFF] to-[#3A0CE3] text-white">
          <Bot className="size-[18px]" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-semibold">Probar a {ajustes.nombre.trim() || "tu asistente"}</p>
          <select value={comite.id} onChange={(e) => onElegir(e.target.value)} aria-label="Comité de prueba" className="-ml-1 w-full truncate bg-transparent text-[12px] text-[#8D89A6] outline-none">
            {comites.map((x) => (
              <option key={x.id} value={x.id}>
                como socio de {x.nombre}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => setVerFinal(!verFinal)}
          aria-label="Ver instrucción final"
          aria-pressed={verFinal}
          className={cn("grid size-8 place-items-center rounded-lg", verFinal ? "bg-[#EEEAFF] text-[#3A0CE3]" : "text-[#A3A0B8] hover:bg-[#F3F2F8]")}
        >
          {verFinal ? <X className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>

      {verFinal ? (
        <div className={cn(ALTO, "space-y-3 text-[12.5px] leading-relaxed break-words md:h-auto md:max-h-[420px] xl:max-h-none")}>
          <p className={ETIQUETA}>Lo que recibe el asistente</p>
          <div className="rounded-xl border-l-[3px] border-[#3A0CE3] bg-white p-3 ring-1 ring-[#EEEBF6]">
            <p className="mb-1 text-[11px] font-semibold text-[#3A0CE3]">Base general</p>
            <p className="whitespace-pre-line text-[#5E5A78]">{ajustes.instrucciones}</p>
          </div>
          {instrucciones.trim() && (
            <div className="rounded-xl border-l-[3px] border-[#7A5CFF] bg-white p-3 ring-1 ring-[#EEEBF6]">
              <p className="mb-1 text-[11px] font-semibold text-[#7A5CFF]">{comite.nombre}</p>
              <p className="whitespace-pre-line text-[#5E5A78]">{instrucciones}</p>
            </div>
          )}
          <div className="rounded-xl border-l-[3px] border-[#C9C0FF] bg-white p-3 ring-1 ring-[#EEEBF6]">
            <p className="mb-1 text-[11px] font-semibold text-[#8F7BFF]">Reglas</p>
            <ul className="list-disc space-y-0.5 pl-4 text-[#5E5A78]">
              {reglas.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div ref={caja} aria-live="polite" className={cn(ALTO, "flex flex-col gap-2.5 md:h-[340px] xl:h-auto")}>
          {!chat.length && !error && (
            <p className="m-auto max-w-[220px] text-center text-[12.5px] text-[#A3A0B8]">Escribe como si fueras un socio para ver cómo responde.</p>
          )}
          {chat.map((m, i) => (
            <div
              key={i}
              className={cn(
                "max-w-[85%] shrink-0 rounded-2xl px-3.5 py-2.5 text-[13px] leading-snug break-words whitespace-pre-wrap",
                m.rol === "user" ? "ml-auto rounded-br-md bg-[#3A0CE3] text-white" : "rounded-bl-md bg-white ring-1 ring-[#EEEBF6]"
              )}
            >
              {m.texto}
            </div>
          ))}
          {esperando && <div className="w-fit animate-pulse rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-[13px] text-[#A3A0B8] ring-1 ring-[#EEEBF6]">Escribiendo…</div>}
          {error && (
            <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[12.5px] text-red-700">
              {error}
            </p>
          )}
        </div>
      )}

      <div className="border-t border-[#F0EEF8] p-3">
        <div className="mb-2 flex gap-1.5 overflow-x-auto p-px [scrollbar-width:none]">
          {SUGERENCIAS.map((s) => (
            <button
              key={s}
              type="button"
              disabled={esperando}
              onClick={() => enviar(s)}
              className="h-7 shrink-0 rounded-lg bg-white px-2.5 text-[12px] font-medium text-[#5E5A78] ring-1 ring-[#EEEBF6] hover:ring-[#C9C0FF] disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            enviar(msg);
          }}
          className="flex gap-2"
        >
          <input value={msg} maxLength={1000} onChange={(e) => setMsg(e.target.value)} placeholder="Escribe como socio…" aria-label="Mensaje de prueba" className={cn(CAMPO, "h-10")} />
          <button aria-label="Enviar" disabled={esperando} className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#3A0CE3] text-white disabled:opacity-50">
            <ArrowUp className="size-4" />
          </button>
        </form>
      </div>
    </>
  );
}
