"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency, getMonthLabel } from "@/lib/utils";
import type { MonthlySummary } from "@/lib/types";
import { TrendingUp, TrendingDown, Minus, Lock } from "lucide-react";

interface MonthlyChartProps {
  data: MonthlySummary[];
  userPlan?: "free" | "pro" | "trial";
}

export function MonthlyChart({ data, userPlan = "free" }: MonthlyChartProps) {
  if (userPlan === "free") {
    return (
      <Card className="hud-border overflow-hidden bg-[#0B1221]/80 backdrop-blur-sm scanline-overlay opacity-60">
        <CardHeader>
          <CardTitle className="text-sm sm:text-base font-display font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
            COMPARATIVO MENSAL RECEITAS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--warning)]/10 border border-[var(--warning)]/30">
              <Lock className="h-6 w-6 text-[var(--warning)]" />
            </div>
            <p className="text-sm font-medium text-[var(--foreground)]">
              Gráfico disponível no Plano Pro
            </p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              Faça upgrade para ver o comparativo mensal
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card className="hud-border overflow-hidden bg-[#0B1221]/80 backdrop-blur-sm scanline-overlay">
        <CardHeader>
          <CardTitle className="text-sm sm:text-base font-display font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
            COMPARATIVO MENSAL RECEITAS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[250px] sm:h-[300px] items-center justify-center text-sm sm:text-base font-sans text-[var(--primary)]/40">
            [ SEM DADOS ]
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate differences from previous month
  const chartData = data.map((d, index) => {
    const prev = index > 0 ? data[index - 1] : null;
    const personalDiff = prev ? d.personal_income - prev.personal_income : 0;
    const businessDiff = prev ? d.business_income - prev.business_income : 0;

    return {
      name: getMonthLabel(d.month),
      "Receita Pessoal": d.personal_income,
      "Receita Negócio": d.business_income,
      personalDiff,
      businessDiff,
      hasPrev: index > 0,
    };
  });

  const totalPersonal = data.reduce((sum, d) => sum + d.personal_income, 0);
  const totalBusiness = data.reduce((sum, d) => sum + d.business_income, 0);

  // Last month comparison
  const lastMonth = data[data.length - 1];
  const prevMonth = data.length > 1 ? data[data.length - 2] : null;
  const lastMonthPersonalDiff = prevMonth ? lastMonth.personal_income - prevMonth.personal_income : 0;
  const lastMonthBusinessDiff = prevMonth ? lastMonth.business_income - prevMonth.business_income : 0;

  return (
    <Card className="hud-border overflow-hidden bg-[#0B1221]/80 backdrop-blur-sm scanline-overlay">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between border-b border-[var(--primary)]/20 pb-2 mb-2">
          <CardTitle className="text-sm sm:text-base font-display font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
            COMPARATIVO MENSAL RECEITAS
          </CardTitle>
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)] uppercase tracking-wider font-sans">TOTAL PESSOAL</p>
              <p className="text-sm sm:text-base font-sans font-bold text-[var(--success)] text-glow-green">{formatCurrency(totalPersonal)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)] uppercase tracking-wider font-sans">TOTAL NEGÓCIO</p>
              <p className="text-sm sm:text-base font-sans font-bold text-[var(--primary)] text-glow-cyan">{formatCurrency(totalBusiness)}</p>
            </div>
          </div>
        </div>

        {/* Last month comparison badges */}
        {prevMonth && (
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-2">
            <DiffBadge
              label="Pessoal"
              diff={lastMonthPersonalDiff}
              color="success"
            />
            <DiffBadge
              label="Negócio"
              diff={lastMonthBusinessDiff}
              color="primary"
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 15, right: 5, left: -10, bottom: 5 }}>
            <CartesianGrid
              strokeDasharray="2 4"
              stroke="var(--primary)"
              opacity={0.15}
              vertical={true}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontFamily: "var(--font-inter)" }}
              axisLine={{ stroke: "var(--border)", strokeWidth: 1 }}
              tickLine={false}
              dy={10}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontFamily: "var(--font-inter)" }}
              axisLine={{ stroke: "var(--border)", strokeWidth: 1 }}
              tickLine={false}
              tickFormatter={(v) =>
                new Intl.NumberFormat("pt-BR", {
                  notation: "compact",
                  compactDisplay: "short",
                }).format(v)
              }
            />
            <Tooltip
              cursor={{ fill: "var(--primary)", opacity: 0.05 }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const item = chartData.find((d) => d.name === label);
                  const personalIncome = Number(payload.find((p) => p.dataKey === "Receita Pessoal")?.value || 0);
                  const businessIncome = Number(payload.find((p) => p.dataKey === "Receita Negócio")?.value || 0);

                  return (
                    <div className="hud-border bg-[#0B1221]/95 p-4 shadow-xl shadow-[var(--primary)]/10 min-w-[200px] backdrop-blur-md">
                      <p className="mb-3 text-xs sm:text-sm font-bold uppercase tracking-widest text-[var(--primary)] border-b border-[var(--primary)]/30 pb-1">{label}</p>

                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between gap-4 mb-1">
                            <span className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[var(--success)]">
                              <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
                              Pessoal
                            </span>
                            <span className="text-xs sm:text-sm font-sans font-bold text-[var(--success)]">
                              {formatCurrency(personalIncome)}
                            </span>
                          </div>
                          {item?.hasPrev && (
                            <DiffLine diff={item.personalDiff} />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center justify-between gap-4 mb-1">
                            <span className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[var(--primary)]">
                              <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
                              Negócio
                            </span>
                            <span className="text-xs sm:text-sm font-sans font-bold text-[var(--primary)]">
                              {formatCurrency(businessIncome)}
                            </span>
                          </div>
                          {item?.hasPrev && (
                            <DiffLine diff={item.businessDiff} />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', fontFamily: 'var(--font-inter)', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              content={({ payload }) => {
                if (!payload) return null;
                return (
                  <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4">
                    {payload.map((entry) => (
                      <div key={entry.value} className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: entry.color, boxShadow: `0 0 5px ${entry.color}` }}
                        />
                        <span className="text-[10px] sm:text-xs font-bold text-[var(--foreground)] opacity-80">
                          {entry.value}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            <Bar
              dataKey="Receita Pessoal"
              fill="var(--success)"
              fillOpacity={0.8}
              stroke="var(--success)"
              strokeWidth={1}
              radius={[3, 3, 0, 0]}
            />
            <Bar
              dataKey="Receita Negócio"
              fill="var(--primary)"
              fillOpacity={0.8}
              stroke="var(--primary)"
              strokeWidth={1}
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function DiffBadge({ label, diff, color }: { label: string; diff: number; color: string }) {
  const colorClasses: Record<string, string> = {
    success: "bg-[var(--success)]/10 border-[var(--success)]/30 text-[var(--success)]",
    primary: "bg-[var(--primary)]/10 border-[var(--primary)]/30 text-[var(--primary)]",
    destructive: "bg-[var(--destructive)]/10 border-[var(--destructive)]/30 text-[var(--destructive)]",
  };

  const textColor: Record<string, string> = {
    success: "text-[var(--success)]",
    primary: "text-[var(--primary)]",
    destructive: "text-[var(--destructive)]",
  };

  return (
    <div className={`flex items-center gap-2 rounded-lg border px-2 sm:px-3 py-1 sm:py-1.5 ${colorClasses[color]}`}>
      <span className="text-xs sm:text-sm font-sans font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
        {label}
      </span>
      {diff > 0 ? (
        <span className={`flex items-center gap-1 text-xs sm:text-sm font-sans font-bold ${textColor[color]}`}>
          <TrendingUp className="h-3 w-3" />
          +{formatCurrency(diff)}
        </span>
      ) : diff < 0 ? (
        <span className="flex items-center gap-1 text-xs sm:text-sm font-sans font-bold text-[var(--destructive)]">
          <TrendingDown className="h-3 w-3" />
          {formatCurrency(diff)}
        </span>
      ) : (
        <span className="flex items-center gap-1 text-xs sm:text-sm font-sans font-bold text-[var(--muted-foreground)]">
          <Minus className="h-3 w-3" />
          —
        </span>
      )}
    </div>
  );
}

function DiffLine({ diff }: { diff: number }) {
  if (diff === 0) {
    return (
      <p className="text-[10px] sm:text-xs font-sans text-[var(--muted-foreground)] pl-4">
        Sem alteração vs mês anterior
      </p>
    );
  }

  return (
    <p className={`text-[10px] sm:text-xs font-sans pl-4 ${diff > 0 ? "text-[var(--success)]" : "text-[var(--destructive)]"}`}>
      {diff > 0 ? "▲" : "▼"} {diff > 0 ? "+" : ""}{formatCurrency(diff)} vs mês anterior
    </p>
  );
}
