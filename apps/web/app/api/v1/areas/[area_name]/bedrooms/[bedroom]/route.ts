import { NextRequest, NextResponse } from "next/server";
import {
  getBedroomSalesStats,
  getBedroomRentStats,
  getBedroomMonthlyTrend,
  slugToBedroom,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ area_name: string; bedroom: string }> }
) {
  const { area_name, bedroom } = await params;

  const rooms = slugToBedroom(bedroom);
  if (!rooms) {
    return NextResponse.json(
      { detail: `Invalid bedroom: ${bedroom}` },
      { status: 400 }
    );
  }

  const areaName = decodeURIComponent(area_name);

  try {
    const [sales, rents, monthly] = await Promise.all([
      getBedroomSalesStats(areaName, rooms),
      getBedroomRentStats(areaName, rooms),
      getBedroomMonthlyTrend(areaName, rooms),
    ]);

    if (!sales || sales.sale_count === 0) {
      return NextResponse.json(
        { detail: `No data for ${areaName} ${rooms}` },
        { status: 404 }
      );
    }

    // Calculate yield
    const grossYield =
      sales.median_price && rents?.median_annual_rent
        ? Math.round((rents.median_annual_rent / sales.median_price) * 10000) / 100
        : null;

    return NextResponse.json({
      area: areaName,
      rooms,
      sales,
      rents,
      monthly,
      gross_yield_pct: grossYield,
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
