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
  ReferenceLine,
} from "recharts";
import { formatCurrency, getMonthLabel } from "@/lib/utils";
import type { MonthlySummary } from "@/lib/types";

interface MonthlyChartProps {
  data: MonthlySummary[];
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Comparativo Mensal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[250px] sm:h-[300px] items-center justify-center text-sm text-[var(--muted-foreground)]">
            Sem dados para exibir
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((d) => ({
    name: getMonthLabel(d.month),
    "Pessoal Receita": d.personal_income,
    "Pessoal Gastos": d.personal_expense,
    "Negócio Receita": d.business_income,
    "Negócio Gastos": d.business_expense,
    Lucro: d.balance,
  }));

  const totalIncome = data.reduce((sum, d) => sum + d.total_income, 0);
  const totalExpense = data.reduce((sum, d) => sum + d.total_expense, 0);
  const avgBalance = data.length > 0
    ? data.reduce((sum, d) => sum + d.balance, 0) / data.length
    : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Comparativo Mensal
          </CardTitle>
          <div className="flex gap-3">
            <div className="text-right">
              <p className="text-[10px] text-[var(--muted-foreground)]">Total Receita</p>
              <p className="text-xs font-bold text-emerald-600">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[var(--muted-foreground)]">Total Gastos</p>
              <p className="text-xs font-bold text-rose-600">{formatCurrency(totalExpense)}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              opacity={0.4}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) =>
                new Intl.NumberFormat("pt-BR", {
                  notation: "compact",
                  compactDisplay: "short",
                }).format(v)
              }
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const personalIncome = Number(payload.find((p) => p.dataKey === "Pessoal Receita")?.value || 0);
                  const personalExpense = Number(payload.find((p) => p.dataKey === "Pessoal Gastos")?.value || 0);
                  const businessIncome = Number(payload.find((p) => p.dataKey === "Negócio Receita")?.value || 0);
                  const businessExpense = Number(payload.find((p) => p.dataKey === "Negócio Gastos")?.value || 0);
                  const balance = Number(payload.find((p) => p.dataKey === "Lucro")?.value || 0);

                  return (
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-lg min-w-[200px]">
                      <p className="mb-3 text-sm font-bold text-[var(--foreground)]">{label}</p>

                      {(personalIncome > 0 || personalExpense > 0) && (
                        <div className="mb-2">
                          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600/70">
                            Pessoal
                          </p>
                          <div className="space-y-0.5 pl-1">
                            {personalIncome > 0 && (
                              <p className="text-xs text-emerald-600">
                                Receita: <span className="font-semibold">{formatCurrency(personalIncome)}</span>
                              </p>
                            )}
                            {personalExpense > 0 && (
                              <p className="text-xs text-rose-600">
                                Gastos: <span className="font-semibold">{formatCurrency(personalExpense)}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {(businessIncome > 0 || businessExpense > 0) && (
                        <div className="mb-2">
                          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-blue-600/70">
                            Negócio
                          </p>
                          <div className="space-y-0.5 pl-1">
                            {businessIncome > 0 && (
                              <p className="text-xs text-blue-600">
                                Receita: <span className="font-semibold">{formatCurrency(businessIncome)}</span>
                              </p>
                            )}
                            {businessExpense > 0 && (
                              <p className="text-xs text-orange-600">
                                Gastos: <span className="font-semibold">{formatCurrency(businessExpense)}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="mt-2 border-t border-[var(--border)] pt-2">
                        <p className="text-xs text-[var(--muted-foreground)]">
                          Saldo:{" "}
                          <span className={`font-bold ${balance >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                            {formatCurrency(balance)}
                          </span>
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              content={({ payload }) => {
                if (!payload) return null;
                return (
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
                    {payload.map((entry) => {
                      const label = entry.value || "";
                      const hide = label.includes("Receita") || label.includes("Gastos");
                      if (hide) return null;
                      return (
                        <div key={entry.value} className="flex items-center gap-1.5">
                          <div
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="text-[11px] text-[var(--muted-foreground)]">
                            {entry.value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              }}
            />
            <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="3 3" />
            <Bar dataKey="Pessoal Receita" fill="#10b981" radius={[3, 3, 0, 0]} stackId="personal" />
            <Bar dataKey="Pessoal Gastos" fill="#f43f5e" radius={[0, 0, 0, 0]} stackId="personal" opacity={0.7} />
            <Bar dataKey="Negócio Receita" fill="#3b82f6" radius={[3, 3, 0, 0]} stackId="business" />
            <Bar dataKey="Negócio Gastos" fill="#f97316" radius={[0, 0, 0, 0]} stackId="business" opacity={0.7} />
            <Bar dataKey="Lucro" fill="var(--primary)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
