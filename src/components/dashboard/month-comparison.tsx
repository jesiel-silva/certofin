"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, getMonthLabel } from "@/lib/utils";
import type { MonthlySummary } from "@/lib/types";
import { TrendingUp, TrendingDown, Minus, ArrowRight, Lock } from "lucide-react";

interface MonthComparisonProps {
  data: MonthlySummary[];
  userPlan?: "free" | "pro" | "trial";
}

export function MonthComparison({ data, userPlan = "free" }: MonthComparisonProps) {
  if (userPlan === "free") {
    return (
      <Card className="hud-border overflow-hidden bg-[#0B1221]/80 backdrop-blur-sm scanline-overlay opacity-60">
        <CardHeader className="pb-2">
          <div className="border-b border-[var(--primary)]/20 pb-2 mb-2">
            <CardTitle className="text-xs sm:text-sm font-display font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
              COMPARAÇÃO COM MÊS ANTERIOR
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--warning)]/10 border border-[var(--warning)]/30">
              <Lock className="h-6 w-6 text-[var(--warning)]" />
            </div>
            <p className="text-sm font-medium text-[var(--foreground)]">
              Relatório disponível no Plano Pro
            </p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              Faça upgrade para ver a comparação entre meses
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length < 2) {
    return null;
  }

  const currentMonth = data[data.length - 1];
  const previousMonth = data[data.length - 2];

  const personalDiff = currentMonth.personal_income - previousMonth.personal_income;
  const businessDiff = currentMonth.business_income - previousMonth.business_income;
  const personalExpenseDiff = currentMonth.personal_expense - previousMonth.personal_expense;
  const businessExpenseDiff = currentMonth.business_expense - previousMonth.business_expense;

  const hasNoPersonalData = previousMonth.personal_income === 0 && previousMonth.personal_expense === 0;
  const hasNoBusinessData = previousMonth.business_income === 0 && previousMonth.business_expense === 0;

  const currentMonthLabel = getMonthLabel(currentMonth.month);
  const previousMonthLabel = getMonthLabel(previousMonth.month);

  return (
    <Card className="hud-border overflow-hidden bg-[#0B1221]/80 backdrop-blur-sm scanline-overlay">
      <CardHeader className="pb-2">
        <div className="border-b border-[var(--primary)]/20 pb-2 mb-2">
          <CardTitle className="text-xs sm:text-sm font-display font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
            COMPARAÇÃO COM MÊS ANTERIOR
          </CardTitle>
          <p className="text-xs sm:text-sm font-mono text-[var(--muted-foreground)] mt-1">
            {previousMonthLabel} <ArrowRight className="inline h-3 w-3" /> {currentMonthLabel}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pessoal */}
          <div className="rounded-lg border border-[var(--success)]/20 bg-[var(--success)]/5 p-4">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[var(--success)] mb-3">
              PESSOAL
            </p>
            
            <div className="space-y-3">
              {/* Receita */}
              <div>
                <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mb-1">Receita</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-base sm:text-lg font-mono font-bold text-[var(--foreground)]">
                    {formatCurrency(currentMonth.personal_income)}
                  </span>
                  <ComparisonBadge diff={personalDiff} noPreviousData={hasNoPersonalData} />
                </div>
                <p className="text-[10px] sm:text-xs font-mono text-[var(--muted-foreground)] mt-1">
                  {hasNoPersonalData ? "Sem lançamentos anteriores" : `Mês anterior: ${formatCurrency(previousMonth.personal_income)}`}
                </p>
              </div>

              {/* Gastos */}
              <div>
                <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mb-1">Gastos</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-base sm:text-lg font-mono font-bold text-[var(--foreground)]">
                    {formatCurrency(currentMonth.personal_expense)}
                  </span>
                  <ComparisonBadge diff={personalExpenseDiff} invertColors noPreviousData={hasNoPersonalData} />
                </div>
                <p className="text-[10px] sm:text-xs font-mono text-[var(--muted-foreground)] mt-1">
                  {hasNoPersonalData ? "Sem lançamentos anteriores" : `Mês anterior: ${formatCurrency(previousMonth.personal_expense)}`}
                </p>
              </div>
            </div>
          </div>

          {/* Negócio */}
          <div className="rounded-lg border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-4">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[var(--primary)] mb-3">
              NEGÓCIO
            </p>
            
            <div className="space-y-3">
              {/* Receita */}
              <div>
                <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mb-1">Receita</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-base sm:text-lg font-mono font-bold text-[var(--foreground)]">
                    {formatCurrency(currentMonth.business_income)}
                  </span>
                  <ComparisonBadge diff={businessDiff} noPreviousData={hasNoBusinessData} />
                </div>
                <p className="text-[10px] sm:text-xs font-mono text-[var(--muted-foreground)] mt-1">
                  {hasNoBusinessData ? "Sem lançamentos anteriores" : `Mês anterior: ${formatCurrency(previousMonth.business_income)}`}
                </p>
              </div>

              {/* Gastos */}
              <div>
                <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mb-1">Gastos</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-base sm:text-lg font-mono font-bold text-[var(--foreground)]">
                    {formatCurrency(currentMonth.business_expense)}
                  </span>
                  <ComparisonBadge diff={businessExpenseDiff} invertColors noPreviousData={hasNoBusinessData} />
                </div>
                <p className="text-[10px] sm:text-xs font-mono text-[var(--muted-foreground)] mt-1">
                  {hasNoBusinessData ? "Sem lançamentos anteriores" : `Mês anterior: ${formatCurrency(previousMonth.business_expense)}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ComparisonBadge({ diff, invertColors = false, noPreviousData = false }: { diff: number; invertColors?: boolean; noPreviousData?: boolean }) {
  if (noPreviousData) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--muted)]/20 px-2 py-1 text-[10px] sm:text-xs font-mono font-bold text-[var(--muted-foreground)]">
        <Minus className="h-3 w-3" />
        Sem dados
      </span>
    );
  }

  const isPositive = invertColors ? diff < 0 : diff > 0;

  if (diff === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--muted)]/20 px-2 py-1 text-[10px] sm:text-xs font-mono font-bold text-[var(--muted-foreground)]">
        <Minus className="h-3 w-3" />
        Igual
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] sm:text-xs font-mono font-bold ${
        isPositive
          ? "bg-[var(--success)]/10 text-[var(--success)]"
          : "bg-[var(--destructive)]/10 text-[var(--destructive)]"
      }`}
    >
      {isPositive ? (
        <>
          <TrendingUp className="h-3 w-3" />
          +{formatCurrency(Math.abs(diff))}
        </>
      ) : (
        <>
          <TrendingDown className="h-3 w-3" />
          -{formatCurrency(Math.abs(diff))}
        </>
      )}
    </span>
  );
}
