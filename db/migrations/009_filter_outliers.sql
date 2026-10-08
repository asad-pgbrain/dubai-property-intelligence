-- ============================================================
-- Migration 009: Filter outliers in yield calculation
-- Problem: Bulk deals & data errors skew median prices
-- Fix: Filter by price per sqft (realistic range)
-- ============================================================

DROP VIEW IF EXISTS analytics.area_yield_summary;
DROP VIEW IF EXISTS analytics.area_yield_by_bedroom;

-- Clean sales: filter by price per sqft (200-10000 AED/sqft for residential)
CREATE OR REPLACE VIEW analytics.clean_residential_sales AS
SELECT
    t.transaction_id,
    t.area_id,
    t.property_sub_type,
    t.rooms,
    t.amount,
    t.property_size_sqm,
    t.transaction_date,
    ROUND(t.amount / (t.property_size_sqm * 10.7639104167)) AS aed_per_sqft
FROM core.transactions t
WHERE t.transaction_type = 'Sales'
  AND t.amount > 0
  AND t.property_size_sqm > 0
  AND t.property_type = 'Unit'
  AND t.usage = 'Residential'
  AND t.property_sub_type IN ('Flat', 'Villa', 'Studio', 'Penthouse')
  -- Exclude bulk deals & outliers
  AND t.property_size_sqm BETWEEN 20 AND 1000
  AND (t.amount / (t.property_size_sqm * 10.7639104167)) BETWEEN 200 AND 10000
  AND t.buyer_count <= 3
  AND t.seller_count <= 3;

COMMENT ON VIEW analytics.clean_residential_sales IS
    'Residential sales with outliers removed (bulk deals, extreme prices excluded)';

-- Yield view with clean sales
CREATE OR REPLACE VIEW analytics.area_yield_summary AS
WITH sales AS (
    SELECT
        cs.area_id,
        cs.property_sub_type,
        COUNT(*) AS sale_count,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY cs.amount)::bigint AS median_sale_price,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY cs.aed_per_sqft)::bigint AS median_aed_sqft
    FROM analytics.clean_residential_sales cs
    GROUP BY cs.area_id, cs.property_sub_type
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
      AND r.property_size_sqm BETWEEN 20 AND 1000
    GROUP BY r.area_id, r.property_sub_type
)
SELECT
    a.area_id,
    a.normalized_name AS area_name,
    s.property_sub_type,
    s.sale_count,
    s.median_sale_price,
    s.median_aed_sqft,
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
    'Residential yield with outliers filtered (bulk deals excluded)';

-- ============================================================
-- END Migration 009
-- ============================================================
