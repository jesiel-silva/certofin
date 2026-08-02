"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  Circle,
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Pencil,
  Receipt,
  Download,
  FileText,
  Pause,
  Play,
} from "lucide-react";
import { formatCurrency, formatDate, getCurrentMonth } from "@/lib/utils";
import type { TransactionWithCategory } from "@/lib/types";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ReportPreview } from "./report-preview";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { usePlanLimits } from "@/lib/hooks/use-plan-limits";
import { UpgradeModal } from "@/components/ui/upgrade-modal";

const ITEMS_PER_PAGE = 15;

interface TransactionListProps {
  scope?: "personal" | "business";
}

export function TransactionList({ scope: fixedScope }: TransactionListProps) {
  const supabase = createClient();
  const { canUseInstallment } = usePlanLimits();

  const [transactions, setTransactions] = useState<TransactionWithCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState(getCurrentMonth());
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [allTransactions, setAllTransactions] = useState<TransactionWithCategory[]>([]);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [fixedScope, typeFilter, statusFilter, monthFilter, page, searchTerm]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError("");
    const [year, month] = monthFilter.split("-");
    const startDate = `${year}-${month}-01`;
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
    const endDate = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;

    // Fetch regular transactions (is_recurring = false)
    let regularQuery = supabase
      .from("transactions")
      .select("*, categories(*)", { count: "exact" })
      .gte("transaction_date", startDate)
      .lte("transaction_date", endDate)
      .eq("is_recurring", false)
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (fixedScope) regularQuery = regularQuery.eq("scope", fixedScope);
    if (typeFilter !== "all") regularQuery = regularQuery.eq("type", typeFilter);
    if (statusFilter !== "all") regularQuery = regularQuery.eq("status", statusFilter);
    if (searchTerm) regularQuery = regularQuery.ilike("description", `%${searchTerm}%`);

    const { data: regularData, count, error: regularError } = await regularQuery;

    if (regularError) {
      console.error("Erro ao buscar lançamentos:", regularError);
      setError("Erro ao carregar lançamentos. Tente recarregar.");
      setLoading(false);
      return;
    }

    // Fetch recurring templates (is_recurring = true AND recurring_active = true)
    let recurringQuery = supabase
      .from("transactions")
      .select("*, categories(*)")
      .eq("is_recurring", true)
      .eq("recurring_active", true);

    if (fixedScope) recurringQuery = recurringQuery.eq("scope", fixedScope);
    if (typeFilter !== "all") recurringQuery = recurringQuery.eq("type", typeFilter);
    if (searchTerm) recurringQuery = recurringQuery.ilike("description", `%${searchTerm}%`);

    const { data: recurringTemplates } = await recurringQuery;

    // Generate virtual transactions for recurring templates in the selected month
    const virtualTransactions: TransactionWithCategory[] = [];
    if (recurringTemplates) {
      for (const template of recurringTemplates) {
        const dueDay = template.due_day || 1;
        const targetDay = Math.min(dueDay, lastDay);
        const virtualDate = `${year}-${month}-${String(targetDay).padStart(2, "0")}`;
        
        // Check if the due_day falls within the selected month's date range
        if (dueDay <= lastDay) {
          virtualTransactions.push({
            ...template,
            id: `virtual_${template.id}_${year}_${month}`,
            transaction_date: virtualDate,
            is_recurring: true,
            recurring_active: true,
            template_id: template.id,
          });
        }
      }
    }

    // Combine regular and virtual transactions
    const allRegular = ((regularData as TransactionWithCategory[]) || []).map((t) => ({
      ...t,
      amount: Number(t.amount),
    }));

    const allTransactions = [...allRegular, ...virtualTransactions];

    // Sort by transaction_date descending, then created_at descending
    allTransactions.sort((a, b) => {
      const dateCompare = b.transaction_date.localeCompare(a.transaction_date);
      if (dateCompare !== 0) return dateCompare;
      return b.created_at.localeCompare(a.created_at);
    });

    // Apply pagination
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE;
    const paginatedTransactions = allTransactions.slice(from, to);

    setTransactions(paginatedTransactions);
    setTotal((count || 0) + virtualTransactions.length);
    setLoading(false);
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    // Handle virtual recurring transactions
    if (id.startsWith("virtual_")) {
      const templateId = (await supabase.from("transactions").select("id").eq("id", id.split("_")[1]).single()).data?.id || id.split("_")[1];
      const newActive = currentStatus === "pending";
      await supabase
        .from("transactions")
        .update({ recurring_active: newActive })
        .eq("id", templateId);
      fetchTransactions();
      return;
    }
    
    const newStatus = currentStatus === "paid" ? "pending" : "paid";
    await supabase
      .from("transactions")
      .update({ status: newStatus })
      .eq("id", id);
    fetchTransactions();
  };

  const pauseRecurring = async (id: string) => {
    // For virtual transactions, extract the template id
    const templateId = id.startsWith("virtual_") ? id.split("_")[1] : id;
    
    // Fetch current recurring_active status
    const { data: template } = await supabase
      .from("transactions")
      .select("recurring_active")
      .eq("id", templateId)
      .single();
    
    if (template) {
      await supabase
        .from("transactions")
        .update({ recurring_active: !template.recurring_active })
        .eq("id", templateId);
      fetchTransactions();
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    
    // For virtual transactions, delete the template
    const templateId = deleteId.startsWith("virtual_") ? deleteId.split("_")[1] : deleteId;
    
    const { error } = await supabase.from("transactions").delete().eq("id", templateId);
    if (error) {
      console.error("Erro ao excluir:", error);
    }
    setDeleting(false);
    setDeleteId(null);
    fetchTransactions();
  };

  const fetchAllTransactions = async () => {
    const [year, month] = monthFilter.split("-");
    const startDate = `${year}-${month}-01`;
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
    const endDate = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;

    let query = supabase
      .from("transactions")
      .select("*, categories(*)")
      .gte("transaction_date", startDate)
      .lte("transaction_date", endDate)
      .order("transaction_date", { ascending: true });

    if (fixedScope) query = query.eq("scope", fixedScope);

    const { data } = await query;
    const txData = ((data as TransactionWithCategory[]) || []).map((t) => ({
      ...t,
      amount: Number(t.amount),
    }));
    return txData;
  };

  const handleOpenReport = async () => {
    const txs = await fetchAllTransactions();
    setAllTransactions(txs);
    setShowReportPreview(true);
  };

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const txs = allTransactions.length > 0 ? allTransactions : await fetchAllTransactions();
      
      const [year, monthNum] = monthFilter.split("-");
      const monthLabel = new Intl.DateTimeFormat("pt-BR", {
        month: "long",
        year: "numeric",
      }).format(new Date(parseInt(year), parseInt(monthNum) - 1));

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      // Header
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("CERTOFIN", 14, 18);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(`Relatório Financeiro • ${fixedScope === "business" ? "Negócio" : "Pessoal"}`, 14, 24);
      doc.text(`Período: ${monthLabel}`, 14, 29);
      doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 34);

      // Line separator
      doc.setDrawColor(0, 255, 204);
      doc.setLineWidth(0.5);
      doc.line(14, 37, 196, 37);

      const incomeTxs = txs.filter((t) => t.type === "income");
      const expenseTxs = txs.filter((t) => t.type === "expense");
      const totalIncome = incomeTxs.reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = expenseTxs.reduce((sum, t) => sum + t.amount, 0);
      const balance = totalIncome - totalExpense;
      const pendingIncome = incomeTxs.filter((t) => t.status === "pending");
      const pendingExpense = expenseTxs.filter((t) => t.status === "pending");
      const totalPendingIncome = pendingIncome.reduce((sum, t) => sum + t.amount, 0);
      const totalPendingExpense = pendingExpense.reduce((sum, t) => sum + t.amount, 0);

      // 1. Resumo Executivo
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("1. VISÃO GERAL DO MÊS", 14, 45);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(`Receitas Totais: R$ ${totalIncome.toFixed(2)} (${incomeTxs.length} lançamentos)`, 14, 52);
      doc.text(`Despesas Totais: R$ ${totalExpense.toFixed(2)} (${expenseTxs.length} lançamentos)`, 14, 58);
      doc.setTextColor(balance >= 0 ? 16 : 239, balance >= 0 ? 185 : 68, balance >= 0 ? 129 : 68);
      doc.setFont("helvetica", "bold");
      doc.text(`Saldo do Período: R$ ${balance.toFixed(2)} (${balance >= 0 ? "Positivo" : "Negativo"})`, 14, 64);

      // 2. Indicadores-Chave
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("2. INDICADORES IMPORTANTES", 14, 76);

      const highestExpense = expenseTxs.length > 0
        ? expenseTxs.reduce((max, t) => (t.amount > max.amount ? t : max), expenseTxs[0])
        : null;
      const highestIncome = incomeTxs.length > 0
        ? incomeTxs.reduce((max, t) => (t.amount > max.amount ? t : max), incomeTxs[0])
        : null;
      const avgTicket = expenseTxs.length > 0 ? totalExpense / expenseTxs.length : 0;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(`Maior Receita: R$ ${highestIncome ? highestIncome.amount.toFixed(2) : "0,00"} — ${highestIncome?.description || "Sem lançamentos"}`, 14, 83);
      doc.text(`Maior Gasto: R$ ${highestExpense ? highestExpense.amount.toFixed(2) : "0,00"} — ${highestExpense?.description || "Sem lançamentos"}`, 14, 89);
      doc.text(`Média por Gasto: R$ ${avgTicket.toFixed(2)}`, 14, 95);
      doc.text(`Pendente (Receber): R$ ${totalPendingIncome.toFixed(2)} (${pendingIncome.length} itens)`, 14, 101);
      doc.text(`Pendente (Pagar): R$ ${totalPendingExpense.toFixed(2)} (${pendingExpense.length} itens)`, 14, 107);

      // 3. Status
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("3. STATUS DOS LANÇAMENTOS", 14, 119);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(16, 185, 129);
      doc.text(`Receitas Recebidas: R$ ${incomeTxs.filter((t) => t.status === "paid").reduce((s, t) => s + t.amount, 0).toFixed(2)}`, 14, 126);
      doc.setTextColor(234, 179, 8);
      doc.text(`Receitas Pendentes: R$ ${totalPendingIncome.toFixed(2)}`, 14, 132);
      doc.setTextColor(16, 185, 129);
      doc.text(`Despesas Pagas: R$ ${expenseTxs.filter((t) => t.status === "paid").reduce((s, t) => s + t.amount, 0).toFixed(2)}`, 14, 138);
      doc.setTextColor(239, 68, 68);
      doc.text(`Despesas Pendentes: R$ ${totalPendingExpense.toFixed(2)}`, 14, 144);

      // Income table
      let currentY = 156;
      if (incomeTxs.length > 0) {
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("4. DETALHAMENTO — RECEITAS", 14, currentY);
        currentY += 6;

        const incomeData = incomeTxs.map((t) => [
          formatDate(t.transaction_date),
          t.description || "Sem descrição",
          t.categories?.name || "Sem categoria",
          t.status === "paid" ? "Pago" : "Pendente",
          `R$ ${t.amount.toFixed(2)}`,
        ]);

        autoTable(doc, {
          startY: currentY,
          head: [["Data", "Descrição", "Categoria", "Status", "Valor"]],
          body: incomeData,
          theme: "striped",
          headStyles: { fillColor: [16, 185, 129] },
          styles: { fontSize: 8 },
          columnStyles: {
            0: { cellWidth: 22 },
            4: { halign: "right" },
          },
          margin: { left: 14, right: 14 },
        });
        currentY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
      }

      // Expense table
      if (expenseTxs.length > 0) {
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("5. DETALHAMENTO — DESPESAS", 14, currentY);
        currentY += 6;

        const expenseData = expenseTxs.map((t) => [
          formatDate(t.transaction_date),
          t.description || "Sem descrição",
          t.categories?.name || "Sem categoria",
          t.status === "paid" ? "Pago" : "Pendente",
          `R$ ${t.amount.toFixed(2)}`,
        ]);

        autoTable(doc, {
          startY: currentY,
          head: [["Data", "Descrição", "Categoria", "Status", "Valor"]],
          body: expenseData,
          theme: "striped",
          headStyles: { fillColor: [239, 68, 68] },
          styles: { fontSize: 8 },
          columnStyles: {
            0: { cellWidth: 22 },
            4: { halign: "right" },
          },
          margin: { left: 14, right: 14 },
        });
        currentY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
      }

      // Footer
      doc.setFontSize(7);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(150, 150, 150);
      doc.text(
        "CertoFin v1.0 • Este relatório é gerado automaticamente e não substitui consultoria financeira profissional.",
        14,
        currentY + 10
      );

      const fileName = fixedScope === "business" ? "Relatorio Negocio" : "Relatorio Pessoal";
      doc.save(`${fileName}-${monthFilter}.pdf`);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      setError("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setExportingPdf(false);
    }
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const monthOptions = (() => {
    const opts = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = new Intl.DateTimeFormat("pt-BR", {
        month: "long",
        year: "numeric",
      }).format(d);
      opts.push({ value: val, label });
    }
    return opts;
  })();

  const newUrl = fixedScope === "business" ? "/business/transactions/new" : "/personal/transactions/new";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Lançamentos {fixedScope === "business" ? "do Negócio" : "Pessoais"}</CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (!canUseInstallment) {
                  setShowUpgradeModal(true);
                  return;
                }
                handleOpenReport();
              }}
              disabled={!canUseInstallment}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Visualizar</span>
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (!canUseInstallment) {
                  setShowUpgradeModal(true);
                  return;
                }
                handleExportPdf();
              }}
              disabled={!canUseInstallment || exportingPdf}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">{exportingPdf ? "Gerando..." : "Exportar PDF"}</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)] z-10" />
            <input
              type="text"
              placeholder="Buscar por descrição..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="flex h-10 w-full rounded-lg border border-[var(--input)] bg-[var(--background)] pl-10 pr-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "all", label: "Tipo" },
                { value: "income", label: "Receita" },
                { value: "expense", label: "Despesa" },
              ]}
            />
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "all", label: "Status" },
                { value: "paid", label: "Pago" },
                { value: "pending", label: "Pendente" },
              ]}
            />
            <Select
              value={monthFilter}
              onChange={(e) => {
                setMonthFilter(e.target.value);
                setPage(1);
              }}
              options={monthOptions}
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-[var(--muted-foreground)]">
            Carregando...
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-sm text-[var(--destructive)]">{error}</p>
            <button onClick={fetchTransactions} className="mt-2 text-sm text-[var(--primary)] underline">
              Tentar novamente
            </button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent)]">
              <Receipt className="h-8 w-8 text-[var(--muted-foreground)]" />
            </div>
            <p className="text-lg font-medium text-[var(--foreground)]">
              Nenhum lançamento este mês
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)] mb-4">
              Comece adicionando sua primeira receita ou despesa
            </p>
            <div className="flex justify-center gap-3">
              <Link href={`${newUrl}?type=income`}>
                <Button variant="outline" className="gap-2 border-[var(--income)]/30 text-[var(--income)] hover:bg-[var(--income)]/5">
                  <ArrowDownLeft className="h-4 w-4" />
                  + Receita
                </Button>
              </Link>
              <Link href={`${newUrl}?type=expense`}>
                <Button variant="outline" className="gap-2 border-[var(--expense)]/30 text-[var(--expense)] hover:bg-[var(--expense)]/5">
                  <ArrowUpRight className="h-4 w-4" />
                  + Despesa
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {transactions.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 rounded-lg border border-[var(--border)] p-3 transition-colors hover:bg-[var(--accent)]/50"
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                      t.type === "income"
                        ? "bg-[var(--income)]/10 text-[var(--income)]"
                        : "bg-[var(--expense)]/10 text-[var(--expense)]"
                    )}
                  >
                    {t.type === "income" ? (
                      <ArrowDownLeft className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">
                        {t.description || "Sem descrição"}
                      </p>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          t.scope === "business"
                            ? "bg-[var(--business)]/10 text-[var(--business)]"
                            : "bg-[var(--personal)]/10 text-[var(--personal)]"
                        )}
                      >
                        {t.scope === "business" ? "Negócio" : "Pessoal"}
                      </span>
                      {t.is_recurring && (
                        <span className="inline-flex items-center rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--primary)]">
                          Recorrente
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {formatDate(t.transaction_date)}
                      {t.categories?.name && ` • ${t.categories.name}`}
                      {t.is_recurring && t.due_day && ` • Dia ${t.due_day}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        t.type === "income"
                          ? "text-[var(--income)]"
                          : "text-[var(--expense)]"
                      )}
                    >
                      {t.type === "income" ? "+" : "-"}
                      {formatCurrency(t.amount)}
                    </p>
                    <div className="mt-1 flex items-center justify-end gap-1">
                      {t.is_recurring ? (
                        <button
                          onClick={() => pauseRecurring(t.id)}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors",
                            t.recurring_active
                              ? "bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20"
                              : "bg-[var(--muted-foreground)]/10 text-[var(--muted-foreground)] hover:bg-[var(--muted-foreground)]/20"
                          )}
                        >
                          {t.recurring_active ? (
                            <>
                              <Pause className="h-3 w-3" />
                              Pausar
                            </>
                          ) : (
                            <>
                              <Play className="h-3 w-3" />
                              Ativar
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleStatus(t.id, t.status)}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors",
                            t.status === "paid"
                              ? "bg-[var(--success)]/10 text-[var(--success)] hover:bg-[var(--success)]/20"
                              : "bg-[var(--warning)]/10 text-[var(--warning)] hover:bg-[var(--warning)]/20"
                          )}
                        >
                          {t.status === "paid" ? (
                            <>
                              <Check className="h-3 w-3" />
                              Pago
                            </>
                          ) : (
                            <>
                              <Circle className="h-3 w-3" />
                              Pendente
                            </>
                          )}
                        </button>
                      )}
                      <Link
                        href={t.scope === "business" ? `/business/transactions/${t.template_id || t.id}/edit` : `/personal/transactions/${t.template_id || t.id}/edit`}
                        className="rounded p-1 text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        onClick={() => setDeleteId(t.id)}
                        className="rounded p-1 text-[var(--muted-foreground)] hover:bg-[var(--destructive)]/10 hover:text-[var(--destructive)] transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-[var(--muted-foreground)]">
                  {total} lançamentos • Página {page} de {totalPages}
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Excluir lançamento"
        description="Tem certeza que deseja excluir este lançamento? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        loading={deleting}
      />

      {showReportPreview && (
        <ReportPreview
          transactions={allTransactions}
          scope={fixedScope || "personal"}
          month={monthFilter}
          onClose={() => setShowReportPreview(false)}
          onExport={handleExportPdf}
          loading={exportingPdf}
        />
      )}

      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="relatórios"
      />
    </Card>
  );
}
