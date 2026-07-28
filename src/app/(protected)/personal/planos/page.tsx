"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { PricingCards } from "@/components/pricing/pricing-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Profile } from "@/lib/types";

export default function PersonalPlanosPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
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
              (profile as unknown as { subscription_status?: string })
                ?.subscription_status === "pro"
                ? "pro"
                : "free"
            }
            onSelectPlan={handleSelectPlan}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Perguntas Frequentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium text-[var(--foreground)]">
              O que acontece se eu ultrapassar os 30 lançamentos?
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
