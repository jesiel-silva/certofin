"use client";

import { useState } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { formatCurrency } from "@/lib/utils";
import type { Goal } from "@/lib/types";
import { PlusCircle, MinusCircle } from "lucide-react";

interface GoalProgressModalProps {
  open: boolean;
  onClose: () => void;
  goal: Goal | null;
  onUpdateAmount: (goalId: string, newAmount: number) => Promise<void>;
}

export function GoalProgressModal({
  open,
  onClose,
  goal,
  onUpdateAmount,
}: GoalProgressModalProps) {
  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");
  const [val, setVal] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!goal) return null;

  const current = Number(goal.current_amount) || 0;
  const target = Number(goal.target_amount) || 1;

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const parsed = parseFloat(val.replace(",", "."));
    if (isNaN(parsed) || parsed <= 0) {
      setError("Informe um valor válido maior que zero.");
      return;
    }

    let nextAmount = current;
    if (mode === "deposit") {
      nextAmount = current + parsed;
    } else {
      if (parsed > current) {
        setError(`Você só pode resgatar até ${formatCurrency(current)}.`);
        return;
      }
      nextAmount = current - parsed;
    }

    try {
      setSaving(true);
      await onUpdateAmount(goal.id, nextAmount);
      setVal("");
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao atualizar valor da meta.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader onClose={onClose}>
        <DialogTitle>Atualizar Saldo da Meta</DialogTitle>
        <DialogDescription>
          Ajuste o valor poupado para <strong>{goal.title}</strong>
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleAction} className="space-y-4 pt-2">
        {error && (
          <div className="rounded-lg border border-[var(--destructive)]/30 bg-[var(--destructive)]/10 p-3 text-xs text-[var(--destructive)]">
            {error}
          </div>
        )}

        {/* Resumo atual */}
        <div className="p-3 rounded-lg border border-[var(--border)] bg-black/20 flex items-center justify-between text-xs font-mono">
          <span className="text-[var(--muted-foreground)]">Acumulado Atual:</span>
          <span className="font-bold text-white text-sm">{formatCurrency(current)}</span>
        </div>

        {/* Abas Depositar / Resgatar */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode("deposit")}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
              mode === "deposit"
                ? "border-[var(--success)] bg-[var(--success)]/10 text-[var(--success)]"
                : "border-[var(--border)] text-[var(--muted-foreground)] hover:text-white"
            }`}
          >
            <PlusCircle className="h-4 w-4" />
            Adicionar (+ Guardar)
          </button>
          <button
            type="button"
            onClick={() => setMode("withdraw")}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
              mode === "withdraw"
                ? "border-[var(--destructive)] bg-[var(--destructive)]/10 text-[var(--destructive)]"
                : "border-[var(--border)] text-[var(--muted-foreground)] hover:text-white"
            }`}
          >
            <MinusCircle className="h-4 w-4" />
            Resgatar (- Retirar)
          </button>
        </div>

        {/* Campo de valor */}
        <div>
          <CurrencyInput
            label={mode === "deposit" ? "Quanto você quer adicionar?" : "Quanto você quer retirar?"}
            placeholder="0,00"
            value={val}
            onChange={(value) => setVal(value)}
            required
          />
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border)]">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Confirmando..." : "Confirmar"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
