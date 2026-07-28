"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ArrowRightLeft,
  Plus,
  LogOut,
  X,
  Home,
  Briefcase,
  Crown,
  Settings,
  ChevronDown,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { usePlanLimits } from "@/lib/hooks/use-plan-limits";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { canUseBusinessScope } = usePlanLimits();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        if (profile) setUserName(profile.full_name || "");
      }
    };
    fetchUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const isActive = (href: string) => {
    if (href === "/personal/dashboard") {
      return pathname === "/personal/dashboard" || pathname === "/business/dashboard";
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const personalItems = [
    { href: "/personal/transactions", label: "Lançamentos", icon: ArrowRightLeft },
  ];

  const businessItems = [
    { href: "/business/transactions", label: "Lançamentos", icon: ArrowRightLeft },
  ];

  const initials = userName
    ? userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : userEmail[0]?.toUpperCase() || "U";

  const content = (
    <div className="flex h-full flex-col bg-[var(--card)]">
      {/* Logo */}
      <div className="px-5 py-5">
        <Link href="/personal/dashboard" className="flex items-center" onClick={onClose}>
          <Logo size="sm" showSubtitle={false} />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {/* ═══════ DASHBOARD ═══════ */}
        <div className="mb-2">
          <Link
            href="/personal/dashboard"
            onClick={onClose}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
              isActive("/personal/dashboard")
                ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
            )}
          >
            {isActive("/personal/dashboard") && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-[var(--primary)]" />
            )}
            <LayoutDashboard className={cn("h-5 w-5", isActive("/personal/dashboard") ? "text-[var(--primary)]" : "")} />
            Dashboard
          </Link>
        </div>

        {/* ═══════ DIVISOR ═══════ */}
        <div className="my-3 mx-3">
          <div className="h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
        </div>

        {/* ═══════ PESSOAL ═══════ */}
        <div className="mb-2">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10">
              <Home className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/70">
              Pessoal
            </span>
          </div>
          <div className="space-y-0.5">
            {personalItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-emerald-500/10 text-emerald-700"
                      : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
                  )}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-emerald-500" />
                  )}
                  <item.icon className={cn("h-5 w-5", active ? "text-emerald-600" : "text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]")} />
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/personal/transactions/new"
              onClick={onClose}
              className="group flex items-center gap-3 rounded-xl border border-dashed border-emerald-500/30 px-3 py-2.5 text-sm font-medium text-emerald-600/70 transition-all duration-200 hover:border-emerald-500/50 hover:bg-emerald-500/5 hover:text-emerald-700"
            >
              <Plus className="h-5 w-5" />
              Novo Lançamento
            </Link>
          </div>
        </div>

        {/* ═══════ DIVISOR ═══════ */}
        <div className="my-3 mx-3">
          <div className="h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
        </div>

        {/* ═══════ NEGÓCIO ═══════ */}
        <div>
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10">
              <Briefcase className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600/70">
              Negócio
            </span>
          </div>

          {canUseBusinessScope ? (
            <div className="space-y-0.5">
              {businessItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-blue-500/10 text-blue-700"
                        : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
                    )}
                  >
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-blue-500" />
                    )}
                    <item.icon className={cn("h-5 w-5", active ? "text-blue-600" : "text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]")} />
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/business/transactions/new"
                onClick={onClose}
                className="group flex items-center gap-3 rounded-xl border border-dashed border-blue-500/30 px-3 py-2.5 text-sm font-medium text-blue-600/70 transition-all duration-200 hover:border-blue-500/50 hover:bg-blue-500/5 hover:text-blue-700"
              >
              <Plus className="h-5 w-5" />
              Novo Lançamento
            </Link>
            </div>
          ) : (
            <Link
              href="/personal/planos"
              onClick={onClose}
              className="mx-1 flex items-center gap-3 rounded-xl border border-blue-500/20 bg-gradient-to-r from-blue-500/5 to-transparent px-3 py-3 text-sm font-medium text-blue-600 transition-all duration-200 hover:border-blue-500/40 hover:from-blue-500/10"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                <Crown className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Ativar Negócio</p>
                <p className="text-[10px] text-blue-500/60">Desbloqueie com o plano Pro</p>
              </div>
            </Link>
          )}
        </div>
      </nav>

      {/* ═══════ BOTTOM ═══════ */}
      <div className="border-t border-[var(--border)] px-3 py-3">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/70 text-xs font-bold text-white">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--foreground)]">
              {userName || "Usuário"}
            </p>
            <p className="truncate text-[11px] text-[var(--muted-foreground)]">
              {userEmail}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg p-2 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--destructive)]/10 hover:text-[var(--destructive)]"
            title="Sair"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-[var(--border)]">
        {content}
      </aside>

      {/* Mobile sidebar overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 shadow-2xl">
            <div className="absolute right-2 top-2 z-10">
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
