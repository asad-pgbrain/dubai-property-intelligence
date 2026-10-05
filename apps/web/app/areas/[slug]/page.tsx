import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAreaDetail } from "@/lib/api";

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
  return {
    title: `${displayName} Property Prices & Market Data`,
    description: `Median property prices, AED/sqft, and transaction data for ${displayName}, Dubai. Based on official Dubai Land Department transactions.`,
  };
}

export default async function AreaDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const areaName = slugToAreaName(slug);
  const displayName = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  let detail;
  try {
    detail = await getAreaDetail(areaName);
  } catch {
    notFound();
  }

  const primary = detail.data.find((d) => d.property_type === "Unit") || detail.data[0];

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
            <Link href="/market" className="hover:text-zinc-900">Market</Link>
            <Link href="/areas" className="text-zinc-900 font-medium">Areas</Link>
            <Link href="/methodology" className="hover:text-zinc-900">Methodology</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <nav className="text-sm text-zinc-500 mb-6">
          <Link href="/" className="hover:text-zinc-900">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/areas" className="hover:text-zinc-900">Areas</Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-900">{displayName}</span>
        </nav>

        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-3 tracking-tight">
            {displayName} Property Prices
          </h1>
          <p className="text-zinc-600 max-w-3xl">
            Registered transaction data for {displayName} from the Dubai Land Department.
            Median prices, AED/sqft, and comparable market activity.
          </p>
        </div>

        {primary && (
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-zinc-900">Market Summary</h2>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Median Price</div>
                <div className="text-2xl font-bold text-zinc-900">
                  AED {formatAED(primary.median_price_aed)}
                </div>
              </div>
              <div>
                <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">AED / sqft</div>
                <div className="text-2xl font-bold text-zinc-900">
                  {formatAED(primary.median_aed_sqft)}
                </div>
              </div>
              <div>
                <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Transactions</div>
                <div className="text-2xl font-bold text-zinc-900">
                  {primary.transaction_count.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">25th - 75th</div>
                <div className="text-sm font-semibold text-zinc-700">
                  AED {formatAED(primary.p25_price_aed)} - {formatAED(primary.p75_price_aed)}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-zinc-100 text-xs text-zinc-500">
              <strong>Period:</strong> {primary.first_transaction} to {primary.last_transaction} · <strong>Source:</strong> {detail.source.name} - {detail.source.dataset}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-zinc-100">
            <h2 className="text-lg font-semibold text-zinc-900">All Property Types</h2>
          </div>
          <div className="overflow-x-auto">
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

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center">
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">
            Got a specific property in {displayName}?
          </h3>
          <p className="text-zinc-600 mb-5 text-sm">
            Enter the asking price and compare it against {primary ? primary.transaction_count.toLocaleString() : "our"} comparable transactions.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition"
          >
            Run a Reality Check
          </Link>
        </div>

        <div className="mt-8 text-xs text-zinc-500 text-center">
          Source: {detail.source.name} - {detail.source.dataset} dataset. Sales only. Not investment advice.
        </div>
      </main>
    </div>
  );
}
