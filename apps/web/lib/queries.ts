import { sql } from "./db";
import { findAreasByAlias } from "./aliases";

export async function searchAreas(q: string, limit = 20) {
  if (!q || q.length < 2) {
    // Return top areas if no query
    const rows = (await sql`
      SELECT DISTINCT
        area_name,
        SUM(transaction_count)::int AS total_transactions
      FROM analytics.area_market_summary
      WHERE property_type = 'Unit'
      GROUP BY area_name
      HAVING SUM(transaction_count) >= 20
      ORDER BY total_transactions DESC
      LIMIT ${limit}
    `) as SearchRow[];
    return { data: rows, count: rows.length };
  }

  // Get matching DLD names via alias
  const aliasMatches = findAreasByAlias(q);

  // Search both direct name match AND alias matches
  const pattern = `%${q.toUpperCase()}%`;
  const rows = (await sql`
    SELECT DISTINCT
      area_name,
      SUM(transaction_count)::int AS total_transactions
    FROM analytics.area_market_summary
    WHERE property_type = 'Unit'
      AND (
        UPPER(area_name) LIKE ${pattern}
        OR UPPER(area_name) = ANY(${aliasMatches.length > 0 ? aliasMatches : ['__no_match__']})
      )
    GROUP BY area_name
    HAVING SUM(transaction_count) >= 5
    ORDER BY total_transactions DESC
    LIMIT ${limit}
  `) as SearchRow[];

  return { data: rows, count: rows.length };
}
// ============================================================
// Area Bedroom Split
// ============================================================
interface BedroomSplitRow {
  rooms: string;
  transaction_count: number;
  median_price_aed: number;
  median_aed_sqft: number;
}

export async function getAreaBedroomSplit(areaName: string) {
  const rows = (await sql`
    SELECT
      rooms,
      COUNT(*)::int AS transaction_count,
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount)::numeric)::bigint AS median_price_aed,
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (
        ORDER BY amount / NULLIF(property_size_sqm * 10.7639104167, 0)
      )::numeric)::bigint AS median_aed_sqft
    FROM core.transactions t
    JOIN core.areas a ON t.area_id = a.area_id
    WHERE UPPER(TRIM(a.normalized_name)) = UPPER(TRIM(${areaName}))
      AND t.transaction_type = 'Sales'
      AND t.amount > 0
      AND t.rooms IS NOT NULL
      AND t.property_size_sqm > 0
    GROUP BY rooms
    HAVING COUNT(*) >= 5
    ORDER BY transaction_count DESC
    LIMIT 10
  `) as BedroomSplitRow[];
  return rows;
}

// ============================================================
// Area Off-Plan vs Ready Split
// ============================================================
interface OffPlanSplitRow {
  is_offplan: string;
  transaction_count: number;
  median_price_aed: number;
  median_aed_sqft: number;
}

export async function getAreaOffPlanSplit(areaName: string) {
  const rows = (await sql`
    SELECT
      is_offplan,
      COUNT(*)::int AS transaction_count,
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount)::numeric)::bigint AS median_price_aed,
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (
        ORDER BY amount / NULLIF(property_size_sqm * 10.7639104167, 0)
      )::numeric)::bigint AS median_aed_sqft
    FROM core.transactions t
    JOIN core.areas a ON t.area_id = a.area_id
    WHERE UPPER(TRIM(a.normalized_name)) = UPPER(TRIM(${areaName}))
      AND t.transaction_type = 'Sales'
      AND t.amount > 0
      AND t.is_offplan IS NOT NULL
      AND t.property_size_sqm > 0
    GROUP BY is_offplan
    ORDER BY transaction_count DESC
  `) as OffPlanSplitRow[];
  return rows;
}

// ============================================================
// Related Areas (similar median price)
// ============================================================
interface RelatedAreaRow {
  area_name: string;
  transaction_count: number;
  median_price_aed: number;
}

export async function getRelatedAreas(areaName: string, limit = 5) {
  const rows = (await sql`
    WITH target AS (
      SELECT median_price
      FROM analytics.area_market_summary
      WHERE UPPER(TRIM(area_name)) = UPPER(TRIM(${areaName}))
        AND property_type = 'Unit'
      ORDER BY transaction_count DESC
      LIMIT 1
    )
    SELECT
      s.area_name,
      s.transaction_count,
      ROUND(s.median_price)::bigint AS median_price_aed
    FROM analytics.area_market_summary s, target
    WHERE s.property_type = 'Unit'
      AND UPPER(TRIM(s.area_name)) != UPPER(TRIM(${areaName}))
      AND s.median_price BETWEEN target.median_price * 0.85 AND target.median_price * 1.15
      AND s.transaction_count >= 30
    ORDER BY s.transaction_count DESC
    LIMIT ${limit}
  `) as RelatedAreaRow[];
  return rows;
}

