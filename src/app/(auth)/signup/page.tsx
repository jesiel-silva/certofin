"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import {
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  TrendingUp,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas não conferem");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/confirm`,
      },
    });

    if (error) {
      setError(
        error.message.includes("already registered")
          ? "Este e-mail já está cadastrado"
          : error.message
      );
      setLoading(false);
      return;
    }

    router.push("/login?verified=true");
  };

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      {/* Lado Esquerdo - Branding */}
      <div className="relative hidden w-0 lg:block lg:w-1/2 overflow-hidden lg:flex lg:flex-col lg:justify-center lg:px-12 xl:px-20">
        {/* Background gradiente */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)] via-[var(--primary)]/90 to-[var(--primary)]/70" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        {/* Elementos decorativos */}
        <div className="absolute top-32 right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-32 left-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

        {/* Conteúdo */}
        <div className="relative z-10">
          <Link href="/" className="mb-12 inline-flex items-center">
            <Logo size="lg" showText={false} className="bg-white/20 backdrop-blur rounded-2xl p-1" />
            <span className="ml-3 text-2xl font-bold text-white">CertoFin</span>
          </Link>

          <h1 className="mb-6 text-4xl font-bold leading-tight text-white xl:text-5xl">
            Comece a organizar
            <br />
            <span className="text-white/80">suas finanças hoje</span>
          </h1>

          <p className="mb-12 max-w-md text-lg text-white/70">
            Crie sua conta gratuita e comece a controlar o dinheiro do seu
            negócio e pessoal em um só lugar.
          </p>

          {/* Benefits */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-medium text-white">Setup em 30 segundos</p>
                <p className="text-sm text-white/60">
                  Cadastro rápido e sem complicação
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-medium text-white">Seus dados protegidos</p>
                <p className="text-sm text-white/60">
                  Segurança de verdade, não é papo
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-medium text-white">Comece grátis</p>
                <p className="text-sm text-white/60">
                  10 lançamentos/mês sem pagar nada
                </p>
              </div>
            </div>
          </div>

          {/* Social proof */}
          <div className="mt-12 rounded-2xl bg-white/10 p-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <p className="text-sm text-white/80">
                <span className="font-semibold text-white">Seus dados seguros</span>{" "}
                com criptografia de ponta
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-20">
        <div className="mx-auto w-full max-w-md">
          {/* Logo mobile */}
          <div className="mb-8 lg:hidden">
            <div className="mx-auto w-fit">
              <Link href="/">
                <Logo size="lg" />
              </Link>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[var(--foreground)]">
              Criar sua conta
            </h2>
            <p className="mt-2 text-[var(--muted-foreground)]">
              Comece a organizar suas finanças agora
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl border border-[var(--destructive)]/20 bg-[var(--destructive)]/5 p-4 text-sm text-[var(--destructive)]">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="Nome completo"
                type="text"
                placeholder="João da Silva"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              <Input
                label="E-mail"
                type="email"
                placeholder="voce@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Senha"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                showPasswordToggle
                required
                minLength={6}
              />

              <Input
                label="Confirmar senha"
                type="password"
                placeholder="Repita a senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                showPasswordToggle
                required
                minLength={6}
              />
            </div>

            {/* Checklist */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <CheckCircle className="h-4 w-4 text-[var(--success)]" />
                <span>10 lançamentos grátis por mês</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <CheckCircle className="h-4 w-4 text-[var(--success)]" />
                <span>Sem necessidade de cartão de crédito</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <CheckCircle className="h-4 w-4 text-[var(--success)]" />
                <span>Cancele quando quiser</span>
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
                  Criando conta...
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  Criar conta grátis
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-[var(--border)]" />
            <span className="text-xs text-[var(--muted-foreground)]">ou</span>
            <div className="h-px flex-1 bg-[var(--border)]" />
          </div>

          {/* Link de login */}
          <div className="text-center">
            <p className="text-[var(--muted-foreground)]">
              Já tem uma conta?{" "}
              <Link
                href="/login"
                className="font-semibold text-[var(--primary)] hover:text-[var(--primary)]/80 transition-colors"
              >
                Entrar
              </Link>
            </p>
          </div>

          {/* Link voltar */}
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
