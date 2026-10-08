-- ============================================================
-- Migration 006: Fix yield calculation + add Marsa Dubai alias
-- Purpose: Exclude commercial/industrial/labor camps from yield
-- Date: 2026-10-08
-- ============================================================

-- ============================================================
-- 1. RESIDENTIAL-ONLY RENT VIEW
-- ============================================================
CREATE OR REPLACE VIEW analytics.area_rent_residential AS
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
  AND r.usage = 'Residential'
  AND r.property_sub_type IN ('Flat', 'Villa', 'Studio', 'Penthouse', 'Hotel Apartment', 'Residential')
GROUP BY r.area_id, a.normalized_name, r.property_sub_type, r.rooms;

COMMENT ON VIEW analytics.area_rent_residential IS
    'Residential-only rent summary (excludes commercial, industrial, labor camps)';

-- ============================================================
-- 2. FIXED YIELD VIEW (Residential only)
-- ============================================================
CREATE OR REPLACE VIEW analytics.area_yield_summary AS
WITH sales AS (
    SELECT
        t.area_id,
        COUNT(*) AS sale_count,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY t.amount)::bigint AS median_sale_price
    FROM core.transactions t
    WHERE t.transaction_type = 'Sales'
      AND t.amount > 0
      AND t.property_size_sqm > 0
      AND t.property_type = 'Unit'
      AND t.usage = 'Residential'
      AND t.property_sub_type IN ('Flat', 'Villa', 'Studio', 'Penthouse')
    GROUP BY t.area_id
),
rents AS (
    SELECT
        r.area_id,
        COUNT(*) AS rent_count,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY r.annual_amount)::bigint AS median_annual_rent
    FROM core.rent_transactions r
    WHERE r.annual_amount > 0
      AND r.property_size_sqm > 0
      AND r.usage = 'Residential'
      AND r.property_sub_type IN ('Flat', 'Villa', 'Studio', 'Penthouse')
    GROUP BY r.area_id
)
SELECT
    a.area_id,
    a.normalized_name AS area_name,
    s.sale_count,
    s.median_sale_price,
    r.rent_count,
    r.median_annual_rent,
    CASE
        WHEN r.median_annual_rent IS NOT NULL AND s.median_sale_price > 0
        THEN ROUND((r.median_annual_rent::numeric / s.median_sale_price) * 100, 2)
        ELSE NULL
    END AS gross_yield_pct,
    CASE
        WHEN s.sale_count >= 100 AND r.rent_count >= 100 THEN 'High'
        WHEN s.sale_count >= 30 AND r.rent_count >= 30 THEN 'Medium'
        WHEN s.sale_count >= 5 THEN 'Limited'
        ELSE 'Very Limited'
    END AS data_coverage
FROM core.areas a
LEFT JOIN sales s ON a.area_id = s.area_id
LEFT JOIN rents r ON a.area_id = r.area_id
WHERE s.sale_count >= 5 AND r.rent_count >= 5;

COMMENT ON VIEW analytics.area_yield_summary IS
    'Clean residential-only rental yield per area (excludes commercial/industrial/labor)';

-- ============================================================
-- END Migration 006
-- ============================================================
