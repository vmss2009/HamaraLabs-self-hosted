import { failure, success } from "@/lib/api/http";
import { createSubject, getSubjectsWithTopicsAndSubtopics } from "@/lib/db/tinkering-activity/crud";
import { requireAdmin } from "../_auth";

export async function GET() {
  if (!await requireAdmin()) return failure("Forbidden", 403);
  const subjects = await getSubjectsWithTopicsAndSubtopics();
  return success(subjects);
}

export async function POST(request: Request) {
  if (!await requireAdmin()) return failure("Forbidden", 403);
  const { subject_name } = await request.json();
  if (!subject_name?.trim()) return failure("subject_name is required", 400);
  try {
    const subject = await createSubject({ subject_name: subject_name.trim() });
    return success(subject, 201);
  } catch (e) {
    return failure(e instanceof Error ? e.message : "Failed to create subject", 400);
  }
}
