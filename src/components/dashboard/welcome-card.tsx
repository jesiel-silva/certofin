"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  User,
} from "lucide-react";

interface WelcomeCardProps {
  scope?: "personal" | "business";
  userName?: string;
  userPlan?: "free" | "pro";
}

export function WelcomeCard({ scope = "personal", userName = "", userPlan = "free" }: WelcomeCardProps) {
  const prefix = scope === "business" ? "/business" : "/personal";
  const scopeLabel = scope === "business" ? "do seu negócio" : "pessoais";
  const isPro = userPlan === "pro";

  return (
    <Card className="hud-border bg-[#0B1221]/80 scanline-overlay">
      <CardContent className="p-6 sm:p-8">
        {/* User Info */}
        {userName && (
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--primary)]/20">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/30">
                <User className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-mono font-bold text-[var(--foreground)]">
                  Olá, {userName.split(" ")[0]}!
                </p>
                <p className="text-[10px] sm:text-xs font-mono text-[var(--muted-foreground)]">
                  Bem-vindo ao seu painel
                </p>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isPro ? 'bg-[var(--warning)]/20 border border-[var(--warning)]/40' : 'bg-[var(--muted)]/20 border border-[var(--muted)]/40'}`}>
              <span className={`text-xs font-mono font-bold uppercase ${isPro ? 'text-[var(--warning)]' : 'text-[var(--muted-foreground)]'}`}>
                {isPro ? 'PRO' : 'FREE'}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-start gap-4 mb-6">
          <div className="rounded-none bg-[var(--primary)]/10 p-3 border border-[var(--primary)]/30 glow-cyan">
            <Sparkles className="h-6 w-6 text-[var(--primary)]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-[var(--foreground)] uppercase tracking-wider">
              NENHUM LANÇAMENTO {scopeLabel.toUpperCase()} DETECTADO
            </h2>
            <p className="text-xs sm:text-sm font-mono text-[var(--muted-foreground)] mt-1">
              [ AGUARDANDO DADOS... ]
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 mb-6">
          <Link href={`${prefix}/transactions/new?type=income`} className="flex-1">
            <Button
              variant="outline"
              className="w-full h-auto py-4 border-[var(--income)]/30 hover:bg-[var(--income)]/5 hover:border-[var(--income)]/50 hover:shadow-[0_0_15px_rgba(0,255,204,0.15)]"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-none bg-[var(--income)]/10 p-2.5 border border-[var(--income)]/30">
                  <ArrowDownLeft className="h-5 w-5 text-[var(--income)]" />
                </div>
                <div className="text-left">
                  <p className="font-mono font-semibold text-[var(--foreground)] uppercase text-xs sm:text-sm">
                    ADICIONAR RECEITA
                  </p>
                  <p className="text-[10px] sm:text-xs font-mono text-[var(--muted-foreground)] uppercase">
                    {scope === "business" ? "VENDA, SERVIÇO, CLIENTE..." : "SALÁRIO, FREELANCER, VENDAS..."}
                  </p>
                </div>
              </div>
            </Button>
          </Link>

          <Link href={`${prefix}/transactions/new?type=expense`} className="flex-1">
            <Button
              variant="outline"
              className="w-full h-auto py-4 border-[var(--expense)]/30 hover:bg-[var(--expense)]/5 hover:border-[var(--expense)]/50 hover:shadow-[0_0_15px_rgba(255,0,51,0.15)]"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-none bg-[var(--expense)]/10 p-2.5 border border-[var(--expense)]/30">
                  <ArrowUpRight className="h-5 w-5 text-[var(--expense)]" />
                </div>
                <div className="text-left">
                  <p className="font-mono font-semibold text-[var(--foreground)] uppercase text-xs sm:text-sm">
                    ADICIONAR DESPESA
                  </p>
                  <p className="text-[10px] sm:text-xs font-mono text-[var(--muted-foreground)] uppercase">
                    {scope === "business" ? "INSUMO, COMBUSTÍVEL, ALUGUEL..." : "CONTA DE LUZ, ALUGUEL, MERCADO..."}
                  </p>
                </div>
              </div>
            </Button>
          </Link>
        </div>

        <div className="hud-border bg-[#020617]/50 p-4">
          <p className="text-[10px] sm:text-xs font-display font-bold text-[var(--primary)] mb-2 uppercase tracking-widest">
            [ PROTOCOLO DE INICIALIZAÇÃO ]
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono text-[var(--muted-foreground)]">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-[var(--income)]/10 border border-[var(--income)]/30 text-[10px] sm:text-xs font-bold text-[var(--income)]">
                01
              </div>
              <span>CADASTRE SUA RECEITA</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono text-[var(--muted-foreground)]">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-[var(--expense)]/10 border border-[var(--expense)]/30 text-[10px] sm:text-xs font-bold text-[var(--expense)]">
                02
              </div>
              <span>REGISTRE SUAS DESPESAS</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono text-[var(--muted-foreground)]">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-[var(--primary)]/10 border border-[var(--primary)]/30 text-[10px] sm:text-xs font-bold text-[var(--primary)]">
                03
              </div>
              <span>ACOMPANHE SEU SALDO</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
