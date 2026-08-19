"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import { formatCurrency, getMonthLabel } from "@/lib/utils";
import type { MonthlySummary } from "@/lib/types";
import { Lock } from "lucide-react";
import { Tooltip as HelpTooltip } from "@/components/ui/tooltip";

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
            EVOLUÇÃO DO SALDO
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
              Faça upgrade para ver a evolução do seu saldo
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
            EVOLUÇÃO DO SALDO
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

  const chartData = data.map((d) => {
    const personalBalance = d.personal_income - d.personal_expense;
    const businessBalance = d.business_income - d.business_expense;
    const totalBalance = personalBalance + businessBalance;

    return {
      name: getMonthLabel(d.month),
      "Pessoal": personalBalance,
      "Negócio": businessBalance,
      "Total": totalBalance,
    };
  });

  const currentMonth = data[data.length - 1];
  const currentPersonalBalance = currentMonth.personal_income - currentMonth.personal_expense;
  const currentBusinessBalance = currentMonth.business_income - currentMonth.business_expense;
  const currentTotalBalance = currentPersonalBalance + currentBusinessBalance;

  return (
    <Card className="hud-border overflow-hidden bg-[#0B1221]/80 backdrop-blur-sm scanline-overlay">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[var(--primary)]/20 pb-2 mb-2 gap-2">
          <div className="flex items-center gap-1.5">
            <CardTitle className="text-sm sm:text-base font-display font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
              EVOLUÇÃO DO SALDO
            </CardTitle>
            <HelpTooltip content="Mostra como seu saldo (o que sobrou) foi mudando mês a mês, tanto pessoal quanto do negócio." />
          </div>
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-[10px] sm:text-xs text-[var(--muted-foreground)] uppercase tracking-wider font-sans">Pessoal</p>
              <p className={`text-sm sm:text-base font-sans font-bold ${currentPersonalBalance >= 0 ? "text-[var(--success)] text-glow-green" : "text-[var(--destructive)] text-glow-red"}`}>
                {formatCurrency(currentPersonalBalance)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] sm:text-xs text-[var(--muted-foreground)] uppercase tracking-wider font-sans">Negócio</p>
              <p className={`text-sm sm:text-base font-sans font-bold ${currentBusinessBalance >= 0 ? "text-[var(--primary)] text-glow-cyan" : "text-[var(--destructive)] text-glow-red"}`}>
                {formatCurrency(currentBusinessBalance)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] sm:text-xs text-[var(--muted-foreground)] uppercase tracking-wider font-sans">Total</p>
              <p className={`text-sm sm:text-base font-sans font-bold ${currentTotalBalance >= 0 ? "text-[var(--warning)] text-glow-yellow" : "text-[var(--destructive)] text-glow-red"}`}>
                {formatCurrency(currentTotalBalance)}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 15, right: 5, left: -10, bottom: 5 }}>
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
            <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeDasharray="4 4" opacity={0.3} />
            <Tooltip
              cursor={{ stroke: "var(--primary)", strokeWidth: 1, opacity: 0.3 }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const pessoal = Number(payload.find((p) => p.dataKey === "Pessoal")?.value || 0);
                  const negocio = Number(payload.find((p) => p.dataKey === "Negócio")?.value || 0);
                  const total = pessoal + negocio;

                  return (
                    <div className="hud-border bg-[#0B1221]/95 p-4 shadow-xl shadow-[var(--primary)]/10 min-w-[200px] backdrop-blur-md">
                      <p className="mb-3 text-xs sm:text-sm font-bold uppercase tracking-widest text-[var(--primary)] border-b border-[var(--primary)]/30 pb-1">{label}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[var(--success)]">
                            <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
                            Pessoal
                          </span>
                          <span className={`text-xs sm:text-sm font-sans font-bold ${pessoal >= 0 ? "text-[var(--success)]" : "text-[var(--destructive)]"}`}>
                            {pessoal >= 0 ? "+" : ""}{formatCurrency(pessoal)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[var(--primary)]">
                            <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
                            Negócio
                          </span>
                          <span className={`text-xs sm:text-sm font-sans font-bold ${negocio >= 0 ? "text-[var(--primary)]" : "text-[var(--destructive)]"}`}>
                            {negocio >= 0 ? "+" : ""}{formatCurrency(negocio)}
                          </span>
                        </div>
                        <div className="border-t border-[var(--primary)]/20 pt-2 mt-1">
                          <div className="flex items-center justify-between gap-4">
                            <span className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[var(--warning)]">
                              <span className="h-2 w-2 rounded-full bg-[var(--warning)]" />
                              Total
                            </span>
                            <span className={`text-xs sm:text-sm font-sans font-bold ${total >= 0 ? "text-[var(--warning)]" : "text-[var(--destructive)]"}`}>
                              {total >= 0 ? "+" : ""}{formatCurrency(total)}
                            </span>
                          </div>
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
            <Line
              type="monotone"
              dataKey="Pessoal"
              stroke="var(--success)"
              strokeWidth={2}
              dot={{ fill: "var(--success)", strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="Negócio"
              stroke="var(--primary)"
              strokeWidth={2}
              dot={{ fill: "var(--primary)", strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="Total"
              stroke="var(--warning)"
              strokeWidth={2.5}
              strokeDasharray="6 3"
              dot={{ fill: "var(--warning)", strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
