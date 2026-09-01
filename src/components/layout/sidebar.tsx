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
  User,
  Bell,
  HelpCircle,
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
  const { canUseBusinessScope, isTrial } = usePlanLimits();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPlan, setUserPlan] = useState<"free" | "pro">("free");

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, subscription_status")
          .eq("id", user.id)
          .single();
        if (profile) {
          setUserName(profile.full_name || "");
          setUserPlan(profile.subscription_status || "free");
        }
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
    <div className="flex h-full flex-col bg-[#020617]/95 backdrop-blur-md scanline-overlay">
      {/* Logo */}
      <div className="px-4 py-[0.1rem] border-b border-[var(--primary)]/30 flex justify-center">
        <Link href="/personal/dashboard" className="flex items-center group" onClick={onClose}>
          <div className="group-hover:drop-shadow-[0_0_12px_var(--primary)] transition-all">
            <Logo size="xl" showSubtitle={false} textClassName="text-5xl" />
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
        {/* ═══════ DASHBOARD ═══════ */}
        <div className="mb-4">
          <Link
            href="/personal/dashboard"
            onClick={onClose}
            className={cn(
              "group relative flex items-center gap-3 rounded-none px-3 py-2.5 text-xs uppercase tracking-widest font-bold transition-all duration-300",
              isActive("/personal/dashboard")
                ? "bg-[var(--primary)]/10 text-[var(--primary)] dark:text-glow-cyan border border-[var(--primary)]/30"
                : "text-[var(--muted-foreground)] hover:bg-[var(--primary)]/5 hover:text-[var(--foreground)] border border-transparent hover:border-[var(--border)]"
            )}
          >
            {isActive("/personal/dashboard") && (
              <>
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--primary)] glow-cyan" />
                <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-[var(--primary)]" />
                <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-[var(--primary)]" />
              </>
            )}
            <LayoutDashboard className={cn("h-4 w-4", isActive("/personal/dashboard") ? "text-[var(--primary)] drop-shadow-[0_0_5px_var(--primary)]" : "")} />
            DASHBOARD
            <span className={cn(
              "ml-auto rounded-full px-2 py-0.5 text-[9px] font-mono font-bold",
              userPlan === "pro"
                ? "bg-[var(--warning)]/20 text-[var(--warning)] border border-[var(--warning)]/40 text-glow-yellow"
                : isTrial
                ? "bg-[var(--success)]/20 text-[var(--success)] border border-[var(--success)]/40 text-glow-green"
                : "bg-[var(--muted)]/20 text-[var(--muted-foreground)] border border-[var(--border)] text-glow-gray"
            )}>
              {userPlan === "pro" ? "PRO" : isTrial ? "TRIAL" : "FREE"}
            </span>
          </Link>
        </div>

        {/* ═══════ NOTIFICAÇÕES ═══════ */}
        <div className="mb-4">
          <Link
            href="/personal/notifications"
            onClick={onClose}
            className={cn(
              "group relative flex items-center gap-3 rounded-none px-3 py-2.5 text-xs uppercase tracking-widest font-bold transition-all duration-300",
              isActive("/personal/notifications")
                ? "bg-[var(--destructive)]/10 text-[var(--destructive)] border border-[var(--destructive)]/30"
                : "text-[var(--destructive)]/70 transition-all hover:bg-[var(--destructive)]/10 hover:text-[var(--destructive)] border border-transparent hover:border-[var(--destructive)]/50 hover:shadow-[0_0_8px_var(--destructive)]"
            )}
          >
            {isActive("/personal/notifications") && (
              <>
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--destructive)]" />
                <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-[var(--destructive)]" />
                <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-[var(--destructive)]" />
              </>
            )}
            <Bell className="h-4 w-4" />
            NOTIFICAÇÕES
          </Link>
        </div>

        {/* ═══════ AJUSTES ═══════ */}
        <div className="mb-4">
          <Link
            href="/personal/settings"
            onClick={onClose}
            className={cn(
              "group relative flex items-center gap-3 rounded-none px-3 py-2.5 text-xs uppercase tracking-widest font-bold transition-all duration-300",
              isActive("/personal/settings")
                ? "bg-[var(--primary)]/10 text-[var(--primary)] dark:text-glow-cyan border border-[var(--primary)]/30"
                : "text-[var(--muted-foreground)] hover:bg-[var(--primary)]/5 hover:text-[var(--foreground)] border border-transparent hover:border-[var(--border)]"
            )}
          >
            {isActive("/personal/settings") && (
              <>
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--primary)] glow-cyan" />
                <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-[var(--primary)]" />
                <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-[var(--primary)]" />
              </>
            )}
            <Settings className="h-4 w-4" />
            AJUSTES
          </Link>
        </div>

        {/* ═══════ SUPORTE ═══════ */}
        <div className="mb-4">
          <Link
            href="/personal/ajuda"
            onClick={onClose}
            className={cn(
              "group relative flex items-center gap-3 rounded-none px-3 py-2.5 text-xs uppercase tracking-widest font-bold transition-all duration-300",
              isActive("/personal/ajuda")
                ? "bg-[var(--success)]/10 text-[var(--success)] dark:text-glow-green border border-[var(--success)]/30"
                : "text-[var(--success)]/70 hover:bg-[var(--success)]/5 hover:text-[var(--success)] border border-transparent hover:border-[var(--success)]/30"
            )}
          >
            {isActive("/personal/ajuda") && (
              <>
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--success)] glow-green" />
                <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-[var(--success)]" />
                <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-[var(--success)]" />
              </>
            )}
            <HelpCircle className={cn("h-4 w-4", isActive("/personal/ajuda") ? "text-[var(--success)] drop-shadow-[0_0_5px_var(--success)]" : "")} />
            AJUDA
          </Link>
        </div>

        {/* ═══════ PESSOAL ═══════ */}
        <div className="mb-4">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--success)]/20 mb-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[var(--success)]/10 border border-[var(--success)]/30">
              <Home className="h-4 w-4 text-[var(--success)] drop-shadow-[0_0_2px_var(--success)]" />
            </div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--success)]/80">
              [ PESSOAL ]
            </span>
          </div>
          <div className="space-y-1">
            {personalItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "group relative flex items-center gap-3 px-3 py-2.5 text-xs font-mono transition-all duration-200 uppercase",
                    active
                      ? "bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/30"
                      : "text-[var(--muted-foreground)] hover:bg-[var(--success)]/5 hover:text-[var(--foreground)] border border-transparent"
                  )}
                >
                  {active && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--success)] glow-green" />
                  )}
                  <item.icon className={cn("h-4 w-4", active ? "text-[var(--success)] drop-shadow-[0_0_5px_var(--success)]" : "text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]")} />
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/personal/transactions/new"
              onClick={onClose}
              className="group flex items-center gap-3 border border-dashed border-[var(--success)]/40 px-3 py-2.5 text-xs font-mono uppercase tracking-widest text-[var(--success)]/80 transition-all duration-200 hover:border-[var(--success)] hover:bg-[var(--success)]/10 hover:text-[var(--success)] mt-1"
            >
              <Plus className="h-4 w-4" />
              REGISTRAR LANÇAMENTO
            </Link>
          </div>
        </div>

        {/* ═══════ NEGÓCIO ═══════ */}
        <div>
          <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--primary)]/20 mb-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[var(--primary)]/10 border border-[var(--primary)]/30">
              <Briefcase className="h-4 w-4 text-[var(--primary)] drop-shadow-[0_0_2px_var(--primary)]" />
            </div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--primary)]/80">
              [ NEGÓCIO ]
            </span>
          </div>

          {canUseBusinessScope ? (
            <div className="space-y-1">
              {businessItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "group relative flex items-center gap-3 px-3 py-2.5 text-xs font-mono transition-all duration-200 uppercase",
                      active
                        ? "bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30"
                        : "text-[var(--muted-foreground)] hover:bg-[var(--primary)]/5 hover:text-[var(--foreground)] border border-transparent"
                    )}
                  >
                    {active && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--primary)] glow-cyan" />
                    )}
                    <item.icon className={cn("h-4 w-4", active ? "text-[var(--primary)] drop-shadow-[0_0_5px_var(--primary)]" : "text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]")} />
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/business/transactions/new"
                onClick={onClose}
                className="group flex items-center gap-3 border border-dashed border-[var(--primary)]/40 px-3 py-2.5 text-xs font-mono uppercase tracking-widest text-[var(--primary)]/80 transition-all duration-200 hover:border-[var(--primary)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] mt-1"
              >
              <Plus className="h-4 w-4" />
              REGISTRAR LANÇAMENTO
            </Link>
            </div>
          ) : (
            <Link
              href="/personal/planos"
              onClick={onClose}
              className="mx-1 mt-1 flex items-center gap-3 border border-[var(--warning)]/30 bg-gradient-to-r from-[var(--warning)]/10 to-transparent px-3 py-2.5 text-xs font-mono uppercase transition-all duration-200 hover:border-[var(--warning)] hover:from-[var(--warning)]/20"
            >
              <div className="flex h-6 w-6 items-center justify-center bg-[var(--warning)]/20 border border-[var(--warning)]/40 shadow-[0_0_5px_var(--warning)]">
                <Crown className="h-3 w-3 text-[var(--warning)]" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-[var(--warning)]">ATIVAR NEGÓCIO</p>
                <p className="text-[10px] text-[var(--warning)]/70 tracking-widest">Requer Plano Pro</p>
              </div>
            </Link>
          )}
        </div>
      </nav>

      {/* ═══════ BOTTOM ═══════ */}
      <div className="border-t border-[var(--primary)]/30 p-3 bg-[#0B1221]/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-2 py-2 hud-border border-[var(--primary)]/20">
          <Link
            href="/personal/settings"
            onClick={onClose}
            className="group flex min-w-0 flex-1 items-center gap-3"
            title="Perfil e Ajustes"
          >
            <div className="avatar-ring flex h-8 w-8 items-center justify-center bg-[var(--primary)]/10 border border-[var(--primary)]/50 text-xs font-mono font-bold text-[var(--primary)] shadow-[0_0_10px_var(--primary)]">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-mono font-bold uppercase tracking-wider text-[var(--foreground)]">
                {userName || "USUÁRIO"}
              </p>
              <p className="truncate text-xs font-mono text-[var(--muted-foreground)]">
                {userEmail}
              </p>
            </div>
            <User className="h-3.5 w-3.5 shrink-0 text-[var(--primary)]/60 transition-all group-hover:text-[var(--primary)] group-hover:drop-shadow-[0_0_5px_var(--primary)]" />
          </Link>
          <button
            onClick={handleLogout}
            className="p-1.5 text-[var(--destructive)]/70 transition-all hover:bg-[var(--destructive)]/10 hover:text-[var(--destructive)] border border-transparent hover:border-[var(--destructive)]/50 hover:shadow-[0_0_8px_var(--destructive)]"
            title="Sair do Sistema"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-[var(--primary)]/30 lg:shadow-[2px_0_20px_rgba(0,255,204,0.08)]">
        {content}
      </aside>

      {/* Mobile sidebar overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md animate-fade-in"
            onClick={onClose}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 shadow-[2px_0_25px_rgba(0,255,204,0.2)] border-r border-[var(--primary)]/30 animate-slide-in-left">
            <div className="absolute -right-10 top-2 z-10">
              <button
                onClick={onClose}
                className="p-2 text-[var(--primary)] border border-[var(--primary)]/50 bg-[#0B1221]/95 backdrop-blur-md hover:bg-[var(--primary)]/20 hover:shadow-[0_0_15px_var(--primary)] transition-all animate-border-flicker"
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
