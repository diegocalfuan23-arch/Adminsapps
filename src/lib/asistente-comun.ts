/** Lo de «Asistente» que usan tanto el servidor como el navegador. Los topes son los mismos que aplica Facilapr. */

export const MAXIMO_NOMBRE = 30;
export const MAXIMO_INSTRUCCIONES = 2000;
export const MAXIMO_INSTRUCCIONES_COMITE = 1500;
export const MAXIMO_REGLAS = 14;
export const MAXIMO_REGLA = 120;
export const MAXIMO_ARCHIVO = 3 * 1024 * 1024;

export const TONOS = ["Cercano", "Formal", "Breve"] as const;
export const TEMAS = ["Saldo y deuda", "Boletas", "Pagos", "Cortes", "Lecturas", "Subsidios", "Reclamos", "Fuera del agua"] as const;

/** Va fija en cada respuesta: se muestra, pero no se puede apagar. */
export const REGLA_FIJA = "No compartir datos de otros socios";

export type Regla = { id: string; texto: string; activa: boolean };

export type Ajustes = {
  nombre: string;
  tono: (typeof TONOS)[number];
  instrucciones: string;
  reglas: Regla[];
  temasApagados: (typeof TEMAS)[number][];
};

/** Cómo parte mientras no se ha publicado nada. Los `id` los reconoce Facilapr. */
export const AJUSTES_INICIALES: Ajustes = {
  nombre: "Gotita",
  tono: "Cercano",
  instrucciones:
    "Eres el asistente del comité de agua potable rural. Respondes dudas de socios sobre su cuenta, boletas, pagos, lecturas y cortes.\nHabla en español de Chile, con un tono cercano y respetuoso. Usa frases cortas.\nSi no sabes algo o el socio necesita un trámite, ofrece contactar a la directiva.",
  reglas: [
    { id: "derivar", texto: "Derivar a una persona si el socio lo pide", activa: true },
    { id: "prometer", texto: "No prometer reposiciones ni anular deudas", activa: true },
    { id: "rut", texto: "Confirmar el RUT antes de dar saldos", activa: true },
    { id: "pagoLinea", texto: "Ofrecer el pago en línea si hay deuda", activa: false },
  ],
  temasApagados: ["Fuera del agua"],
};

export type ComiteAsistente = {
  id: string;
  nombre: string;
  /** Lo que hoy llega a los socios. */
  aprobadas: string;
  /** Lo que escribió la directiva y espera revisión. */
  propuesta: string | null;
  /** «hoy, 18:40», «hace 3 días». Null si no hay registro del cambio. */
  editado: string | null;
  autor: string | null;
  horario: string | null;
  telefono: string | null;
  diasVencimiento: number;
  diasGracia: number;
};

export type Documento = {
  id: string;
  titulo: string;
  tipo: "PDF" | "Texto" | "Enlace";
  /** Null: vale para todos los comités. */
  aprId: string | null;
};

export type Mensaje = { rol: "user" | "assistant"; texto: string };
