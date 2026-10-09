// ============================================================
// Shared Formatters
// Single source of truth for all display formatting
// ============================================================

/**
 * Format number as AED with commas.
 * Example: 1950000 → "1,950,000"
 */
export function formatAED(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

/**
 * Format number in compact form with suffix.
 * Example: 1950000 → "1.95M", 45000 → "45K", 850 → "850"
 */
export function formatCompact(value: number | null | undefined): string {
  if (value == null) return "—";
  const v = Math.abs(value);
  if (v >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (v >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(Math.round(value));
}

/**
 * Format compact for chart axis (fewer decimals).
 * Example: 1950000 → "1.9M", 45000 → "45K"
 */
export function formatAxis(value: number): string {
  const v = Math.abs(value);
  if (v >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(Math.round(value));
}

/**
 * Convert DLD area name to display-friendly title case.
 * Example: "MADINAT AL MATAAR" → "Madinat Al Mataar"
 */
export function displayName(name: string): string {
  return name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Convert area name to URL slug.
 * Example: "Dubai Marina" → "dubai-marina"
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Format ISO date to short month label.
 * Example: "2026-08-01" → "Aug '26"
 */
export function formatMonth(month: string): string {
  const d = new Date(month);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

/**
 * Format ISO date to long month label.
 * Example: "2026-08-01" → "August 2026"
 */
export function formatMonthLong(month: string): string {
  const d = new Date(month);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/**
 * Format ISO date to readable date.
 * Example: "2026-08-01" → "Aug 1, 2026"
 */
export function formatDate(date: string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format percentage with + sign for positive.
 * Example: 17.8 → "+17.8%", -5.2 → "-5.2%"
 */
export function formatPercent(value: number | null | undefined, decimals = 1): string {
  if (value == null) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}
