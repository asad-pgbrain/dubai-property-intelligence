-- ============================================================
-- Migration 008: Fix rooms format matching between sales and rents
-- Sales: "1 B/R", "Studio", "2 B/R"
-- Rents: "1.0", "3.0", "" (numeric strings)
-- Fix: Normalize both to a common format
-- ============================================================

DROP VIEW IF EXISTS analytics.area_yield_by_bedroom;

CREATE VIEW analytics.area_yield_by_bedroom AS
WITH sales_normalized AS (
    SELECT
        t.area_id,
        t.amount,
        CASE
            WHEN t.rooms = 'Studio' THEN 'Studio'
            WHEN t.rooms LIKE '%1 B/R%' THEN '1 B/R'
            WHEN t.rooms LIKE '%2 B/R%' THEN '2 B/R'
            WHEN t.rooms LIKE '%3 B/R%' THEN '3 B/R'
            WHEN t.rooms LIKE '%4 B/R%' THEN '4 B/R'
            WHEN t.rooms LIKE '%5 B/R%' THEN '5 B/R'
            ELSE NULL
        END AS room_norm
    FROM core.transactions t
    WHERE t.transaction_type = 'Sales'
      AND t.amount > 0
      AND t.property_type = 'Unit'
      AND t.usage = 'Residential'
      AND t.property_sub_type = 'Flat'
      AND t.rooms IS NOT NULL
),
rents_normalized AS (
    SELECT
        r.area_id,
        r.annual_amount,
        CASE
            WHEN r.rooms = '0' OR r.rooms = '0.0' THEN 'Studio'
            WHEN r.rooms = '1' OR r.rooms = '1.0' THEN '1 B/R'
            WHEN r.rooms = '2' OR r.rooms = '2.0' THEN '2 B/R'
            WHEN r.rooms = '3' OR r.rooms = '3.0' THEN '3 B/R'
            WHEN r.rooms = '4' OR r.rooms = '4.0' THEN '4 B/R'
            WHEN r.rooms = '5' OR r.rooms = '5.0' THEN '5 B/R'
            ELSE NULL
        END AS room_norm
    FROM core.rent_transactions r
    WHERE r.annual_amount > 0
      AND r.usage = 'Residential'
      AND r.property_sub_type = 'Flat'
      AND r.rooms IS NOT NULL
      AND r.rooms != ''
),
sales_agg AS (
    SELECT
        area_id,
        room_norm,
        COUNT(*) AS sale_count,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount)::bigint AS median_sale_price
    FROM sales_normalized
    WHERE room_norm IS NOT NULL
    GROUP BY area_id, room_norm
),
rents_agg AS (
    SELECT
        area_id,
        room_norm,
        COUNT(*) AS rent_count,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY annual_amount)::bigint AS median_annual_rent
    FROM rents_normalized
    WHERE room_norm IS NOT NULL
    GROUP BY area_id, room_norm
)
SELECT
    a.area_id,
    a.normalized_name AS area_name,
    s.room_norm AS rooms,
    s.sale_count,
    s.median_sale_price,
    r.rent_count,
    r.median_annual_rent,
    ROUND((r.median_annual_rent::numeric / s.median_sale_price) * 100, 2) AS gross_yield_pct,
    CASE
        WHEN s.sale_count >= 30 AND r.rent_count >= 30 THEN 'High'
        WHEN s.sale_count >= 10 AND r.rent_count >= 10 THEN 'Medium'
        ELSE 'Limited'
    END AS data_coverage
FROM core.areas a
JOIN sales_agg s ON a.area_id = s.area_id
JOIN rents_agg r ON a.area_id = r.area_id AND s.room_norm = r.room_norm
WHERE s.sale_count >= 5 AND r.rent_count >= 5;

COMMENT ON VIEW analytics.area_yield_by_bedroom IS
    'Bedroom-level yields for flats (Studio/1BR/2BR etc). Normalizes sales and rent room formats.';
