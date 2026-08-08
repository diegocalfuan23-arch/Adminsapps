"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { signIn, signUp } from "@/lib/auth-client";

/**
 * Formulario de entrada al panel. El registro solo funciona mientras
 * REGISTRO_ABIERTO="si" en el servidor y el correo coincida con el
 * autorizado; si no, Better Auth responde con error y no crea nada.
 */
export function FormularioEntrar({
  correoAutorizado,
  registroAbierto,
}: {
  correoAutorizado: string | null;
  registroAbierto: boolean;
}) {
  const router = useRouter();
  const [registrando, setRegistrando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verClave, setVerClave] = useState(false);

  async function manejar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setEnviando(true);

    const datos = new FormData(e.currentTarget);
    const email = String(datos.get("email") ?? "");
    const password = String(datos.get("password") ?? "");

    const resultado = registrando
      ? await signUp.email({ email, password, name: "Diego" })
      : await signIn.email({ email, password });

    if (resultado.error) {
      setEnviando(false);
      setError(
        registrando
          ? "No se pudo crear la cuenta: el correo no está autorizado, o el registro está cerrado."
          : "Correo o contraseña incorrectos."
      );
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-semibold tracking-tight">Panel</h1>
        <p className="mt-1 text-sm text-black/55 dark:text-white/55">
          {registrando ? "Crear la cuenta del panel." : "Acceso privado."}
        </p>

        <form onSubmit={manejar} className="mt-8 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Correo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              // Al registrar, el único correo válido es el autorizado: se
              // rellena para no dejarte adivinando cuál era.
              defaultValue={registrando ? (correoAutorizado ?? "") : undefined}
              key={registrando ? "registro" : "acceso"}
              className="h-10 rounded-lg border border-black/[0.12] bg-transparent px-3 text-sm outline-none focus-visible:border-black/40 dark:border-white/[0.18] dark:focus-visible:border-white/50"
            />
            {registrando && registroAbierto && !correoAutorizado && (
              <span className="text-xs text-red-600 dark:text-red-400">
                Falta CORREO_AUTORIZADO en el servidor: nadie puede
                registrarse.
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={verClave ? "text" : "password"}
                autoComplete={registrando ? "new-password" : "current-password"}
                minLength={12}
                required
                className="h-10 w-full rounded-lg border border-black/[0.12] bg-transparent pr-11 pl-3 text-sm outline-none focus-visible:border-black/40 dark:border-white/[0.18] dark:focus-visible:border-white/50"
              />
              <button
                type="button"
                onClick={() => setVerClave((v) => !v)}
                aria-label={
                  verClave ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                className="absolute top-1/2 right-1 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-black/45 hover:text-black/75 dark:text-white/45 dark:hover:text-white/75"
              >
                {verClave ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {registrando && (
              <span className="text-xs text-black/50 dark:text-white/50">
                Mínimo 12 caracteres.
              </span>
            )}
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-500/10 px-3 py-2.5 text-sm text-red-600 dark:text-red-400"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="mt-2 h-10 rounded-lg bg-foreground text-sm font-medium text-background disabled:opacity-60"
          >
            {enviando ? "…" : registrando ? "Crear cuenta" : "Entrar"}
          </button>
        </form>

        {/* Con el registro cerrado ni siquiera se ofrece: el endpoint no
            existe, así que el enlace solo llevaría a un error. */}
        {registroAbierto && (
          <button
            type="button"
            onClick={() => {
              setRegistrando((v) => !v);
              setError(null);
            }}
            className="mt-6 text-xs text-black/45 underline-offset-4 hover:underline dark:text-white/45"
          >
            {registrando ? "Ya tengo cuenta" : "Crear la cuenta por primera vez"}
          </button>
        )}
      </div>
    </main>
  );
}
