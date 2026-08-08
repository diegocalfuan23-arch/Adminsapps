import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Panel",
  description: "Monitoreo interno de mis productos.",
  // Panel privado: que no lo indexe nadie aunque quede en una URL pública.
  robots: { index: false, follow: false },
};

/**
 * Sin next/font: este entorno no siempre alcanza fonts.googleapis.com y el
 * build fallaba por eso. Para un panel interno la pila del sistema se ve
 * bien, carga al instante y no depende de la red.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
