"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  Circle,
  Search,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Pencil,
} from "lucide-react";
import { formatCurrency, formatDate, getCurrentMonth } from "@/lib/utils";
import type { TransactionWithCategory } from "@/lib/types";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const ITEMS_PER_PAGE = 15;

export function TransactionList() {
  const supabase = createClient();

  const [transactions, setTransactions] = useState<TransactionWithCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [scopeFilter, setScopeFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState(getCurrentMonth());
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [scopeFilter, typeFilter, statusFilter, monthFilter, page, searchTerm]);

  const fetchTransactions = async () => {
    setLoading(true);
    const [year, month] = monthFilter.split("-");
    const startDate = `${year}-${month}-01`;
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
    const endDate = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;

    let query = supabase
      .from("transactions")
      .select("*, categories(*)", { count: "exact" })
      .gte("transaction_date", startDate)
      .lte("transaction_date", endDate)
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (scopeFilter !== "all") query = query.eq("scope", scopeFilter);
    if (typeFilter !== "all") query = query.eq("type", typeFilter);
    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    if (searchTerm)
      query = query.ilike("description", `%${searchTerm}%`);

    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;
    query = query.range(from, to);

    const { data, count } = await query;
    setTransactions((data as TransactionWithCategory[]) || []);
    setTotal(count || 0);
    setLoading(false);
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "paid" ? "pending" : "paid";
    await supabase
      .from("transactions")
      .update({ status: newStatus })
      .eq("id", id);
    fetchTransactions();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    await supabase.from("transactions").delete().eq("id", deleteId);
    setDeleting(false);
    setDeleteId(null);
    fetchTransactions();
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Lançamentos</CardTitle>
          <Link href="/transactions/new">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Novo
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 space-y-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-[var(--muted-foreground)]" />
            <Input
              placeholder="Buscar por descrição..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="flex-1"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select
              value={scopeFilter}
              onChange={(e) => {
                setScopeFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "all", label: "Todos os Escopos" },
                { value: "business", label: "Negócio" },
                { value: "personal", label: "Pessoal" },
              ]}
              className="w-auto"
            />
            <Select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "all", label: "Todos os Tipos" },
                { value: "income", label: "Receita" },
                { value: "expense", label: "Despesa" },
              ]}
              className="w-auto"
            />
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "all", label: "Todos os Status" },
                { value: "paid", label: "Pago" },
                { value: "pending", label: "Pendente" },
              ]}
              className="w-auto"
            />
            <Select
              value={monthFilter}
              onChange={(e) => {
                setMonthFilter(e.target.value);
                setPage(1);
              }}
              options={monthOptions}
              className="w-auto"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-[var(--muted-foreground)]">
            Carregando...
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-12 text-center text-[var(--muted-foreground)]">
            Nenhum lançamento encontrado.
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
                      {t.frequency === "installment" &&
                        t.installment_current &&
                        t.installment_total && (
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {t.installment_current}/{t.installment_total}
                          </span>
                        )}
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {formatDate(t.transaction_date)}
                      {t.categories?.name && ` • ${t.categories.name}`}
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
                      <Link
                        href={`/transactions/${t.id}/edit`}
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
    </Card>
  );
}