// ============================================================
// Types
// ============================================================
interface StatsRow {
  total_transactions: number;
  total_volume_aed: number;
  median_price_aed: number;
  first_date: string;
  last_date: string;
  areas_count: number;
}

interface MonthlyRow {
  month: string;
  transaction_count: number;
  volume_aed: number;
  median_price_aed: number;
}

interface TopAreaRow {
  area_name: string;
  transaction_count: number;
  median_price_aed: number;
  volume_aed: number;
}

interface AreaSummaryRow {
  area_name: string;
  total_transactions: number;
  median_price_aed: number | null;
  median_aed_sqft: number | null;
  last_transaction: string | null;
}

interface AreaDetailRow {
  area_name: string;
  property_type: string;
  transaction_count: number;
  median_price_aed: number;
  median_aed_sqft: number;
  p25_price_aed: number;
  p75_price_aed: number;
  data_coverage: string;
  first_transaction: string;
  last_transaction: string;
}

interface CompareRow {
  area_name: string;
  property_type: string;
  transaction_count: number;
  median_price_aed: number;
  median_aed_sqft: number;
  p25_price_aed: number;
  p75_price_aed: number;
  data_coverage: string;
  first_transaction: string;
  last_transaction: string;
  rent_count: number | null;           // NEW
  median_annual_rent: number | null;   // NEW
  gross_yield_pct: number | null;      // NEW 
}

interface CompareMonthlyRow {
  area_name: string;
  month: string;
  transaction_count: number;
  median_price_aed: number;
}

interface SearchRow {
  area_name: string;
  total_transactions: number;
}

interface RealityCheckRow {
  tier: number;
  comp_count: number;
  median_price_aed: number;
  p25_price_aed: number;
  p75_price_aed: number;
  median_aed_sqft: number;
  min_size_sqm: number;
  max_size_sqm: number;
  first_date: string;
  last_date: string;
}

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
  const statsRows = (await sql`
    SELECT
      COUNT(*)::int AS total_transactions,
      COALESCE(SUM(amount), 0)::bigint AS total_volume_aed,
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount)::numeric)::bigint AS median_price_aed,
      MIN(transaction_date)::text AS first_date,
      MAX(transaction_date)::text AS last_date,
      COUNT(DISTINCT area_id)::int AS areas_count
    FROM core.transactions
    WHERE transaction_type = 'Sales' AND amount > 0
  `) as StatsRow[];

  const topAreas = (await sql`
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
  `) as TopAreaRow[];

  const monthlyTrend = (await sql`
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
  `) as MonthlyRow[];

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
  const rows = (await sql`
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
  `) as AreaSummaryRow[];

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
  const rows = (await sql`
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
  `) as AreaDetailRow[];

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
  const rows = (await sql`
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
  `) as MonthlyRow[];

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
// ============================================================
// Compare Areas
// ============================================================
export async function compareAreas(areas: string[]) {
  if (areas.length < 2 || areas.length > 6) {
    return {
      data: [] as CompareRow[],
      missing: [] as string[],
      count: 0,
      source: { name: "DLD", dataset: "Transactions" },
    };
  }

  const normalized = areas.map((a) => a.trim().toUpperCase());

  const rows = (await sql`
    SELECT
      s.area_name,
      s.property_type,
      s.transaction_count,
      ROUND(s.median_price)::bigint AS median_price_aed,
      ROUND(s.median_price_sqft)::bigint AS median_aed_sqft,
      ROUND(s.p25_price)::bigint AS p25_price_aed,
      ROUND(s.p75_price)::bigint AS p75_price_aed,
      s.data_coverage,
      s.first_transaction::text AS first_transaction,
      s.last_transaction::text AS last_transaction,
      r.rent_count,
      r.median_annual_rent,
      r.gross_yield_pct
    FROM analytics.area_market_summary s
    LEFT JOIN analytics.area_yield_summary r
      ON UPPER(TRIM(s.area_name)) = UPPER(TRIM(r.area_name))
      AND s.property_type = r.property_sub_type
    WHERE UPPER(TRIM(s.area_name)) = ANY(${normalized})
      AND s.property_type = 'Unit'
    ORDER BY s.transaction_count DESC
  `) as CompareRow[];

  const found = rows.map((r) => r.area_name);
  const missing = areas.filter(
    (a) => !found.includes(a.trim().toUpperCase())
  );

  return {
    data: rows,
    missing,
    count: rows.length,
    source: { name: "Dubai Land Department", dataset: "Transactions + Rents" },
  };
}
   
