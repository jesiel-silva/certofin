"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  DollarSign,
  BarChart3,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface KpiCardsProps {
  personalIncome: number;
  personalExpense: number;
  businessIncome: number;
  businessExpense: number;
  businessProfit: number;
  isEmpty: boolean;
}

export function KpiCards({
  personalIncome,
  personalExpense,
  businessIncome,
  businessExpense,
  businessProfit,
  isEmpty,
}: KpiCardsProps) {
  const personalNet = personalIncome - personalExpense;
  const businessNet = businessIncome - businessExpense;

  const cards = [
    {
      title: "Receita Pessoal",
      value: personalNet,
      icon: TrendingUp,
      color: personalNet >= 0 ? "text-emerald-600" : "text-rose-600",
      bg: personalNet >= 0 ? "bg-emerald-500/10" : "bg-rose-500/10",
      subtitle: `${formatCurrency(personalIncome)} - ${formatCurrency(personalExpense)}`,
    },
    {
      title: "Gastos Pessoal",
      value: personalExpense,
      icon: TrendingDown,
      color: "text-rose-600",
      bg: "bg-rose-500/10",
      subtitle: null,
    },
    {
      title: "Receita Negócio",
      value: businessNet,
      icon: TrendingUp,
      color: businessNet >= 0 ? "text-blue-600" : "text-rose-600",
      bg: businessNet >= 0 ? "bg-blue-500/10" : "bg-rose-500/10",
      subtitle: `${formatCurrency(businessIncome)} - ${formatCurrency(businessExpense)}`,
    },
    {
      title: "Gastos Negócio",
      value: businessExpense,
      icon: TrendingDown,
      color: "text-orange-600",
      bg: "bg-orange-500/10",
      subtitle: null,
    },
    {
      title: "Lucro da Empresa",
      value: businessProfit,
      icon: DollarSign,
      color: businessProfit >= 0 ? "text-emerald-600" : "text-rose-600",
      bg: businessProfit >= 0 ? "bg-emerald-500/10" : "bg-rose-500/10",
      subtitle: null,
    },
  ];

  if (isEmpty) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] p-8 text-center">
        <Wallet className="mx-auto h-10 w-10 text-[var(--muted-foreground)]/40" />
        <p className="mt-3 text-sm font-medium text-[var(--muted-foreground)]">
          Nenhum lançamento este mês
        </p>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]/70">
          Comece adicionando uma receita ou despesa
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              {card.title}
            </CardTitle>
            <div className={cn("rounded-lg p-2", card.bg)}>
              <card.icon className={cn("h-5 w-5", card.color)} />
            </div>
          </CardHeader>
          <CardContent>
            <p className={cn("text-2xl font-bold", card.color)}>
              {formatCurrency(card.value)}
            </p>
            {card.subtitle && (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {card.subtitle}
              </p>
            )}
            {card.title === "Lucro da Empresa" && (
              <p className="mt-1 text-xs font-medium text-[var(--muted-foreground)]">
                Receita - Gastos do negócio
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
