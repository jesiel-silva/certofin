"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Home, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ScopeHealthProps {
  businessIncome: number;
  businessExpense: number;
  personalIncome: number;
  personalExpense: number;
}

export function ScopeHealth({
  businessIncome,
  businessExpense,
  personalIncome,
  personalExpense,
}: ScopeHealthProps) {
  const businessProfit = businessIncome - businessExpense;
  const personalSurplus = personalIncome - personalExpense;

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
      <Card className="hud-border overflow-hidden bg-[#0B1221]/80 backdrop-blur-sm transition-all hover:border-[var(--primary)]/50 hover:shadow-[0_0_20px_rgba(0,255,204,0.1)] scanline-overlay">
        <CardHeader className="flex flex-row items-center gap-3 pb-2 border-b border-[var(--primary)]/20 mb-3">
          <div className="rounded-none bg-[var(--primary)]/10 p-2 border border-[var(--primary)]/30 glow-cyan">
            <Briefcase className="h-4 w-4 text-[var(--primary)]" />
          </div>
          <CardTitle className="text-xs sm:text-sm font-display font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
            SAÚDE DO NEGÓCIO (PAGO)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs sm:text-sm font-display font-bold uppercase tracking-widest text-[var(--primary)]">
              <TrendingUp className="h-3 w-3" /> FATURADO
            </span>
            <span className="text-sm sm:text-base font-mono font-bold text-[var(--primary)] text-glow-cyan">
              {formatCurrency(businessIncome)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs sm:text-sm font-display font-bold uppercase tracking-widest text-[var(--warning)]">
              <TrendingDown className="h-3 w-3" /> CUSTOS
            </span>
            <span className="text-sm sm:text-base font-mono font-bold text-[var(--warning)] text-glow-yellow">
              {formatCurrency(businessExpense)}
            </span>
          </div>
          <div className="border-t border-[var(--primary)]/20 pt-3 mt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-widest text-[var(--foreground)] opacity-80">LUCRO LÍQUIDO</span>
              <span
                className={cn(
                  "text-lg sm:text-xl font-mono font-bold",
                  businessProfit >= 0
                    ? "text-[var(--success)] text-glow-green"
                    : "text-[var(--destructive)] text-glow-red"
                )}
              >
                {formatCurrency(businessProfit)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hud-border overflow-hidden bg-[#0B1221]/80 backdrop-blur-sm transition-all hover:border-[var(--personal)]/50 hover:shadow-[0_0_20px_rgba(5,67,136,0.15)] scanline-overlay">
        <CardHeader className="flex flex-row items-center gap-3 pb-2 border-b border-[var(--personal)]/20 mb-3">
          <div className="rounded-none bg-[var(--personal)]/10 p-2 border border-[var(--personal)]/30 shadow-[0_0_12px_rgba(5,67,136,0.4)]">
            <Home className="h-4 w-4 text-[var(--personal)]" />
          </div>
          <CardTitle className="text-xs sm:text-sm font-display font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
            SAÚDE PESSOAL (PAGO)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs sm:text-sm font-display font-bold uppercase tracking-widest text-[var(--success)]">
              <TrendingUp className="h-3 w-3" /> RENDA
            </span>
            <span className="text-sm sm:text-base font-mono font-bold text-[var(--success)] text-glow-green">
              {formatCurrency(personalIncome)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs sm:text-sm font-display font-bold uppercase tracking-widest text-[var(--destructive)]">
              <TrendingDown className="h-3 w-3" /> CUSTOS DOMÉSTICOS
            </span>
            <span className="text-sm sm:text-base font-mono font-bold text-[var(--destructive)] text-glow-red">
              {formatCurrency(personalExpense)}
            </span>
          </div>
          <div className="border-t border-[var(--personal)]/20 pt-3 mt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-widest text-[var(--foreground)] opacity-80">SOBRA PESSOAL</span>
              <span
                className={cn(
                  "text-lg sm:text-xl font-mono font-bold",
                  personalSurplus >= 0
                    ? "text-[var(--success)] text-glow-green"
                    : "text-[var(--destructive)] text-glow-red"
                )}
              >
                {formatCurrency(personalSurplus)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
