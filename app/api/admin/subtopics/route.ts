import { failure, success } from "@/lib/api/http";
import { createSubtopic } from "@/lib/db/tinkering-activity/crud";
import { requireAdmin } from "../_auth";

export async function POST(request: Request) {
  if (!await requireAdmin()) return failure("Forbidden", 403);
  const { subtopic_name, topic_id } = await request.json();
  if (!subtopic_name?.trim()) return failure("subtopic_name is required", 400);
  if (!topic_id) return failure("topic_id is required", 400);
  try {
    const subtopic = await createSubtopic({ subtopic_name: subtopic_name.trim(), topicId: topic_id });
    return success(subtopic, 201);
  } catch (e) {
    return failure(e instanceof Error ? e.message : "Failed to create subtopic", 400);
  }
}
