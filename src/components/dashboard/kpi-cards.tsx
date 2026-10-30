"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";

interface KpiCardsProps {
  personalIncome: number;
  personalExpense: number;
  personalPendingIncome: number;
  personalPendingExpense: number;
  isEmpty: boolean;
}

export function KpiCards({
  personalIncome,
  personalExpense,
  personalPendingIncome,
  personalPendingExpense,
  isEmpty,
}: KpiCardsProps) {
  const personalNet = personalIncome - personalExpense;

  const cards = [
    {
      title: "Receita Pessoal",
      tooltip: "Quanto você ganhou de pessoal, já tirando os gastos. Se estiver no positivo, sobrou dinheiro no final do mês.",
      value: personalNet,
      icon: TrendingUp,
      color: personalNet >= 0 ? "text-[var(--success)]" : "text-[var(--destructive)]",
      glowTextClass: personalNet >= 0 ? "text-glow-green" : "text-glow-red",
      bg: personalNet >= 0 ? "bg-[var(--success)]/10 glow-green" : "bg-[var(--destructive)]/10 glow-red",
      iconGlow: personalNet >= 0 ? "animate-pulse-glow" : "",
      subtitle: null,
      pending: personalPendingIncome > 0 ? `A receber - ${formatCurrency(personalPendingIncome)}` : null,
      pendingTooltip: "Valores que você ainda não confirmou que recebeu. É só clicar no lançamento para atualizar.",
    },
    {
      title: "Gastos Pessoal",
      tooltip: "Tudo o que você gastou do seu bolso pessoal neste período.",
      value: personalExpense,
      icon: TrendingDown,
      color: "text-[var(--destructive)]",
      glowTextClass: "text-glow-red",
      bg: "bg-[var(--destructive)]/10 glow-red",
      iconGlow: "animate-pulse-glow",
      subtitle: null,
      pending: personalPendingExpense > 0 ? `A pagar - ${formatCurrency(personalPendingExpense)}` : null,
      pendingTooltip: "Contas que ainda não foram pagas. Clique no lançamento para marcar como pago.",
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
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
      {cards.map((card, index) => (
        <Card
          key={card.title}
          className={cn(
            "hud-border bg-[#0B1221]/80 backdrop-blur-sm scanline-overlay animate-fade-in-up min-w-0",
            `delay-${(index + 1) * 100}`
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <div className="flex items-center gap-2 min-w-0">
              <CardTitle className="text-xs sm:text-sm font-display font-bold uppercase tracking-wider text-[var(--muted-foreground)] truncate">
                {card.title}
              </CardTitle>
              <Tooltip content={card.tooltip} className="shrink-0" />
            </div>
            <div className={cn("rounded-none p-2 border border-[currentColor]/30 bg-[currentColor]/10 transition-all duration-300 shrink-0", card.bg, card.iconGlow)}>
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
              <div className="mt-1.5 flex items-center gap-2">
                <p className="text-xs sm:text-sm text-[var(--muted-foreground)] font-sans opacity-85">
                  {card.pending}
                </p>
                {card.pendingTooltip && <Tooltip content={card.pendingTooltip} className="shrink-0" />}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
