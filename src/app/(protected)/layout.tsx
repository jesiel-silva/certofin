"use client";

import { useState } from "react";
import { ThemeProvider } from "next-themes";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="min-h-screen bg-[var(--background)]">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:pl-64">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </ThemeProvider>
  );
}
