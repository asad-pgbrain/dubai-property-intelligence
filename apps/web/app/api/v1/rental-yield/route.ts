import { NextRequest, NextResponse } from "next/server";
import { getRentalYield } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const area = searchParams.get("area");
  const propertyType = searchParams.get("property_type") || "Flat";

  if (!area) {
    return NextResponse.json(
      { detail: "area is required" },
      { status: 400 }
    );
  }

  try {
    const data = await getRentalYield(area, propertyType);
    if (!data) {
      return NextResponse.json(
        { detail: `No yield data found for: ${area} (${propertyType})` },
        { status: 404 }
      );
    }
    return NextResponse.json({
      area: data.area_name,
      property_type: data.property_sub_type,
      market: {
        median_sale_price: Number(data.median_sale_price),
        median_aed_sqft: Number(data.median_aed_sqft),
        median_annual_rent: Number(data.median_annual_rent),
        gross_yield_pct: Number(data.gross_yield_pct),
        sale_count: data.sale_count,
        rent_count: data.rent_count,
        data_coverage: data.data_coverage,
      },
      source: {
        name: "Dubai Land Department",
        dataset: "Transactions + Rents",
        period: "Jan–Oct 2026",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { detail: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
