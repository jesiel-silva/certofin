"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, getMonthLabel } from "@/lib/utils";
import type { MonthlySummary } from "@/lib/types";
import { TrendingUp, TrendingDown, Minus, ArrowRight, Lock } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";

interface MonthComparisonProps {
  data: MonthlySummary[];
  userPlan?: "free" | "pro" | "trial";
  selectedMonth?: string;
}

export function MonthComparison({ data, userPlan = "free", selectedMonth }: MonthComparisonProps) {
  if (userPlan === "free") {
    return (
      <Card className="hud-border bg-[#0B1221]/80 backdrop-blur-sm scanline-overlay opacity-60 min-w-0">
        <CardHeader className="pb-2">
          <div className="border-b border-[var(--primary)]/20 pb-2 mb-2">
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-sm sm:text-base font-display font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
                COMPARAÇÃO COM MÊS ANTERIOR
              </CardTitle>
              <Tooltip content="Compara o que você ganhou e gastou entre o mês passado e o mês atual, para ver se melhorou ou piorou." />
            </div>
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

  const targetMonthStr = selectedMonth || (data.length > 0 ? data[data.length - 1].month : "");
  if (!targetMonthStr) {
    return null;
  }

  const [yearNum, monthNum] = targetMonthStr.split("-").map(Number);
  const prevDate = new Date(yearNum, monthNum - 2, 1);
  const prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;

  const currentMonth = data.find((d) => d.month === targetMonthStr) || {
    month: targetMonthStr,
    total_income: 0,
    total_expense: 0,
    balance: 0,
    personal_income: 0,
    personal_expense: 0,
  };

  const previousMonth = data.find((d) => d.month === prevMonthStr) || {
    month: prevMonthStr,
    total_income: 0,
    total_expense: 0,
    balance: 0,
    personal_income: 0,
    personal_expense: 0,
  };

  const personalDiff = currentMonth.personal_income - previousMonth.personal_income;
  const personalExpenseDiff = currentMonth.personal_expense - previousMonth.personal_expense;

  const hasNoPersonalData = previousMonth.personal_income === 0 && previousMonth.personal_expense === 0;

  const currentMonthLabel = getMonthLabel(currentMonth.month);
  const previousMonthLabel = getMonthLabel(previousMonth.month);

  return (
    <Card className="hud-border bg-[#0B1221]/80 backdrop-blur-sm scanline-overlay min-w-0">
      <CardHeader className="pb-2">
        <div className="border-b border-[var(--primary)]/20 pb-2 mb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm sm:text-base font-display font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
              COMPARAÇÃO COM MÊS ANTERIOR
            </CardTitle>
            <Tooltip content="Compara o que você ganhou e gastou entre o mês passado e o mês atual, para ver se melhorou ou piorou." className="shrink-0" />
          </div>
          <p className="text-sm sm:text-base font-sans text-[var(--muted-foreground)] mt-1">
            {previousMonthLabel} <ArrowRight className="inline h-3 w-3" /> {currentMonthLabel}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          {/* Pessoal */}
          <div className="rounded-lg border border-[var(--success)]/20 bg-[var(--success)]/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <p className="text-sm sm:text-base font-bold uppercase tracking-widest text-[var(--success)]">
                PESSOAL
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Receita */}
              <div>
                <p className="text-sm sm:text-base text-[var(--muted-foreground)] mb-1">Receita</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-lg sm:text-xl font-sans font-bold text-[var(--foreground)]">
                    {formatCurrency(currentMonth.personal_income)}
                  </span>
                  <ComparisonBadge diff={personalDiff} noPreviousData={hasNoPersonalData} />
                </div>
                <p className="text-xs sm:text-sm font-sans text-[var(--muted-foreground)] mt-1">
                  {hasNoPersonalData ? "Sem lançamentos anteriores" : `Mês anterior: ${formatCurrency(previousMonth.personal_income)}`}
                </p>
              </div>

              {/* Gastos */}
              <div>
                <p className="text-sm sm:text-base text-[var(--muted-foreground)] mb-1">Gastos</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-lg sm:text-xl font-sans font-bold text-[var(--foreground)]">
                    {formatCurrency(currentMonth.personal_expense)}
                  </span>
                  <ComparisonBadge diff={personalExpenseDiff} invertColors noPreviousData={hasNoPersonalData} />
                </div>
                <p className="text-xs sm:text-sm font-sans text-[var(--muted-foreground)] mt-1">
                  {hasNoPersonalData ? "Sem lançamentos anteriores" : `Mês anterior: ${formatCurrency(previousMonth.personal_expense)}`}
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
      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--muted)]/20 px-2 py-1 text-xs sm:text-sm font-sans font-bold text-[var(--muted-foreground)]">
        <Minus className="h-3 w-3" />
        Sem dados
      </span>
    );
  }

  const isPositive = invertColors ? diff < 0 : diff > 0;

  if (diff === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--muted)]/20 px-2 py-1 text-xs sm:text-sm font-sans font-bold text-[var(--muted-foreground)]">
        <Minus className="h-3 w-3" />
        Igual
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs sm:text-sm font-sans font-bold ${
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
