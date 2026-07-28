"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { CategorySummary } from "@/lib/types";

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
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export function ExpenseChart({
  data,
  title = "Gastos por Categoria",
}: ExpenseChartProps) {
  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] sm:h-[250px] items-center justify-center text-sm text-[var(--muted-foreground)]">
            Sem dados para exibir
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((sum, item) => sum + item.total, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <span className="text-xs font-semibold text-[var(--foreground)]">
            {formatCurrency(total)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                dataKey="total"
                nameKey="category_name"
                labelLine={false}
                label={renderCustomLabel}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.category_color}
                    stroke="var(--card)"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as CategorySummary;
                    return (
                      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: item.category_color }}
                          />
                          <span className="text-sm font-semibold">
                            {item.category_name}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-[var(--foreground)]">
                          {formatCurrency(item.total)}
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {item.percentage.toFixed(1)}% do total
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend with details */}
          <div className="w-full space-y-2 mt-2">
            {data.slice(0, 5).map((item) => (
              <div key={item.category_id} className="flex items-center gap-3">
                <div
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.category_color }}
                />
                <span className="flex-1 truncate text-xs text-[var(--muted-foreground)]">
                  {item.category_name}
                </span>
                <span className="text-xs font-semibold text-[var(--foreground)]">
                  {formatCurrency(item.total)}
                </span>
                <span className="w-10 text-right text-[10px] font-medium text-[var(--muted-foreground)]">
                  {item.percentage.toFixed(0)}%
                </span>
              </div>
            ))}
            {data.length > 5 && (
              <p className="text-center text-[10px] text-[var(--muted-foreground)]">
                +{data.length - 5} outras categorias
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
