import { FormularioEntrar } from "./formulario";

/**
 * El correo autorizado solo se envía al cliente mientras el registro está
 * abierto, que es un momento puntual y controlado. Con el registro cerrado
 * —el estado normal— no se filtra: en una pantalla de login pública sería
 * regalar la mitad de las credenciales.
 */
export default function EntrarPage() {
  const registroAbierto = process.env.REGISTRO_ABIERTO?.trim() === "si";
  const correoAutorizado = registroAbierto
    ? (process.env.CORREO_AUTORIZADO?.trim() ?? null)
    : null;

  return (
    <FormularioEntrar
      correoAutorizado={correoAutorizado}
      registroAbierto={registroAbierto}
    />
  );
}
