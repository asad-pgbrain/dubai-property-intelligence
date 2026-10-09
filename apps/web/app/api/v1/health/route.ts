import { NextResponse } from "next/server";
import { checkHealth } from "@/lib/queries";
import { safeError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await checkHealth();
    return NextResponse.json(result);
  } catch (e) {
    return safeError(e, "health");
  }
}
