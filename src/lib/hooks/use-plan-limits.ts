"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface PlanInfo {
  plan: "free" | "pro";
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

      if (rpcError) {
        console.error("Erro ao buscar plano:", rpcError);
        // Fallback: buscar diretamente da tabela
        const { data: profile } = await supabase
          .from("profiles")
          .select("subscription_status")
          .eq("id", user.id)
          .single();

        const { count } = await supabase
          .from("transactions")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte(
            "created_at",
            new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              1
            ).toISOString()
          );

        setPlanInfo({
          plan: profile?.subscription_status || "free",
          monthly_transactions: count || 0,
          max_transactions: profile?.subscription_status === "pro" ? -1 : 30,
          can_use_business: profile?.subscription_status === "pro",
          can_use_installment: profile?.subscription_status === "pro",
        });
        return;
      }

      setPlanInfo(data as PlanInfo);
    } catch (err) {
      console.error("Erro ao verificar plano:", err);
      setError("Erro ao verificar plano do usuário");
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchPlanInfo();
  }, [fetchPlanInfo]);

  const canCreateTransaction = planInfo
    ? planInfo.max_transactions === -1 ||
      planInfo.monthly_transactions < planInfo.max_transactions
    : false;

  const transactionsRemaining = planInfo
    ? planInfo.max_transactions === -1
      ? -1
      : Math.max(0, planInfo.max_transactions - planInfo.monthly_transactions)
    : 0;

  return {
    canCreateTransaction,
    canUseBusinessScope: planInfo?.can_use_business ?? false,
    canUseInstallment: planInfo?.can_use_installment ?? false,
    transactionsRemaining,
    isLoading,
    error,
    refresh: fetchPlanInfo,
  };
}
