"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/ui/logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Headset,
  Mail,
  Send,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const assuntoOptions = [
  "Dúvidas sobre o plano",
  "Problemas com o login",
  "Cancelamento de assinatura",
  "Problemas técnicos",
  "Sugestão de melhoria",
  "Privacidade e segurança",
  "Outro assunto",
];

export default function ContatoPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = (await res.json()) as { error?: string; success?: boolean };

      if (!res.ok || !data.success) {
        setError(data.error || "Não foi possível enviar sua mensagem. Tente novamente.");
        return;
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {
      setError("Não foi possível enviar sua mensagem. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] antialiased text-[var(--foreground)]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--primary)]/30 bg-[#020617]/90 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Logo size="md" />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Início
          </Link>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="mx-auto max-w-4xl px-6 py-12 sm:py-16">
        <div className="text-center space-y-4 border-b border-[var(--primary)]/20 pb-8">
          <div className="inline-flex items-center gap-2 border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-4 py-1.5 text-xs font-sans font-bold uppercase tracking-widest text-[var(--primary)]">
            <Headset className="h-4 w-4" />
            <span>FALE CONOSCO</span>
          </div>
          <h1 className="text-3xl font-extrabold sm:text-5xl text-white tracking-tight" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Como podemos <span className="text-[var(--primary)] text-glow-cyan">ajudar?</span>
          </h1>
          <p className="text-base sm:text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto leading-relaxed">
            Preencha o formulário abaixo e nossa equipe de suporte responderá o mais rápido possível.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
          {/* Informações de contato */}
          <div className="hud-border bg-[#0B1221]/80 p-6 sm:p-8 space-y-6 border-l-4 border-l-[var(--primary)]">
            <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-[var(--primary)] text-glow-cyan">
              Canais de atendimento
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--primary)]/30 bg-[var(--primary)]/10 text-[var(--primary)]">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-sans font-bold uppercase tracking-widest text-[var(--foreground)]">E-mail</p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">suporte@certofin.com.br</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--primary)]/30 bg-[var(--primary)]/10 text-[var(--primary)]">
                  <Headset className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-sans font-bold uppercase tracking-widest text-[var(--foreground)]">Horário</p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    Segunda a sexta, das 9h às 18h.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--primary)]/20 pt-6">
              <p className="text-xs font-sans uppercase tracking-widest leading-relaxed text-[var(--muted-foreground)]">
                Não envie informações sensíveis como senhas ou dados bancários por este canal.
              </p>
            </div>
          </div>

          {/* Formulário */}
          <div className="hud-border bg-[#0B1221]/80 p-6 sm:p-8">
            {success && (
              <div className="mb-6 rounded-lg border border-[var(--success)]/30 bg-[var(--success)]/10 p-4 text-sm text-[var(--success)] flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" />
                <div>
                  Mensagem enviada com sucesso! Nossa equipe responderá para{" "}
                  <strong>{email}</strong> em breve.
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-lg border border-[var(--destructive)]/30 bg-[var(--destructive)]/10 p-4 text-sm text-[var(--destructive)] flex items-start gap-3">
                <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Seu nome"
                type="text"
                placeholder="Ex.: Maria Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="Seu e-mail"
                type="email"
                placeholder="voce@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="w-full">
                <label htmlFor="assunto" className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                  Assunto
                </label>
                <select
                  id="assunto"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="flex h-10 w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] transition-colors placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
                >
                  <option value="" disabled>
                    Selecione o assunto que você quer tratar
                  </option>
                  {assuntoOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full">
                <label htmlFor="mensagem" className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                  Mensagem
                </label>
                <textarea
                  id="mensagem"
                  rows={5}
                  placeholder="Descreva detalhadamente o que você precisa de ajuda..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="flex w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] transition-colors placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
                />
              </div>

              <Button
                type="submit"
                className="h-12 w-full text-base"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Enviando...
                  </div>
                ) : (
                  <span className="flex items-center gap-2">
                    Enviar mensagem
                    <Send className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--primary)]/20 bg-[#020617] py-6 text-center text-xs text-[var(--muted-foreground)] uppercase tracking-widest">
        &copy; {new Date().getFullYear()} CertoFin. Todos os direitos reservados.
      </footer>
    </div>
  );
}