import { NextResponse } from "next/server";
import { getCountries } from "@/lib/db/location/crud";

export async function GET() {
  try {
    const countries = await getCountries();
    console.log("Cindia", countries);

    return NextResponse.json(countries);
  } catch (error) {
    console.error("Error fetching countries:", error);
    return NextResponse.json(
      { error: "Failed to fetch countries" },
      { status: 500 }
    );
  }
}
