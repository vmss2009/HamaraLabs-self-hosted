import { failure, success } from "@/lib/api/http";
import { createTopic } from "@/lib/db/tinkering-activity/crud";
import { requireAdmin } from "../_auth";

export async function POST(request: Request) {
  if (!await requireAdmin()) return failure("Forbidden", 403);
  const { topic_name, subject_id } = await request.json();
  if (!topic_name?.trim()) return failure("topic_name is required", 400);
  if (!subject_id) return failure("subject_id is required", 400);
  try {
    const topic = await createTopic({ topic_name: topic_name.trim(), subjectId: subject_id });
    return success(topic, 201);
  } catch (e) {
    return failure(e instanceof Error ? e.message : "Failed to create topic", 400);
  }
}
