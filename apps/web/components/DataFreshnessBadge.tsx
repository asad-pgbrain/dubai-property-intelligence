import { DATA_STATS } from "@/lib/constants";

interface Props {
  variant?: "default" | "compact";
}

/**
 * Data freshness badge — shows when data was last updated.
 * Spec requirement: every data page must show data freshness.
 */
export default function DataFreshnessBadge({ variant = "default" }: Props) {
  if (variant === "compact") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
        Updated {DATA_STATS.periodEnd}
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-full px-3 py-1.5 text-xs text-zinc-600">
      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
      <span>
        <span className="font-medium text-zinc-700">
          {DATA_STATS.totalSales.toLocaleString()}
        </span>{" "}
        sales · Period: {DATA_STATS.periodLabel} · Source: {DATA_STATS.source}
      </span>
    </div>
  );
}
