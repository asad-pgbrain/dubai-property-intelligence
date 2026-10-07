import { sql } from "./db";

// ============================================================
// Health
// ============================================================
export async function checkHealth() {
  await sql`SELECT 1`;
  return { status: "ok", database: "connected" };
}

// ============================================================
// Market Overview
// ============================================================
export async function getMarketOverview() {
  const statsRows = await sql`
    SELECT
      COUNT(*)::int AS total_transactions,
      COALESCE(SUM(amount), 0)::bigint AS total_volume_aed,
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount)::numeric)::bigint AS median_price_aed,
      MIN(transaction_date)::text AS first_date,
      MAX(transaction_date)::text AS last_date,
      COUNT(DISTINCT area_id)::int AS areas_count
    FROM core.transactions
    WHERE transaction_type = 'Sales' AND amount > 0
  `;

  const topAreas = await sql`
    SELECT
      a.normalized_name AS area_name,
      COUNT(*)::int AS transaction_count,
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY t.amount)::numeric)::bigint AS median_price_aed,
      ROUND(SUM(t.amount))::bigint AS volume_aed
    FROM core.transactions t
    JOIN core.areas a ON t.area_id = a.area_id
    WHERE t.transaction_type = 'Sales' AND t.amount > 0
    GROUP BY a.normalized_name
    ORDER BY transaction_count DESC
    LIMIT 10
  `;

  const monthlyTrend = await sql`
    WITH monthly AS (
      SELECT
        DATE_TRUNC('month', transaction_date) AS month_ts,
        COUNT(*)::int AS transaction_count,
        ROUND(SUM(amount))::bigint AS volume_aed,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount)::numeric)::bigint AS median_price_aed
      FROM core.transactions
      WHERE transaction_type = 'Sales' AND amount > 0
      GROUP BY DATE_TRUNC('month', transaction_date)
    )
    SELECT
      TO_CHAR(month_ts, 'YYYY-MM-DD') AS month,
      transaction_count,
      volume_aed,
      median_price_aed
    FROM monthly
    ORDER BY month_ts
  `;

  return {
    stats: statsRows[0],
    top_areas: topAreas,
    monthly_trend: monthlyTrend,
    source: { name: "Dubai Land Department", dataset: "Transactions" },
  };
}

// ============================================================
// Areas List
// ============================================================
export async function listAreas(limit = 100, minTransactions = 10) {
  const rows = await sql`
    SELECT
      area_name,
      SUM(transaction_count)::int AS total_transactions,
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY median_price)::numeric)::bigint AS median_price_aed,
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY median_price_sqft)::numeric)::bigint AS median_aed_sqft,
      MAX(last_transaction)::text AS last_transaction
    FROM analytics.area_market_summary
    WHERE property_type = 'Unit'
    GROUP BY area_name
    HAVING SUM(transaction_count) >= ${minTransactions}
    ORDER BY total_transactions DESC
    LIMIT ${limit}
  `;

  return {
    data: rows,
    count: rows.length,
    source: { name: "Dubai Land Department", dataset: "Transactions" },
  };
}

// ============================================================
// Area Detail
// ============================================================
export async function getAreaDetail(areaName: string) {
  const rows = await sql`
    SELECT
      area_name,
      property_type,
      transaction_count,
      ROUND(median_price)::bigint AS median_price_aed,
      ROUND(median_price_sqft)::bigint AS median_aed_sqft,
      ROUND(p25_price)::bigint AS p25_price_aed,
      ROUND(p75_price)::bigint AS p75_price_aed,
      data_coverage,
      first_transaction::text AS first_transaction,
      last_transaction::text AS last_transaction
    FROM analytics.area_market_summary
    WHERE UPPER(TRIM(area_name)) = UPPER(TRIM(${areaName}))
    ORDER BY transaction_count DESC
  `;

  return {
    area: areaName,
    data: rows,
    source: { name: "Dubai Land Department", dataset: "Transactions" },
  };
}

// ============================================================
// Area Monthly Trend
// ============================================================
export async function getAreaMonthly(areaName: string) {
  const rows = await sql`
    WITH monthly AS (
      SELECT
        DATE_TRUNC('month', t.transaction_date) AS month_ts,
        COUNT(*)::int AS transaction_count,
        ROUND(SUM(t.amount))::bigint AS volume_aed,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY t.amount)::numeric)::bigint AS median_price_aed
      FROM core.transactions t
      JOIN core.areas a ON t.area_id = a.area_id
      WHERE UPPER(TRIM(a.normalized_name)) = UPPER(TRIM(${areaName}))
        AND t.transaction_type = 'Sales'
        AND t.amount > 0
      GROUP BY DATE_TRUNC('month', t.transaction_date)
    )
    SELECT
      TO_CHAR(month_ts, 'YYYY-MM-DD') AS month,
      transaction_count,
      volume_aed,
      median_price_aed
    FROM monthly
    ORDER BY month_ts
  `;

  return {
    area: areaName,
    data: rows,
    count: rows.length,
    source: { name: "Dubai Land Department", dataset: "Transactions" },
  };
}

