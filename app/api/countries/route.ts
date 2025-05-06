import { NextResponse } from "next/server";
import { getCountries } from "@/lib/db/location/crud";

export async function GET() {
  try {
    // const countries = await getCountries();
    
    const countries = [
      { id: 1, country_name: "China" },
      { id: 2, country_name: "United States" },
      { id: 3, country_name: "Canada" },
      { id: 4, country_name: "United Kingdom" },
      { id: 5, country_name: "Australia" },
      { id: 6, country_name: "India" },
    ];

    return NextResponse.json(countries);
  } catch (error) {
    console.error("Error fetching countries:", error);
    return NextResponse.json(
      { error: "Failed to fetch countries" },
      { status: 500 }
    );
  }
} 