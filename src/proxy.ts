import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Red de seguridad: bloquea todo lo que no sea explícitamente público.
 *
 * Cada página protegida ya comprueba la sesión por su cuenta, que es la
 * verificación de verdad. Esto existe para el caso en que mañana se agregue
 * una ruta nueva y se olvide ese chequeo: aquí queda cerrada por defecto,
 * en vez de quedar abierta por defecto.
 *
 * Solo mira que la cookie exista, no la valida: eso lo hace cada página
 * contra la base. Una cookie falsificada pasa por aquí y muere en la página.
 */
const PUBLICAS = ["/entrar"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLICAS.some((ruta) => pathname.startsWith(ruta))) {
    return NextResponse.next();
  }

  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/entrar", request.url));
  }

  return NextResponse.next();
}

export const config = {
  /**
   * Excluye la API de auth (necesita ser pública para el login), los assets
   * de Next y el favicon. Todo lo demás pasa por aquí.
   */
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
