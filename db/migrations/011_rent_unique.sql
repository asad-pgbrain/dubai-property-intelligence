-- Populate source_record_hash for existing rows
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

ALTER TABLE core.rent_transactions
  ADD CONSTRAINT rent_transactions_record_hash_unique
  UNIQUE (source_record_hash);
