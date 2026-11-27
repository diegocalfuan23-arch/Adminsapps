import type { EstadoComite } from "@/lib/consola";

export const TARJETA = "rounded-[28px] bg-white shadow-[0_1px_2px_rgba(20,16,50,0.04),0_10px_30px_-12px_rgba(20,16,50,0.10)]";

export const ESTADOS: EstadoComite[] = ["al-dia", "por-aprobar", "cargando", "sin-lecturas"];

export const ESTADO: Record<EstadoComite, { texto: string; punto: string; color: string; chip: string }> = {
  "al-dia": { texto: "Al día", punto: "bg-[#3A0CE3]", color: "#3A0CE3", chip: "bg-[#EEEAFF] text-[#3A0CE3]" },
  "por-aprobar": { texto: "Por aprobar", punto: "bg-[#8F7BFF]", color: "#8F7BFF", chip: "bg-[#F3F0FF] text-[#5B42E8]" },
  cargando: { texto: "Cargando", punto: "bg-[#C9C0FF]", color: "#C9C0FF", chip: "bg-[#F5F4FA] text-[#6E6A86]" },
  "sin-lecturas": { texto: "Sin lecturas", punto: "bg-[#E4E0F5]", color: "#E4E0F5", chip: "bg-[#F5F4FA] text-[#75718F]" },
};

/** El área suave con la evolución de los últimos meses. */
export function Area({ datos }: { datos: number[] }) {
  const w = 300;
  const h = 90;
  const min = Math.min(...datos) * 0.9;
  const max = Math.max(...datos);
  const puntos = datos.map((v, i) => [(i / (datos.length - 1)) * w, h - ((v - min) / (max - min || 1)) * (h - 12) - 4]);
  let linea = `M${puntos[0][0]},${puntos[0][1]}`;
  for (let i = 1; i < puntos.length; i++) {
    const [x0, y0] = puntos[i - 1];
    const [x1, y1] = puntos[i];
    const medio = (x0 + x1) / 2;
    linea += ` C${medio},${y0} ${medio},${y1} ${x1},${y1}`;
  }
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden className="h-[90px] w-full overflow-visible">
      <defs>
        <linearGradient id="area-socios" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#3A0CE3" stopOpacity=".25" />
          <stop offset="1" stopColor="#3A0CE3" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${linea} L${w},${h} L0,${h} Z`} fill="url(#area-socios)" />
      <path d={linea} fill="none" stroke="#3A0CE3" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** El anillo con cuántos comités hay en cada estado. */
export function Anillo({ grupos }: { grupos: { n: number; color: string }[] }) {
  const total = grupos.reduce((s, g) => s + g.n, 0);
  const radio = 52;
  const vuelta = 2 * Math.PI * radio;
  const largos = grupos.map((g) => (total > 0 ? (g.n / total) * vuelta : 0));
  return (
    <svg viewBox="0 0 140 140" aria-hidden className="size-[140px] -rotate-90">
      <circle cx="70" cy="70" r={radio} fill="none" stroke="#F0EEF8" strokeWidth="16" opacity={total > 0 ? 0 : 1} />
      {grupos.map((g, i) =>
        g.n === 0 ? null : (
          <circle
            key={g.color}
            cx="70"
            cy="70"
            r={radio}
            fill="none"
            stroke={g.color}
            strokeWidth="16"
            strokeDasharray={`${Math.max(largos[i] - (g.n === total ? 0 : 3), 0)} ${vuelta}`}
            strokeDashoffset={-largos.slice(0, i).reduce((s, l) => s + l, 0)}
          />
        )
      )}
    </svg>
  );
}
