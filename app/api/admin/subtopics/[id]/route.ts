import { failure, success } from "@/lib/api/http";
import { deleteSubtopic, updateSubtopic } from "@/lib/db/tinkering-activity/crud";
import { requireAdmin } from "../../_auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!await requireAdmin()) return failure("Forbidden", 403);
  const { id } = await params;
  const { subtopic_name } = await request.json();
  if (!subtopic_name?.trim()) return failure("subtopic_name is required", 400);
  try {
    const subtopic = await updateSubtopic(parseInt(id), { subtopic_name: subtopic_name.trim() });
    return success(subtopic);
  } catch (e) {
    return failure(e instanceof Error ? e.message : "Failed to update subtopic", 400);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!await requireAdmin()) return failure("Forbidden", 403);
  const { id } = await params;
  try {
    await deleteSubtopic(parseInt(id));
    return success({ ok: true });
  } catch (e) {
    return failure(e instanceof Error ? e.message : "Failed to delete subtopic", 400);
  }
}
