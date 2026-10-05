import Link from "next/link";
import RealityCheckForm from "@/components/RealityCheckForm";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { listAreas, type AreaSummary } from "@/lib/api";

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
  let topAreas: AreaSummary[] = [];
  try {
    const data = await listAreas(5);
    topAreas = data.data;
  } catch {
    topAreas = [];
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      <Header />

      <main className="max-w-7xl mx-auto px-6 pt-12 pb-16 md:pt-16 md:pb-24">
        {/* Hero */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
            161,000+ transactions from Dubai Land Department
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-4 tracking-tight leading-tight">
            Dubai Property Intelligence,
            <br />
            <span className="text-blue-600">Without the Guesswork</span>
          </h1>
          <p className="text-base md:text-lg text-zinc-600 leading-relaxed">
            Check any Dubai property against real market data — transactions,
            prices per sqft, and comparable sales. No ads. No listings. Just data.
          </p>
        </div>

        {/* Reality Check Form */}
        <RealityCheckForm />

        {/* Top Areas */}
        {topAreas.length > 0 && (
          <div className="mt-20 max-w-6xl mx-auto">
            <div className="flex items-baseline justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
                  Most active Dubai areas
                </h2>
                <p className="text-sm text-zinc-500 mt-1">
                  By transaction count in 2026
                </p>
              </div>
              <Link
                href="/areas"
                className="text-sm text-blue-600 hover:underline hidden md:inline"
              >
                View all 100+ areas →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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

            <div className="md:hidden mt-4 text-center">
              <Link
                href="/areas"
                className="text-sm text-blue-600 hover:underline"
              >
                View all 100+ areas →
              </Link>
            </div>
          </div>
        )}

        {/* Trust Signals */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-2xl font-bold text-zinc-900 mb-1">161,561</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wide">
              Transactions analyzed
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-zinc-900 mb-1">273</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wide">
              Dubai areas covered
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-zinc-900 mb-1">DLD</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wide">
              Official data source
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
