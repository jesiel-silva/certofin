"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

function renderBarTopLabel(props: any) {
  const { x, y, width, value, payload } = props;
  if (!payload || value === undefined || value === null) return null;
  const item = payload as CategorySummary;
  const percentageStr = `${item.percentage.toFixed(0)}%`;
  const formattedVal = formatCurrency(value);

  return (
    <g transform={`translate(${x + width / 2}, ${y - 6})`}>
      <text
        x={0}
        y={-14}
        textAnchor="middle"
        fill={item.category_color}
        fontSize={11}
        fontWeight={800}
        fontFamily="var(--font-inter)"
        style={{ filter: `drop-shadow(0 0 5px ${item.category_color}aa)` }}
      >
        {percentageStr}
      </text>
      <text
        x={0}
        y={0}
        textAnchor="middle"
        fill="var(--foreground)"
        fontSize={9}
        fontWeight={700}
        fontFamily="var(--font-inter)"
        opacity={0.85}
      >
        {formattedVal}
      </text>
    </g>
  );
}
import { formatCurrency } from "@/lib/utils";
import type { CategorySummary } from "@/lib/types";
import { BarChart2, PieChart as PieIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpenseChartProps {
  data: CategorySummary[];
  title?: string;
}

const RADIAN = Math.PI / 180;

function renderCustomLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}) {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontFamily="var(--font-inter)"
      fontWeight={700}
      style={{ textShadow: "0 0 5px rgba(0,0,0,0.8)" }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export function ExpenseChart({
  data,
  title = "Despesas por Categoria",
}: ExpenseChartProps) {
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");

  if (!data.length) {
    return (
      <Card className="hud-border overflow-hidden bg-[#0B1221]/80 backdrop-blur-sm scanline-overlay">
        <CardHeader>
          <CardTitle className="text-sm sm:text-base font-display font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] sm:h-[250px] items-center justify-center text-sm sm:text-base font-sans text-[var(--primary)]/40">
            [ SEM DADOS ]
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((sum, item) => sum + item.total, 0);
  // Sort data descending by total for clean bar layout
  const sortedData = [...data].sort((a, b) => b.total - a.total);
  const topCategories = sortedData.slice(0, 7);

  return (
    <Card className="hud-border overflow-hidden bg-[#0B1221]/80 backdrop-blur-sm scanline-overlay">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between border-b border-[var(--primary)]/20 pb-2 mb-2">
          <div className="flex items-center gap-3">
            <CardTitle className="text-sm sm:text-base font-display font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
              {title}
            </CardTitle>
            <div className="flex items-center gap-1 rounded-md border border-[var(--primary)]/20 bg-[var(--background)]/60 p-0.5">
              <button
                onClick={() => setChartType("bar")}
                className={cn(
                  "flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium transition-all",
                  chartType === "bar"
                    ? "bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/40 shadow-[0_0_8px_var(--primary)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
                title="Gráfico de Barras"
              >
                <BarChart2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Barras</span>
              </button>
              <button
                onClick={() => setChartType("pie")}
                className={cn(
                  "flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium transition-all",
                  chartType === "pie"
                    ? "bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/40 shadow-[0_0_8px_var(--primary)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
                title="Gráfico de Rosca"
              >
                <PieIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Rosca</span>
              </button>
            </div>
          </div>
          <span className="text-sm sm:text-base font-sans font-bold text-[var(--destructive)] text-glow-red">
            {formatCurrency(total)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          {chartType === "bar" ? (
            <ResponsiveContainer width="100%" height={270}>
              <RechartsBarChart
                data={topCategories}
                margin={{ top: 35, right: 10, left: 10, bottom: 25 }}
              >
                <XAxis
                  dataKey="category_name"
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  tick={({ x, y, payload }) => (
                    <g transform={`translate(${x},${y})`}>
                      <text
                        x={0}
                        y={0}
                        dy={12}
                        textAnchor="middle"
                        fill="var(--foreground)"
                        fontSize={10}
                        fontWeight={600}
                        className="truncate"
                      >
                        {payload.value.length > 10
                          ? `${payload.value.substring(0, 9)}…`
                          : payload.value}
                      </text>
                    </g>
                  )}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as CategorySummary;
                      return (
                        <div className="hud-border bg-[#0B1221]/95 p-3 shadow-xl backdrop-blur-md min-w-[150px]">
                          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                            <div
                              className="h-2 w-2"
                              style={{
                                backgroundColor: item.category_color,
                                boxShadow: `0 0 8px ${item.category_color}`,
                              }}
                            />
                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[var(--foreground)] opacity-90">
                              {item.category_name}
                            </span>
                          </div>
                          <p
                            className="text-sm sm:text-base font-bold font-sans"
                            style={{
                              color: item.category_color,
                              textShadow: `0 0 5px ${item.category_color}80`,
                            }}
                          >
                            {formatCurrency(item.total)}
                          </p>
                          <p className="text-[10px] sm:text-xs font-sans text-[var(--muted-foreground)] mt-1">
                            {item.percentage.toFixed(1)}% DO TOTAL
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="total"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={45}
                >
                  <LabelList content={renderBarTopLabel} />
                  {topCategories.map((entry, index) => (
                    <Cell
                      key={`bar-cell-${index}`}
                      fill={entry.category_color}
                      style={{ filter: `drop-shadow(0 0 6px ${entry.category_color}80)` }}
                    />
                  ))}
                </Bar>
              </RechartsBarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={sortedData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="total"
                  nameKey="category_name"
                  labelLine={false}
                  label={renderCustomLabel}
                >
                  {sortedData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill="transparent"
                      stroke={entry.category_color}
                      strokeWidth={3}
                      style={{ filter: `drop-shadow(0 0 5px ${entry.category_color}80)` }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as CategorySummary;
                      return (
                        <div className="hud-border bg-[#0B1221]/95 p-3 shadow-xl backdrop-blur-md min-w-[150px]">
                          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                            <div
                              className="h-2 w-2"
                              style={{
                                backgroundColor: item.category_color,
                                boxShadow: `0 0 8px ${item.category_color}`,
                              }}
                            />
                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[var(--foreground)] opacity-90">
                              {item.category_name}
                            </span>
                          </div>
                          <p
                            className="text-sm sm:text-base font-bold font-sans"
                            style={{
                              color: item.category_color,
                              textShadow: `0 0 5px ${item.category_color}80`,
                            }}
                          >
                            {formatCurrency(item.total)}
                          </p>
                          <p className="text-[10px] sm:text-xs font-sans text-[var(--muted-foreground)] mt-1">
                            {item.percentage.toFixed(1)}% DO TOTAL
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}

          {/* Legenda detalhada */}
          <div className="w-full mt-4 pt-4 border-t border-[var(--border)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
              {sortedData.slice(0, 6).map((item) => (
                <div
                  key={item.category_id}
                  className="flex items-center gap-1.5 rounded border border-[var(--border)] bg-[var(--background)]/50 px-2 py-1 min-w-0"
                >
                  <div
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{
                      backgroundColor: item.category_color,
                      boxShadow: `0 0 6px ${item.category_color}`,
                    }}
                  />
                  <span className="truncate text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--foreground)] opacity-80">
                    {item.category_name}
                  </span>
                  <span className="shrink-0 text-[10px] sm:text-xs font-bold font-sans text-[var(--foreground)]">
                    {formatCurrency(item.total)}
                  </span>
                  <span className="shrink-0 text-[10px] sm:text-xs font-bold font-sans text-[var(--primary)] opacity-80">
                    {item.percentage.toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
            {sortedData.length > 6 && (
              <div className="mt-2 flex flex-wrap justify-center gap-1">
                {sortedData.slice(6, 12).map((item) => (
                  <span
                    key={item.category_id}
                    className="inline-flex items-center gap-1 rounded bg-[var(--accent)]/50 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-sans font-bold text-[var(--muted-foreground)]"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.category_color }}
                    />
                    {item.category_name}
                  </span>
                ))}
                {sortedData.length > 12 && (
                  <span className="inline-flex items-center rounded bg-[var(--accent)]/50 px-1.5 py-0.5 text-[8px] sm:text-[9px] font-sans font-bold text-[var(--muted-foreground)]">
                    +{sortedData.length - 12}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
