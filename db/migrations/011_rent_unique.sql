-- Migration 011: Populate source_record_hash for rent_transactions
-- Note: We do NOT add a UNIQUE constraint on source_record_hash
-- because DLD rents data has legitimate near-duplicates 
-- (multiple identical units in same building, same date, same rent)
--
-- Idempotency is handled at ETL batch level instead:
-- ETL checks source_file_sha256 before loading; if already loaded, skips.

UPDATE core.rent_transactions
SET source_record_hash = MD5(
  COALESCE(registration_date::text, '') || '|' ||
  COALESCE(start_date::text, '') || '|' ||
  COALESCE(end_date::text, '') || '|' ||
  COALESCE(contract_amount::text, '') || '|' ||
  COALESCE(annual_amount::text, '') || '|' ||
  COALESCE(area_id::text, '') || '|' ||
  COALESCE(property_sub_type, '') || '|' ||
  COALESCE(rooms, '') || '|' ||
  COALESCE(property_size_sqm::text, '')
)
WHERE source_record_hash IS NULL;
