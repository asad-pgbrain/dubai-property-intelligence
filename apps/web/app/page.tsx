import { DATA_STATS } from "@/lib/constants";
import Link from "next/link";
import RealityCheckForm from "@/components/RealityCheckForm";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { listAreas } from "@/lib/queries";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dubai Property Intelligence — Market Data & Reality Check",
  description:
    "Check any Dubai property against real market data from the Dubai Land Department. 124,395 registered sales across 246 areas. Free, no ads, no broker money.",
  openGraph: {
    type: "website",
    url: "https://dubai-property-intelligence-apps.vercel.app",
    title: "Dubai Property Intelligence — Market Data & Reality Check",
    description:
      "Check any Dubai property against real market data from DLD. 124,395 registered sales.",
  },
};

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, "-");
}

function displayName(name: string): string {
  return name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatCompact(value: number | null): string {
  if (value == null) return "-";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(Math.round(value));
}

export default async function Home() {
  let topAreas: Array<{
  area_name: string;
  total_transactions: number;
  median_price_aed: number | null;
  median_aed_sqft: number | null;
  last_transaction: string | null;
}> = [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 pt-10 md:pt-16 pb-12 md:pb-16">
          <div className="text-center mb-10 md:mb-12 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full mb-5">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
              {DATA_STATS.totalSales.toLocaleString()} registered sales from Dubai Land Department
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-900 mb-4 tracking-tight leading-tight">
              Dubai Property Intelligence,
              <br />
              <span className="text-blue-600">Without the Guesswork</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-zinc-600 leading-relaxed">
              Check any Dubai property against real market data — transactions,
              prices per sqft, and comparable sales. No ads. No listings. Just data.
            </p>
          </div>

          <RealityCheckForm />
        </section>

        {/* Why DPI Section */}
        <section className="bg-white border-y border-zinc-200 py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center mb-10 md:mb-14 max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3 tracking-tight">
                Why Dubai Property Intelligence?
              </h2>
              <p className="text-sm md:text-base text-zinc-600">
                Built on official data, not marketing. Designed for research, not advertising.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
              <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-zinc-900 mb-2">Official DLD Data</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Registered transactions from the Dubai Land Department — the same data the government uses, not listings.
                </p>
              </div>

              <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-zinc-900 mb-2">Reality Check</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Compare any asking price against 161,000+ actual registered sales in seconds.
                </p>
              </div>

              <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-zinc-900 mb-2">Full Transparency</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Every number shows its source, time period, sample size, and data coverage. No black boxes.
                </p>
              </div>

              <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <h3 className="font-semibold text-zinc-900 mb-2">No Conflict of Interest</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  We don&apos;t sell listings. We don&apos;t take broker money. We just show you what the data says.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center mb-10 md:mb-14 max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3 tracking-tight">
                How It Works
              </h2>
              <p className="text-sm md:text-base text-zinc-600">
                Three steps to verify any Dubai property against real market data.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="font-semibold text-zinc-900 mb-2">Enter property details</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Area, property type, bedrooms, size, and asking price.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="font-semibold text-zinc-900 mb-2">We find comparable sales</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Our system searches 161,000+ DLD transactions for similar properties.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="font-semibold text-zinc-900 mb-2">See the market reality</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Market median, price range, and how the asking price compares.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Top Areas */}
        {topAreas.length > 0 && (
          <section className="bg-zinc-50 border-y border-zinc-200 py-12 md:py-20">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-6 md:mb-10">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">
                    Most active Dubai areas
                  </h2>
                  <p className="text-sm text-zinc-500 mt-1">
                    By transaction count in 2026
                  </p>
                </div>
                <Link
                  href="/areas"
                  className="text-sm text-blue-600 hover:underline"
                >
                  View all 100+ areas →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {topAreas.map((area, i) => (
                  <Link
                    key={area.area_name}
                    href={`/areas/${slugify(area.area_name)}`}
                    className="group bg-white rounded-2xl border border-zinc-200 p-5 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="w-6 h-6 flex items-center justify-center bg-zinc-100 group-hover:bg-blue-100 rounded text-xs font-semibold text-zinc-600 group-hover:text-blue-700 transition">
                        {i + 1}
                      </span>
                      <span className="text-xs text-zinc-400 group-hover:text-blue-500 transition">
                        →
                      </span>
                    </div>
                    <div className="font-semibold text-zinc-900 text-sm mb-3 line-clamp-2 min-h-[2.5rem] group-hover:text-blue-700 transition">
                      {displayName(area.area_name)}
                    </div>
                    <div className="space-y-1.5">
                      <div>
                        <div className="text-[10px] uppercase tracking-wide text-zinc-400">
                          Median
                        </div>
                        <div className="text-sm font-semibold text-zinc-900">
                          AED {formatCompact(area.median_price_aed)}
                        </div>
                      </div>
                      <div className="flex items-baseline justify-between pt-1 border-t border-zinc-100">
                        <div className="text-[10px] uppercase tracking-wide text-zinc-400">
                          Sales
                        </div>
                        <div className="text-xs font-medium text-zinc-600">
                          {area.total_transactions.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* What We Are / Are Not */}
        <section className="py-12 md:py-20">
          <div className="max-w-5xl mx-auto px-4 md:px-6">
            <div className="text-center mb-10 md:mb-14 max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3 tracking-tight">
                What We Are — and What We Are Not
              </h2>
              <p className="text-sm md:text-base text-zinc-600">
                We&apos;re a research tool. Not a marketplace.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* We Are */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 md:p-8">
                <h3 className="font-semibold text-blue-900 mb-5 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">
                    ✓
                  </span>
                  What We Are
                </h3>
                <ul className="space-y-3 text-sm text-blue-900">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Market intelligence platform</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Data-driven property research</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Neutral, source-attributed analytics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Completely free to use</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Built on official DLD data</span>
                  </li>
                </ul>
              </div>

              {/* We Are Not */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 md:p-8">
                <h3 className="font-semibold text-zinc-700 mb-5 flex items-center gap-2">
                  <span className="w-6 h-6 bg-zinc-400 text-white rounded-full flex items-center justify-center text-xs">
                    ✕
                  </span>
                  What We Are Not
                </h3>
                <ul className="space-y-3 text-sm text-zinc-600">
                  <li className="flex items-start gap-2">
                    <span className="text-zinc-400 mt-0.5">•</span>
                    <span>A property listing portal</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-zinc-400 mt-0.5">•</span>
                    <span>A broker or agent service</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-zinc-400 mt-0.5">•</span>
                    <span>Investment advice or recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-zinc-400 mt-0.5">•</span>
                    <span>Sponsored by developers or agents</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-zinc-400 mt-0.5">•</span>
                    <span>A place to buy or sell property</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Signals */}
        <section className="bg-zinc-50 border-t border-zinc-200 py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-zinc-900 mb-1">
  {DATA_STATS.totalSales.toLocaleString()}
</div>
<div className="text-xs text-zinc-500 uppercase tracking-wide">
  Registered sales analyzed
</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-zinc-900 mb-1">
                  273
                </div>
                <div className="text-xs text-zinc-500 uppercase tracking-wide">
                  Dubai areas covered
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-zinc-900 mb-1">
                  DLD
                </div>
                <div className="text-xs text-zinc-500 uppercase tracking-wide">
                  Official data source
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
