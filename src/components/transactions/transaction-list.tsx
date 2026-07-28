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
  Receipt,
} from "lucide-react";
import { formatCurrency, formatDate, getCurrentMonth } from "@/lib/utils";
import type { TransactionWithCategory } from "@/lib/types";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const ITEMS_PER_PAGE = 15;

interface TransactionListProps {
  scope?: "personal" | "business";
}

export function TransactionList({ scope: fixedScope }: TransactionListProps) {
  const supabase = createClient();

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

    let query = supabase
      .from("transactions")
      .select("*, categories(*)", { count: "exact" })
      .gte("transaction_date", startDate)
      .lte("transaction_date", endDate)
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (fixedScope) query = query.eq("scope", fixedScope);
    if (typeFilter !== "all") query = query.eq("type", typeFilter);
    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    if (searchTerm)
      query = query.ilike("description", `%${searchTerm}%`);

    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;
    query = query.range(from, to);

    const { data, count, error: queryError } = await query;

    if (queryError) {
      console.error("Erro ao buscar lançamentos:", queryError);
      setError("Erro ao carregar lançamentos. Tente recarregar.");
      setLoading(false);
      return;
    }

    const txData = ((data as TransactionWithCategory[]) || []).map((t) => ({
      ...t,
      amount: Number(t.amount),
    }));
    setTransactions(txData);
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
    const { error } = await supabase.from("transactions").delete().eq("id", deleteId);
    if (error) {
      console.error("Erro ao excluir:", error);
    }
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

  const newUrl = fixedScope === "business" ? "/business/transactions/new" : "/personal/transactions/new";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Lançamentos {fixedScope === "business" ? "do Negócio" : "Pessoais"}</CardTitle>
          <Link href={newUrl}>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Novo
            </Button>
          </Link>
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
                        href={t.scope === "business" ? `/business/transactions/${t.id}/edit` : `/personal/transactions/${t.id}/edit`}
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
