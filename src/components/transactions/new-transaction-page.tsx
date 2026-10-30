"use client";

/**
 * NewTransactionPage
 * Componente compartilhado usado pelas rotas:
 *   - /personal/transactions/new
 *   - /business/transactions/new
 *
 * Recebe o scope via prop para evitar duplicacao de codigo entre as duas rotas.
 */

import { TransactionForm } from "@/components/transactions/transaction-form";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface NewTransactionPageProps {
  scope?: "personal";
}

function NewTransactionContent({ scope }: NewTransactionPageProps) {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") as "income" | "expense" | null;

  return (
    <div className="mx-auto max-w-5xl flex justify-center">
      <TransactionForm mode="create" initialScope={scope} initialType={initialType} />
    </div>
  );
}

export function NewTransactionPage({ scope }: NewTransactionPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
        </div>
      }
    >
      <NewTransactionContent scope={scope} />
    </Suspense>
  );
}
