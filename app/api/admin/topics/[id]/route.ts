import { failure, success } from "@/lib/api/http";
import { deleteTopic, updateTopic } from "@/lib/db/tinkering-activity/crud";
import { requireAdmin } from "../../_auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!await requireAdmin()) return failure("Forbidden", 403);
  const { id } = await params;
  const { topic_name } = await request.json();
  if (!topic_name?.trim()) return failure("topic_name is required", 400);
  try {
    const topic = await updateTopic(parseInt(id), { topic_name: topic_name.trim() });
    return success(topic);
  } catch (e) {
    return failure(e instanceof Error ? e.message : "Failed to update topic", 400);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!await requireAdmin()) return failure("Forbidden", 403);
  const { id } = await params;
  try {
    await deleteTopic(parseInt(id));
    return success({ ok: true });
  } catch (e) {
    return failure(e instanceof Error ? e.message : "Failed to delete topic", 400);
  }
}
