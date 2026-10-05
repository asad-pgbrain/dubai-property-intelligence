"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface AreaRow {
  area_name: string;
  median_price_aed: number | null;
  median_aed_sqft: number | null;
  transaction_count: number;
}

interface MonthlyRow {
  area_name: string;
  month: string;
  transaction_count: number;
  median_price_aed: number;
}

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#06b6d4", // cyan
];

function displayName(name: string): string {
  return name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function normArea(name: string): string {
  return name.trim().toUpperCase();
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(value);
}

function formatAED(value: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

function formatMonth(month: string): string {
  const d = new Date(month);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

// ============================================================
// Median Price Bar Chart
// ============================================================
export function ComparePriceChart({ data }: { data: AreaRow[] }) {
  const chartData = data.map((d) => ({
    area: displayName(d.area_name),
    median_price: d.median_price_aed ? Math.round(d.median_price_aed) : 0,
  }));

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="area"
            tick={{ fill: "#71717a", fontSize: 11 }}
            axisLine={{ stroke: "#e5e7eb" }}
            tickLine={false}
            interval={0}
          />
          <YAxis
            tick={{ fill: "#71717a", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatCompact}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "12px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
            formatter={(value: number) => `AED ${formatAED(value)}`}
            labelStyle={{ fontWeight: 600, color: "#18181b" }}
          />
          <Bar dataKey="median_price" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={80} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================================
// AED/sqft Bar Chart
// ============================================================
export function CompareSqftChart({ data }: { data: AreaRow[] }) {
  const chartData = data.map((d) => ({
    area: displayName(d.area_name),
    median_sqft: d.median_aed_sqft ? Math.round(d.median_aed_sqft) : 0,
  }));

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="area"
            tick={{ fill: "#71717a", fontSize: 11 }}
            axisLine={{ stroke: "#e5e7eb" }}
            tickLine={false}
            interval={0}
          />
          <YAxis
            tick={{ fill: "#71717a", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatCompact}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "12px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
            formatter={(value: number) => `${formatAED(value)} AED/sqft`}
            labelStyle={{ fontWeight: 600, color: "#18181b" }}
          />
          <Bar dataKey="median_sqft" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={80} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================================
// Monthly Trend Overlay Line Chart
// ============================================================
export function CompareTrendChart({
  data,
  areas,
}: {
  data: MonthlyRow[];
  areas: string[];
}) {
  // Build map of month -> { AREA_NAME_UPPER: count }
  const monthMap = new Map<string, Record<string, number>>();

  data.forEach((row) => {
    const monthKey = row.month.slice(0, 7); // YYYY-MM
    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, {});
    }
    const obj = monthMap.get(monthKey)!;
    obj[normArea(row.area_name)] = row.transaction_count;
  });

  const chartData = Array.from(monthMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, values]) => ({
      month: formatMonth(month + "-01"),
      ...values,
    }));

  // Normalize area keys for matching
  const areaKeys = areas.map((a) => normArea(a));

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: "#71717a", fontSize: 12 }}
            axisLine={{ stroke: "#e5e7eb" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#71717a", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatCompact}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "12px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
            formatter={(value: number) => `${value} sales`}
            labelStyle={{ fontWeight: 600, color: "#18181b" }}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
            iconType="circle"
          />
          {areaKeys.map((areaKey, idx) => (
            <Line
              key={areaKey}
              type="monotone"
              dataKey={areaKey}
              name={displayName(areaKey)}
              stroke={COLORS[idx % COLORS.length]}
              strokeWidth={2.5}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
