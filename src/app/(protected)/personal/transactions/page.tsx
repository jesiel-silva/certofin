import { Suspense } from "react";
import { TransactionList } from "@/components/transactions/transaction-list";

export default function PersonalTransactionsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <Suspense fallback={<div className="p-8 text-center text-sm text-[var(--muted-foreground)]">Carregando lançamentos...</div>}>
        <TransactionList scope="personal" />
      </Suspense>
    </div>
  );
}
