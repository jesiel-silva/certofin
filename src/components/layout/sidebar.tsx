"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowRightLeft,
  Plus,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/transactions",
    label: "Meus Lançamentos",
    icon: ArrowRightLeft,
  },
  {
    href: "/transactions/new",
    label: "Novo Lançamento",
    icon: Plus,
    highlight: true,
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
        <Link href="/dashboard" className="flex items-center" onClick={onClose}>
          <Logo size="sm" />
        </Link>
        <button
          onClick={onClose}
          className="rounded-lg p-1 hover:bg-[var(--accent)] lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = item.href === "/transactions"
            ? pathname === "/transactions" || pathname.startsWith("/transactions/")
            : pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                item.highlight
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90"
                  : isActive
                    ? "bg-[var(--accent)] text-[var(--foreground)]"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--border)] p-4">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-[var(--muted-foreground)]"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-[var(--border)] lg:bg-[var(--card)]">
        {content}
      </aside>

      {/* Mobile sidebar overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={onClose}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-[var(--card)]">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
