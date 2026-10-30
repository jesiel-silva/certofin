"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { Goal } from "@/lib/types";
import { GOAL_ICON_MAP } from "@/components/goals/goal-constants";
import { Target, ArrowRight, Plus, Crown, Lock } from "lucide-react";

interface GoalsWidgetProps {
  userPlan?: "free" | "pro" | "trial";
}

export function GoalsWidget({ userPlan = "free" }: GoalsWidgetProps) {
  const supabase = createClient();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopGoals = async () => {
      try {
        const { data } = await supabase
          .from("goals")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(3);

        if (data) {
          setGoals(
            data.map((g) => ({
              ...g,
              target_amount: Number(g.target_amount),
              current_amount: Number(g.current_amount),
            }))
          );
        }
      } catch {
        // Silencioso se a tabela ainda não existir
      } finally {
        setLoading(false);
      }
    };

    fetchTopGoals();
  }, [supabase]);

  if (loading) return null;

  // Se o usuário for Free (sem trial), exibe o widget com CTA de desbloqueio Pro
  if (userPlan === "free") {
    return (
      <Card className="hud-border bg-[#0B1221]/80 backdrop-blur-sm scanline-overlay min-w-0">
        <CardHeader className="pb-3 border-b border-[var(--primary)]/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-[var(--primary)]" />
              <CardTitle className="text-sm sm:text-base font-display font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
                METAS & OBJETIVOS
              </CardTitle>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border border-[var(--primary)]/40 bg-[var(--primary)]/20 text-[var(--primary)] flex items-center gap-1">
              <Crown className="h-3 w-3" />
              PRO
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-[var(--primary)]" />
                Defina metas financeiras e acompanhe sua evolução
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                Exclusivo para assinantes Pro: crie reservas de emergência, metas de viagem, investimentos e visualize barras de progresso em tempo real.
              </p>
            </div>
            <Link
              href="/personal/planos"
              className="shrink-0 inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-2 rounded-lg bg-[var(--primary)] text-black hover:bg-[var(--primary)]/90 transition-all shadow-[0_0_15px_rgba(0,255,204,0.3)]"
            >
              <Crown className="h-3.5 w-3.5" />
              Desbloquear no Pro
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hud-border bg-[#0B1221]/80 backdrop-blur-sm scanline-overlay min-w-0">
      <CardHeader className="pb-3 border-b border-[var(--primary)]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-[var(--primary)]" />
            <CardTitle className="text-sm sm:text-base font-display font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
              METAS & OBJETIVOS
            </CardTitle>
          </div>
          <Link
            href="/personal/goals"
            className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--primary)] hover:underline flex items-center gap-1 group"
          >
            Ver todas
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {goals.length === 0 ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-2 text-center sm:text-left">
            <div>
              <p className="text-sm font-semibold text-white">Nenhuma meta cadastrada ainda</p>
              <p className="text-xs text-[var(--muted-foreground)]">
                Defina sua reserva de emergência, viagem dos sonhos ou compras planejadas.
              </p>
            </div>
            <Link
              href="/personal/goals"
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded border border-[var(--primary)]/40 bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              Criar Meta
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const current = Number(goal.current_amount) || 0;
              const target = Number(goal.target_amount) || 1;
              const percent = Math.min(100, Math.round((current / target) * 100));
              const IconComponent = GOAL_ICON_MAP[goal.icon] || Target;

              return (
                <div key={goal.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-sans">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="h-6 w-6 rounded flex items-center justify-center shrink-0 border text-xs"
                        style={{
                          backgroundColor: `${goal.color}15`,
                          borderColor: `${goal.color}40`,
                          color: goal.color,
                        }}
                      >
                        <IconComponent className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-semibold text-white truncate max-w-[140px] sm:max-w-[200px]">
                        {goal.title}
                      </span>
                    </div>

                    <div className="text-right shrink-0 font-mono text-[11px]">
                      <span className="text-white font-bold">{formatCurrency(current)}</span>
                      <span className="text-[var(--muted-foreground)]"> / {formatCurrency(target)}</span>
                      <span
                        className="ml-2 font-bold"
                        style={{ color: goal.color || "var(--primary)" }}
                      >
                        {percent}%
                      </span>
                    </div>
                  </div>

                  {/* Barra de progresso */}
                  <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: goal.color || "var(--primary)",
                        boxShadow: `0 0 6px ${goal.color || "var(--primary)"}`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
