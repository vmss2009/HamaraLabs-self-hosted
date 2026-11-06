import { failure, success } from "@/lib/api/http";
import { getCitiesByState } from "@/lib/db/location/crud";
import { requireApiAccess } from "@/lib/authz/guard";

export async function GET(request: Request) {
  const denied = await requireApiAccess(request);
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const stateId = searchParams.get("stateId");

    if (!stateId) {
      return failure("State ID is required", 400, { code: "MISSING_PARAM" });
    }

    const cities = await getCitiesByState(parseInt(stateId));
    
    return success(cities);
  } catch (error) {
    console.error("Error fetching cities:", error);
    return failure("Failed to fetch cities", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
} 
