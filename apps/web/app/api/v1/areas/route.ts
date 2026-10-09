import { NextRequest, NextResponse } from "next/server";
import { listAreas } from "@/lib/queries";
import { safeError } from "@/lib/errors";
import { parseLimit } from "@/lib/validators";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Standard limit (100 req/min) — lighter endpoint
  const { success, remaining } = await checkRateLimit(request, "standard");
  if (!success) {
    return NextResponse.json(
      { detail: "Too many requests", code: "RATE_LIMITED" },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const limit = parseLimit(searchParams.get("limit"), 100, 500);
  const minTransactions = parseLimit(
    searchParams.get("min_transactions"),
    10,
    1000
  );

  try {
    const data = await listAreas(limit, minTransactions);
    return NextResponse.json(data, {
      headers: {
        "X-RateLimit-Remaining": String(remaining),
      },
    });
  } catch (e) {
    return safeError(e, "areas");
  }
}
