import { NextResponse } from "next/server";
import { getQ3Report } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getQ3Report();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { detail: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
