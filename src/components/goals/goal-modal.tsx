"use client";

import { useState } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import {
  DEFAULT_GOAL_CATEGORIES,
  GOAL_ICON_OPTIONS,
  GOAL_ICON_MAP,
  GOAL_COLOR_OPTIONS,
} from "./goal-constants";
import type { Goal } from "@/lib/types";
import { Target, Plus } from "lucide-react";

interface GoalModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (goalData: Partial<Goal>) => Promise<void>;
  initialData?: Goal | null;
  customCategories?: string[];
}

export function GoalModal({
  open,
  onClose,
  onSave,
  initialData,
  customCategories = [],
}: GoalModalProps) {
  const isEditing = Boolean(initialData);

  const [title, setTitle] = useState(initialData?.title || "");
  const [targetAmount, setTargetAmount] = useState(
    initialData?.target_amount ? initialData.target_amount.toFixed(2) : ""
  );
  const [currentAmount, setCurrentAmount] = useState(
    initialData?.current_amount ? initialData.current_amount.toFixed(2) : "0.00"
  );
  const [targetDate, setTargetDate] = useState(initialData?.target_date || "");
  const [category, setCategory] = useState(initialData?.category || DEFAULT_GOAL_CATEGORIES[0].name);
  const [isCreatingCustomCat, setIsCreatingCustomCat] = useState(false);
  const [newCustomCatName, setNewCustomCatName] = useState("");
  const [color, setColor] = useState(initialData?.color || "#00ffcc");
  const [icon, setIcon] = useState(initialData?.icon || "Target");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Combina categorias padrão e customizadas sem duplicatas
  const allCategoryNames = Array.from(
    new Set([
      ...DEFAULT_GOAL_CATEGORIES.map((c) => c.name),
      ...customCategories,
    ])
  );

  const handleSelectCategory = (catName: string) => {
    setCategory(catName);
    setIsCreatingCustomCat(false);
    const predefined = DEFAULT_GOAL_CATEGORIES.find((c) => c.name === catName);
    if (predefined) {
      setColor(predefined.color);
      setIcon(predefined.icon);
    }
  };

  const handleAddCustomCategory = () => {
    const trimmed = newCustomCatName.trim();
    if (!trimmed) return;
    setCategory(trimmed);
    setNewCustomCatName("");
    setIsCreatingCustomCat(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const parsedTarget = parseFloat(targetAmount.replace(",", "."));
    const parsedCurrent = parseFloat(currentAmount.replace(",", "."));

    if (!title.trim()) {
      setError("Dê um nome para a sua meta.");
      return;
    }
    if (isNaN(parsedTarget) || parsedTarget <= 0) {
      setError("Informe um valor alvo válido maior que zero.");
      return;
    }
    if (isNaN(parsedCurrent) || parsedCurrent < 0) {
      setError("Informe um valor acumulado válido.");
      return;
    }

    try {
      setSaving(true);
      await onSave({
        title: title.trim(),
        target_amount: parsedTarget,
        current_amount: parsedCurrent,
        target_date: targetDate || null,
        category: category.trim(),
        color,
        icon,
        status: parsedCurrent >= parsedTarget ? "completed" : (initialData?.status || "in_progress"),
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar meta.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader onClose={onClose}>
        <DialogTitle>{isEditing ? "Editar Meta" : "Nova Meta Financeira"}</DialogTitle>
        <DialogDescription>
          Defina o que você quer conquistar e acompanhe cada passo do seu progresso.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {error && (
          <div className="rounded-lg border border-[var(--destructive)]/30 bg-[var(--destructive)]/10 p-3 text-xs text-[var(--destructive)]">
            {error}
          </div>
        )}

        {/* Título da meta */}
        <div>
          <Input
            label="Nome da Meta"
            placeholder="Ex: Viagem para o Nordeste, Reserva de 6 meses..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Seleção e Criação de Categoria */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-[var(--foreground)]">Categoria</label>
            {!isCreatingCustomCat && (
              <button
                type="button"
                onClick={() => setIsCreatingCustomCat(true)}
                className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1 font-mono uppercase"
              >
                <Plus className="h-3 w-3" />
                Criar Nova Categoria
              </button>
            )}
          </div>

          {isCreatingCustomCat ? (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nome da sua categoria personalizada..."
                value={newCustomCatName}
                onChange={(e) => setNewCustomCatName(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              />
              <Button type="button" size="sm" onClick={handleAddCustomCategory}>
                Usar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreatingCustomCat(false)}
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto custom-scrollbar p-1 border border-[var(--border)] rounded-lg bg-[var(--accent)]/10">
              {allCategoryNames.map((catName) => {
                const isSelected = category === catName;
                return (
                  <button
                    key={catName}
                    type="button"
                    onClick={() => handleSelectCategory(catName)}
                    className={`rounded-md px-2.5 py-1 text-xs font-sans transition-all border ${
                      isSelected
                        ? "border-[var(--primary)] bg-[var(--primary)]/20 text-[var(--primary)] font-bold shadow-[0_0_8px_var(--primary)]/30"
                        : "border-transparent bg-white/5 text-[var(--muted-foreground)] hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {catName}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Valores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <CurrencyInput
              label="Quanto você precisa? (Alvo)"
              placeholder="0,00"
              value={targetAmount}
              onChange={(value) => setTargetAmount(value)}
              required
            />
          </div>
          <div>
            <CurrencyInput
              label="Quanto já tem guardado?"
              placeholder="0,00"
              value={currentAmount}
              onChange={(value) => setCurrentAmount(value)}
            />
          </div>
        </div>

        {/* Prazo */}
        <div>
          <Input
            label="Data Limite desejada (Opcional)"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
        </div>

        {/* Ícone e Cor de Destaque */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5 block">
              Ícone
            </label>
            <div className="grid grid-cols-6 gap-1 p-1 rounded-lg border border-[var(--border)] bg-black/20">
              {GOAL_ICON_OPTIONS.map((opt) => {
                const IconComponent = GOAL_ICON_MAP[opt.value] || Target;
                const isSelected = icon === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setIcon(opt.value)}
                    title={opt.label}
                    className={`flex items-center justify-center p-2 rounded transition-all ${
                      isSelected
                        ? "bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/50"
                        : "text-[var(--muted-foreground)] hover:text-white"
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5 block">
              Cor do Marcador
            </label>
            <div className="flex flex-wrap gap-2 items-center p-2 rounded-lg border border-[var(--border)] bg-black/20">
              {GOAL_COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-6 w-6 rounded-full transition-transform ${
                    color === c ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-black" : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border)]">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Salvando..." : isEditing ? "Atualizar Meta" : "Criar Meta"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
