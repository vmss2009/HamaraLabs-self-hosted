import { failure, success } from "@/lib/api/http";
import { upsertRole } from "@/lib/db/authz";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "../_auth";

export async function GET() {
  if (!await requireAdmin()) return failure("Forbidden", 403);

  const roles = await prisma.role.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { role_permissions: true } },
    },
  });

  return success(roles.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    is_system: r.is_system,
    created_at: r.created_at,
    permission_count: r._count.role_permissions,
  })));
}

export async function POST(request: Request) {
  if (!await requireAdmin()) return failure("Forbidden", 403);

  const body = await request.json();
  const { name, description } = body;

  if (!name?.trim()) return failure("Role name is required", 400);

  try {
    const role = await upsertRole({
      name: name.trim().toLowerCase().replace(/\s+/g, "_"),
      description: description?.trim() || undefined,
      is_system: false,
    });
    return success(role, 201);
  } catch (e) {
    return failure(e instanceof Error ? e.message : "Failed to create role", 400);
  }
}
