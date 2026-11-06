import { failure, success } from "@/lib/api/http";
import { getCountries } from "@/lib/db/location/crud";
import { requireApiAccess } from "@/lib/authz/guard";

export async function GET(request: Request) {
  const denied = await requireApiAccess(request);
  if (denied) return denied;

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
