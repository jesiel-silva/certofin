import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CertoFin - Gestão Financeira Inteligente",
  description:
    "SaaS de gerenciamento financeiro para pessoas físicas e pequenos empreendedores",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="light" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
