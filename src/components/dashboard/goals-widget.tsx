"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { Goal } from "@/lib/types";
import { GOAL_ICON_MAP } from "@/components/goals/goal-constants";
import { Target, ArrowRight, Plus, Sparkles } from "lucide-react";

export function GoalsWidget() {
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
            <span>Ver todas</span>
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {goals.length === 0 ? (
          <div className="text-center py-6 space-y-3">
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
              Você ainda não tem metas cadastradas. Comece a poupar com um objetivo em mente!
            </p>
            <Link
              href="/personal/goals"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider text-[#020617] bg-[var(--primary)] hover:bg-[var(--primary)]/90 hover:shadow-[0_0_12px_var(--primary)] transition-all"
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
