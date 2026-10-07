import { NextRequest, NextResponse } from "next/server";
import { listAreas } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 500);
  const minTransactions = parseInt(searchParams.get("min_transactions") || "10");

  try {
    const data = await listAreas(limit, minTransactions);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { detail: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
