"use client";

import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Lock, ArrowRight } from "lucide-react";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  feature?: string;
}

export function UpgradeModal({ open, onClose, feature }: UpgradeModalProps) {
  const handleUpgrade = () => {
    // TODO: Implementar fluxo de checkout
    window.location.href = "/planos";
  };

  const getFeatureMessage = () => {
    switch (feature) {
      case "business_scope":
        return "O escopo Negócio/Trabalho é exclusivo do plano Pro. Com ele você separa as finanças do seu trabalho das pessoais.";
      case "installment":
        return "Lançamentos parcelados são exclusivos do plano Pro. Crie projeções de compras parceladas para meses futuros.";
      case "transaction_limit":
        return "Você atingiu o limite de 30 lançamentos do plano grátis este mês. Faça upgrade para ter lançamentos ilimitados.";
      default:
        return "Este recurso é exclusivo do plano Pro. Desbloqueie todo o potencial do CertoFin.";
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader onClose={onClose}>
        <DialogTitle>Desbloqueie todo o potencial do seu negócio!</DialogTitle>
        <DialogDescription>{getFeatureMessage()}</DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="rounded-xl border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]">
              <span className="text-sm font-bold text-white">PRO</span>
            </div>
            <div>
              <p className="font-semibold text-[var(--foreground)]">Plano Pro</p>
              <p className="text-sm text-[var(--muted-foreground)]">R$ 29,90/mês</p>
            </div>
          </div>

          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[var(--success)]" />
              <span className="text-[var(--foreground)]">Lançamentos ilimitados</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[var(--success)]" />
              <span className="text-[var(--foreground)]">Escopo Negócio e Pessoal</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[var(--success)]" />
              <span className="text-[var(--foreground)]">Lançamentos parcelados</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[var(--success)]" />
              <span className="text-[var(--foreground)]">Dashboard completo com gráficos</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[var(--success)]" />
              <span className="text-[var(--foreground)]">Cálculo de lucro líquido real</span>
            </li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Agora não
          </Button>
          <Button onClick={handleUpgrade} className="flex-1 gap-2">
            Assinar Pro
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-center text-xs text-[var(--muted-foreground)]">
          <Lock className="inline h-3 w-3 mr-1" />
          Pagamento seguro via Cartão de Crédito. Cancele quando quiser.
        </p>
      </div>
    </Dialog>
  );
}
