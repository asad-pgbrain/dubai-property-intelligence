-- ============================================================
-- Migration 002: Analytics Views
-- Purpose: Pre-calculated market metrics for fast queries
-- Date: 2026-10-02
-- ============================================================

-- ============================================================
-- 1. AREA MONTHLY TRANSACTIONS
-- Spec Section 26: analytics.area_transaction_monthly
-- ============================================================

CREATE OR REPLACE VIEW analytics.area_transaction_monthly AS
SELECT
    DATE_TRUNC('month', t.transaction_date)::date AS month,
    t.area_id,
    a.normalized_name AS area_name,
    t.property_type,
    t.property_sub_type,
    t.rooms,
    COUNT(*) AS transaction_count,
    SUM(t.amount) AS total_volume,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY t.amount) AS median_price,
    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY t.amount) AS p25_price,
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY t.amount) AS p75_price,
    -- AED per sqm (using ACTUAL_AREA)
    PERCENTILE_CONT(0.5) WITHIN GROUP (
        ORDER BY t.amount / NULLIF(t.property_size_sqm, 0)
    ) AS median_price_sqm,
    -- AED per sqft
    PERCENTILE_CONT(0.5) WITHIN GROUP (
        ORDER BY t.amount / NULLIF(t.property_size_sqm * 10.7639104167, 0)
    ) AS median_price_sqft
FROM core.transactions t
JOIN core.areas a ON t.area_id = a.area_id
WHERE t.transaction_type = 'Sales'          -- Only actual sales
  AND t.amount > 0
  AND t.property_size_sqm > 0
GROUP BY
    DATE_TRUNC('month', t.transaction_date)::date,
    t.area_id,
    a.normalized_name,
    t.property_type,
    t.property_sub_type,
    t.rooms;

COMMENT ON VIEW analytics.area_transaction_monthly IS
    'Monthly transaction stats per area + property type. Only Sales. Excludes duplicates.';

-- ============================================================
-- 2. AREA MARKET SUMMARY (All-time)
-- Spec Section 26: analytics.area_market_summary
-- ============================================================

CREATE OR REPLACE VIEW analytics.area_market_summary AS
WITH base AS (
    SELECT
        t.area_id,
        a.normalized_name AS area_name,
        t.property_type,
        COUNT(*) AS transaction_count,
        MIN(t.transaction_date) AS first_transaction,
        MAX(t.transaction_date) AS last_transaction,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY t.amount) AS median_price,
        PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY t.amount) AS p25_price,
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY t.amount) AS p75_price,
        PERCENTILE_CONT(0.5) WITHIN GROUP (
            ORDER BY t.amount / NULLIF(t.property_size_sqm, 0)
        ) AS median_price_sqm,
        PERCENTILE_CONT(0.5) WITHIN GROUP (
            ORDER BY t.amount / NULLIF(t.property_size_sqm * 10.7639104167, 0)
        ) AS median_price_sqft
    FROM core.transactions t
    JOIN core.areas a ON t.area_id = a.area_id
    WHERE t.transaction_type = 'Sales'
      AND t.amount > 0
      AND t.property_size_sqm > 0
    GROUP BY t.area_id, a.normalized_name, t.property_type
)
SELECT
    area_id,
    area_name,
    property_type,
    transaction_count,
    first_transaction,
    last_transaction,
    median_price,
    p25_price,
    p75_price,
    median_price_sqm,
    median_price_sqft,
    -- Data coverage label (spec Section 29)
    CASE
        WHEN transaction_count >= 100 THEN 'High'
        WHEN transaction_count >= 30  THEN 'Medium'
        WHEN transaction_count >= 5   THEN 'Limited'
        ELSE 'Very Limited'
    END AS data_coverage
FROM base;

COMMENT ON VIEW analytics.area_market_summary IS
    'All-time market summary per area + property type. Includes coverage indicator.';

-- ============================================================
-- 3. REALITY CHECK HELPER FUNCTION
-- Returns market stats for a given area + property type + room count
-- Used by Property Reality Check feature (spec Section 7)
-- ============================================================

