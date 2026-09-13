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

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "CertoFin - Gestão Financeira Inteligente",
    template: "%s | CertoFin",
  },
  description:
    "SaaS de gerenciamento financeiro para pessoas físicas e pequenos empreendedores. Controle suas contas, assine o plano Pro e limpe sua vida financeira.",
  keywords: [
    "finanças",
    "gestão financeira",
    "controle de gastos",
    "planejamento financeiro",
    "planilha financeira",
    "empreendedor",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "CertoFin - Gestão Financeira Inteligente",
    description:
      "SaaS de gerenciamento financeiro para pessoas físicas e pequenos empreendedores.",
    url: appUrl,
    siteName: "CertoFin",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CertoFin - Gestão Financeira Inteligente",
    description:
      "SaaS de gerenciamento financeiro para pessoas físicas e pequenos empreendedores.",
  },
  robots: {
    index: true,
    follow: true,
  },
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
