import { NextRequest, NextResponse } from "next/server";
import { searchAreas } from "@/lib/queries";
import { safeError, badRequest } from "@/lib/errors";
import { isValidSearchQuery, parseLimit } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const limit = parseLimit(searchParams.get("limit"), 20, 50);

  if (!isValidSearchQuery(q)) {
    return badRequest("Invalid search query");
  }

  try {
    const data = await searchAreas(q, limit);
    return NextResponse.json(data);
  } catch (e) {
    return safeError(e, "areas/search");
  }
}
