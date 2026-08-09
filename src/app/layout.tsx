import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { ThemeProviderWrapper } from "@/components/ui/theme-provider";
import "./globals.css";

export const dynamic = "force-dynamic";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
});

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
    <html lang="pt-BR" className={`dark ${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen antialiased`}>
        <ThemeProviderWrapper>
          {children}
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
