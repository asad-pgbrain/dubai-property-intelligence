-- ============================================================
-- Migration 005: Rent Analytics Views
-- Purpose: Pre-calculated rental metrics for fast queries
-- Date: 2026-10-08
-- ============================================================

-- ============================================================
-- 1. AREA RENT MONTHLY
-- ============================================================
CREATE OR REPLACE VIEW analytics.area_rent_monthly AS
SELECT
    DATE_TRUNC('month', registration_date)::date AS month,
    r.area_id,
    a.normalized_name AS area_name,
    r.property_sub_type,
    r.rooms,
    COUNT(*) AS rent_count,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY r.annual_amount) AS median_annual_rent,
    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY r.annual_amount) AS p25_annual_rent,
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY r.annual_amount) AS p75_annual_rent,
    PERCENTILE_CONT(0.5) WITHIN GROUP (
        ORDER BY r.annual_amount / NULLIF(r.property_size_sqm, 0)
    ) AS median_rent_sqm,
    PERCENTILE_CONT(0.5) WITHIN GROUP (
        ORDER BY r.annual_amount / NULLIF(r.property_size_sqm * 10.7639104167, 0)
    ) AS median_rent_sqft
FROM core.rent_transactions r
JOIN core.areas a ON r.area_id = a.area_id
WHERE r.annual_amount > 0
GROUP BY
    DATE_TRUNC('month', registration_date)::date,
    r.area_id,
    a.normalized_name,
    r.property_sub_type,
    r.rooms;

COMMENT ON VIEW analytics.area_rent_monthly IS
    'Monthly rent statistics per area, property type, and room count';

-- ============================================================
-- 2. AREA RENT SUMMARY (All-time)
-- ============================================================
CREATE OR REPLACE VIEW analytics.area_rent_summary AS
SELECT
    r.area_id,
    a.normalized_name AS area_name,
    r.property_sub_type,
    r.rooms,
    COUNT(*) AS rent_count,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY r.annual_amount)::numeric(12,2) AS median_annual_rent,
    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY r.annual_amount)::numeric(12,2) AS p25_annual_rent,
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY r.annual_amount)::numeric(12,2) AS p75_annual_rent,
    PERCENTILE_CONT(0.5) WITHIN GROUP (
        ORDER BY r.annual_amount / NULLIF(r.property_size_sqm * 10.7639104167, 0)
    )::numeric(10,2) AS median_rent_sqft,
    MIN(r.registration_date) AS first_date,
    MAX(r.registration_date) AS last_date
FROM core.rent_transactions r
JOIN core.areas a ON r.area_id = a.area_id
WHERE r.annual_amount > 0
GROUP BY r.area_id, a.normalized_name, r.property_sub_type, r.rooms;

COMMENT ON VIEW analytics.area_rent_summary IS
    'All-time rent summary per area + property type + rooms';

-- ============================================================
-- 3. AREA MARKET SUMMARY WITH YIELD (Enhanced)
-- Combines sales + rent data to calculate gross yield
-- ============================================================
CREATE OR REPLACE VIEW analytics.area_full_summary AS
WITH sales AS (
    SELECT
        t.area_id,
        a.normalized_name AS area_name,
        t.property_type,
        COUNT(*) AS sale_count,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY t.amount)::bigint AS median_sale_price,
        PERCENTILE_CONT(0.5) WITHIN GROUP (
            ORDER BY t.amount / NULLIF(t.property_size_sqm * 10.7639104167, 0)
        )::bigint AS median_sale_sqft,
        MIN(t.transaction_date) AS first_sale_date,
        MAX(t.transaction_date) AS last_sale_date
    FROM core.transactions t
    JOIN core.areas a ON t.area_id = a.area_id
    WHERE t.transaction_type = 'Sales'
      AND t.amount > 0
      AND t.property_size_sqm > 0
    GROUP BY t.area_id, a.normalized_name, t.property_type
),
rents AS (
    SELECT
        r.area_id,
        COUNT(*) AS rent_count,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY r.annual_amount)::bigint AS median_annual_rent,
        PERCENTILE_CONT(0.5) WITHIN GROUP (
            ORDER BY r.annual_amount / NULLIF(r.property_size_sqm * 10.7639104167, 0)
        )::bigint AS median_rent_sqft,
        MIN(r.registration_date) AS first_rent_date,
        MAX(r.registration_date) AS last_rent_date
    FROM core.rent_transactions r
    WHERE r.annual_amount > 0
      AND r.property_size_sqm > 0
    GROUP BY r.area_id
)
SELECT
    s.area_id,
    s.area_name,
    s.property_type,
    s.sale_count,
    s.median_sale_price,
    s.median_sale_sqft,
    COALESCE(r.rent_count, 0) AS rent_count,
    r.median_annual_rent,
    r.median_rent_sqft,
    -- Gross yield = (annual rent / sale price) * 100
    CASE
        WHEN r.median_annual_rent IS NOT NULL AND s.median_sale_price > 0
        THEN ROUND((r.median_annual_rent::numeric / s.median_sale_price) * 100, 2)
        ELSE NULL
    END AS gross_yield_pct,
    s.first_sale_date,
    s.last_sale_date,
    r.first_rent_date,
    r.last_rent_date,
    CASE
        WHEN s.sale_count >= 100 AND COALESCE(r.rent_count, 0) >= 100 THEN 'High'
        WHEN s.sale_count >= 30 AND COALESCE(r.rent_count, 0) >= 30 THEN 'Medium'
        WHEN s.sale_count >= 5 THEN 'Limited'
        ELSE 'Very Limited'
    END AS data_coverage
FROM sales s
LEFT JOIN rents r ON s.area_id = r.area_id;

COMMENT ON VIEW analytics.area_full_summary IS
    'Complete area summary with sales + rent + gross yield estimate';

-- ============================================================
-- END Migration 005
-- ============================================================
