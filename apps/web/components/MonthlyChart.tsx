"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface TrendRow {
  month: string;
  transaction_count: number;
  volume_aed: number;
  median_price_aed: number;
}

interface Props {
  data: TrendRow[];
}

function formatMonth(month: string): string {
  const d = new Date(month);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function formatCompact(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(value);
}

function formatFull(value: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

export default function MonthlyChart({ data }: Props) {
  const chartData = data.map((d) => ({
    month: formatMonth(d.month),
    transactions: d.transaction_count,
    volume: Math.round(Number(d.volume_aed) / 1_000_000),
  }));

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e5e7eb"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{ fill: "#71717a", fontSize: 12 }}
            axisLine={{ stroke: "#e5e7eb" }}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: "#71717a", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatCompact}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: "#71717a", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}M`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "12px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
            labelStyle={{
              fontWeight: 600,
              color: "#18181b",
              marginBottom: "4px",
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
            iconType="circle"
          />
          <Bar
            yAxisId="left"
            dataKey="transactions"
            name="Transactions"
            fill="#3b82f6"
            radius={[6, 6, 0, 0]}
            maxBarSize={60}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="volume"
            name="Volume (AED M)"
            stroke="#10b981"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#10b981" }}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
