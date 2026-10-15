export const DATA_STATS = {
  // Sales (Unit only, Jan-Oct 2026)
  totalSales: 104605,
  totalVolumeAed: 382153180098,
  medianPriceAed: 1244025,
  totalAreas: 125,
  salesAreas: 125,

  // Rents (Residential only — Flat, Villa, Studio, Penthouse, Hotel Apartment)
  totalRents: 537945,       // ← Actual filtered
  rentAreas: 177,           // ← Actual filtered

  // Coverage
  periodStart: "2026-01-01",
  periodEnd: "2026-10-02",
  periodLabel: "Jan–Oct 2026",

  // Source
  source: "Dubai Land Department",
} as const;

export function formatCompact(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(value);
}
