-- ============================================================
-- Migration 004: Fix input normalization
-- Bug: Trailing spaces and case issues in get_market_comps
-- Fix: TRIM + UPPER/LOWER on inputs and DB columns
-- ============================================================

DROP FUNCTION IF EXISTS analytics.get_market_comps(TEXT, TEXT, TEXT, NUMERIC, NUMERIC, INT);

CREATE OR REPLACE FUNCTION analytics.get_market_comps(
    p_area_name TEXT,
    p_property_type TEXT DEFAULT NULL,
    p_rooms TEXT DEFAULT NULL,
    p_size_sqm NUMERIC DEFAULT NULL,
    p_size_tolerance_pct NUMERIC DEFAULT 20,
    p_min_comps INT DEFAULT 5
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
DECLARE
    v_count BIGINT;
    v_area TEXT := UPPER(TRIM(p_area_name));
    v_type TEXT := LOWER(TRIM(p_property_type));
    v_rooms TEXT := UPPER(TRIM(p_rooms));
BEGIN
    -- =========================================================
    -- TIER 1: Same area + type + rooms + similar size
    -- =========================================================
    IF p_size_sqm IS NOT NULL THEN
        SELECT COUNT(*) INTO v_count
        FROM core.transactions t
        JOIN core.areas a ON t.area_id = a.area_id
        WHERE UPPER(TRIM(a.normalized_name)) = v_area
          AND t.transaction_type = 'Sales'
          AND t.amount > 0
          AND t.property_size_sqm > 0
          AND (v_type IS NULL OR LOWER(TRIM(t.property_type)) = v_type)
          AND (v_rooms IS NULL OR UPPER(TRIM(t.rooms)) = v_rooms)
          AND t.property_size_sqm BETWEEN
              p_size_sqm * (1 - p_size_tolerance_pct/100)
              AND p_size_sqm * (1 + p_size_tolerance_pct/100);

        IF v_count >= p_min_comps THEN
            RETURN QUERY
            SELECT
                1,
                COUNT(*),
                PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY t.amount)::numeric,
                PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY t.amount)::numeric,
                PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY t.amount)::numeric,
                PERCENTILE_CONT(0.5) WITHIN GROUP (
                    ORDER BY t.amount / (t.property_size_sqm * 10.7639104167)
                )::numeric,
                MIN(t.property_size_sqm),
                MAX(t.property_size_sqm),
                MIN(t.transaction_date),
                MAX(t.transaction_date)
            FROM core.transactions t
            JOIN core.areas a ON t.area_id = a.area_id
            WHERE UPPER(TRIM(a.normalized_name)) = v_area
              AND t.transaction_type = 'Sales'
              AND t.amount > 0
              AND t.property_size_sqm > 0
              AND (v_type IS NULL OR LOWER(TRIM(t.property_type)) = v_type)
              AND (v_rooms IS NULL OR UPPER(TRIM(t.rooms)) = v_rooms)
              AND t.property_size_sqm BETWEEN
                  p_size_sqm * (1 - p_size_tolerance_pct/100)
                  AND p_size_sqm * (1 + p_size_tolerance_pct/100);
            RETURN;
        END IF;
    END IF;

    -- =========================================================
    -- TIER 2: Same area + type + rooms (any size)
    -- =========================================================
    SELECT COUNT(*) INTO v_count
    FROM core.transactions t
    JOIN core.areas a ON t.area_id = a.area_id
    WHERE UPPER(TRIM(a.normalized_name)) = v_area
      AND t.transaction_type = 'Sales'
      AND t.amount > 0
      AND (v_type IS NULL OR LOWER(TRIM(t.property_type)) = v_type)
      AND (v_rooms IS NULL OR UPPER(TRIM(t.rooms)) = v_rooms);

    IF v_count >= p_min_comps THEN
        RETURN QUERY
        SELECT
            2,
            COUNT(*),
            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY t.amount)::numeric,
            PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY t.amount)::numeric,
            PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY t.amount)::numeric,
            PERCENTILE_CONT(0.5) WITHIN GROUP (
                ORDER BY t.amount / (t.property_size_sqm * 10.7639104167)
            )::numeric,
            MIN(t.property_size_sqm),
            MAX(t.property_size_sqm),
            MIN(t.transaction_date),
            MAX(t.transaction_date)
        FROM core.transactions t
        JOIN core.areas a ON t.area_id = a.area_id
        WHERE UPPER(TRIM(a.normalized_name)) = v_area
          AND t.transaction_type = 'Sales'
          AND t.amount > 0
          AND (v_type IS NULL OR LOWER(TRIM(t.property_type)) = v_type)
          AND (v_rooms IS NULL OR UPPER(TRIM(t.rooms)) = v_rooms);
        RETURN;
    END IF;

    -- =========================================================
    -- TIER 3: Same area + type (ignore rooms)
    -- =========================================================
    SELECT COUNT(*) INTO v_count
    FROM core.transactions t
    JOIN core.areas a ON t.area_id = a.area_id
    WHERE UPPER(TRIM(a.normalized_name)) = v_area
      AND t.transaction_type = 'Sales'
      AND t.amount > 0
      AND (v_type IS NULL OR LOWER(TRIM(t.property_type)) = v_type);

    IF v_count >= p_min_comps THEN
        RETURN QUERY
        SELECT
            3,
            COUNT(*),
            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY t.amount)::numeric,
            PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY t.amount)::numeric,
            PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY t.amount)::numeric,
            PERCENTILE_CONT(0.5) WITHIN GROUP (
                ORDER BY t.amount / (t.property_size_sqm * 10.7639104167)
            )::numeric,
            MIN(t.property_size_sqm),
            MAX(t.property_size_sqm),
            MIN(t.transaction_date),
            MAX(t.transaction_date)
        FROM core.transactions t
        JOIN core.areas a ON t.area_id = a.area_id
        WHERE UPPER(TRIM(a.normalized_name)) = v_area
          AND t.transaction_type = 'Sales'
          AND t.amount > 0
          AND (v_type IS NULL OR LOWER(TRIM(t.property_type)) = v_type);
        RETURN;
    END IF;

    -- =========================================================
    -- TIER 4: Area-wide fallback
    -- =========================================================
    RETURN QUERY
    SELECT
        4,
        COUNT(*),
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY t.amount)::numeric,
        PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY t.amount)::numeric,
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY t.amount)::numeric,
        PERCENTILE_CONT(0.5) WITHIN GROUP (
            ORDER BY t.amount / (t.property_size_sqm * 10.7639104167)
        )::numeric,
        MIN(t.property_size_sqm),
        MAX(t.property_size_sqm),
        MIN(t.transaction_date),
        MAX(t.transaction_date)
    FROM core.transactions t
    JOIN core.areas a ON t.area_id = a.area_id
    WHERE UPPER(TRIM(a.normalized_name)) = v_area
      AND t.transaction_type = 'Sales'
      AND t.amount > 0;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION analytics.get_market_comps IS
    'Returns comparable market stats. Case & whitespace insensitive. Falls back tier by tier.';
