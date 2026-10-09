import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MonthlyChart from "@/components/MonthlyChart";
import {
  getAreaDetail,
  getBedroomSalesStats,
  getBedroomRentStats,
  getBedroomMonthlyTrend,
  getAvailableBedrooms,
  slugToBedroom,
} from "@/lib/queries";
import { getDisplayNameWithAlias } from "@/lib/aliases";

interface PageProps {
  params: Promise<{ slug: string; bedroom: string }>;
}

const BEDROOM_DISPLAY: Record<string, string> = {
  studio: "Studio",
  "1br": "1 Bedroom",
  "2br": "2 Bedroom",
  "3br": "3 Bedroom",
  "4br": "4 Bedroom",
  "5br": "5 Bedroom",
};

function slugToAreaName(slug: string): string {
  return slug.replace(/-/g, " ").toUpperCase();
}

function formatAED(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

function formatCompact(value: number | null | undefined): string {
  if (value == null) return "—";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(Math.round(value));
}

function displayName(name: string): string {
  return name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, bedroom } = await params;
  const areaDisplay = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const bedDisplay = BEDROOM_DISPLAY[bedroom.toLowerCase()] || bedroom.toUpperCase();
  const url = `https://dubai-property-intelligence-apps.vercel.app/areas/${slug}/${bedroom}`;

  return {
    title: `${areaDisplay} ${bedDisplay} Prices & Yields`,
    description: `Median prices, rental yields, and market trends for ${bedDisplay} apartments in ${areaDisplay}, Dubai. Based on official DLD transactions.`,
    openGraph: {
      type: "article",
      url,
      title: `${areaDisplay} ${bedDisplay} Prices | DPI`,
      description: `Market data for ${bedDisplay} apartments in ${areaDisplay} — median prices, yields, and trends from DLD.`,
    },
  };
}

