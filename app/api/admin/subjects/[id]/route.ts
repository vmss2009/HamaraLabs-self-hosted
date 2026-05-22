import { failure, success } from "@/lib/api/http";
import { deleteSubject, updateSubject } from "@/lib/db/tinkering-activity/crud";
import { requireAdmin } from "../../_auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!await requireAdmin()) return failure("Forbidden", 403);
  const { id } = await params;
  const { subject_name } = await request.json();
  if (!subject_name?.trim()) return failure("subject_name is required", 400);
  try {
    const subject = await updateSubject(parseInt(id), { subject_name: subject_name.trim() });
    return success(subject);
  } catch (e) {
    return failure(e instanceof Error ? e.message : "Failed to update subject", 400);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!await requireAdmin()) return failure("Forbidden", 403);
  const { id } = await params;
  try {
    await deleteSubject(parseInt(id));
    return success({ ok: true });
  } catch (e) {
    return failure(e instanceof Error ? e.message : "Failed to delete subject", 400);
  }
}
