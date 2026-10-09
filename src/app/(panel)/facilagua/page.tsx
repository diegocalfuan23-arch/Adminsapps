import { redirect } from "next/navigation";

/** La sección se llamaba FacilAgua: este enlace queda por los favoritos viejos. */
export default function FacilaguaRedirigir() {
  redirect("/facilapr/comites");
}