export default async function BedroomPage({ params }: PageProps) {
  const { slug, bedroom } = await params;

  const rooms = slugToBedroom(bedroom);
  if (!rooms) notFound();

  const areaName = slugToAreaName(slug);
  const nameInfo = getDisplayNameWithAlias(areaName);
  const bedDisplay = BEDROOM_DISPLAY[bedroom.toLowerCase()] || bedroom.toUpperCase();

  // Fetch data
  let areaDetail;
  try {
    areaDetail = await getAreaDetail(areaName);
  } catch {
    notFound();
  }

  const [sales, rents, monthly, availableBedrooms] = await Promise.all([
    getBedroomSalesStats(areaName, rooms),
    getBedroomRentStats(areaName, rooms),
    getBedroomMonthlyTrend(areaName, rooms),
    getAvailableBedrooms(areaName),
  ]);

  if (!sales || sales.sale_count === 0) {
    notFound();
  }

  const grossYield =
    sales.median_price && rents?.median_annual_rent
      ? Math.round((rents.median_annual_rent / sales.median_price) * 10000) / 100
      : null;

  const otherBedrooms = availableBedrooms.filter((b) => b.slug !== bedroom);

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
          <Link href={`/areas/${slug}`} className="hover:text-zinc-900">
            {nameInfo.primary}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-900">{bedDisplay}</span>
        </nav>

        {/* Title */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-zinc-900 mb-2 md:mb-3 tracking-tight">
            {nameInfo.primary} {bedDisplay} Prices
          </h1>
          <p className="text-sm md:text-base text-zinc-600 max-w-3xl">
            Median prices, rental yields, and market data for {bedDisplay.toLowerCase()} apartments in {nameInfo.primary}, Dubai — based on official DLD transactions.
          </p>
        </div>

        {/* Key Facts */}
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl md:rounded-2xl border border-blue-200 p-5 md:p-8 mb-6 md:mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <h2 className="text-sm font-semibold text-blue-900 uppercase tracking-wide">
              Key Facts
            </h2>
          </div>
          <ul className="space-y-2 md:space-y-3 text-sm md:text-base text-zinc-800 leading-relaxed">
            <li>
              <strong>Median price for {bedDisplay.toLowerCase()} apartments in {nameInfo.primary}:</strong>{" "}
              <strong>AED {formatAED(sales.median_price)}</strong> based on {sales.sale_count.toLocaleString()} registered DLD sales.
            </li>
            <li>
              <strong>Median AED per square foot:</strong> {formatAED(sales.median_aed_sqft)}.
            </li>
            <li>
              <strong>Typical size:</strong> {sales.median_size_sqm} sqm ({Math.round(sales.median_size_sqm * 10.7639)} sqft).
            </li>
            {rents && rents.median_annual_rent && (
              <li>
                <strong>Median annual rent:</strong> AED {formatAED(rents.median_annual_rent)} (from {rents.rent_count.toLocaleString()} registered contracts).
              </li>
            )}
            {grossYield && (
              <li>
                <strong>Estimated gross rental yield:</strong> {grossYield}%.
              </li>
            )}
            <li>
              <strong>Price range (25th–75th percentile):</strong> AED {formatCompact(sales.p25_price)} – AED {formatCompact(sales.p75_price)}.
            </li>
          </ul>
          <div className="mt-4 pt-4 border-t border-blue-200 text-xs text-blue-800">
            Period: {sales.first_date} to {sales.last_date} · Source: Dubai Land Department
          </div>
        </div>

        {/* KPI Grid */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-zinc-200 p-4 md:p-8 mb-6 md:mb-8">
          <h2 className="text-base md:text-lg font-semibold text-zinc-900 mb-4 md:mb-6">
            Market Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div>
              <div className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-wide mb-1 md:mb-2">
                Median Price
              </div>
              <div className="text-base md:text-2xl font-bold text-zinc-900">
                AED {formatAED(sales.median_price)}
              </div>
            </div>
            <div>
              <div className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-wide mb-1 md:mb-2">
                AED / sqft
              </div>
              <div className="text-base md:text-2xl font-bold text-zinc-900">
                {formatAED(sales.median_aed_sqft)}
              </div>
            </div>
            <div>
              <div className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-wide mb-1 md:mb-2">
                Transactions
              </div>
              <div className="text-base md:text-2xl font-bold text-zinc-900">
                {sales.sale_count.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-wide mb-1 md:mb-2">
                Gross Yield
              </div>
              <div className="text-base md:text-2xl font-bold text-emerald-600">
                {grossYield ? `${grossYield}%` : "—"}
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Chart */}
        {monthly.length > 1 && (
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-8 border border-zinc-200 mb-6 md:mb-8">
            <div className="mb-4 md:mb-6">
              <h2 className="text-base md:text-lg font-semibold text-zinc-900">
                Monthly Sales Activity
              </h2>
              <p className="text-[11px] md:text-xs text-zinc-500 mt-1">
                {bedDisplay} apartment transactions per month
              </p>
            </div>
            <MonthlyChart data={monthly} />
          </div>
        )}

        {/* Rental Market */}
        {rents && rents.median_annual_rent && (
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-zinc-200 p-4 md:p-8 mb-6 md:mb-8">
            <h2 className="text-base md:text-lg font-semibold text-zinc-900 mb-4">
              Rental Market
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div>
                <div className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-wide mb-1 md:mb-2">
                  Median Annual Rent
                </div>
                <div className="text-base md:text-2xl font-bold text-zinc-900">
                  AED {formatAED(rents.median_annual_rent)}
                </div>
              </div>
              <div>
                <div className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-wide mb-1 md:mb-2">
                  25th – 75th
                </div>
                <div className="text-sm md:text-base font-semibold text-zinc-700">
                  {formatCompact(rents.p25_annual_rent)} – {formatCompact(rents.p75_annual_rent)}
                </div>
              </div>
              <div>
                <div className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-wide mb-1 md:mb-2">
                  Rent / sqft
                </div>
                <div className="text-base md:text-2xl font-bold text-zinc-900">
                  {formatAED(rents.median_rent_sqft)}
                </div>
              </div>
              <div>
                <div className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-wide mb-1 md:mb-2">
                  Contracts
                </div>
                <div className="text-base md:text-2xl font-bold text-zinc-900">
                  {rents.rent_count.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other Bedrooms */}
        {otherBedrooms.length > 0 && (
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-zinc-200 p-5 md:p-8 mb-6 md:mb-8">
            <h2 className="text-base md:text-lg font-semibold text-zinc-900 mb-1">
              Other Configurations in {nameInfo.primary}
            </h2>
            <p className="text-xs text-zinc-500 mb-5">
              Compare with other apartment types in this area
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {otherBedrooms.map((b) => (
                <Link
                  key={b.slug}
                  href={`/areas/${slug}/${b.slug}`}
                  className="group flex items-center justify-between p-4 rounded-xl border border-zinc-200 hover:border-blue-300 hover:bg-blue-50/30 transition"
                >
                  <div>
                    <div className="font-medium text-zinc-900 text-sm group-hover:text-blue-700 transition">
                      {BEDROOM_DISPLAY[b.slug] || b.rooms}
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">
                      {b.sale_count.toLocaleString()} sales
                    </div>
                  </div>
                  <span className="text-zinc-400 group-hover:text-blue-500">→</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* FAQ */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-zinc-200 p-5 md:p-8 mb-6 md:mb-8">
          <h2 className="text-base md:text-lg font-semibold text-zinc-900 mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-zinc-900 text-sm md:text-base mb-2">
                What is the median price for a {bedDisplay.toLowerCase()} apartment in {nameInfo.primary}?
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                The median sale price for {bedDisplay.toLowerCase()} apartments in {nameInfo.primary} was AED {formatAED(sales.median_price)} based on {sales.sale_count.toLocaleString()} registered sales from {sales.first_date} to {sales.last_date}.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 text-sm md:text-base mb-2">
                What is the typical size of a {bedDisplay.toLowerCase()} in {nameInfo.primary}?
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                The median size is {sales.median_size_sqm} sqm ({Math.round(sales.median_size_sqm * 10.7639)} sqft), ranging from {sales.min_size_sqm} to {sales.max_size_sqm} sqm based on registered transactions.
              </p>
            </div>
            {rents && rents.median_annual_rent && (
              <div>
                <h3 className="font-semibold text-zinc-900 text-sm md:text-base mb-2">
                  What is the median rent for a {bedDisplay.toLowerCase()} in {nameInfo.primary}?
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  The median annual rent is AED {formatAED(rents.median_annual_rent)}, based on {rents.rent_count.toLocaleString()} registered rental contracts.
                </p>
              </div>
            )}
            {grossYield && (
              <div>
                <h3 className="font-semibold text-zinc-900 text-sm md:text-base mb-2">
                  What is the rental yield for {bedDisplay.toLowerCase()} in {nameInfo.primary}?
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Based on median sale price and median rent, the estimated gross rental yield is approximately {grossYield}%. This is a gross estimate and does not include service charges or other expenses.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl md:rounded-2xl p-6 md:p-8 text-center">
          <h3 className="text-base md:text-lg font-semibold text-zinc-900 mb-2">
            Looking at a specific property in {nameInfo.primary}?
          </h3>
          <p className="text-zinc-600 mb-5 text-xs md:text-sm">
            Enter the asking price and compare it against {sales.sale_count.toLocaleString()} comparable transactions.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 md:px-6 py-2.5 md:py-3 rounded-lg transition text-sm"
            >
              Run a Reality Check
            </Link>
            <Link
              href={`/areas/${slug}`}
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-900 font-semibold px-5 md:px-6 py-2.5 md:py-3 rounded-lg transition text-sm"
            >
              View All {nameInfo.primary} Data
            </Link>
          </div>
        </div>

        <div className="mt-6 md:mt-8 text-[11px] md:text-xs text-zinc-500 text-center">
          Source: Dubai Land Department — Transactions + Rents datasets. Sales and residential rents only. Not investment advice.
        </div>
      </main>

      <Footer />
    </div>
  );
}
