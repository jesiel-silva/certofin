"use client";

import { TransactionList } from "@/components/transactions/transaction-list";

export default function PersonalTransactionsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <TransactionList scope="personal" />
    </div>
  );
}
