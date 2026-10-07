import { NextRequest, NextResponse } from "next/server";
import { realityCheck } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const area = searchParams.get("area");
  if (!area) {
    return NextResponse.json(
      { detail: "area is required" },
      { status: 400 }
    );
  }

  const property_type = searchParams.get("property_type");
  const rooms = searchParams.get("rooms");
  const size_sqm = searchParams.get("size_sqm");
  const asking_price = searchParams.get("asking_price");

  try {
    const data = await realityCheck({
      area,
      property_type: property_type || null,
      rooms: rooms || null,
      size_sqm: size_sqm ? parseFloat(size_sqm) : null,
      asking_price: asking_price ? parseFloat(asking_price) : null,
    });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { detail: e instanceof Error ? e.message : "Failed" },
      { status: 404 }
    );
  }
}
