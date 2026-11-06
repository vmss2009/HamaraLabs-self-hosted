import { failure, success } from "@/lib/api/http";
import { getStatesByCountry } from "@/lib/db/location/crud";
import { requireApiAccess } from "@/lib/authz/guard";

export async function GET(request: Request) {
  const denied = await requireApiAccess(request);
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const countryId = searchParams.get("countryId");

    if (!countryId) {
      return failure("Country ID is required", 400, { code: "MISSING_PARAM" });
    }

    const states = await getStatesByCountry(parseInt(countryId));
    
    return success(states);
  } catch (error) {
    console.error("Error fetching states:", error);
    return failure("Failed to fetch states", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
} 
