/** Lo de «Asistente» que usan tanto el servidor como el navegador. Los topes son los mismos que aplica Facilapr. */

export const MAXIMO_NOMBRE = 30;
export const MAXIMO_INSTRUCCIONES = 2000;
export const MAXIMO_INSTRUCCIONES_COMITE = 1500;
export const MAXIMO_REGLAS = 10;
export const MAXIMO_REGLA = 120;

export const TONOS = ["Cercano", "Formal", "Breve"] as const;
export const TEMAS = ["Saldo y deuda", "Boletas", "Pagos", "Cortes", "Lecturas", "Subsidios", "Reclamos", "Fuera del agua"] as const;

/** Las que Facilapr ya lleva fijas en cada respuesta: se muestran, pero no se pueden apagar. */
export const REGLAS_FIJAS = [
  "No compartir datos de otros socios",
  "No inventar montos, fechas ni teléfonos",
  "No prometer reposiciones ni anular deudas",
  "Derivar a una persona si el socio lo pide",
];

export type Ajustes = {
  nombre: string;
  tono: (typeof TONOS)[number];
  instrucciones: string;
  reglas: { texto: string; activa: boolean }[];
  temasApagados: (typeof TEMAS)[number][];
};

/** Cómo parte mientras no se ha publicado nada. */
export const AJUSTES_INICIALES: Ajustes = { nombre: "", tono: "Cercano", instrucciones: "", reglas: [], temasApagados: ["Fuera del agua"] };

export type ComiteAsistente = {
  id: string;
  nombre: string;
  instrucciones: string;
  horario: string | null;
  telefono: string | null;
  diasVencimiento: number;
  diasGracia: number;
};

export type Mensaje = { rol: "user" | "assistant"; texto: string };
