"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Save,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  Home,
  Briefcase,
} from "lucide-react";
import type { Category, Transaction } from "@/lib/types";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { UpgradeModal } from "@/components/ui/upgrade-modal";
import { usePlanLimits } from "@/lib/hooks/use-plan-limits";

interface TransactionFormProps {
  initialData?: Transaction;
  mode?: "create" | "edit";
  initialScope?: "personal" | "business";
  initialType?: "income" | "expense" | null;
}

export function TransactionForm({
  initialData,
  mode = "create",
  initialScope = "personal",
  initialType,
}: TransactionFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const {
    canUseBusinessScope,
    canUseInstallment,
    transactionsRemaining,
    isLoading: planLoading,
    refresh: refreshPlan,
  } = usePlanLimits();

  const [scope, setScope] = useState<"personal" | "business">(initialData?.scope || initialScope);
  const [type, setType] = useState<"income" | "expense">(initialData?.type || (initialType as "income" | "expense") || "expense");
  const [description, setDescription] = useState(initialData?.description || "");
  const [amount, setAmount] = useState(initialData?.amount ? initialData.amount.toFixed(2) : "");
  const [categoryId, setCategoryId] = useState(initialData?.category_id || "");
  const [transactionDate, setTransactionDate] = useState(initialData?.transaction_date || new Date().toISOString().split("T")[0]);
  const [frequency, setFrequency] = useState<Transaction["frequency"]>(initialData?.frequency || "one_time");
  const [dueDay, setDueDay] = useState(initialData?.due_day?.toString() || "1");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState("");

  // Nova categoria
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("tag");
  const [newCategoryColor, setNewCategoryColor] = useState("#6366f1");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const newCategoryNameRef = useRef<HTMLInputElement>(null);

  // Editar categoria
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryIcon, setEditCategoryIcon] = useState("tag");
  const [editCategoryColor, setEditCategoryColor] = useState("#6366f1");
  const [updatingCategory, setUpdatingCategory] = useState(false);

  // Excluir categoria
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [confirmDeleteCategory, setConfirmDeleteCategory] = useState(false);

  const categoryIcons = [
    { value: "tag", label: "Etiqueta" },
    { value: "shopping-cart", label: "Carrinho" },
    { value: "home", label: "Casa" },
    { value: "car", label: "Carro" },
    { value: "utensils", label: "Alimentação" },
    { value: "heart", label: "Saúde" },
    { value: "briefcase", label: "Trabalho" },
    { value: "zap", label: "Energia" },
    { value: "wifi", label: "Internet" },
    { value: "gift", label: "Presente" },
    { value: "plane", label: "Viagem" },
    { value: "book", label: "Educação" },
    { value: "music", label: "Lazer" },
    { value: "dumbbell", label: "Academia" },
    { value: "coffee", label: "Café" },
    { value: "trending-up", label: "Investimento" },
  ];

  const categoryColors = [
    "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
    "#ec4899", "#f43f5e", "#ef4444", "#f97316",
    "#f59e0b", "#eab308", "#84cc16", "#22c55e",
    "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
    "#3b82f6", "#6366f1",
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .eq("scope", scope)
        .eq("type", type)
        .order("name");
      if (data) setCategories(data);
    };
    fetchCategories();
  }, [supabase, scope, type]);

  const categoryOptions = [
    { value: "", label: "Sem categoria" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
    { value: "__new__", label: "+ Criar nova categoria" },
  ];

  const handleScopeChange = (newScope: "personal" | "business") => {
    if (newScope === "business" && !canUseBusinessScope) {
      setUpgradeFeature("business_scope");
      setShowUpgradeModal(true);
      return;
    }
    setScope(newScope);
    setCategoryId("");
  };

  const handleTypeChange = (newType: "income" | "expense") => {
    setType(newType);
    setCategoryId("");
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    setCreatingCategory(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setCreatingCategory(false);
      return;
    }

    const { data, error } = await supabase
      .from("categories")
      .insert({
        user_id: userData.user.id,
        name: newCategoryName.trim(),
        icon: newCategoryIcon,
        color: newCategoryColor,
        scope,
        type,
        is_default: false,
      })
      .select()
      .single();

    if (error) {
      setError("Erro ao criar categoria: " + error.message);
      setCreatingCategory(false);
      return;
    }

    if (data) {
      setCategories((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setCategoryId(data.id);
      setNewCategoryName("");
      setNewCategoryIcon("tag");
      setNewCategoryColor("#6366f1");
      setShowNewCategory(false);
    }

    setCreatingCategory(false);
  };

  const handleCategorySelect = (value: string) => {
    if (value === "__new__") {
      setShowNewCategory(true);
      setCategoryId("");
      setTimeout(() => newCategoryNameRef.current?.focus(), 100);
    } else {
      setShowNewCategory(false);
      setEditingCategory(null);
      setCategoryId(value);
    }
  };

  const handleStartEditCategory = () => {
    const cat = categories.find((c) => c.id === categoryId);
    if (cat) {
      setEditingCategory(cat);
      setEditCategoryName(cat.name);
      setEditCategoryIcon(cat.icon);
      setEditCategoryColor(cat.color);
      setShowNewCategory(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editCategoryName.trim()) return;

    setUpdatingCategory(true);
    const { error } = await supabase
      .from("categories")
      .update({
        name: editCategoryName.trim(),
        icon: editCategoryIcon,
        color: editCategoryColor,
      })
      .eq("id", editingCategory.id);

    if (error) {
      setError("Erro ao atualizar categoria: " + error.message);
      setUpdatingCategory(false);
      return;
    }

    setCategories((prev) =>
      prev.map((c) =>
        c.id === editingCategory.id
          ? { ...c, name: editCategoryName.trim(), icon: editCategoryIcon, color: editCategoryColor }
          : c
      ).sort((a, b) => a.name.localeCompare(b.name))
    );
    setEditingCategory(null);
    setUpdatingCategory(false);
  };

  const handleStartDeleteCategory = (cat: Category) => {
    setDeletingCategory(cat);
    setConfirmDeleteCategory(true);
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", deletingCategory.id);

    if (error) {
      setError("Erro ao excluir categoria: " + error.message);
      setConfirmDeleteCategory(false);
      setDeletingCategory(null);
      return;
    }

    setCategories((prev) => prev.filter((c) => c.id !== deletingCategory.id));
    if (categoryId === deletingCategory.id) {
      setCategoryId("");
    }
    setConfirmDeleteCategory(false);
    setDeletingCategory(null);
  };

  const handleFrequencyChange = (newFrequency: string) => {
    setFrequency(newFrequency as Transaction["frequency"]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!amount || parseFloat(amount) <= 0) {
      setError("Informe um valor válido");
      return;
    }

    setLoading(true);

    const baseData = {
      user_id: (await supabase.auth.getUser()).data.user!.id,
      description,
      amount: parseFloat(amount),
      type,
      scope,
      frequency,
      category_id: categoryId || null,
      transaction_date: transactionDate,
      status: (initialData?.status || "pending") as "pending" | "paid",
      notes,
      installment_current: null,
      installment_total: null,
      parent_transaction_id: null,
      due_date: null,
      due_day: frequency === "monthly" ? parseInt(dueDay) : null,
      is_recurring: frequency === "monthly",
      recurring_active: frequency === "monthly" ? true : false,
    };

    if (mode === "edit" && initialData) {
      const { error } = await supabase
        .from("transactions")
        .update(baseData)
        .eq("id", initialData.id);

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const backUrl = scope === "business" ? "/business/transactions" : "/personal/transactions";
      router.push(backUrl);
      return;
    }

    const { error } = await supabase.from("transactions").insert(baseData);
    if (error) {
      if (error.message.includes("limite") || error.message.includes("plano")) {
        setUpgradeFeature("transaction_limit");
        setShowUpgradeModal(true);
        setLoading(false);
        return;
      }
      setError(error.message);
      setLoading(false);
      return;
    }

    await refreshPlan();
    const backUrl = scope === "business" ? "/business/transactions" : "/personal/transactions";
    router.push(backUrl);
  };

  const handleDelete = async () => {
    if (!initialData) return;
    setDeleting(true);
    const { error } = await supabase.from("transactions").delete().eq("id", initialData.id);
    if (error) {
      setError("Erro ao excluir: " + error.message);
      setDeleting(false);
      return;
    }
    setDeleting(false);
    setShowDelete(false);
    const backUrl = scope === "business" ? "/business/transactions" : "/personal/transactions";
    router.push(backUrl);
  };

  if (planLoading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  const backUrl = mode === "edit" && initialData
    ? (initialData.scope === "business" ? "/business/transactions" : "/personal/transactions")
    : (scope === "business" ? "/business/transactions" : "/personal/transactions");

  return (
    <>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href={backUrl}
                className="rounded-lg p-1 hover:bg-[var(--accent)]"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <CardTitle>
                  {mode === "edit" ? "Editar Lançamento" : "Novo Lançamento"}
                </CardTitle>
                {mode === "create" && (
                  <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
                    {scope === "personal" ? "Pessoal" : "Negócio"} —{" "}
                    {type === "income" ? "Receita" : "Despesa"}
                  </p>
                )}
              </div>
            </div>
            {mode === "edit" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDelete(true)}
                className="text-[var(--muted-foreground)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-[var(--destructive)]/10 p-3 text-sm text-[var(--destructive)]">
                {error}
              </div>
            )}

            {mode === "create" && transactionsRemaining < Infinity && (
              <div
                className={cn(
                  "rounded-lg p-3 text-sm",
                  transactionsRemaining <= 5
                    ? "bg-[var(--warning)]/10 text-[var(--warning)]"
                    : "bg-[var(--accent)] text-[var(--muted-foreground)]"
                )}
              >
                {transactionsRemaining === 0 ? (
                  <p>
                    Você atingiu o limite de 30 lançamentos do mês.{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setUpgradeFeature("transaction_limit");
                        setShowUpgradeModal(true);
                      }}
                      className="font-medium underline"
                    >
                      Faça upgrade para o Pro
                    </button>
                  </p>
                ) : (
                  <p>
                    Você tem <strong>{transactionsRemaining}</strong> lançamentos
                    restantes este mês no plano grátis.
                  </p>
                )}
              </div>
            )}

            {/* Abas Pessoal / Negócio */}
            <div>
               <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleScopeChange("personal")}
                  disabled={scope === "business"}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-all",
                    scope === "personal"
                      ? "border-[var(--personal)] bg-[var(--personal)]/10 text-[var(--personal)]"
                      : "border-[var(--border)] text-[var(--muted-foreground)] opacity-50 cursor-not-allowed"
                  )}
                >
                  <Home className="h-4 w-4" />
                  Pessoal
                </button>
                <button
                  type="button"
                  onClick={() => handleScopeChange("business")}
                  disabled={scope === "personal" || !canUseBusinessScope}
                  className={cn(
                    "flex-1 relative flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-all",
                    scope === "business"
                      ? "border-[var(--business)] bg-[var(--business)]/10 text-[var(--business)]"
                      : "border-[var(--border)] text-[var(--muted-foreground)] opacity-50 cursor-not-allowed",
                    !canUseBusinessScope && scope === "personal" && "opacity-30"
                  )}
                >
                  <Briefcase className="h-4 w-4" />
                  Negócio
                  {!canUseBusinessScope && (
                    <span className="rounded bg-[var(--primary)] px-1.5 py-0.5 text-[10px] font-bold text-white">
                      Pro
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Tipo: Receita / Despesa */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                Tipo
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleTypeChange("income")}
                  className={cn(
                    "flex-1 rounded-lg border-2 px-3 py-3 text-sm font-medium transition-all",
                    type === "income"
                      ? "border-[var(--income)] bg-[var(--income)]/10 text-[var(--income)]"
                      : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--income)]/50"
                  )}
                >
                  <div className="flex flex-col items-center gap-1">
                    <ArrowDownLeft className="h-5 w-5" />
                    <span>Receita</span>
                    <span className="text-[10px] opacity-70">Entrada de R$</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange("expense")}
                  className={cn(
                    "flex-1 rounded-lg border-2 px-3 py-3 text-sm font-medium transition-all",
                    type === "expense"
                      ? "border-[var(--expense)] bg-[var(--expense)]/10 text-[var(--expense)]"
                      : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--expense)]/50"
                  )}
                >
                  <div className="flex flex-col items-center gap-1">
                    <ArrowUpRight className="h-5 w-5" />
                    <span>Despesa</span>
                    <span className="text-[10px] opacity-70">Saída de R$</span>
                  </div>
                </button>
              </div>
            </div>

            <Input
              label="Descrição"
              placeholder={
                type === "income"
                  ? scope === "personal"
                    ? "Ex: Salário, Freelance, Rendimento..."
                    : "Ex: Venda, Serviço, Cliente..."
                  : scope === "personal"
                    ? "Ex: Conta de luz, Aluguel, Mercado..."
                    : "Ex: Insumo, Combustível, Aluguel do espaço..."
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <CurrencyInput
                label="Valor (R$)"
                placeholder="0,00"
                value={amount}
                onChange={setAmount}
                required
              />
              <Input
                label="Data"
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                required
              />
            </div>

            <div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select
                    label="Categoria"
                    value={showNewCategory ? "__new__" : categoryId}
                    onChange={(e) => handleCategorySelect(e.target.value)}
                    options={categoryOptions}
                  />
                </div>
                {categoryId && !showNewCategory && !editingCategory && (
                  <div className="flex items-end gap-1 pb-0.5">
                    <button
                      type="button"
                      onClick={handleStartEditCategory}
                      className="h-10 w-10 flex items-center justify-center rounded-lg border border-[var(--input)] text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] transition-colors"
                      title="Editar categoria"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const cat = categories.find((c) => c.id === categoryId);
                        if (cat) handleStartDeleteCategory(cat);
                      }}
                      className="h-10 w-10 flex items-center justify-center rounded-lg border border-[var(--input)] text-[var(--muted-foreground)] hover:bg-[var(--destructive)]/10 hover:text-[var(--destructive)] transition-colors"
                      title="Excluir categoria"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {showNewCategory && (
                <div className="mt-3 rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      Nova Categoria
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewCategory(false);
                        setNewCategoryName("");
                      }}
                      className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    >
                      Cancelar
                    </button>
                  </div>

                  <input
                    ref={newCategoryNameRef}
                    type="text"
                    placeholder="Nome da categoria"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                  />

                  <div>
                    <p className="mb-2 text-xs text-[var(--muted-foreground)]">Ícone</p>
                    <div className="flex flex-wrap gap-2">
                      {categoryIcons.map((icon) => (
                        <button
                          key={icon.value}
                          type="button"
                          onClick={() => setNewCategoryIcon(icon.value)}
                          className={cn(
                            "h-8 w-8 rounded-lg border-2 flex items-center justify-center text-xs transition-all",
                            newCategoryIcon === icon.value
                              ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                              : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/50"
                          )}
                          title={icon.label}
                        >
                          {icon.value.charAt(0).toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs text-[var(--muted-foreground)]">Cor</p>
                    <div className="flex flex-wrap gap-2">
                      {categoryColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewCategoryColor(color)}
                          className={cn(
                            "h-6 w-6 rounded-full border-2 transition-all",
                            newCategoryColor === color
                              ? "border-[var(--foreground)] scale-110"
                              : "border-transparent hover:scale-110"
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={!newCategoryName.trim() || creatingCategory}
                    className="w-full"
                    size="sm"
                  >
                    {creatingCategory ? "Criando..." : "Criar Categoria"}
                  </Button>
                </div>
              )}

              {editingCategory && (
                <div className="mt-3 rounded-lg border border-[var(--business)]/30 bg-[var(--business)]/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      Editar Categoria
                    </p>
                    <button
                      type="button"
                      onClick={() => setEditingCategory(null)}
                      className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    >
                      Cancelar
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Nome da categoria"
                    value={editCategoryName}
                    onChange={(e) => setEditCategoryName(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                  />

                  <div>
                    <p className="mb-2 text-xs text-[var(--muted-foreground)]">Ícone</p>
                    <div className="flex flex-wrap gap-2">
                      {categoryIcons.map((icon) => (
                        <button
                          key={icon.value}
                          type="button"
                          onClick={() => setEditCategoryIcon(icon.value)}
                          className={cn(
                            "h-8 w-8 rounded-lg border-2 flex items-center justify-center text-xs transition-all",
                            editCategoryIcon === icon.value
                              ? "border-[var(--business)] bg-[var(--business)]/10 text-[var(--business)]"
                              : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--business)]/50"
                          )}
                          title={icon.label}
                        >
                          {icon.value.charAt(0).toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs text-[var(--muted-foreground)]">Cor</p>
                    <div className="flex flex-wrap gap-2">
                      {categoryColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setEditCategoryColor(color)}
                          className={cn(
                            "h-6 w-6 rounded-full border-2 transition-all",
                            editCategoryColor === color
                              ? "border-[var(--foreground)] scale-110"
                              : "border-transparent hover:scale-110"
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleUpdateCategory}
                    disabled={!editCategoryName.trim() || updatingCategory}
                    className="w-full"
                    size="sm"
                  >
                    {updatingCategory ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                Frequência
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
                {[
                  { value: "one_time", label: "Único", desc: "Uma única vez", needsPro: false },
                  { value: "monthly", label: "Recorrente", desc: "Repete todo mês", needsPro: true },
                ].map((option) => {
                  const isDisabled = option.needsPro && !canUseInstallment;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleFrequencyChange(option.value)}
                      disabled={isDisabled}
                      className={cn(
                        "rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all",
                        frequency === option.value
                          ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                          : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/50",
                        isDisabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="flex flex-col items-center">
                        <span>{option.label}</span>
                        <span className="text-[10px] opacity-70">{option.desc}</span>
                        {isDisabled && (
                          <span className="mt-1 text-[8px] font-bold uppercase tracking-wider text-[var(--warning)]">
                            PRO
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              {!canUseInstallment && (
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  Lançamentos recorrentes disponíveis no{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setUpgradeFeature("installment");
                      setShowUpgradeModal(true);
                    }}
                    className="font-medium text-[var(--primary)] underline"
                  >
                    Plano Pro
                  </button>
                </p>
              )}
            </div>

            {frequency === "monthly" && (
              <div className="rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/5 p-3">
                <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">
                  Dia do vencimento
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--muted-foreground)]">Todo dia</span>
                  <select
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-medium text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm text-[var(--muted-foreground)]">de cada mês</span>
                </div>
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  Essa transação aparecerá automaticamente todo mês no dia {dueDay}.
                </p>
              </div>
            )}

            {frequency === "monthly" && (
              <div className="rounded-lg border border-[var(--warning)]/30 bg-[var(--warning)]/5 p-3 text-sm text-[var(--warning)]">
                <p className="font-medium mb-1">Transação recorrente</p>
                <p className="text-xs opacity-80">
                  Essa transação será criada uma vez e aparecerá automaticamente todo mês.
                  Você pode pausar ou editar a qualquer momento.
                </p>
              </div>            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                Observações (opcional)
              </label>
              <textarea
                className="flex min-h-[80px] w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
                placeholder="Alguma observação..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Link href={backUrl} className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" className="flex-1 gap-2" disabled={loading}>
                <Save className="h-4 w-4" />
                {loading
                  ? "Salvando..."
                  : mode === "edit"
                    ? "Salvar Alterações"
                    : "Criar Lançamento"}
              </Button>
            </div>
          </form>
        </CardContent>
        <ConfirmDialog
          open={showDelete}
          onClose={() => setShowDelete(false)}
          onConfirm={handleDelete}
          title="Excluir lançamento"
          description="Tem certeza que deseja excluir este lançamento? Esta ação não pode ser desfeita."
          confirmLabel="Excluir"
          loading={deleting}
        />
      </Card>

      <ConfirmDialog
        open={confirmDeleteCategory}
        onClose={() => {
          setConfirmDeleteCategory(false);
          setDeletingCategory(null);
        }}
        onConfirm={handleDeleteCategory}
        title="Excluir categoria"
        description={`Tem certeza que deseja excluir a categoria "${deletingCategory?.name}"? Os lançamentos vinculados ficarão sem categoria.`}
        confirmLabel="Excluir"
        loading={false}
      />

      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={upgradeFeature}
      />
    </>
  );
}
