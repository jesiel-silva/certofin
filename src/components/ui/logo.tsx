import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  showSubtitle?: boolean;
}

export function Logo({
  className,
  size = "md",
  showText = true,
  showSubtitle,
}: LogoProps) {
  const iconSizes = {
    sm: "h-10 w-10",
    md: "h-14 w-14",
    lg: "h-20 w-20",
  };

  const textSizes = {
    sm: "text-xl tracking-tight",
    md: "text-3xl tracking-tight",
    lg: "text-4xl tracking-tight",
  };

  const subtitleSizes = {
    sm: "text-[9px] tracking-[0.24em] mt-[1px]",
    md: "text-[10px] tracking-[0.26em] mt-[2px]",
    lg: "text-[10px] tracking-[0.28em] mt-[2px]",
  };

  // Default to showing subtitle for md/lg if not explicitly passed
  const shouldShowSubtitle = showSubtitle ?? (size !== "sm");

  return (
    <div className={cn("flex items-center gap-3 select-none", className)}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", iconSizes[size])}
      >
          <defs>
            <linearGradient
              id="logo-left-wing-grad"
              x1="15"
              y1="45"
              x2="35"
              y2="65"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#0073BC" />
              <stop offset="100%" stopColor="#054388" />
            </linearGradient>

            <linearGradient
              id="logo-bottom-fold-grad"
              x1="20"
              y1="70"
              x2="45"
              y2="55"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#031F44" />
              <stop offset="100%" stopColor="#005A9C" />
            </linearGradient>

            <linearGradient
              id="logo-arrow-grad"
              x1="30"
              y1="80"
              x2="90"
              y2="20"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#054388" />
              <stop offset="35%" stopColor="#0073BC" />
              <stop offset="70%" stopColor="#00A0E3" />
              <stop offset="100%" stopColor="#009B9E" />
            </linearGradient>
          </defs>

          <path
            d="M 12 55 L 26 69 L 38 57 L 24 43 Z"
            fill="url(#logo-left-wing-grad)"
          />
          <path
            d="M 26 69 L 41 84 L 53 72 L 38 57 Z"
            fill="url(#logo-bottom-fold-grad)"
          />
          <path
            d="M 33 76 L 73 36 L 68 31 L 90 22 L 90 44 L 85 39 L 45 79 Z"
            fill="url(#logo-arrow-grad)"
          />
        </svg>

      {showText && (
        <div className="flex flex-col justify-center">
          <span className={cn("font-extrabold leading-none", textSizes[size])}>
            <span className="text-[#054388] dark:text-slate-100" style={{ fontFamily: "var(--font-orbitron)" }}>
              Certo
            </span>
            <span className="text-[#009B9E] dark:text-[var(--primary)]" style={{ fontFamily: "var(--font-orbitron)" }}>
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
