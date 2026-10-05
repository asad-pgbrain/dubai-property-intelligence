// API client for Dubai Property Intelligence backend

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

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

  const res = await fetch(`${API_BASE}/api/v1/reality-check?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}
