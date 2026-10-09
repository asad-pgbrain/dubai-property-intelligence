// ============================================================
// Shared TypeScript Types
// ============================================================

// ---------- Area ----------
export interface AreaSummary {
  area_name: string;
  total_transactions: number;
  median_price_aed: number | null;
  median_aed_sqft: number | null;
  last_transaction: string | null;
}

export interface AreaDetailRow {
  area_name: string;
  property_type: string;
  transaction_count: number;
  median_price_aed: number | null;
  median_aed_sqft: number | null;
  p25_price_aed: number | null;
  p75_price_aed: number | null;
  data_coverage: string;
  first_transaction: string | null;
  last_transaction: string | null;
}

// ---------- Market ----------
export interface MarketStats {
  total_transactions: number;
  total_volume_aed: number;
  median_price_aed: number;
  first_date: string;
  last_date: string;
  areas_count: number;
}

export interface MonthlyTrendRow {
  month: string;
  transaction_count: number;
  volume_aed: number;
  median_price_aed: number;
}

export interface TopAreaRow {
  area_name: string;
  transaction_count: number;
  median_price_aed: number;
  volume_aed: number;
}

// ---------- Rents ----------
export interface RentTrendRow {
  month: string;
  rent_count: number;
  total_annual_value: number;
  median_annual_rent: number;
}

export interface AreaRentRow {
  area_name: string;
  property_sub_type: string;
  rent_count: number;
  median_annual_rent: number;
  p25_annual_rent: number;
  p75_annual_rent: number;
  median_rent_sqft: number;
}

// ---------- Yield ----------
export interface YieldData {
  area_name: string;
  property_sub_type: string;
  sale_count: number;
  median_sale_price: number;
  median_aed_sqft: number;
  rent_count: number;
  median_annual_rent: number;
  gross_yield_pct: number;
  data_coverage: string;
}

// ---------- Compare ----------
export interface CompareAreaRow {
  area_name: string;
  property_type: string;
  transaction_count: number;
  median_price_aed: number | null;
  median_aed_sqft: number | null;
  p25_price_aed: number | null;
  p75_price_aed: number | null;
  data_coverage: string;
  first_transaction: string | null;
  last_transaction: string | null;
  rent_count: number | null;
  median_annual_rent: number | null;
  gross_yield_pct: number | null;
}

// ---------- Reality Check ----------
export interface RealityCheckResponse {
  input: {
    area: string;
    property_type?: string | null;
    rooms?: string | null;
    size_sqm?: number | null;
    asking_price?: number | null;
  };
  market: {
    tier: number;
    comp_count: number;
    median_price_aed: number | null;
    p25_price_aed: number | null;
    p75_price_aed: number | null;
    median_aed_sqft: number | null;
    min_size_sqm: number | null;
    max_size_sqm: number | null;
    first_date: string | null;
    last_date: string | null;
  };
  coverage: "High" | "Medium" | "Limited";
  tier_explanation: string;
  comparison?: {
    asking_price: number;
    market_median: number;
    diff_pct: number;
    diff_aed: number;
  };
  source: { name: string; dataset: string };
}

// ---------- Common ----------
export interface DataSource {
  name: string;
  dataset: string;
  period?: string;
}
