import { failure, success } from "@/lib/api/http";
import { NextRequest } from "next/server";
import { getSchoolUsers } from "@/lib/db/school/crud";
import { requireApiAccess } from "@/lib/authz/guard";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireApiAccess(request);
  if (denied) return denied;

  try {
    const { id } = await params;
    const users = await getSchoolUsers(id);
    return success(users);
  } catch (error) {
    console.error("Error fetching users for school:", error);
    return failure("Failed to fetch users for school", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}