// ============================================================
// Compare Monthly
// ============================================================
export async function compareMonthly(areas: string[]) {
  if (areas.length < 2 || areas.length > 6) {
    return { data: [] as CompareMonthlyRow[], count: 0 };
  }

  const normalized = areas.map((a) => a.trim().toUpperCase());

  const rows = (await sql`
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
  `) as CompareMonthlyRow[];

  return { data: rows, count: rows.length };
}
// ============================================================
// Rental Yield Calculator
// ============================================================
interface YieldAreaRow {
  area_name: string;
  property_sub_type: string;
  sale_count: number;
  median_sale_price: number;
  median_aed_sqft: number;
  rent_count: number;
  median_annual_rent: number;
  gross_yield_pct: number;
  data_coverage: string;
}

export async function getRentalYield(
  areaName: string,
  propertyType: string = "Flat"
) {
  // Try combined group first (handles Dubai Marina → Marsa Dubai etc.)
  const groupRows = (await sql`
    SELECT
      group_name AS area_name,
      property_sub_type,
      sale_count,
      median_sale_price,
      median_aed_sqft,
      rent_count,
      median_annual_rent,
      gross_yield_pct,
      data_coverage
    FROM analytics.area_group_yield
    WHERE LOWER(group_name) = LOWER(${areaName})
      AND property_sub_type = ${propertyType}
  `) as YieldAreaRow[];

  if (groupRows.length > 0) return groupRows[0];

  // Fallback to direct area match
  const directRows = (await sql`
    SELECT
      area_name,
      property_sub_type,
      sale_count,
      median_sale_price,
      median_aed_sqft,
      rent_count,
      median_annual_rent,
      gross_yield_pct,
      data_coverage
    FROM analytics.area_yield_summary
    WHERE UPPER(TRIM(area_name)) = UPPER(TRIM(${areaName}))
      AND property_sub_type = ${propertyType}
  `) as YieldAreaRow[];

  if (directRows.length > 0) return directRows[0];

  return null;
}

