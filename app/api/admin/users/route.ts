import { failure, success } from "@/lib/api/http";
import { createUser } from "@/lib/db/auth/user";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "../_auth";

export async function GET() {
  if (!await requireAdmin()) return failure("Forbidden", 403);

  const users = await prisma.user.findMany({
    orderBy: { created_at: "desc" },
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
  return success(users);
}

export async function POST(request: Request) {
  if (!await requireAdmin()) return failure("Forbidden", 403);

  const body = await request.json();
  const { email, first_name, last_name } = body;

  if (!email?.trim()) return failure("Email is required", 400);

  try {
    const user = await createUser({
      email: email.trim().toLowerCase(),
      first_name: first_name?.trim() || undefined,
      last_name: last_name?.trim() || undefined,
    });
    return success(user, 201);
  } catch (e) {
    return failure(e instanceof Error ? e.message : "Failed to create user", 400);
  }
}
