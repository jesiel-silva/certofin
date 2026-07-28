"use client";

import { TransactionList } from "@/components/transactions/transaction-list";

export default function BusinessTransactionsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <TransactionList scope="business" />
    </div>
  );
}
