import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MonthlyChart from "@/components/MonthlyChart";
import {
  getAreaDetail,
  getAreaMonthly,
  getAreaBedroomSplit,
  getAreaOffPlanSplit,
  getRelatedAreas,
  getAreaRentSummary,
  getAreaRentTrend,
} from "@/lib/queries";
import { getDisplayNameWithAlias } from "@/lib/aliases";
import { DATA_STATS } from "@/lib/constants";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function slugToAreaName(slug: string): string {
  return slug.replace(/-/g, " ").toUpperCase();
}

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, "-");
}

function formatAED(value: number | null | undefined): string {
  if (value == null) return "-";
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

function formatCompact(value: number | null | undefined): string {
  if (value == null) return "-";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(Math.round(value));
}

function displayName(name: string): string {
  return name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const displayNameFull = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const url = `https://dubai-property-intelligence-apps.vercel.app/areas/${slug}`;

  return {
    title: `${displayNameFull} Property Prices & Market Data`,
    description: `Median property prices, AED/sqft, and transaction data for ${displayNameFull}, Dubai. Based on official Dubai Land Department transactions.`,
    openGraph: {
      type: "article",
      url,
      title: `${displayNameFull} Property Prices | DPI`,
      description: `Market data for ${displayNameFull} — median prices, AED/sqft, and transaction trends from DLD.`,
    },
  };
}

export default async function AreaDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const areaName = slugToAreaName(slug);
  const nameInfo = getDisplayNameWithAlias(areaName);

  let detail;
  let monthly: any[] = [];
  let bedrooms: any[] = [];
  let offplan: any[] = [];
  let related: any[] = [];
  let rentData: any[] = [];
  let rentTrend: any[] = [];

  try {
    detail = await getAreaDetail(areaName);
  } catch {
    notFound();
  }

  // Fetch optional data in parallel
  const [
    monthlyRes,
    bedroomsRes,
    offplanRes,
    relatedRes,
    rentRes,
    rentTrendRes,
  ] = await Promise.allSettled([
    getAreaMonthly(areaName),
    getAreaBedroomSplit(areaName),
    getAreaOffPlanSplit(areaName),
    getRelatedAreas(areaName, 5),
    getAreaRentSummary(areaName),
    getAreaRentTrend(areaName),
  ]);

  if (monthlyRes.status === "fulfilled") monthly = monthlyRes.value.data;
  if (bedroomsRes.status === "fulfilled") bedrooms = bedroomsRes.value;
  if (offplanRes.status === "fulfilled") offplan = offplanRes.value;
  if (relatedRes.status === "fulfilled") related = relatedRes.value;
  if (rentRes.status === "fulfilled") rentData = rentRes.value;
  if (rentTrendRes.status === "fulfilled") rentTrend = rentTrendRes.value;

  const primary =
    detail.data.find((d: any) => d.property_type === "Unit") || detail.data[0];

  // Calculate off-plan percentages
  const offplanTotal = offplan.reduce((sum, r) => sum + r.transaction_count, 0);
  const offplanPct = offplanTotal
    ? Math.round((offplan[0]?.transaction_count / offplanTotal) * 100)
    : 0;

  // Calculate bedroom total for percentage
  const bedroomTotal = bedrooms.reduce((sum, r) => sum + r.transaction_count, 0);
  const topBedroom = bedrooms[0];

  // Rent total
  const rentTotal = rentData.reduce((sum: number, r: any) => sum + r.rent_count, 0);

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12">
        {/* Breadcrumb */}
        <nav className="text-xs md:text-sm text-zinc-500 mb-5 md:mb-6 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-zinc-900">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/areas" className="hover:text-zinc-900">
            Areas
          </Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-900">{nameInfo.primary}</span>
        </nav>

        {/* Title */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-zinc-900 mb-2 md:mb-3 tracking-tight">
            {nameInfo.primary} Property Prices
          </h1>
          {nameInfo.alias && (
            <p className="text-xs md:text-sm text-zinc-500 mb-2">
              Also known as {nameInfo.alias} (DLD name)
            </p>
          )}
          <p className="text-sm md:text-base text-zinc-600 max-w-3xl">
            Registered transaction data for {nameInfo.primary} from the Dubai
            Land Department.
          </p>
        </div>

        {/* ============================================ */}
        {/* KEY FACTS — GEO optimized quotable block    */}
        {/* ============================================ */}
        {primary && (
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl md:rounded-2xl border border-blue-200 p-5 md:p-8 mb-6 md:mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <h2 className="text-sm font-semibold text-blue-900 uppercase tracking-wide">
                Key Facts
              </h2>
            </div>
            <ul className="space-y-2 md:space-y-3 text-sm md:text-base text-zinc-800 leading-relaxed">
              <li>
                <strong>{nameInfo.primary}&apos;s median sale price</strong> was{" "}
                <strong>AED {formatAED(primary.median_price_aed)}</strong> from{" "}
                {primary.first_transaction} to {primary.last_transaction} (
                {primary.transaction_count.toLocaleString()} registered DLD
                sales).
              </li>
              <li>
                <strong>Median price per square foot:</strong> AED{" "}
                {formatAED(primary.median_aed_sqft)}.
              </li>
              {rentData.length > 0 && (
                <li>
                  <strong>Median annual rent:</strong> AED{" "}
                  {formatAED(
                    rentData.find((r: any) => r.property_sub_type === "Flat")
                      ?.median_annual_rent || rentData[0]?.median_annual_rent
                  )}
                  {" "}
                  (from {rentTotal.toLocaleString()} registered contracts).
                </li>
              )}
              {topBedroom && (
                <li>
                  <strong>Most active configuration:</strong> {topBedroom.rooms}{" "}
                  —{" "}
                  {Math.round((topBedroom.transaction_count / bedroomTotal) * 100)}
                  % of sales.
                </li>
              )}
              {offplan.length >= 2 && (
                <li>
                  <strong>Off-plan vs Ready:</strong> {offplanPct}% off-plan,{" "}
                  {100 - offplanPct}% ready properties.
                </li>
              )}
              <li>
                <strong>Market data coverage:</strong> {primary.data_coverage}.
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t border-blue-200 text-xs text-blue-800">
              Source: Dubai Land Department Transactions + Rents datasets ·
              Sales and Residential rents only
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* Market Summary (KPI grid)                    */}
        {/* ============================================ */}
        {primary && (
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-zinc-200 p-4 md:p-8 mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 md:mb-6">
              <h2 className="text-base md:text-lg font-semibold text-zinc-900">
                Sales Market Summary
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
                  {formatCompact(primary.p25_price_aed)} -{" "}
                  {formatCompact(primary.p75_price_aed)}
                </div>
              </div>
            </div>

            <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-zinc-100 text-[11px] md:text-xs text-zinc-500">
              <strong>Period:</strong> {primary.first_transaction} to{" "}
              {primary.last_transaction} · <strong>Source:</strong>{" "}
              {detail.source.name}
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* Monthly Chart                                */}
        {/* ============================================ */}
        {monthly.length > 1 && (
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-8 border border-zinc-200 mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-4 md:mb-6">
              <div>
                <h2 className="text-base md:text-lg font-semibold text-zinc-900">
                  Monthly Sales Activity
                </h2>
                <p className="text-[11px] md:text-xs text-zinc-500 mt-1">
                  Transaction count (bars) and total volume in AED millions
                  (line)
                </p>
              </div>
              <span className="text-[10px] md:text-xs text-zinc-500">
                {monthly.length} months
              </span>
            </div>
            <MonthlyChart data={monthly} />
          </div>
        )}

        {/* ============================================ */}
        {/* Rental Market Section                        */}
        {/* ============================================ */}
        {rentData.length > 0 && (
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-zinc-200 overflow-hidden mb-6 md:mb-8">
            <div className="px-4 md:px-6 py-4 border-b border-zinc-100">
              <h2 className="text-base md:text-lg font-semibold text-zinc-900">
                Rental Market
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Median annual rents from {rentTotal.toLocaleString()} registered
                contracts
              </p>
            </div>

            <div className="divide-y divide-zinc-100">
              {rentData.map((row: any) => (
                <div key={row.property_sub_type} className="p-4 md:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-zinc-900 text-sm">
                      {row.property_sub_type}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {row.rent_count.toLocaleString()} contracts
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-[10px] uppercase text-zinc-400 mb-1">
                        Median Rent
                      </div>
                      <div className="text-base md:text-lg font-bold text-zinc-900">
                        AED {formatAED(row.median_annual_rent)}
                      </div>
                      <div className="text-[10px] text-zinc-400">per year</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-zinc-400 mb-1">
                        25th – 75th
                      </div>
                      <div className="text-xs md:text-sm font-medium text-zinc-700">
                        {formatCompact(row.p25_annual_rent)} –{" "}
                        {formatCompact(row.p75_annual_rent)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-zinc-400 mb-1">
                        Rent / sqft
                      </div>
                      <div className="text-sm md:text-base font-semibold text-zinc-900">
                        {formatAED(row.median_rent_sqft)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-zinc-400 mb-1">
                        Est. Gross Yield
                      </div>
                      <div className="text-sm md:text-base font-semibold text-emerald-600">
                        {primary && primary.median_price_aed
                          ? `${(
                              (Number(row.median_annual_rent) /
                                Number(primary.median_price_aed)) *
                              100
                            ).toFixed(2)}%`
                          : "-"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 md:px-6 py-3 bg-zinc-50 border-t border-zinc-100 text-[11px] text-zinc-500">
              Yield estimate uses median sale price for{" "}
              {primary?.property_type || "Unit"}. For interactive calculation,
              use the{" "}
              <Link
                href="/calculators/rental-yield"
                className="text-blue-600 hover:underline"
              >
                Rental Yield Calculator
              </Link>
              .
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* Bedroom Split                                */}
        {/* ============================================ */}
        {bedrooms.length > 0 && (
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-zinc-200 overflow-hidden mb-6 md:mb-8">
            <div className="px-4 md:px-6 py-4 border-b border-zinc-100">
              <h2 className="text-base md:text-lg font-semibold text-zinc-900">
                Sales by Bedroom Type
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Breakdown of transactions and median prices by configuration
              </p>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-zinc-100">
              {bedrooms.map((row) => {
                const pct = Math.round(
                  (row.transaction_count / bedroomTotal) * 100
                );
                return (
                  <div key={row.rooms} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-zinc-900 text-sm">
                        {row.rooms}
                      </span>
                      <span className="text-xs font-medium text-zinc-500">
                        {pct}% of sales
                      </span>
                    </div>
                    <div className="h-1.5 bg-zinc-100 rounded-full mb-3 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <div className="text-[10px] uppercase text-zinc-400">
                          Sales
                        </div>
                        <div className="text-xs font-medium text-zinc-700">
                          {row.transaction_count.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-zinc-400">
                          Median
                        </div>
                        <div className="text-xs font-semibold text-zinc-900">
                          {formatCompact(row.median_price_aed)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-zinc-400">
                          AED/sqft
                        </div>
                        <div className="text-xs font-medium text-zinc-700">
                          {formatAED(row.median_aed_sqft)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">
                      Configuration
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">
                      Transactions
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">
                      % of Sales
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">
                      Median Price
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">
                      AED / sqft
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {bedrooms.map((row) => {
                    const pct = Math.round(
                      (row.transaction_count / bedroomTotal) * 100
                    );
                    return (
                      <tr key={row.rooms} className="hover:bg-zinc-50">
                        <td className="px-6 py-4 font-medium text-zinc-900">
                          {row.rooms}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-zinc-700">
                          {row.transaction_count.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <div className="w-24 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-zinc-600 w-10 text-right">
                              {pct}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-zinc-900">
                          AED {formatCompact(row.median_price_aed)}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-zinc-700">
                          {formatAED(row.median_aed_sqft)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* Off-Plan vs Ready Split                      */}
        {/* ============================================ */}
        {offplan.length >= 2 && (
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-zinc-200 p-5 md:p-8 mb-6 md:mb-8">
            <h2 className="text-base md:text-lg font-semibold text-zinc-900 mb-1">
              Off-Plan vs Ready Properties
            </h2>
            <p className="text-xs text-zinc-500 mb-6">
              Market split by delivery status
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offplan.map((row) => {
                const pct = Math.round(
                  (row.transaction_count / offplanTotal) * 100
                );
                const isOffplan = row.is_offplan === "Off-Plan";
                return (
                  <div
                    key={row.is_offplan}
                    className={`rounded-xl p-5 border ${
                      isOffplan
                        ? "bg-amber-50 border-amber-200"
                        : "bg-emerald-50 border-emerald-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-sm font-semibold ${
                          isOffplan ? "text-amber-900" : "text-emerald-900"
                        }`}
                      >
                        {row.is_offplan}
                      </span>
                      <span
                        className={`text-lg font-bold ${
                          isOffplan ? "text-amber-700" : "text-emerald-700"
                        }`}
                      >
                        {pct}%
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-zinc-600">Transactions</span>
                        <span className="font-medium text-zinc-900">
                          {row.transaction_count.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-600">Median price</span>
                        <span className="font-medium text-zinc-900">
                          AED {formatCompact(row.median_price_aed)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-600">Median AED/sqft</span>
                        <span className="font-medium text-zinc-900">
                          {formatAED(row.median_aed_sqft)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 text-[11px] md:text-xs text-zinc-500 leading-relaxed">
              <strong>Note:</strong> Off-plan properties are sold before
              completion and often have different price dynamics than ready
              properties. Compare them carefully.
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* All Property Types                           */}
        {/* ============================================ */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-zinc-200 overflow-hidden mb-6 md:mb-8">
          <div className="px-4 md:px-6 py-4 border-b border-zinc-100">
            <h2 className="text-base md:text-lg font-semibold text-zinc-900">
              All Property Types
            </h2>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-zinc-100">
            {detail.data.map((row: any) => (
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
                    <div className="text-[10px] uppercase text-zinc-400">
                      Sales
                    </div>
                    <div className="text-xs font-medium text-zinc-700">
                      {row.transaction_count.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-zinc-400">
                      Median
                    </div>
                    <div className="text-xs font-semibold text-zinc-900">
                      {formatAED(row.median_price_aed)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-zinc-400">
                      AED/sqft
                    </div>
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
                  <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">
                    Type
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">
                    Transactions
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">
                    Median Price
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">
                    AED / sqft
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">
                    Coverage
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {detail.data.map((row: any) => (
                  <tr key={row.property_type} className="hover:bg-zinc-50">
                    <td className="px-6 py-4 font-medium text-zinc-900">
                      {row.property_type}
                    </td>
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

        {/* ============================================ */}
        {/* FAQ Section — GEO optimized                  */}
        {/* ============================================ */}
        {primary && (
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-zinc-200 p-5 md:p-8 mb-6 md:mb-8">
            <h2 className="text-base md:text-lg font-semibold text-zinc-900 mb-6">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-zinc-900 text-sm md:text-base mb-2">
                  What is the median property price in {nameInfo.primary}?
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  The median sale price in {nameInfo.primary} was AED{" "}
                  {formatAED(primary.median_price_aed)} based on{" "}
                  {primary.transaction_count.toLocaleString()} registered sales
                  from {primary.first_transaction} to{" "}
                  {primary.last_transaction}.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-zinc-900 text-sm md:text-base mb-2">
                  What is the price per square foot in {nameInfo.primary}?
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  The median price per square foot in {nameInfo.primary} is AED{" "}
                  {formatAED(primary.median_aed_sqft)} based on registered DLD
                  transactions.
                </p>
              </div>

              {rentData.length > 0 && (
                <div>
                  <h3 className="font-semibold text-zinc-900 text-sm md:text-base mb-2">
                    What is the median annual rent in {nameInfo.primary}?
                  </h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    The median annual rent in {nameInfo.primary} for flats is
                    AED{" "}
                    {formatAED(
                      rentData.find(
                        (r: any) => r.property_sub_type === "Flat"
                      )?.median_annual_rent || rentData[0]?.median_annual_rent
                    )}
                    , based on {rentTotal.toLocaleString()} registered rental
                    contracts.
                  </p>
                </div>
              )}

              {primary && rentData.length > 0 && (
                <div>
                  <h3 className="font-semibold text-zinc-900 text-sm md:text-base mb-2">
                    What is the typical rental yield in {nameInfo.primary}?
                  </h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    Based on median sale price and median rent, the estimated
                    gross rental yield in {nameInfo.primary} is approximately{" "}
                    {(
                      (Number(
                        rentData.find(
                          (r: any) => r.property_sub_type === "Flat"
                        )?.median_annual_rent || rentData[0]?.median_annual_rent
                      ) /
                        Number(primary.median_price_aed)) *
                      100
                    ).toFixed(2)}
                    %.
                  </p>
                </div>
              )}

              {topBedroom && (
                <div>
                  <h3 className="font-semibold text-zinc-900 text-sm md:text-base mb-2">
                    What is the most common property type in {nameInfo.primary}?
                  </h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    The most active configuration in {nameInfo.primary} is{" "}
                    {topBedroom.rooms}, accounting for{" "}
                    {Math.round(
                      (topBedroom.transaction_count / bedroomTotal) * 100
                    )}
                    % of transactions. The median price for {topBedroom.rooms}{" "}
                    is AED {formatAED(topBedroom.median_price_aed)}.
                  </p>
                </div>
              )}

              {offplan.length >= 2 && (
                <div>
                  <h3 className="font-semibold text-zinc-900 text-sm md:text-base mb-2">
                    Is {nameInfo.primary} mostly off-plan or ready properties?
                  </h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    {offplanPct}% of transactions in {nameInfo.primary} are
                    off-plan properties, while {100 - offplanPct}% are ready
                    properties.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* Related Areas                                */}
        {/* ============================================ */}
        {related.length > 0 && (
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-zinc-200 p-5 md:p-8 mb-6 md:mb-8">
            <h2 className="text-base md:text-lg font-semibold text-zinc-900 mb-1">
              Similar Areas
            </h2>
            <p className="text-xs text-zinc-500 mb-6">
              Areas with similar median prices to {nameInfo.primary}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {related.map((row) => (
                <Link
                  key={row.area_name}
                  href={`/areas/${slugify(row.area_name)}`}
                  className="group flex items-center justify-between p-4 rounded-xl border border-zinc-200 hover:border-blue-300 hover:bg-blue-50/30 transition"
                >
                  <div>
                    <div className="font-medium text-zinc-900 text-sm group-hover:text-blue-700 transition">
                      {displayName(row.area_name)}
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">
                      {row.transaction_count.toLocaleString()} sales
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-zinc-900">
                      AED {formatCompact(row.median_price_aed)}
                    </div>
                    <div className="text-[10px] text-zinc-400 group-hover:text-blue-500">
                      View →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* CTA                                          */}
        {/* ============================================ */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl md:rounded-2xl p-6 md:p-8 text-center">
          <h3 className="text-base md:text-lg font-semibold text-zinc-900 mb-2">
            Got a specific property in {nameInfo.primary}?
          </h3>
          <p className="text-zinc-600 mb-5 text-xs md:text-sm">
            Enter the asking price and compare it against{" "}
            {primary ? primary.transaction_count.toLocaleString() : "our"}{" "}
            comparable transactions.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 md:px-6 py-2.5 md:py-3 rounded-lg transition text-sm"
            >
              Run a Reality Check
            </Link>
            <Link
              href="/calculators/rental-yield"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-900 font-semibold px-5 md:px-6 py-2.5 md:py-3 rounded-lg transition text-sm"
            >
              Calculate Rental Yield
            </Link>
          </div>
        </div>

        <div className="mt-6 md:mt-8 text-[11px] md:text-xs text-zinc-500 text-center">
          Source: {detail.source.name} - Transactions + Rents datasets. Sales
          and residential rents only. Not investment advice.
        </div>
      </main>

      <Footer />
    </div>
  );
}
