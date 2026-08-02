"use client";

import { formatCurrency, formatDate } from "@/lib/utils";
import type { TransactionWithCategory } from "@/lib/types";
import { X, Download, AlertTriangle, TrendingUp, TrendingDown, Clock, CheckCircle2, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReportPreviewProps {
  transactions: TransactionWithCategory[];
  scope: "personal" | "business";
  month: string;
  onClose: () => void;
  onExport: () => void;
  loading: boolean;
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
}: ReportPreviewProps) {
  const [year, monthNum] = month.split("-");
  const monthLabel = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(new Date(parseInt(year), parseInt(monthNum) - 1));

  const incomeTransactions = transactions.filter((t) => t.type === "income");
  const expenseTransactions = transactions.filter((t) => t.type === "expense");

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const pendingIncome = incomeTransactions.filter((t) => t.status === "pending");
  const pendingExpense = expenseTransactions.filter((t) => t.status === "pending");
  const paidIncome = incomeTransactions.filter((t) => t.status === "paid");
  const paidExpense = expenseTransactions.filter((t) => t.status === "paid");

  const totalPendingIncome = pendingIncome.reduce((sum, t) => sum + t.amount, 0);
  const totalPendingExpense = pendingExpense.reduce((sum, t) => sum + t.amount, 0);

  // Maior gasto
  const highestExpense = expenseTransactions.length > 0
    ? expenseTransactions.reduce((max, t) => (t.amount > max.amount ? t : max), expenseTransactions[0])
    : null;

  // Maior receita
  const highestIncome = incomeTransactions.length > 0
    ? incomeTransactions.reduce((max, t) => (t.amount > max.amount ? t : max), incomeTransactions[0])
    : null;

  // Gastos por categoria
  const expensesByCategory = expenseTransactions.reduce<Record<string, CategorySummary>>((acc, t) => {
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

  // Ticket médio
  const avgTicket = expenseTransactions.length > 0
    ? totalExpense / expenseTransactions.length
    : 0;

  // Dias com gastos
  const daysWithExpenses = new Set(expenseTransactions.map((t) => t.transaction_date)).size;

  // Previsão saldo pendente
  const projectedBalance = balance + totalPendingIncome - totalPendingExpense;

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

  const now = new Date();
  const generatedAt = now.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)] shadow-2xl">
        {/* Header Profissional */}
        <div className="border-b border-[var(--border)] bg-gradient-to-r from-[var(--primary)]/5 to-transparent px-8 py-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)]/10">
                <BarChart3 className="h-6 w-6 text-[var(--primary)]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--foreground)] tracking-tight">
                  CERTOFIN
                </h1>
                <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-widest">
                  Relatório Financeiro • {scope === "business" ? "Negócio" : "Pessoal"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                onClick={onExport}
                disabled={loading}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                {loading ? "Gerando..." : "Exportar PDF"}
              </Button>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-6 text-xs text-[var(--muted-foreground)]">
            <span>Período: <strong className="text-[var(--foreground)]">{monthLabel}</strong></span>
            <span>Gerado em: <strong className="text-[var(--foreground)]">{generatedAt}</strong></span>
            <span>ID: <strong className="text-[var(--foreground)]">{crypto.randomUUID().slice(0, 8).toUpperCase()}</strong></span>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-8" style={{ maxHeight: "calc(90vh - 180px)" }}>
          {transactions.length === 0 ? (
            <div className="py-16 text-center text-[var(--muted-foreground)]">
              <p className="text-lg">Nenhum lançamento encontrado para este período.</p>
            </div>
          ) : (
            <>
              {/* 1. RESUMO EXECUTIVO */}
              <section className="mb-8">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[var(--foreground)] uppercase tracking-wider border-b border-[var(--border)] pb-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-[var(--primary)]/10 text-[10px] font-bold text-[var(--primary)]">1</span>
                  Visão Geral do Mês
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <MetricCard
                    label="Receitas Totais"
                    value={formatCurrency(totalIncome)}
                    sub={`${incomeTransactions.length} lançamentos`}
                    color="success"
                  />
                  <MetricCard
                    label="Despesas Totais"
                    value={formatCurrency(totalExpense)}
                    sub={`${expenseTransactions.length} lançamentos`}
                    color="destructive"
                  />
                  <MetricCard
                    label="Saldo do Período"
                    value={formatCurrency(balance)}
                    sub={balance >= 0 ? "Positivo" : "Negativo"}
                    color={balance >= 0 ? "success" : "destructive"}
                  />
                  <MetricCard
                    label="Saldo Projetado"
                    value={formatCurrency(projectedBalance)}
                    sub="Com pendentes"
                    color={projectedBalance >= 0 ? "success" : "destructive"}
                  />
                </div>
              </section>

              {/* 2. INDICADORES CHAVE */}
              <section className="mb-8">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[var(--foreground)] uppercase tracking-wider border-b border-[var(--border)] pb-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-[var(--primary)]/10 text-[10px] font-bold text-[var(--primary)]">2</span>
                  INDICADORES IMPORTANTES
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <IndicatorCard
                    icon={<TrendingUp className="h-4 w-4" />}
                    label="Maior Receita"
                    value={formatCurrency(highestIncome ? highestIncome.amount : 0)}
                    detail={highestIncome?.description || "Sem lançamentos"}
                    color="success"
                  />
                  <IndicatorCard
                    icon={<TrendingDown className="h-4 w-4" />}
                    label="Maior Gasto"
                    value={formatCurrency(highestExpense ? highestExpense.amount : 0)}
                    detail={highestExpense?.description || "Sem lançamentos"}
                    color="destructive"
                  />
                  <IndicatorCard
                    icon={<BarChart3 className="h-4 w-4" />}
                    label="Média por Gasto"
                    value={formatCurrency(avgTicket)}
                    detail={expenseTransactions.length > 0 ? `${expenseTransactions.length} despesas` : "Sem despesas"}
                    color="primary"
                  />
                  <IndicatorCard
                    icon={<Clock className="h-4 w-4" />}
                    label="Pendente (Receber)"
                    value={formatCurrency(totalPendingIncome)}
                    detail={pendingIncome.length > 0 ? `${pendingIncome.length} itens` : "Nenhum pendente"}
                    color="warning"
                  />
                  <IndicatorCard
                    icon={<AlertTriangle className="h-4 w-4" />}
                    label="Pendente (Pagar)"
                    value={formatCurrency(totalPendingExpense)}
                    detail={pendingExpense.length > 0 ? `${pendingExpense.length} itens` : "Nenhum pendente"}
                    color="warning"
                  />
                  <IndicatorCard
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    label="Dias com Gastos"
                    value={`${daysWithExpenses} dias`}
                    detail={daysWithExpenses > 0 ? "Atividade" : "Sem atividade"}
                    color="primary"
                  />
                </div>
              </section>

              {/* 3. RANKING DE GASTOS POR CATEGORIA */}
              {topCategories.length > 0 && (
                <section className="mb-8">
                  <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[var(--foreground)] uppercase tracking-wider border-b border-[var(--border)] pb-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-[var(--primary)]/10 text-[10px] font-bold text-[var(--primary)]">3</span>
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
                                <span className="text-sm font-medium text-[var(--foreground)]">
                                  {cat.name}{cat.count > 1 ? ` - ${cat.count} ocorrências` : ""}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-semibold text-[var(--foreground)]">{formatCurrency(cat.total)}</span>
                            </div>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--accent)]">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${percentage}%`, backgroundColor: cat.color }}
                            />
                          </div>
                          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
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
                <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[var(--foreground)] uppercase tracking-wider border-b border-[var(--border)] pb-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-[var(--primary)]/10 text-[10px] font-bold text-[var(--primary)]">4</span>
                  Status dos Lançamentos
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-[var(--border)] p-4">
                    <h3 className="mb-3 text-xs font-semibold text-[var(--success)] uppercase tracking-wider">
                      Receitas
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                          <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
                          Recebido
                        </span>
                        <span className="text-sm font-semibold text-[var(--success)]">
                          {formatCurrency(paidIncome.reduce((s, t) => s + t.amount, 0))}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                          <Clock className="h-4 w-4 text-[var(--warning)]" />
                          A receber
                        </span>
                        <span className="text-sm font-semibold text-[var(--warning)]">
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
                        <span className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                          <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
                          Pago
                        </span>
                        <span className="text-sm font-semibold text-[var(--success)]">
                          {formatCurrency(paidExpense.reduce((s, t) => s + t.amount, 0))}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                          <AlertTriangle className="h-4 w-4 text-[var(--destructive)]" />
                          A pagar
                        </span>
                        <span className="text-sm font-semibold text-[var(--destructive)]">
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
                  <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[var(--foreground)] uppercase tracking-wider border-b border-[var(--border)] pb-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-[var(--success)]/10 text-[10px] font-bold text-[var(--success)]">5</span>
                    Detalhamento — Receitas
                  </h2>
                  <div className="rounded-xl border border-[var(--border)] overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[var(--border)] bg-[var(--accent)]/50">
                          <th className="px-4 py-2 text-left text-xs font-semibold text-[var(--muted-foreground)]">Data</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-[var(--muted-foreground)]">Descrição</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-[var(--muted-foreground)]">Categoria</th>
                          <th className="px-4 py-2 text-center text-xs font-semibold text-[var(--muted-foreground)]">Status</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-[var(--muted-foreground)]">Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {incomeByDate.map(([date, txs]) =>
                          txs.map((t, i) => (
                            <tr key={t.id} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--accent)]/30">
                              {i === 0 && (
                                <td rowSpan={txs.length} className="px-4 py-3 text-xs text-[var(--muted-foreground)] align-top pt-4">
                                  {formatDate(date)}
                                </td>
                              )}
                              {i !== 0 && <td />}
                              <td className="px-4 py-3 font-medium text-[var(--foreground)]">{t.description || "Sem descrição"}</td>
                              <td className="px-4 py-3 text-[var(--muted-foreground)]">{t.categories?.name || "—"}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${t.status === "paid" ? "bg-[var(--success)]/10 text-[var(--success)]" : "bg-[var(--warning)]/10 text-[var(--warning)]"}`}>
                                  {t.status === "paid" ? "Pago" : "Pendente"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right font-semibold text-[var(--success)]">
                                +{formatCurrency(t.amount)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                      <tfoot>
                        <tr className="bg-[var(--accent)]/50">
                          <td colSpan={4} className="px-4 py-2 text-xs font-semibold text-[var(--muted-foreground)]">TOTAL RECEITAS</td>
                          <td className="px-4 py-2 text-right text-sm font-bold text-[var(--success)]">{formatCurrency(totalIncome)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </section>
              )}

              {/* 6. DETALHAMENTO - DESPESAS */}
              {expenseByDate.length > 0 && (
                <section className="mb-8">
                  <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[var(--foreground)] uppercase tracking-wider border-b border-[var(--border)] pb-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-[var(--destructive)]/10 text-[10px] font-bold text-[var(--destructive)]">6</span>
                    Detalhamento — Despesas
                  </h2>
                  <div className="rounded-xl border border-[var(--border)] overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[var(--border)] bg-[var(--accent)]/50">
                          <th className="px-4 py-2 text-left text-xs font-semibold text-[var(--muted-foreground)]">Data</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-[var(--muted-foreground)]">Descrição</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-[var(--muted-foreground)]">Categoria</th>
                          <th className="px-4 py-2 text-center text-xs font-semibold text-[var(--muted-foreground)]">Status</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-[var(--muted-foreground)]">Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expenseByDate.map(([date, txs]) =>
                          txs.map((t, i) => (
                            <tr key={t.id} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--accent)]/30">
                              {i === 0 && (
                                <td rowSpan={txs.length} className="px-4 py-3 text-xs text-[var(--muted-foreground)] align-top pt-4">
                                  {formatDate(date)}
                                </td>
                              )}
                              {i !== 0 && <td />}
                              <td className="px-4 py-3 font-medium text-[var(--foreground)]">{t.description || "Sem descrição"}</td>
                              <td className="px-4 py-3 text-[var(--muted-foreground)]">{t.categories?.name || "—"}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${t.status === "paid" ? "bg-[var(--success)]/10 text-[var(--success)]" : "bg-[var(--warning)]/10 text-[var(--warning)]"}`}>
                                  {t.status === "paid" ? "Pago" : "Pendente"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right font-semibold text-[var(--destructive)]">
                                -{formatCurrency(t.amount)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                      <tfoot>
                        <tr className="bg-[var(--accent)]/50">
                          <td colSpan={4} className="px-4 py-2 text-xs font-semibold text-[var(--muted-foreground)]">TOTAL DESPESAS</td>
                          <td className="px-4 py-2 text-right text-sm font-bold text-[var(--destructive)]">{formatCurrency(totalExpense)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </section>
              )}

              {/* FOOTER */}
              <section className="border-t border-[var(--border)] pt-4">
                <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                  <div className="flex items-center gap-4">
                    <span>CertoFin v1.0</span>
                    <span>•</span>
                    <span>{transactions.length} lançamentos analisados</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span>Gerado automaticamente</span>
                    <span>•</span>
                    <span>{generatedAt}</span>
                  </div>
                </div>
                <p className="mt-2 text-center text-[10px] text-[var(--muted-foreground)]/60">
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
function MetricCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  const colorClasses: Record<string, string> = {
    success: "border-[var(--success)]/20 bg-[var(--success)]/5",
    destructive: "border-[var(--destructive)]/20 bg-[var(--destructive)]/5",
    primary: "border-[var(--primary)]/20 bg-[var(--primary)]/5",
  };

  const textColors: Record<string, string> = {
    success: "text-[var(--success)]",
    destructive: "text-[var(--destructive)]",
    primary: "text-[var(--primary)]",
  };

  return (
    <div className={`rounded-xl border p-4 ${colorClasses[color] || colorClasses.primary}`}>
      <p className={`text-xs font-medium ${textColors[color] || textColors.primary}`}>{label}</p>
      <p className={`mt-1 text-lg font-bold ${textColors[color] || textColors.primary}`}>{value}</p>
      <p className="text-xs text-[var(--muted-foreground)]">{sub}</p>
    </div>
  );
}

function IndicatorCard({ icon, label, value, detail, color }: { icon: React.ReactNode; label: string; value: string; detail: string; color: string }) {
  const colorClasses: Record<string, string> = {
    success: "border-[var(--success)]/20 bg-[var(--success)]/5 text-[var(--success)]",
    destructive: "border-[var(--destructive)]/20 bg-[var(--destructive)]/5 text-[var(--destructive)]",
    primary: "border-[var(--primary)]/20 bg-[var(--primary)]/5 text-[var(--primary)]",
    warning: "border-[var(--warning)]/20 bg-[var(--warning)]/5 text-[var(--warning)]",
  };

  return (
    <div className={`rounded-lg border p-3 ${colorClasses[color] || colorClasses.primary}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium text-[var(--muted-foreground)]">{label}</span>
      </div>
      <p className="text-base font-bold text-[var(--foreground)]">{value}</p>
      <p className="text-xs text-[var(--muted-foreground)]">{detail}</p>
    </div>
  );
}
