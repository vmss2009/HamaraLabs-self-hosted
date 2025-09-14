import { failure, success } from "@/lib/api/http";
import { getSchoolKeyUsers } from "@/lib/db/auth/user";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const school_id = searchParams.get("school_id");

        if (!school_id) {
            return failure("School ID is required", 400, { code: "MISSING_PARAM" });
        }

        const users = await getSchoolKeyUsers(school_id);
        return success(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return failure("Failed to fetch users", 500, {
            details: error instanceof Error ? error.message : String(error),
        });
    }
} 
