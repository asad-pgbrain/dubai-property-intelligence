import { NextRequest, NextResponse } from "next/server";
import { getTopYieldAreas } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

  try {
    const data = await getTopYieldAreas(limit);
    return NextResponse.json({
      data,
      count: data.length,
      source: { name: "Dubai Land Department", dataset: "Transactions + Rents" },
    });
  } catch (e) {
    return NextResponse.json(
      { detail: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
