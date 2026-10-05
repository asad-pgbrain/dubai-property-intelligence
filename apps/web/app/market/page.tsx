import type { Metadata } from "next";
import Link from "next/link";
import { getMarketOverview } from "@/lib/api";

export const metadata: Metadata = {
  title: "Dubai Property Market Overview 2026",
  description:
    "Dubai real estate market overview: total transactions, median prices, monthly trends, and top areas. Based on official Dubai Land Department data.",
};

function formatAED(value: number | null | undefined): string {
  if (value == null) return "-";
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

function formatCompact(value: number | null | undefined): string {
  if (value == null) return "-";
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(Math.round(value));
}

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, "-");
}

function formatMonth(month: string): string {
  const d = new Date(month);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export default async function MarketPage() {
  let data;
  let error: string | null = null;

  try {
    data = await getMarketOverview();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load market data";
  }

  const maxCount = data
    ? Math.max(...data.monthly_trend.map((m) => m.transaction_count))
    : 1;

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs tracking-tight">DPI</span>
            </div>
            <span className="font-semibold text-zinc-900 text-sm">
              Dubai Property Intelligence
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-600">
            <Link href="/market" className="text-zinc-900 font-medium">Market</Link>
            <Link href="/areas" className="hover:text-zinc-900">Areas</Link>
            <Link href="/methodology" className="hover:text-zinc-900">Methodology</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-3 tracking-tight">
            Dubai Property Market Overview
          </h1>
          <p className="text-zinc-600 max-w-3xl">
            {data
              ? `Snapshot of ${data.stats.total_transactions.toLocaleString()} registered sales across ${data.stats.areas_count} Dubai areas, from ${data.stats.first_date} to ${data.stats.last_date}.`
              : "Real market data from the Dubai Land Department."}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {data && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <div className="bg-white rounded-2xl p-6 border border-zinc-200">
                <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">
                  Total Sales
                </div>
                <div className="text-2xl font-bold text-zinc-900">
                  {data.stats.total_transactions.toLocaleString()}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-zinc-200">
                <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">
                  Total Volume
                </div>
                <div className="text-2xl font-bold text-zinc-900">
                  AED {formatCompact(data.stats.total_volume_aed)}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-zinc-200">
                <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">
                  Median Price
                </div>
                <div className="text-2xl font-bold text-zinc-900">
                  AED {formatCompact(data.stats.median_price_aed)}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-zinc-200">
                <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">
                  Areas Covered
                </div>
                <div className="text-2xl font-bold text-zinc-900">
                  {data.stats.areas_count}
                </div>
              </div>
            </div>

            {/* Monthly Trend */}
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-zinc-200 mb-10">
              <div className="flex items-baseline justify-between mb-6">
                <h2 className="text-lg font-semibold text-zinc-900">
                  Monthly Sales Activity
                </h2>
                <span className="text-xs text-zinc-500">
                  {data.monthly_trend.length} months
                </span>
              </div>

              <div className="flex items-end gap-2 md:gap-4 h-48">
                {data.monthly_trend.map((row) => {
                  const heightPct = (row.transaction_count / maxCount) * 100;
                  return (
                    <div
                      key={row.month}
                      className="flex-1 flex flex-col items-center gap-2"
                    >
                      <div className="text-[10px] md:text-xs font-semibold text-zinc-700">
                        {row.transaction_count.toLocaleString()}
                      </div>
                      <div
                        className="w-full bg-blue-500 hover:bg-blue-600 rounded-t transition-all"
                        style={{ height: `${Math.max(heightPct, 2)}%` }}
                        title={`${row.transaction_count.toLocaleString()} sales, AED ${formatCompact(row.volume_aed)}`}
                      ></div>
                      <div className="text-[10px] md:text-xs text-zinc-500 whitespace-nowrap">
                        {formatMonth(row.month)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Areas */}
            <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100 flex items-baseline justify-between">
                <h2 className="text-lg font-semibold text-zinc-900">
                  Top 10 Areas by Activity
                </h2>
                <Link
                  href="/areas"
                  className="text-xs text-blue-600 hover:underline"
                >
                  View all areas →
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-50 border-b border-zinc-200">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">
                        Area
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">
                        Transactions
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">
                        Median Price
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">
                        Volume
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {data.top_areas.map((area, i) => (
                      <tr key={area.area_name} className="hover:bg-zinc-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 flex items-center justify-center bg-zinc-100 rounded text-xs font-semibold text-zinc-600">
                              {i + 1}
                            </span>
                            <Link
                              href={`/areas/${slugify(area.area_name)}`}
                              className="font-medium text-zinc-900 hover:text-blue-600 transition"
                            >
                              {area.area_name
                                .toLowerCase()
                                .replace(/\b\w/g, (c) => c.toUpperCase())}
                            </Link>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-zinc-700">
                          {area.transaction_count.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-zinc-900">
                          AED {formatCompact(area.median_price_aed)}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-zinc-700">
                          AED {formatCompact(area.volume_aed)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 text-xs text-zinc-500 text-center">
              Source: {data.source.name} - {data.source.dataset} dataset. Sales only. Not investment advice.
            </div>
          </>
        )}
      </main>
    </div>
  );
}
