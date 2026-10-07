import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import type { AreaSummary } from "@/lib/api";
import { listAreas } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Dubai Areas - Property Prices & Market Data",
  description:
    "Browse all Dubai areas with real transaction data. Median prices, AED/sqft, transaction counts from the Dubai Land Department.",
};

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, "-");
}

function displayName(name: string): string {
  return name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatAED(value: number | null): string {
  if (value == null) return "-";
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

function formatCompact(value: number | null): string {
  if (value == null) return "-";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(Math.round(value));
}

export default async function AreasPage() {
  let areas: AreaSummary[] = [];
  let error: string | null = null;

  try {
    const data = await listAreas(100);
    areas = data.data;
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load areas";
  }

  const totalTx = areas.reduce((sum, a) => sum + (a.total_transactions || 0), 0);

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="mb-8 md:mb-10">
          <h1 className="text-2xl md:text-4xl font-bold text-zinc-900 mb-3 tracking-tight">
            Dubai Areas
          </h1>
          <p className="text-sm md:text-base text-zinc-600 max-w-3xl">
            Median property prices and transaction activity across Dubai communities.
            Based on {totalTx.toLocaleString()} registered sales from the Dubai Land Department.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Mobile: cards */}
        <div className="md:hidden space-y-3">
          {areas.map((area, i) => (
            <Link
              key={area.area_name}
              href={`/areas/${slugify(area.area_name)}`}
              className="block bg-white rounded-2xl border border-zinc-200 p-4 active:bg-zinc-50 transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 flex items-center justify-center bg-zinc-100 rounded text-xs font-semibold text-zinc-600 flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="font-semibold text-zinc-900 text-sm">
                    {displayName(area.area_name)}
                  </span>
                </div>
                <span className="text-zinc-400 text-sm">→</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-zinc-400 mb-0.5">
                    Median
                  </div>
                  <div className="text-sm font-bold text-zinc-900">
                    {formatCompact(area.median_price_aed)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-zinc-400 mb-0.5">
                    AED/sqft
                  </div>
                  <div className="text-sm font-medium text-zinc-700">
                    {formatAED(area.median_aed_sqft)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-zinc-400 mb-0.5">
                    Sales
                  </div>
                  <div className="text-sm font-medium text-zinc-700">
                    {area.total_transactions.toLocaleString()}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Desktop: table */}
        <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wide">
                    Area
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wide">
                    Transactions
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wide">
                    Median Price
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wide">
                    AED / sqft
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-zinc-600 uppercase tracking-wide">
                    Last Sale
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {areas.map((area) => (
                  <tr key={area.area_name} className="hover:bg-zinc-50 transition">
                    <td className="px-6 py-4">
                      <Link
                        href={`/areas/${slugify(area.area_name)}`}
                        className="font-medium text-zinc-900 hover:text-blue-600 transition"
                      >
                        {displayName(area.area_name)}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-zinc-700">
                      {area.total_transactions.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-zinc-900">
                      AED {formatCompact(area.median_price_aed)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-zinc-700">
                      {formatAED(area.median_aed_sqft)}
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-zinc-500">
                      {area.last_transaction}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 text-xs text-zinc-500 text-center">
          Source: Dubai Land Department - Transactions dataset. Sales only.
        </div>
      </main>
    </div>
  );
}
