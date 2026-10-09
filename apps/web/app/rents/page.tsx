import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RentsChart from "@/components/RentsChart";
import { getRentsOverview } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Dubai Rental Market Overview 2026",
  description:
    "Dubai rental market data: median rents, contract volumes, and top areas. Based on 857,000+ registered rental contracts from the Dubai Land Department.",
  openGraph: {
    type: "website",
    url: "https://dubai-property-intelligence-apps.vercel.app/rents",
    title: "Dubai Rental Market 2026 | DPI",
    description:
      "857,000+ registered rental contracts. Median rents by area from DLD.",
  },
};

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

function displayName(name: string): string {
  return name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function RentsPage() {
  let data;
  let error: string | null = null;

  try {
    data = await getRentsOverview();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load rents data";
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="mb-8 md:mb-10">
          <h1 className="text-2xl md:text-4xl font-bold text-zinc-900 mb-3 tracking-tight">
            Dubai Rental Market Overview
          </h1>
          <p className="text-sm md:text-base text-zinc-600 max-w-3xl">
            {data
              ? `Snapshot of ${data.stats.total_rents.toLocaleString()} registered residential rental contracts across ${data.stats.areas_count} Dubai areas, from ${data.stats.first_date} to ${data.stats.last_date}.`
              : "Real rental market data from the Dubai Land Department."}
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-10">
              <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-zinc-200">
                <div className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-wide mb-2">
                  Total Contracts
                </div>
                <div className="text-lg md:text-2xl font-bold text-zinc-900">
                  {data.stats.total_rents.toLocaleString()}
                </div>
              </div>
              <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-zinc-200">
                <div className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-wide mb-2">
                  Total Annual Value
                </div>
                <div className="text-lg md:text-2xl font-bold text-zinc-900">
                  AED {formatCompact(data.stats.total_annual_value)}
                </div>
              </div>
              <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-zinc-200">
                <div className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-wide mb-2">
                  Median Annual Rent
                </div>
                <div className="text-lg md:text-2xl font-bold text-zinc-900">
                  AED {formatCompact(data.stats.median_annual_rent)}
                </div>
              </div>
              <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-zinc-200">
                <div className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-wide mb-2">
                  Areas Covered
                </div>
                <div className="text-lg md:text-2xl font-bold text-zinc-900">
                  {data.stats.areas_count}
                </div>
              </div>
            </div>

            {/* Monthly Chart */}
            <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-8 border border-zinc-200 mb-8 md:mb-10">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-4 md:mb-6">
                <div>
                  <h2 className="text-base md:text-lg font-semibold text-zinc-900">
                    Monthly Rental Activity
                  </h2>
                  <p className="text-[11px] md:text-xs text-zinc-500 mt-1">
                    Contract count (bars) and total annual value in AED millions
                    (line)
                  </p>
                </div>
                <span className="text-[10px] md:text-xs text-zinc-500">
                  {data.monthly_trend.length} months
                </span>
              </div>
              <RentsChart data={data.monthly_trend} />
            </div>

            {/* Top Areas */}
            <div className="bg-white rounded-xl md:rounded-2xl border border-zinc-200 overflow-hidden">
              <div className="px-4 md:px-6 py-4 border-b border-zinc-100 flex items-baseline justify-between">
                <h2 className="text-base md:text-lg font-semibold text-zinc-900">
                  Top Areas by Rental Activity
                </h2>
                <Link
                  href="/areas"
                  className="text-xs text-blue-600 hover:underline"
                >
                  View all →
                </Link>
              </div>

              {/* Mobile list */}
              <div className="md:hidden divide-y divide-zinc-100">
                {data.top_areas.map((area, i) => (
                  <Link
                    key={area.area_name}
                    href={`/areas/${slugify(area.area_name)}`}
                    className="block px-4 py-3 active:bg-zinc-50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 flex items-center justify-center bg-zinc-100 rounded text-xs font-semibold text-zinc-600 flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="font-medium text-zinc-900 text-sm">
                          {displayName(area.area_name)}
                        </span>
                      </div>
                      <span className="text-zinc-400 text-xs">→</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pl-8">
                      <div>
                        <div className="text-[10px] uppercase text-zinc-400">
                          Contracts
                        </div>
                        <div className="text-xs font-medium text-zinc-700">
                          {area.rent_count.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-zinc-400">
                          Median Rent
                        </div>
                        <div className="text-xs font-semibold text-zinc-900">
                          {formatCompact(area.median_annual_rent)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-zinc-400">
                          Value
                        </div>
                        <div className="text-xs font-medium text-zinc-700">
                          {formatCompact(area.total_value)}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-50 border-b border-zinc-200">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">
                        Area
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">
                        Contracts
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">
                        Median Annual Rent
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">
                        Total Value
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
                              {displayName(area.area_name)}
                            </Link>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-zinc-700">
                          {area.rent_count.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-zinc-900">
                          AED {formatCompact(area.median_annual_rent)}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-zinc-700">
                          AED {formatCompact(area.total_value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 text-xs text-zinc-500 text-center">
              Source: {data.source.name} - {data.source.dataset} dataset.
              Residential only. Not investment advice.
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
