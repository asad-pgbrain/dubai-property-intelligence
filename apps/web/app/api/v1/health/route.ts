import { NextResponse } from "next/server";
import { checkHealth } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await checkHealth();
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { detail: `Database error: ${e instanceof Error ? e.message : "Unknown"}` },
      { status: 503 }
    );
  }
}
