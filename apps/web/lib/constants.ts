/**
 * Site-wide data constants.
 * Update these whenever new DLD data is loaded.
 */
export const DATA_STATS = {
  totalSales: 124395,
  totalAreas: 246,
  totalVolumeAed: 382153180098,
  medianPriceAed: 1418000,
  periodStart: "2026-01-01",
  periodEnd: "2026-10-02",
  periodLabel: "Jan–Oct 2026",
  source: "Dubai Land Department",
} as const;

export function formatCompact(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(value);
}
