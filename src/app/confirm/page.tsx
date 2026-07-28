"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          router.replace("/personal/dashboard");
        }
      }
    );

    return () => {
      data.subscription.unsubscribe();
    };
  }, [supabase, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent mx-auto" />
        <p className="text-[var(--muted-foreground)]">
          Confirmando seu e-mail...
        </p>
      </div>
    </div>
  );
}
