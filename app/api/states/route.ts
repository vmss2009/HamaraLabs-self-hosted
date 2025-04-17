import { NextResponse } from "next/server";
import { getStatesByCountry } from "@/lib/db/location/crud";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const countryId = searchParams.get("countryId");

    if (!countryId) {
      return NextResponse.json(
        { error: "Country ID is required" },
        { status: 400 }
      );
    }

    const states = await getStatesByCountry(parseInt(countryId));
    
    return NextResponse.json(states);
  } catch (error) {
    console.error("Error fetching states:", error);
    return NextResponse.json(
      { error: "Failed to fetch states" },
      { status: 500 }
    );
  }
} 