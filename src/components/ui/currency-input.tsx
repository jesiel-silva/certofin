"use client";

import { useState, ChangeEvent, InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface CurrencyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, label, error, className, ...props }, ref) => {
    const parseToBR = (val: string): string => {
      const numbers = val.replace(/\D/g, "");
      if (!numbers) return "";
      const cents = (parseInt(numbers, 10) / 100).toFixed(2);
      return new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(parseFloat(cents));
    };

    const [formattedValue, setFormattedValue] = useState(() => parseToBR(value));

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const numbersOnly = raw.replace(/\D/g, "");
      const formatted = parseToBR(numbersOnly);
      setFormattedValue(formatted);
      const floatValue = numbersOnly ? (parseInt(numbersOnly, 10) / 100).toFixed(2) : "";
      onChange(floatValue);
    };

    const handleBlur = () => {
      if (formattedValue && !formattedValue.includes(",")) {
        setFormattedValue(formattedValue + ",00");
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type="text"
          value={formattedValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="0,00"
          className={cn(
            "flex h-10 w-full rounded-lg border bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-[var(--destructive)] focus-visible:ring-[var(--destructive)]",
            className
          )}
          inputMode="numeric"
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-[var(--destructive)]">{error}</p>
        )}
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";
