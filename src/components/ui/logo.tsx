import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  showSubtitle?: boolean;
  textClassName?: string;
  imageClassName?: string;
}

export function Logo({
  className,
  size = "md",
  showText = false,
  showSubtitle,
  textClassName,
  imageClassName,
}: LogoProps) {
  const iconSizes = {
    sm: "h-24 w-24",
    md: "h-40 w-40",
    lg: "h-48 w-48",
    xl: "h-56 w-56",
  };

  const textSizes = {
    sm: "text-xl tracking-tight",
    md: "text-2xl tracking-tight",
    lg: "text-3xl tracking-tight",
    xl: "text-4xl tracking-tight",
  };

  const subtitleSizes = {
    sm: "text-[9px] tracking-[0.24em] mt-[1px]",
    md: "text-[10px] tracking-[0.26em] mt-[2px]",
    lg: "text-[11px] tracking-[0.28em] mt-[2px]",
    xl: "text-[12px] tracking-[0.30em] mt-[2px]",
  };

  const shouldShowSubtitle = showSubtitle ?? (size !== "sm");

  return (
    <div className={cn("inline-flex items-center gap-3 select-none", className)}>
      <div className={cn("relative shrink-0", iconSizes[size], imageClassName)}>
        <Image
          src="/stripe-logo-transp.png"
          alt="CertoFin Logo"
          fill
          sizes="(max-width: 768px) 96px, 200px"
          className="object-contain"
          priority
        />
      </div>

      {showText && (
        <div className="flex flex-col justify-center">
          <span className={cn("font-extrabold leading-none", textSizes[size], textClassName)}>
            <span className="text-[#054388] dark:text-slate-100" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Certo
            </span>
            <span className="text-[#009B9E] dark:text-[var(--primary)] text-glow-cyan" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Fin
            </span>
          </span>
          {shouldShowSubtitle && (
            <span className={cn("font-bold text-[#7E8B9B] uppercase leading-none mt-1", subtitleSizes[size])}>
              Soluções Financeiras
            </span>
          )}
        </div>
      )}
    </div>
  );
}
