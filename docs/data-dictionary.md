# Data Dictionary — DLD Transactions

**Source:** Dubai Land Department (DLD)
**Dataset:** Transactions
**File:** transactions-2026-10-03.csv
**Loaded:** 2026-10-03
**Rows:** 166,632

---

## Column Reference

| # | CSV Column | Type | Postgres Column | Nulls % | Notes |
|---|-----------|------|-----------------|---------|-------|
| 1 | TRANSACTION_NUMBER | str | source_transaction_number | 0% | Not unique alone — see composite key |
| 2 | INSTANCE_DATE | datetime | transaction_date | 0% | Range: 2026-01-01 to 2026-10-02 |
| 3 | GROUP_EN | str | transaction_type | 0% | Values: Sales, Mortgage, Gifts |
| 4 | PROCEDURE_EN | str | transaction_sub_type | 0% | 39 unique values — see notes |
| 5 | IS_OFFPLAN_EN | str | is_offplan | 0% | Off-Plan or Ready |
| 6 | IS_FREE_HOLD_EN | str | is_freehold | 0% | Free Hold or Non Free Hold |
| 7 | USAGE_EN | str | usage | 0% | Residential or Commercial |
| 8 | AREA_EN | str | → area_id (lookup) | 0% | e.g., DUBAI MARINA, JVC |
| 9 | PROP_TYPE_EN | str | property_type | 0% | Unit, Building, Land |
| 10 | PROP_SB_TYPE_EN | str | property_sub_type | 1.56% | Flat, Villa, Office, etc. |
| 11 | TRANS_VALUE | float | amount | 0% | In AED. Max: 10.3B (portfolio deal) |
| 12 | PROCEDURE_AREA | float | transaction_size_sqm | 0.00% | In sqm |
| 13 | ACTUAL_AREA | float | property_size_sqm | 0% | In sqm |
| 14 | ROOMS_EN | str | rooms | 14.6% | Studio, 1 B/R, etc. Null for Land/Building |
| 15 | PARKING | str | parking | 22.5% | Mostly null for Land/Building |
| 16 | NEAREST_METRO_EN | str | nearest_metro | 51.6% | Optional |
| 17 | NEAREST_MALL_EN | str | nearest_mall | 52.7% | Optional |
| 18 | NEAREST_LANDMARK_EN | str | nearest_landmark | 39.0% | Optional |
| 19 | TOTAL_BUYER | int | buyer_count | 0% | Often 0 in portfolio deals |
| 20 | TOTAL_SELLER | int | seller_count | 0% | Often 0 |
| 21 | MASTER_PROJECT_EN | str | master_project | 99.65% | Rarely populated — ignore for MVP |
| 22 | PROJECT_EN | str | → project_id (lookup) | 13.0% | Building/project name |

---

## Business Rules

### Rule 1: Uniqueness
Composite key: `(TRANSACTION_NUMBER, INSTANCE_DATE)`
Reason: Same transaction number can appear multiple times (multi-unit deals).

### Rule 2: Price Analytics
Only use transactions where `GROUP_EN = 'Sales'` for price benchmarks.
- Exclude: Mortgage (35,206), Gifts (6,747)
- Reason: Mortgages are loan registrations, Gifts are non-market transfers.

### Rule 3: Median over Mean
Real estate prices are heavily right-skewed (max AED 10.3B).
Always report median + p25 + p75, not mean.

### Rule 4: Room Nulls
`ROOMS_EN` is null for Land and Building transactions — expected behavior.
Do not impute.

### Rule 5: Size Fields
- `PROCEDURE_AREA` = registered area (legal)
- `ACTUAL_AREA` = actual measured area
- Use `ACTUAL_AREA` for AED/sqft calculations.

### Rule 6: Date Handling
`INSTANCE_DATE` includes timestamp — strip to date only for grouping.

---

## Value Dictionaries

### GROUP_EN (3 values)
- `Sales` (124,679) — Market sales ✅ use for pricing
- `Mortgage` (35,206) — Loan registrations ⚠️ separate analysis
- `Gifts` (6,747) — Family transfers ❌ exclude from market stats

### USAGE_EN (2 values)
- `Residential` (161,277)
- `Commercial` (5,355)

### PROP_TYPE_EN (3 values)
- `Unit` (132,230)
- `Building` (14,294)
- `Land` (20,108)

### IS_OFFPLAN_EN (2 values)
- `Off-Plan` (86,161)
- `Ready` (80,471)

### IS_FREE_HOLD_EN (2 values)
- `Free Hold` (158,796)
- `Non Free Hold` (7,836)

### ROOMS_EN (13 values)
Studio, 1 B/R, 2 B/R, 3 B/R, 4 B/R, 5 B/R, 6 B/R, 7 B/R, 9 B/R, Office, Shop, PENTHOUSE, Hotel

---

## Known Data Quality Issues

1. **Duplicates:** 5,071 duplicate transaction numbers — handled via composite key
2. **Outliers:** Max transaction value AED 10.3B — portfolio/development deals, not market prices
3. **Missing project info:** 13% null in PROJECT_EN — mostly Land transactions
4. **MASTER_PROJECT_EN 99.65% null:** Not usable for MVP

---

## Next Steps

- Load into `core.transactions` table
- Apply validation rules (spec Section 25)
- Build analytics views (`analytics.area_transaction_monthly`)
