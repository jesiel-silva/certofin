"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Frown,
  Loader2,
  ShieldAlert,
  Star,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CancellationSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: "cancel_subscription" | "delete_account";
  userEmail?: string;
  onSuccess?: () => void;
}

const REASONS = [
  { id: "too_expensive", label: "💰 Preço elevado para o meu orçamento" },
  { id: "found_alternative", label: "🎯 Encontrei outra ferramenta ou não uso tanto" },
  { id: "missing_features", label: "🛠️ Faltam recursos que eu precisava" },
  { id: "hard_to_use", label: "🧩 Achei o sistema difícil ou confuso" },
  { id: "temporary_break", label: "⏸️ Apenas uma pausa temporária" },
  { id: "other", label: "💬 Outro motivo" },
];

export function CancellationSurveyModal({
  isOpen,
  onClose,
  actionType,
  userEmail,
  onSuccess,
}: CancellationSurveyModalProps) {
  const supabase = createClient();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedReason, setSelectedReason] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [confirmInput, setConfirmInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isDelete = actionType === "delete_account";

  const handleReset = () => {
    setStep(1);
    setSelectedReason("");
    setRating(5);
    setFeedbackText("");
    setConfirmInput("");
    setErrorMsg("");
    onClose();
  };

  const handleProceedToSurvey = () => {
    setStep(2);
  };

  const handleProceedToConfirm = () => {
    if (!selectedReason) {
      setErrorMsg("Por favor, selecione o principal motivo antes de continuar.");
      return;
    }
    setErrorMsg("");
    setStep(3);
  };

  const handleFinalSubmit = async () => {
    if (isDelete && confirmInput.trim().toUpperCase() !== "EXCLUIR") {
      setErrorMsg("Digite EXCLUIR para confirmar a remoção permanente.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErrorMsg("Sessão expirada. Por favor, faça login novamente.");
        setLoading(false);
        return;
      }

      // 1. Salvar feedback da pesquisa de satisfação
      await supabase.from("cancellation_feedback").insert({
        user_id: user.id,
        action_type: actionType,
        primary_reason: selectedReason || "not_specified",
        feedback_text: feedbackText || null,
        rating: rating,
      });

      // 2. Executar ação correspondente
      if (actionType === "cancel_subscription") {
        // Reverter perfil para plano grátis
        const { error: updateErr } = await supabase
          .from("profiles")
          .update({
            subscription_status: "free",
            trial_ends_at: new Date().toISOString(), // encerrar trial se ativo
          })
          .eq("id", user.id);

        if (updateErr) throw updateErr;

        setLoading(false);
        if (onSuccess) onSuccess();
        handleReset();
        window.location.reload();
      } else {
        // Excluir conta
        try {
          await supabase.rpc("delete_user_account", { target_user_id: user.id });
        } catch {
          // Fallback se a função RPC não estiver instalada no banco
          await supabase.from("transactions").delete().eq("user_id", user.id);
          await supabase.from("categories").delete().eq("user_id", user.id);
          await supabase.from("notifications").delete().eq("user_id", user.id);
          await supabase.from("profiles").delete().eq("id", user.id);
        }

        await supabase.auth.signOut();
        window.location.href = "/login";
      }
    } catch (err: unknown) {
      console.error("Erro ao processar solicitação:", err);
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      setErrorMsg("Ocorreu um erro ao processar: " + msg);
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleReset}
      className="max-w-lg hud-border bg-[#0B1221]/95 text-[var(--foreground)] backdrop-blur-xl p-0 overflow-hidden shadow-2xl"
    >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-[var(--primary)]/20 px-6 py-4 bg-[var(--background)]/60">
          <div className="flex items-center gap-2">
            {isDelete ? (
              <ShieldAlert className="h-5 w-5 text-[var(--destructive)]" />
            ) : (
              <Frown className="h-5 w-5 text-[var(--warning)]" />
            )}
            <h2 className="text-lg font-bold font-display uppercase tracking-wide">
              {isDelete ? "Exclusão Definitiva de Conta" : "Cancelamento de Plano"}
            </h2>
          </div>
          <button
            onClick={handleReset}
            className="rounded p-1 text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Indicador de passos */}
          <div className="flex items-center justify-center gap-2 text-xs font-mono">
            <span
              className={cn(
                "px-2.5 py-1 rounded-full border transition-all",
                step === 1
                  ? "border-[var(--primary)] text-[var(--primary)] bg-[var(--primary)]/10 font-bold"
                  : "border-transparent text-[var(--muted-foreground)]"
              )}
            >
              1. Impacto
            </span>
            <ChevronRight className="h-3 w-3 text-[var(--muted-foreground)]" />
            <span
              className={cn(
                "px-2.5 py-1 rounded-full border transition-all",
                step === 2
                  ? "border-[var(--primary)] text-[var(--primary)] bg-[var(--primary)]/10 font-bold"
                  : "border-transparent text-[var(--muted-foreground)]"
              )}
            >
              2. Pesquisa
            </span>
            <ChevronRight className="h-3 w-3 text-[var(--muted-foreground)]" />
            <span
              className={cn(
                "px-2.5 py-1 rounded-full border transition-all",
                step === 3
                  ? "border-[var(--primary)] text-[var(--primary)] bg-[var(--primary)]/10 font-bold"
                  : "border-transparent text-[var(--muted-foreground)]"
              )}
            >
              3. Confirmação
            </span>
          </div>

          {/* PASSO 1: Retenção / Benefícios mantidos */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="text-center">
                <p className="text-lg font-bold text-[var(--foreground)]">
                  {isDelete
                    ? "Tem certeza de que deseja encerrar sua conta?"
                    : "Sentiremos a sua falta no Plano PRO!"}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {isDelete
                    ? "Esta ação é irreversível e excluirá todos os seus lançamentos, categorias e relatórios."
                    : "Ao cancelar, sua conta retornará ao Plano Grátis após o término do período."}
                </p>
              </div>

              {!isDelete && (
                <div className="rounded-lg border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-4 space-y-2">
                  <p className="text-xs font-bold font-mono uppercase text-[var(--primary)] tracking-wider">
                    Recursos que você deixará de ter:
                  </p>
                  <ul className="space-y-1.5 text-xs text-[var(--foreground)]">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[var(--primary)] shrink-0" />
                      <span>Lançamentos mensais ilimitados</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[var(--primary)] shrink-0" />
                      <span>Relatórios e comparativo mensal avançado</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[var(--primary)] shrink-0" />
                      <span>Gestão de parcelamentos sem limite</span>
                    </li>
                  </ul>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={handleReset}
                  className="flex-1 bg-[var(--primary)] text-black hover:bg-[var(--primary)]/90 font-bold"
                >
                  {isDelete ? "Manter minha conta" : "Manter meu Plano PRO"}
                </Button>
                <Button
                  onClick={handleProceedToSurvey}
                  variant="outline"
                  className="flex-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                >
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* PASSO 2: Pesquisa de Satisfação */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-[var(--foreground)]">
                  Pesquisa de Satisfação
                </h3>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Ajude-nos a melhorar. Qual o principal motivo da sua decisão?
                </p>
              </div>

              {/* Opções de motivo */}
              <div className="space-y-2">
                {REASONS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedReason(r.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border text-xs font-medium transition-all flex items-center justify-between",
                      selectedReason === r.id
                        ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)] shadow-[0_0_10px_var(--primary)]"
                        : "border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent)]/50"
                    )}
                  >
                    <span>{r.label}</span>
                    {selectedReason === r.id && (
                      <CheckCircle2 className="h-4 w-4 text-[var(--primary)] shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {/* Avaliação em Estrelas */}
              <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] block">
                  Como avalia sua experiência com o CertoFin?
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-[var(--warning)] transition-transform hover:scale-110"
                    >
                      <Star
                        className={cn(
                          "h-6 w-6",
                          star <= rating
                            ? "fill-[var(--warning)] text-[var(--warning)] drop-shadow-[0_0_6px_var(--warning)]"
                            : "text-[var(--muted-foreground)]/30"
                        )}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-mono font-bold text-[var(--warning)] ml-2">
                    {rating}/5 estrelas
                  </span>
                </div>
              </div>

              {/* Caixa de Texto */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--muted-foreground)] block">
                  Sugestões ou comentários adicionais (opcional):
                </label>
                <textarea
                  rows={2}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Conte o que poderíamos ter feito melhor..."
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2.5 text-xs text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
                />
              </div>

              {errorMsg && (
                <p className="text-xs font-medium text-[var(--destructive)]">{errorMsg}</p>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  size="sm"
                  className="w-1/3"
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleProceedToConfirm}
                  size="sm"
                  className="w-2/3 bg-[var(--primary)] text-black hover:bg-[var(--primary)]/90 font-bold"
                >
                  Próximo passo
                </Button>
              </div>
            </div>
          )}

          {/* PASSO 3: Confirmação Final */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="rounded-lg border border-[var(--destructive)]/40 bg-[var(--destructive)]/10 p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-[var(--destructive)] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-[var(--destructive)]">
                    {isDelete ? "Confirmação de Exclusão" : "Confirmar Cancelamento"}
                  </h4>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    {isDelete
                      ? "Todos os seus dados financeiros serão permanentemente excluídos do servidor."
                      : "Sua assinatura será desativada e sua conta voltará ao plano Grátis."}
                  </p>
                </div>
              </div>

              {isDelete && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[var(--foreground)] block">
                    Digite <strong className="text-[var(--destructive)] font-mono">EXCLUIR</strong> para autorizar a remoção:
                  </label>
                  <input
                    type="text"
                    value={confirmInput}
                    onChange={(e) => setConfirmInput(e.target.value)}
                    placeholder="Digite EXCLUIR"
                    className="w-full rounded-lg border border-[var(--destructive)]/50 bg-[var(--background)] p-2.5 text-xs text-[var(--foreground)] font-mono focus:border-[var(--destructive)] focus:outline-none"
                  />
                </div>
              )}

              {errorMsg && (
                <p className="text-xs font-medium text-[var(--destructive)]">{errorMsg}</p>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  className="w-1/3"
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  size="sm"
                  className={cn(
                    "w-2/3 font-bold gap-2",
                    isDelete
                      ? "bg-[var(--destructive)] text-white hover:bg-[var(--destructive)]/90"
                      : "bg-[var(--warning)] text-black hover:bg-[var(--warning)]/90"
                  )}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isDelete ? "Confirmar Exclusão" : "Confirmar Cancelamento"}
                </Button>
              </div>
            </div>
          )}
        </div>
    </Dialog>
  );
}
