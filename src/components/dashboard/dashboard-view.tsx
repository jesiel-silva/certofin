"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { ExpenseChart } from "@/components/dashboard/expense-chart";
import { MonthlyChart } from "@/components/dashboard/monthly-chart";
import { MonthComparison } from "@/components/dashboard/month-comparison";
import { GoalsWidget } from "@/components/dashboard/goals-widget";
import { WelcomeCard } from "@/components/dashboard/welcome-card";
import {
  getCurrentMonth,
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

// Helper: check if a recurring template is pending for a specific month
function isRecurringPendingForMonth(t: Transaction, month: string): boolean {
  if (!t.is_recurring) return false;
  const templateDateMonth = t.transaction_date?.substring(0, 7);
  if (templateDateMonth !== month) return false;
  // If last_paid_date covers the current month or status is paid, it's not pending
  if (t.last_paid_date) {
    const paidMonth = t.last_paid_date.substring(0, 7);
    if (paidMonth >= month) return false;
  }
  if (t.status === "paid") {
    return false;
  }
  return true;
}

// Helper: check if a recurring template is paid for a specific month
function isRecurringPaidForMonth(t: Transaction, targetMonth: string): boolean {
  if (!t.is_recurring) return false;
  const templateDateMonth = t.transaction_date?.substring(0, 7);
  if (templateDateMonth !== targetMonth) return false;
  // Check if last_paid_date covers the target month or status is paid
  if (t.last_paid_date) {
    const paidMonth = t.last_paid_date.substring(0, 7);
    if (paidMonth >= targetMonth) return true;
  }
  if (t.status === "paid") {
    return true;
  }
  return false;
}

export function DashboardView() {
  const supabase = createClient();
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");
  const [userPlan, setUserPlan] = useState<"free" | "pro" | "trial">("free");

  const fetchAllData = useCallback(async () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const startDate = sixMonthsAgo.toISOString().split("T")[0];

    // Fetch user info
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, subscription_status, trial_ends_at")
        .eq("id", userData.user.id)
        .single();
      if (profile) {
        setUserName(profile.full_name || userData.user.email || "");
        const isPro = profile.subscription_status === "pro";
        const isTrial = profile.trial_ends_at
          ? new Date(profile.trial_ends_at) > new Date()
          : false;
        setUserPlan(isPro ? "pro" : isTrial ? "trial" : "free");
      }
    }

    const [txResult, catResult] = await Promise.all([
      supabase
        .from("transactions")
        .select("*")
        .eq("scope", "personal")
        .gte("transaction_date", startDate)
        .order("transaction_date", { ascending: false }),
      supabase.from("categories").select("*").eq("scope", "personal"),
    ]);

    if (txResult.error) {
      console.error("Erro ao buscar transações:", JSON.stringify(txResult.error, null, 2));
      setError(`Erro: ${txResult.error.message || "Verifique o console para detalhes"}`);
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
  }, [supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      fetchAllData();
    });
  }, [fetchAllData]);

  const transactions = useMemo(() => {
    const { start, end } = getMonthRange(currentMonth);
    return allTransactions
      .filter((t) => t.transaction_date >= start && t.transaction_date <= end && !t.is_recurring)
      .map((t) => ({ ...t, amount: Number(t.amount) }));
  }, [currentMonth, allTransactions]);

  const summary = useMemo(() => {
    const { start, end } = getMonthRange(currentMonth);
    const personalTx = transactions.filter((t) => t.scope === "personal");

    const personalIncome = personalTx
      .filter((t) => t.type === "income" && t.status === "paid")
      .reduce((sum, t) => sum + t.amount, 0);
    const personalExpense = personalTx
      .filter((t) => t.type === "expense" && t.status === "paid")
      .reduce((sum, t) => sum + t.amount, 0);

    // Recurring paid for current month
    const personalRecurringPaidIncome = allTransactions
      .filter((t) => t.scope === "personal" && t.type === "income" && isRecurringPaidForMonth(t, currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);
    const personalRecurringPaidExpense = allTransactions
      .filter((t) => t.scope === "personal" && t.type === "expense" && isRecurringPaidForMonth(t, currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);

    // Pending: only regular pending in current month + recurring pending for current month
    const personalPendingIncome = allTransactions
      .filter((t) => t.scope === "personal" && t.type === "income" && !t.is_recurring && t.status === "pending" && t.transaction_date >= start && t.transaction_date <= end)
      .reduce((sum, t) => sum + t.amount, 0) + allTransactions
      .filter((t) => t.scope === "personal" && t.type === "income" && isRecurringPendingForMonth(t, currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);
    const personalPendingExpense = allTransactions
      .filter((t) => t.scope === "personal" && t.type === "expense" && !t.is_recurring && t.status === "pending" && t.transaction_date >= start && t.transaction_date <= end)
      .reduce((sum, t) => sum + t.amount, 0) + allTransactions
      .filter((t) => t.scope === "personal" && t.type === "expense" && isRecurringPendingForMonth(t, currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      personalIncome: personalIncome + personalRecurringPaidIncome,
      personalExpense: personalExpense + personalRecurringPaidExpense,
      personalPendingIncome,
      personalPendingExpense,
    };
  }, [transactions, allTransactions, currentMonth]);

  const getCategoryInfo = (categoryId: string | null) => {
    if (!categoryId) return { name: "Sem categoria", color: "#6b7280" };
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? { name: cat.name, color: cat.color } : { name: "Sem categoria", color: "#6b7280" };
  };

  const calcExpenseByCategory = (): CategorySummary[] => {
    const expenses = transactions.filter((t) => t.type === "expense" && t.status === "paid");
    // Add recurring expenses paid for the current month
    const recurringExpenses = allTransactions
      .filter((t) => t.type === "expense" && isRecurringPaidForMonth(t, currentMonth));
    const allExpenses = [...expenses, ...recurringExpenses];
    const totalExpenses = allExpenses.reduce((sum, t) => sum + t.amount, 0);
    const categoryMap = new Map<string, { name: string; color: string; total: number; scopes: Set<string>; types: Set<string> }>();

    allExpenses.forEach((t) => {
      const key = t.category_id || "uncategorized";
      const info = getCategoryInfo(t.category_id);
      const existing = categoryMap.get(key);
      if (existing) {
        existing.total += t.amount;
        if (t.scope) existing.scopes.add(t.scope);
        if (t.type) existing.types.add(t.type);
      } else {
        const scopes = new Set<string>();
        const types = new Set<string>();
        if (t.scope) scopes.add(t.scope);
        if (t.type) types.add(t.type);
        categoryMap.set(key, { name: info.name, color: info.color, total: t.amount, scopes, types });
      }
    });

    return Array.from(categoryMap.entries())
      .map(([id, data]) => {
        const scopeArr = Array.from(data.scopes);
        const typeArr = Array.from(data.types);
        // Escopo único (pessoal)
        const scope = scopeArr[0] as "personal" | undefined;
        const type = typeArr.length === 2
          ? undefined
          : (typeArr[0] as "expense" | "income" | undefined);
        return {
          category_id: id,
          category_name: data.name,
          category_color: data.color,
          total: data.total,
          percentage: totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0,
          scope,
          type,
          _scopeArr: scopeArr,
          _typeArr: typeArr,
        };
      })
      .sort((a, b) => b.total - a.total) as CategorySummary[];
  };

  const calcMonthlyHistory = (): MonthlySummary[] => {
    const monthKeys = new Set<string>();

    allTransactions.forEach((t) => {
      if (t.transaction_date) {
        monthKeys.add(t.transaction_date.substring(0, 7));
      }
    });

    monthKeys.add(currentMonth);

    return Array.from(monthKeys)
      .sort((a, b) => a.localeCompare(b))
      .map((month) => {
        const txns = allTransactions.filter(
          (t) => !t.is_recurring && t.transaction_date?.substring(0, 7) === month
        );

        // Regular paid transactions for this month
        const personalIncome = txns
          .filter((t) => t.scope === "personal" && t.type === "income" && t.status === "paid")
          .reduce((sum, t) => sum + t.amount, 0);
        const personalExpense = txns
          .filter((t) => t.scope === "personal" && t.type === "expense" && t.status === "paid")
          .reduce((sum, t) => sum + t.amount, 0);

        // Recurring paid for this month (consistent with dashboard summary)
        const personalRecurringPaidIncome = allTransactions
          .filter((t) => t.scope === "personal" && t.type === "income" && isRecurringPaidForMonth(t, month))
          .reduce((sum, t) => sum + t.amount, 0);
        const personalRecurringPaidExpense = allTransactions
          .filter((t) => t.scope === "personal" && t.type === "expense" && isRecurringPaidForMonth(t, month))
          .reduce((sum, t) => sum + t.amount, 0);

        const income = personalIncome + personalRecurringPaidIncome;
        const expense = personalExpense + personalRecurringPaidExpense;

        return {
          month,
          total_income: income,
          total_expense: expense,
          balance: income - expense,
          personal_income: income,
          personal_expense: expense,
        };
      });
  };

  const expensesByCategory = calcExpenseByCategory();
  const monthlyHistory = calcMonthlyHistory();

  const monthOptions = (() => {
    const opts = [];
    const now = new Date();
    for (let i = 11; i >= -3; i--) {
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

  const recurringInMonth = allTransactions.filter(
    (t) => t.is_recurring && t.transaction_date?.substring(0, 7) === currentMonth
  );
  const isEmpty = transactions.length === 0 && recurringInMonth.length === 0;

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0 overflow-hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">Dashboard</h1>
          <p className="text-sm sm:text-base text-[var(--muted-foreground)] truncate">
            Visão geral das suas finanças
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {!isEmpty && (
            <>
              <Link href="/personal/transactions/new?type=income">
                <Button size="sm" variant="outline" className="gap-2 border-[var(--income)]/30 text-[var(--income)] hover:bg-[var(--income)]/5">
                  <ArrowDownLeft className="h-4 w-4" />
                  Receita
                </Button>
              </Link>
              <Link href="/personal/transactions/new?type=expense">
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
        <WelcomeCard userName={userName} userPlan={userPlan} />
      ) : (
        <>
          <KpiCards
            personalIncome={summary.personalIncome}
            personalExpense={summary.personalExpense}
            personalPendingIncome={summary.personalPendingIncome}
            personalPendingExpense={summary.personalPendingExpense}
            isEmpty={isEmpty}
          />

          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 min-w-0">
            <div className="min-w-0 overflow-hidden">
              <ExpenseChart data={expensesByCategory} title="Despesas por Categoria" />
            </div>
            <div className="min-w-0 overflow-hidden">
              <MonthlyChart data={monthlyHistory} userPlan={userPlan} />
            </div>
          </div>

          <div className="min-w-0 overflow-hidden">
            <GoalsWidget userPlan={userPlan} />
          </div>

          <div className="min-w-0 overflow-hidden">
            <MonthComparison data={monthlyHistory} userPlan={userPlan} selectedMonth={currentMonth} />
          </div>
        </>
      )}
    </div>
  );
}
