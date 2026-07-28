"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

interface WelcomeCardProps {
  scope?: "personal" | "business";
}

export function WelcomeCard({ scope = "personal" }: WelcomeCardProps) {
  const prefix = scope === "business" ? "/business" : "/personal";
  const scopeLabel = scope === "business" ? "do seu negócio" : "pessoais";

  return (
    <Card className="border-[var(--primary)]/20 bg-gradient-to-br from-[var(--primary)]/5 to-transparent">
      <CardContent className="p-6 sm:p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="rounded-2xl bg-[var(--primary)]/10 p-3">
            <Sparkles className="h-6 w-6 text-[var(--primary)]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              Nenhum lançamento {scopeLabel} este mês
            </h2>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              Comece cadastrando suas receitas e despesas para ver seus
              números aqui.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 mb-6">
          <Link href={`${prefix}/transactions/new?type=income`} className="flex-1">
            <Button
              variant="outline"
              className="w-full h-auto py-4 border-[var(--income)]/30 hover:bg-[var(--income)]/5 hover:border-[var(--income)]/50"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[var(--income)]/10 p-2.5">
                  <ArrowDownLeft className="h-5 w-5 text-[var(--income)]" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-[var(--foreground)]">
                    Adicionar Receita
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {scope === "business" ? "Venda, serviço, cliente..." : "Salário, freelancer, vendas..."}
                  </p>
                </div>
              </div>
            </Button>
          </Link>

          <Link href={`${prefix}/transactions/new?type=expense`} className="flex-1">
            <Button
              variant="outline"
              className="w-full h-auto py-4 border-[var(--expense)]/30 hover:bg-[var(--expense)]/5 hover:border-[var(--expense)]/50"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[var(--expense)]/10 p-2.5">
                  <ArrowUpRight className="h-5 w-5 text-[var(--expense)]" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-[var(--foreground)]">
                    Adicionar Despesa
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {scope === "business" ? "Insumo, combustível, aluguel..." : "Conta de luz, aluguel, mercado..."}
                  </p>
                </div>
              </div>
            </Button>
          </Link>
        </div>

        <div className="rounded-xl bg-[var(--accent)]/50 p-4">
          <p className="text-sm font-medium text-[var(--foreground)] mb-2">
            Como funciona:
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--income)]/10 text-[10px] font-bold text-[var(--income)]">
                1
              </div>
              <span>Cadastre sua receita (salário, etc)</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--expense)]/10 text-[10px] font-bold text-[var(--expense)]">
                2
              </div>
              <span>Registre suas despesas</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[10px] font-bold text-[var(--primary)]">
                3
              </div>
              <span>Acompanhe seu saldo</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
