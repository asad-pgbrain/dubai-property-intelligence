import { NextRequest, NextResponse } from "next/server";
import { getAreaDetail } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ area_name: string }> }
) {
  const { area_name } = await params;

  try {
    const data = await getAreaDetail(decodeURIComponent(area_name));
    if (data.data.length === 0) {
      return NextResponse.json(
        { detail: `Area not found: ${area_name}` },
        { status: 404 }
      );
    }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { detail: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
