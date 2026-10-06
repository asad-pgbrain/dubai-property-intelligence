"use client";

import { useState } from "react";
import { realityCheck, type RealityCheckResponse } from "@/lib/api";

export default function RealityCheckForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RealityCheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    area: "Dubai Marina",
    property_type: "Unit",
    rooms: "1 B/R",
    size_sqm: "75",
    asking_price: "1800000",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await realityCheck({
        area: form.area,
        property_type: form.property_type || undefined,
        rooms: form.rooms || undefined,
        size_sqm: form.size_sqm ? parseFloat(form.size_sqm) : undefined,
        asking_price: form.asking_price ? parseFloat(form.asking_price) : undefined,
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function formatAED(value: number | null): string {
    if (value == null) return "—";
    return new Intl.NumberFormat("en-US").format(Math.round(value));
  }

  function getVerdict(diffPct: number) {
    if (diffPct > 15)
      return {
        label: "Above Market",
        subtext: `${diffPct.toFixed(1)}% higher than market median`,
        color: "text-red-700",
        bg: "bg-red-50",
        border: "border-red-200",
      };
    if (diffPct > 5)
      return {
        label: "Slightly Above Market",
        subtext: `${diffPct.toFixed(1)}% higher than market median`,
        color: "text-orange-700",
        bg: "bg-orange-50",
        border: "border-orange-200",
      };
    if (diffPct > -5)
      return {
        label: "In Line With Market",
        subtext: `Within ${Math.abs(diffPct).toFixed(1)}% of market median`,
        color: "text-blue-700",
        bg: "bg-blue-50",
        border: "border-blue-200",
      };
    if (diffPct > -15)
      return {
        label: "Below Market",
        subtext: `${Math.abs(diffPct).toFixed(1)}% lower than market median`,
        color: "text-green-700",
        bg: "bg-green-50",
        border: "border-green-200",
      };
    return {
      label: "Significantly Below Market",
      subtext: `${Math.abs(diffPct).toFixed(1)}% lower than market median`,
      color: "text-green-700",
      bg: "bg-green-50",
      border: "border-green-200",
    };
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
      {/* LEFT: Form */}
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-5 md:p-6 border border-zinc-200"
      >
        <h3 className="text-base font-semibold text-zinc-900 mb-5">
          Enter property details
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1.5 uppercase tracking-wide">
              Area
            </label>
            <input
              type="text"
              value={form.area}
              onChange={(e) => setForm({ ...form, area: e.target.value })}
              placeholder="e.g., Dubai Marina"
              className="w-full px-3 py-2.5 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1.5 uppercase tracking-wide">
                Type
              </label>
              <select
                value={form.property_type}
                onChange={(e) => setForm({ ...form, property_type: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white outline-none"
              >
                <option value="Unit">Unit</option>
                <option value="Building">Building</option>
                <option value="Land">Land</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1.5 uppercase tracking-wide">
                Bedrooms
              </label>
              <select
                value={form.rooms}
                onChange={(e) => setForm({ ...form, rooms: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white outline-none"
              >
                <option value="Studio">Studio</option>
                <option value="1 B/R">1 B/R</option>
                <option value="2 B/R">2 B/R</option>
                <option value="3 B/R">3 B/R</option>
                <option value="4 B/R">4 B/R</option>
                <option value="5 B/R">5 B/R</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1.5 uppercase tracking-wide">
                Size (sqm)
              </label>
              <input
                type="number"
                value={form.size_sqm}
                onChange={(e) => setForm({ ...form, size_sqm: e.target.value })}
                placeholder="75"
                className="w-full px-3 py-2.5 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1.5 uppercase tracking-wide">
                Price (AED)
              </label>
              <input
                type="number"
                value={form.asking_price}
                onChange={(e) => setForm({ ...form, asking_price: e.target.value })}
                placeholder="1800000"
                className="w-full px-3 py-2.5 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 text-white font-semibold py-3 rounded-lg transition text-sm"
        >
          {loading ? "Analyzing market data..." : "Check This Property"}
        </button>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-800 px-3 py-2.5 rounded-lg text-sm">
            {error}
          </div>
        )}
      </form>

      {/* RIGHT: Result */}
      <div className="lg:col-span-3 w-full">
        {!result && !loading && (
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-dashed border-zinc-300 text-center">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 md:w-8 md:h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-zinc-500 text-sm">
              Enter property details to see how it compares to the market
            </p>
          </div>
        )}

        {loading && (
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-zinc-200 text-center">
            <div className="w-14 h-14 md:w-16 md:h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-zinc-600 text-sm">Analyzing 161,000+ transactions...</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {/* Verdict Banner */}
            {result.comparison && (() => {
              const v = getVerdict(result.comparison.diff_pct);
              return (
                <div className={`${v.bg} ${v.border} border rounded-2xl p-5 md:p-6`}>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div>
                      <div className={`text-xl md:text-2xl font-bold ${v.color} mb-1`}>
                        {v.label}
                      </div>
                      <div className={`text-sm ${v.color} opacity-80`}>
                        {v.subtext}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full bg-white self-start ${
                        result.coverage === "High"
                          ? "text-green-700"
                          : result.coverage === "Medium"
                          ? "text-yellow-700"
                          : "text-red-700"
                      }`}
                    >
                      {result.coverage} coverage
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 md:gap-4 pt-4 border-t border-black/5">
                    <div>
                      <div className="text-[10px] md:text-xs text-zinc-500 mb-1 uppercase tracking-wide">
                        Your price
                      </div>
                      <div className="text-sm md:text-base font-bold text-zinc-900">
                        {formatAED(result.comparison.asking_price)}
                      </div>
                      <div className="text-[10px] text-zinc-400">AED</div>
                    </div>
                    <div>
                      <div className="text-[10px] md:text-xs text-zinc-500 mb-1 uppercase tracking-wide">
                        Market
                      </div>
                      <div className="text-sm md:text-base font-bold text-zinc-900">
                        {formatAED(result.comparison.market_median)}
                      </div>
                      <div className="text-[10px] text-zinc-400">AED</div>
                    </div>
                    <div>
                      <div className="text-[10px] md:text-xs text-zinc-500 mb-1 uppercase tracking-wide">
                        Diff
                      </div>
                      <div className={`text-sm md:text-base font-bold ${v.color}`}>
                        {result.comparison.diff_pct > 0 ? "+" : ""}
                        {result.comparison.diff_pct.toFixed(1)}%
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        {formatAED(result.comparison.diff_aed)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Market stats grid */}
            <div className="bg-white rounded-2xl shadow-lg border border-zinc-200 overflow-hidden">
              <div className="px-5 md:px-6 py-4 border-b border-zinc-100">
                <h4 className="text-sm font-semibold text-zinc-900">Market Data</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-zinc-100">
                <div className="p-4 md:p-5">
                  <div className="text-[10px] md:text-xs text-zinc-500 mb-2 uppercase tracking-wide">
                    Comparables
                  </div>
                  <div className="text-lg md:text-xl font-bold text-zinc-900">
                    {result.market.comp_count}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-1">similar sales</div>
                </div>
                <div className="p-4 md:p-5">
                  <div className="text-[10px] md:text-xs text-zinc-500 mb-2 uppercase tracking-wide">
                    AED / sqft
                  </div>
                  <div className="text-lg md:text-xl font-bold text-zinc-900">
                    {formatAED(result.market.median_aed_sqft)}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-1">median</div>
                </div>
                <div className="p-4 md:p-5">
                  <div className="text-[10px] md:text-xs text-zinc-500 mb-2 uppercase tracking-wide">
                    P25
                  </div>
                  <div className="text-sm md:text-base font-bold text-zinc-700">
                    {formatAED(result.market.p25_price_aed)}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-1">AED</div>
                </div>
                <div className="p-4 md:p-5">
                  <div className="text-[10px] md:text-xs text-zinc-500 mb-2 uppercase tracking-wide">
                    P75
                  </div>
                  <div className="text-sm md:text-base font-bold text-zinc-700">
                    {formatAED(result.market.p75_price_aed)}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-1">AED</div>
                </div>
              </div>
            </div>

            {/* Footer / Provenance */}
            <div className="bg-zinc-50 rounded-2xl p-4 md:p-5 text-xs text-zinc-600 space-y-1.5">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-zinc-700 min-w-[60px]">Match:</span>
                <span>{result.tier_explanation}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-zinc-700 min-w-[60px]">Period:</span>
                <span>
                  {result.market.first_date} to {result.market.last_date}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-zinc-700 min-w-[60px]">Source:</span>
                <span>
                  {result.source.name} — {result.source.dataset}
                </span>
              </div>
              <div className="pt-2 border-t border-zinc-200 mt-2 text-zinc-500">
                This is market research, not investment advice.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
