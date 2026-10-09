import { NextRequest, NextResponse } from "next/server";
import { listAreas } from "@/lib/queries";
import { safeError } from "@/lib/errors";
import { parseLimit } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseLimit(searchParams.get("limit"), 100, 500);
  const minTransactions = parseLimit(
    searchParams.get("min_transactions"),
    10,
    1000
  );

  try {
    const data = await listAreas(limit, minTransactions);
    return NextResponse.json(data);
  } catch (e) {
    return safeError(e, "areas");
  }
}
