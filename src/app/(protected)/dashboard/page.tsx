"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { ScopeHealth } from "@/components/dashboard/scope-health";
import { ExpenseChart } from "@/components/dashboard/expense-chart";
import { MonthlyChart } from "@/components/dashboard/monthly-chart";
import { WelcomeCard } from "@/components/dashboard/welcome-card";
import {
  getCurrentMonth,
  getNextMonth,
  getMonthRange,
  formatMonthYear,
} from "@/lib/utils";
import { Select } from "@/components/ui/select";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import type {
  Transaction,
  Category,
  MonthlySummary,
  CategorySummary,
} from "@/lib/types";

export default function DashboardPage() {
  const supabase = createClient();
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [currentMonth, allTransactions]);

  const fetchAllData = async () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const startDate = sixMonthsAgo.toISOString().split("T")[0];

    const [txResult, catResult] = await Promise.all([
      supabase
        .from("transactions")
        .select("*")
        .gte("transaction_date", startDate)
        .order("transaction_date", { ascending: false }),
      supabase.from("categories").select("*"),
    ]);

    if (txResult.error) {
      console.error("Erro ao buscar transações:", txResult.error);
      setError("Erro ao carregar dados. Tente recarregar a página.");
      setLoading(false);
      return;
    }

    const txData = ((txResult.data as Transaction[]) || []).map((t) => ({
      ...t,
      amount: Number(t.amount),
    }));

    setAllTransactions(txData);
    setCategories((catResult.data as Category[]) || []);
    setLoading(false);
  };

  const filterTransactions = () => {
    const { start, end } = getMonthRange(currentMonth);
    const filtered = allTransactions
      .filter((t) => t.transaction_date >= start && t.transaction_date <= end)
      .map((t) => ({ ...t, amount: Number(t.amount) }));
    setTransactions(filtered);
  };

  const getCategoryInfo = (categoryId: string | null) => {
    if (!categoryId) return { name: "Sem categoria", color: "#6b7280" };
    const cat = categories.find((c) => c.id === categoryId);
    return cat
      ? { name: cat.name, color: cat.color }
      : { name: "Sem categoria", color: "#6b7280" };
  };

  const calcMonthSummary = (txns: Transaction[]): MonthlySummary => {
    const income = txns
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = txns
      .filter((t) => t.type === "expense" && t.status === "paid")
      .reduce((sum, t) => sum + t.amount, 0);
    const bizIncome = txns
      .filter((t) => t.type === "income" && t.scope === "business")
      .reduce((sum, t) => sum + t.amount, 0);
    const bizExpense = txns
      .filter((t) => t.type === "expense" && t.scope === "business" && t.status === "paid")
      .reduce((sum, t) => sum + t.amount, 0);
    const perIncome = txns
      .filter((t) => t.type === "income" && t.scope === "personal")
      .reduce((sum, t) => sum + t.amount, 0);
    const perExpense = txns
      .filter((t) => t.type === "expense" && t.scope === "personal" && t.status === "paid")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      month: currentMonth,
      total_income: income,
      total_expense: expense,
      balance: income - expense,
      business_income: bizIncome,
      business_expense: bizExpense,
      personal_income: perIncome,
      personal_expense: perExpense,
    };
  };

  const calcPendingAmount = (): { total: number; count: number } => {
    const pending = allTransactions.filter(
      (t) => t.type === "expense" && t.status === "pending"
    );
    return {
      total: pending.reduce((sum, t) => sum + t.amount, 0),
      count: pending.length,
    };
  };

  const calcExpenseByCategory = (): CategorySummary[] => {
    const expenses = transactions.filter((t) => t.type === "expense" && t.status === "paid");
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);

    const categoryMap = new Map<
      string,
      { name: string; color: string; total: number }
    >();

    expenses.forEach((t) => {
      const key = t.category_id || "uncategorized";
      const info = getCategoryInfo(t.category_id);
      const existing = categoryMap.get(key);
      if (existing) {
        existing.total += t.amount;
      } else {
        categoryMap.set(key, {
          name: info.name,
          color: info.color,
          total: t.amount,
        });
      }
    });

    return Array.from(categoryMap.entries())
      .map(([id, data]) => ({
        category_id: id,
        category_name: data.name,
        category_color: data.color,
        total: data.total,
        percentage:
          totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  };

  const calcMonthlyHistory = (): MonthlySummary[] => {
    const months = new Map<string, Transaction[]>();

    allTransactions.forEach((t) => {
      const month = t.transaction_date.substring(0, 7);
      if (!months.has(month)) months.set(month, []);
      months.get(month)!.push(t);
    });

    return Array.from(months.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, txns]) => {
        const income = txns
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0);
        const expense = txns
          .filter((t) => t.type === "expense" && t.status === "paid")
          .reduce((sum, t) => sum + t.amount, 0);
        const bizIncome = txns
          .filter((t) => t.type === "income" && t.scope === "business")
          .reduce((sum, t) => sum + t.amount, 0);
        const bizExpense = txns
          .filter((t) => t.type === "expense" && t.scope === "business" && t.status === "paid")
          .reduce((sum, t) => sum + t.amount, 0);
        const perIncome = txns
          .filter((t) => t.type === "income" && t.scope === "personal")
          .reduce((sum, t) => sum + t.amount, 0);
        const perExpense = txns
          .filter((t) => t.type === "expense" && t.scope === "personal" && t.status === "paid")
          .reduce((sum, t) => sum + t.amount, 0);

        return {
          month,
          total_income: income,
          total_expense: expense,
          balance: income - expense,
          business_income: bizIncome,
          business_expense: bizExpense,
          personal_income: perIncome,
          personal_expense: perExpense,
        };
      });
  };

  const summary = calcMonthSummary(transactions);
  const pending = calcPendingAmount();
  const expensesByCategory = calcExpenseByCategory();
  const monthlyHistory = calcMonthlyHistory();

  const monthOptions = (() => {
    const opts = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      opts.push({ value: val, label: formatMonthYear(val) });
    }
    return opts;
  })();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-[var(--destructive)]">{error}</p>
          <button onClick={fetchAllData} className="mt-2 text-sm text-[var(--primary)] underline">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const isEmpty = transactions.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Visão geral das suas finanças
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isEmpty && (
            <>
              <Link href="/transactions/new?type=income">
                <Button size="sm" variant="outline" className="gap-2 border-[var(--income)]/30 text-[var(--income)] hover:bg-[var(--income)]/5">
                  <ArrowDownLeft className="h-4 w-4" />
                  Receita
                </Button>
              </Link>
              <Link href="/transactions/new?type=expense">
                <Button size="sm" variant="outline" className="gap-2 border-[var(--expense)]/30 text-[var(--expense)] hover:bg-[var(--expense)]/5">
                  <ArrowUpRight className="h-4 w-4" />
                  Despesa
                </Button>
              </Link>
            </>
          )}
          <Select
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            options={monthOptions}
            className="w-auto"
          />
        </div>
      </div>

      {isEmpty ? (
        <WelcomeCard />
      ) : (
        <>
          <KpiCards
            totalIncome={summary.total_income}
            totalExpense={summary.total_expense}
            balance={summary.balance}
            pendingAmount={pending.total}
            pendingCount={pending.count}
          />

          <ScopeHealth
            businessIncome={summary.business_income}
            businessExpense={summary.business_expense}
            personalIncome={summary.personal_income}
            personalExpense={summary.personal_expense}
          />

          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <ExpenseChart data={expensesByCategory} title="Despesas por Categoria" />
            <MonthlyChart data={monthlyHistory} />
          </div>
        </>
      )}
    </div>
  );
}
