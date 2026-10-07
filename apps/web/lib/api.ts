// API client for Dubai Property Intelligence backend

const API_BASE = ""; // Same origin — Next.js API routes

// ============================================================
// Reality Check
// ============================================================

export interface RealityCheckInput {
  area: string;
  property_type?: string;
  rooms?: string;
  size_sqm?: number;
  asking_price?: number;
}

export interface MarketData {
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
}

export interface RealityCheckResponse {
  input: RealityCheckInput;
  market: MarketData;
  coverage: "High" | "Medium" | "Limited";
  tier_explanation: string;
  comparison?: {
    asking_price: number;
    market_median: number;
    diff_pct: number;
    diff_aed: number;
  };
  source: {
    name: string;
    dataset: string;
  };
}

export async function realityCheck(
  input: RealityCheckInput
): Promise<RealityCheckResponse> {
  const params = new URLSearchParams();
  params.append("area", input.area);
  if (input.property_type) params.append("property_type", input.property_type);
  if (input.rooms) params.append("rooms", input.rooms);
  if (input.size_sqm) params.append("size_sqm", String(input.size_sqm));
  if (input.asking_price) params.append("asking_price", String(input.asking_price));

  const res = await fetch(`${API_BASE}/api/v1/reality-check?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

// ============================================================
// Areas
// ============================================================

export interface AreaSummary {
  area_name: string;
  total_transactions: number;
  median_price_aed: number | null;
  median_aed_sqft: number | null;
  last_transaction: string | null;
}

export interface AreasListResponse {
  data: AreaSummary[];
  count: number;
  source: {
    name: string;
    dataset: string;
  };
}

export async function listAreas(limit = 100): Promise<AreasListResponse> {
  const res = await fetch(`${API_BASE}/api/v1/areas?limit=${limit}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
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

export interface AreaDetailResponse {
  area: string;
  data: AreaDetailRow[];
  source: { name: string; dataset: string };
}

export async function getAreaDetail(areaName: string): Promise<AreaDetailResponse> {
  const res = await fetch(
    `${API_BASE}/api/v1/areas/${encodeURIComponent(areaName)}`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

// ============================================================
// Market Overview
// ============================================================

export interface MarketStats {
  total_transactions: number;
  total_volume_aed: number;
  median_price_aed: number;
  first_date: string;
  last_date: string;
  areas_count: number;
}

export interface MarketAreaRow {
  area_name: string;
  transaction_count: number;
  median_price_aed: number;
  volume_aed: number;
}

export interface MarketTrendRow {
  month: string;
  transaction_count: number;
  volume_aed: number;
  median_price_aed: number;
}

export interface MarketOverviewResponse {
  stats: MarketStats;
  top_areas: MarketAreaRow[];
  monthly_trend: MarketTrendRow[];
  source: { name: string; dataset: string };
}

export async function getMarketOverview(): Promise<MarketOverviewResponse> {
  const res = await fetch(`${API_BASE}/api/v1/market/overview`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

// ============================================================
// Compare
// ============================================================

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
}

export interface CompareResponse {
  data: CompareAreaRow[];
  missing: string[];
  count: number;
  source: { name: string; dataset: string };
}

export async function compareAreas(areas: string[]): Promise<CompareResponse> {
  const params = new URLSearchParams();
  areas.forEach((a) => params.append("areas", a));

  const res = await fetch(`${API_BASE}/api/v1/compare?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

export interface AreaSearchRow {
  area_name: string;
  total_transactions: number;
}

export async function searchAreas(q: string, limit = 20): Promise<{ data: AreaSearchRow[] }> {
  const params = new URLSearchParams({ q, limit: String(limit) });
  const res = await fetch(`${API_BASE}/api/v1/areas/search?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// ============================================================
// Area Monthly Trend
// ============================================================

export interface AreaMonthlyRow {
  month: string;
  transaction_count: number;
  volume_aed: number;
  median_price_aed: number;
}

export interface AreaMonthlyResponse {
  area: string;
  data: AreaMonthlyRow[];
  count: number;
  source: { name: string; dataset: string };
}

export async function getAreaMonthly(areaName: string): Promise<AreaMonthlyResponse> {
  const res = await fetch(
    `${API_BASE}/api/v1/areas/${encodeURIComponent(areaName)}/monthly`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

// ============================================================
// Compare Monthly
// ============================================================

export interface CompareMonthlyRow {
  area_name: string;
  month: string;
  transaction_count: number;
  median_price_aed: number;
}

export async function compareMonthly(areas: string[]): Promise<{ data: CompareMonthlyRow[] }> {
  const params = new URLSearchParams();
  areas.forEach((a) => params.append("areas", a));
  const res = await fetch(`${API_BASE}/api/v1/compare/monthly?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
