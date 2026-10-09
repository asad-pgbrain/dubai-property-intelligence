"use client";

import { useState, useEffect } from "react";

interface YieldResponse {
  area: string;
  property_type: string;
  market: {
    median_sale_price: number;
    median_aed_sqft: number;
    median_annual_rent: number;
    gross_yield_pct: number;
    sale_count: number;
    rent_count: number;
    data_coverage: string;
  };
  source: { name: string; dataset: string; period: string };
}

function formatAED(value: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(Math.round(value));
}

export default function RentalYieldCalculator() {
  const [area, setArea] = useState("Dubai Marina");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<YieldResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Custom inputs
  const [customPrice, setCustomPrice] = useState("");
  const [customRent, setCustomRent] = useState("");

  async function fetchYield(areaName: string) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(
        `/api/v1/rental-yield?area=${encodeURIComponent(areaName)}`
      );
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setResult(data);
      setCustomPrice(String(data.market.median_sale_price));
      setCustomRent(String(data.market.median_annual_rent));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchYield(area);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchYield(area);
  }

  // Custom yield calculation
  const customYield =
    customPrice && customRent && parseFloat(customPrice) > 0
      ? ((parseFloat(customRent) / parseFloat(customPrice)) * 100).toFixed(2)
      : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-5 md:p-6 border border-zinc-200"
      >
        <h3 className="text-base font-semibold text-zinc-900 mb-5">
          Calculate rental yield
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1.5 uppercase tracking-wide">
              Dubai Area
            </label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g., Dubai Marina"
              className="w-full px-3 py-2.5 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1.5 uppercase tracking-wide">
              Your Purchase Price (AED) <span className="text-zinc-400 normal-case">— optional</span>
            </label>
            <input
              type="number"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              placeholder="Auto-filled from market"
              className="w-full px-3 py-2.5 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1.5 uppercase tracking-wide">
              Annual Rent (AED) <span className="text-zinc-400 normal-case">— optional</span>
            </label>
            <input
              type="number"
              value={customRent}
              onChange={(e) => setCustomRent(e.target.value)}
              placeholder="Auto-filled from market"
              className="w-full px-3 py-2.5 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 text-white font-semibold py-3 rounded-lg transition text-sm"
        >
          {loading ? "Calculating..." : "Get Market Data"}
        </button>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-800 px-3 py-2.5 rounded-lg text-sm">
            {error}
          </div>
        )}
      </form>

      {/* Result */}
      <div className="lg:col-span-3 w-full">
        {loading && (
          <div className="bg-white rounded-2xl shadow-lg p-12 border border-zinc-200 text-center">
            <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-zinc-600">Loading market data...</p>
          </div>
        )}

        {!result && !loading && (
          <div className="bg-white rounded-2xl shadow-lg p-12 border border-dashed border-zinc-300 text-center">
            <p className="text-sm text-zinc-500">
              Enter an area to see rental yield data
            </p>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-4">
            {/* Custom yield — big banner */}
            {customYield && (
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 md:p-8 text-white">
                <div className="text-xs uppercase tracking-wide opacity-80 mb-2">
                  Your custom yield
                </div>
                <div className="text-4xl md:text-5xl font-bold mb-4">
                  {customYield}%
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-white/20">
                  <div>
                    <div className="opacity-70 mb-1">Purchase price</div>
                    <div className="font-semibold">
                      AED {formatAED(parseFloat(customPrice) || 0)}
                    </div>
                  </div>
                  <div>
                    <div className="opacity-70 mb-1">Annual rent</div>
                    <div className="font-semibold">
                      AED {formatAED(parseFloat(customRent) || 0)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Market data */}
            <div className="bg-white rounded-2xl shadow-lg border border-zinc-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900">
                    Market data — {result.area}
                  </h4>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {result.market.sale_count.toLocaleString()} sales ·{" "}
                    {result.market.rent_count.toLocaleString()} rents
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    result.market.data_coverage === "High"
                      ? "bg-green-100 text-green-800"
                      : result.market.data_coverage === "Medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {result.market.data_coverage}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-zinc-100">
                <div className="p-5">
                  <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">
                    Median Sale
                  </div>
                  <div className="text-lg font-bold text-zinc-900">
                    AED {formatCompact(result.market.median_sale_price)}
                  </div>
                </div>
                <div className="p-5">
                  <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">
                    Median Rent
                  </div>
                  <div className="text-lg font-bold text-zinc-900">
                    AED {formatCompact(result.market.median_annual_rent)}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-1">per year</div>
                </div>
                <div className="p-5">
                  <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">
                    Market Yield
                  </div>
                  <div className="text-lg font-bold text-emerald-600">
                    {result.market.gross_yield_pct}%
                  </div>
                </div>
                <div className="p-5">
                  <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">
                    AED / sqft
                  </div>
                  <div className="text-lg font-bold text-zinc-900">
                    {formatAED(result.market.median_aed_sqft)}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-50 rounded-2xl p-5 text-xs text-zinc-600 space-y-1.5">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-zinc-700 min-w-[70px]">Method:</span>
                <span>
                  Gross yield = median annual rent ÷ median sale price × 100.
                  Excludes service charges and expenses.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-zinc-700 min-w-[70px]">Period:</span>
                <span>{result.source.period}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-zinc-700 min-w-[70px]">Source:</span>
                <span>
                  {result.source.name} — {result.source.dataset}
                </span>
              </div>
              <div className="pt-2 border-t border-zinc-200 mt-2 text-zinc-500">
                This is market research, not investment advice. Verify independently.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
