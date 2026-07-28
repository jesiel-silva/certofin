"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TransactionForm } from "@/components/transactions/transaction-form";
import type { Transaction } from "@/lib/types";

export default function EditBusinessTransactionPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransaction = async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error || !data) {
        router.push("/business/transactions");
        return;
      }

      setTransaction(data);
      setLoading(false);
    };

    fetchTransaction();
  }, [params.id, supabase, router]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
      </div>
    );
  }

  if (!transaction) return null;

  return (
    <div className="mx-auto max-w-5xl flex justify-center">
      <TransactionForm initialData={transaction} mode="edit" />
    </div>
  );
}
