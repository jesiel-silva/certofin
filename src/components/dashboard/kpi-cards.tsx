"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  CalendarClock,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface KpiCardsProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  pendingNextMonth: number;
}

export function KpiCards({
  totalIncome,
  totalExpense,
  balance,
  pendingNextMonth,
}: KpiCardsProps) {
  const cards = [
    {
      title: "Entradas do Mês",
      value: totalIncome,
      icon: TrendingUp,
      color: "text-[var(--income)]",
      bg: "bg-[var(--income)]/10",
    },
    {
      title: "Saídas do Mês",
      value: totalExpense,
      icon: TrendingDown,
      color: "text-[var(--expense)]",
      bg: "bg-[var(--expense)]/10",
    },
    {
      title: "Saldo Geral",
      value: balance,
      icon: Wallet,
      color:
        balance >= 0 ? "text-[var(--income)]" : "text-[var(--expense)]",
      bg: balance >= 0 ? "bg-[var(--income)]/10" : "bg-[var(--expense)]/10",
    },
    {
      title: "A Pagar Próx. Mês",
      value: pendingNextMonth,
      icon: CalendarClock,
      color: "text-[var(--warning)]",
      bg: "bg-[var(--warning)]/10",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">
              {card.title}
            </CardTitle>
            <div className={cn("rounded-lg p-2", card.bg)}>
              <card.icon className={cn("h-4 w-4", card.color)} />
            </div>
          </CardHeader>
          <CardContent>
            <p className={cn("text-2xl font-bold", card.color)}>
              {formatCurrency(card.value)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
