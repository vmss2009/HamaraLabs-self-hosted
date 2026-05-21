import { NextRequest } from "next/server";
import { failure, success } from "@/lib/api/http";
import { addPermissionToRole, removePermissionFromRole } from "@/lib/db/authz";
import { requireAdmin } from "../../../_auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!await requireAdmin()) return failure("Forbidden", 403);

  const { id } = await params;
  const { permissionId } = await request.json();
  if (!permissionId) return failure("permissionId is required", 400);

  try {
    const rp = await addPermissionToRole(id, permissionId);
    return success(rp, 201);
  } catch (e) {
    return failure(e instanceof Error ? e.message : "Failed to add permission", 400);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!await requireAdmin()) return failure("Forbidden", 403);

  const { id } = await params;
  const { permissionId } = await request.json();
  if (!permissionId) return failure("permissionId is required", 400);

  try {
    await removePermissionFromRole(id, permissionId);
    return success({ removed: true });
  } catch (e) {
    return failure(e instanceof Error ? e.message : "Failed to remove permission", 400);
  }
}
