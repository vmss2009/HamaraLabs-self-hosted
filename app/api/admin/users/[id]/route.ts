import { NextRequest } from "next/server";
import { failure, success } from "@/lib/api/http";
import { updateUser, deleteUser } from "@/lib/db/auth/user";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "../../_auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminId = await requireAdmin();
  if (!adminId) return failure("Forbidden", 403);

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      first_name: true,
      last_name: true,
      roles: true,
      user_meta_data: true,
      created_at: true,
      schools: true,
    },
  });
  if (!user) return failure("User not found", 404);
  return success(user);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!await requireAdmin()) return failure("Forbidden", 403);

  const { id } = await params;
  const body = await request.json();
  const { first_name, last_name, email } = body;

  try {
    const user = await updateUser(id, {
      ...(email ? { email: email.trim().toLowerCase() } : {}),
      ...(first_name !== undefined ? { first_name: first_name?.trim() || undefined } : {}),
      ...(last_name !== undefined ? { last_name: last_name?.trim() || undefined } : {}),
    });
    return success(user);
  } catch (e) {
    return failure(e instanceof Error ? e.message : "Failed to update user", 400);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminId = await requireAdmin();
  if (!adminId) return failure("Forbidden", 403);

  const { id } = await params;
  if (id === adminId) return failure("Cannot delete your own account", 400);

  try {
    await deleteUser(id);
    return success({ deleted: true });
  } catch (e) {
    return failure(e instanceof Error ? e.message : "Failed to delete user", 400);
  }
}
