-- ============================================================
-- Migration 010: Combined areas for yield calculation
-- Problem: DLD uses different area names for sales vs rents
-- Fix: Create "logical area" mapping for yield comparison
-- ============================================================

-- Table to store combined area mappings
CREATE TABLE IF NOT EXISTS core.area_groups (
    group_id BIGSERIAL PRIMARY KEY,
    group_name TEXT NOT NULL UNIQUE,       -- e.g., "Dubai Marina"
    display_name TEXT NOT NULL,            -- e.g., "Dubai Marina"
    area_ids BIGINT[] NOT NULL,            -- [27, 53] e.g.
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE core.area_groups IS
    'Logical groupings of DLD area names that represent the same physical location';

-- Insert initial group mappings
INSERT INTO core.area_groups (group_name, display_name, area_ids, notes) VALUES
    ('Dubai Marina', 'Dubai Marina',
     ARRAY[(SELECT area_id FROM core.areas WHERE normalized_name = 'DUBAI MARINA'),
           (SELECT area_id FROM core.areas WHERE normalized_name = 'MARSA DUBAI')],
     'DLD uses both names: DUBAI MARINA (mainland) and MARSA DUBAI (waterfront luxury)'),
    ('Dubai South', 'Dubai South',
     ARRAY[(SELECT area_id FROM core.areas WHERE normalized_name = 'MADINAT AL MATAAR'),
           (SELECT area_id FROM core.areas WHERE normalized_name = 'DUBAI SOUTH')],
     'DLD main name: MADINAT AL MATAAR. DUBAI SOUTH is a sub-area.')
ON CONFLICT (group_name) DO NOTHING;

-- ============================================================
-- Combined yield view using area_groups
-- ============================================================
DROP VIEW IF EXISTS analytics.area_group_yield;

CREATE VIEW analytics.area_group_yield AS
WITH sales AS (
    SELECT
        g.group_id,
        g.display_name AS group_name,
        cs.property_sub_type,
        COUNT(*) AS sale_count,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY cs.amount)::bigint AS median_sale_price,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY cs.aed_per_sqft)::bigint AS median_aed_sqft
    FROM core.area_groups g
    JOIN analytics.clean_residential_sales cs ON cs.area_id = ANY(g.area_ids)
    GROUP BY g.group_id, g.display_name, cs.property_sub_type
),
rents AS (
    SELECT
        g.group_id,
        r.property_sub_type,
        COUNT(*) AS rent_count,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY r.annual_amount)::bigint AS median_annual_rent
    FROM core.area_groups g
    JOIN core.rent_transactions r ON r.area_id = ANY(g.area_ids)
    WHERE r.annual_amount > 0
      AND r.property_size_sqm BETWEEN 20 AND 1000
      AND r.usage = 'Residential'
      AND r.property_sub_type IN ('Flat', 'Villa', 'Studio', 'Penthouse')
    GROUP BY g.group_id, r.property_sub_type
)
SELECT
    s.group_id,
    s.group_name,
    s.property_sub_type,
    s.sale_count,
    s.median_sale_price,
    s.median_aed_sqft,
    r.rent_count,
    r.median_annual_rent,
    ROUND((r.median_annual_rent::numeric / s.median_sale_price) * 100, 2) AS gross_yield_pct,
    CASE
        WHEN s.sale_count >= 100 AND r.rent_count >= 100 THEN 'High'
        WHEN s.sale_count >= 30 AND r.rent_count >= 30 THEN 'Medium'
        WHEN s.sale_count >= 5 AND r.rent_count >= 5 THEN 'Limited'
        ELSE 'Very Limited'
    END AS data_coverage
FROM sales s
JOIN rents r ON s.group_id = r.group_id AND s.property_sub_type = r.property_sub_type
WHERE s.sale_count >= 5 AND r.rent_count >= 5;

COMMENT ON VIEW analytics.area_group_yield IS
    'Yield calculation for combined area groups (handles multi-name DLD areas)';

-- ============================================================
-- END Migration 010
-- ============================================================
