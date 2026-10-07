import { NextRequest, NextResponse } from "next/server";
import { compareAreas } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const areas = searchParams.getAll("areas");

  if (areas.length < 2) {
    return NextResponse.json(
      { detail: "Provide at least 2 areas" },
      { status: 400 }
    );
  }
  if (areas.length > 6) {
    return NextResponse.json(
      { detail: "Maximum 6 areas at a time" },
      { status: 400 }
    );
  }

  try {
    const data = await compareAreas(areas);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { detail: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
