"use client";

import { useState, useEffect } from "react";
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
import { cn, formatCurrency } from "@/lib/utils";
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
  const [installmentTotal, setInstallmentTotal] = useState(initialData?.installment_total?.toString() || "");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState("");

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

  const handleFrequencyChange = (newFrequency: string) => {
    if (newFrequency === "installment" && !canUseInstallment) {
      setUpgradeFeature("installment");
      setShowUpgradeModal(true);
      return;
    }
    setFrequency(newFrequency as Transaction["frequency"]);
    setInstallmentTotal("");
  };

  const generateInstallments = async (
    baseData: Omit<Transaction, "id" | "created_at" | "updated_at">,
    total: number
  ) => {
    const { data: parent, error: parentError } = await supabase
      .from("transactions")
      .insert({ ...baseData, installment_current: 1, installment_total: total })
      .select()
      .single();

    if (parentError || !parent) return { error: parentError };

    const installments = [];
    const baseDate = new Date(baseData.transaction_date);

    for (let i = 1; i < total; i++) {
      const installmentDate = new Date(baseDate);
      installmentDate.setMonth(installmentDate.getMonth() + i);

      installments.push({
        ...baseData,
        parent_transaction_id: parent.id,
        installment_current: i + 1,
        installment_total: total,
        transaction_date: installmentDate.toISOString().split("T")[0],
        status: "pending",
      });
    }

    if (installments.length > 0) {
      return supabase.from("transactions").insert(installments);
    }
    return { error: null };
  };

  const generateRecurrences = async (
    baseData: Omit<Transaction, "id" | "created_at" | "updated_at">,
    freq: string,
    count: number = 12
  ) => {
    const { data: parent, error: parentError } = await supabase
      .from("transactions")
      .insert({ ...baseData, frequency: freq })
      .select()
      .single();

    if (parentError || !parent) return { error: parentError };

    const recurrences = [];
    const baseDate = new Date(baseData.transaction_date);

    for (let i = 1; i < count; i++) {
      const recurrenceDate = new Date(baseDate);

      if (freq === "monthly") {
        recurrenceDate.setMonth(recurrenceDate.getMonth() + i);
      } else if (freq === "weekly") {
        recurrenceDate.setDate(recurrenceDate.getDate() + i * 7);
      } else if (freq === "yearly") {
        recurrenceDate.setFullYear(recurrenceDate.getFullYear() + i);
      }

      recurrences.push({
        ...baseData,
        parent_transaction_id: parent.id,
        frequency: freq,
        transaction_date: recurrenceDate.toISOString().split("T")[0],
        status: "pending",
      });
    }

    if (recurrences.length > 0) {
      return supabase.from("transactions").insert(recurrences);
    }
    return { error: null };
  };

  const getTransactionCount = (): number => {
    if (frequency === "installment" && installmentTotal) {
      return parseInt(installmentTotal);
    }
    if (frequency === "monthly" || frequency === "weekly" || frequency === "yearly") {
      return 12;
    }
    return 1;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!amount || parseFloat(amount) <= 0) {
      setError("Informe um valor válido");
      return;
    }

    if (mode === "create") {
      const txCount = getTransactionCount();
      if (txCount > transactionsRemaining) {
        setError(
          `Essa ação vai criar ${txCount} lançamentos, mas você só tem ${transactionsRemaining} restantes no plano grátis. Selecione "Único" ou faça upgrade para o Pro.`
        );
        setLoading(false);
        return;
      }
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

    if (frequency === "installment" && installmentTotal) {
      const total = parseInt(installmentTotal);
      const { error } = await generateInstallments(baseData, total);
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    } else if (frequency !== "one_time" && frequency !== "installment") {
      const { error } = await generateRecurrences(baseData, frequency);
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    } else {
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
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-all",
                    scope === "personal"
                      ? "border-[var(--personal)] bg-[var(--personal)]/10 text-[var(--personal)]"
                      : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--personal)]/50"
                  )}
                >
                  <Home className="h-4 w-4" />
                  Pessoal
                </button>
                <button
                  type="button"
                  onClick={() => handleScopeChange("business")}
                  disabled={!canUseBusinessScope}
                  className={cn(
                    "flex-1 relative flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-all",
                    scope === "business"
                      ? "border-[var(--business)] bg-[var(--business)]/10 text-[var(--business)]"
                      : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--business)]/50",
                    !canUseBusinessScope && "opacity-60 cursor-not-allowed"
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

            <Select
              label="Categoria"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              options={categoryOptions}
            />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                Frequência
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {[
                  { value: "one_time", label: "Único", desc: "Uma única vez" },
                  { value: "monthly", label: "Recorrente", desc: "Repete todo mês (cria 12)" },
                  { value: "weekly", label: "Semanal", desc: "Repete toda semana (cria 12)" },
                  { value: "yearly", label: "Anual", desc: "Repete todo ano (cria 12)" },
                  { value: "installment", label: "Parcelado", desc: "Dividido em parcelas" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleFrequencyChange(option.value)}
                    disabled={option.value === "installment" && !canUseInstallment}
                    className={cn(
                      "rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all",
                      frequency === option.value
                        ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                        : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/50",
                      option.value === "installment" && !canUseInstallment && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="flex flex-col items-center">
                      <span>{option.label}</span>
                      <span className="text-[10px] opacity-70">{option.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
              {frequency === "installment" && !canUseInstallment && (
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Parcelado disponível no{" "}
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

            {frequency === "installment" && (
              <Input
                label="Número de parcelas"
                type="number"
                min="2"
                max="60"
                placeholder="Ex: 12"
                value={installmentTotal}
                onChange={(e) => setInstallmentTotal(e.target.value)}
                required
              />
            )}

            {(frequency === "monthly" || frequency === "weekly" || frequency === "yearly") && (
              <div className="rounded-lg border border-[var(--warning)]/30 bg-[var(--warning)]/5 p-3 text-sm text-[var(--warning)]">
                <p className="font-medium mb-1">Atenção: Isso vai criar 12 lançamentos</p>
                <p className="text-xs opacity-80">
                  Serão geradas 12 previsões automáticas a partir da data informada.
                  {transactionsRemaining < 12 && (
                    <> <strong>Você só tem {transactionsRemaining} lançamentos restantes.</strong> Selecione "Único" para usar apenas 1.</>
                  )}
                </p>
              </div>
            )}

            {frequency === "installment" && installmentTotal && amount && (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--accent)]/50 p-3">
                <p className="mb-1 text-sm font-medium text-[var(--foreground)]">
                  Preview das parcelas:
                </p>
                <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                  <span>
                    <strong>{installmentTotal}x</strong> de{" "}
                    <strong className="text-[var(--foreground)]">
                      {formatCurrency(parseFloat(amount) / parseInt(installmentTotal))}
                    </strong>
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Rótulos: 1/{installmentTotal} até {installmentTotal}/{installmentTotal}
                </p>
              </div>
            )}

            {frequency === "installment" && installmentTotal && !amount && (
              <div className="rounded-lg bg-[var(--accent)] p-3 text-sm text-[var(--muted-foreground)]">
                Serão criadas{" "}
                <strong>{installmentTotal} parcelas</strong> com rótulos de{" "}
                <strong>1/{installmentTotal}</strong> a{" "}
                <strong>{installmentTotal}/{installmentTotal}</strong>.
              </div>
            )}

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

      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={upgradeFeature}
      />
    </>
  );
}
