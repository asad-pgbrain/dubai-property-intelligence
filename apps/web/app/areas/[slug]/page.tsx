import { getDisplayNameWithAlias } from "@/lib/aliases";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MonthlyChart from "@/components/MonthlyChart";
import { getAreaDetail, getAreaMonthly } from "@/lib/queries";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function slugToAreaName(slug: string): string {
  return slug.replace(/-/g, " ").toUpperCase();
}

function formatAED(value: number | null): string {
  if (value == null) return "-";
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const displayName = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const url = `https://dubai-property-intelligence-apps.vercel.app/areas/${slug}`;

  return {
    title: `${displayName} Property Prices & Market Data`,
    description: `Median property prices, AED/sqft, and transaction data for ${displayName}, Dubai. Based on official Dubai Land Department transactions.`,
    openGraph: {
      type: "article",
      url,
      title: `${displayName} Property Prices | DPI`,
      description: `Market data for ${displayName} — median prices, AED/sqft, and transaction trends from DLD.`,
    },
  };
}

export default async function AreaDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const areaName = slugToAreaName(slug);
  const displayName = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const nameInfo = getDisplayNameWithAlias(areaName);    // ← YE NAYI LINE

  let detail;
  let monthly: any[] = [];
  try {
    detail = await getAreaDetail(areaName);
  } catch {
    notFound();
  }

  try {
    const m = await getAreaMonthly(areaName);
    monthly = m.data;
  } catch {
    monthly = [];
  }

  const primary = detail.data.find((d) => d.property_type === "Unit") || detail.data[0];

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12">
        {/* Breadcrumb */}
        <nav className="text-xs md:text-sm text-zinc-500 mb-5 md:mb-6 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-zinc-900">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/areas" className="hover:text-zinc-900">Areas</Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-900">{displayName}</span>
        </nav>

        <div className="mb-6 md:mb-10">
          <h1 className="text-2xl md:text-4xl font-bold text-zinc-900 mb-2 md:mb-3 tracking-tight">
  {nameInfo.primary} Property Prices
</h1>
{nameInfo.alias && (
  <p className="text-xs md:text-sm text-zinc-500 mb-2">
    Also known as {nameInfo.alias} (DLD name)
  </p>
)}
<p className="text-sm md:text-base text-zinc-600 max-w-3xl">
  Registered transaction data for {nameInfo.primary} from the Dubai Land Department.
</p>
        </div>

        {/* Market Summary */}
        {primary && (
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-zinc-200 p-4 md:p-8 mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 md:mb-6">
              <h2 className="text-base md:text-lg font-semibold text-zinc-900">
                Market Summary
              </h2>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full self-start ${
                  primary.data_coverage === "High"
                    ? "bg-green-100 text-green-800"
                    : primary.data_coverage === "Medium"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {primary.data_coverage} coverage
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div>
                <div className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-wide mb-1 md:mb-2">
                  Median Price
                </div>
                <div className="text-base md:text-2xl font-bold text-zinc-900 break-words">
                  AED {formatAED(primary.median_price_aed)}
                </div>
              </div>
              <div>
                <div className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-wide mb-1 md:mb-2">
                  AED / sqft
                </div>
                <div className="text-base md:text-2xl font-bold text-zinc-900">
                  {formatAED(primary.median_aed_sqft)}
                </div>
              </div>
              <div>
                <div className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-wide mb-1 md:mb-2">
                  Transactions
                </div>
                <div className="text-base md:text-2xl font-bold text-zinc-900">
                  {primary.transaction_count.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-wide mb-1 md:mb-2">
                  25th - 75th
                </div>
                <div className="text-xs md:text-sm font-semibold text-zinc-700">
                  {formatAED(primary.p25_price_aed)} - {formatAED(primary.p75_price_aed)}
                </div>
              </div>
            </div>

            <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-zinc-100 text-[11px] md:text-xs text-zinc-500">
              <strong>Period:</strong> {primary.first_transaction} to {primary.last_transaction} · <strong>Source:</strong> {detail.source.name}
            </div>
          </div>
        )}

        {/* Monthly Chart */}
        {monthly.length > 1 && (
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-8 border border-zinc-200 mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-4 md:mb-6">
              <div>
                <h2 className="text-base md:text-lg font-semibold text-zinc-900">
                  Monthly Sales Activity
                </h2>
                <p className="text-[11px] md:text-xs text-zinc-500 mt-1">
                  Transaction count (bars) and total volume in AED millions (line)
                </p>
              </div>
              <span className="text-[10px] md:text-xs text-zinc-500">
                {monthly.length} months
              </span>
            </div>
            <MonthlyChart data={monthly} />
          </div>
        )}

        {/* Property Types — Mobile cards + Desktop table */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-zinc-200 overflow-hidden mb-6 md:mb-8">
          <div className="px-4 md:px-6 py-4 border-b border-zinc-100">
            <h2 className="text-base md:text-lg font-semibold text-zinc-900">
              All Property Types
            </h2>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-zinc-100">
            {detail.data.map((row) => (
              <div key={row.property_type} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-zinc-900 text-sm">
                    {row.property_type}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      row.data_coverage === "High"
                        ? "bg-green-100 text-green-800"
                        : row.data_coverage === "Medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {row.data_coverage}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <div className="text-[10px] uppercase text-zinc-400">Sales</div>
                    <div className="text-xs font-medium text-zinc-700">
                      {row.transaction_count.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-zinc-400">Median</div>
                    <div className="text-xs font-semibold text-zinc-900">
                      {formatAED(row.median_price_aed)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-zinc-400">AED/sqft</div>
                    <div className="text-xs font-medium text-zinc-700">
                      {formatAED(row.median_aed_sqft)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">Type</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">Transactions</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">Median Price</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">AED / sqft</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">Coverage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {detail.data.map((row) => (
                  <tr key={row.property_type} className="hover:bg-zinc-50">
                    <td className="px-6 py-4 font-medium text-zinc-900">{row.property_type}</td>
                    <td className="px-6 py-4 text-right text-sm text-zinc-700">
                      {row.transaction_count.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-zinc-900">
                      AED {formatAED(row.median_price_aed)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-zinc-700">
                      {formatAED(row.median_aed_sqft)}
                    </td>
                    <td className="px-6 py-4 text-right text-xs">
                      <span
                        className={`px-2 py-0.5 rounded-full ${
                          row.data_coverage === "High"
                            ? "bg-green-100 text-green-800"
                            : row.data_coverage === "Medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {row.data_coverage}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl md:rounded-2xl p-6 md:p-8 text-center">
          <h3 className="text-base md:text-lg font-semibold text-zinc-900 mb-2">
            Got a specific property in {displayName}?
          </h3>
          <p className="text-zinc-600 mb-5 text-xs md:text-sm">
            Enter the asking price and compare it against {primary ? primary.transaction_count.toLocaleString() : "our"} comparable transactions.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 md:px-6 py-2.5 md:py-3 rounded-lg transition text-sm"
          >
            Run a Reality Check
          </Link>
        </div>

        <div className="mt-6 md:mt-8 text-[11px] md:text-xs text-zinc-500 text-center">
          Source: {detail.source.name} - {detail.source.dataset} dataset. Sales only. Not investment advice.
        </div>
      </main>

      <Footer />
    </div>
  );
}
