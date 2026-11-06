import { NextRequest } from "next/server";
import { failure, success } from "@/lib/api/http";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "../../_auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!await requireAdmin()) return failure("Forbidden", 403);

  const { id } = await params;
  const role = await prisma.role.findUnique({
    where: { id },
    include: {
      role_permissions: {
        include: { permission: true },
        orderBy: { permission: { subject: "asc" } },
      },
    },
  });

  if (!role) return failure("Role not found", 404);
  return success({
    id: role.id,
    name: role.name,
    description: role.description,
    is_system: role.is_system,
    assigned_permission_ids: role.role_permissions.map((rp) => rp.permission_id),
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!await requireAdmin()) return failure("Forbidden", 403);

  const { id } = await params;
  const { name, description } = await request.json();

  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) return failure("Role not found", 404);

  try {
    const updated = await prisma.role.update({
      where: { id },
      data: {
        ...(name && !role.is_system ? { name: name.trim() } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
      },
    });
    return success(updated);
  } catch (e) {
    return failure(e instanceof Error ? e.message : "Failed to update role", 400);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!await requireAdmin()) return failure("Forbidden", 403);

  const { id } = await params;
  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) return failure("Role not found", 404);
  if (role.is_system) return failure("Cannot delete system roles", 400);

  await prisma.role.delete({ where: { id } });
  return success({ deleted: true });
}