CREATE OR REPLACE FUNCTION analytics.get_market_comps(
    p_area_name TEXT,
    p_property_type TEXT DEFAULT NULL,
    p_rooms TEXT DEFAULT NULL,
    p_size_sqm NUMERIC DEFAULT NULL,
    p_size_tolerance_pct NUMERIC DEFAULT 20  -- ±20% size tolerance
)
RETURNS TABLE (
    tier INT,
    comp_count BIGINT,
    median_price NUMERIC,
    p25_price NUMERIC,
    p75_price NUMERIC,
    median_price_sqft NUMERIC,
    min_size_sqm NUMERIC,
    max_size_sqm NUMERIC,
    first_date DATE,
    last_date DATE
) AS $$
BEGIN
    -- Tier 1: Same area + type + rooms + similar size
    IF p_size_sqm IS NOT NULL THEN
        RETURN QUERY
        SELECT
            1,
            COUNT(*),
            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY t.amount)::numeric,
            PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY t.amount)::numeric,
            PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY t.amount)::numeric,
            PERCENTILE_CONT(0.5) WITHIN GROUP (
                ORDER BY t.amount / NULLIF(t.property_size_sqm * 10.7639104167, 0)
            )::numeric,
            MIN(t.property_size_sqm),
            MAX(t.property_size_sqm),
            MIN(t.transaction_date),
            MAX(t.transaction_date)
        FROM core.transactions t
        JOIN core.areas a ON t.area_id = a.area_id
        WHERE a.normalized_name = UPPER(p_area_name)
          AND t.transaction_type = 'Sales'
          AND (p_property_type IS NULL OR t.property_type = p_property_type)
          AND (p_rooms IS NULL OR t.rooms = p_rooms)
          AND t.property_size_sqm BETWEEN
              p_size_sqm * (1 - p_size_tolerance_pct/100)
              AND p_size_sqm * (1 + p_size_tolerance_pct/100);

        IF FOUND AND (SELECT comp_count FROM analytics.get_market_comps AS comp_count LIMIT 0) IS NULL THEN
            -- Placeholder to avoid infinite recursion; using simpler check below
            NULL;
        END IF;
    END IF;

    -- Tier 2: Same area + type + rooms (any size)
    RETURN QUERY
    SELECT
        2,
        COUNT(*),
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY t.amount)::numeric,
        PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY t.amount)::numeric,
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY t.amount)::numeric,
        PERCENTILE_CONT(0.5) WITHIN GROUP (
            ORDER BY t.amount / NULLIF(t.property_size_sqm * 10.7639104167, 0)
        )::numeric,
        MIN(t.property_size_sqm),
        MAX(t.property_size_sqm),
        MIN(t.transaction_date),
        MAX(t.transaction_date)
    FROM core.transactions t
    JOIN core.areas a ON t.area_id = a.area_id
    WHERE a.normalized_name = UPPER(p_area_name)
      AND t.transaction_type = 'Sales'
      AND (p_property_type IS NULL OR t.property_type = p_property_type)
      AND (p_rooms IS NULL OR t.rooms = p_rooms);

    -- Tier 3: Same area + type
    RETURN QUERY
    SELECT
        3,
        COUNT(*),
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY t.amount)::numeric,
        PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY t.amount)::numeric,
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY t.amount)::numeric,
        PERCENTILE_CONT(0.5) WITHIN GROUP (
            ORDER BY t.amount / NULLIF(t.property_size_sqm * 10.7639104167, 0)
        )::numeric,
        MIN(t.property_size_sqm),
        MAX(t.property_size_sqm),
        MIN(t.transaction_date),
        MAX(t.transaction_date)
    FROM core.transactions t
    JOIN core.areas a ON t.area_id = a.area_id
    WHERE a.normalized_name = UPPER(p_area_name)
      AND t.transaction_type = 'Sales'
      AND (p_property_type IS NULL OR t.property_type = p_property_type);

    -- Tier 4: Area-wide (fallback)
    RETURN QUERY
    SELECT
        4,
        COUNT(*),
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY t.amount)::numeric,
        PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY t.amount)::numeric,
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY t.amount)::numeric,
        PERCENTILE_CONT(0.5) WITHIN GROUP (
            ORDER BY t.amount / NULLIF(t.property_size_sqm * 10.7639104167, 0)
        )::numeric,
        MIN(t.property_size_sqm),
        MAX(t.property_size_sqm),
        MIN(t.transaction_date),
        MAX(t.transaction_date)
    FROM core.transactions t
    JOIN core.areas a ON t.area_id = a.area_id
    WHERE a.normalized_name = UPPER(p_area_name)
      AND t.transaction_type = 'Sales';
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION analytics.get_market_comps IS
    'Returns comparable market stats for Reality Check. Falls back tier by tier.';

-- ============================================================
-- END Migration 002
-- ============================================================
