"use client";

import { useState, useEffect } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { TransactionWithCategory } from "@/lib/types";
import { X, Download, AlertTriangle, TrendingUp, TrendingDown, Clock, CheckCircle2, BarChart3, Lock, Crown, Info, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface ReportPreviewProps {
  transactions: TransactionWithCategory[];
  scope: "personal" | "business";
  month: string;
  onClose: () => void;
  onExport: () => void;
  loading: boolean;
  isFree?: boolean;
}

interface CategorySummary {
  name: string;
  total: number;
  count: number;
  color: string;
}

export function ReportPreview({
  transactions,
  scope,
  month,
  onClose,
  onExport,
  loading,
  isFree = false,
}: ReportPreviewProps) {
  const supabase = createClient();
  const [userName, setUserName] = useState("");
  const [prevMonthData, setPrevMonthData] = useState<{ income: number; expense: number; savings: number } | null>(null);
  const [year, monthNum] = month.split("-");
  const monthLabel = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(new Date(parseInt(year), parseInt(monthNum) - 1));

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        if (profile) setUserName(profile.full_name || user.email || "");
      }
    };
    fetchUser();
  }, [supabase]);

  useEffect(() => {
    let cancelled = false;
    const fetchPrevMonth = async () => {
      const prevDate = new Date(parseInt(year), parseInt(monthNum) - 2, 1);
      const prevYear = prevDate.getFullYear();
      const prevMonth = prevDate.getMonth() + 1;
      const prevMonthKey = `${prevYear}-${String(prevMonth).padStart(2, "0")}`;
      const prevStart = `${prevMonthKey}-01`;
      const prevLastDay = new Date(prevYear, prevMonth, 0).getDate();
      const prevEnd = `${prevMonthKey}-${String(prevLastDay).padStart(2, "0")}`;

      let regularQuery = supabase
        .from("transactions")
        .select("*, categories(*)")
        .gte("transaction_date", prevStart)
        .lte("transaction_date", prevEnd)
        .eq("is_recurring", false);

      if (scope === "personal" || scope === "business") {
        regularQuery = regularQuery.eq("scope", scope);
      }
      const { data: regularData } = await regularQuery;

      let recurringQuery = supabase
        .from("transactions")
        .select("*, categories(*)")
        .eq("is_recurring", true);

      if (scope === "personal" || scope === "business") {
        recurringQuery = recurringQuery.eq("scope", scope);
      }
      const { data: recurringTemplates } = await recurringQuery;

      const prevTxs: TransactionWithCategory[] = ((regularData as TransactionWithCategory[]) || []).map((t) => ({
        ...t,
        amount: Number(t.amount),
      }));

      if (recurringTemplates) {
        for (const template of recurringTemplates) {
          const dueDay = template.due_day || 1;
          if (dueDay > prevLastDay) continue;
          if (template.transaction_date?.substring(0, 7) !== prevMonthKey) continue;

          let virtualStatus: "pending" | "paid" = "pending";
          if (template.last_paid_date && template.last_paid_date.substring(0, 7) >= prevMonthKey) {
            virtualStatus = "paid";
          }

          prevTxs.push({
            ...template,
            id: `virtual_${template.id}_${prevYear}_${prevMonth}`,
            transaction_date: template.transaction_date,
            is_recurring: true,
            recurring_active: template.recurring_active,
            status: virtualStatus,
            template_id: template.id,
            amount: Number(template.amount),
          });
        }
      }

      const prevIncome = prevTxs
        .filter((t) => t.type === "income" && t.status === "paid")
        .reduce((sum, t) => sum + t.amount, 0);
      const prevExpense = prevTxs
        .filter((t) => t.type === "expense" && t.status === "paid")
        .reduce((sum, t) => sum + t.amount, 0);

      if (!cancelled) {
        setPrevMonthData({ income: prevIncome, expense: prevExpense, savings: prevIncome - prevExpense });
      }
    };
    fetchPrevMonth();
    return () => {
      cancelled = true;
    };
  }, [supabase, scope, year, monthNum]);

  const incomeTransactions = transactions.filter((t) => t.type === "income");
  const expenseTransactions = transactions.filter((t) => t.type === "expense");

  const pendingIncome = incomeTransactions.filter((t) => t.status === "pending");
  const pendingExpense = expenseTransactions.filter((t) => t.status === "pending");
  const paidIncome = incomeTransactions.filter((t) => t.status === "paid");
  const paidExpense = expenseTransactions.filter((t) => t.status === "paid");

  // Totais usam apenas pagos (contabilidade de caixa)
  const totalIncome = paidIncome.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = paidExpense.reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const totalPendingIncome = pendingIncome.reduce((sum, t) => sum + t.amount, 0);
  const totalPendingExpense = pendingExpense.reduce((sum, t) => sum + t.amount, 0);

  // Maior gasto (pago)
  const highestExpense = paidExpense.length > 0
    ? paidExpense.reduce((max, t) => (t.amount > max.amount ? t : max), paidExpense[0])
    : null;

  // Maior receita (paga)
  const highestIncome = paidIncome.length > 0
    ? paidIncome.reduce((max, t) => (t.amount > max.amount ? t : max), paidIncome[0])
    : null;

  // Gastos por categoria (apenas pagos)
  const expensesByCategory = paidExpense.reduce<Record<string, CategorySummary>>((acc, t) => {
    const catName = t.categories?.name || "Sem categoria";
    const catColor = t.categories?.color || "#6b7280";
    if (!acc[catName]) {
      acc[catName] = { name: catName, total: 0, count: 0, color: catColor };
    }
    acc[catName].total += t.amount;
    acc[catName].count += 1;
    return acc;
  }, {});

  const topCategories = Object.values(expensesByCategory)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Ticket médio (apenas pagos)
  const avgTicket = paidExpense.length > 0
    ? totalExpense / paidExpense.length
    : 0;

  // Dias com gastos
  const daysWithExpenses = new Set(expenseTransactions.map((t) => t.transaction_date)).size;

  const groupByDate = (txs: TransactionWithCategory[]) => {
    const grouped: Record<string, TransactionWithCategory[]> = {};
    txs.forEach((t) => {
      const date = t.transaction_date;
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(t);
    });
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  };

  const incomeByDate = groupByDate(incomeTransactions);
  const expenseByDate = groupByDate(expenseTransactions);

  // Paginação do detalhamento (10 itens por página)
  const PAGE_SIZE = 10;
  const [incomePage, setIncomePage] = useState(1);
  const [expensePage, setExpensePage] = useState(1);

  const incomeRowsFlat = incomeByDate.flatMap(([, txs]) => txs);
  const expenseRowsFlat = expenseByDate.flatMap(([, txs]) => txs);
  const incomeTotalPages = Math.max(1, Math.ceil(incomeRowsFlat.length / PAGE_SIZE));
  const expenseTotalPages = Math.max(1, Math.ceil(expenseRowsFlat.length / PAGE_SIZE));
  const safeIncomePage = Math.min(incomePage, incomeTotalPages);
  const safeExpensePage = Math.min(expensePage, expenseTotalPages);
  const paginatedIncome = incomeRowsFlat.slice((safeIncomePage - 1) * PAGE_SIZE, safeIncomePage * PAGE_SIZE);
  const paginatedExpense = expenseRowsFlat.slice((safeExpensePage - 1) * PAGE_SIZE, safeExpensePage * PAGE_SIZE);

  const now = new Date();
  const generatedAt = now.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Resumo executivo (com comparação vs mês anterior)
  const prevLabel = prevMonthData
    ? new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(new Date(parseInt(year), parseInt(monthNum) - 2))
    : "";
  const summaryText = (() => {
    const prevSavings = prevMonthData?.savings;
    const diffPct = prevSavings !== undefined && prevSavings !== 0 ? ((balance - prevSavings) / Math.abs(prevSavings)) * 100 : null;
    let comparePhrase = "";
    if (prevLabel && diffPct !== null) {
      if (diffPct > 0) comparePhrase = `${Math.abs(diffPct).toFixed(0)}% a mais que em ${prevLabel}`;
      else if (diffPct < 0) comparePhrase = `${Math.abs(diffPct).toFixed(0)}% a menos que em ${prevLabel}`;
      else comparePhrase = `o mesmo que em ${prevLabel}`;
    }

    if (balance > 0) {
      return `Você economizou ${formatCurrency(balance)} neste mês${comparePhrase ? `, ${comparePhrase}` : ""}.`;
    }
    if (balance < 0) {
      return `Seu saldo ficou negativo em ${formatCurrency(Math.abs(balance))} neste mês${comparePhrase ? `, ${comparePhrase}` : ""}.`;
    }
    return `Seu saldo ficou equilibrado neste mês, sem sobras nem déficits${comparePhrase ? ` (${comparePhrase})` : ""}.`;
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)] shadow-2xl">
        {/* Header Profissional */}
        <div className="border-b border-[var(--border)] bg-gradient-to-r from-[var(--primary)]/5 to-transparent px-4 py-2 sm:px-8 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <Logo size="sm" showText={false} imageClassName="h-28 w-28" />
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {isFree ? (
                <Link
                  href="/personal/planos"
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-bold text-white hover:bg-[var(--primary)]/80 transition-colors"
                >
                  <Crown className="h-3 w-3" />
                  Desbloquear Tudo
                </Link>
              ) : (
                <Button
                  size="sm"
                  onClick={onExport}
                  disabled={loading}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  {loading ? "Gerando..." : "Exportar PDF"}
                </Button>
              )}
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-6 text-sm sm:text-base text-[var(--muted-foreground)]">
            <span className="truncate">Período: <strong className="text-[var(--foreground)]">{monthLabel}</strong></span>
            <span className="hidden sm:inline">Gerado em: <strong className="text-[var(--foreground)]">{generatedAt}</strong></span>
            <span className="hidden md:inline">ID: <strong className="text-[var(--foreground)]">{crypto.randomUUID().slice(0, 8).toUpperCase()}</strong></span>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 sm:p-8" style={{ maxHeight: "calc(90vh - 160px)" }}>
          {transactions.length === 0 ? (
            <div className="py-16 text-center text-[var(--muted-foreground)]">
              <p className="text-xl">Nenhum lançamento encontrado para este período.</p>
            </div>
          ) : (
            <>
              {/* Cabeçalho do Relatório */}
              <div className="mb-4 border-b border-[var(--border)] pb-3">
                <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center">
                  <span className="text-base font-bold text-[var(--foreground)]">{userName}</span>
                  <span className="text-[var(--muted-foreground)]">•</span>
                  <span className="text-sm font-semibold text-[var(--primary)]">Relatório {scope === "business" ? "Negócio" : "Pessoal"}</span>
                  <span className="text-[var(--muted-foreground)]">•</span>
                  <span className="text-xs text-[var(--muted-foreground)]">{monthLabel}</span>
                </div>
              </div>

              {/* Resumo Executivo */}
              <div className="mb-8 overflow-hidden rounded-xl border border-[var(--primary)]/20 bg-gradient-to-r from-[var(--primary)]/10 to-transparent p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10">
                    <Sparkles className="h-5 w-5 text-[var(--primary)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">Resumo Executivo</p>
                    <p className="mt-1 text-base sm:text-lg leading-snug font-semibold text-[var(--foreground)]">
                      {summaryText}
                    </p>
                  </div>
                </div>
              </div>

              {/* 1. INDICADORES CHAVE */}
              <section className="mb-8">
                <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-[var(--foreground)] uppercase tracking-wider border-b border-[var(--border)] pb-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-[var(--primary)]/10 text-xs font-bold text-[var(--primary)]">1</span>
                  INDICADORES IMPORTANTES
                  {isFree && <Lock className="h-3 w-3 text-[var(--warning)] ml-1" />}
                </h2>
                <div className={isFree ? "blur-sm pointer-events-none select-none" : ""}>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <IndicatorCard
                    icon={<TrendingUp className="h-4 w-4" />}
                    label="Maior Receita"
                    value={formatCurrency(highestIncome ? highestIncome.amount : 0)}
                    detail={highestIncome?.description || "Nenhuma receita paga"}
                    color="success"
                    tooltip="Maior valor recebido no mês. Considera apenas lançamentos com status pago."
                  />
                  <IndicatorCard
                    icon={<TrendingDown className="h-4 w-4" />}
                    label="Maior Gasto"
                    value={formatCurrency(highestExpense ? highestExpense.amount : 0)}
                    detail={highestExpense?.description || "Nenhuma despesa paga"}
                    color="destructive"
                    tooltip="Maior despesa paga no mês. Ajuda a identificar onde o dinheiro mais saiu."
                  />
                  <IndicatorCard
                    icon={<BarChart3 className="h-4 w-4" />}
                    label="Média por Gasto"
                    value={formatCurrency(avgTicket)}
                    detail={paidExpense.length > 0 ? `${paidExpense.length} pagas` : "Nenhuma paga"}
                    color="primary"
                    tooltip="Total pago em despesas ÷ número de despesas pagas. Mostra seu ticket médio de consumo."
                  />
                </div>
                </div>
                {isFree && (
                  <div className="mt-4 rounded-lg border border-[var(--warning)]/30 bg-[var(--warning)]/5 p-4 text-center">
                    <Lock className="mx-auto h-5 w-5 text-[var(--warning)] mb-2" />
                    <p className="text-sm font-medium text-[var(--foreground)]">Indicadores detalhados são do plano Pro</p>
                    <Link
                      href="/personal/planos"
                      className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-[var(--primary)] hover:underline"
                    >
                      Desbloquear com Trial Grátis
                    </Link>
                  </div>
                )}
              </section>

              <div className={isFree ? "blur-sm pointer-events-none select-none" : ""}>
              {/* 2. CATEGORIAS COM MAIS GASTOS */}
              {topCategories.length > 0 && (
                <section className="mb-8">
                  <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-[var(--foreground)] uppercase tracking-wider border-b border-[var(--border)] pb-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-[var(--primary)]/10 text-xs font-bold text-[var(--primary)]">2</span>
                    Categorias com Mais Gastos
                  </h2>
                  <div className="space-y-3">
                    {topCategories.map((cat, i) => {
                      const percentage = totalExpense > 0 ? (cat.total / totalExpense) * 100 : 0;
                      return (
                        <div key={cat.name} className="rounded-lg border border-[var(--border)] p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className="flex h-6 w-6 items-center justify-center rounded bg-[var(--foreground)]/5 text-xs font-bold text-[var(--muted-foreground)]">
                                {i + 1}
                              </span>
                              <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                                <span className="text-base font-medium text-[var(--foreground)]">
                                  {cat.name}{cat.count > 1 ? ` - ${cat.count} ocorrências` : ""}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-base font-semibold text-[var(--foreground)]">{formatCurrency(cat.total)}</span>
                            </div>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--accent)]">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${percentage}%`, backgroundColor: cat.color }}
                            />
                          </div>
                          <p className="mt-1 text-base text-[var(--muted-foreground)]">
                            {percentage.toFixed(1)}% do total de despesas
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* 4. STATUS DOS LANÇAMENTOS */}
              <section className="mb-8">
                <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-[var(--foreground)] uppercase tracking-wider border-b border-[var(--border)] pb-2">
<span className="flex h-5 w-5 items-center justify-center rounded bg-[var(--primary)]/10 text-xs font-bold text-[var(--primary)]">3</span>
                    Status dos Lançamentos
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-[var(--border)] p-4">
                    <h3 className="mb-3 text-xs font-semibold text-[var(--success)] uppercase tracking-wider">
                      Receitas
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-base text-[var(--muted-foreground)]">
                          <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
                          Recebido
                        </span>
                        <span className="text-base font-semibold text-[var(--success)]">
                          {formatCurrency(paidIncome.reduce((s, t) => s + t.amount, 0))}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-base text-[var(--muted-foreground)]">
                          <Clock className="h-4 w-4 text-[var(--warning)]" />
                          A receber
                        </span>
                        <span className="text-base font-semibold text-[var(--warning)]">
                          {formatCurrency(totalPendingIncome)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-[var(--border)] p-4">
                    <h3 className="mb-3 text-xs font-semibold text-[var(--destructive)] uppercase tracking-wider">
                      Despesas
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-base text-[var(--muted-foreground)]">
                          <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
                          Pago
                        </span>
                        <span className="text-base font-semibold text-[var(--success)]">
                          {formatCurrency(paidExpense.reduce((s, t) => s + t.amount, 0))}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-base text-[var(--muted-foreground)]">
                          <AlertTriangle className="h-4 w-4 text-[var(--destructive)]" />
                          A pagar
                        </span>
                        <span className="text-base font-semibold text-[var(--destructive)]">
                          {formatCurrency(totalPendingExpense)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 5. DETALHAMENTO - RECEITAS */}
              {incomeByDate.length > 0 && (
                <section className="mb-8">
                  <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-[var(--foreground)] uppercase tracking-wider border-b border-[var(--border)] pb-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-[var(--success)]/10 text-xs font-bold text-[var(--success)]">4</span>
                    Detalhamento — Receitas
                  </h2>
                  <div className="rounded-xl border border-[var(--border)] overflow-hidden">
                    <ul className="divide-y divide-[var(--border)]">
                      {paginatedIncome.map((t) => (
                        <li key={t.id} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 px-3 sm:px-4 py-3 hover:bg-[var(--accent)]/30">
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm sm:text-base text-[var(--foreground)] break-words">{t.description || "Sem descrição"}{t.is_recurring ? " (Recorrente)" : ""}</p>
                              <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">{formatDate(t.transaction_date)} • {t.categories?.name || "—"}</p>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center justify-between sm:justify-end gap-3">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${t.status === "paid" ? "bg-[var(--success)]/10 text-[var(--success)]" : "bg-[var(--warning)]/10 text-[var(--warning)]"}`}>
                              {t.status === "paid" ? "Pago" : "Pendente"}
                            </span>
                            <span className="font-semibold text-sm sm:text-base text-[var(--success)]">+{formatCurrency(t.amount)}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between gap-2 border-t border-[var(--border)] bg-[var(--accent)]/50 px-3 sm:px-4 py-2">
                      <button
                        onClick={() => setIncomePage((p) => Math.max(1, p - 1))}
                        disabled={incomePage <= 1}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                      </button>
                      <span className="text-xs sm:text-sm text-[var(--muted-foreground)]">Página {incomePage} de {incomeTotalPages}</span>
                      <button
                        onClick={() => setIncomePage((p) => Math.min(incomeTotalPages, p + 1))}
                        disabled={incomePage >= incomeTotalPages}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                      >
                        Próximo
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--accent)]/50 px-3 sm:px-4 py-2">
                      <span className="text-xs font-semibold text-[var(--muted-foreground)]">TOTAL RECEITAS</span>
                      <span className="text-sm font-bold text-[var(--success)]">{formatCurrency(totalIncome)}</span>
                    </div>
                  </div>
                </section>
              )}

              {/* 6. DETALHAMENTO - DESPESAS */}
              {expenseByDate.length > 0 && (
                <section className="mb-8">
                  <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-[var(--foreground)] uppercase tracking-wider border-b border-[var(--border)] pb-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-[var(--destructive)]/10 text-xs font-bold text-[var(--destructive)]">5</span>
                    Detalhamento — Despesas
                  </h2>
                  <div className="rounded-xl border border-[var(--border)] overflow-hidden">
                    <ul className="divide-y divide-[var(--border)]">
                      {paginatedExpense.map((t) => (
                        <li key={t.id} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 px-3 sm:px-4 py-3 hover:bg-[var(--accent)]/30">
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm sm:text-base text-[var(--foreground)] break-words">{t.description || "Sem descrição"}{t.is_recurring ? " (Recorrente)" : ""}</p>
                              <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">{formatDate(t.transaction_date)} • {t.categories?.name || "—"}</p>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center justify-between sm:justify-end gap-3">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${t.status === "paid" ? "bg-[var(--success)]/10 text-[var(--success)]" : "bg-[var(--warning)]/10 text-[var(--warning)]"}`}>
                              {t.status === "paid" ? "Pago" : "Pendente"}
                            </span>
                            <span className="font-semibold text-sm sm:text-base text-[var(--destructive)]">-{formatCurrency(t.amount)}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between gap-2 border-t border-[var(--border)] bg-[var(--accent)]/50 px-3 sm:px-4 py-2">
                      <button
                        onClick={() => setExpensePage((p) => Math.max(1, p - 1))}
                        disabled={expensePage <= 1}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                      </button>
                      <span className="text-xs sm:text-sm text-[var(--muted-foreground)]">Página {expensePage} de {expenseTotalPages}</span>
                      <button
                        onClick={() => setExpensePage((p) => Math.min(expenseTotalPages, p + 1))}
                        disabled={expensePage >= expenseTotalPages}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                      >
                        Próximo
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--accent)]/50 px-3 sm:px-4 py-2">
                      <span className="text-xs font-semibold text-[var(--muted-foreground)]">TOTAL DESPESAS</span>
                      <span className="text-sm font-bold text-[var(--destructive)]">{formatCurrency(totalExpense)}</span>
                    </div>
                  </div>
                </section>
              )}
              </div>

              {/* Upgrade CTA para Free */}
              {isFree && (
                <div className="mt-6 rounded-xl border-2 border-dashed border-[var(--primary)]/30 bg-[var(--primary)]/5 p-8 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)]/10">
                    <Crown className="h-7 w-7 text-[var(--primary)]" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--foreground)]">Desbloqueie o relatório completo</h3>
                  <p className="mt-2 text-base text-[var(--muted-foreground)] max-w-md mx-auto">
                    Com o plano Pro você acesso a indicadores detalhados, categorias, status dos lançamentos e exportação em PDF.
                  </p>
                  <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                      href="/personal/planos"
                      className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-bold text-white hover:bg-[var(--primary)]/80 transition-colors"
                    >
                      <Crown className="h-4 w-4" />
                      Testar Pro Grátis por 7 Dias
                    </Link>
                    <button
                      onClick={onClose}
                      className="text-base text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                    >
                      Depois
                    </button>
                  </div>
                </div>
              )}

              {/* FOOTER */}
              <section className="border-t border-[var(--border)] pt-4">
                <p className="text-center text-xs text-[var(--muted-foreground)]/60">
                  Este relatório é gerado automaticamente e não substitui consultoria financeira profissional.
                </p>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-componentes auxiliares
function IndicatorCard({ icon, label, value, detail, color, tooltip }: { icon: React.ReactNode; label: string; value: string; detail: string; color: string; tooltip?: string }) {
  const colorClasses: Record<string, string> = {
    success: "border-[var(--success)]/20 bg-[var(--success)]/5 text-[var(--success)]",
    destructive: "border-[var(--destructive)]/20 bg-[var(--destructive)]/5 text-[var(--destructive)]",
    primary: "border-[var(--primary)]/20 bg-[var(--primary)]/5 text-[var(--primary)]",
    warning: "border-[var(--warning)]/20 bg-[var(--warning)]/5 text-[var(--warning)]",
  };

  return (
    <div className={`relative rounded-lg border p-3 ${colorClasses[color] || colorClasses.primary}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm font-medium text-[var(--muted-foreground)]">{label}</span>
        {tooltip && (
          <span className="group/info relative inline-flex items-center">
            <Info className="h-3.5 w-3.5 text-[var(--muted-foreground)]/70 cursor-help" />
            <span
              role="tooltip"
              className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 w-52 -translate-x-1/2 rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-xs leading-snug text-[var(--muted-foreground)] opacity-0 shadow-xl transition-opacity duration-150 group-hover/info:opacity-100 group-focus-within/info:opacity-100"
            >
              {tooltip}
            </span>
          </span>
        )}
      </div>
      <p className="text-lg font-bold text-[var(--foreground)]">{value}</p>
      <p className="text-base text-[var(--muted-foreground)]">{detail}</p>
    </div>
  );
}
