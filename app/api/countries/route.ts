import { failure, success } from "@/lib/api/http";
import { getCountries } from "@/lib/db/location/crud";

export async function GET() {
  try {
    const countries = await getCountries();

    return success(countries);
  } catch (error) {
    console.error("Error fetching countries:", error);
    return failure("Failed to fetch countries", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
