import { failure, success } from "@/lib/api/http";
import { createSubject, getSubjects } from "@/lib/db/tinkering-activity/crud";
import { requireApiAccess } from "@/lib/authz/guard";

export async function GET(request: Request) {
  const denied = await requireApiAccess(request);
  if (denied) return denied;

  try {
    const subjects = await getSubjects();
    return success(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return failure("Error fetching subjects", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function POST(request: Request) {
  const denied = await requireApiAccess(request, { action: "create", subject: "Subject" });
  if (denied) return denied;

  try {
    const data = await request.json();
    const subject = await createSubject(data);
    return success(subject);
  } catch (error) {
    console.error("Error creating subject:", error);
    return failure("Error creating subject", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
} 
