"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface KpiCardsProps {
  personalIncome: number;
  personalExpense: number;
  businessIncome: number;
  businessExpense: number;
  personalPendingIncome: number;
  personalPendingExpense: number;
  businessPendingIncome: number;
  businessPendingExpense: number;
  isEmpty: boolean;
}

export function KpiCards({
  personalIncome,
  personalExpense,
  businessIncome,
  businessExpense,
  personalPendingIncome,
  personalPendingExpense,
  businessPendingIncome,
  businessPendingExpense,
  isEmpty,
}: KpiCardsProps) {
  const personalNet = personalIncome - personalExpense;
  const businessNet = businessIncome - businessExpense;

  const cards = [
    {
      title: "Receita Pessoal",
      value: personalNet,
      icon: TrendingUp,
      color: personalNet >= 0 ? "text-[var(--success)]" : "text-[var(--destructive)]",
      glowTextClass: personalNet >= 0 ? "text-glow-green" : "text-glow-red",
      bg: personalNet >= 0 ? "bg-[var(--success)]/10 glow-green" : "bg-[var(--destructive)]/10 glow-red",
      iconGlow: personalNet >= 0 ? "animate-pulse-glow" : "",
      subtitle: null,
      pending: personalPendingIncome > 0 ? `A receber - ${formatCurrency(personalPendingIncome)}` : null,
    },
    {
      title: "Gastos Pessoal",
      value: personalExpense,
      icon: TrendingDown,
      color: "text-[var(--destructive)]",
      glowTextClass: "text-glow-red",
      bg: "bg-[var(--destructive)]/10 glow-red",
      iconGlow: "animate-pulse-glow",
      subtitle: null,
      pending: personalPendingExpense > 0 ? `A pagar - ${formatCurrency(personalPendingExpense)}` : null,
    },
    {
      title: "Receita Negócio",
      value: businessNet,
      icon: TrendingUp,
      color: businessNet >= 0 ? "text-[var(--primary)]" : "text-[var(--destructive)]",
      glowTextClass: businessNet >= 0 ? "text-glow-cyan" : "text-glow-red",
      bg: businessNet >= 0 ? "bg-[var(--primary)]/10 glow-cyan" : "bg-[var(--destructive)]/10 glow-red",
      iconGlow: businessNet >= 0 ? "animate-pulse-glow" : "",
      subtitle: null,
      pending: businessPendingIncome > 0 ? `A receber - ${formatCurrency(businessPendingIncome)}` : null,
    },
    {
      title: "Gastos Negócio",
      value: businessExpense,
      icon: TrendingDown,
      color: "text-[var(--warning)]",
      glowTextClass: "text-glow-yellow",
      bg: "bg-[var(--warning)]/10 glow-yellow",
      iconGlow: "animate-pulse-glow",
      subtitle: null,
      pending: businessPendingExpense > 0 ? `A pagar - ${formatCurrency(businessPendingExpense)}` : null,
    },
  ];

  if (isEmpty) {
    return (
      <div className="hud-border p-8 text-center scanline-overlay animate-fade-in-up">
        <Wallet className="mx-auto h-10 w-10 text-[var(--primary)]/40 animate-pulse-glow" />
        <p className="mt-3 text-base sm:text-lg font-mono font-medium text-[var(--muted-foreground)]">
          NENHUM LANÇAMENTO DETECTADO
        </p>
        <p className="mt-1 text-sm sm:text-base font-mono text-[var(--muted-foreground)]/70">
          [ AGUARDANDO DADOS... ]
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card
          key={card.title}
          className={cn(
            "hud-border overflow-hidden bg-[#0B1221]/80 backdrop-blur-sm scanline-overlay animate-fade-in-up",
            `delay-${(index + 1) * 100}`
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm sm:text-base font-display font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
              {card.title}
            </CardTitle>
            <div className={cn("rounded-none p-2 border border-[currentColor]/30 bg-[currentColor]/10 transition-all duration-300", card.bg, card.iconGlow)}>
              <card.icon className={cn("h-4 w-4 sm:h-5 sm:w-5", card.color)} />
            </div>
          </CardHeader>
          <CardContent>
            <p className={cn("text-xl sm:text-3xl font-sans font-bold tracking-tight", card.color, card.glowTextClass)}>
              {formatCurrency(card.value)}
            </p>
            {card.subtitle && (
              <p className="mt-1 text-sm sm:text-base text-[var(--muted-foreground)] font-sans opacity-80">
                {card.subtitle}
              </p>
            )}
            {card.pending && (
              <p className="mt-1 text-sm sm:text-base text-[var(--muted-foreground)] font-sans opacity-80">
                {card.pending}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
