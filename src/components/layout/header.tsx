"use client";

import { Menu } from "lucide-react";
import { NotificationBell } from "./notification-bell";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-[var(--primary)]/30 bg-[#020617]/90 backdrop-blur-md px-4 lg:px-6 shadow-[0_2px_20px_rgba(0,255,204,0.08)]">
      <button
        onClick={onMenuClick}
        className="lg:hidden flex items-center justify-center p-1.5 text-[var(--primary)] border border-[var(--primary)]/30 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 hover:shadow-[0_0_15px_var(--primary)] transition-all"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex-1" />
      <NotificationBell />
    </header>
  );
}
