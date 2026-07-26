"use client";

import { TransactionForm } from "@/components/transactions/transaction-form";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function NewTransactionContent() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") as "income" | "expense" | null;

  return (
    <div className="mx-auto max-w-5xl flex justify-center">
      <TransactionForm mode="create" initialType={initialType} />
    </div>
  );
}

export default function NewTransactionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
        </div>
      }
    >
      <NewTransactionContent />
    </Suspense>
  );
}
