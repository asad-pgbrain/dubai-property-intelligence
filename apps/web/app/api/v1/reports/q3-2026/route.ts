import { NextResponse } from "next/server";
import { getQ3Report } from "@/lib/queries";
import { safeError, rateLimited } from "@/lib/errors";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Strict rate limit — 4 heavy percentile queries
  const { success } = await checkRateLimit(request, "strict");
  if (!success) return rateLimited(60);

  try {
    const data = await getQ3Report();
    return NextResponse.json(data);
  } catch (e) {
    return safeError(e, "reports/q3-2026");
  }
}