// ============================================================
// Top Yield Areas (for rankings / discovery)
// ============================================================
export async function getTopYieldAreas(limit = 20) {
  const rows = (await sql`
    SELECT
      area_name,
      property_sub_type,
      median_sale_price,
      median_annual_rent,
      gross_yield_pct,
      data_coverage
    FROM analytics.area_yield_summary
    WHERE gross_yield_pct BETWEEN 3 AND 12
      AND data_coverage IN ('High', 'Medium')
      AND median_sale_price >= 300000
    ORDER BY gross_yield_pct DESC
    LIMIT ${limit}
  `) as YieldAreaRow[];

  return rows;
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
  const rows = (await sql`
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
  `) as RealityCheckRow[];

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
    market: RealityCheckRow;
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
// ============================================================
// Area Rent Summary (for area detail page)
// ============================================================
interface AreaRentRow {
  area_name: string;
  property_sub_type: string;
  rent_count: number;
  median_annual_rent: number;
  p25_annual_rent: number;
  p75_annual_rent: number;
  median_rent_sqft: number;
}

export async function getAreaRentSummary(areaName: string) {
  // Try group first (Dubai Marina → Marsa Dubai)
  const groupRows = (await sql`
    SELECT
      g.display_name AS area_name,
      r.property_sub_type,
      COUNT(*)::int AS rent_count,
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY r.annual_amount)::numeric)::bigint AS median_annual_rent,
      ROUND(PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY r.annual_amount)::numeric)::bigint AS p25_annual_rent,
      ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY r.annual_amount)::numeric)::bigint AS p75_annual_rent,
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (
        ORDER BY r.annual_amount / NULLIF(r.property_size_sqm * 10.7639104167, 0)
      )::numeric)::bigint AS median_rent_sqft
    FROM core.area_groups g
    JOIN core.rent_transactions r ON r.area_id = ANY(g.area_ids)
    WHERE LOWER(g.group_name) = LOWER(${areaName})
      AND r.annual_amount > 0
      AND r.property_size_sqm BETWEEN 20 AND 1000
      AND r.usage = 'Residential'
      AND r.property_sub_type IN ('Flat', 'Villa', 'Studio', 'Penthouse')
    GROUP BY g.display_name, r.property_sub_type
  `) as AreaRentRow[];

  if (groupRows.length > 0) return groupRows;

  // Fallback direct
  const directRows = (await sql`
    SELECT
      a.normalized_name AS area_name,
      r.property_sub_type,
      COUNT(*)::int AS rent_count,
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY r.annual_amount)::numeric)::bigint AS median_annual_rent,
      ROUND(PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY r.annual_amount)::numeric)::bigint AS p25_annual_rent,
      ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY r.annual_amount)::numeric)::bigint AS p75_annual_rent,
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (
        ORDER BY r.annual_amount / NULLIF(r.property_size_sqm * 10.7639104167, 0)
      )::numeric)::bigint AS median_rent_sqft
    FROM core.rent_transactions r
    JOIN core.areas a ON r.area_id = a.area_id
    WHERE UPPER(TRIM(a.normalized_name)) = UPPER(TRIM(${areaName}))
      AND r.annual_amount > 0
      AND r.property_size_sqm BETWEEN 20 AND 1000
      AND r.usage = 'Residential'
      AND r.property_sub_type IN ('Flat', 'Villa', 'Studio', 'Penthouse')
    GROUP BY a.normalized_name, r.property_sub_type
  `) as AreaRentRow[];

  return directRows;
}

// ============================================================
// Area Rent Trend (monthly)
// ============================================================
interface RentTrendRow {
  month: string;
  rent_count: number;
  median_annual_rent: number;
}

export async function getAreaRentTrend(areaName: string) {
  const rows = (await sql`
    WITH monthly AS (
      SELECT
        DATE_TRUNC('month', r.registration_date) AS month_ts,
        COUNT(*)::int AS rent_count,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY r.annual_amount)::numeric)::bigint AS median_annual_rent
      FROM core.rent_transactions r
      JOIN core.areas a ON r.area_id = a.area_id
      WHERE UPPER(TRIM(a.normalized_name)) = UPPER(TRIM(${areaName}))
        AND r.annual_amount > 0
        AND r.usage = 'Residential'
        AND r.property_sub_type = 'Flat'
      GROUP BY DATE_TRUNC('month', r.registration_date)
    )
    SELECT
      TO_CHAR(month_ts, 'YYYY-MM-DD') AS month,
      rent_count,
      median_annual_rent
    FROM monthly
    ORDER BY month_ts
  `) as RentTrendRow[];

  return rows;
}
// ============================================================
// Rents Overview (for /rents page)
// ============================================================
interface RentsStats {
  total_rents: number;
  total_annual_value: number;
  median_annual_rent: number;
  first_date: string;
  last_date: string;
  areas_count: number;
}

interface RentTrendRow {
  month: string;
  rent_count: number;
  total_annual_value: number;
  median_annual_rent: number;
}

interface TopRentAreaRow {
  area_name: string;
  rent_count: number;
  median_annual_rent: number;
  total_value: number;
}

export async function getRentsOverview() {
  const statsRows = (await sql`
    SELECT
      COUNT(*)::int AS total_rents,
      ROUND(SUM(annual_amount))::bigint AS total_annual_value,
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY annual_amount)::numeric)::bigint AS median_annual_rent,
      MIN(registration_date)::text AS first_date,
      MAX(registration_date)::text AS last_date,
      COUNT(DISTINCT area_id)::int AS areas_count
    FROM core.rent_transactions
    WHERE annual_amount > 0
      AND usage = 'Residential'
  `) as RentsStats[];

  const topAreas = (await sql`
    SELECT
      a.normalized_name AS area_name,
      COUNT(*)::int AS rent_count,
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY r.annual_amount)::numeric)::bigint AS median_annual_rent,
      ROUND(SUM(r.annual_amount))::bigint AS total_value
    FROM core.rent_transactions r
    JOIN core.areas a ON r.area_id = a.area_id
    WHERE r.annual_amount > 0
      AND r.usage = 'Residential'
    GROUP BY a.normalized_name
    ORDER BY rent_count DESC
    LIMIT 10
  `) as TopRentAreaRow[];

  const monthlyTrend = (await sql`
    WITH monthly AS (
      SELECT
        DATE_TRUNC('month', registration_date) AS month_ts,
        COUNT(*)::int AS rent_count,
        ROUND(SUM(annual_amount))::bigint AS total_annual_value,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY annual_amount)::numeric)::bigint AS median_annual_rent
      FROM core.rent_transactions
      WHERE annual_amount > 0
        AND usage = 'Residential'
      GROUP BY DATE_TRUNC('month', registration_date)
    )
    SELECT
      TO_CHAR(month_ts, 'YYYY-MM-DD') AS month,
      rent_count,
      total_annual_value,
      median_annual_rent
    FROM monthly
    ORDER BY month_ts
  `) as RentTrendRow[];

  return {
    stats: statsRows[0],
    top_areas: topAreas,
    monthly_trend: monthlyTrend,
    source: { name: "Dubai Land Department", dataset: "Rents" },
  };
}
// ============================================================
// Market Report — Q3 2026
// ============================================================
interface ReportStats {
  total_sales: number;
  total_volume: number;
  median_price: number;
  median_aed_sqft: number;
  first_date: string;
  last_date: string;
  areas_count: number;
}

interface ReportAreaRow {
  area_name: string;
  sale_count: number;
  median_price_aed: number;
  median_aed_sqft: number;
  total_volume: number;
}

interface ReportMonthlyRow {
  month: string;
  sale_count: number;
  volume_aed: number;
  median_price_aed: number;
}

interface ReportOffPlanRow {
  is_offplan: string;
  sale_count: number;
  median_price_aed: number;
  median_aed_sqft: number;
}

export async function getQ3Report() {
  const startDate = "2026-07-01";
  const endDate = "2026-10-01";

  const statsRows = (await sql`
    SELECT
      COUNT(*)::int AS total_sales,
      ROUND(SUM(amount))::bigint AS total_volume,
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount)::numeric)::bigint AS median_price,
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (
        ORDER BY amount / NULLIF(property_size_sqm * 10.7639104167, 0)
      )::numeric)::bigint AS median_aed_sqft,
      MIN(transaction_date)::text AS first_date,
      MAX(transaction_date)::text AS last_date,
      COUNT(DISTINCT area_id)::int AS areas_count
    FROM core.transactions
    WHERE transaction_type = 'Sales'
      AND amount > 0
      AND property_size_sqm > 0
      AND transaction_date >= ${startDate}
      AND transaction_date < ${endDate}
  `) as ReportStats[];

  const topAreas = (await sql`
    SELECT
      a.normalized_name AS area_name,
      COUNT(*)::int AS sale_count,
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY t.amount)::numeric)::bigint AS median_price_aed,
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (
        ORDER BY t.amount / NULLIF(t.property_size_sqm * 10.7639104167, 0)
      )::numeric)::bigint AS median_aed_sqft,
      ROUND(SUM(t.amount))::bigint AS total_volume
    FROM core.transactions t
    JOIN core.areas a ON t.area_id = a.area_id
    WHERE t.transaction_type = 'Sales'
      AND t.amount > 0
      AND t.property_size_sqm > 0
      AND t.transaction_date >= ${startDate}
      AND t.transaction_date < ${endDate}
    GROUP BY a.normalized_name
    ORDER BY sale_count DESC
    LIMIT 20
  `) as ReportAreaRow[];

  const monthly = (await sql`
    WITH m AS (
      SELECT
        DATE_TRUNC('month', transaction_date) AS month_ts,
        COUNT(*)::int AS sale_count,
        ROUND(SUM(amount))::bigint AS volume_aed,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount)::numeric)::bigint AS median_price_aed
      FROM core.transactions
      WHERE transaction_type = 'Sales'
        AND amount > 0
        AND transaction_date >= ${startDate}
        AND transaction_date < ${endDate}
      GROUP BY DATE_TRUNC('month', transaction_date)
    )
    SELECT
      TO_CHAR(month_ts, 'YYYY-MM-DD') AS month,
      sale_count,
      volume_aed,
      median_price_aed
    FROM m
    ORDER BY month_ts
  `) as ReportMonthlyRow[];

  const offplan = (await sql`
    SELECT
      is_offplan,
      COUNT(*)::int AS sale_count,
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount)::numeric)::bigint AS median_price_aed,
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (
        ORDER BY amount / NULLIF(property_size_sqm * 10.7639104167, 0)
      )::numeric)::bigint AS median_aed_sqft
    FROM core.transactions
    WHERE transaction_type = 'Sales'
      AND amount > 0
      AND property_size_sqm > 0
      AND is_offplan IS NOT NULL
      AND transaction_date >= ${startDate}
      AND transaction_date < ${endDate}
    GROUP BY is_offplan
    ORDER BY sale_count DESC
  `) as ReportOffPlanRow[];

  return {
    period: "Q3 2026 (July–September)",
    stats: statsRows[0],
    top_areas: topAreas,
    monthly_trend: monthly,
    offplan_split: offplan,
    source: { name: "Dubai Land Department", dataset: "Transactions" },
  };
}
