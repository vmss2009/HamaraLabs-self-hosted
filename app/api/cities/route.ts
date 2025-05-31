import { NextResponse } from "next/server";
import { getCitiesByState } from "@/lib/db/location/crud";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stateId = searchParams.get("stateId");

    if (!stateId) {
      return NextResponse.json(
        { error: "State ID is required" },
        { status: 400 },
      );
    }

    const cities = await getCitiesByState(parseInt(stateId));

    return NextResponse.json(cities);
  } catch (error) {
    console.error("Error fetching cities:", error);
    return NextResponse.json(
      { error: "Failed to fetch cities" },
      { status: 500 },
    );
  }
}
