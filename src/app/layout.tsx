import type { Metadata } from "next";
import { ThemeProviderWrapper } from "@/components/ui/theme-provider";
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
        <ThemeProviderWrapper>
          {children}
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
