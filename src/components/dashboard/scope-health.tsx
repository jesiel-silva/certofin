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
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <div className="rounded-lg bg-[var(--business)]/10 p-2">
            <Briefcase className="h-4 w-4 text-[var(--business)]" />
          </div>
          <CardTitle className="text-sm font-medium">
            Saúde do Negócio (Pago)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-[var(--income)]">
              <TrendingUp className="h-3 w-3" /> Faturado
            </span>
            <span className="text-sm font-semibold text-[var(--income)]">
              {formatCurrency(businessIncome)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-[var(--expense)]">
              <TrendingDown className="h-3 w-3" /> Custos
            </span>
            <span className="text-sm font-semibold text-[var(--expense)]">
              {formatCurrency(businessExpense)}
            </span>
          </div>
          <div className="border-t border-[var(--border)] pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Lucro Líquido</span>
              <span
                className={cn(
                  "text-lg font-bold",
                  businessProfit >= 0
                    ? "text-[var(--income)]"
                    : "text-[var(--expense)]"
                )}
              >
                {formatCurrency(businessProfit)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <div className="rounded-lg bg-[var(--personal)]/10 p-2">
            <Home className="h-4 w-4 text-[var(--personal)]" />
          </div>
          <CardTitle className="text-sm font-medium">
            Saúde Pessoal (Pago)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-[var(--income)]">
              <TrendingUp className="h-3 w-3" /> Renda
            </span>
            <span className="text-sm font-semibold text-[var(--income)]">
              {formatCurrency(personalIncome)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-[var(--expense)]">
              <TrendingDown className="h-3 w-3" /> Custos Domésticos
            </span>
            <span className="text-sm font-semibold text-[var(--expense)]">
              {formatCurrency(personalExpense)}
            </span>
          </div>
          <div className="border-t border-[var(--border)] pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sobra Pessoal</span>
              <span
                className={cn(
                  "text-lg font-bold",
                  personalSurplus >= 0
                    ? "text-[var(--income)]"
                    : "text-[var(--expense)]"
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
