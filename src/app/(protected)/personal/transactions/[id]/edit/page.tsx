"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatMonthYear } from "@/lib/utils";
import type { Transaction } from "@/lib/types";

export default function EditPersonalTransactionPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState<string>("");

  useEffect(() => {
    const fetchTransaction = async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error || !data) {
        router.push("/personal/transactions");
        return;
      }

      setTransaction(data);
      // Set initial month from transaction date
      setCurrentMonth(data.transaction_date.substring(0, 7));
      setLoading(false);
    };

    fetchTransaction();
  }, [params.id, supabase, router]);

  const handlePrevMonth = () => {
    if (!currentMonth) return;
    const [year, month] = currentMonth.split("-").map(Number);
    const prev = new Date(year, month - 2, 1);
    const newMonth = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;
    setCurrentMonth(newMonth);
  };

  const handleNextMonth = () => {
    if (!currentMonth) return;
    const [year, month] = currentMonth.split("-").map(Number);
    const next = new Date(year, month, 1);
    const newMonth = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
    setCurrentMonth(newMonth);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
      </div>
    );
  }

  if (!transaction) return null;

  // Determine status for the current viewed month
  let monthStatus: "paid" | "pending" = "pending";
  if (transaction.is_recurring && transaction.last_paid_date) {
    const paidMonth = transaction.last_paid_date.substring(0, 7);
    if (paidMonth >= currentMonth) {
      monthStatus = "paid";
    }
  }

  // Create modified transaction with the current month's date and status
  const displayTransaction: Transaction = transaction.is_recurring
    ? {
        ...transaction,
        transaction_date: `${currentMonth}-${String(Math.min(transaction.due_day || 1, 28)).padStart(2, "0")}`,
        status: monthStatus,
      }
    : transaction;

  return (
    <div className="mx-auto max-w-5xl flex flex-col items-center gap-4">
      {transaction.is_recurring && (
        <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevMonth}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-center min-w-[140px]">
            <p className="text-sm font-medium text-[var(--foreground)]">
              {formatMonthYear(currentMonth)}
            </p>
            <p className={`text-xs font-mono ${monthStatus === "paid" ? "text-[var(--success)]" : "text-[var(--warning)]"}`}>
              {monthStatus === "paid" ? "Pago" : "Pendente"}
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      <TransactionForm initialData={displayTransaction} mode="edit" />
    </div>
  );
}
