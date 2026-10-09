import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RentsChart from "@/components/RentsChart";
import { getQ3Report } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Dubai Real Estate Market Report — Q3 2026",
  description:
    "Data-driven Dubai property market report for Q3 2026 (July–September). Sales volume, median prices, top areas, and off-plan trends — based on official DLD transactions.",
  openGraph: {
    type: "article",
    url: "https://dubai-property-intelligence-apps.vercel.app/reports/q3-2026",
    title: "Dubai Real Estate Market Report — Q3 2026 | DPI",
    description:
      "Q3 2026 Dubai property market analysis from 30,000+ DLD-registered sales.",
  },
};

function formatAED(value: number | null | undefined): string {
  if (value == null) return "-";
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

function formatCompact(value: number | null | undefined): string {
  if (value == null) return "-";
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(Math.round(value));
}

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, "-");
}

function displayName(name: string): string {
  return name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatMonth(month: string): string {
  const d = new Date(month);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default async function Q3ReportPage() {
  let data;
  let error: string | null = null;

  try {
    data = await getQ3Report();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load report";
  }

  const offplanTotal =
    data?.offplan_split.reduce((sum, r) => sum + r.sale_count, 0) || 0;
  const offplanPct = offplanTotal
    ? Math.round(
        ((data?.offplan_split.find((r) => r.is_offplan === "Off-Plan")
          ?.sale_count || 0) /
          offplanTotal) *
          100
      )
    : 0;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-16">
        {/* Breadcrumb */}
        <nav className="text-xs md:text-sm text-zinc-500 mb-6">
          <Link href="/" className="hover:text-zinc-900">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/reports" className="hover:text-zinc-900">
            Reports
          </Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-900">Q3 2026</span>
        </nav>

        {/* Header */}
        <div className="mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
            Market Report
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-zinc-900 mb-4 tracking-tight leading-tight">
            Dubai Real Estate Market Report
          </h1>
          <p className="text-xl md:text-2xl text-zinc-600 mb-6">
            Q3 2026 · July – September
          </p>
          <p className="text-base md:text-lg text-zinc-700 leading-relaxed">
            A data-driven analysis of {data?.stats.total_sales.toLocaleString()}{" "}
            registered Dubai property sales from Q3 2026, based on official
            Dubai Land Department transaction data.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {data && (
          <>
            {/* Executive Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-200 p-6 md:p-8 mb-10">
              <h2 className="text-lg font-semibold text-blue-900 mb-4">
                Executive Summary
              </h2>
              <ul className="space-y-3 text-sm md:text-base text-zinc-800 leading-relaxed">
                <li>
                  <strong>Total sales:</strong>{" "}
                  {data.stats.total_sales.toLocaleString()} registered
                  transactions across {data.stats.areas_count} Dubai areas.
                </li>
                <li>
                  <strong>Total volume:</strong> AED{" "}
                  {formatCompact(data.stats.total_volume)} in registered
                  property value.
                </li>
                <li>
                  <strong>Median sale price:</strong> AED{" "}
                  {formatAED(data.stats.median_price)} (
                  {formatAED(data.stats.median_aed_sqft)} per sqft).
                </li>
                <li>
                  <strong>Off-plan dominance:</strong> {offplanPct}% of Q3
                  transactions were off-plan properties.
                </li>
                <li>
                  <strong>Most active area:</strong>{" "}
                  {data.top_areas[0]
                    ? displayName(data.top_areas[0].area_name)
                    : "N/A"}{" "}
                  with{" "}
                  {data.top_areas[0]
                    ? data.top_areas[0].sale_count.toLocaleString()
                    : 0}{" "}
                  transactions.
                </li>
              </ul>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-200">
                <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">
                  Total Sales
                </div>
                <div className="text-2xl font-bold text-zinc-900">
                  {data.stats.total_sales.toLocaleString()}
                </div>
              </div>
              <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-200">
                <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">
                  Volume
                </div>
                <div className="text-2xl font-bold text-zinc-900">
                  AED {formatCompact(data.stats.total_volume)}
                </div>
              </div>
              <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-200">
                <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">
                  Median Price
                </div>
                <div className="text-2xl font-bold text-zinc-900">
                  AED {formatCompact(data.stats.median_price)}
                </div>
              </div>
              <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-200">
                <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">
                  AED / sqft
                </div>
                <div className="text-2xl font-bold text-zinc-900">
                  {formatAED(data.stats.median_aed_sqft)}
                </div>
              </div>
            </div>

            {/* Monthly Trend */}
            {data.monthly_trend.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xl md:text-2xl font-bold text-zinc-900 mb-4">
                  Monthly Sales Trend
                </h2>
                <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                  <RentsChart data={data.monthly_trend as any} />
                </div>
                <p className="text-xs text-zinc-500 mt-3">
                  Bars show contract count, green line shows total volume (AED
                  millions).
                </p>
              </div>
            )}

            {/* Top Areas */}
            <div className="mb-10">
              <h2 className="text-xl md:text-2xl font-bold text-zinc-900 mb-4">
                Top 20 Areas by Q3 Sales Activity
              </h2>
              <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-zinc-50 border-b border-zinc-200">
                      <tr>
                        <th className="text-left px-4 md:px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">
                          #
                        </th>
                        <th className="text-left px-4 md:px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">
                          Area
                        </th>
                        <th className="text-right px-4 md:px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">
                          Sales
                        </th>
                        <th className="text-right px-4 md:px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">
                          Median
                        </th>
                        <th className="text-right px-4 md:px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">
                          AED/sqft
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {data.top_areas.map((area, i) => (
                        <tr key={area.area_name} className="hover:bg-zinc-50">
                          <td className="px-4 md:px-6 py-3 text-xs text-zinc-500">
                            {i + 1}
                          </td>
                          <td className="px-4 md:px-6 py-3">
                            <Link
                              href={`/areas/${slugify(area.area_name)}`}
                              className="font-medium text-zinc-900 hover:text-blue-600 transition text-sm"
                            >
                              {displayName(area.area_name)}
                            </Link>
                          </td>
                          <td className="px-4 md:px-6 py-3 text-right text-sm text-zinc-700">
                            {area.sale_count.toLocaleString()}
                          </td>
                          <td className="px-4 md:px-6 py-3 text-right font-semibold text-zinc-900 text-sm">
                            AED {formatCompact(area.median_price_aed)}
                          </td>
                          <td className="px-4 md:px-6 py-3 text-right text-sm text-zinc-700">
                            {formatAED(area.median_aed_sqft)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Off-plan Split */}
            {data.offplan_split.length >= 2 && (
              <div className="mb-10">
                <h2 className="text-xl md:text-2xl font-bold text-zinc-900 mb-4">
                  Off-Plan vs Ready Properties
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.offplan_split.map((row) => {
                    const pct = Math.round(
                      (row.sale_count / offplanTotal) * 100
                    );
                    const isOff = row.is_offplan === "Off-Plan";
                    return (
                      <div
                        key={row.is_offplan}
                        className={`rounded-2xl p-6 border ${
                          isOff
                            ? "bg-amber-50 border-amber-200"
                            : "bg-emerald-50 border-emerald-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span
                            className={`text-base font-semibold ${
                              isOff ? "text-amber-900" : "text-emerald-900"
                            }`}
                          >
                            {row.is_offplan}
                          </span>
                          <span
                            className={`text-2xl font-bold ${
                              isOff ? "text-amber-700" : "text-emerald-700"
                            }`}
                          >
                            {pct}%
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-zinc-600">Sales</span>
                            <span className="font-medium text-zinc-900">
                              {row.sale_count.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-600">Median price</span>
                            <span className="font-medium text-zinc-900">
                              AED {formatCompact(row.median_price_aed)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-600">AED / sqft</span>
                            <span className="font-medium text-zinc-900">
                              {formatAED(row.median_aed_sqft)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Methodology */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 md:p-8 mb-10">
              <h2 className="text-lg font-semibold text-zinc-900 mb-3">
                Methodology
              </h2>
              <ul className="space-y-2 text-sm text-zinc-700">
                <li>
                  <strong>Source:</strong> Dubai Land Department Transactions
                  dataset.
                </li>
                <li>
                  <strong>Period:</strong> {data.period}
                </li>
                <li>
                  <strong>Included:</strong> Registered sales only (excludes
                  mortgages and gifts).
                </li>
                <li>
                  <strong>Excluded:</strong> Records with zero or negative
                  amount, or missing property size.
                </li>
                <li>
                  <strong>Calculation:</strong> Median (not mean) used for
                  price benchmarks because real estate prices are
                  right-skewed.
                </li>
              </ul>
              <p className="text-sm text-zinc-600 mt-4">
                This report is for market research. It is not investment
                advice. Verify all data independently before making decisions.
              </p>
            </div>

            {/* CTA */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 md:p-8 text-center">
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                Explore areas or check a property
              </h3>
              <p className="text-zinc-600 mb-5 text-sm">
                Dive into any area&apos;s market data or verify an asking price
                against real DLD transactions.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/areas"
                  className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition text-sm"
                >
                  Explore 200+ Areas
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-900 font-semibold px-6 py-3 rounded-lg transition text-sm"
                >
                  Run a Reality Check
                </Link>
              </div>
            </div>

            <div className="mt-8 text-xs text-zinc-500 text-center">
              © 2026 Dubai Property Intelligence · Data from Dubai Land
              Department · Not investment advice
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
