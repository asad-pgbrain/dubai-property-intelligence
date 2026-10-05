"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { compareAreas, searchAreas, type CompareAreaRow, type AreaSearchRow } from "@/lib/api";

function formatAED(value: number | null): string {
  if (value == null) return "-";
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

function formatCompact(value: number | null): string {
  if (value == null) return "-";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(Math.round(value));
}

const DEFAULT_AREAS = ["Dubai Marina", "Jumeirah Village Circle", "Business Bay"];

export default function CompareClient() {
  const [selected, setSelected] = useState<string[]>(DEFAULT_AREAS);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AreaSearchRow[]>([]);
  const [result, setResult] = useState<CompareAreaRow[] | null>(null);
  const [missing, setMissing] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch comparison
  useEffect(() => {
    if (selected.length < 2) {
      setResult(null);
      return;
    }
    setLoading(true);
    setError(null);
    compareAreas(selected)
      .then((res) => {
        setResult(res.data);
        setMissing(res.missing);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, [selected]);

  // Search areas
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(() => {
      searchAreas(searchQuery, 15)
        .then((res) => setSearchResults(res.data))
        .catch(() => setSearchResults([]));
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  function addArea(name: string) {
    if (selected.length >= 6) return;
    if (selected.some((a) => a.toUpperCase() === name.toUpperCase())) return;
    setSelected([...selected, name]);
    setSearchQuery("");
    setSearchResults([]);
  }

  function removeArea(name: string) {
    setSelected(selected.filter((a) => a !== name));
  }

  // Find max values for bar scaling
  const maxMedian = result ? Math.max(...result.map((r) => Number(r.median_price_aed) || 0)) : 1;
  const maxSqft = result ? Math.max(...result.map((r) => Number(r.median_aed_sqft) || 0)) : 1;
  const maxTx = result ? Math.max(...result.map((r) => r.transaction_count)) : 1;

  return (
    <div>
      {/* Area selector */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-zinc-900">
            Selected Areas ({selected.length}/6)
          </h2>
          <span className="text-xs text-zinc-500">
            {selected.length < 2 ? "Add at least 2 areas" : "Comparing"}
          </span>
        </div>

        {/* Selected chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {selected.map((area) => (
            <span
              key={area}
              className="inline-flex items-center gap-2 bg-blue-50 text-blue-800 text-sm px-3 py-1.5 rounded-lg border border-blue-200"
            >
              {area}
              <button
                onClick={() => removeArea(area)}
                className="hover:bg-blue-100 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                aria-label={`Remove ${area}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>

        {/* Search input */}
        {selected.length < 6 && (
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for an area to add (e.g., Arjan, Majan)..."
              className="w-full px-4 py-2.5 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
                {searchResults.map((r) => (
                  <button
                    key={r.area_name}
                    onClick={() => addArea(r.area_name)}
                    className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 text-sm flex items-center justify-between"
                  >
                    <span className="text-zinc-900">
                      {r.area_name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {r.total_transactions.toLocaleString()} sales
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {missing.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6 text-sm">
          Not found: {missing.join(", ")}
        </div>
      )}

      {loading && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-zinc-600">Comparing areas...</p>
        </div>
      )}

      {result && !loading && result.length >= 2 && (
        <>
          {/* Median Price Comparison */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 md:p-8 mb-6">
            <h2 className="text-base font-semibold text-zinc-900 mb-6">
              Median Price (AED)
            </h2>
            <div className="space-y-4">
              {result.map((r) => {
                const pct = (Number(r.median_price_aed) / maxMedian) * 100;
                return (
                  <div key={r.area_name}>
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-sm text-zinc-700 font-medium">
                        {r.area_name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                      <span className="text-sm font-bold text-zinc-900">
                        AED {formatAED(r.median_price_aed)}
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AED/sqft Comparison */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 md:p-8 mb-6">
            <h2 className="text-base font-semibold text-zinc-900 mb-6">
              Price per Square Foot (AED/sqft)
            </h2>
            <div className="space-y-4">
              {result.map((r) => {
                const pct = (Number(r.median_aed_sqft) / maxSqft) * 100;
                return (
                  <div key={r.area_name}>
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-sm text-zinc-700 font-medium">
                        {r.area_name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                      <span className="text-sm font-bold text-zinc-900">
                        {formatAED(r.median_aed_sqft)}
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side-by-side table */}
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-zinc-100">
              <h2 className="text-base font-semibold text-zinc-900">
                Side-by-Side Comparison
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-600 uppercase">
                      Metric
                    </th>
                    {result.map((r) => (
                      <th
                        key={r.area_name}
                        className="text-right px-6 py-3 text-xs font-semibold text-zinc-600 uppercase"
                      >
                        {r.area_name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  <tr>
                    <td className="px-6 py-3 text-sm font-medium text-zinc-700">
                      Median Price
                    </td>
                    {result.map((r) => (
                      <td
                        key={r.area_name}
                        className="px-6 py-3 text-right font-semibold text-zinc-900"
                      >
                        AED {formatCompact(r.median_price_aed)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-3 text-sm font-medium text-zinc-700">
                      AED / sqft
                    </td>
                    {result.map((r) => (
                      <td key={r.area_name} className="px-6 py-3 text-right text-zinc-900">
                        {formatAED(r.median_aed_sqft)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-3 text-sm font-medium text-zinc-700">
                      Transactions
                    </td>
                    {result.map((r) => (
                      <td key={r.area_name} className="px-6 py-3 text-right text-zinc-700">
                        {r.transaction_count.toLocaleString()}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-3 text-sm font-medium text-zinc-700">
                      25th – 75th percentile
                    </td>
                    {result.map((r) => (
                      <td
                        key={r.area_name}
                        className="px-6 py-3 text-right text-sm text-zinc-700"
                      >
                        {formatCompact(r.p25_price_aed)} – {formatCompact(r.p75_price_aed)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-3 text-sm font-medium text-zinc-700">
                      Data Coverage
                    </td>
                    {result.map((r) => (
                      <td key={r.area_name} className="px-6 py-3 text-right">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            r.data_coverage === "High"
                              ? "bg-green-100 text-green-800"
                              : r.data_coverage === "Medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          {r.data_coverage}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-3 text-sm font-medium text-zinc-700">
                      Details
                    </td>
                    {result.map((r) => {
                      const slug = r.area_name.toLowerCase().trim().replace(/\s+/g, "-");
                      return (
                        <td key={r.area_name} className="px-6 py-3 text-right">
                          <Link
                            href={`/areas/${slug}`}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            View →
                          </Link>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-xs text-zinc-500 text-center">
            Source: Dubai Land Department — Transactions dataset. Sales only.
            Coverage shown per area. Not investment advice.
          </div>
        </>
      )}

      {result && result.length < 2 && !loading && (
        <div className="bg-white rounded-2xl border border-dashed border-zinc-300 p-12 text-center">
          <p className="text-sm text-zinc-500">
            Add at least 2 areas above to see a comparison.
          </p>
        </div>
      )}
    </div>
  );
}
