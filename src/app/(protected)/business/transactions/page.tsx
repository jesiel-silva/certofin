import { Suspense } from "react";
import { TransactionList } from "@/components/transactions/transaction-list";

export default function BusinessTransactionsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <Suspense fallback={<div className="p-8 text-center text-sm text-[var(--muted-foreground)]">Carregando lançamentos...</div>}>
        <TransactionList scope="business" />
      </Suspense>
    </div>
  );
}
