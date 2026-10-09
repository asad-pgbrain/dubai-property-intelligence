import { NextRequest, NextResponse } from "next/server";
import { realityCheck } from "@/lib/queries";
import { safeError, badRequest } from "@/lib/errors";
import {
  isValidAreaName,
  isValidPropertyType,
  isValidRooms,
  isValidSizeSqm,
  isValidAskingPrice,
} from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const area = searchParams.get("area");
  const property_type = searchParams.get("property_type");
  const rooms = searchParams.get("rooms");
  const size_sqm = searchParams.get("size_sqm");
  const asking_price = searchParams.get("asking_price");

  if (!area || !isValidAreaName(area)) {
    return badRequest("Invalid or missing area name");
  }
  if (!isValidPropertyType(property_type)) {
    return badRequest("Invalid property type");
  }
  if (!isValidRooms(rooms)) {
    return badRequest("Invalid rooms value");
  }
  if (size_sqm && !isValidSizeSqm(size_sqm)) {
    return badRequest("Size must be between 10 and 2000 sqm");
  }
  if (asking_price && !isValidAskingPrice(asking_price)) {
    return badRequest("Asking price must be between AED 10,000 and 500,000,000");
  }

  try {
    const data = await realityCheck({
      area,
      property_type: property_type || null,
      rooms: rooms || null,
      size_sqm: size_sqm ? parseFloat(size_sqm) : null,
      asking_price: asking_price ? parseFloat(asking_price) : null,
    });
    return NextResponse.json(data);
  } catch (e) {
    if (e instanceof Error && e.message.includes("No market data")) {
      return NextResponse.json(
        { detail: "No market data found for this property", code: "NOT_FOUND" },
        { status: 404 }
      );
    }
    return safeError(e, "reality-check");
  }
}
