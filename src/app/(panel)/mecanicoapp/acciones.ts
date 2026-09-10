"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { cambiarPlanMecanicoapp } from "@/lib/db";

// Mismos valores que src/lib/taller.ts (PLANES) en el repo de
// mecanicoapp — no se importa desde ahí porque es otro proyecto, así
// que si esa lista cambia hay que actualizar esta también.
const PLANES_VALIDOS = ["prueba", "taller", "serviteca", "empresarial"];

export async function cambiarPlan(userId: string, plan: string) {
  const sesion = await auth.api.getSession({ headers: await headers() });
  if (!sesion) return { error: "Sin sesión." };

  if (!PLANES_VALIDOS.includes(plan)) {
    return { error: "Plan no reconocido." };
  }

  await cambiarPlanMecanicoapp(userId, plan);

  revalidatePath("/mecanicoapp");
  return { ok: true };
}
