import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CompareClient from "@/components/CompareClient";
import { compareAreas, compareMonthly } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Compare Dubai Areas - Prices, Trends & Activity",
  description:
    "Compare up to 6 Dubai areas side by side: median prices, AED/sqft, transaction activity, and monthly trends from DLD data.",
  openGraph: {
    type: "website",
    url: "https://dubai-property-intelligence-apps.vercel.app/compare",
    title: "Compare Dubai Areas — Prices & Trends | DPI",
    description:
      "Side-by-side comparison of Dubai areas from official DLD transaction data.",
  },
};

const DEFAULT_AREAS = ["DUBAI MARINA", "JUMEIRAH VILLAGE CIRCLE", "BUSINESS BAY"];

function displayName(name: string): string {
  return name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatAED(value: number | null): string {
  if (value == null) return "-";
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

export default async function ComparePage() {
  const [compareRes, monthlyRes] = await Promise.all([
    compareAreas(DEFAULT_AREAS).catch(() => ({
      data: [],
      missing: [],
      count: 0,
      source: { name: "DLD", dataset: "Transactions" },
    })),
    compareMonthly(DEFAULT_AREAS).catch(() => ({ data: [], count: 0 })),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="mb-8 md:mb-10">
          <h1 className="text-2xl md:text-4xl font-bold text-zinc-900 mb-3 tracking-tight">
            Compare Dubai Areas
          </h1>
          <p className="text-sm md:text-base text-zinc-600 max-w-3xl">
            Select 2 to 6 Dubai areas and see median prices, AED per square
            foot, and transaction activity side by side — using official Dubai
            Land Department data.
          </p>
        </div>

        {compareRes.data.length > 0 && (
          <div className="mb-6 md:mb-8 bg-white rounded-xl md:rounded-2xl border border-zinc-200 p-5 md:p-6">
            <h2 className="text-sm font-semibold text-zinc-900 mb-3">
              Default comparison — Dubai Marina vs JVC vs Business Bay
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {compareRes.data.slice(0, 3).map((area: any) => (
                <div key={area.area_name} className="border border-zinc-100 rounded-lg p-4">
                  <div className="font-semibold text-zinc-900 text-sm mb-2">
                    {displayName(area.area_name)}
                  </div>
                  <dl className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <dt className="text-zinc-500">Median price</dt>
                      <dd className="font-medium text-zinc-900">
                        AED {formatAED(area.median_price_aed)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-zinc-500">AED / sqft</dt>
                      <dd className="font-medium text-zinc-900">
                        {formatAED(area.median_aed_sqft)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-zinc-500">Transactions</dt>
                      <dd className="font-medium text-zinc-900">
                        {area.transaction_count.toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-zinc-500 mt-3">
              Source: Dubai Land Department · Sales only. Use the interactive
              selector below to change areas.
            </p>
          </div>
        )}

        <CompareClient
          initialAreas={DEFAULT_AREAS.map(displayName)}
          initialResult={compareRes.data as any}
          initialMonthly={monthlyRes.data as any}
        />
      </main>

      <Footer />
    </div>
  );
}
