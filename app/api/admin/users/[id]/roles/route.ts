import { NextRequest } from "next/server";
import { failure, success } from "@/lib/api/http";
import { assignRoleToUser, removeRoleFromUser } from "@/lib/db/authz";
import { requireAdmin } from "../../../_auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!await requireAdmin()) return failure("Forbidden", 403);

  const { id } = await params;
  const { role } = await request.json();
  if (!role) return failure("role is required", 400);

  try {
    const updated = await assignRoleToUser(id, role);
    return success(updated);
  } catch (e) {
    return failure(e instanceof Error ? e.message : "Failed to assign role", 400);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!await requireAdmin()) return failure("Forbidden", 403);

  const { id } = await params;
  const { role } = await request.json();
  if (!role) return failure("role is required", 400);

  try {
    const updated = await removeRoleFromUser(id, role);
    return success(updated);
  } catch (e) {
    return failure(e instanceof Error ? e.message : "Failed to remove role", 400);
  }
}
