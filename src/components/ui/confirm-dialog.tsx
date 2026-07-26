"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "./button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./dialog";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmar",
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--destructive)]/10">
          <AlertTriangle className="h-6 w-6 text-[var(--destructive)]" />
        </div>
        <DialogHeader onClose={onClose} className="items-center">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="mt-1">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex w-full gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Excluindo..." : confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
