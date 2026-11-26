/** Fechas en hora de Chile, sin importar dónde corra el servidor. */

const ZONA = "America/Santiago";
const DIA = new Intl.DateTimeFormat("en-CA", { timeZone: ZONA });
const HORA = new Intl.DateTimeFormat("es-CL", { timeZone: ZONA, hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const LARGO = new Intl.DateTimeFormat("es-CL", { timeZone: ZONA, weekday: "long", day: "numeric", month: "long" });

export const MESES_CORTOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
export const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

export const diaEnChile = (fecha = new Date()) => DIA.format(fecha);

export const nombreMes = (mes: string) => MESES[Number(mes.slice(5, 7)) - 1] ?? mes;
export const mesCorto = (mes: string) => MESES_CORTOS[Number(mes.slice(5, 7)) - 1] ?? mes;

/** Los últimos `n` meses «AAAA-MM», terminando en el actual. */
export function ultimosMeses(n: number, hoy = diaEnChile()) {
  const anio = Number(hoy.slice(0, 4));
  const mes = Number(hoy.slice(5, 7));
  return Array.from({ length: n }, (_, i) => new Date(Date.UTC(anio, mes - 1 - (n - 1 - i), 1)).toISOString().slice(0, 7));
}

/** Cuántos días quedan del mes, sin contar hoy. */
export function diasParaFinDeMes(hoy = diaEnChile()) {
  const total = new Date(Date.UTC(Number(hoy.slice(0, 4)), Number(hoy.slice(5, 7)), 0)).getUTCDate();
  return total - Number(hoy.slice(8, 10));
}

export function fechaLarga(fecha = new Date()) {
  const t = LARGO.format(fecha).replace(",", "");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function saludo(fecha = new Date()) {
  const hora = Number(HORA.format(fecha).slice(0, 2));
  return hora >= 6 && hora < 12 ? "Buenos días" : hora >= 12 && hora < 20 ? "Buenas tardes" : "Buenas noches";
}

/** «hace 12 min», «hace 3 h», «ayer», «hace 4 días». */
export function hace(fecha: Date | null) {
  if (!fecha) return "Sin actividad";
  const min = Math.max(0, Math.floor((Date.now() - fecha.getTime()) / 60_000));
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  if (min < 1440) return `hace ${Math.floor(min / 60)} h`;
  const dias = Math.floor(min / 1440);
  return dias === 1 ? "ayer" : `hace ${dias} días`;
}
