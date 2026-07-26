"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  CalendarClock,
  Plus,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface KpiCardsProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  pendingAmount: number;
  pendingCount: number;
}

export function KpiCards({
  totalIncome,
  totalExpense,
  balance,
  pendingAmount,
  pendingCount,
}: KpiCardsProps) {
  const cards = [
    {
      title: "Entradas do Mês",
      value: totalIncome,
      icon: TrendingUp,
      color: "text-[var(--income)]",
      bg: "bg-[var(--income)]/10",
      hint: "Adicione seu salário, freelance, vendas...",
      hintLink: "/transactions/new?type=income",
      hintLabel: "+ Adicionar receita",
      isEmpty: totalIncome === 0,
    },
    {
      title: "Saídas Pagas",
      value: totalExpense,
      icon: TrendingDown,
      color: "text-[var(--expense)]",
      bg: "bg-[var(--expense)]/10",
      hint: "Registre contas, aluguel, mercado...",
      hintLink: "/transactions/new?type=expense",
      hintLabel: "+ Adicionar despesa",
      isEmpty: totalExpense === 0,
    },
    {
      title: "Saldo Geral",
      value: balance,
      icon: Wallet,
      color:
        balance >= 0 ? "text-[var(--income)]" : "text-[var(--expense)]",
      bg: balance >= 0 ? "bg-[var(--income)]/10" : "bg-[var(--expense)]/10",
      hint: "Adicione lançamentos para ver seu saldo",
      hintLink: "/transactions/new?type=income",
      hintLabel: "+ Começar",
      isEmpty: totalIncome === 0 && totalExpense === 0,
    },
    {
      title: "A Pagar (Pendente)",
      value: pendingAmount,
      count: pendingCount,
      icon: CalendarClock,
      color: "text-[var(--warning)]",
      bg: "bg-[var(--warning)]/10",
      hint: "Nenhuma conta pendente",
      hintLink: null,
      hintLabel: "",
      isEmpty: pendingAmount === 0,
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
            {card.count !== undefined && card.count > 0 && (
              <p className="mt-1 text-sm font-medium text-[var(--muted-foreground)]">
                {card.count} {card.count === 1 ? "conta" : "contas"} {card.count === 1 ? "pendente" : "pendentes"}
              </p>
            )}
            {card.isEmpty && card.hintLink && (
              <Link href={card.hintLink}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-auto p-0 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                >
                  {card.hintLabel}
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
