"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface PlanInfo {
  plan: "free" | "pro";
  is_trial: boolean;
  trial_ends_at: string | null;
  monthly_transactions: number;
  max_transactions: number;
  can_use_business: boolean;
  can_use_installment: boolean;
}

export interface PlanLimits {
  canCreateTransaction: boolean;
  canUseBusinessScope: boolean;
  canUseInstallment: boolean;
  transactionsRemaining: number;
  isLoading: boolean;
  error: string | null;
  isTrial: boolean;
  refresh: () => Promise<void>;
}

export function usePlanLimits(): PlanLimits {
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchPlanInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Usuário não autenticado");
        return;
      }

      const { data, error: rpcError } = await supabase.rpc(
        "get_user_plan_info",
        { user_uuid: user.id }
      );

      // Sempre buscar trial_ends_at diretamente da tabela
      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_status, trial_ends_at")
        .eq("id", user.id)
        .single();

      const isPro = profile?.subscription_status === "pro";
      const isTrial = profile?.trial_ends_at
        ? new Date(profile.trial_ends_at) > new Date()
        : false;

      if (rpcError) {
        console.error("Erro ao buscar plano:", rpcError);
        // Fallback: buscar contagem diretamente
        const { count } = await supabase
          .from("transactions")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte(
            "transaction_date",
            new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              1
            ).toISOString()
          );

        setPlanInfo({
          plan: (profile?.subscription_status as "free" | "pro") || "free",
          is_trial: isTrial,
          trial_ends_at: profile?.trial_ends_at || null,
          monthly_transactions: count || 0,
          max_transactions: isPro || isTrial ? -1 : 10,
          can_use_business: isPro || isTrial,
          can_use_installment: isPro || isTrial,
        });
        return;
      }

      // RPC funcionou, mas mesclar com dados de trial da tabela
      const rpcData = data as Record<string, unknown>;
      const rpcPlan = rpcData.plan === "pro" ? "pro" : "free";
      setPlanInfo({
        plan: rpcPlan,
        is_trial: isTrial,
        trial_ends_at: profile?.trial_ends_at || null,
        monthly_transactions: (rpcData.monthly_transactions as number) || 0,
        max_transactions: isPro || isTrial ? -1 : 10,
        can_use_business: isPro || isTrial,
        can_use_installment: isPro || isTrial,
      });
    } catch (err) {
      console.error("Erro ao verificar plano:", err);
      setError("Erro ao verificar plano do usuário");
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      fetchPlanInfo();
    });
  }, [fetchPlanInfo]);

  const canCreateTransaction = planInfo
    ? planInfo.max_transactions === -1 ||
      planInfo.monthly_transactions < planInfo.max_transactions
    : false;

  const transactionsRemaining = planInfo
    ? planInfo.max_transactions === -1
      ? Infinity
      : Math.max(0, planInfo.max_transactions - planInfo.monthly_transactions)
    : 0;

  return {
    canCreateTransaction,
    canUseBusinessScope: planInfo?.can_use_business ?? false,
    canUseInstallment: planInfo?.can_use_installment ?? false,
    transactionsRemaining,
    isLoading,
    error,
    isTrial: planInfo?.is_trial ?? false,
    refresh: fetchPlanInfo,
  };
}
