import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RentalYieldCalculator from "@/components/RentalYieldCalculator";
import { getTopYieldAreas } from "@/lib/queries";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dubai Rental Yield Calculator — Real Market Data",
  description:
    "Calculate rental yield for any Dubai area using real registered transactions and rent contracts from the Dubai Land Department. Free, no registration.",
  openGraph: {
    type: "website",
    url: "https://dubai-property-intelligence-apps.vercel.app/calculators/rental-yield",
    title: "Dubai Rental Yield Calculator | DPI",
    description:
      "Real yields for 200+ Dubai areas based on official DLD data.",
  },
};

function displayName(name: string): string {
  return name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(Math.round(value));
}

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, "-");
}

export default async function RentalYieldPage() {
  let topYields: Awaited<ReturnType<typeof getTopYieldAreas>> = [];
  try {
    topYields = await getTopYieldAreas(10);
  } catch {
    topYields = [];
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="mb-8 md:mb-10 max-w-3xl">
          <h1 className="text-2xl md:text-4xl font-bold text-zinc-900 mb-3 tracking-tight">
            Dubai Rental Yield Calculator
          </h1>
          <p className="text-sm md:text-base text-zinc-600">
            Calculate gross rental yield for any Dubai area using{" "}
            <strong>real registered transactions and rent contracts</strong>{" "}
            from the Dubai Land Department — 857,000+ rental records across 200+
            areas.
          </p>
        </div>

        <RentalYieldCalculator />

        {/* Top yield areas */}
        {topYields.length > 0 && (
          <section className="mt-12 md:mt-16">
            <div className="mb-5">
              <h2 className="text-xl md:text-2xl font-bold text-zinc-900 tracking-tight">
                Highest rental yields in Dubai
              </h2>
              <p className="text-sm text-zinc-500 mt-1">
                Top 10 areas by gross yield (residential only, outliers removed)
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-50 border-b border-zinc-200">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">
                        Area
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">
                        Median Sale
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">
                        Median Rent
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">
                        Yield
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {topYields.map((row) => (
                      <tr key={row.area_name} className="hover:bg-zinc-50">
                        <td className="px-6 py-4">
                          <Link
                            href={`/areas/${slugify(row.area_name)}`}
                            className="font-medium text-zinc-900 hover:text-blue-600 transition"
                          >
                            {displayName(row.area_name)}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-zinc-700">
                          AED {formatCompact(Number(row.median_sale_price))}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-zinc-700">
                          AED {formatCompact(Number(row.median_annual_rent))}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-semibold text-emerald-600">
                            {row.gross_yield_pct}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        <div className="mt-8 text-xs text-zinc-500 text-center">
          Source: Dubai Land Department — Transactions + Rents dataset. Sales
          only. Residential only. Not investment advice.
        </div>
      </main>

      <Footer />
    </div>
  );
}
