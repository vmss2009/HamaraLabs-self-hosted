import { NextRequest } from "next/server";
import { failure, success } from "@/lib/api/http";
import { getUserPermissionState, addUserPermission, removeUserPermission } from "@/lib/db/authz";
import { requireAdmin } from "../../../_auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!await requireAdmin()) return failure("Forbidden", 403);
  const { id } = await params;
  const state = await getUserPermissionState(id);
  return success(state);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!await requireAdmin()) return failure("Forbidden", 403);
  const { id } = await params;
  const { permissionId, inverted } = await request.json();
  if (!permissionId) return failure("permissionId is required", 400);
  try {
    await addUserPermission(id, permissionId, inverted ?? false);
    return success({ added: true }, 201);
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
    await removeUserPermission(id, permissionId);
    return success({ removed: true });
  } catch (e) {
    return failure(e instanceof Error ? e.message : "Failed to remove permission", 400);
  }
}
