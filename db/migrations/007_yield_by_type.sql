-- ============================================================
-- Migration 007: Yield by property type (apples-to-apples)
-- Problem: Comparing villa sale vs flat rent produces wrong yields
-- Fix: Match property_sub_type between sales and rents
-- ============================================================

DROP VIEW IF EXISTS analytics.area_yield_summary;

CREATE VIEW analytics.area_yield_summary AS
WITH sales AS (
    SELECT
        t.area_id,
        t.property_sub_type,
        COUNT(*) AS sale_count,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY t.amount)::bigint AS median_sale_price
    FROM core.transactions t
    WHERE t.transaction_type = 'Sales'
      AND t.amount > 0
      AND t.property_size_sqm > 0
      AND t.property_type = 'Unit'
      AND t.usage = 'Residential'
      AND t.property_sub_type IN ('Flat', 'Villa', 'Studio', 'Penthouse')
    GROUP BY t.area_id, t.property_sub_type
),
rents AS (
    SELECT
        r.area_id,
        r.property_sub_type,
        COUNT(*) AS rent_count,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY r.annual_amount)::bigint AS median_annual_rent
    FROM core.rent_transactions r
    WHERE r.annual_amount > 0
      AND r.property_size_sqm > 0
      AND r.usage = 'Residential'
      AND r.property_sub_type IN ('Flat', 'Villa', 'Studio', 'Penthouse')
    GROUP BY r.area_id, r.property_sub_type
)
SELECT
    a.area_id,
    a.normalized_name AS area_name,
    s.property_sub_type,
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
JOIN sales s ON a.area_id = s.area_id
JOIN rents r ON a.area_id = r.area_id AND s.property_sub_type = r.property_sub_type
WHERE s.sale_count >= 5 AND r.rent_count >= 5;

COMMENT ON VIEW analytics.area_yield_summary IS
    'Residential yield matched by property type (Flat↔Flat, Villa↔Villa). Excludes commercial/industrial.';

-- ============================================================
-- Bedroom-level yield (even more precise)
-- ============================================================
DROP VIEW IF EXISTS analytics.area_yield_by_bedroom;

CREATE VIEW analytics.area_yield_by_bedroom AS
WITH sales AS (
    SELECT
        t.area_id,
        t.property_sub_type,
        t.rooms,
        COUNT(*) AS sale_count,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY t.amount)::bigint AS median_sale_price
    FROM core.transactions t
    WHERE t.transaction_type = 'Sales'
      AND t.amount > 0
      AND t.property_size_sqm > 0
      AND t.property_type = 'Unit'
      AND t.usage = 'Residential'
      AND t.property_sub_type = 'Flat'
      AND t.rooms IS NOT NULL
    GROUP BY t.area_id, t.property_sub_type, t.rooms
),
rents AS (
    SELECT
        r.area_id,
        r.property_sub_type,
        r.rooms,
        COUNT(*) AS rent_count,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY r.annual_amount)::bigint AS median_annual_rent
    FROM core.rent_transactions r
    WHERE r.annual_amount > 0
      AND r.property_size_sqm > 0
      AND r.usage = 'Residential'
      AND r.property_sub_type = 'Flat'
      AND r.rooms IS NOT NULL
    GROUP BY r.area_id, r.property_sub_type, r.rooms
)
SELECT
    a.area_id,
    a.normalized_name AS area_name,
    s.rooms,
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
        WHEN s.sale_count >= 50 AND r.rent_count >= 50 THEN 'High'
        WHEN s.sale_count >= 20 AND r.rent_count >= 20 THEN 'Medium'
        WHEN s.sale_count >= 5 AND r.rent_count >= 5 THEN 'Limited'
        ELSE 'Very Limited'
    END AS data_coverage
FROM core.areas a
JOIN sales s ON a.area_id = s.area_id
JOIN rents r ON a.area_id = r.area_id AND s.rooms = r.rooms
WHERE s.sale_count >= 5 AND r.rent_count >= 5;

COMMENT ON VIEW analytics.area_yield_by_bedroom IS
    'Bedroom-level yields for flats (Studio↔Studio, 1BR↔1BR). Most precise.';
