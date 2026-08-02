"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { PricingCards } from "@/components/pricing/pricing-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Profile } from "@/lib/types";

export default function PersonalPlanosPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activatingTrial, setActivatingTrial] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        setProfile(data as Profile);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [supabase]);

  const handleSelectPlan = async (plan: "free" | "pro") => {
    if (plan === "pro") {
      alert("Fluxo de checkout será implementado em breve!");
    }
  };

  const handleStartTrial = async () => {
    setActivatingTrial(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Definir trial para 7 dias a partir de agora
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 7);

      const { error } = await supabase
        .from("profiles")
        .update({ trial_ends_at: trialEnd.toISOString() })
        .eq("id", user.id);

      if (error) throw error;

      // Atualizar profile local
      setProfile((prev) =>
        prev ? { ...prev, trial_ends_at: trialEnd.toISOString() } : prev
      );

      alert("Trial PRO ativado! Você tem 7 dias de acesso completo.");
      // Recarregar para atualizar sidebar e hooks
      window.location.reload();
    } catch (err) {
      console.error("Erro ao ativar trial:", err);
      alert("Erro ao ativar trial. Tente novamente.");
    } finally {
      setActivatingTrial(false);
    }
  };

  const isPro = (profile as unknown as { subscription_status?: string })?.subscription_status === "pro";
  const hasTrial = (profile as unknown as { trial_ends_at?: string })?.trial_ends_at;
  const trialActive = hasTrial ? new Date(hasTrial) > new Date() : false;

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/personal/dashboard"
          className="rounded-lg p-1 hover:bg-[var(--accent)]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Planos</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Escolha o plano ideal para suas necessidades
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Escolha seu plano</CardTitle>
        </CardHeader>
        <CardContent>
          <PricingCards
            currentPlan={
              isPro
                ? "pro"
                : "free"
            }
            onSelectPlan={handleSelectPlan}
          />

          {/* Botão de Trial */}
          {!isPro && !trialActive && (
            <div className="mt-6 text-center">
              <Button
                onClick={handleStartTrial}
                disabled={activatingTrial}
                className="bg-[var(--success)]/10 border border-[var(--success)]/30 text-[var(--success)] hover:bg-[var(--success)]/20"
              >
                {activatingTrial ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Testar PRO grátis por 7 dias
              </Button>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                Acesso completo a todos os recursos do plano Pro
              </p>
            </div>
          )}

          {trialActive && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 rounded-lg border border-[var(--success)]/30 bg-[var(--success)]/10 px-4 py-2">
                <div className="h-2 w-2 rounded-full bg-[var(--success)] animate-pulse" />
                <span className="text-sm font-medium text-[var(--success)]">
                  Trial PRO ativo
                </span>
              </div>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                Seu trial expira em{" "}
                {new Date(hasTrial!).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Perguntas Frequentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium text-[var(--foreground)]">
              O que acontece se eu ultrapassar os 10 lançamentos?
            </h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              O sistema não permitirá criar novos lançamentos até o próximo mês,
              ou você pode fazer upgrade para o plano Pro e ter lançamentos
              ilimitados.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-[var(--foreground)]">
              Posso cancelar o plano Pro a qualquer momento?
            </h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              Sim! Você pode cancelar sua assinatura a qualquer momento. O acesso
              ao plano Pro permanece até o final do período já pago.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-[var(--foreground)]">
              Como funciona o pagamento?
            </h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              O pagamento é feito mensalmente via Cartão de Crédito. Não
              trabalhamos com PIX ou planos anuais.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
