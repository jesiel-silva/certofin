"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { ArrowRight, TrendingUp, Wallet, PieChart, Mail, AlertCircle, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      setSuccess("Conta criada! Verifique seu e-mail e clique no link de confirmação para ativar sua conta.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const msg = error.message?.toLowerCase() || "";
      const code = (error as any).code?.toLowerCase() || "";
      
      if (msg.includes("email not confirmed") || 
          msg.includes("email_not_confirmed") ||
          msg.includes("unconfirmed") ||
          code.includes("email_not_confirmed") ||
          code.includes("unconfirmed_email")) {
        setError("Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada (e spam) e clique no link que enviamos.");
      } else if (msg === "invalid login credentials" || msg.includes("invalid credentials")) {
        setError("E-mail ou senha inválidos");
      } else {
        setError(error.message);
      }
      setLoading(false);
      return;
    }

    router.push("/personal/dashboard");
  };

  const resendConfirmation = async () => {
    if (!email) {
      setError("Digite seu e-mail primeiro");
      return;
    }
    setResending(true);
    setError("");

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/confirm`,
      },
    });

    if (error) {
      setError("Erro ao reenviar: " + error.message);
    } else {
      setSuccess("E-mail de confirmação reenviado! Verifique sua caixa de entrada (e spam).");
    }
    setResending(false);
  };

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      {/* Lado Esquerdo - Branding */}
      <div className="relative hidden w-1/2 overflow-hidden lg:flex lg:flex-col lg:justify-center lg:px-12 xl:px-20">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)] via-[var(--primary)]/90 to-[var(--primary)]/70" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

        <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-white/5 blur-3xl" />

        <div className="relative z-10">
          <Link href="/" className="mb-12 inline-flex items-center">
            <Logo size="lg" showText={false} className="bg-white/20 backdrop-blur rounded-2xl p-1" />
            <span className="ml-3 text-2xl font-bold text-white">CertoFin</span>
          </Link>

          <h1 className="mb-6 text-4xl font-bold leading-tight text-white xl:text-5xl">
            Organize suas finanças
            <br />
            <span className="text-white/80">de um jeito simples</span>
          </h1>

          <p className="mb-12 max-w-md text-lg text-white/70">
            Separe o dinheiro do negócio do pessoal. Saiba quanto lucrou e
            quanto sobrou pra você.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-medium text-white">Dashboard inteligente</p>
                <p className="text-sm text-white/60">Gráficos fáceis de entender</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-medium text-white">Escopos separados</p>
                <p className="text-sm text-white/60">Negócio e pessoal organizados</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                <PieChart className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-medium text-white">Relatórios claros</p>
                <p className="text-sm text-white/60">Veja pra onde vai seu dinheiro</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-20">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <Link href="/" className="inline-block">
              <Logo size="lg" className="inline-flex" />
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[var(--foreground)]">Bem-vindo de volta</h2>
            <p className="mt-2 text-[var(--muted-foreground)]">Entre na sua conta para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {success && (
              <div className="rounded-xl border border-[var(--success)]/20 bg-[var(--success)]/5 p-4 text-sm text-[var(--success)] flex items-start gap-3">
                <CheckCircle className="h-5 w-5 mt-0.5 shrink-0" />
                <div>{success}</div>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-[var(--destructive)]/20 bg-[var(--destructive)]/5 p-4 text-sm text-[var(--destructive)] flex items-start gap-3">
                <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                <div>
                  {error}
                  {(error.includes("confirmado") || error.includes("confirmed")) && email && (
                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={resendConfirmation}
                        disabled={resending}
                        className="gap-1.5"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        {resending ? "Enviando..." : "Reenviar e-mail"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="E-mail"
                type="email"
                placeholder="voce@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="space-y-2">
                <Input
                  label="Senha"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  showPasswordToggle
                  required
                />
                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-[var(--primary)] hover:text-[var(--primary)]/80 transition-colors"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="h-12 w-full text-base"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Entrando...
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  Entrar
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-[var(--border)]" />
            <span className="text-xs text-[var(--muted-foreground)]">ou</span>
            <div className="h-px flex-1 bg-[var(--border)]" />
          </div>

          <div className="text-center">
            <p className="text-[var(--muted-foreground)]">
              Ainda não tem uma conta?{" "}
              <Link
                href="/signup"
                className="font-semibold text-[var(--primary)] hover:text-[var(--primary)]/80 transition-colors"
              >
                Criar conta grátis
              </Link>
            </p>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              ← Voltar para o início
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" /></div>}>
      <LoginFormContent />
    </Suspense>
  );
}

export { LoginForm };