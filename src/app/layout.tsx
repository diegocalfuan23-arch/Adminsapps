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
 * build fallaba por eso. La fuente la pide el navegador; si no llega, queda la
 * del sistema.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" />
      </head>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
