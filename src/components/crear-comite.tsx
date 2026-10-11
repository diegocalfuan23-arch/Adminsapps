"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Plus, X } from "lucide-react";
import {
  crearComite,
  type DatosComite,
  type ResultadoCrearComite,
} from "@/app/(panel)/facilapr/acciones";

type Exito = Extract<ResultadoCrearComite, { ok: true }>;

const PLANES: { valor: DatosComite["plan"]; texto: string }[] = [
  { valor: "BASICO", texto: "Pequeño" },
  { valor: "ESTANDAR", texto: "Estándar" },
  { valor: "PREMIUM", texto: "Grande" },
];

const campoClase =
  "w-full rounded-lg border border-black/[0.12] bg-transparent px-3 py-2 text-sm outline-none focus:border-black/40 dark:border-white/[0.16] dark:focus:border-white/50";

/**
 * Alta manual de un comité y de su administrador. La clave se genera en
 * Facilapr y se muestra UNA sola vez: aquí no se guarda en ninguna parte.
 */
export function CrearComite({ urlLogin }: { urlLogin: string | null }) {
  const [abierto, setAbierto] = useState(false);
  const [error, setError] = useState<{ texto: string; campo?: string } | null>(null);
  const [exito, setExito] = useState<Exito | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [pendiente, iniciar] = useTransition();

  function cerrar() {
    setAbierto(false);
    setExito(null);
    setError(null);
  }

  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const datos: DatosComite = {
      nombre: String(f.get("nombre") ?? ""),
      rut: String(f.get("rut") ?? ""),
      comuna: String(f.get("comuna") ?? ""),
      responsable: String(f.get("responsable") ?? ""),
      cargo: String(f.get("cargo") ?? ""),
      email: String(f.get("email") ?? ""),
      plan: (String(f.get("plan") ?? "BASICO") as DatosComite["plan"]),
    };
    setError(null);
    iniciar(async () => {
      const r = await crearComite(datos);
      if ("ok" in r && r.ok) setExito(r);
      else if ("error" in r) setError({ texto: r.error, campo: r.campo });
    });
  }

  async function copiar(clave: string, texto: string) {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(clave);
      setTimeout(() => setCopiado(null), 2000);
    } catch {
      // Sin permiso para el portapapeles: el dato queda visible para copiarlo a mano.
    }
  }

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-black px-3 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
      >
        <Plus className="size-4" />
        Crear comité
      </button>
    );
  }

  return (
    <div className="w-full basis-full rounded-xl border border-black/[0.1] bg-white p-5 dark:border-white/[0.14] dark:bg-[#111]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">
            {exito ? "Comité creado" : "Crear comité"}
          </h3>
          <p className="mt-0.5 text-sm text-black/55 dark:text-white/55">
            {exito
              ? "Esta clave se muestra una sola vez: cópiala ahora."
              : "Crea el comité y a su administrador. La clave se genera sola."}
          </p>
        </div>
        <button
          type="button"
          onClick={cerrar}
          aria-label="Cerrar"
          className="rounded-md p-1 text-black/50 hover:bg-black/[0.05] dark:text-white/50 dark:hover:bg-white/[0.08]"
        >
          <X className="size-4" />
        </button>
      </div>

      {exito ? (
        <div className="mt-4 flex flex-col gap-3 text-sm">
          <dl className="grid gap-x-6 gap-y-1.5 sm:grid-cols-[auto_1fr]">
            <dt className="text-black/55 dark:text-white/55">Comité</dt>
            <dd className="font-medium">
              {exito.comite.nombre} · {exito.comite.rut} · {exito.comite.comuna}
            </dd>
            <dt className="text-black/55 dark:text-white/55">Responsable</dt>
            <dd>
              {exito.usuario.nombre}, {exito.usuario.cargo}
            </dd>
            <dt className="text-black/55 dark:text-white/55">Plan</dt>
            <dd>{exito.comite.plan}</dd>
            {urlLogin && (
              <>
                <dt className="text-black/55 dark:text-white/55">Dirección</dt>
                <dd>{urlLogin}</dd>
              </>
            )}
            <dt className="text-black/55 dark:text-white/55">Usuario</dt>
            <dd>{exito.usuario.email}</dd>
            <dt className="text-black/55 dark:text-white/55">Contraseña</dt>
            <dd className="font-mono text-[0.95rem] font-semibold">{exito.clave}</dd>
          </dl>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => copiar("clave", exito.clave)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-black/[0.12] px-3 py-1.5 text-sm dark:border-white/[0.16]"
            >
              {copiado === "clave" ? <Check className="size-4" /> : <Copy className="size-4" />}
              Copiar contraseña
            </button>
            <button
              type="button"
              onClick={() =>
                copiar(
                  "acceso",
                  `${urlLogin ? `Dirección: ${urlLogin}\n` : ""}Usuario: ${exito.usuario.email}`
                )
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-black/[0.12] px-3 py-1.5 text-sm dark:border-white/[0.16]"
            >
              {copiado === "acceso" ? <Check className="size-4" /> : <Copy className="size-4" />}
              Copiar dirección y usuario
            </button>
          </div>
          <p className="text-xs text-black/50 dark:text-white/50">
            Consejo: manda la contraseña por un canal distinto al de la dirección y el usuario.
          </p>
        </div>
      ) : (
        <form onSubmit={enviar} className="mt-4 grid gap-3 sm:grid-cols-2">
          {(
            [
              { name: "nombre", label: "Nombre del comité", placeholder: "Comité de Agua Potable Quema" },
              { name: "rut", label: "RUT del comité", placeholder: "75.044.000-2" },
              { name: "comuna", label: "Comuna", placeholder: "Puyehue" },
              { name: "responsable", label: "Responsable", placeholder: "Nombre y apellido" },
              { name: "cargo", label: "Cargo", placeholder: "Presidente" },
              { name: "email", label: "Correo (será el usuario)", placeholder: "comite@correo.cl", type: "email" },
            ] as const
          ).map((c) => (
            <label key={c.name} className="flex flex-col gap-1 text-sm">
              <span className="text-black/65 dark:text-white/65">{c.label}</span>
              <input
                name={c.name}
                type={"type" in c ? c.type : "text"}
                placeholder={c.placeholder}
                required
                aria-invalid={error?.campo === c.name || undefined}
                className={campoClase}
              />
            </label>
          ))}

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-black/65 dark:text-white/65">Plan</span>
            <select name="plan" defaultValue="BASICO" className={campoClase}>
              {PLANES.map((p) => (
                <option key={p.valor} value={p.valor}>
                  {p.texto}
                </option>
              ))}
            </select>
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-700 sm:col-span-2 dark:text-red-300"
            >
              {error.texto}
            </p>
          )}

          <div className="flex justify-end gap-2 sm:col-span-2">
            <button
              type="button"
              onClick={cerrar}
              className="rounded-lg border border-black/[0.12] px-3 py-2 text-sm dark:border-white/[0.16]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pendiente}
              className="rounded-lg bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
            >
              {pendiente ? "Creando…" : "Crear comité"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
