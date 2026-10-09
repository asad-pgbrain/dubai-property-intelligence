import { NextResponse } from "next/server";
import { getRentsOverview } from "@/lib/queries";
import { safeError } from "@/lib/errors";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { success, remaining } = await checkRateLimit(request, "strict");
  if (!success) {
    return NextResponse.json(
      { detail: "Too many requests", code: "RATE_LIMITED" },
      { status: 429 }
    );
  }

  try {
    const data = await getRentsOverview();
    return NextResponse.json(data, {
      headers: {
        "X-RateLimit-Remaining": String(remaining),
      },
    });
  } catch (e) {
    return safeError(e, "rents/overview");
  }
}
