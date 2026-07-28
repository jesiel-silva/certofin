"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EditTransactionRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/personal/transactions");
  }, [router]);

  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
    </div>
  );
}
