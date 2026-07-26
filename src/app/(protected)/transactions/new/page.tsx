"use client";

import { TransactionForm } from "@/components/transactions/transaction-form";

export default function NewTransactionPage() {
  return (
    <div className="mx-auto max-w-5xl flex justify-center">
      <TransactionForm mode="create" />
    </div>
  );
}
