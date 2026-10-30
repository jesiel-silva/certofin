"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { Goal } from "@/lib/types";
import { GOAL_ICON_MAP } from "./goal-constants";
import {
  Target,
  Pencil,
  Trash2,
  Calendar,
  CheckCircle2,
  PlusCircle,
} from "lucide-react";

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
  onOpenProgress: (goal: Goal) => void;
}

export function GoalCard({ goal, onEdit, onDelete, onOpenProgress }: GoalCardProps) {
  const current = Number(goal.current_amount) || 0;
  const target = Number(goal.target_amount) || 1;
  const progressPercent = Math.min(100, Math.round((current / target) * 100));
  const isCompleted = current >= target;

  const IconComponent = GOAL_ICON_MAP[goal.icon] || Target;

  const formattedDate = goal.target_date
    ? new Date(`${goal.target_date}T00:00:00`).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <Card className="hud-border bg-[#0B1221]/80 backdrop-blur-md scanline-overlay relative overflow-hidden group hover:border-[var(--primary)]/50 transition-all">
      {/* Linha decorativa de progresso no topo */}
      <div
        className="absolute top-0 left-0 h-1 transition-all duration-500"
        style={{
          width: `${progressPercent}%`,
          backgroundColor: goal.color || "var(--primary)",
          boxShadow: `0 0 10px ${goal.color || "var(--primary)"}`,
        }}
      />

      <CardContent className="p-5 sm:p-6 space-y-4">
        {/* Cabeçalho do Card */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 border"
              style={{
                backgroundColor: `${goal.color}15`,
                borderColor: `${goal.color}40`,
                color: goal.color,
                boxShadow: `0 0 12px ${goal.color}25`,
              }}
            >
              <IconComponent className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-[var(--foreground)] truncate group-hover:text-white transition-colors">
                {goal.title}
              </h3>
              <span className="inline-block px-2 py-0.5 mt-0.5 rounded text-[10px] font-mono uppercase bg-white/5 text-[var(--muted-foreground)] border border-white/10">
                {goal.category}
              </span>
            </div>
          </div>

          {/* Ações (Editar / Deletar) */}
          <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(goal)}
              className="p-1.5 rounded hover:bg-white/10 text-[var(--muted-foreground)] hover:text-white transition-colors"
              title="Editar Meta"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(goal.id)}
              className="p-1.5 rounded hover:bg-[var(--destructive)]/10 text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-colors"
              title="Excluir Meta"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Barra de Progresso Visual */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-baseline text-xs font-mono">
            <span className="font-bold text-white text-base">
              {formatCurrency(current)}
            </span>
            <span className="text-[var(--muted-foreground)]">
              de {formatCurrency(target)} ({progressPercent}%)
            </span>
          </div>

          <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: goal.color || "var(--primary)",
                boxShadow: `0 0 8px ${goal.color || "var(--primary)"}`,
              }}
            />
          </div>
        </div>

        {/* Rodapé do Card: Prazo e Botão Rápido de Aporte */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
          <div className="flex items-center gap-1.5 text-[var(--muted-foreground)] font-mono text-[11px]">
            {isCompleted ? (
              <span className="flex items-center gap-1 text-[var(--success)] font-bold">
                <CheckCircle2 className="h-3.5 w-3.5" /> Meta Atingida!
              </span>
            ) : formattedDate ? (
              <>
                <Calendar className="h-3.5 w-3.5" />
                <span>Até {formattedDate}</span>
              </>
            ) : (
              <span>Sem prazo estipulado</span>
            )}
          </div>

          <button
            onClick={() => onOpenProgress(goal)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider text-[var(--primary)] bg-[var(--primary)]/10 border border-[var(--primary)]/30 hover:bg-[var(--primary)]/20 hover:shadow-[0_0_10px_var(--primary)]/30 transition-all"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Aporte / Resgate
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
