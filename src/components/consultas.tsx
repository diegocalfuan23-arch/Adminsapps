"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, Check, Mail, RotateCcw, X } from "lucide-react";
import { gestionarConsulta } from "@/app/(panel)/consultas/acciones";
import type { ConsultaFacilagua } from "@/lib/metricas";

const FECHA = new Intl.DateTimeFormat("es-CL", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const ESTILO_ESTADO: Record<
  ConsultaFacilagua["estado"],
  { texto: string; clase: string }
> = {
  NUEVA: {
    texto: "Nueva",
    clase:
      "bg-emerald-500/12 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  },
  RESPONDIDA: {
    texto: "Respondida",
    clase: "bg-black/[0.06] text-black/55 dark:bg-white/[0.08] dark:text-white/55",
  },
  DESCARTADA: {
    texto: "Descartada",
    clase: "bg-black/[0.06] text-black/40 dark:bg-white/[0.08] dark:text-white/40",
  },
};

const ES_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const botonClase =
  "inline-flex items-center gap-1.5 rounded-lg border border-black/[0.12] px-2.5 py-1 text-[0.8rem] transition-colors hover:bg-black/[0.04] disabled:opacity-50 dark:border-white/[0.16] dark:hover:bg-white/[0.06]";

/**
 * Las consultas del formulario de contacto. Se responden desde aquí: el correo y
 * el cambio de estado los hace Facilapr (este panel nunca escribe en su base), y
 * cada acción queda anotada con su fecha.
 */
export function ListaConsultas({
  consultas,
}: {
  consultas: ConsultaFacilagua[];
}) {
  const router = useRouter();
  const [respondiendo, setRespondiendo] = useState<ConsultaFacilagua | null>(null);
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<{ id: string; texto: string } | null>(null);

  function accion(
    c: ConsultaFacilagua,
    tipo: "marcar" | "descartar" | "reabrir"
  ) {
    if (tipo === "descartar" && !window.confirm(`¿Descartar la consulta de ${c.nombre}?`)) return;
    setError(null);
    iniciar(async () => {
      const r = await gestionarConsulta({ accion: tipo, consultaId: c.id });
      if ("error" in r) setError({ id: c.id, texto: r.error });
      else router.refresh();
    });
  }

  if (consultas.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-black/[0.12] p-6 text-center text-sm text-black/40 dark:border-white/[0.15] dark:text-white/40">
        Todavía no hay consultas.
      </p>
    );
  }

  return (
    <>
      <ul className="flex flex-col divide-y divide-black/[0.06] rounded-xl border border-black/[0.08] dark:divide-white/[0.08] dark:border-white/[0.12]">
        {consultas.map((c) => {
          const estado = ESTILO_ESTADO[c.estado];
          const esCorreo = ES_CORREO.test(c.contacto.trim());
          return (
            <li key={c.id} className="flex flex-col gap-1.5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium">{c.nombre}</span>
                  <span className="text-[0.85rem] text-black/50 dark:text-white/50">
                    · {c.apr}
                  </span>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-[0.75rem] font-medium ${estado.clase}`}
                >
                  {estado.texto}
                </span>
              </div>

              <div className="font-mono text-[0.85rem] text-black/70 dark:text-white/70">
                {c.contacto}
              </div>

              {c.mensaje && (
                <p className="text-[0.88rem] text-black/60 dark:text-white/60">
                  {c.mensaje}
                </p>
              )}

              {c.notas && (
                <p className="whitespace-pre-line rounded-lg bg-black/[0.03] px-3 py-2 text-[0.78rem] text-black/55 dark:bg-white/[0.05] dark:text-white/55">
                  {c.notas}
                </p>
              )}

              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.78rem] text-black/40 dark:text-white/40">
                <span>{FECHA.format(c.createdAt)}</span>
                <span>·</span>
                <span>origen: {c.origen ?? "directo"}</span>
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                {c.estado === "NUEVA" ? (
                  <>
                    {esCorreo ? (
                      <button
                        type="button"
                        onClick={() => setRespondiendo(c)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-black px-3 py-1 text-[0.8rem] font-medium text-white dark:bg-white dark:text-black"
                      >
                        <Mail className="size-3.5" />
                        Responder
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={pendiente}
                        onClick={() => accion(c, "marcar")}
                        title="El contacto no es un correo: respóndele por el medio que dejó y márcala."
                        className={botonClase}
                      >
                        <Check className="size-3.5" />
                        Marcar respondida
                      </button>
                    )}
                    {esCorreo && (
                      <button
                        type="button"
                        disabled={pendiente}
                        onClick={() => accion(c, "marcar")}
                        title="La contestaste por otro medio (WhatsApp, llamada…)"
                        className={botonClase}
                      >
                        <Check className="size-3.5" />
                        Ya la respondí
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={pendiente}
                      onClick={() => accion(c, "descartar")}
                      className={botonClase}
                    >
                      <Ban className="size-3.5" />
                      Descartar
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={pendiente}
                    onClick={() => accion(c, "reabrir")}
                    className={botonClase}
                  >
                    <RotateCcw className="size-3.5" />
                    Reabrir
                  </button>
                )}
                {error?.id === c.id && (
                  <span className="text-[0.78rem] text-red-600 dark:text-red-400">
                    {error.texto}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {respondiendo && (
        <ModalRespuesta
          consulta={respondiendo}
          onCerrar={() => setRespondiendo(null)}
          onEnviada={() => {
            setRespondiendo(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

function ModalRespuesta({
  consulta: c,
  onCerrar,
  onEnviada,
}: {
  consulta: ConsultaFacilagua;
  onCerrar: () => void;
  onEnviada: () => void;
}) {
  const primerNombre = c.nombre.trim().split(/\s+/)[0];
  const [asunto, setAsunto] = useState("Sobre tu consulta en Facilapr");
  const [mensaje, setMensaje] = useState(
    `Hola ${primerNombre},\n\n\n\nSaludos,\nDiego\nFacilapr`
  );
  const [error, setError] = useState<string | null>(null);
  const [enviando, iniciar] = useTransition();

  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !enviando) onCerrar();
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [enviando, onCerrar]);

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    iniciar(async () => {
      const r = await gestionarConsulta({
        accion: "responder",
        consultaId: c.id,
        asunto,
        mensaje,
      });
      if ("error" in r) setError(r.error);
      else onEnviada();
    });
  }

  const campo =
    "w-full rounded-lg border border-black/[0.12] bg-transparent px-3 py-2 text-sm outline-none focus:border-black/40 dark:border-white/[0.16] dark:focus:border-white/50";

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/45 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !enviando) onCerrar();
      }}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-label={`Responder a ${c.nombre}`}
        onSubmit={enviar}
        className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl dark:bg-neutral-900"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold">Responder a {c.nombre}</h3>
            <p className="mt-0.5 truncate font-mono text-[0.8rem] text-black/55 dark:text-white/55">
              {c.contacto}
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            disabled={enviando}
            aria-label="Cerrar"
            className="rounded-md p-1 text-black/50 hover:bg-black/[0.05] dark:text-white/50 dark:hover:bg-white/[0.08]"
          >
            <X className="size-4" />
          </button>
        </div>

        {c.mensaje && (
          <blockquote className="mt-3 border-l-2 border-black/15 pl-3 text-[0.85rem] text-black/60 dark:border-white/20 dark:text-white/60">
            {c.mensaje}
          </blockquote>
        )}

        <label className="mt-4 flex flex-col gap-1 text-sm">
          <span className="text-black/65 dark:text-white/65">Asunto</span>
          <input
            value={asunto}
            onChange={(e) => setAsunto(e.target.value)}
            required
            minLength={3}
            maxLength={150}
            className={campo}
          />
        </label>

        <label className="mt-3 flex flex-col gap-1 text-sm">
          <span className="text-black/65 dark:text-white/65">Tu respuesta</span>
          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            required
            minLength={10}
            maxLength={5000}
            rows={10}
            autoFocus
            className={`${campo} leading-relaxed`}
          />
        </label>

        <p className="mt-2 text-[0.75rem] text-black/45 dark:text-white/45">
          Sale desde hola@facilapr.cl. Al enviarse, la consulta queda como respondida.
        </p>

        {error && (
          <p
            role="alert"
            className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300"
          >
            {error}
          </p>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onCerrar} disabled={enviando} className={botonClase}>
            Cancelar
          </button>
          <button
            type="submit"
            disabled={enviando}
            className="inline-flex items-center gap-1.5 rounded-lg bg-black px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
          >
            <Mail className="size-4" />
            {enviando ? "Enviando…" : "Enviar respuesta"}
          </button>
        </div>
      </form>
    </div>
  );
}