// ============================================================
// Search Areas
// ============================================================
export async function searchAreas(q: string, limit = 20) {
  const pattern = `%${q}%`;
  const rows = await sql`
    SELECT DISTINCT
      area_name,
      SUM(transaction_count)::int AS total_transactions
    FROM analytics.area_market_summary
    WHERE property_type = 'Unit'
      AND (${q} = '' OR UPPER(area_name) LIKE UPPER(${pattern}))
    GROUP BY area_name
    HAVING SUM(transaction_count) >= 20
    ORDER BY total_transactions DESC
    LIMIT ${limit}
  `;

  return { data: rows, count: rows.length };
}

// ============================================================
// Compare Areas
// ============================================================
export async function compareAreas(areas: string[]) {
  if (areas.length < 2 || areas.length > 6) {
    return { data: [], missing: [], count: 0, source: { name: "DLD", dataset: "Transactions" } };
  }

  const normalized = areas.map((a) => a.trim().toUpperCase());

  const rows = await sql`
    SELECT
      area_name,
      property_type,
      transaction_count,
      ROUND(median_price)::bigint AS median_price_aed,
      ROUND(median_price_sqft)::bigint AS median_aed_sqft,
      ROUND(p25_price)::bigint AS p25_price_aed,
      ROUND(p75_price)::bigint AS p75_price_aed,
      data_coverage,
      first_transaction::text AS first_transaction,
      last_transaction::text AS last_transaction
    FROM analytics.area_market_summary
    WHERE UPPER(TRIM(area_name)) = ANY(${normalized})
      AND property_type = 'Unit'
    ORDER BY transaction_count DESC
  `;

  const found = rows.map((r: { area_name: string }) => r.area_name);
  const missing = areas.filter(
    (a) => !found.includes(a.trim().toUpperCase())
  );

  return {
    data: rows,
    missing,
    count: rows.length,
    source: { name: "Dubai Land Department", dataset: "Transactions" },
  };
}

// ============================================================
// Compare Monthly
// ============================================================
export async function compareMonthly(areas: string[]) {
  if (areas.length < 2 || areas.length > 6) {
    return { data: [], count: 0 };
  }

  const normalized = areas.map((a) => a.trim().toUpperCase());

  const rows = await sql`
    WITH monthly AS (
      SELECT
        a.normalized_name AS area_name,
        DATE_TRUNC('month', t.transaction_date) AS month_ts,
        COUNT(*)::int AS transaction_count,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY t.amount)::numeric)::bigint AS median_price_aed
      FROM core.transactions t
      JOIN core.areas a ON t.area_id = a.area_id
      WHERE UPPER(TRIM(a.normalized_name)) = ANY(${normalized})
        AND t.transaction_type = 'Sales'
        AND t.amount > 0
      GROUP BY a.normalized_name, DATE_TRUNC('month', t.transaction_date)
    )
    SELECT
      area_name,
      TO_CHAR(month_ts, 'YYYY-MM-DD') AS month,
      transaction_count,
      median_price_aed
    FROM monthly
    ORDER BY area_name, month_ts
  `;

  return { data: rows, count: rows.length };
}

// ============================================================
// Reality Check
// ============================================================
export async function realityCheck(input: {
  area: string;
  property_type?: string | null;
  rooms?: string | null;
  size_sqm?: number | null;
  asking_price?: number | null;
}) {
  const rows = await sql`
    SELECT
      tier,
      comp_count,
      ROUND(median_price)::bigint AS median_price_aed,
      ROUND(p25_price)::bigint AS p25_price_aed,
      ROUND(p75_price)::bigint AS p75_price_aed,
      ROUND(median_price_sqft)::bigint AS median_aed_sqft,
      min_size_sqm,
      max_size_sqm,
      first_date::text AS first_date,
      last_date::text AS last_date
    FROM analytics.get_market_comps(
      ${input.area},
      ${input.property_type || null},
      ${input.rooms || null},
      ${input.size_sqm || null},
      20,
      5
    )
  `;

  if (rows.length === 0) {
    throw new Error("No market data found");
  }

  const result = rows[0];
  const tier = Number(result.tier);

  const coverageMap: Record<number, string> = {
    1: "High",
    2: "Medium",
    3: "Medium",
    4: "Limited",
  };
  const coverage = coverageMap[tier] || "Limited";

  const tierExplanations: Record<number, string> = {
    1: "Exact match: same area, type, rooms, and similar size",
    2: "Same area, type, and rooms (any size)",
    3: "Same area and property type",
    4: "Area-wide fallback — limited comparability",
  };

  const response: {
    input: typeof input;
    market: typeof result;
    coverage: string;
    tier_explanation: string;
    comparison?: {
      asking_price: number;
      market_median: number;
      diff_pct: number;
      diff_aed: number;
    };
    source: { name: string; dataset: string };
  } = {
    input,
    market: result,
    coverage,
    tier_explanation: tierExplanations[tier] || "Unknown",
    source: { name: "Dubai Land Department", dataset: "Transactions" },
  };

  if (input.asking_price && result.median_price_aed) {
    const median = Number(result.median_price_aed);
    const diffPct = ((input.asking_price - median) / median) * 100;
    response.comparison = {
      asking_price: input.asking_price,
      market_median: median,
      diff_pct: Math.round(diffPct * 10) / 10,
      diff_aed: Math.round(input.asking_price - median),
    };
  }

  return response;
}
