"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { ExpenseChart } from "@/components/dashboard/expense-chart";
import { MonthlyChart } from "@/components/dashboard/monthly-chart";
import { MonthComparison } from "@/components/dashboard/month-comparison";
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

export default function DashboardPage() {
  const supabase = createClient();
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");
  const [userPlan, setUserPlan] = useState<"free" | "pro" | "trial">("free");

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
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
        .gte("transaction_date", startDate)
        .order("transaction_date", { ascending: false }),
      supabase.from("categories").select("*"),
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
  };

  const transactions = useMemo(() => {
    const { start, end } = getMonthRange(currentMonth);
    return allTransactions
      .filter((t) => t.transaction_date >= start && t.transaction_date <= end && !t.is_recurring)
      .map((t) => ({ ...t, amount: Number(t.amount) }));
  }, [currentMonth, allTransactions]);

  // Helper: check if a recurring template is pending for the current month
  const isRecurringPendingForMonth = (t: Transaction): boolean => {
    if (!t.is_recurring) return false;
    const templateDateMonth = t.transaction_date?.substring(0, 7);
    if (templateDateMonth !== currentMonth) return false;
    // If last_paid_date covers the current month, it's paid
    if (t.last_paid_date) {
      const paidMonth = t.last_paid_date.substring(0, 7);
      if (paidMonth >= currentMonth) return false;
    }
    return true;
  };

  // Helper: check if a recurring template is paid for the current month
  const isRecurringPaidForMonth = (t: Transaction): boolean => {
    if (!t.is_recurring) return false;
    const templateDateMonth = t.transaction_date?.substring(0, 7);
    // Template moved to next month after being paid
    // Check if last_paid_date covers the previous month (which is the current view month)
    if (t.last_paid_date) {
      const paidMonth = t.last_paid_date.substring(0, 7);
      // The paid month should be the current month or later
      if (paidMonth >= currentMonth) return true;
    }
    return false;
  };

  const summary = useMemo(() => {
    const { start, end } = getMonthRange(currentMonth);
    const personalTx = transactions.filter((t) => t.scope === "personal");
    const businessTx = transactions.filter((t) => t.scope === "business");

    const personalIncome = personalTx
      .filter((t) => t.type === "income" && t.status === "paid")
      .reduce((sum, t) => sum + t.amount, 0);
    const personalExpense = personalTx
      .filter((t) => t.type === "expense" && t.status === "paid")
      .reduce((sum, t) => sum + t.amount, 0);

    const businessIncome = businessTx
      .filter((t) => t.type === "income" && t.status === "paid")
      .reduce((sum, t) => sum + t.amount, 0);
    const businessExpense = businessTx
      .filter((t) => t.type === "expense" && t.status === "paid")
      .reduce((sum, t) => sum + t.amount, 0);

    // Recurring paid for current month (income + expense, separated by scope)
    const personalRecurringPaidIncome = allTransactions
      .filter((t) => t.scope === "personal" && t.type === "income" && isRecurringPaidForMonth(t))
      .reduce((sum, t) => sum + t.amount, 0);
    const personalRecurringPaidExpense = allTransactions
      .filter((t) => t.scope === "personal" && t.type === "expense" && isRecurringPaidForMonth(t))
      .reduce((sum, t) => sum + t.amount, 0);
    const businessRecurringPaidIncome = allTransactions
      .filter((t) => t.scope === "business" && t.type === "income" && isRecurringPaidForMonth(t))
      .reduce((sum, t) => sum + t.amount, 0);
    const businessRecurringPaidExpense = allTransactions
      .filter((t) => t.scope === "business" && t.type === "expense" && isRecurringPaidForMonth(t))
      .reduce((sum, t) => sum + t.amount, 0);

    // Pending: only regular pending in current month + recurring pending for current month
    const personalPendingIncome = allTransactions
      .filter((t) => t.scope === "personal" && t.type === "income" && !t.is_recurring && t.status === "pending" && t.transaction_date >= start && t.transaction_date <= end)
      .reduce((sum, t) => sum + t.amount, 0) + allTransactions
      .filter((t) => t.scope === "personal" && t.type === "income" && isRecurringPendingForMonth(t))
      .reduce((sum, t) => sum + t.amount, 0);
    const personalPendingExpense = allTransactions
      .filter((t) => t.scope === "personal" && t.type === "expense" && !t.is_recurring && t.status === "pending" && t.transaction_date >= start && t.transaction_date <= end)
      .reduce((sum, t) => sum + t.amount, 0) + allTransactions
      .filter((t) => t.scope === "personal" && t.type === "expense" && isRecurringPendingForMonth(t))
      .reduce((sum, t) => sum + t.amount, 0);

    const businessPendingIncome = allTransactions
      .filter((t) => t.scope === "business" && t.type === "income" && !t.is_recurring && t.status === "pending" && t.transaction_date >= start && t.transaction_date <= end)
      .reduce((sum, t) => sum + t.amount, 0) + allTransactions
      .filter((t) => t.scope === "business" && t.type === "income" && isRecurringPendingForMonth(t))
      .reduce((sum, t) => sum + t.amount, 0);
    const businessPendingExpense = allTransactions
      .filter((t) => t.scope === "business" && t.type === "expense" && !t.is_recurring && t.status === "pending" && t.transaction_date >= start && t.transaction_date <= end)
      .reduce((sum, t) => sum + t.amount, 0) + allTransactions
      .filter((t) => t.scope === "business" && t.type === "expense" && isRecurringPendingForMonth(t))
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      personalIncome: personalIncome + personalRecurringPaidIncome,
      personalExpense: personalExpense + personalRecurringPaidExpense,
      businessIncome: businessIncome + businessRecurringPaidIncome,
      businessExpense: businessExpense + businessRecurringPaidExpense,
      personalPendingIncome,
      personalPendingExpense,
      businessPendingIncome,
      businessPendingExpense,
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
      .filter((t) => t.type === "expense" && isRecurringPaidForMonth(t));
    const allExpenses = [...expenses, ...recurringExpenses];
    const totalExpenses = allExpenses.reduce((sum, t) => sum + t.amount, 0);
    const categoryMap = new Map<string, { name: string; color: string; total: number }>();

    allExpenses.forEach((t) => {
      const key = t.category_id || "uncategorized";
      const info = getCategoryInfo(t.category_id);
      const existing = categoryMap.get(key);
      if (existing) {
        existing.total += t.amount;
      } else {
        categoryMap.set(key, { name: info.name, color: info.color, total: t.amount });
      }
    });

    return Array.from(categoryMap.entries())
      .map(([id, data]) => ({
        category_id: id,
        category_name: data.name,
        category_color: data.color,
        total: data.total,
        percentage: totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  };

  const calcMonthlyHistory = (): MonthlySummary[] => {
    const months = new Map<string, Transaction[]>();
    allTransactions
      .filter((t) => !t.is_recurring)
      .forEach((t) => {
        const month = t.transaction_date.substring(0, 7);
        if (!months.has(month)) months.set(month, []);
        months.get(month)!.push(t);
      });

    return Array.from(months.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, txns]) => {
        const personalIncome = txns
          .filter((t) => t.scope === "personal" && t.type === "income" && t.status === "paid")
          .reduce((sum, t) => sum + t.amount, 0);
        const personalExpense = txns
          .filter((t) => t.scope === "personal" && t.type === "expense" && t.status === "paid")
          .reduce((sum, t) => sum + t.amount, 0);
        const businessIncome = txns
          .filter((t) => t.scope === "business" && t.type === "income" && t.status === "paid")
          .reduce((sum, t) => sum + t.amount, 0);
        const businessExpense = txns
          .filter((t) => t.scope === "business" && t.type === "expense" && t.status === "paid")
          .reduce((sum, t) => sum + t.amount, 0);
        return {
          month,
          total_income: personalIncome + businessIncome,
          total_expense: personalExpense + businessExpense,
          balance: personalIncome + businessIncome - personalExpense - businessExpense,
          personal_income: personalIncome,
          personal_expense: personalExpense,
          business_income: businessIncome,
          business_expense: businessExpense,
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
            businessIncome={summary.businessIncome}
            businessExpense={summary.businessExpense}
            personalPendingIncome={summary.personalPendingIncome}
            personalPendingExpense={summary.personalPendingExpense}
            businessPendingIncome={summary.businessPendingIncome}
            businessPendingExpense={summary.businessPendingExpense}
            isEmpty={isEmpty}
          />

          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <ExpenseChart data={expensesByCategory} title="Despesas por Categoria" />
            <MonthlyChart data={monthlyHistory} userPlan={userPlan} />
          </div>

          <MonthComparison data={monthlyHistory} userPlan={userPlan} />
        </>
      )}
    </div>
  );
}
