import Link from "next/link";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

/** La campana: marca si hay pendientes y lleva a «Por hacer». */
export function Campana({ hay, oscura, className }: { hay: boolean; oscura?: boolean; className?: string }) {
  return (
    <Link
      href="/facilapr#por-hacer"
      aria-label={hay ? "Ver pendientes" : "Sin pendientes"}
      className={cn(
        "relative place-items-center",
        oscura ? "size-9 rounded-xl bg-white/10 text-white" : "size-12 rounded-2xl bg-white text-[#16132B] shadow-[0_1px_2px_rgba(20,16,50,0.05)]",
        className
      )}
    >
      <Bell className={oscura ? "size-4" : "size-[18px]"} aria-hidden />
      {hay && <span aria-hidden className={cn("absolute size-2 rounded-full", oscura ? "top-2 right-2 bg-[#8F7BFF]" : "top-3.5 right-3.5 bg-[#3A0CE3] ring-2 ring-white")} />}
    </Link>
  );
}
