"use client";

import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { PricingCards } from "@/components/pricing/pricing-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Profile } from "@/lib/types";
import { Tooltip } from "@/components/ui/tooltip";
import { CancellationSurveyModal } from "@/components/account/cancellation-survey-modal";

function PlanosContent() {
  const searchParams = useSearchParams();
  const checkoutStatus = searchParams.get("checkout");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activatingTrial, setActivatingTrial] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (checkoutStatus === "success") {
      setActionMessage({
        type: "success",
        text: "🎉 Pagamento processado com sucesso! Sua conta Pro foi ativada.",
      });
    } else if (checkoutStatus === "cancelled") {
      setActionMessage({
        type: "info",
        text: "O processo de checkout foi cancelado. Você pode assinar o plano Pro quando desejar.",
      });
    }
  }, [checkoutStatus]);

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
      setCheckoutLoading(true);
      setActionMessage(null);
      try {
        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Falha ao iniciar checkout no Stripe.");
        }

        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error("URL de pagamento não retornada pelo servidor.");
        }
      } catch (err: unknown) {
        console.error("Erro ao iniciar assinatura Pro:", err);
        const msg = err instanceof Error ? err.message : "Erro desconhecido";
        setActionMessage({
          type: "error",
          text: `Não foi possível iniciar o pagamento: ${msg}`,
        });
      } finally {
        setCheckoutLoading(false);
      }
    }
  };

  const handleOpenCustomerPortal = async () => {
    setPortalLoading(true);
    setActionMessage(null);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Falha ao abrir portal de assinaturas.");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("URL do portal não retornada pelo servidor.");
      }
    } catch (err: unknown) {
      console.error("Erro ao abrir portal do Stripe:", err);
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      setActionMessage({
        type: "error",
        text: `Erro ao acessar gerenciamento de faturas: ${msg}`,
      });
    } finally {
      setPortalLoading(false);
    }
  };

  const handleStartTrial = async () => {
    setActivatingTrial(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("trial_ends_at, trial_used_at")
        .eq("id", user.id)
        .single();

      if (currentProfile?.trial_ends_at && new Date(currentProfile.trial_ends_at) > new Date()) {
        alert("Você já tem um trial ativo!");
        setActivatingTrial(false);
        return;
      }

      if (
        currentProfile?.trial_ends_at &&
        !currentProfile.trial_used_at &&
        new Date(currentProfile.trial_ends_at) <= new Date()
      ) {
        await supabase
          .from("profiles")
          .update({ trial_used_at: currentProfile.trial_ends_at })
          .eq("id", user.id);
        alert("Você já utilizou seu período de teste grátis.");
        setActivatingTrial(false);
        window.location.reload();
        return;
      }

      if (currentProfile?.trial_used_at) {
        alert("Você já utilizou seu período de teste grátis. Faça upgrade para o plano Pro!");
        setActivatingTrial(false);
        return;
      }

      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 14);

      const { data, error } = await supabase
        .from("profiles")
        .update({
          trial_ends_at: trialEnd.toISOString(),
          trial_used_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select("trial_ends_at")
        .single();

      if (error) {
        console.error("Erro ao ativar trial:", error);
        alert("Erro ao ativar trial: " + error.message);
        return;
      }

      console.log("Trial ativado:", data);

      setProfile((prev) =>
        prev ? { ...prev, trial_ends_at: trialEnd.toISOString() } : prev
      );

      alert("Trial PRO ativado! Você tem 14 dias de acesso completo.");
      window.location.reload();
    } catch (err) {
      console.error("Erro ao ativar trial:", err);
      alert("Erro ao ativar trial. Tente novamente.");
    } finally {
      setActivatingTrial(false);
    }
  };

  const isPro = profile?.subscription_status === "pro";
  const hasTrial = profile?.trial_ends_at;
  const trialActive = hasTrial ? new Date(hasTrial) > new Date() : false;
  const hasStripeCustomer = Boolean(profile?.stripe_customer_id);

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
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-[var(--foreground)]">Planos & Assinatura</h1>
            <Tooltip content="Gerencie sua assinatura Pro, formas de pagamento, teste grátis ou faturas." />
          </div>
          <p className="text-base text-[var(--muted-foreground)]">
            Escolha o plano ideal para suas necessidades pessoais e profissionais
          </p>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`flex items-start gap-3 p-4 rounded-xl border ${
            actionMessage.type === "success"
              ? "bg-[var(--success)]/10 border-[var(--success)]/30 text-[var(--success)]"
              : actionMessage.type === "error"
              ? "bg-[var(--destructive)]/10 border-[var(--destructive)]/30 text-[var(--destructive)]"
              : "bg-[var(--primary)]/10 border-[var(--primary)]/30 text-[var(--foreground)]"
          }`}
        >
          {actionMessage.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          )}
          <p className="text-sm font-medium">{actionMessage.text}</p>
        </div>
      )}

      {/* Seção de Status da Assinatura Pro Ativa */}
      {isPro && (
        <Card className="border-[var(--primary)]/30 bg-[var(--primary)]/5">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-[var(--primary)]/20 p-2.5 text-[var(--primary)]">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-[var(--foreground)]">
                      Sua assinatura PRO está Ativa
                    </h2>
                    <span className="rounded-full bg-[var(--primary)] px-2.5 py-0.5 text-xs font-semibold text-white">
                      PRO
                    </span>
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-[var(--muted-foreground)]/70" />
                    {profile?.current_period_end ? (
                      profile?.cancel_at_period_end ? (
                        <>Cancelamento agendado. Acesso Pro garantido até {new Date(profile.current_period_end).toLocaleDateString("pt-BR")}.</>
                      ) : (
                        <>Próxima renovação automática em {new Date(profile.current_period_end).toLocaleDateString("pt-BR")}.</>
                      )
                    ) : (
                      <>Acesso ilimitado a todas as ferramentas.</>
                    )}
                  </p>
                </div>
              </div>

              {hasStripeCustomer && (
                <Button
                  onClick={handleOpenCustomerPortal}
                  disabled={portalLoading}
                  variant="outline"
                  className="gap-2 border-[var(--primary)]/40 hover:bg-[var(--primary)]/10"
                >
                  {portalLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="h-4 w-4" />
                  )}
                  Gerenciar Cartão e Faturas
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Planos Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <PricingCards
            currentPlan={isPro ? "pro" : "free"}
            loading={checkoutLoading}
            onSelectPlan={handleSelectPlan}
          />

          {/* Botão de Trial */}
          {!isPro && !trialActive && (
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <Button
                  onClick={handleStartTrial}
                  disabled={activatingTrial}
                  className="bg-[var(--success)]/10 border border-[var(--success)]/30 text-[var(--success)] hover:bg-[var(--success)]/20"
                >
                  {activatingTrial ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Testar PRO grátis por 14 dias
                </Button>
                <Tooltip content="Teste o plano Pro por 14 dias sem pagar nada. Ao final, se não assinar, volta para o plano Free." />
              </div>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                Acesso completo a todos os recursos do plano Pro sem precisar de cartão agora
              </p>
            </div>
          )}

          {trialActive && !isPro && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 rounded-lg border border-[var(--success)]/30 bg-[var(--success)]/10 px-4 py-2">
                <div className="h-2 w-2 rounded-full bg-[var(--success)] animate-pulse" />
                <span className="text-base font-medium text-[var(--success)]">
                  Trial PRO ativo
                </span>
              </div>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
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

          {(isPro || trialActive) && (
            <div className="mt-6 pt-4 border-t border-[var(--border)] text-center">
              <div className="flex items-center justify-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCancelModal(true)}
                  className="text-[var(--warning)] border-[var(--warning)]/30 hover:bg-[var(--warning)]/10"
                >
                  Cancelar plano atual
                </Button>
                <Tooltip content="Cancele sua assinatura. Se for paga, você continua com acesso Pro até o término do ciclo atual." />
              </div>
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
              O que acontece se eu ultrapassar os 10 lançamentos no plano Free?
            </h3>
            <p className="text-base text-[var(--muted-foreground)]">
              O sistema limitará a criação de novos lançamentos até a virada do próximo mês,
              ou você pode fazer o upgrade para o plano Pro e ter lançamentos ilimitados imediatamente.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-[var(--foreground)]">
              Como funciona a renovação e cancelamento?
            </h3>
            <p className="text-base text-[var(--muted-foreground)]">
              A assinatura Pro é recorrente mensal via Cartão de Crédito. Você pode cancelar quando quiser através do portal ou da nossa página. Seu acesso Pro permanece liberado até o último dia do período que já foi pago.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-[var(--foreground)]">
              Os pagamentos são seguros?
            </h3>
            <p className="text-base text-[var(--muted-foreground)]">
              Sim! Todo o processamento de pagamentos e dados de cartão é realizado diretamente pela infraestrutura segura do Stripe com certificação PCI-DSS Nível 1.
            </p>
          </div>
        </CardContent>
      </Card>

      <CancellationSurveyModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        actionType="cancel_subscription"
      />
    </div>
  );
}

export default function PersonalPlanosPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>
      }
    >
      <PlanosContent />
    </Suspense>
  );
}
