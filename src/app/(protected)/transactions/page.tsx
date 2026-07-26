"use client";

import { TransactionList } from "@/components/transactions/transaction-list";

export default function TransactionsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <TransactionList />
    </div>
  );
}
