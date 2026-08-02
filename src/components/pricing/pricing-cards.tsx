"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Crown, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingCardsProps {
  currentPlan: "free" | "pro";
  onSelectPlan?: (plan: "free" | "pro") => void;
}

export function PricingCards({ currentPlan, onSelectPlan }: PricingCardsProps) {
  const plans = [
    {
      id: "free" as const,
      name: "Plano Grátis",
      subtitle: "Essencial",
      price: "0",
      period: "/mês",
      description: "Para quem quer organizar as finanças pessoais",
      features: [
        { text: "Até 10 lançamentos por mês", included: true },
        { text: "Controle de finanças pessoais", included: true },
        { text: "Contas recorrentes fixas", included: true },
        { text: "Finanças do negócio/trabalho", included: false },
        { text: "Projeção de compras parceladas", included: false },
        { text: "Dashboard e gráficos avançados", included: false },
      ],
      buttonLabel: currentPlan === "free" ? "Plano Atual" : "Plano Grátis",
      isRecommended: false,
    },
    {
      id: "pro" as const,
      name: "Plano Pro",
      subtitle: "Recomendado",
      price: "9,90",
      period: "/mês",
      description: "Para quem trabalha por conta própria",
      features: [
        { text: "Lançamentos ilimitados", included: true },
        { text: "Negócio vs Pessoal separados", included: true },
        { text: "Cálculo de lucro líquido real", included: true },
        { text: "Lançamentos parcelados", included: true },
        { text: "Dashboard completo com gráficos", included: true },
        { text: "Previsão de contas do próximo mês", included: true },
      ],
      buttonLabel: currentPlan === "pro" ? "Plano Atual" : "Assinar Pro",
      isRecommended: true,
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={cn(
            "relative rounded-2xl border-2 p-6 transition-all",
            plan.isRecommended
              ? "border-[var(--primary)] bg-[var(--card)] shadow-xl shadow-[var(--primary)]/10"
              : "border-[var(--border)] bg-[var(--card)]",
            currentPlan === plan.id && "opacity-75"
          )}
        >
          {plan.isRecommended && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-1 rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-semibold text-white">
                <Crown className="h-3 w-3" />
                Recomendado
              </div>
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-[var(--foreground)]">
                {plan.name}
              </h3>
              {currentPlan === plan.id && (
                <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-xs font-medium text-[var(--muted-foreground)]">
                  Atual
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              {plan.subtitle}
            </p>
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-1">
              <span className="text-sm text-[var(--muted-foreground)]">R$</span>
              <span className="text-4xl font-bold text-[var(--foreground)]">
                {plan.price}
              </span>
              <span className="text-sm text-[var(--muted-foreground)]">
                {plan.period}
              </span>
            </div>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {plan.description}
            </p>
            {plan.id === "pro" && (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Assinatura mensal no Cartão de Crédito
              </p>
            )}
          </div>

          <ul className="mb-6 space-y-3">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                {feature.included ? (
                  <CheckCircle className="h-5 w-5 text-[var(--success)] shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-[var(--muted-foreground)]/40 shrink-0" />
                )}
                <span
                  className={cn(
                    "text-sm",
                    feature.included
                      ? "text-[var(--foreground)]"
                      : "text-[var(--muted-foreground)]/60"
                  )}
                >
                  {feature.text}
                </span>
              </li>
            ))}
          </ul>

          <Button
            variant={plan.isRecommended ? "default" : "outline"}
            className="w-full"
            disabled={currentPlan === plan.id}
            onClick={() => onSelectPlan?.(plan.id)}
          >
            {currentPlan === plan.id ? (
              "Plano Atual"
            ) : plan.id === "pro" ? (
              <span className="flex items-center gap-2">
                Assinar Pro
                <Lock className="h-3 w-3" />
              </span>
            ) : (
              plan.buttonLabel
            )}
          </Button>
        </div>
      ))}
    </div>
  );
}
