"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  className?: string;
  iconClassName?: string;
  side?: "top" | "bottom";
}

interface Coords {
  top: number;
  left: number;
  side: "top" | "bottom";
}

export function Tooltip({ content, children, className, iconClassName, side = "top" }: TooltipProps) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const calcPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const gap = 4;
    const spaceAbove = rect.top;
    const estimatedHeight = 80;

    let finalSide = side;
    if (side === "top" && spaceAbove < estimatedHeight + gap) {
      finalSide = "bottom";
    } else if (side === "bottom" && window.innerHeight - rect.bottom < estimatedHeight + gap) {
      finalSide = "top";
    }

    const centerX = rect.left + rect.width / 2;

    setCoords({
      top: finalSide === "top" ? rect.top - gap : rect.bottom + gap,
      left: centerX,
      side: finalSide,
    });
  }, [side]);

  useEffect(() => {
    if (coords !== null) {
      calcPosition();
    }
  }, [coords !== null, calcPosition]);

  return (
    <div
      ref={triggerRef}
      className={cn("relative inline-flex items-center", className)}
      onMouseEnter={() => calcPosition()}
      onMouseLeave={() => setCoords(null)}
      onFocus={() => calcPosition()}
      onBlur={() => setCoords(null)}
    >
      {children || (
        <span className="p-0.5 rounded-full hover:bg-[var(--primary)]/10 transition-colors inline-flex items-center justify-center cursor-help">
          <HelpCircle
            className={cn(
              "h-3.5 w-3.5 text-[var(--muted-foreground)]/60 hover:text-[var(--primary)] transition-colors shrink-0",
              iconClassName
            )}
            tabIndex={0}
          />
        </span>
      )}
      {coords !== null &&
        createPortal(
          <div
            className="fixed z-[9999] w-56 pointer-events-none animate-fade-in"
            style={{
              top: coords.side === "top" ? coords.top : coords.top,
              left: coords.left,
              transform:
                coords.side === "top"
                  ? "translate(-50%, -100%)"
                  : "translate(-50%, 0)",
            }}
          >
            <div className="rounded-lg border border-[var(--primary)]/20 bg-[#0B1221]/95 backdrop-blur-md p-3 shadow-xl shadow-black/30">
              <div className="flex items-start gap-2">
                <HelpCircle className="h-3 w-3 text-[var(--primary)] mt-0.5 shrink-0" />
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  {content}
                </p>
              </div>
            </div>
            <div
              className={cn(
                "absolute left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-r border-b border-[var(--primary)]/20 bg-[#0B1221]/95",
                coords.side === "top"
                  ? "bottom-0 translate-y-1/2"
                  : "top-0 -translate-y-1/2 rotate-[135deg]"
              )}
            />
          </div>,
          document.body
        )}
    </div>
  );
}

interface InlineTooltipProps {
  text: string;
  children: React.ReactNode;
  className?: string;
  side?: "top" | "bottom";
}

export function InlineTooltip({ text, children, className, side = "top" }: InlineTooltipProps) {
  return (
    <Tooltip content={text} side={side} className={className}>
      {children}
    </Tooltip>
  );
}
