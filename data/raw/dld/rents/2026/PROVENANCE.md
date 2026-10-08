# Data Provenance - DLD Rents 2026

## Files
- **Source:** Dubai Land Department Open Data portal
- **Source URL:** https://dubailand.gov.ae/en/open-data/real-estate-data/
- **Dataset:** Rents
- **Period:** January – October 2026 (9 files, monthly chunks)
- **Downloaded:** 2026-10-08
- **Total rows:** 857,624

## Why Monthly Chunks
Full year download kept timing out with captcha expiration.
Downloaded month-by-month to avoid session timeouts.

## Files
- rents-2026-10-08.csv (January, 110,714 rows)
- rents-2026-10-08 (1).csv (February, 92,305 rows)
- rents-2026-10-08 (2).csv (March, 71,736 rows)
- rents-2026-10-08 (3).csv (April, 87,441 rows)
- rents-2026-10-08 (4).csv (May, 74,160 rows)
- rents-2026-10-08 (5).csv (June, 92,843 rows)
- rents-2026-10-08 (6).csv (July, 95,253 rows)
- rents-2026-10-08 (7).csv (August + September, 202,385 rows)
- rents-2026-10-08 (8).csv (October partial, 30,789 rows)

## Notes
- Original CSVs, unmodified
- Do not edit these files
- Processed versions go in data/processed/
- Transformations are in etl/jobs/load_rents.py
