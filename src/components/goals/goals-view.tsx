"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Goal } from "@/lib/types";
import { GoalCard } from "./goal-card";
import { GoalModal } from "./goal-modal";
import { GoalProgressModal } from "./goal-progress-modal";
import { UpgradeModal } from "@/components/ui/upgrade-modal";
import { Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  Target,
  Plus,
  TrendingUp,
  CheckCircle2,
  PiggyBank,
  Sparkles,
} from "lucide-react";

export function GoalsView() {
  const supabase = createClient();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [goalForProgress, setGoalForProgress] = useState<Goal | null>(null);
  const [userPlan, setUserPlan] = useState<"free" | "pro" | "trial">("free");
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("subscription_status, trial_ends_at")
          .eq("id", userData.user.id)
          .single();
        if (profile) {
          const isPro = profile.subscription_status === "pro";
          const isTrial = profile.trial_ends_at
            ? new Date(profile.trial_ends_at) > new Date()
            : false;
          setUserPlan(isPro ? "pro" : isTrial ? "trial" : "free");
        }
      }

      const { data, error: err } = await supabase
        .from("goals")
        .select("*")
        .order("created_at", { ascending: false });

      if (err) {
        // Se a tabela ainda não existir no banco do usuário
        if (err.code === "42P01") {
          setError("Tabela de metas não encontrada no banco. Execute a migração SQL do projeto.");
        } else {
          setError(err.message || "Erro ao carregar metas.");
        }
        setGoals([]);
        return;
      }

      setGoals(
        (data || []).map((g) => ({
          ...g,
          target_amount: Number(g.target_amount),
          current_amount: Number(g.current_amount),
        }))
      );
    } catch {
      setError("Falha de conexão ao carregar metas.");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => { queueMicrotask(() => { fetchGoals(); }); }, [fetchGoals]);

  // Extrai categorias criadas pelo próprio usuário nas metas existentes
  const customCategories = useMemo(() => {
    return Array.from(new Set(goals.map((g) => g.category).filter(Boolean)));
  }, [goals]);

  // Cálculos de métricas gerais
  const stats = useMemo(() => {
    const totalTarget = goals.reduce((acc, g) => acc + g.target_amount, 0);
    const totalCurrent = goals.reduce((acc, g) => acc + g.current_amount, 0);
    const overallPercent = totalTarget > 0 ? Math.min(100, Math.round((totalCurrent / totalTarget) * 100)) : 0;
    const completedCount = goals.filter((g) => g.current_amount >= g.target_amount).length;

    return {
      totalTarget,
      totalCurrent,
      overallPercent,
      completedCount,
      totalCount: goals.length,
    };
  }, [goals]);

  const handleSaveGoal = async (goalData: Partial<Goal>) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Usuário não autenticado");

    if (selectedGoal) {
      // Editar meta existente
      const { error: updateErr } = await supabase
        .from("goals")
        .update({
          ...goalData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedGoal.id);

      if (updateErr) throw updateErr;
    } else {
      // Criar nova meta
      const { error: insertErr } = await supabase.from("goals").insert({
        ...goalData,
        user_id: userData.user.id,
      });

      if (insertErr) throw insertErr;
    }

    await fetchGoals();
  };

  const handleUpdateAmount = async (goalId: string, newAmount: number) => {
    const targetGoal = goals.find((g) => g.id === goalId);
    const isCompleted = targetGoal ? newAmount >= targetGoal.target_amount : false;

    const { error: err } = await supabase
      .from("goals")
      .update({
        current_amount: newAmount,
        status: isCompleted ? "completed" : "in_progress",
        updated_at: new Date().toISOString(),
      })
      .eq("id", goalId);

    if (err) throw err;
    await fetchGoals();
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta meta?")) return;

    const { error: err } = await supabase.from("goals").delete().eq("id", goalId);
    if (err) {
      alert("Erro ao excluir meta: " + err.message);
      return;
    }
    await fetchGoals();
  };

  const openCreateModal = () => {
    if (userPlan === "free") {
      setUpgradeModalOpen(true);
      return;
    }
    setSelectedGoal(null);
    setModalOpen(true);
  };

  const openEditModal = (goal: Goal) => {
    setSelectedGoal(goal);
    setModalOpen(true);
  };

  const openProgressModal = (goal: Goal) => {
    setGoalForProgress(goal);
    setProgressModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 min-w-0">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold truncate flex items-center gap-2.5">
            <Target className="h-7 w-7 text-[var(--primary)] drop-shadow-[0_0_8px_var(--primary)]" />
            Metas Financeiras
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Defina seus objetivos, acompanhe seu progresso e conquiste sua liberdade.
          </p>
        </div>

        <Button onClick={openCreateModal} className="gap-2 shrink-0">
          {userPlan === "free" ? (
            <>
              <Lock className="h-4 w-4 text-black" />
              <span>Nova Meta (Pro)</span>
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              <span>Nova Meta</span>
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-[var(--destructive)]/30 bg-[var(--destructive)]/10 text-sm text-[var(--destructive)]">
          {error}
        </div>
      )}



      {/* Indicadores do Topo (Resumo Profissional) */}
      {userPlan !== "free" && goals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="hud-border bg-[#0B1221]/80 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
                Total Poupado
              </span>
              <PiggyBank className="h-4 w-4 text-[var(--success)]" />
            </div>
            <p className="text-2xl font-bold text-white text-glow-green">
              {formatCurrency(stats.totalCurrent)}
            </p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              de {formatCurrency(stats.totalTarget)} acumulados
            </p>
          </Card>

          <Card className="hud-border bg-[#0B1221]/80 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
                Progresso Médio
              </span>
              <TrendingUp className="h-4 w-4 text-[var(--primary)]" />
            </div>
            <p className="text-2xl font-bold text-[var(--primary)] text-glow-cyan">
              {stats.overallPercent}%
            </p>
            <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden mt-2 border border-white/5">
              <div
                className="h-full bg-[var(--primary)] rounded-full transition-all duration-700 glow-cyan"
                style={{ width: `${stats.overallPercent}%` }}
              />
            </div>
          </Card>

          <Card className="hud-border bg-[#0B1221]/80 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
                Metas Concluídas
              </span>
              <CheckCircle2 className="h-4 w-4 text-[var(--warning)]" />
            </div>
            <p className="text-2xl font-bold text-white text-glow-yellow">
              {stats.completedCount} <span className="text-sm font-normal text-[var(--muted-foreground)]">de {stats.totalCount}</span>
            </p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              {stats.completedCount === stats.totalCount && stats.totalCount > 0
                ? "Parabéns! Todas as metas atingidas!"
                : `${stats.totalCount - stats.completedCount} metas em andamento`}
            </p>
          </Card>
        </div>
      )}

      {/* Conteúdo de Metas */}
      {userPlan === "free" ? (
        <Card className="hud-border bg-[#0B1221]/90 backdrop-blur-md text-center py-14 px-6 scanline-overlay relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Target className="w-64 h-64 text-[var(--primary)]" />
          </div>

          <CardContent className="space-y-6 max-w-xl mx-auto relative z-10">
            {goals.length > 0 ? (
              /* Caso 1: Usuário que já teve metas salvas */
              <>
                <div className="relative mx-auto w-20 h-20 rounded-2xl border-2 border-[var(--primary)] bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] shadow-[0_0_30px_rgba(0,255,204,0.3)]">
                  <Lock className="h-9 w-9 text-[var(--primary)]" />
                  <div className="absolute -top-2 -right-2 bg-[var(--primary)] text-black rounded-full p-1 shadow-md">
                    <Crown className="h-4 w-4" />
                  </div>
                </div>

                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-mono font-bold uppercase tracking-widest mb-3">
                    <Crown className="h-3 w-3" />
                    Recurso do Plano Pro
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Acesso às suas Metas Financeiras pausado
                  </h3>
                  <p className="text-sm text-[var(--muted-foreground)] mt-2 leading-relaxed">
                    Você possui <strong className="text-white">{goals.length} {goals.length === 1 ? "meta cadastrada" : "metas cadastradas"}</strong> e todo o seu histórico continua preservado com total segurança. Faça upgrade para o plano Pro para voltar a gerenciar, registrar novos aportes e acompanhar sua evolução no dashboard.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button
                    onClick={() => setUpgradeModalOpen(true)}
                    size="lg"
                    className="w-full sm:w-auto gap-2 font-bold shadow-[0_0_25px_rgba(0,255,204,0.3)]"
                  >
                    <Crown className="h-4 w-4" />
                    Reativar Plano Pro (R$ 9,90/mês)
                  </Button>
                </div>
              </>
            ) : (
              /* Caso 2: Usuário novato no plano Free */
              <>
                <div className="relative mx-auto w-20 h-20 rounded-2xl border-2 border-[var(--primary)] bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] shadow-[0_0_30px_rgba(0,255,204,0.3)] animate-pulse-glow">
                  <Target className="h-10 w-10 text-[var(--primary)]" />
                  <div className="absolute -top-2 -right-2 bg-[var(--primary)] text-black rounded-full p-1 shadow-md">
                    <Crown className="h-4 w-4" />
                  </div>
                </div>

                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-mono font-bold uppercase tracking-widest mb-3">
                    <Sparkles className="h-3 w-3" />
                    Exclusivo no Plano Pro
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Defina seus objetivos e conquiste sua liberdade
                  </h3>
                  <p className="text-sm text-[var(--muted-foreground)] mt-2 leading-relaxed">
                    Com as Metas do Plano Pro, você planeja sua reserva de emergência, viagens e conquistas pessoais com acompanhamento visual e barras de progresso interativas no Dashboard.
                  </p>
                </div>

                {/* Grid de Benefícios do Recurso */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
                  <div className="p-3 rounded-lg border border-white/5 bg-white/[0.02] flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[var(--primary)] shrink-0" />
                    <span className="text-xs text-white font-medium">Metas e objetivos ilimitados</span>
                  </div>
                  <div className="p-3 rounded-lg border border-white/5 bg-white/[0.02] flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[var(--primary)] shrink-0" />
                    <span className="text-xs text-white font-medium">Crie suas próprias categorias</span>
                  </div>
                  <div className="p-3 rounded-lg border border-white/5 bg-white/[0.02] flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[var(--primary)] shrink-0" />
                    <span className="text-xs text-white font-medium">Aporte e resgate em 1 clique</span>
                  </div>
                  <div className="p-3 rounded-lg border border-white/5 bg-white/[0.02] flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[var(--primary)] shrink-0" />
                    <span className="text-xs text-white font-medium">Evolução visual no Dashboard</span>
                  </div>
                </div>

                <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button
                    onClick={() => setUpgradeModalOpen(true)}
                    size="lg"
                    className="w-full sm:w-auto gap-2 font-bold shadow-[0_0_25px_rgba(0,255,204,0.3)]"
                  >
                    <Crown className="h-4 w-4" />
                    Desbloquear com o Plano Pro (R$ 9,90/mês)
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ) : goals.length === 0 ? (
        <Card className="hud-border bg-[#0B1221]/80 backdrop-blur-sm text-center py-16 px-4 scanline-overlay">
          <CardContent className="space-y-4 max-w-md mx-auto">
            <div className="h-16 w-16 mx-auto rounded-2xl border border-[var(--primary)]/30 bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] shadow-[0_0_20px_var(--primary)]/20 animate-pulse-glow">
              <Target className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                Nenhuma meta criada ainda
              </h3>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                Comece estabelecendo sua primeira meta: uma reserva de emergência, uma viagem ou um sonho pessoal.
              </p>
            </div>
            <Button onClick={openCreateModal} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Criar Minha Primeira Meta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={openEditModal}
              onDelete={handleDeleteGoal}
              onOpenProgress={openProgressModal}
            />
          ))}
        </div>
      )}

      {/* Modais */}
      <GoalModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveGoal}
        initialData={selectedGoal}
        customCategories={customCategories}
      />

      <GoalProgressModal
        open={progressModalOpen}
        onClose={() => setProgressModalOpen(false)}
        goal={goalForProgress}
        onUpdateAmount={handleUpdateAmount}
      />

      <UpgradeModal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        feature="goals"
      />
    </div>
  );
}
