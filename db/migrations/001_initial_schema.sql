-- ============================================================
-- Migration 001: Initial Schema
-- Purpose: Create schemas, core tables, and audit tables
-- Date: 2026-10-02
-- ============================================================

-- ============================================================
-- 1. SCHEMAS
-- ============================================================

CREATE SCHEMA IF NOT EXISTS raw;
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS app;
CREATE SCHEMA IF NOT EXISTS audit;

COMMENT ON SCHEMA raw IS 'Original data as received from sources';
COMMENT ON SCHEMA core IS 'Normalized, cleaned core entities';
COMMENT ON SCHEMA analytics IS 'Pre-calculated metrics and views';
COMMENT ON SCHEMA app IS 'Application-specific tables';
COMMENT ON SCHEMA audit IS 'Data lineage, ingestion batches, audit logs';

-- ============================================================
-- 2. AUDIT SCHEMA
-- ============================================================

CREATE TABLE IF NOT EXISTS audit.ingestion_batches (
    batch_id UUID PRIMARY KEY,
    source_name TEXT NOT NULL,
    source_url TEXT,
    dataset_name TEXT NOT NULL,
    acquired_at TIMESTAMPTZ NOT NULL,
    source_file_name TEXT,
    source_file_sha256 TEXT,
    row_count INTEGER,
    status TEXT NOT NULL,
    error_message TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ingestion_batches_source ON audit.ingestion_batches(source_name, dataset_name);
CREATE INDEX IF NOT EXISTS idx_ingestion_batches_acquired ON audit.ingestion_batches(acquired_at);

COMMENT ON TABLE audit.ingestion_batches IS 'Tracks every data ingestion with provenance';

-- ============================================================
-- 3. CORE SCHEMA — Lookup Tables
-- ============================================================

-- Areas (Dubai Marina, JVC, Business Bay, etc.)
CREATE TABLE IF NOT EXISTS core.areas (
    area_id BIGSERIAL PRIMARY KEY,
    source_area_name TEXT NOT NULL,
    normalized_name TEXT NOT NULL UNIQUE,
    zone_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_areas_normalized ON core.areas(normalized_name);
CREATE INDEX IF NOT EXISTS idx_areas_source ON core.areas(source_area_name);

COMMENT ON TABLE core.areas IS 'Dubai areas/communities (from DLD AREA_EN)';

-- Developers
CREATE TABLE IF NOT EXISTS core.developers (
    developer_id BIGSERIAL PRIMARY KEY,
    source_developer_number TEXT,
    developer_name TEXT NOT NULL,
    registration_date DATE,
    license_source TEXT,
    license_type TEXT,
    legal_status TEXT,
    website TEXT,
    source_record_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE core.developers IS 'Real estate developers';

-- Projects (buildings/developments)
CREATE TABLE IF NOT EXISTS core.projects (
    project_id BIGSERIAL PRIMARY KEY,
    source_project_number TEXT,
    project_name TEXT,
    developer_id BIGINT REFERENCES core.developers(developer_id),
    area_id BIGINT REFERENCES core.areas(area_id),
    project_type TEXT,
    project_value NUMERIC(18,2),
    project_status TEXT,
    completed_percent NUMERIC(5,2),
    start_date DATE,
    end_date DATE,
    adoption_date DATE,
    inspection_date DATE,
    completion_date DATE,
    master_project TEXT,
    source_name TEXT,
    source_record_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_area ON core.projects(area_id);
CREATE INDEX IF NOT EXISTS idx_projects_developer ON core.projects(developer_id);

COMMENT ON TABLE core.projects IS 'Real estate projects (buildings, developments)';

-- ============================================================
-- 4. CORE SCHEMA — Transactions
-- ============================================================

CREATE TABLE IF NOT EXISTS core.transactions (
    transaction_id BIGSERIAL PRIMARY KEY,
    source_transaction_number TEXT NOT NULL,
    transaction_date DATE NOT NULL,
    transaction_type TEXT,               -- GROUP_EN: Sales/Mortgage/Gifts
    transaction_sub_type TEXT,           -- PROCEDURE_EN
    is_offplan TEXT,                     -- Off-Plan / Ready
    is_freehold BOOLEAN,                 -- from IS_FREE_HOLD_EN
    usage TEXT,                          -- Residential/Commercial
    area_id BIGINT REFERENCES core.areas(area_id),
    property_type TEXT,                  -- Unit/Building/Land
    property_sub_type TEXT,              -- Flat/Villa/Office
    amount NUMERIC(20,2),                -- TRANS_VALUE (AED)
    transaction_size_sqm NUMERIC(18,4),  -- PROCEDURE_AREA
    property_size_sqm NUMERIC(18,4),     -- ACTUAL_AREA
    rooms TEXT,                          -- Studio, 1 B/R, etc.
    parking TEXT,
    nearest_metro TEXT,
    nearest_mall TEXT,
    nearest_landmark TEXT,
    buyer_count INTEGER,
    seller_count INTEGER,
    master_project TEXT,
    project_id BIGINT REFERENCES core.projects(project_id),
    source_record_hash TEXT,
    ingestion_batch_id UUID REFERENCES audit.ingestion_batches(batch_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(source_transaction_number, transaction_date)
);

CREATE INDEX IF NOT EXISTS idx_transactions_date ON core.transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_area ON core.transactions(area_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON core.transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_prop_type ON core.transactions(property_type);
CREATE INDEX IF NOT EXISTS idx_transactions_batch ON core.transactions(ingestion_batch_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date_area ON core.transactions(transaction_date, area_id);

COMMENT ON TABLE core.transactions IS 'DLD registered transactions';
COMMENT ON COLUMN core.transactions.transaction_type IS 'GROUP_EN from DLD: Sales, Mortgage, Gifts';
COMMENT ON COLUMN core.transactions.amount IS 'TRANS_VALUE from DLD (AED)';
COMMENT ON COLUMN core.transactions.property_size_sqm IS 'ACTUAL_AREA from DLD (sqm)';

-- ============================================================
-- 5. RENT TRANSACTIONS (placeholder for now)
-- ============================================================

CREATE TABLE IF NOT EXISTS core.rent_transactions (
    rent_id BIGSERIAL PRIMARY KEY,
    registration_date DATE,
    start_date DATE,
    end_date DATE,
    version TEXT,
    area_id BIGINT REFERENCES core.areas(area_id),
    contract_amount NUMERIC(20,2),
    annual_amount NUMERIC(20,2),
    is_freehold BOOLEAN,
    property_size_sqm NUMERIC(18,4),
    property_type TEXT,
    property_sub_type TEXT,
    rooms TEXT,
    usage TEXT,
    nearest_metro TEXT,
    nearest_mall TEXT,
    nearest_landmark TEXT,
    parking TEXT,
    unit_count INTEGER,
    master_project TEXT,
    project_id BIGINT REFERENCES core.projects(project_id),
    source_record_hash TEXT,
    ingestion_batch_id UUID REFERENCES audit.ingestion_batches(batch_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rent_date ON core.rent_transactions(registration_date);
CREATE INDEX IF NOT EXISTS idx_rent_area ON core.rent_transactions(area_id);

COMMENT ON TABLE core.rent_transactions IS 'DLD rental registrations';

-- ============================================================
-- END Migration 001
-- ============================================================
